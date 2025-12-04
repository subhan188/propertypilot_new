import { FastifyRequest } from 'fastify';

declare module '@fastify/session' {
  interface FastifySessionObject {
    userId?: string;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: () => void;
  }
  interface FastifyRequest {
    userId?: string;
  }
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
