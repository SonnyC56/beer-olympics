export interface RSVPData {
    id: string;
    tournamentSlug: string;
    fullName: string;
    email: string;
    phone: string;
    participationType: 'player' | 'spectator' | 'designated_driver';
    preferredPartner?: string;
    teamName?: string;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'legendary';
    attendingGames?: string[];
    dietaryRestrictions?: string;
    shirtSize: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
    favoriteGame?: string;
    victoryDance?: string;
    specialTalent?: string;
    motivationalQuote?: string;
    needsTransportation: boolean;
    canOfferRide: boolean;
    isDesignatedDriver: boolean;
    willingToVolunteer: boolean;
    bringingGuests: boolean;
    guestCount: number;
    additionalRequests?: string;
    agreeToTerms: boolean;
    agreeToPhotos: boolean;
    wantUpdates: boolean;
    submittedAt: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    type?: string;
    docType?: string;
    createdAt?: string;
    updatedAt?: string;
}
export declare function getTournamentRSVPs(tournamentSlug: string): Promise<RSVPData[]>;
export declare function getRSVPById(id: string): Promise<RSVPData | null>;
export declare function saveRSVP(rsvpData: Omit<RSVPData, 'id' | 'submittedAt' | 'status' | 'type' | 'docType' | 'createdAt' | 'updatedAt'>): Promise<RSVPData>;
export declare function updateRSVP(id: string, updates: Partial<RSVPData>): Promise<RSVPData | null>;
export declare function deleteRSVP(id: string): Promise<boolean>;
export declare function getAllRSVPs(): RSVPData[];
export declare function getRSVPByEmail(email: string, tournamentSlug: string): Promise<RSVPData | null>;
export declare function saveRSVPProgress(formData: any, tournamentSlug: string): void;
export declare function getRSVPProgress(tournamentSlug: string): any | null;
export declare function clearRSVPProgress(): void;
export interface CheckInData {
    id: string;
    method: 'qr' | 'manual' | 'self_service';
    checkedInAt: string;
    checkedInBy?: string;
    autoAssignedTeam?: boolean;
    teamId?: string;
    teamName?: string;
    tableNumber?: number;
    isLateArrival?: boolean;
}
export declare function checkInAttendee(attendeeId: string, method?: 'qr' | 'manual' | 'self_service', options?: {
    autoAssignTeam?: boolean;
    isLateArrival?: boolean;
}): Promise<{
    success: boolean;
    teamAssigned?: boolean;
    teamName?: string;
    tableNumber?: number;
    message?: string;
}>;
export declare function getCheckInStatus(tournamentSlug: string): Promise<{
    success: boolean;
    attendees: any[];
    stats: {
        totalRSVPs: number;
        checkedIn: number;
        waitlist: number;
        noShows: number;
        capacity: number;
        teamsFormed: number;
        lateArrivals: number;
    };
}>;
export declare function generateCheckInQRCode(attendeeId: string): Promise<string>;
export declare function handleWaitlist(tournamentSlug: string, action: 'add' | 'remove' | 'promote', attendeeId: string): Promise<{
    success: boolean;
    position?: number;
    message?: string;
}>;
export declare function exportRSVPsToCSV(tournamentSlug: string): Promise<string>;
export declare function getRSVPStats(tournamentSlug: string): Promise<any>;
