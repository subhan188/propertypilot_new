/**
 * File upload service for handling property and renovation photos
 */
export declare class FileService {
    /**
     * Upload a single file
     * @param userId - User ID
     * @param propertyId - Property ID (optional)
     * @param renovationId - Renovation ID (optional)
     * @param filename - Original filename
     * @param buffer - File buffer
     * @param mimeType - MIME type
     * @returns FileUpload object with signed URL
     */
    uploadFile(userId: string, propertyId: string | undefined, renovationId: string | undefined, filename: string, buffer: Buffer, mimeType: string): Promise<{
        id: string;
        createdAt: Date;
        propertyId: string | null;
        renovationId: string | null;
        signedUrl: string | null;
        originalName: string;
        mimeType: string;
        size: number;
        s3Key: string;
        signedUrlExpiresAt: Date | null;
    }>;
    /**
     * Get files for a property
     * @param userId - User ID
     * @param propertyId - Property ID
     * @returns Array of FileUpload objects
     */
    getPropertyFiles(userId: string, propertyId: string): Promise<{
        id: string;
        createdAt: Date;
        propertyId: string | null;
        renovationId: string | null;
        signedUrl: string | null;
        originalName: string;
        mimeType: string;
        size: number;
        s3Key: string;
        signedUrlExpiresAt: Date | null;
    }[]>;
    /**
     * Get files for a renovation
     * @param userId - User ID
     * @param renovationId - Renovation ID
     * @returns Array of FileUpload objects
     */
    getRenovationFiles(userId: string, renovationId: string): Promise<{
        id: string;
        createdAt: Date;
        propertyId: string | null;
        renovationId: string | null;
        signedUrl: string | null;
        originalName: string;
        mimeType: string;
        size: number;
        s3Key: string;
        signedUrlExpiresAt: Date | null;
    }[]>;
    /**
     * Delete a file
     * @param userId - User ID
     * @param fileId - File ID
     */
    deleteFile(userId: string, fileId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Refresh signed URL for a file
     * @param userId - User ID
     * @param fileId - File ID
     * @returns Updated FileUpload with new signed URL
     */
    refreshSignedUrl(userId: string, fileId: string): Promise<{
        id: string;
        createdAt: Date;
        propertyId: string | null;
        renovationId: string | null;
        signedUrl: string | null;
        originalName: string;
        mimeType: string;
        size: number;
        s3Key: string;
        signedUrlExpiresAt: Date | null;
    }>;
}
export declare const fileService: FileService;
//# sourceMappingURL=fileService.d.ts.map