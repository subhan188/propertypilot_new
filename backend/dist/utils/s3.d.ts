/**
 * S3 Service for MinIO (dev) and AWS S3 (prod) compatibility
 * Handles file uploads, signed URLs, and deletion
 */
declare class S3Service {
    private client;
    private bucket;
    private endpoint;
    constructor();
    /**
     * Upload a file to S3/MinIO
     * @param key - S3 object key (path)
     * @param body - File contents (Buffer or string)
     * @param mimeType - MIME type
     * @returns S3 key and signed URL
     */
    uploadFile(key: string, body: Buffer | string, mimeType: string): Promise<{
        key: string;
        signedUrl: string;
        expiresAt: Date;
    }>;
    /**
     * Get a signed URL for an existing S3 object
     * @param key - S3 object key
     * @returns Signed URL and expiration time
     */
    getSignedUrl(key: string): Promise<{
        url: string;
        expiresAt: Date;
    }>;
    /**
     * Delete a file from S3/MinIO
     * @param key - S3 object key
     */
    deleteFile(key: string): Promise<void>;
    /**
     * Generate S3 key for a file upload
     * Format: {resource}/{resourceId}/{timestamp}-{filename}
     * @param resource - Resource type (property, renovation, etc)
     * @param resourceId - ID of the resource
     * @param originalFilename - Original filename
     * @returns S3 key
     */
    static generateKey(resource: string, resourceId: string, originalFilename: string): string;
}
export { S3Service };
export declare const s3Service: S3Service;
//# sourceMappingURL=s3.d.ts.map