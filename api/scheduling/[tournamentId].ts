/**
 * Scheduling API Endpoints
 * Manages tournament scheduling, stations, and time slots
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { neon } from '@neondatabase/serverless';
import type { 
  Station, 
  ScheduleSlot, 
  SchedulingConfig,
  ScheduleResult,
  SchedulingConstraint,
  ScheduleUpdate,
  BulkScheduleRequest,
  ScheduleAnalytics
} from '../../src/types/scheduling';
import { TournamentEngine } from '../../src/services/tournament-engine';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tournamentId } = req.query;
  
  if (!tournamentId || typeof tournamentId !== 'string') {
    return res.status(400).json({ error: 'Tournament ID is required' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, tournamentId, session.user.id);
      case 'POST':
        return await handlePost(req, res, tournamentId, session.user.id);
      case 'PUT':
        return await handlePut(req, res, tournamentId, session.user.id);
      case 'DELETE':
        return await handleDelete(req, res, tournamentId, session.user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Scheduling API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET handlers for various scheduling data
 */
async function handleGet(
  req: NextApiRequest, 
  res: NextApiResponse, 
  tournamentId: string,
  userId: string
) {
  const { type, stationId, round, matchId } = req.query;

  // Verify tournament access
  const tournament = await verifyTournamentAccess(tournamentId, userId);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found or access denied' });
  }

  switch (type) {
    case 'stations':
      // Get all stations for the tournament
      const stations = await sql`
        SELECT * FROM stations 
        WHERE tournament_id = ${tournamentId}
        ORDER BY name
      `;
      return res.status(200).json({ stations });

    case 'schedule':
      // Get full schedule or filtered schedule
      let scheduleQuery = sql`
        SELECT s.*, st.name as station_name
        FROM schedule_slots s
        LEFT JOIN stations st ON s.station_id = st.id
        WHERE s.tournament_id = ${tournamentId}
      `;

      if (stationId) {
        scheduleQuery = sql`
          SELECT s.*, st.name as station_name
          FROM schedule_slots s
          LEFT JOIN stations st ON s.station_id = st.id
          WHERE s.tournament_id = ${tournamentId} AND s.station_id = ${stationId}
        `;
      } else if (round) {
        scheduleQuery = sql`
          SELECT s.*, st.name as station_name
          FROM schedule_slots s
          LEFT JOIN stations st ON s.station_id = st.id
          WHERE s.tournament_id = ${tournamentId} AND s.round = ${parseInt(round as string)}
        `;
      }

      const schedule = await scheduleQuery;
      return res.status(200).json({ schedule });

    case 'conflicts':
      // Get scheduling conflicts
      const conflicts = await sql`
        SELECT * FROM schedule_conflicts
        WHERE tournament_id = ${tournamentId} AND is_resolved = false
        ORDER BY severity DESC, detected_at DESC
      `;
      return res.status(200).json({ conflicts });

    case 'analytics':
      // Get scheduling analytics
      const analytics = await generateScheduleAnalytics(tournamentId);
      return res.status(200).json({ analytics });

    case 'recommendations':
      // Get station recommendations for a match
      if (!matchId) {
        return res.status(400).json({ error: 'Match ID required for recommendations' });
      }
      const recommendations = await getStationRecommendations(tournamentId, matchId as string);
      return res.status(200).json({ recommendations });

    default:
      // Return all scheduling data
      const [allStations, allSchedule, allConflicts] = await Promise.all([
        sql`SELECT * FROM stations WHERE tournament_id = ${tournamentId} ORDER BY name`,
        sql`
          SELECT s.*, st.name as station_name
          FROM schedule_slots s
          LEFT JOIN stations st ON s.station_id = st.id
          WHERE s.tournament_id = ${tournamentId}
          ORDER BY s.start_time
        `,
        sql`
          SELECT * FROM schedule_conflicts
          WHERE tournament_id = ${tournamentId}
          ORDER BY is_resolved, severity DESC
        `
      ]);

      return res.status(200).json({
        stations: allStations,
        schedule: allSchedule,
        conflicts: allConflicts
      });
  }
}

