import type { User } from '../types';
export interface AuthSession {
    user: User;
    token: string;
    expiresAt: number;
}
export declare function generateAuthUrl(): Promise<string>;
export declare function verifyGoogleToken(code: string): Promise<User>;
export declare function generateJWT(user: User): string;
export declare function verifyJWT(token: string): User | null;
export declare function parseAuthCookie(cookieString: string | undefined): string | null;
