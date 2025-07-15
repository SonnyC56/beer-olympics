import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { authEnhanced } from '@/services/auth-enhanced';
import { generateId } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tournamentId } = req.query;

  if (typeof tournamentId !== 'string') {
    return res.status(400).json({ error: 'Invalid tournament ID' });
  }

  // Verify authentication
  const session = await authEnhanced.verifySession(req);
  if (!session || !session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get check-in status and statistics
        return handleGetCheckInStatus(tournamentId, res);

      case 'POST':
        // Check in an attendee
        return handleCheckIn(tournamentId, req.body, session.userId, res);

      case 'PUT':
        // Update check-in status (e.g., mark as no-show)
        return handleUpdateCheckIn(tournamentId, req.body, res);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Check-in API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetCheckInStatus(tournamentId: string, res: NextApiResponse) {
  try {
    // Get all RSVPs for the tournament
    const rsvps = await db.getRSVPsByTournament(tournamentId);
    
    // Get tournament details for capacity
    const tournament = await db.getTournament(tournamentId);
    const capacity = tournament?.maxTeams ? tournament.maxTeams * 2 : 64; // 2 players per team

    // Calculate statistics
    const stats = {
      totalRSVPs: rsvps.length,
      checkedIn: rsvps.filter(r => r.status === 'checked_in').length,
      waitlist: rsvps.filter(r => r.status === 'waitlist').length,
      noShows: rsvps.filter(r => r.status === 'no_show').length,
      capacity,
      teamsFormed: Math.floor(rsvps.filter(r => r.status === 'checked_in' && r.teamId).length / 2),
      lateArrivals: rsvps.filter(r => r.isLateArrival).length
    };

    // Format attendee data
    const attendees = rsvps.map(rsvp => ({
      id: rsvp.id,
      fullName: rsvp.fullName,
      email: rsvp.email,
      phone: rsvp.phone,
      participationType: rsvp.participationType || 'player',
      teamName: rsvp.teamName,
      teamId: rsvp.teamId,
      checkedInAt: rsvp.checkedInAt,
      checkInMethod: rsvp.checkInMethod,
      status: rsvp.status || 'pending',
      qrCode: rsvp.qrCode,
      preferredPartner: rsvp.preferredPartner,
      shirtSize: rsvp.shirtSize,
      isLateArrival: rsvp.isLateArrival
    }));

    return res.status(200).json({
      success: true,
      attendees,
      stats
    });
  } catch (error) {
    console.error('Failed to get check-in status:', error);
    return res.status(500).json({ error: 'Failed to retrieve check-in status' });
  }
}

async function handleCheckIn(
  tournamentId: string, 
  body: any, 
  userId: string,
  res: NextApiResponse
) {
  const { 
    attendeeId, 
    method = 'manual', 
    autoAssignTeam = false,
    isLateArrival = false 
  } = body;

  if (!attendeeId) {
    return res.status(400).json({ error: 'Attendee ID is required' });
  }

  try {
    // Get the RSVP
    const rsvp = await db.getRSVP(attendeeId);
    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    // Check if already checked in
    if (rsvp.status === 'checked_in') {
      return res.status(400).json({ error: 'Already checked in' });
    }

    // Prepare check-in data
    const checkInData: any = {
      status: 'checked_in',
      checkedInAt: new Date().toISOString(),
      checkInMethod: method,
      checkedInBy: userId,
      isLateArrival
    };

    // Auto-assign team if requested and player doesn't have one
    let teamAssigned = false;
    let teamName = rsvp.teamName;
    let tableNumber = null;

    if (autoAssignTeam && !rsvp.teamId && rsvp.participationType === 'player') {
      // Find available team or create new one
      const availableTeam = await findOrCreateTeam(tournamentId, rsvp);
      
      if (availableTeam) {
        checkInData.teamId = availableTeam.id;
        checkInData.teamName = availableTeam.name;
        teamAssigned = true;
        teamName = availableTeam.name;
        tableNumber = availableTeam.tableNumber;
      }
    }

    // Update RSVP with check-in data
    await db.updateRSVP(attendeeId, checkInData);

    // Emit real-time update
    await emitCheckInUpdate(tournamentId, {
      attendeeId,
      fullName: rsvp.fullName,
      teamName,
      checkedInAt: checkInData.checkedInAt
    });

    return res.status(200).json({
      success: true,
      teamAssigned,
      teamName,
      tableNumber,
      message: 'Check-in successful'
    });
  } catch (error) {
    console.error('Failed to check in attendee:', error);
    return res.status(500).json({ error: 'Failed to process check-in' });
  }
}

async function handleUpdateCheckIn(tournamentId: string, body: any, res: NextApiResponse) {
  const { attendeeId, status } = body;

  if (!attendeeId || !status) {
    return res.status(400).json({ error: 'Attendee ID and status are required' });
  }

  try {
    await db.updateRSVP(attendeeId, { status });

    return res.status(200).json({
      success: true,
      message: 'Check-in status updated'
    });
  } catch (error) {
    console.error('Failed to update check-in status:', error);
    return res.status(500).json({ error: 'Failed to update check-in status' });
  }
}

async function findOrCreateTeam(tournamentId: string, rsvp: any) {
  try {
    // First, check if preferred partner has checked in and has space
    if (rsvp.preferredPartner) {
      const partnerRSVP = await db.getRSVPByEmail(rsvp.preferredPartner, tournamentId);
      if (partnerRSVP && partnerRSVP.teamId) {
        const partnerTeam = await db.getTeam(partnerRSVP.teamId);
        if (partnerTeam && partnerTeam.players.length < 2) {
          return partnerTeam;
        }
      }
    }

    // Find teams with only one player
    const incompleteTeams = await db.getIncompleteTeams(tournamentId);
    if (incompleteTeams.length > 0) {
      // Match based on skill level if possible
      const matchedTeam = incompleteTeams.find(team => 
        team.skillLevel === rsvp.skillLevel
      ) || incompleteTeams[0];
      
      return matchedTeam;
    }

    // Create a new team
    const teamNumber = await db.getNextTeamNumber(tournamentId);
    const newTeam = {
      id: generateId('team'),
      tournamentId,
      name: `Team ${teamNumber}`,
      players: [rsvp.id],
      skillLevel: rsvp.skillLevel,
      tableNumber: Math.ceil(teamNumber / 2), // 2 teams per table
      createdAt: new Date().toISOString()
    };

    await db.createTeam(newTeam);
    return newTeam;
  } catch (error) {
    console.error('Failed to find or create team:', error);
    return null;
  }
}

async function emitCheckInUpdate(tournamentId: string, data: any) {
  try {
    // This would emit a real-time update via WebSocket/Pusher
    // For now, we'll log it
    console.log('Check-in update:', { tournamentId, ...data });
  } catch (error) {
    console.error('Failed to emit check-in update:', error);
  }
}