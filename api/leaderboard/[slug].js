const { couchbaseService } = require('../../src/services/couchbase');
const redisService = require('../../src/services/redis').default;
const { CacheKeys } = require('../../src/utils/cache-keys');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=10');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Tournament slug is required' });
  }
  
  console.log(`API: GET /api/leaderboard/${slug}`);
  
  try {
    // Add performance monitoring
    const startTime = Date.now();
    
    // Try to get from Redis cache first with very short TTL for real-time updates
    const cacheKey = CacheKeys.leaderboard.byTournament(slug);
    let leaderboard = await redisService.get(cacheKey);
    
    if (leaderboard) {
      console.log(`Cache hit for leaderboard/${slug} - Time: ${Date.now() - startTime}ms`);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      return res.status(200).json(leaderboard);
    }
    
    console.log(`Cache miss for leaderboard/${slug} - fetching from database`);
    
    // Use the cached method from couchbaseService
    leaderboard = await couchbaseService.getTournamentLeaderboard(slug);
    
    // If no data found, return empty array
    if (!leaderboard || leaderboard.length === 0) {
      // Still cache empty results for a short time
      await redisService.set(cacheKey, [], 2);
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
      return res.status(200).json([]);
    }
    
    console.log(`Fetched leaderboard for ${slug} - ${leaderboard.length} teams - Time: ${Date.now() - startTime}ms`);
    
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
    res.status(200).json(leaderboard);
    
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    
    // Fallback to mock data if database is unavailable
    const fallbackData = [
      {
        teamId: 'team-1',
        teamName: 'Beer Warriors',
        colorHex: '#ef4444',
        flagCode: '🇺🇸',
        position: 1,
        totalPoints: 25,
        matchesPlayed: 5,
        wins: 3
      },
      {
        teamId: 'team-2',
        teamName: 'Hop Stars',
        colorHex: '#3b82f6',
        flagCode: '🇬🇧',
        position: 2,
        totalPoints: 15,
        matchesPlayed: 5,
        wins: 2
      },
      {
        teamId: 'team-3',
        teamName: 'Golden Ales',
        colorHex: '#eab308',
        flagCode: '🇨🇦',
        position: 3,
        totalPoints: 12,
        matchesPlayed: 5,
        wins: 1
      }
    ];
    
    // Cache fallback data for 1 second
    const cacheKey = CacheKeys.leaderboard.byTournament(slug);
    await redisService.set(cacheKey, fallbackData, 1);
    
    res.setHeader('X-Cache', 'FALLBACK');
    res.status(200).json(fallbackData);
  }
};