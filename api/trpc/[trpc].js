// Mock tRPC handler for development
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Get the procedure path from URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const path = pathParts.slice(2).join('.');
    
    console.log('tRPC request:', { path, method: req.method, url: req.url, headers: req.headers });
    
    // Check if this is a batch request
    const batch = url.searchParams.get('batch');
    const isBatch = batch === '1';
    
    if (isBatch) {
      // Handle batch requests
      const inputParam = url.searchParams.get('input');
      let inputs = {};
      try {
        if (inputParam) {
          inputs = JSON.parse(decodeURIComponent(inputParam));
        }
      } catch (e) {
        console.error('Failed to parse input:', e);
      }
      
      // Process each batched request
      const results = [];
      for (const [index, input] of Object.entries(inputs)) {
        const result = await processProcedure(path, input, req.method);
        results.push({ result });
      }
      
      return res.status(200).json(results);
    } else {
      // Handle single requests
      let input = {};
      
      if (req.method === 'POST') {
        // For POST requests, parse body
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
          }
          if (body) {
            input = JSON.parse(body);
          }
        } catch (e) {
          console.error('Failed to parse POST body:', e);
        }
      } else {
        // For GET requests, parse URL params
        const inputParam = url.searchParams.get('input');
        try {
          if (inputParam) {
            input = JSON.parse(decodeURIComponent(inputParam));
          }
        } catch (e) {
          console.error('Failed to parse input:', e);
        }
      }
      
      const result = await processProcedure(path, input, req.method);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error('tRPC handler error:', error);
    res.status(500).json({ 
      error: {
        message: error.message || 'Internal server error',
        code: -32603,
        data: {
          code: 'INTERNAL_SERVER_ERROR',
          httpStatus: 500,
        }
      }
    });
  }
}

// Process individual procedures
async function processProcedure(path, input, method) {
  console.log('Processing procedure:', path, 'with input:', input, 'method:', method);
  
  if (path === 'tournament.getBySlug' && method === 'GET') {
    // Always return test tournament for now
    if (input.slug === 'test-tournament') {
      return {
        _type: 'tournament',
        slug: 'test-tournament',
        name: 'Test Beer Olympics',
        date: '2024-06-15',
        ownerId: 'user-123',
        isOpen: true,
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
      };
    }
    
    // For demo purposes, create a mock tournament for any slug
    return {
      _type: 'tournament',
      slug: input.slug,
      name: `${input.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Tournament`,
      date: '2024-07-20',
      ownerId: 'demo-user',
      isOpen: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  
  if (path === 'leaderboard.list' && method === 'GET') {
    return [];
  }
  
  if (path === 'match.getUpcomingMatches' && method === 'GET') {
    return [];
  }
  
  if (path === 'team.joinPublic' && method === 'POST') {
    return {
      teamId: 'team-' + Math.random().toString(36).substr(2, 9)
    };
  }

  if (path === 'tournament.create' && method === 'POST') {
    // Generate a slug from the tournament name
    const slug = input.name
      ? input.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : 'tournament-' + Math.random().toString(36).substr(2, 9);
    
    return {
      slug: slug,
      _type: 'tournament',
      name: input.name || 'New Tournament',
      date: input.date || new Date().toISOString().split('T')[0],
      ownerId: 'demo-user',
      isOpen: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (path === 'tournament.listTeams' && method === 'GET') {
    // Return mock teams data
    return [
      {
        id: 'team-1',
        name: 'The Hop Squad',
        colorHex: '#ff6b6b',
        flagCode: '🇺🇸',
        memberIds: ['user-1', 'user-2'],
        createdAt: '2024-06-01T10:00:00Z'
      },
      {
        id: 'team-2', 
        name: 'Brew Crew',
        colorHex: '#4ecdc4',
        flagCode: '🇨🇦',
        memberIds: ['user-3', 'user-4', 'user-5'],
        createdAt: '2024-06-01T11:30:00Z'
      },
      {
        id: 'team-3',
        name: 'Liquid Champions',
        colorHex: '#45b7d1',
        flagCode: '🇬🇧',
        memberIds: ['user-6'],
        createdAt: '2024-06-01T14:15:00Z'
      }
    ];
  }

  if (path === 'tournament.setOpen' && method === 'POST') {
    return {
      ok: true
    };
  }
  
  // Default error response
  return {
    error: {
      message: `Procedure "${path}" not found`,
      code: -32004,
      data: {
        code: 'NOT_FOUND',
        httpStatus: 404,
        path,
      }
    }
  };
}