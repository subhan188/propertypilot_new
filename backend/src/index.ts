import { createApp } from '@/app';
import { config } from '@/utils/config';
import { prisma } from '@/db/prisma';

async function start() {
  try {
    // Test database connection
    await prisma.$executeRaw`SELECT 1`;
    console.log('✓ Database connected');

    const fastify = await createApp();

    await fastify.listen({ port: config.app.port, host: '0.0.0.0' });

    console.log(`✓ Server listening on http://0.0.0.0:${config.app.port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
