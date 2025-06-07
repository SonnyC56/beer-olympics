import { getCollection } from '../../src/services/couchbase.js';

export default async function handler(req, res) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    const { slug } = req.query;
    
    // First check for test tournament
    if (slug === 'test-tournament') {
      return res.status(200).json({
        slug: 'test-tournament',
        name: 'Test Beer Olympics',
        date: '2024-06-15',
        ownerId: 'user-123',
        isOpen: true,
        createdAt: '2024-06-01T00:00:00Z'
      });
    }
    
    try {
      // Try to get from Couchbase
      const collection = await getCollection();
      const result = await collection.get(`tournament::${slug}`);
      return res.status(200).json(result.content);
    } catch (dbError) {
      // If document not found in Couchbase
      if (dbError.name === 'DocumentNotFoundError') {
        return res.status(404).json({ 
          error: 'Tournament not found'
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Tournament API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}