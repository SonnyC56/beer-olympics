import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../src/lib/firebase-admin';
import { SwissTournamentService } from '../../../src/services/swiss-tournament';
import type { Tournament, Team, Match } from '../../../src/types/tournament';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tournamentId } = req.query;

  if (typeof tournamentId !== 'string') {
    return res.status(400).json({ error: 'Tournament ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(tournamentId, req, res);
      case 'POST':
        return await handlePost(tournamentId, req, res);
      case 'PUT':
        return await handlePut(tournamentId, req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Swiss tournament API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/tournament/swiss/[tournamentId]
 * Get Swiss tournament data including pairings and standings
 */
async function handleGet(
  tournamentId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action } = req.query;

  // Get tournament data
  const tournamentDoc = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .get();

  if (!tournamentDoc.exists) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = tournamentDoc.data() as Tournament;

  if (tournament.format !== 'swiss') {
    return res.status(400).json({ error: 'Tournament is not Swiss format' });
  }

  // Get teams
  const teamsSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('teams')
    .get();

  const teams = teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Team[];

  // Get matches
  const matchesSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('matches')
    .orderBy('round', 'asc')
    .orderBy('matchNumber', 'asc')
    .get();

  const matches = matchesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Match[];

  // Initialize Swiss engine with saved state
  const swissEngine = new SwissTournamentService(teams, tournament.totalRounds);
  
  // Restore state from matches
  matches.forEach(match => {
    if (match.isComplete && match.winner) {
      const scores = match.finalScore || { a: 1, b: 0 };
      swissEngine.updateMatchResult(
        match.teamA!,
        match.teamB!,
        match.winner
      );
    }
  });

  switch (action) {
    case 'standings':
      const standings = swissEngine.getStandings();
      return res.status(200).json({ standings });

    case 'pairings':
      const round = parseInt(req.query.round as string) || tournament.currentRound || 1;
      const pairings = swissEngine.getRoundPairings(round);
      return res.status(200).json({ pairings, round });

    case 'stats':
      const stats = teams.map(team => {
        const playerStats = swissEngine.getPlayerStats(team.id);
        return {
          teamId: team.id,
          teamName: team.name,
          ...playerStats
        };
      });
      return res.status(200).json({ stats });

    default:
      // Return full tournament data
      return res.status(200).json({
        tournament,
        teams,
        matches,
        standings: swissEngine.getStandings(),
        currentRound: tournament.currentRound || 1,
        isComplete: swissEngine.isComplete()
      });
  }
}

/**
 * POST /api/tournament/swiss/[tournamentId]
 * Generate pairings for the next round
 */
async function handlePost(
  tournamentId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { action } = req.body;

  if (action !== 'generate-pairings') {
    return res.status(400).json({ error: 'Invalid action' });
  }

  // Get tournament data
  const tournamentDoc = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .get();

  if (!tournamentDoc.exists) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = tournamentDoc.data() as Tournament;

  if (tournament.format !== 'swiss') {
    return res.status(400).json({ error: 'Tournament is not Swiss format' });
  }

  // Get teams
  const teamsSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('teams')
    .get();

  const teams = teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Team[];

  // Get existing matches to restore state
  const matchesSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('matches')
    .get();

  const matches = matchesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Match[];

  // Initialize Swiss engine
  const swissEngine = new SwissTournamentService(teams, tournament.totalRounds);
  
  // Restore state
  matches.forEach(match => {
    if (match.isComplete && match.winner) {
      swissEngine.updateMatchResult(
        match.teamA!,
        match.teamB!,
        match.winner
      );
    }
  });

  // Check if all matches in current round are complete
  const currentRound = tournament.currentRound || 1;
  const currentRoundMatches = matches.filter(m => m.round === currentRound);
  const incompleteMatches = currentRoundMatches.filter(m => !m.isComplete);

  if (incompleteMatches.length > 0) {
    return res.status(400).json({ 
      error: 'Current round has incomplete matches',
      incompleteMatches: incompleteMatches.length
    });
  }

  // Generate next round pairings
  const nextRound = currentRound + 1;
  
  if (swissEngine.isComplete()) {
    return res.status(400).json({ error: 'Tournament is already complete' });
  }

  const pairings = swissEngine.generatePairings(nextRound);

  // Get stations
  const stationsSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('stations')
    .where('isActive', '==', true)
    .get();

  const stationIds = stationsSnapshot.docs.map(doc => doc.id);

  // Get games
  const gamesSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('events')
    .limit(1)
    .get();

  const game = gamesSnapshot.docs[0]?.data() || { id: 'default' };

  // Convert pairings to matches
  const newMatches = swissEngine.pairingsToMatches(pairings, stationIds, game);

  // Save new matches
  const batch = adminDb.batch();

  newMatches.forEach(match => {
    const matchRef = adminDb
      .collection('tournaments')
      .doc(tournamentId)
      .collection('matches')
      .doc(match.id);

    batch.set(matchRef, {
      ...match,
      tournamentId,
      createdAt: new Date().toISOString()
    });
  });

  // Update tournament current round
  batch.update(tournamentDoc.ref, {
    currentRound: nextRound,
    updatedAt: new Date().toISOString()
  });

  await batch.commit();

  return res.status(200).json({
    success: true,
    round: nextRound,
    pairings,
    matches: newMatches,
    standings: swissEngine.getStandings()
  });
}

/**
 * PUT /api/tournament/swiss/[tournamentId]
 * Update match result and recalculate standings
 */
async function handlePut(
  tournamentId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { matchId, winner, scores } = req.body;

  if (!matchId) {
    return res.status(400).json({ error: 'Match ID is required' });
  }

  // Get match
  const matchDoc = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('matches')
    .doc(matchId)
    .get();

  if (!matchDoc.exists) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const match = matchDoc.data() as Match;

  // Update match
  await matchDoc.ref.update({
    isComplete: true,
    winner: winner || null,
    finalScore: scores || { a: winner === match.teamA ? 1 : 0, b: winner === match.teamB ? 1 : 0 },
    endTime: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Recalculate standings
  const teamsSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('teams')
    .get();

  const teams = teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Team[];

  const matchesSnapshot = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .collection('matches')
    .get();

  const matches = matchesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Match[];

  // Rebuild Swiss engine state
  const swissEngine = new SwissTournamentService(teams);
  
  matches.forEach(m => {
    if (m.isComplete && m.winner) {
      swissEngine.updateMatchResult(
        m.teamA!,
        m.teamB!,
        m.winner
      );
    }
  });

  const standings = swissEngine.getStandings();

  // Check if round is complete
  const tournamentDoc = await adminDb
    .collection('tournaments')
    .doc(tournamentId)
    .get();

  const tournament = tournamentDoc.data() as Tournament;
  const currentRound = tournament.currentRound || 1;
  const currentRoundMatches = matches.filter(m => m.round === currentRound);
  const roundComplete = currentRoundMatches.every(m => m.isComplete);

  return res.status(200).json({
    success: true,
    match: { id: matchId, ...match, isComplete: true, winner },
    standings,
    roundComplete,
    tournamentComplete: swissEngine.isComplete()
  });
}