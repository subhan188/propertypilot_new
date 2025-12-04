import type { RegisterInput, LoginInput } from '@/models/schemas';
export declare class AuthService {
    register(input: RegisterInput): Promise<{
        email: string;
        name: string;
        currency: string;
        timezone: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    }>;
    login(input: LoginInput): Promise<{
        email: string;
        name: string;
        currency: string;
        timezone: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    getUserById(userId: string): Promise<{
        email: string;
        name: string;
        currency: string;
        timezone: string;
        id: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(userId: string, data: {
        name?: string;
        avatar?: string;
    }): Promise<{
        email: string;
        name: string;
        currency: string;
        timezone: string;
        id: string;
        avatar: string | null;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map