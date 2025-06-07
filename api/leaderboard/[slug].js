module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { slug } = req.query;
  
  console.log(`API: GET /api/leaderboard/${slug}`);
  
  res.status(200).json([
    {
      teamId: 'team-1',
      teamName: 'Beer Warriors',
      colorHex: '#ef4444',
      flagCode: '🇺🇸',
      position: 1,
      totalPoints: 25
    },
    {
      teamId: 'team-2',
      teamName: 'Hop Stars',
      colorHex: '#3b82f6',
      flagCode: '🇬🇧',
      position: 2,
      totalPoints: 15
    },
    {
      teamId: 'team-3',
      teamName: 'Golden Ales',
      colorHex: '#eab308',
      flagCode: '🇨🇦',
      position: 3,
      totalPoints: 12
    }
  ]);
};