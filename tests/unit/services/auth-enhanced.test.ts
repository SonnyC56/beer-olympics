import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthEnhancedService } from '../../../src/services/auth-enhanced';

// Mock QRCode module
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqrcode'),
}));

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn().mockReturnValue('mock-id'),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthEnhancedService', () => {
  let authService: AuthEnhancedService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://test.com',
        href: 'https://test.com',
      },
      writable: true,
    });

    authService = AuthEnhancedService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateTeamInviteQR', () => {
    it('should generate a team invite with QR code', async () => {
      const mockInvite = {
        tournamentId: 'tournament-1',
        teamId: 'team-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        maxUses: 10,
        createdBy: 'user-1',
      };

      const result = await authService.generateTeamInviteQR(mockInvite);

      expect(result).toMatchObject({
        id: 'mock-id',
        inviteCode: 'mock-id',
        qrCodeUrl: 'data:image/png;base64,mockqrcode',
        currentUses: 0,
        ...mockInvite,
      });

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'team-invites',
        expect.stringContaining(result.id)
      );
    });

    it('should create deep link with correct parameters', async () => {
      const mockInvite = {
        tournamentId: 'tournament-1',
        teamId: 'team-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxUses: 10,
        createdBy: 'user-1',
      };

      await authService.generateTeamInviteQR(mockInvite);

      // Verify QR code generation was called with deep link + web URL
      const QRCode = await import('qrcode');
      expect(QRCode.default.toDataURL).toHaveBeenCalledWith(
        expect.stringContaining('beer-olympics://join?tournament=tournament-1&team=team-1&code=mock-id||https://test.com/join/tournament-1/team-1?code=mock-id'),
        expect.any(Object)
      );
    });
  });

  describe('validateInvite', () => {
    beforeEach(() => {
      // Mock stored invites
      const mockInvites = [
        {
          id: 'invite-1',
          inviteCode: 'valid-code',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          maxUses: 10,
          currentUses: 5,
        },
        {
          id: 'invite-2',
          inviteCode: 'expired-code',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          maxUses: 10,
          currentUses: 5,
        },
        {
          id: 'invite-3',
          inviteCode: 'used-up-code',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          maxUses: 5,
          currentUses: 5,
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockInvites));
    });

    it('should return valid invite for valid code', async () => {
      const result = await authService.validateInvite('valid-code');
      
      expect(result).toMatchObject({
        id: 'invite-1',
        inviteCode: 'valid-code',
        currentUses: 5,
        maxUses: 10,
      });
    });

    it('should return null for expired invite', async () => {
      const result = await authService.validateInvite('expired-code');
      expect(result).toBeNull();
    });

    it('should return null for used up invite', async () => {
      const result = await authService.validateInvite('used-up-code');
      expect(result).toBeNull();
    });

    it('should return null for non-existent invite', async () => {
      const result = await authService.validateInvite('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('useInvite', () => {
    beforeEach(() => {
      const mockInvites = [
        {
          id: 'invite-1',
          inviteCode: 'valid-code',
          tournamentId: 'tournament-1',
          teamId: 'team-1',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          maxUses: 10,
          currentUses: 5,
        },
      ];

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'team-invites') {
          return JSON.stringify(mockInvites);
        }
        if (key === 'invite-usages') {
          return JSON.stringify([]);
        }
        return null;
      });
    });

    it('should successfully use valid invite', async () => {
      const result = await authService.useInvite('valid-code', 'user-1');
      
      expect(result).toEqual({
        success: true,
        teamId: 'team-1',
        tournamentId: 'tournament-1',
      });

      // Check that usage was recorded
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'invite-usages',
        expect.stringContaining('user-1')
      );

      // Check that current uses was incremented
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'team-invites',
        expect.stringContaining('"currentUses":6')
      );
    });

    it('should fail for invalid invite', async () => {
      const result = await authService.useInvite('invalid-code', 'user-1');
      
      expect(result).toEqual({
        success: false,
        error: 'Invalid or expired invite code',
      });
    });
  });

  describe('parseInviteData', () => {
    it('should parse combined deep link + web URL', () => {
      const data = 'beer-olympics://join?code=abc123||https://test.com/join/tournament/team?code=abc123';
      const result = authService.parseInviteData(data);
      
      expect(result).toEqual({
        deepLink: 'beer-olympics://join?code=abc123',
        webUrl: 'https://test.com/join/tournament/team?code=abc123',
      });
    });

    it('should parse web URL with parameters', () => {
      const data = 'https://test.com/join/tournament/team?code=abc123&source=qr';
      const result = authService.parseInviteData(data);
      
      expect(result).toEqual({
        webUrl: data,
        params: {
          code: 'abc123',
          source: 'qr',
        },
      });
    });

    it('should parse plain invite code', () => {
      const data = 'abc123';
      const result = authService.parseInviteData(data);
      
      expect(result).toEqual({
        params: {
          code: 'abc123',
        },
      });
    });
  });

  describe('generateShareableLink', () => {
    it('should generate correct shareable links', () => {
      const mockInvite = {
        id: 'invite-1',
        inviteCode: 'abc123',
        tournamentId: 'tournament-1',
        teamId: 'team-1',
        qrCodeUrl: 'data:image/png;base64,mockqr',
        expiresAt: new Date(),
        maxUses: 10,
        currentUses: 0,
        createdAt: new Date(),
        createdBy: 'user-1',
      };

      const result = authService.generateShareableLink(mockInvite);
      
      expect(result).toEqual({
        shortLink: 'https://test.com/j/abc123',
        fullLink: 'https://test.com/join/tournament-1/team-1?code=abc123',
        qrCode: 'data:image/png;base64,mockqr',
      });
    });
  });

  describe('cleanupExpiredInvites', () => {
    it('should remove expired invites and return count', () => {
      const mockInvites = [
        {
          id: 'invite-1',
          inviteCode: 'valid-code',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'invite-2',
          inviteCode: 'expired-code-1',
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'invite-3',
          inviteCode: 'expired-code-2',
          expiresAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockInvites));

      const removedCount = authService.cleanupExpiredInvites();
      
      expect(removedCount).toBe(2);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'team-invites',
        JSON.stringify([mockInvites[0]])
      );
    });

    it('should return 0 when no expired invites', () => {
      const mockInvites = [
        {
          id: 'invite-1',
          inviteCode: 'valid-code-1',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'invite-2',
          inviteCode: 'valid-code-2',
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockInvites));

      const removedCount = authService.cleanupExpiredInvites();
      
      expect(removedCount).toBe(0);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });
});