export interface TeamInvite {
    id: string;
    tournamentId: string;
    teamId: string;
    inviteCode: string;
    qrCodeUrl?: string;
    createdAt: Date;
    expiresAt: Date;
    maxUses: number;
    currentUses: number;
    createdBy: string;
}
export interface DeepLinkConfig {
    scheme: string;
    host: string;
    params: Record<string, string>;
}
export declare class AuthEnhancedService {
    private static instance;
    private constructor();
    static getInstance(): AuthEnhancedService;
    generateTeamInviteQR(invite: Omit<TeamInvite, 'id' | 'inviteCode' | 'qrCodeUrl' | 'createdAt' | 'currentUses'>): Promise<TeamInvite>;
    private generateQRCode;
    private createDeepLink;
    parseInviteData(data: string): {
        deepLink?: string;
        webUrl?: string;
        params?: Record<string, string>;
    };
    validateInvite(inviteCode: string): Promise<TeamInvite | null>;
    useInvite(inviteCode: string, userId: string): Promise<{
        success: boolean;
        teamId?: string;
        tournamentId?: string;
        error?: string;
    }>;
    generateShareableLink(invite: TeamInvite): {
        shortLink: string;
        fullLink: string;
        qrCode?: string;
    };
    handleMobileRedirect(inviteData: any): Promise<void>;
    private storeInvite;
    private getAllInvites;
    private getInviteByCode;
    private updateInvite;
    private recordInviteUsage;
    private getInviteUsages;
    cleanupExpiredInvites(): number;
}
export declare const authEnhanced: AuthEnhancedService;
