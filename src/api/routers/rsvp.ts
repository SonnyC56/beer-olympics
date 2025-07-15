import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { couchbaseService as couchbase } from '../../services/couchbase';

const RSVPSchema = z.object({
  id: z.string().optional(),
  tournamentSlug: z.string(),
  
  // Basic Info
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  
  // Participation Type
  participationType: z.enum(['player', 'spectator', 'designated_driver']).default('player'),
  
  // Tournament Preferences (only required for players)
  preferredPartner: z.string().optional(),
  teamName: z.string().optional(), // Optional for spectators/DDs
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'legendary']).optional(),
  
  // Event Details
  attendingGames: z.array(z.string()).optional(), // Renamed from attendingEvents
  dietaryRestrictions: z.string().optional(),
  shirtSize: z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl']),
  
  // Fun Customization
  favoriteGame: z.string().optional(),
  victoryDance: z.string().optional(),
  specialTalent: z.string().optional(),
  motivationalQuote: z.string().optional(),
  
  // Logistics
  needsTransportation: z.boolean().default(false),
  canOfferRide: z.boolean().default(false),
  isDesignatedDriver: z.boolean().default(false), // Special flag for DD achievement
  
  // Additional Options
  willingToVolunteer: z.boolean().default(false),
  bringingGuests: z.boolean().default(false),
  guestCount: z.number().default(0),
  additionalRequests: z.string().optional(),
  
  // Agreement
  agreeToTerms: z.boolean().refine(val => val === true, 'Must agree to terms'),
  agreeToPhotos: z.boolean().default(false),
  wantUpdates: z.boolean().default(false),
});

const RSVPUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
  // Allow partial updates of any RSVP fields
}).merge(RSVPSchema.partial().omit({ id: true }));

