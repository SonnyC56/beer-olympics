import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher instance
let pusherServer: Pusher | null = null;

export function getPusherServer() {
  if (!pusherServer && process.env.PUSHER_APP_ID) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }
  return pusherServer;
}

// Client-side Pusher instance
let pusherClient: PusherClient | null = null;

export function getPusherClient() {
  if (!pusherClient && typeof window !== 'undefined') {
    const key = import.meta.env.VITE_PUSHER_KEY || process.env.PUSHER_KEY;
    const cluster = import.meta.env.VITE_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || 'us2';
    
    if (key) {
      pusherClient = new PusherClient(key, {
        cluster,
        forceTLS: true,
      });
    }
  }
  return pusherClient;
}

// Event types for type safety
export interface PusherEvents {
  'score-update': {
    tournamentId: string;
    matchId: string;
    teamId: string;
    points: number;
  };
  'match-complete': {
    tournamentId: string;
    matchId: string;
    winner: string;
  };
  'team-joined': {
    tournamentId: string;
    team: {
      id: string;
      name: string;
      colorHex: string;
      flagCode: string;
    };
  };
  'tournament-status': {
    tournamentId: string;
    isOpen: boolean;
  };
}

// Helper to trigger events from server
export async function triggerEvent<K extends keyof PusherEvents>(
  channel: string,
  event: K,
  data: PusherEvents[K]
) {
  const pusher = getPusherServer();
  if (!pusher) {
    console.warn('Pusher not configured, skipping event:', event);
    return;
  }
  
  try {
    await pusher.trigger(channel, event, data);
  } catch (error) {
    console.error('Failed to trigger Pusher event:', error);
  }
}

// Helper to get channel name for a tournament
export function getTournamentChannel(tournamentId: string) {
  return `tournament-${tournamentId}`;
}

// Helper to get private channel name for authenticated users
export function getPrivateChannel(userId: string) {
  return `private-user-${userId}`;
}