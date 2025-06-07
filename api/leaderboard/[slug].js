export default function handler(req, res) {
  const { slug } = req.query;
  
  res.status(200).json({
    result: {
      data: [
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
        }
      ]
    }
  });
}