/**
 * POST handlers for creating scheduling data
 */
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  tournamentId: string,
  userId: string
) {
  const { type } = req.query;
  const body = req.body;

  // Verify tournament ownership
  const isOwner = await verifyTournamentOwnership(tournamentId, userId);
  if (!isOwner) {
    return res.status(403).json({ error: 'Only tournament owner can modify scheduling' });
  }

  switch (type) {
    case 'station':
      // Create a new station
      const station: Station = {
        _type: 'station',
        id: `station-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tournamentId,
        name: body.name,
        description: body.description,
        location: body.location,
        capacity: body.capacity,
        gameTypes: body.gameTypes || [],
        equipment: body.equipment || [],
        isActive: true,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await sql`
        INSERT INTO stations (
          id, tournament_id, name, description, location, 
          capacity, game_types, equipment, is_active, status,
          created_at, updated_at
        ) VALUES (
          ${station.id}, ${station.tournamentId}, ${station.name}, 
          ${station.description}, ${station.location}, ${station.capacity},
          ${JSON.stringify(station.gameTypes)}, ${JSON.stringify(station.equipment)},
          ${station.isActive}, ${station.status},
          ${station.createdAt}, ${station.updatedAt}
        )
      `;

      return res.status(201).json({ station });

    case 'generate':
      // Generate schedule for the tournament
      const scheduleRequest: BulkScheduleRequest = body;
      
      // Load tournament data and create engine
      const tournamentData = await loadTournamentData(tournamentId);
      if (!tournamentData) {
        return res.status(404).json({ error: 'Tournament data not found' });
      }

      const engine = new TournamentEngine(tournamentData.config);
      
      // Load stations
      const stations = await sql`
        SELECT * FROM stations 
        WHERE tournament_id = ${tournamentId} AND is_active = true
      `;
      
      engine.initializeStations(stations as Station[]);

      // Generate schedule
      const result = await engine.generateSchedule(
        scheduleRequest.config,
        scheduleRequest.constraints
      );

      // Save schedule if not preview
      if (!scheduleRequest.preview && result.success) {
        await saveSchedule(tournamentId, result.schedule);
      }

      return res.status(200).json({ result });

    case 'slot':
      // Create a single schedule slot
      const slot: ScheduleSlot = {
        _type: 'schedule_slot',
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tournamentId,
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.duration,
        stationId: body.stationId,
        stationName: body.stationName,
        matchId: body.matchId,
        round: body.round,
        status: 'scheduled',
        bufferBefore: body.bufferBefore || 0,
        bufferAfter: body.bufferAfter || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await sql`
        INSERT INTO schedule_slots (
          id, tournament_id, start_time, end_time, duration,
          station_id, station_name, match_id, round, status,
          buffer_before, buffer_after, created_at, updated_at
        ) VALUES (
          ${slot.id}, ${slot.tournamentId}, ${slot.startTime}, 
          ${slot.endTime}, ${slot.duration}, ${slot.stationId},
          ${slot.stationName}, ${slot.matchId}, ${slot.round},
          ${slot.status}, ${slot.bufferBefore}, ${slot.bufferAfter},
          ${slot.createdAt}, ${slot.updatedAt}
        )
      `;

      return res.status(201).json({ slot });

    default:
      return res.status(400).json({ error: 'Invalid operation type' });
  }
}

/**
 * PUT handlers for updating scheduling data
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  tournamentId: string,
  userId: string
) {
  const { type, id } = req.query;
  const body = req.body;

  // Verify tournament ownership
  const isOwner = await verifyTournamentOwnership(tournamentId, userId);
  if (!isOwner) {
    return res.status(403).json({ error: 'Only tournament owner can modify scheduling' });
  }

  switch (type) {
    case 'station':
      // Update station
      if (!id) {
        return res.status(400).json({ error: 'Station ID required' });
      }

      await sql`
        UPDATE stations
        SET 
          name = ${body.name},
          description = ${body.description},
          location = ${body.location},
          capacity = ${body.capacity},
          game_types = ${JSON.stringify(body.gameTypes)},
          equipment = ${JSON.stringify(body.equipment)},
          is_active = ${body.isActive},
          status = ${body.status},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${id} AND tournament_id = ${tournamentId}
      `;

      return res.status(200).json({ success: true });

    case 'slot':
      // Update schedule slot
      if (!id) {
        return res.status(400).json({ error: 'Slot ID required' });
      }

      const update: ScheduleUpdate = {
        _type: 'schedule_update',
        tournamentId,
        updateType: body.updateType || 'reschedule',
        affectedSlotIds: [id as string],
        affectedMatchIds: [body.matchId],
        reason: body.reason,
        newValues: [{
          startTime: body.startTime,
          endTime: body.endTime,
          stationId: body.stationId,
          status: body.status
        }],
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
        autoGenerated: false
      };

      // Update the slot
      await sql`
        UPDATE schedule_slots
        SET 
          start_time = ${body.startTime},
          end_time = ${body.endTime},
          station_id = ${body.stationId},
          station_name = ${body.stationName},
          status = ${body.status},
          updated_at = ${new Date().toISOString()}
        WHERE id = ${id} AND tournament_id = ${tournamentId}
      `;

      // Handle cascading updates if it's a delay
      if (body.updateType === 'delay' && body.delayMinutes) {
        await handleDelayedMatch(tournamentId, id as string, body.delayMinutes);
      }

      // Log the update
      await sql`
        INSERT INTO schedule_updates (
          tournament_id, update_type, affected_slot_ids, 
          affected_match_ids, reason, new_values,
          updated_by, updated_at, auto_generated
        ) VALUES (
          ${update.tournamentId}, ${update.updateType},
          ${JSON.stringify(update.affectedSlotIds)},
          ${JSON.stringify(update.affectedMatchIds)},
          ${update.reason}, ${JSON.stringify(update.newValues)},
          ${update.updatedBy}, ${update.updatedAt}, ${update.autoGenerated}
        )
      `;

      return res.status(200).json({ update });

    case 'resolve-conflict':
      // Resolve a scheduling conflict
      if (!id) {
        return res.status(400).json({ error: 'Conflict ID required' });
      }

      await sql`
        UPDATE schedule_conflicts
        SET 
          is_resolved = true,
          resolution_action = ${body.resolutionAction},
          resolved_by = ${userId},
          resolved_at = ${new Date().toISOString()}
        WHERE id = ${id} AND tournament_id = ${tournamentId}
      `;

      return res.status(200).json({ success: true });

    default:
      return res.status(400).json({ error: 'Invalid update type' });
  }
}

/**
 * DELETE handlers for removing scheduling data
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  tournamentId: string,
  userId: string
) {
  const { type, id } = req.query;

  // Verify tournament ownership
  const isOwner = await verifyTournamentOwnership(tournamentId, userId);
  if (!isOwner) {
    return res.status(403).json({ error: 'Only tournament owner can delete scheduling data' });
  }

  if (!id) {
    return res.status(400).json({ error: 'ID required for deletion' });
  }

  switch (type) {
    case 'station':
      // Soft delete station
      await sql`
        UPDATE stations
        SET is_active = false, updated_at = ${new Date().toISOString()}
        WHERE id = ${id} AND tournament_id = ${tournamentId}
      `;
      return res.status(200).json({ success: true });

    case 'slot':
      // Delete schedule slot
      await sql`
        DELETE FROM schedule_slots
        WHERE id = ${id} AND tournament_id = ${tournamentId}
      `;
      return res.status(200).json({ success: true });

    case 'schedule':
      // Clear entire schedule
      await sql`
        DELETE FROM schedule_slots
        WHERE tournament_id = ${tournamentId}
      `;
      await sql`
        DELETE FROM schedule_conflicts
        WHERE tournament_id = ${tournamentId}
      `;
      return res.status(200).json({ success: true });

    default:
      return res.status(400).json({ error: 'Invalid delete type' });
  }
}

/**
 * Helper functions
 */

async function verifyTournamentAccess(tournamentId: string, userId: string): Promise<any> {
  const result = await sql`
    SELECT * FROM tournaments 
    WHERE id = ${tournamentId} 
    AND (owner_id = ${userId} OR is_open = true)
  `;
  return result[0];
}

async function verifyTournamentOwnership(tournamentId: string, userId: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM tournaments 
    WHERE id = ${tournamentId} AND owner_id = ${userId}
  `;
  return result.length > 0;
}

async function loadTournamentData(tournamentId: string): Promise<any> {
  const result = await sql`
    SELECT * FROM tournaments WHERE id = ${tournamentId}
  `;
  
  if (result.length === 0) return null;
  
  const tournament = result[0];
  
  // Load teams
  const teams = await sql`
    SELECT * FROM teams WHERE tournament_id = ${tournamentId}
  `;
  
  return {
    tournament,
    config: {
      format: tournament.format,
      numPlayers: teams.length,
      playerNames: teams.map((t: any) => t.name),
      ...tournament.settings
    }
  };
}

async function saveSchedule(tournamentId: string, schedule: ScheduleSlot[]): Promise<void> {
  // Clear existing schedule
  await sql`DELETE FROM schedule_slots WHERE tournament_id = ${tournamentId}`;
  
  // Insert new schedule
  for (const slot of schedule) {
    await sql`
      INSERT INTO schedule_slots (
        id, tournament_id, start_time, end_time, duration,
        station_id, station_name, match_id, round, status,
        buffer_before, buffer_after, created_at, updated_at
      ) VALUES (
        ${slot.id}, ${tournamentId}, ${slot.startTime}, 
        ${slot.endTime}, ${slot.duration}, ${slot.stationId},
        ${slot.stationName}, ${slot.matchId}, ${slot.round},
        ${slot.status}, ${slot.bufferBefore || 0}, ${slot.bufferAfter || 0},
        ${slot.createdAt}, ${slot.updatedAt}
      )
    `;
  }
}

async function handleDelayedMatch(
  tournamentId: string, 
  slotId: string, 
  delayMinutes: number
): Promise<void> {
  // Get all slots after the delayed one
  const affectedSlots = await sql`
    SELECT * FROM schedule_slots
    WHERE tournament_id = ${tournamentId}
    AND start_time > (
      SELECT start_time FROM schedule_slots 
      WHERE id = ${slotId}
    )
    ORDER BY start_time
  `;

  // Update each affected slot
  for (const slot of affectedSlots) {
    const newStartTime = new Date(slot.start_time);
    newStartTime.setMinutes(newStartTime.getMinutes() + delayMinutes);
    
    const newEndTime = new Date(slot.end_time);
    newEndTime.setMinutes(newEndTime.getMinutes() + delayMinutes);

    await sql`
      UPDATE schedule_slots
      SET 
        start_time = ${newStartTime.toISOString()},
        end_time = ${newEndTime.toISOString()},
        updated_at = ${new Date().toISOString()}
      WHERE id = ${slot.id}
    `;
  }
}

async function generateScheduleAnalytics(tournamentId: string): Promise<ScheduleAnalytics> {
  // Get schedule data
  const schedule = await sql`
    SELECT * FROM schedule_slots 
    WHERE tournament_id = ${tournamentId}
    ORDER BY start_time
  `;

  if (schedule.length === 0) {
    return {
      tournamentId,
      generatedAt: new Date().toISOString(),
      tournamentDuration: 0,
      averageMatchDuration: 0,
      totalBufferTime: 0,
      stationUtilization: [],
      playerWaitTimes: [],
      totalConflicts: 0,
      conflictsByType: {},
      resolvedConflicts: 0,
      scheduleEfficiency: 0,
      recommendedImprovements: ['No schedule generated yet']
    };
  }

  // Calculate metrics
  const firstSlot = schedule[0];
  const lastSlot = schedule[schedule.length - 1];
  const tournamentDuration = 
    (new Date(lastSlot.end_time).getTime() - new Date(firstSlot.start_time).getTime()) / 60000;

  const totalMatchTime = schedule.reduce((sum: number, slot: any) => sum + slot.duration, 0);
  const averageMatchDuration = totalMatchTime / schedule.length;

  const totalBufferTime = schedule.reduce((sum: number, slot: any) => 
    sum + (slot.buffer_before || 0) + (slot.buffer_after || 0), 0
  );

  // Station utilization
  const stations = await sql`
    SELECT id, name FROM stations 
    WHERE tournament_id = ${tournamentId}
  `;

  const stationUtilization = stations.map((station: any) => {
    const stationSlots = schedule.filter((s: any) => s.station_id === station.id);
    const utilizationTime = stationSlots.reduce((sum: number, slot: any) => sum + slot.duration, 0);
    const utilizationPercentage = (utilizationTime / tournamentDuration) * 100;

    return {
      stationId: station.id,
      utilizationPercentage,
      totalMatches: stationSlots.length,
      idleTime: tournamentDuration - utilizationTime
    };
  });

  // Conflict metrics
  const conflicts = await sql`
    SELECT type, is_resolved FROM schedule_conflicts
    WHERE tournament_id = ${tournamentId}
  `;

  const conflictsByType = conflicts.reduce((acc: any, conflict: any) => {
    acc[conflict.type] = (acc[conflict.type] || 0) + 1;
    return acc;
  }, {});

  const resolvedConflicts = conflicts.filter((c: any) => c.is_resolved).length;

  // Calculate efficiency
  const efficiency = Math.min(100, 
    (totalMatchTime / tournamentDuration) * 100 * 
    (1 - conflicts.length * 0.1)
  );

  // Generate recommendations
  const recommendations = [];
  if (efficiency < 70) {
    recommendations.push('Consider reducing buffer times between matches');
  }
  if (conflicts.length > schedule.length * 0.1) {
    recommendations.push('High number of conflicts detected - review scheduling constraints');
  }
  
  const underutilizedStations = stationUtilization.filter(s => s.utilizationPercentage < 50);
  if (underutilizedStations.length > 0) {
    recommendations.push(`${underutilizedStations.length} stations are underutilized`);
  }

  return {
    tournamentId,
    generatedAt: new Date().toISOString(),
    tournamentDuration,
    averageMatchDuration,
    totalBufferTime,
    stationUtilization,
    playerWaitTimes: [], // Would need player tracking to calculate
    totalConflicts: conflicts.length,
    conflictsByType,
    resolvedConflicts,
    scheduleEfficiency: efficiency,
    recommendedImprovements: recommendations
  };
}

async function getStationRecommendations(
  tournamentId: string, 
  matchId: string
): Promise<any> {
  // Get match details
  const match = await sql`
    SELECT * FROM matches WHERE id = ${matchId} AND tournament_id = ${tournamentId}
  `;
  
  if (match.length === 0) {
    return { error: 'Match not found' };
  }

  // Get all stations
  const stations = await sql`
    SELECT * FROM stations 
    WHERE tournament_id = ${tournamentId} AND is_active = true
  `;

  // Get station usage
  const stationUsage = await sql`
    SELECT station_id, COUNT(*) as match_count
    FROM schedule_slots
    WHERE tournament_id = ${tournamentId}
    GROUP BY station_id
  `;

  const usageMap = new Map(stationUsage.map((u: any) => [u.station_id, u.match_count]));

  // Score and rank stations
  const recommendations = stations.map((station: any) => {
    let score = 100;
    const reasons = [];

    // Prefer less used stations
    const usage = usageMap.get(station.id) || 0;
    score -= usage * 5;
    if (usage === 0) reasons.push('Station not yet used');

    // Check if station supports the game type
    const matchData = match[0];
    if (matchData.event_name && station.game_types) {
      const gameTypes = JSON.parse(station.game_types);
      if (gameTypes.includes(matchData.event_name)) {
        score += 20;
        reasons.push('Supports this game type');
      }
    }

    // Prefer stations with higher capacity for important matches
    if (matchData.round > 2 && station.capacity > 50) {
      score += 10;
      reasons.push('High capacity for late-round match');
    }

    return {
      stationId: station.id,
      score: Math.max(0, Math.min(100, score)),
      reasons
    };
  }).sort((a: any, b: any) => b.score - a.score);

  return {
    matchId,
    recommendedStations: recommendations.slice(0, 3),
    constraints: []
  };
}