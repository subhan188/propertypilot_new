import { Queue, Worker } from 'bullmq';
import { JobType } from './types';
/**
 * Main job queue for PropertyPilot background tasks
 */
export declare const propertyPilotQueue: Queue<any, any, string, any, any, string>;
/**
 * Worker to process jobs from the queue
 */
export declare const propertyPilotWorker: Worker<any, import("./types").JobResult, string>;
/**
 * Add job to queue
 */
export declare function addJob<T>(jobType: JobType, data: T, options?: {
    delay?: number;
    repeat?: {
        pattern: string;
    };
}): Promise<import("bullmq").Job<any, any, string>>;
/**
 * Get job by ID
 */
export declare function getJob(jobId: string): Promise<import("bullmq").Job<any, any, string> | undefined>;
/**
 * Get all active jobs
 */
export declare function getActiveJobs(): Promise<number>;
/**
 * Cleanup: Close connections
 */
export declare function closeQueue(): Promise<void>;
//# sourceMappingURL=queue.d.ts.map