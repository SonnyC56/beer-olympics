module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { slug, teamName, colorHex, flagCode, userId, userName } = req.body;
  
  console.log(`API: POST /api/team/join`, { slug, teamName, userId, userName });
  
  // Mock successful team creation
  res.status(200).json({
    teamId: 'team-' + Math.random().toString(36).substr(2, 9),
    success: true
  });
};