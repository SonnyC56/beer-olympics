import * as QRCode from 'qrcode';
import { nanoid } from 'nanoid';

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
  scheme: string; // e.g., 'beer-olympics://'
  host: string; // e.g., 'join'
  params: Record<string, string>;
}

export class AuthEnhancedService {
  private static instance: AuthEnhancedService;
  
  private constructor() {}
  
  static getInstance(): AuthEnhancedService {
    if (!AuthEnhancedService.instance) {
      AuthEnhancedService.instance = new AuthEnhancedService();
    }
    return AuthEnhancedService.instance;
  }

  // Generate QR code for team invite
  async generateTeamInviteQR(invite: Omit<TeamInvite, 'id' | 'inviteCode' | 'qrCodeUrl' | 'createdAt' | 'currentUses'>): Promise<TeamInvite> {
    const inviteCode = nanoid(8); // Short code for easy typing
    const inviteId = nanoid();
    
    // Create deep link URL
    const deepLink = this.createDeepLink({
      scheme: 'beer-olympics://',
      host: 'join',
      params: {
        tournament: invite.tournamentId,
        team: invite.teamId,
        code: inviteCode,
      }
    });
    
    // Fallback web URL
    const webUrl = `${window.location.origin}/join/${invite.tournamentId}/${invite.teamId}?code=${inviteCode}`;
    
    // Generate QR code with both deep link and web fallback
    const qrData = `${deepLink}||${webUrl}`;
    const qrCodeUrl = await this.generateQRCode(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    const teamInvite: TeamInvite = {
      id: inviteId,
      inviteCode,
      qrCodeUrl,
      createdAt: new Date(),
      currentUses: 0,
      ...invite
    };
    
    // Store invite (in real app, this would be server-side)
    this.storeInvite(teamInvite);
    
    return teamInvite;
  }

  // Generate QR code data URL
  private async generateQRCode(data: string, options?: any): Promise<string> {
    try {
      // @ts-ignore - QRCode.toDataURL with options returns Promise<string>
      const result: string = await QRCode.toDataURL(data, options);
      return result;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Create deep link URL
  private createDeepLink(config: DeepLinkConfig): string {
    const params = new URLSearchParams(config.params).toString();
    return `${config.scheme}${config.host}?${params}`;
  }

  // Parse deep link or QR code data
  parseInviteData(data: string): { deepLink?: string; webUrl?: string; params?: Record<string, string> } {
    // Check if it's a combined deep link + web URL
    if (data.includes('||')) {
      const [deepLink, webUrl] = data.split('||');
      return { deepLink, webUrl };
    }
    
    // Try to parse as URL
    try {
      const url = new URL(data);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return { webUrl: data, params };
    } catch {
      // Not a valid URL, might be just an invite code
      return { params: { code: data } };
    }
  }

  // Validate invite code
  async validateInvite(inviteCode: string): Promise<TeamInvite | null> {
    const invite = this.getInviteByCode(inviteCode);
    
    if (!invite) {
      return null;
    }
    
    // Check expiration
    if (new Date() > invite.expiresAt) {
      return null;
    }
    
    // Check usage limit
    if (invite.currentUses >= invite.maxUses) {
      return null;
    }
    
    return invite;
  }

  // Use invite code
  async useInvite(inviteCode: string, userId: string): Promise<{ success: boolean; teamId?: string; tournamentId?: string; error?: string }> {
    const invite = await this.validateInvite(inviteCode);
    
    if (!invite) {
      return { success: false, error: 'Invalid or expired invite code' };
    }
    
    // Update usage count
    invite.currentUses++;
    this.updateInvite(invite);
    
    // Record usage (in real app, this would be server-side)
    this.recordInviteUsage(invite.id, userId);
    
    return {
      success: true,
      teamId: invite.teamId,
      tournamentId: invite.tournamentId
    };
  }

  // Generate shareable invite link
  generateShareableLink(invite: TeamInvite): {
    shortLink: string;
    fullLink: string;
    qrCode?: string;
  } {
    const shortLink = `${window.location.origin}/j/${invite.inviteCode}`;
    const fullLink = `${window.location.origin}/join/${invite.tournamentId}/${invite.teamId}?code=${invite.inviteCode}`;
    
    return {
      shortLink,
      fullLink,
      qrCode: invite.qrCodeUrl
    };
  }

  // Handle mobile app installation and deep linking
  async handleMobileRedirect(inviteData: any): Promise<void> {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (!isIOS && !isAndroid) {
      // Not mobile, proceed normally
      return;
    }
    
    // Try to open app with deep link
    const deepLink = this.createDeepLink({
      scheme: 'beer-olympics://',
      host: 'join',
      params: inviteData
    });
    
    // Attempt to open app
    window.location.href = deepLink;
    
    // Fallback to app store after delay
    setTimeout(() => {
      if (document.hidden) {
        // App opened successfully
        return;
      }
      
      // Redirect to app store
      if (isIOS) {
        window.location.href = 'https://apps.apple.com/app/beer-olympics/id123456789'; // Replace with actual app ID
      } else if (isAndroid) {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.beerolympics.app'; // Replace with actual package
      }
    }, 2500);
  }

  // Storage methods (would be server-side in production)
  private storeInvite(invite: TeamInvite): void {
    const invites = this.getAllInvites();
    invites.push(invite);
    localStorage.setItem('team-invites', JSON.stringify(invites));
  }

  private getAllInvites(): TeamInvite[] {
    const stored = localStorage.getItem('team-invites');
    if (!stored) return [];
    
    return JSON.parse(stored).map((invite: any) => ({
      ...invite,
      createdAt: new Date(invite.createdAt),
      expiresAt: new Date(invite.expiresAt)
    }));
  }

  private getInviteByCode(code: string): TeamInvite | null {
    const invites = this.getAllInvites();
    return invites.find(i => i.inviteCode === code) || null;
  }

  private updateInvite(invite: TeamInvite): void {
    const invites = this.getAllInvites();
    const index = invites.findIndex(i => i.id === invite.id);
    if (index !== -1) {
      invites[index] = invite;
      localStorage.setItem('team-invites', JSON.stringify(invites));
    }
  }

  private recordInviteUsage(inviteId: string, userId: string): void {
    const usages = this.getInviteUsages();
    usages.push({
      inviteId,
      userId,
      usedAt: new Date().toISOString()
    });
    localStorage.setItem('invite-usages', JSON.stringify(usages));
  }

  private getInviteUsages(): any[] {
    const stored = localStorage.getItem('invite-usages');
    return stored ? JSON.parse(stored) : [];
  }

  // Clean up expired invites
  cleanupExpiredInvites(): number {
    const invites = this.getAllInvites();
    const now = new Date();
    const activeInvites = invites.filter(i => i.expiresAt > now);
    
    const removedCount = invites.length - activeInvites.length;
    if (removedCount > 0) {
      localStorage.setItem('team-invites', JSON.stringify(activeInvites));
    }
    
    return removedCount;
  }
}

export const authEnhanced = AuthEnhancedService.getInstance();