export const rsvpRouter = router({
  // Create a new RSVP
  create: publicProcedure
    .input(RSVPSchema.omit({ id: true }))
    .mutation(async ({ input }) => {
      try {
        // Check if email already exists for this tournament
        const existingQuery = `
          SELECT META().id, r.*
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1 
          AND LOWER(r.email) = LOWER($2)
        `;
        
        const existingResult = await couchbase.query(existingQuery, [
          input.tournamentSlug,
          input.email
        ]);
        
        if (existingResult.rows.length > 0) {
          throw new Error('An RSVP with this email already exists for this tournament');
        }
        
        // Create new RSVP
        const rsvpId = `rsvp::${input.tournamentSlug}::${Date.now()}::${Math.random().toString(36).substr(2, 9)}`;
        const rsvpData = {
          ...input,
          id: rsvpId,
          type: 'rsvp',
          submittedAt: new Date().toISOString(),
          status: 'confirmed',
          // Add document labeling for Couchbase
          docType: 'rsvp',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Store in Couchbase
        await couchbase.upsert(rsvpId, rsvpData);
        
        return {
          success: true,
          rsvp: rsvpData,
          message: 'RSVP submitted successfully!'
        };
      } catch (error) {
        console.error('RSVP creation error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create RSVP');
      }
    }),

  // Get RSVPs for a tournament
  getByTournament: publicProcedure
    .input(z.object({ tournamentSlug: z.string() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT META().id, r.*
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1
          ORDER BY r.submittedAt DESC
        `;
        
        const result = await couchbase.query(query, [input.tournamentSlug]);
        
        return {
          success: true,
          rsvps: result.rows.map((row: any) => row),
          total: result.rows.length
        };
      } catch (error) {
        console.error('RSVP fetch error:', error);
        throw new Error('Failed to fetch RSVPs');
      }
    }),

  // Get RSVP by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const rsvp = await couchbase.get(input.id);
        
        if (!rsvp || rsvp.type !== 'rsvp') {
          throw new Error('RSVP not found');
        }
        
        return {
          success: true,
          rsvp: rsvp
        };
      } catch (error) {
        console.error('RSVP fetch error:', error);
        throw new Error('RSVP not found');
      }
    }),

  // Update RSVP
  update: publicProcedure
    .input(RSVPUpdateSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;
        
        // Get existing RSVP
        const existingRsvp = await couchbase.get(id);
        if (!existingRsvp || existingRsvp.type !== 'rsvp') {
          throw new Error('RSVP not found');
        }
        
        // Merge updates
        const updatedRsvp = {
          ...existingRsvp,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        
        // Update in Couchbase
        await couchbase.upsert(id, updatedRsvp);
        
        return {
          success: true,
          rsvp: updatedRsvp,
          message: 'RSVP updated successfully!'
        };
      } catch (error) {
        console.error('RSVP update error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update RSVP');
      }
    }),

  // Delete RSVP
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Check if RSVP exists
        const existingRsvp = await couchbase.get(input.id);
        if (!existingRsvp || existingRsvp.type !== 'rsvp') {
          throw new Error('RSVP not found');
        }
        
        // Delete from Couchbase
        await couchbase.remove(input.id);
        
        return {
          success: true,
          message: 'RSVP deleted successfully!'
        };
      } catch (error) {
        console.error('RSVP deletion error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete RSVP');
      }
    }),

  // Get RSVP statistics
  getStats: publicProcedure
    .input(z.object({ tournamentSlug: z.string() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT 
            COUNT(*) as totalRSVPs,
            SUM(CASE WHEN r.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedRSVPs,
            SUM(CASE WHEN r.bringingGuests = true THEN r.guestCount ELSE 0 END) as totalGuests,
            SUM(CASE WHEN r.willingToVolunteer = true THEN 1 ELSE 0 END) as volunteers,
            SUM(CASE WHEN r.needsTransportation = true THEN 1 ELSE 0 END) as needsTransportation,
            SUM(CASE WHEN r.canOfferRide = true THEN 1 ELSE 0 END) as canOfferRide
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1
        `;
        
        const result = await couchbase.query(query, [input.tournamentSlug]);
        const stats = result.rows[0] || {};
        
        // Get skill level breakdown
        const skillQuery = `
          SELECT r.skillLevel, COUNT(*) as count
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1
          GROUP BY r.skillLevel
        `;
        
        const skillResult = await couchbase.query(skillQuery, [input.tournamentSlug]);
        const skillLevels = skillResult.rows.reduce((acc, row: any) => {
          acc[row.skillLevel] = row.count;
          return acc;
        }, {});
        
        // Get shirt size breakdown
        const shirtQuery = `
          SELECT r.shirtSize, COUNT(*) as count
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1
          GROUP BY r.shirtSize
        `;
        
        const shirtResult = await couchbase.query(shirtQuery, [input.tournamentSlug]);
        const shirtSizes = shirtResult.rows.reduce((acc, row: any) => {
          acc[row.shirtSize] = row.count;
          return acc;
        }, {});
        
        return {
          success: true,
          stats: {
            ...stats,
            skillLevels,
            shirtSizes,
          }
        };
      } catch (error) {
        console.error('RSVP stats error:', error);
        throw new Error('Failed to fetch RSVP statistics');
      }
    }),

  // Export RSVPs to CSV data
  export: publicProcedure
    .input(z.object({ tournamentSlug: z.string() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT META().id, r.*
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1
          ORDER BY r.submittedAt DESC
        `;
        
        const result = await couchbase.query(query, [input.tournamentSlug]);
        
        return {
          success: true,
          rsvps: result.rows,
          headers: [
            'Name', 'Email', 'Phone', 'Participation Type', 'Team Name', 'Preferred Partner',
            'Skill Level', 'Games Attending', 'T-Shirt Size', 'Dietary Restrictions',
            'Needs Transportation', 'Can Offer Ride', 'Is Designated Driver',
            'Willing to Volunteer', 'Bringing Guests', 'Guest Count', 'Submitted At', 'Status'
          ]
        };
      } catch (error) {
        console.error('RSVP export error:', error);
        throw new Error('Failed to export RSVPs');
      }
    }),

  // Check-in attendee
  checkIn: publicProcedure
    .input(z.object({
      id: z.string(),
      method: z.enum(['qr', 'manual', 'self_service']).default('manual'),
      autoAssignTeam: z.boolean().optional(),
      isLateArrival: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get the RSVP
        const rsvp = await couchbase.get(input.id);
        if (!rsvp) {
          throw new Error('RSVP not found');
        }

        // Check if already checked in
        if (rsvp.status === 'checked_in') {
          throw new Error('Already checked in');
        }

        // Prepare check-in data
        const checkInData: any = {
          ...rsvp,
          status: 'checked_in',
          checkedInAt: new Date().toISOString(),
          checkInMethod: input.method,
          isLateArrival: input.isLateArrival,
        };

        // Auto-assign team if requested
        let teamAssigned = false;
        let teamName = rsvp.teamName;
        let tableNumber = null;

        if (input.autoAssignTeam && !rsvp.teamId && rsvp.participationType === 'player') {
          // Find or create team
          const teamResult = await findOrCreateTeam(rsvp.tournamentSlug, rsvp);
          if (teamResult) {
            checkInData.teamId = teamResult.id;
            checkInData.teamName = teamResult.name;
            teamAssigned = true;
            teamName = teamResult.name;
            tableNumber = teamResult.tableNumber;
          }
        }

        // Update RSVP
        await couchbase.upsert(input.id, checkInData);

        return {
          success: true,
          teamAssigned,
          teamName,
          tableNumber,
          message: 'Check-in successful',
        };
      } catch (error) {
        console.error('Check-in error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to check in');
      }
    }),

  // Get check-in status
  getCheckInStatus: publicProcedure
    .input(z.object({ tournamentSlug: z.string() }))
    .query(async ({ input }) => {
      try {
        const query = `
          SELECT META().id, r.*
          FROM \`beer-olympics\` r
          WHERE r.type = 'rsvp' 
          AND r.tournamentSlug = $1
          ORDER BY r.fullName ASC
        `;
        
        const result = await couchbase.query(query, [input.tournamentSlug]);
        
        // Calculate statistics
        const attendees = result.rows.map((row: any) => ({
          id: row.id,
          fullName: row.fullName,
          email: row.email,
          phone: row.phone,
          participationType: row.participationType || 'player',
          teamName: row.teamName,
          teamId: row.teamId,
          checkedInAt: row.checkedInAt,
          checkInMethod: row.checkInMethod,
          status: row.status || 'pending',
          qrCode: row.qrCode,
          preferredPartner: row.preferredPartner,
          shirtSize: row.shirtSize,
          isLateArrival: row.isLateArrival,
        }));

        const stats = {
          totalRSVPs: attendees.length,
          checkedIn: attendees.filter((a: any) => a.status === 'checked_in').length,
          waitlist: attendees.filter((a: any) => a.status === 'waitlist').length,
          noShows: attendees.filter((a: any) => a.status === 'no_show').length,
          capacity: 64, // Default capacity
          teamsFormed: Math.floor(attendees.filter((a: any) => a.status === 'checked_in' && a.teamId).length / 2),
          lateArrivals: attendees.filter((a: any) => a.isLateArrival).length,
        };

        return {
          success: true,
          attendees,
          stats,
        };
      } catch (error) {
        console.error('Get check-in status error:', error);
        throw new Error('Failed to get check-in status');
      }
    }),

  // Manage waitlist
  manageWaitlist: publicProcedure
    .input(z.object({
      tournamentSlug: z.string(),
      action: z.enum(['add', 'remove', 'promote']),
      attendeeId: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const rsvp = await couchbase.get(input.attendeeId);
        if (!rsvp) {
          throw new Error('RSVP not found');
        }

        let updatedData: any = { ...rsvp };
        let message = '';

        switch (input.action) {
          case 'add':
            updatedData.status = 'waitlist';
            updatedData.waitlistedAt = new Date().toISOString();
            message = 'Added to waitlist';
            break;
          case 'remove':
            updatedData.status = 'cancelled';
            message = 'Removed from waitlist';
            break;
          case 'promote':
            updatedData.status = 'pending';
            delete updatedData.waitlistedAt;
            message = 'Promoted from waitlist';
            break;
        }

        await couchbase.upsert(input.attendeeId, updatedData);

        return {
          success: true,
          message,
        };
      } catch (error) {
        console.error('Waitlist management error:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to manage waitlist');
      }
    }),
});

// Helper function to find or create team
async function findOrCreateTeam(tournamentSlug: string, rsvp: any) {
  try {
    // Query for incomplete teams
    const query = `
      SELECT META().id, t.*
      FROM \`beer-olympics\` t
      WHERE t.type = 'team'
      AND t.tournamentSlug = $1
      AND ARRAY_LENGTH(t.players) < 2
      ORDER BY t.createdAt ASC
    `;
    
    const result = await couchbase.query(query, [tournamentSlug]);
    
    if (result.rows.length > 0) {
      // Found incomplete team
      const team = result.rows[0];
      
      // Update team with new player
      const updatedTeam = {
        ...team,
        players: [...(team.players || []), rsvp.id],
      };
      
      await couchbase.upsert(team.id, updatedTeam);
      
      return {
        id: team.id,
        name: team.name || `Team ${team.number}`,
        tableNumber: team.tableNumber || Math.ceil(team.number / 2),
      };
    } else {
      // Create new team
      const teamCountQuery = `
        SELECT COUNT(*) as count
        FROM \`beer-olympics\` t
        WHERE t.type = 'team'
        AND t.tournamentSlug = $1
      `;
      
      const countResult = await couchbase.query(teamCountQuery, [tournamentSlug]);
      const teamNumber = (countResult.rows[0]?.count || 0) + 1;
      
      const newTeam = {
        type: 'team',
        tournamentSlug,
        name: `Team ${teamNumber}`,
        number: teamNumber,
        players: [rsvp.id],
        skillLevel: rsvp.skillLevel,
        tableNumber: Math.ceil(teamNumber / 2),
        createdAt: new Date().toISOString(),
      };
      
      const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await couchbase.upsert(teamId, newTeam);
      
      return {
        id: teamId,
        name: newTeam.name,
        tableNumber: newTeam.tableNumber,
      };
    }
  } catch (error) {
    console.error('Failed to find or create team:', error);
    return null;
  }
}