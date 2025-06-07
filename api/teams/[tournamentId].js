export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { tournamentId } = req.query;
  
  console.log(`API: GET /api/teams/${tournamentId}`);
  
  res.status(200).json([
    {
      id: 'team-1',
      tournamentId: tournamentId,
      name: 'Beer Warriors',
      colorHex: '#ef4444',
      flagCode: '🇺🇸',
      memberIds: ['user-1'],
      captainId: 'user-1',
      createdAt: '2024-06-01T00:00:00Z'
    },
    {
      id: 'team-2',
      tournamentId: tournamentId,
      name: 'Hop Stars',
      colorHex: '#3b82f6',
      flagCode: '🇬🇧',
      memberIds: ['user-2'],
      captainId: 'user-2',
      createdAt: '2024-06-01T00:00:00Z'
    }
  ]);
}