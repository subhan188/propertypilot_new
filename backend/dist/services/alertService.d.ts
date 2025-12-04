export interface CreateAlertInput {
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    propertyId?: string;
}
export declare class AlertService {
    getAlerts(userId: string, filters?: {
        read?: boolean;
        type?: string;
        limit?: number;
    }): Promise<{
        alerts: {
            message: string;
            type: string;
            id: string;
            createdAt: Date;
            userId: string;
            propertyId: string | null;
            read: boolean;
            title: string;
        }[];
        unreadCount: number;
    }>;
    markAsRead(userId: string, alertId: string): Promise<{
        message: string;
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        propertyId: string | null;
        read: boolean;
        title: string;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    deleteAlert(userId: string, alertId: string): Promise<{
        success: boolean;
    }>;
    createAlert(userId: string, data: CreateAlertInput): Promise<{
        message: string;
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
        propertyId: string | null;
        read: boolean;
        title: string;
    }>;
    getAlertStats(userId: string): Promise<{
        total: number;
        unread: number;
        byType: Record<string, number>;
    }>;
}
export declare const alertService: AlertService;
//# sourceMappingURL=alertService.d.ts.map