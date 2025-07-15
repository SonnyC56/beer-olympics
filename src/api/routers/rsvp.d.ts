export declare const rsvpRouter: import("@trpc/server/unstable-core-do-not-import").BuiltRouter<{
    ctx: import("../trpc").Context;
    meta: object;
    errorShape: import("@trpc/server/unstable-core-do-not-import").DefaultErrorShape;
    transformer: false;
}, import("@trpc/server/unstable-core-do-not-import").DecorateCreateRouterOptions<{
    create: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentSlug: string;
            email: string;
            fullName: string;
            phone: string;
            shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
            agreeToTerms: boolean;
            teamName?: string | undefined;
            favoriteGame?: string | undefined;
            participationType?: "player" | "spectator" | "designated_driver" | undefined;
            preferredPartner?: string | undefined;
            skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
            attendingGames?: string[] | undefined;
            dietaryRestrictions?: string | undefined;
            victoryDance?: string | undefined;
            specialTalent?: string | undefined;
            motivationalQuote?: string | undefined;
            needsTransportation?: boolean | undefined;
            canOfferRide?: boolean | undefined;
            isDesignatedDriver?: boolean | undefined;
            willingToVolunteer?: boolean | undefined;
            bringingGuests?: boolean | undefined;
            guestCount?: number | undefined;
            additionalRequests?: string | undefined;
            agreeToPhotos?: boolean | undefined;
            wantUpdates?: boolean | undefined;
        };
        output: {
            success: boolean;
            rsvp: {
                id: string;
                type: string;
                submittedAt: string;
                status: string;
                docType: string;
                createdAt: string;
                updatedAt: string;
                tournamentSlug: string;
                email: string;
                fullName: string;
                phone: string;
                participationType: "player" | "spectator" | "designated_driver";
                shirtSize: "xs" | "s" | "m" | "l" | "xl" | "xxl";
                needsTransportation: boolean;
                canOfferRide: boolean;
                isDesignatedDriver: boolean;
                willingToVolunteer: boolean;
                bringingGuests: boolean;
                guestCount: number;
                agreeToTerms: boolean;
                agreeToPhotos: boolean;
                wantUpdates: boolean;
                teamName?: string | undefined;
                favoriteGame?: string | undefined;
                preferredPartner?: string | undefined;
                skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
                attendingGames?: string[] | undefined;
                dietaryRestrictions?: string | undefined;
                victoryDance?: string | undefined;
                specialTalent?: string | undefined;
                motivationalQuote?: string | undefined;
                additionalRequests?: string | undefined;
            };
            message: string;
        };
        meta: object;
    }>;
    getByTournament: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentSlug: string;
        };
        output: {
            success: boolean;
            rsvps: any[];
            total: number;
        };
        meta: object;
    }>;
    getById: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            id: string;
        };
        output: {
            success: boolean;
            rsvp: any;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            status?: "pending" | "confirmed" | "cancelled" | undefined;
            tournamentSlug?: string | undefined;
            email?: string | undefined;
            teamName?: string | undefined;
            favoriteGame?: string | undefined;
            fullName?: string | undefined;
            phone?: string | undefined;
            participationType?: "player" | "spectator" | "designated_driver" | undefined;
            preferredPartner?: string | undefined;
            skillLevel?: "legendary" | "beginner" | "intermediate" | "advanced" | undefined;
            attendingGames?: string[] | undefined;
            dietaryRestrictions?: string | undefined;
            shirtSize?: "xs" | "s" | "m" | "l" | "xl" | "xxl" | undefined;
            victoryDance?: string | undefined;
            specialTalent?: string | undefined;
            motivationalQuote?: string | undefined;
            needsTransportation?: boolean | undefined;
            canOfferRide?: boolean | undefined;
            isDesignatedDriver?: boolean | undefined;
            willingToVolunteer?: boolean | undefined;
            bringingGuests?: boolean | undefined;
            guestCount?: number | undefined;
            additionalRequests?: string | undefined;
            agreeToTerms?: boolean | undefined;
            agreeToPhotos?: boolean | undefined;
            wantUpdates?: boolean | undefined;
        };
        output: {
            success: boolean;
            rsvp: any;
            message: string;
        };
        meta: object;
    }>;
    delete: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: object;
    }>;
    getStats: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentSlug: string;
        };
        output: {
            success: boolean;
            stats: any;
        };
        meta: object;
    }>;
    export: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentSlug: string;
        };
        output: {
            success: boolean;
            rsvps: any[];
            headers: string[];
        };
        meta: object;
    }>;
    checkIn: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            id: string;
            method?: "manual" | "qr" | "self_service" | undefined;
            autoAssignTeam?: boolean | undefined;
            isLateArrival?: boolean | undefined;
        };
        output: {
            success: boolean;
            teamAssigned: boolean;
            teamName: any;
            tableNumber: any;
            message: string;
        };
        meta: object;
    }>;
    getCheckInStatus: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            tournamentSlug: string;
        };
        output: {
            success: boolean;
            attendees: {
                id: any;
                fullName: any;
                email: any;
                phone: any;
                participationType: any;
                teamName: any;
                teamId: any;
                checkedInAt: any;
                checkInMethod: any;
                status: any;
                qrCode: any;
                preferredPartner: any;
                shirtSize: any;
                isLateArrival: any;
            }[];
            stats: {
                totalRSVPs: number;
                checkedIn: number;
                waitlist: number;
                noShows: number;
                capacity: number;
                teamsFormed: number;
                lateArrivals: number;
            };
        };
        meta: object;
    }>;
    manageWaitlist: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            tournamentSlug: string;
            action: "remove" | "add" | "promote";
            attendeeId: string;
        };
        output: {
            success: boolean;
            message: string;
        };
        meta: object;
    }>;
}>>;
