import type { VercelRequest, VercelResponse } from '@vercel/node';
const getServerSession = require('next-auth').getServerSession;
import { authOptions } from '../auth/[...nextauth]';
import { pusherServer } from '../../src/api/services/pusher-server';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { socket_id, channel_name } = req.body;

    if (!socket_id || !channel_name) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // For presence channels, include user data
    let authResponse;
    if (channel_name.startsWith('presence-')) {
      const userData = {
        user_id: session.user.id,
        user_info: {
          name: session.user.name || 'Anonymous',
          email: session.user.email,
          image: session.user.image,
        },
      };
      
      authResponse = pusherServer.authenticateChannel(
        socket_id,
        channel_name,
        userData
      );
    } else if (channel_name.startsWith('private-')) {
      // For private channels, just authenticate
      authResponse = pusherServer.authenticateChannel(
        socket_id,
        channel_name
      );
    } else {
      return res.status(403).json({ error: 'Public channels do not require authentication' });
    }

    return res.status(200).json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}