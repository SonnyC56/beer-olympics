module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { tournamentId } = req.query;
  
  console.log(`API: GET /api/matches/${tournamentId}`);
  
  res.status(200).json([
    {
      id: 'match-1',
      eventId: 'event-1',
      round: 1,
      stationId: 'station-1',
      teamA: 'team-1',
      teamB: 'team-2',
      isComplete: false,
      mediaIds: [],
      createdAt: '2024-06-01T00:00:00Z'
    },
    {
      id: 'match-2',
      eventId: 'event-1',
      round: 1,
      stationId: 'station-2',
      teamA: 'team-1',
      teamB: 'team-3',
      isComplete: false,
      mediaIds: [],
      createdAt: '2024-06-01T00:00:00Z'
    }
  ]);
};