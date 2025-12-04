/**
 * Reports API Routes
 * Generate and export portfolio and property reports
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { reportService } from '@/services/reportService';

async function getPortfolioReport(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.session.userId as string;

  try {
    const report = await reportService.generatePortfolioReport(userId);

    return reply.send({
      success: true,
      data: report,
    });
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to generate portfolio report',
    });
  }
}

async function getPropertyReport(
  request: FastifyRequest<{ Params: { propertyId: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { propertyId } = request.params;

  try {
    const report = await reportService.generatePropertyReport(userId, propertyId);

    return reply.send({
      success: true,
      data: report,
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to generate property report',
    });
  }
}

async function exportPortfolioReport(
  request: FastifyRequest<{ Querystring: { format: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { format = 'json' } = request.query;

  try {
    const report = await reportService.generatePortfolioReport(userId);

    if (format === 'csv') {
      const csv = reportService.convertToCSV(report);
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="portfolio-report.csv"');
      return reply.send(csv);
    } else if (format === 'json') {
      const json = reportService.convertToJSON(report);
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', 'attachment; filename="portfolio-report.json"');
      return reply.send(json);
    } else {
      return reply.code(400).send({
        success: false,
        error: 'Unsupported format. Use "json" or "csv"',
      });
    }
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to export portfolio report',
    });
  }
}

async function exportPropertyReport(
  request: FastifyRequest<{
    Params: { propertyId: string };
    Querystring: { format: string };
  }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const { propertyId } = request.params;
  const { format = 'json' } = request.query;

  try {
    const report = await reportService.generatePropertyReport(userId, propertyId);

    if (format === 'csv') {
      const csv = reportService.convertToCSV(report);
      reply.header('Content-Type', 'text/csv');
      reply.header(
        'Content-Disposition',
        `attachment; filename="property-${propertyId}-report.csv"`
      );
      return reply.send(csv);
    } else if (format === 'json') {
      const json = reportService.convertToJSON(report);
      reply.header('Content-Type', 'application/json');
      reply.header(
        'Content-Disposition',
        `attachment; filename="property-${propertyId}-report.json"`
      );
      return reply.send(json);
    } else {
      return reply.code(400).send({
        success: false,
        error: 'Unsupported format. Use "json" or "csv"',
      });
    }
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to export property report',
    });
  }
}

export async function reportRoutes(fastify: FastifyInstance) {
  fastify.get('/api/reports/portfolio', getPortfolioReport);

  fastify.get<{ Params: { propertyId: string } }>(
    '/api/reports/property/:propertyId',
    getPropertyReport
  );

  fastify.get<{ Querystring: { format: string } }>(
    '/api/reports/portfolio/export',
    exportPortfolioReport
  );

  fastify.get<{ Params: { propertyId: string }; Querystring: { format: string } }>(
    '/api/reports/property/:propertyId/export',
    exportPropertyReport
  );
}
