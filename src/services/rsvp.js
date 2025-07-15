import { trpcClient } from '../utils/trpc';
import { realtimeService } from './realtime';
const CURRENT_RSVP_KEY = 'beer-olympics-current-rsvp';
// Enhanced RSVP functions using tRPC backend
export async function getTournamentRSVPs(tournamentSlug) {
    try {
        const result = await trpcClient.rsvp.getByTournament.query({ tournamentSlug });
        return result.success ? result.rsvps : [];
    }
    catch (error) {
        console.error('Failed to load RSVPs:', error);
        // Fallback to mock data for development
        return [];
    }
}
export async function getRSVPById(id) {
    try {
        const result = await trpcClient.rsvp.getById.query({ id });
        return result.success ? result.rsvp : null;
    }
    catch (error) {
        console.error('Failed to load RSVP:', error);
        return null;
    }
}
export async function saveRSVP(rsvpData) {
    try {
        const result = await trpcClient.rsvp.create.mutate(rsvpData);
        if (result.success) {
            // Clear progress after successful submission
            clearRSVPProgress();
            // Emit real-time event
            try {
                const channel = realtimeService.subscribe(`tournament-${result.rsvp.tournamentSlug}`);
                if (channel) {
                    channel.trigger('client-rsvp-submitted', {
                        tournamentSlug: result.rsvp.tournamentSlug,
                        rsvp: result.rsvp,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            catch (rtError) {
                console.warn('Failed to emit real-time RSVP event:', rtError);
            }
            return result.rsvp;
        }
        throw new Error(result.message || 'Failed to save RSVP');
    }
    catch (error) {
        console.error('Failed to save RSVP:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to save RSVP');
    }
}
export async function updateRSVP(id, updates) {
    try {
        const result = await trpcClient.rsvp.update.mutate({ id, ...updates });
        return result.success ? result.rsvp : null;
    }
    catch (error) {
        console.error('Failed to update RSVP:', error);
        return null;
    }
}
export async function deleteRSVP(id) {
    try {
        const result = await trpcClient.rsvp.delete.mutate({ id });
        return result.success;
    }
    catch (error) {
        console.error('Failed to delete RSVP:', error);
        return false;
    }
}
// Legacy localStorage functions for backward compatibility
export function getAllRSVPs() {
    try {
        const stored = localStorage.getItem('beer-olympics-rsvps');
        return stored ? JSON.parse(stored) : [];
    }
    catch (error) {
        console.error('Failed to load RSVPs from localStorage:', error);
        return [];
    }
}
export function getRSVPByEmail(email, tournamentSlug) {
    return getTournamentRSVPs(tournamentSlug).then(rsvps => rsvps.find(rsvp => rsvp.email.toLowerCase() === email.toLowerCase()) || null);
}
// Save current RSVP form progress
export function saveRSVPProgress(formData, tournamentSlug) {
    const progress = {
        formData,
        tournamentSlug,
        savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_RSVP_KEY, JSON.stringify(progress));
}
// Get current RSVP form progress
export function getRSVPProgress(tournamentSlug) {
    try {
        const stored = localStorage.getItem(CURRENT_RSVP_KEY);
        if (!stored)
            return null;
        const progress = JSON.parse(stored);
        // Only return if it's for the same tournament and saved within last 24 hours
        if (progress.tournamentSlug === tournamentSlug) {
            const savedDate = new Date(progress.savedAt);
            const now = new Date();
            const hoursSinceSaved = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60);
            if (hoursSinceSaved < 24) {
                return progress.formData;
            }
        }
        // Clear old progress
        localStorage.removeItem(CURRENT_RSVP_KEY);
        return null;
    }
    catch (error) {
        console.error('Failed to load RSVP progress:', error);
        return null;
    }
}
// Clear RSVP progress
export function clearRSVPProgress() {
    localStorage.removeItem(CURRENT_RSVP_KEY);
}
export async function checkInAttendee(attendeeId, method = 'manual', options) {
    try {
        const result = await trpcClient.rsvp.checkIn.mutate({
            id: attendeeId,
            method,
            ...options
        });
        return result;
    }
    catch (error) {
        console.error('Failed to check in attendee:', error);
        return { success: false, message: 'Check-in failed' };
    }
}
export async function getCheckInStatus(tournamentSlug) {
    try {
        const result = await trpcClient.rsvp.getCheckInStatus.query({ tournamentSlug });
        return result;
    }
    catch (error) {
        console.error('Failed to get check-in status:', error);
        return {
            success: false,
            attendees: [],
            stats: {
                totalRSVPs: 0,
                checkedIn: 0,
                waitlist: 0,
                noShows: 0,
                capacity: 64,
                teamsFormed: 0,
                lateArrivals: 0
            }
        };
    }
}
export async function generateCheckInQRCode(attendeeId) {
    // Generate QR code data for check-in
    const qrData = JSON.stringify({
        attendeeId,
        timestamp: Date.now(),
        type: 'checkin'
    });
    // This would typically call a QR code generation service
    // For now, return the data that would be encoded
    return qrData;
}
export async function handleWaitlist(tournamentSlug, action, attendeeId) {
    try {
        const result = await trpcClient.rsvp.manageWaitlist.mutate({
            tournamentSlug,
            action,
            attendeeId
        });
        return result;
    }
    catch (error) {
        console.error('Failed to manage waitlist:', error);
        return { success: false, message: 'Waitlist operation failed' };
    }
}
// Export RSVPs to CSV
export async function exportRSVPsToCSV(tournamentSlug) {
    try {
        const result = await trpcClient.rsvp.export.query({ tournamentSlug });
        if (!result.success || result.rsvps.length === 0) {
            return '';
        }
        const { rsvps, headers } = result;
        // Create CSV rows
        const rows = rsvps.map((rsvp) => [
            rsvp.fullName,
            rsvp.email,
            rsvp.phone,
            rsvp.participationType || 'player',
            rsvp.teamName || 'None',
            rsvp.preferredPartner || 'None',
            rsvp.skillLevel || 'N/A',
            rsvp.attendingGames?.join('; ') || '',
            rsvp.shirtSize?.toUpperCase() || '',
            rsvp.dietaryRestrictions || 'None',
            rsvp.needsTransportation ? 'Yes' : 'No',
            rsvp.canOfferRide ? 'Yes' : 'No',
            rsvp.isDesignatedDriver ? 'Yes' : 'No',
            rsvp.willingToVolunteer ? 'Yes' : 'No',
            rsvp.bringingGuests ? 'Yes' : 'No',
            rsvp.guestCount?.toString() || '0',
            new Date(rsvp.submittedAt).toLocaleString(),
            rsvp.status
        ]);
        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
        ].join('\n');
        return csvContent;
    }
    catch (error) {
        console.error('Failed to export RSVPs:', error);
        return '';
    }
}
// Get RSVP statistics for a tournament
export async function getRSVPStats(tournamentSlug) {
    try {
        const result = await trpcClient.rsvp.getStats.query({ tournamentSlug });
        return result.success ? result.stats : {
            totalRSVPs: 0,
            confirmedRSVPs: 0,
            totalGuests: 0,
            skillLevels: { beginner: 0, intermediate: 0, advanced: 0, legendary: 0 },
            volunteers: 0,
            needsTransportation: 0,
            canOfferRide: 0,
            shirtSizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0 },
        };
    }
    catch (error) {
        console.error('Failed to load RSVP stats:', error);
        return {
            totalRSVPs: 0,
            confirmedRSVPs: 0,
            totalGuests: 0,
            skillLevels: { beginner: 0, intermediate: 0, advanced: 0, legendary: 0 },
            volunteers: 0,
            needsTransportation: 0,
            canOfferRide: 0,
            shirtSizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0 },
        };
    }
}
