export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }
  
  const { slug, teamName, colorHex, flagCode, userId, userName } = req.body;
  
  // Mock successful team creation
  res.status(200).json({
    result: {
      data: {
        teamId: 'team-' + Math.random().toString(36).substr(2, 9)
      }
    }
  });
}