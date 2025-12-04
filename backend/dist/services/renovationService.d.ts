import type { RenovationItemInput } from '@/models/schemas';
export declare class RenovationService {
    getRenovations(userId: string, propertyId: string, filters?: {
        status?: string;
    }): Promise<({
        photos: {
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
        }[];
    } & {
        status: string;
        notes: string | null;
        category: string;
        description: string;
        estimatedCost: number;
        actualCost: number | null;
        contractor: string | null;
        startDate: Date | null;
        endDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        propertyId: string;
    })[]>;
    createRenovation(userId: string, propertyId: string, data: RenovationItemInput): Promise<{
        photos: {
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
        }[];
    } & {
        status: string;
        notes: string | null;
        category: string;
        description: string;
        estimatedCost: number;
        actualCost: number | null;
        contractor: string | null;
        startDate: Date | null;
        endDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        propertyId: string;
    }>;
    updateRenovation(userId: string, renovationId: string, data: Partial<RenovationItemInput>): Promise<{
        photos: {
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
        }[];
    } & {
        status: string;
        notes: string | null;
        category: string;
        description: string;
        estimatedCost: number;
        actualCost: number | null;
        contractor: string | null;
        startDate: Date | null;
        endDate: Date | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        propertyId: string;
    }>;
    deleteRenovation(userId: string, renovationId: string): Promise<{
        success: boolean;
    }>;
    getRenovationStats(userId: string, propertyId: string): Promise<{
        total: number;
        byStatus: {
            pending: number;
            in_progress: number;
            completed: number;
        };
        estimatedTotal: number;
        actualTotal: number;
        percentComplete: number;
    }>;
}
export declare const renovationService: RenovationService;
//# sourceMappingURL=renovationService.d.ts.map