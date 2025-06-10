import Pusher from 'pusher';
import PusherClient from 'pusher-js';
import type { PusherEvents } from '../types/pusher';

// Re-export the PusherEvents type so it can be imported from this file
export type { PusherEvents } from '../types/pusher';

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
    // For client-side, use Vite's import.meta.env
    const key = import.meta.env.VITE_PUSHER_KEY as string | undefined;
    const cluster = (import.meta.env.VITE_PUSHER_CLUSTER as string | undefined) || 'us2';
    
    if (key) {
      pusherClient = new PusherClient(key, {
        cluster,
        forceTLS: true,
      });
    }
  }
  return pusherClient;
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