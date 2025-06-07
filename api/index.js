module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ 
      message: '🍺 Beer Olympics API',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        tournament: '/api/tournament/test-tournament',
        leaderboard: '/api/leaderboard/test-tournament'
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};