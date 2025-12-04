import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  session: {
    secret: process.env.SESSION_SECRET!,
    cookie: {
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as any) || 'lax',
    },
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  s3: {
    provider: process.env.NODE_ENV === 'production' ? 'aws' : 'minio',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || process.env.MINIO_BUCKET || 'propertypilot',
    accessKey: process.env.AWS_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY || 'minioadmin',
    minioEndpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    awsEndpoint: process.env.AWS_S3_ENDPOINT || 'https://s3.amazonaws.com',
  },
  realEstateData: {
    provider: process.env.REAL_ESTATE_DATA_PROVIDER || 'mock',
    apiKey: process.env.REAL_ESTATE_API_KEY,
  },
  hasData: {
    apiKey: process.env.HASDATA_API_KEY,
    enabled: !!process.env.HASDATA_API_KEY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate required vars
const required = ['DATABASE_URL', 'SESSION_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`${key} is required`);
  }
}
