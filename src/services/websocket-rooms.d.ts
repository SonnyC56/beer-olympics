import { EventEmitter } from 'events';
export interface Room {
    id: string;
    name: string;
    type: 'tournament' | 'match' | 'global' | 'private' | 'presence';
    members: Set<string>;
    metadata: Record<string, any>;
    created: number;
    lastActivity: number;
}
export interface RoomMember {
    id: string;
    name?: string;
    role?: 'admin' | 'moderator' | 'participant' | 'spectator';
    joinedAt: number;
    metadata?: Record<string, any>;
}
export interface RoomEvent {
    room: string;
    event: string;
    data: any;
    sender?: string;
    timestamp: number;
}
export interface RoomSubscription {
    roomId: string;
    events: Set<string>;
    callback: (event: RoomEvent) => void;
}
export declare class RoomManager extends EventEmitter {
    private rooms;
    private memberRooms;
    private subscriptions;
    private eventFilters;
    createRoom(config: {
        id: string;
        name: string;
        type: Room['type'];
        metadata?: Record<string, any>;
    }): Room;
    getRoom(roomId: string): Room | undefined;
    listRooms(filter?: {
        type?: Room['type'];
        hasMembers?: boolean;
        search?: string;
    }): Room[];
    joinRoom(roomId: string, memberId: string, memberInfo?: Partial<RoomMember>): boolean;
    leaveRoom(roomId: string, memberId: string): boolean;
    getMemberRooms(memberId: string): Room[];
    subscribe(roomId: string, events: string | string[], callback: (event: RoomEvent) => void): () => void;
    broadcastToRoom(roomId: string, event: string, data: any, excludeMember?: string): void;
    sendToMembers(roomId: string, memberIds: string[], event: string, data: any): void;
    setEventFilter(roomId: string, filter: (event: RoomEvent) => boolean): void;
    removeEventFilter(roomId: string): void;
    deleteRoom(roomId: string): boolean;
    getRoomStats(roomId: string): {
        memberCount: number;
        subscriptionCount: number;
        lastActivity: number;
        uptime: number;
        eventRate?: number;
    } | null;
    cleanupInactiveRooms(maxInactiveTime?: number): number;
}
export declare class TournamentRoomManager {
    private roomManager;
    constructor(roomManager: RoomManager);
    createTournamentRooms(tournamentId: string, config: {
        name: string;
        teams: string[];
        matches: string[];
    }): {
        main: Room;
        matches: Room[];
        admin: Room;
    };
    autoJoinTeamRooms(tournamentId: string, teamId: string, matchIds: string[]): void;
    broadcastTournamentEvent(tournamentId: string, event: string, data: any, options?: {
        includeMatches?: boolean;
        adminOnly?: boolean;
    }): void;
    getTournamentActivity(tournamentId: string): {
        totalMembers: number;
        activeRooms: number;
        recentEvents: number;
    };
}
