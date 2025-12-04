import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { config } from '@/utils/config';
import {
  JobType,
  RefreshPropertyCompsJobData,
  SyncAirbnbDataJobData,
  GenerateDailyAlertsJobData,
} from './types';
import { refreshPropertyCompsHandler } from './jobs/refreshPropertyComps';
import { syncAirbnbDataHandler } from './jobs/syncAirbnbData';
import { generateDailyAlertsHandler } from './jobs/generateDailyAlerts';

/**
 * Redis connection for BullMQ
 */
const redisConnection = new Redis({
  host: config.redis.host || 'localhost',
  port: config.redis.port || 6379,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
});

/**
 * Main job queue for PropertyPilot background tasks
 */
export const propertyPilotQueue = new Queue('property-pilot', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 second delay
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

/**
 * Worker to process jobs from the queue
 */
export const propertyPilotWorker = new Worker(propertyPilotQueue.name, processor, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs concurrently
});

/**
 * Main job processor - routes jobs to appropriate handlers
 */
async function processor(job: any) {
  try {
    switch (job.name) {
      case JobType.REFRESH_PROPERTY_COMPS:
        return await refreshPropertyCompsHandler(job.data as RefreshPropertyCompsJobData);

      case JobType.SYNC_AIRDNA_DATA:
        return await syncAirbnbDataHandler(job.data as SyncAirbnbDataJobData);

      case JobType.GENERATE_DAILY_ALERTS:
        return await generateDailyAlertsHandler(job.data as GenerateDailyAlertsJobData);

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  } catch (error) {
    console.error(`Job ${job.name} failed:`, error);
    throw error;
  }
}

/**
 * Setup event listeners for worker
 */
propertyPilotWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

propertyPilotWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

propertyPilotWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

/**
 * Add job to queue
 */
export async function addJob<T>(
  jobType: JobType,
  data: T,
  options?: {
    delay?: number; // Delay in milliseconds
    repeat?: {
      pattern: string; // Cron pattern (e.g., '0 0 * * *' for daily at midnight)
    };
  }
) {
  const jobOptions: any = {};

  if (options?.delay) {
    jobOptions.delay = options.delay;
  }

  if (options?.repeat) {
    jobOptions.repeat = {
      pattern: options.repeat.pattern,
    };
  }

  return await propertyPilotQueue.add(jobType, data, jobOptions);
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string) {
  return await propertyPilotQueue.getJob(jobId);
}

/**
 * Get all active jobs
 */
export async function getActiveJobs() {
  return await propertyPilotQueue.getActiveCount();
}

/**
 * Cleanup: Close connections
 */
export async function closeQueue() {
  await propertyPilotWorker.close();
  await propertyPilotQueue.close();
  await redisConnection.quit();
}
