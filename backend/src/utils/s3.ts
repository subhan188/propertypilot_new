import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './config';

/**
 * S3 Service for MinIO (dev) and AWS S3 (prod) compatibility
 * Handles file uploads, signed URLs, and deletion
 */
class S3Service {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor() {
    const isMinIO = config.s3.provider === 'minio';

    this.endpoint = isMinIO ? config.s3.minioEndpoint : config.s3.awsEndpoint;
    this.bucket = config.s3.bucket;

    const clientConfig: any = {
      region: config.s3.region,
    };

    // MinIO requires explicit endpoint configuration
    if (isMinIO) {
      clientConfig.endpoint = this.endpoint;
      clientConfig.credentials = {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      };
      clientConfig.forcePathStyle = true; // MinIO uses path-style URLs
    } else {
      // AWS S3 uses credentials from environment or IAM role
      clientConfig.credentials = {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      };
    }

    this.client = new S3Client(clientConfig);
  }

  /**
   * Upload a file to S3/MinIO
   * @param key - S3 object key (path)
   * @param body - File contents (Buffer or string)
   * @param mimeType - MIME type
   * @returns S3 key and signed URL
   */
  async uploadFile(
    key: string,
    body: Buffer | string,
    mimeType: string
  ): Promise<{ key: string; signedUrl: string; expiresAt: Date }> {
    try {
      // Upload to S3
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: mimeType,
        })
      );

      // Generate signed URL (valid for 7 days)
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      return { key, signedUrl, expiresAt };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Get a signed URL for an existing S3 object
   * @param key - S3 object key
   * @returns Signed URL and expiration time
   */
  async getSignedUrl(key: string): Promise<{ url: string; expiresAt: Date }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: 7 * 24 * 60 * 60, // 7 days
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      return { url, expiresAt };
    } catch (error) {
      throw new Error(`Failed to get signed URL: ${error}`);
    }
  }

  /**
   * Delete a file from S3/MinIO
   * @param key - S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Generate S3 key for a file upload
   * Format: {resource}/{resourceId}/{timestamp}-{filename}
   * @param resource - Resource type (property, renovation, etc)
   * @param resourceId - ID of the resource
   * @param originalFilename - Original filename
   * @returns S3 key
   */
  static generateKey(
    resource: string,
    resourceId: string,
    originalFilename: string
  ): string {
    const timestamp = Date.now();
    const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${resource}/${resourceId}/${timestamp}-${sanitizedFilename}`;
  }
}

export { S3Service };
export const s3Service = new S3Service();
