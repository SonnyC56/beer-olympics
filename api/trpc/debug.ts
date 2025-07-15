import type { VercelRequest, VercelResponse } from '@vercel/node';
import { appRouter } from '../../src/api/routers';
import { TRPCError } from '@trpc/server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Test createMegaTournament with minimal input
    const mockUser = {
      id: 'debug-user-123',
      email: 'debug@example.com',
      name: 'Debug User',
      image: 'https://example.com/avatar.jpg'
    };
    
    const mockContext = {
      user: mockUser,
      req,
      res,
    };
    
    const caller = appRouter.createCaller(mockContext);
    
    const testInput = {
      name: 'Debug Mega Tournament',
      date: '2024-07-15',
      subTournaments: [{
        name: 'Debug Sub Tournament',
        format: 'single_elimination' as const,
        maxTeams: 8,
      }],
      megaScoringMethod: 'placement' as const,
    };
    
    // Try to create the tournament
    const result = await caller.tournament.createMegaTournament(testInput);
    
    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    // Return detailed error information
    if (error instanceof TRPCError) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          cause: error.cause,
        },
      });
    }
    
    return res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
    });
  }
}