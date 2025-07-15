import { EventEmitter } from 'events';
export class RoomManager extends EventEmitter {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "rooms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "memberRooms", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        }); // member -> rooms
        Object.defineProperty(this, "subscriptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "eventFilters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    // Create or get a room
    createRoom(config) {
        const existing = this.rooms.get(config.id);
        if (existing) {
            return existing;
        }
        const room = {
            id: config.id,
            name: config.name,
            type: config.type,
            members: new Set(),
            metadata: config.metadata || {},
            created: Date.now(),
            lastActivity: Date.now(),
        };
        this.rooms.set(room.id, room);
        this.emit('room:created', room);
        return room;
    }
    // Get room by ID
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    // List all rooms
    listRooms(filter) {
        let rooms = Array.from(this.rooms.values());
        if (filter) {
            if (filter.type) {
                rooms = rooms.filter(r => r.type === filter.type);
            }
            if (filter.hasMembers !== undefined) {
                rooms = rooms.filter(r => filter.hasMembers ? r.members.size > 0 : r.members.size === 0);
            }
            if (filter.search) {
                const search = filter.search.toLowerCase();
                rooms = rooms.filter(r => r.name.toLowerCase().includes(search) ||
                    r.id.toLowerCase().includes(search));
            }
        }
        return rooms;
    }
    // Join a member to a room
    joinRoom(roomId, memberId, memberInfo) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }
        // Add member to room
        room.members.add(memberId);
        room.lastActivity = Date.now();
        // Track member's rooms
        if (!this.memberRooms.has(memberId)) {
            this.memberRooms.set(memberId, new Set());
        }
        this.memberRooms.get(memberId).add(roomId);
        // Emit join event
        this.emit('room:member:joined', {
            room: roomId,
            member: memberId,
            info: memberInfo,
            timestamp: Date.now(),
        });
        // Broadcast to room
        this.broadcastToRoom(roomId, 'member:joined', {
            memberId,
            memberInfo,
        }, memberId);
        return true;
    }
    // Leave a room
    leaveRoom(roomId, memberId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.members.has(memberId)) {
            return false;
        }
        // Remove member from room
        room.members.delete(memberId);
        room.lastActivity = Date.now();
        // Update member's rooms
        const memberRooms = this.memberRooms.get(memberId);
        if (memberRooms) {
            memberRooms.delete(roomId);
            if (memberRooms.size === 0) {
                this.memberRooms.delete(memberId);
            }
        }
        // Emit leave event
        this.emit('room:member:left', {
            room: roomId,
            member: memberId,
            timestamp: Date.now(),
        });
        // Broadcast to room
        this.broadcastToRoom(roomId, 'member:left', {
            memberId,
        }, memberId);
        // Clean up empty rooms (except global)
        if (room.members.size === 0 && room.type !== 'global') {
            this.deleteRoom(roomId);
        }
        return true;
    }
    // Get rooms for a member
    getMemberRooms(memberId) {
        const roomIds = this.memberRooms.get(memberId);
        if (!roomIds) {
            return [];
        }
        return Array.from(roomIds)
            .map(id => this.rooms.get(id))
            .filter(room => room !== undefined);
    }
    // Subscribe to room events
    subscribe(roomId, events, callback) {
        const eventSet = new Set(Array.isArray(events) ? events : [events]);
        const subscription = {
            roomId,
            events: eventSet,
            callback,
        };
        if (!this.subscriptions.has(roomId)) {
            this.subscriptions.set(roomId, []);
        }
        this.subscriptions.get(roomId).push(subscription);
        // Return unsubscribe function
        return () => {
            const subs = this.subscriptions.get(roomId);
            if (subs) {
                const index = subs.indexOf(subscription);
                if (index !== -1) {
                    subs.splice(index, 1);
                }
            }
        };
    }
    // Broadcast event to room
    broadcastToRoom(roomId, event, data, excludeMember) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        room.lastActivity = Date.now();
        const roomEvent = {
            room: roomId,
            event,
            data,
            sender: excludeMember,
            timestamp: Date.now(),
        };
        // Apply event filters if any
        const filter = this.eventFilters.get(roomId);
        if (filter && !filter(roomEvent)) {
            return; // Event filtered out
        }
        // Notify subscribers
        const subscriptions = this.subscriptions.get(roomId);
        if (subscriptions) {
            for (const sub of subscriptions) {
                if (sub.events.has(event) || sub.events.has('*')) {
                    sub.callback(roomEvent);
                }
            }
        }
        // Emit for monitoring
        this.emit('room:event', roomEvent);
    }
    // Send targeted message to specific members
    sendToMembers(roomId, memberIds, event, data) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const targetMembers = memberIds.filter(id => room.members.has(id));
        if (targetMembers.length > 0) {
            this.emit('room:targeted', {
                room: roomId,
                targets: targetMembers,
                event,
                data,
                timestamp: Date.now(),
            });
        }
    }
    // Set event filter for a room
    setEventFilter(roomId, filter) {
        this.eventFilters.set(roomId, filter);
    }
    // Remove event filter
    removeEventFilter(roomId) {
        this.eventFilters.delete(roomId);
    }
    // Delete a room
    deleteRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        // Remove all members
        for (const memberId of room.members) {
            this.leaveRoom(roomId, memberId);
        }
        // Clean up
        this.rooms.delete(roomId);
        this.subscriptions.delete(roomId);
        this.eventFilters.delete(roomId);
        this.emit('room:deleted', roomId);
        return true;
    }
    // Get room statistics
    getRoomStats(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const subscriptions = this.subscriptions.get(roomId);
        return {
            memberCount: room.members.size,
            subscriptionCount: subscriptions ? subscriptions.length : 0,
            lastActivity: room.lastActivity,
            uptime: Date.now() - room.created,
        };
    }
    // Clean up inactive rooms
    cleanupInactiveRooms(maxInactiveTime = 3600000) {
        const now = Date.now();
        const toDelete = [];
        for (const [id, room] of this.rooms.entries()) {
            if (room.type !== 'global' && // Don't delete global rooms
                room.members.size === 0 &&
                now - room.lastActivity > maxInactiveTime) {
                toDelete.push(id);
            }
        }
        for (const id of toDelete) {
            this.deleteRoom(id);
        }
        return toDelete.length;
    }
}
// Tournament-specific room utilities
export class TournamentRoomManager {
    constructor(roomManager) {
        Object.defineProperty(this, "roomManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.roomManager = roomManager;
    }
    // Create tournament room structure
    createTournamentRooms(tournamentId, config) {
        // Main tournament room
        const main = this.roomManager.createRoom({
            id: `tournament:${tournamentId}`,
            name: config.name,
            type: 'tournament',
            metadata: {
                teams: config.teams,
                matchCount: config.matches.length,
            },
        });
        // Match rooms
        const matches = config.matches.map(matchId => this.roomManager.createRoom({
            id: `match:${matchId}`,
            name: `Match ${matchId}`,
            type: 'match',
            metadata: {
                tournamentId,
                matchId,
            },
        }));
        // Admin room
        const admin = this.roomManager.createRoom({
            id: `tournament:${tournamentId}:admin`,
            name: `${config.name} Admin`,
            type: 'private',
            metadata: {
                tournamentId,
                adminOnly: true,
            },
        });
        return { main, matches, admin };
    }
    // Auto-join team to relevant rooms
    autoJoinTeamRooms(tournamentId, teamId, matchIds) {
        // Join main tournament room
        this.roomManager.joinRoom(`tournament:${tournamentId}`, teamId, {
            role: 'participant',
        });
        // Join match rooms
        for (const matchId of matchIds) {
            this.roomManager.joinRoom(`match:${matchId}`, teamId, {
                role: 'participant',
            });
        }
    }
    // Broadcast tournament-wide event
    broadcastTournamentEvent(tournamentId, event, data, options) {
        // Broadcast to main room
        if (!options?.adminOnly) {
            this.roomManager.broadcastToRoom(`tournament:${tournamentId}`, event, data);
        }
        // Broadcast to admin room
        this.roomManager.broadcastToRoom(`tournament:${tournamentId}:admin`, event, data);
        // Broadcast to match rooms if requested
        if (options?.includeMatches) {
            const mainRoom = this.roomManager.getRoom(`tournament:${tournamentId}`);
            if (mainRoom?.metadata.matches) {
                for (const matchId of mainRoom.metadata.matches) {
                    this.roomManager.broadcastToRoom(`match:${matchId}`, event, data);
                }
            }
        }
    }
    // Get tournament activity summary
    getTournamentActivity(tournamentId) {
        const rooms = this.roomManager.listRooms({ search: tournamentId });
        let totalMembers = 0;
        let activeRooms = 0;
        for (const room of rooms) {
            totalMembers += room.members.size;
            if (room.members.size > 0) {
                activeRooms++;
            }
        }
        return {
            totalMembers,
            activeRooms,
            recentEvents: 0, // Would need event tracking
        };
    }
}
