import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { propertyService } from '@/services/propertyService';
import { ValidationError } from '@/utils/errors';
import { z } from 'zod';

// Minimal property schema for quick capture from field
const quickCaptureSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zipCode: z.string().min(5),
  type: z.enum(['rent', 'airbnb', 'flip']).default('flip'),
  purchasePrice: z.number().positive(),
  // Optional fields
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  sqft: z.number().positive().optional(),
  currentValue: z.number().positive().optional(),
  arv: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

async function quickCaptureHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;

  try {
    // Validate input
    const parsed = quickCaptureSchema.parse(request.body);

    // Create property with minimal required data
    const property = await propertyService.createProperty(userId, {
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
      type: parsed.type,
      status: 'lead', // New properties start as leads
      purchasePrice: parsed.purchasePrice,
      currentValue: parsed.currentValue || parsed.purchasePrice,
      arv: parsed.arv || parsed.purchasePrice,
      sqft: parsed.sqft || 1000,
      bedrooms: parsed.bedrooms || 0,
      bathrooms: parsed.bathrooms || 0,
      yearBuilt: new Date().getFullYear(),
      lotSize: 0,
      latitude: parsed.latitude || 0,
      longitude: parsed.longitude || 0,
      notes: parsed.notes || undefined,
    } as any);

    return reply.code(201).send({
      success: true,
      data: {
        property,
        message: 'Property captured. Fill in additional details in the app.',
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce(
        (acc: Record<string, string>, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        },
        {}
      );

      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        details: formattedErrors,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to capture property',
    });
  }
}

async function quickCaptureBatchHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const userId = request.session.userId as string;
  const body = request.body as any;
  const { properties: propertyList } = body;

  try {
    if (!Array.isArray(propertyList)) {
      throw new ValidationError({
        properties: 'Array of properties is required',
      });
    }

    if (propertyList.length === 0) {
      throw new ValidationError({
        properties: 'At least one property is required',
      });
    }

    // Validate all properties first
    const validated = propertyList.map((p: any) =>
      quickCaptureSchema.parse(p)
    );

    // Create all properties
    const created = await Promise.all(
      validated.map((p) =>
        propertyService.createProperty(userId, {
          address: p.address,
          city: p.city,
          state: p.state,
          zipCode: p.zipCode,
          type: p.type,
          status: 'lead',
          purchasePrice: p.purchasePrice,
          currentValue: p.currentValue || p.purchasePrice,
          arv: p.arv || p.purchasePrice,
          sqft: p.sqft || 1000,
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          yearBuilt: new Date().getFullYear(),
          lotSize: 0,
          latitude: p.latitude || 0,
          longitude: p.longitude || 0,
          notes: p.notes || undefined,
        } as any)
      )
    );

    return reply.code(201).send({
      success: true,
      data: {
        properties: created,
        count: created.length,
        message: `${created.length} properties captured successfully`,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.reduce(
        (acc: Record<string, string>, err) => {
          const path = err.path.join('.');
          acc[path] = err.message;
          return acc;
        },
        {}
      );

      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        details: formattedErrors,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to batch capture properties',
    });
  }
}

export async function quickCaptureRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: any }>(
    '/properties/quick-capture',
    quickCaptureHandler
  );

  fastify.post<{ Body: any }>(
    '/properties/quick-capture/batch',
    quickCaptureBatchHandler
  );
}
