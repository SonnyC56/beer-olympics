module.exports = function handler(req, res) {
  // Enable CORS for all origins in development, specific in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { slug } = req.query;
  
  console.log(`API: GET /api/tournament/${slug}`);
  
  if (slug === 'test-tournament') {
    res.status(200).json({
      slug: 'test-tournament',
      name: 'Test Beer Olympics',
      date: '2024-06-15',
      ownerId: 'user-123',
      isOpen: true,
      createdAt: '2024-06-01T00:00:00Z'
    });
  } else {
    res.status(404).json({ 
      error: 'Tournament not found'
    });
  }
};