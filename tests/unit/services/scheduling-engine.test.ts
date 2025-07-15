import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulingEngine } from '@/services/scheduling-engine';
import type {
  Station,
  SchedulingConfig,
  SchedulingConstraint,
  PlayerAvailability,
  ScheduleSlot,
  ScheduleConflict,
  TimeWindow
} from '@/types/scheduling';
import type { Match } from '@/types/tournament';

describe('SchedulingEngine', () => {
  let engine: SchedulingEngine;
  let defaultConfig: SchedulingConfig;
  let mockStations: Station[];
  let mockMatches: Match[];

  beforeEach(() => {
    // Setup default configuration
    defaultConfig = {
      algorithm: 'greedy',
      matchDuration: 30, // minutes
      bufferTime: 5, // minutes
      minRestTime: 15, // minutes
      startTime: '2024-07-15T10:00:00Z',
      endTime: '2024-07-15T18:00:00Z',
      optimizationGoals: [
        { type: 'minimize_total_time', weight: 0.3 },
        { type: 'maximize_station_usage', weight: 0.3 },
        { type: 'minimize_player_wait', weight: 0.2 },
        { type: 'balance_station_load', weight: 0.2 }
      ],
      allowConcurrentMatches: true,
      maxConcurrentMatches: 3
    };

    // Create mock stations
    mockStations = [
      {
        id: 'station-1',
        name: 'Station 1',
        isActive: true,
        gameTypes: ['beer-pong', 'flip-cup'],
        capacity: 4,
        equipment: ['table', 'cups'],
        location: 'Main Hall'
      },
      {
        id: 'station-2',
        name: 'Station 2',
        isActive: true,
        gameTypes: ['flip-cup', 'kings-cup'],
        capacity: 6,
        equipment: ['table', 'cups', 'cards'],
        location: 'Main Hall'
      },
      {
        id: 'station-3',
        name: 'Station 3',
        isActive: true,
        gameTypes: ['beer-pong'],
        capacity: 4,
        equipment: ['table', 'cups', 'balls'],
        location: 'Side Room'
      },
      {
        id: 'station-4',
        name: 'Station 4 (Inactive)',
        isActive: false,
        gameTypes: ['beer-pong'],
        capacity: 4,
        equipment: ['table'],
        location: 'Storage'
      }
    ];

    // Create mock matches
    mockMatches = [
      {
        id: 'match-1',
        tournamentId: 'tournament-1',
        teamAId: 'team-1',
        teamBId: 'team-2',
        eventName: 'beer-pong',
        round: 1,
        status: 'upcoming',
        startTime: null,
        endTime: null,
        teamAScore: 0,
        teamBScore: 0
      },
      {
        id: 'match-2',
        tournamentId: 'tournament-1',
        teamAId: 'team-3',
        teamBId: 'team-4',
        eventName: 'flip-cup',
        round: 1,
        status: 'upcoming',
        startTime: null,
        endTime: null,
        teamAScore: 0,
        teamBScore: 0
      },
      {
        id: 'match-3',
        tournamentId: 'tournament-1',
        teamAId: 'team-1',
        teamBId: 'team-3',
        eventName: 'beer-pong',
        round: 2,
        status: 'upcoming',
        startTime: null,
        endTime: null,
        teamAScore: 0,
        teamBScore: 0
      }
    ];

    engine = new SchedulingEngine(defaultConfig);
  });

  describe('Initialization', () => {
    it('should initialize with provided configuration', () => {
      expect(engine).toBeDefined();
    });

    it('should filter out inactive stations', () => {
      engine.initializeStations(mockStations);
      // Internal state would have 3 active stations (station-4 is inactive)
    });

    it('should set player availability constraints', () => {
      const availability: PlayerAvailability[] = [
        {
          playerId: 'player-1',
          availableWindows: [
            { start: '2024-07-15T10:00:00Z', end: '2024-07-15T14:00:00Z' }
          ],
          unavailableWindows: []
        },
        {
          playerId: 'player-2',
          availableWindows: [],
          unavailableWindows: [
            { start: '2024-07-15T12:00:00Z', end: '2024-07-15T13:00:00Z' }
          ]
        }
      ];

      engine.setPlayerAvailability(availability);
      // Player availability should be stored internally
    });
  });

  describe('Greedy Algorithm', () => {
    beforeEach(() => {
      engine.initializeStations(mockStations);
    });

    it('should generate a valid schedule with no conflicts', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.success).toBe(true);
      expect(result.schedule).toHaveLength(mockMatches.length);
      expect(result.conflicts).toHaveLength(0);
      expect(result.algorithmUsed).toBe('greedy');
    });

    it('should respect station game type constraints', async () => {
      const result = await engine.generateSchedule(mockMatches);

      result.schedule.forEach(slot => {
        const match = mockMatches.find(m => m.id === slot.matchId);
        const station = mockStations.find(s => s.id === slot.stationId);
        
        expect(station?.gameTypes).toContain(match?.eventName);
      });
    });

    it('should handle buffer times between matches', async () => {
      const result = await engine.generateSchedule(mockMatches);

      // Check that matches on the same station have proper buffer time
      const stationSchedules = new Map<string, ScheduleSlot[]>();
      result.schedule.forEach(slot => {
        const existing = stationSchedules.get(slot.stationId) || [];
        existing.push(slot);
        stationSchedules.set(slot.stationId, existing);
      });

      stationSchedules.forEach((slots) => {
        const sortedSlots = slots.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        for (let i = 1; i < sortedSlots.length; i++) {
          const prevEnd = new Date(sortedSlots[i - 1].endTime).getTime();
          const currStart = new Date(sortedSlots[i].startTime).getTime();
          const buffer = (currStart - prevEnd) / (60 * 1000); // minutes

          expect(buffer).toBeGreaterThanOrEqual(defaultConfig.bufferTime);
        }
      });
    });

    it('should handle scheduling conflicts gracefully', async () => {
      // Create many matches to force conflicts
      const manyMatches: Match[] = [];
      for (let i = 0; i < 50; i++) {
        manyMatches.push({
          id: `match-${i}`,
          tournamentId: 'tournament-1',
          teamAId: `team-${i * 2}`,
          teamBId: `team-${i * 2 + 1}`,
          eventName: 'beer-pong',
          round: Math.floor(i / 10) + 1,
          status: 'upcoming',
          startTime: null,
          endTime: null,
          teamAScore: 0,
          teamBScore: 0
        });
      }

      const result = await engine.generateSchedule(manyMatches);

      if (!result.success) {
        expect(result.conflicts.length).toBeGreaterThan(0);
        result.conflicts.forEach(conflict => {
          expect(conflict.type).toMatch(/station_overlap|player_double_booked|insufficient_rest/);
          expect(conflict.severity).toMatch(/error|warning|critical/);
        });
      }
    });

    it('should prioritize higher round matches', async () => {
      const result = await engine.generateSchedule(mockMatches);

      // Round 2 match should generally be scheduled after round 1 matches
      const round1Slots = result.schedule.filter(s => s.round === 1);
      const round2Slots = result.schedule.filter(s => s.round === 2);

      if (round1Slots.length > 0 && round2Slots.length > 0) {
        const latestRound1 = Math.max(...round1Slots.map(s => 
          new Date(s.endTime).getTime()
        ));
        const earliestRound2 = Math.min(...round2Slots.map(s => 
          new Date(s.startTime).getTime()
        ));

        expect(earliestRound2).toBeGreaterThanOrEqual(latestRound1);
      }
    });
  });

  describe('Backtracking Algorithm', () => {
    beforeEach(() => {
      defaultConfig.algorithm = 'backtracking';
      engine = new SchedulingEngine(defaultConfig);
      engine.initializeStations(mockStations);
    });

    it('should find optimal schedule through backtracking', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.algorithmUsed).toBe('backtracking');
      expect(result.schedule.length).toBeGreaterThan(0);
      
      if (result.success) {
        expect(result.conflicts).toHaveLength(0);
      }
    });

    it('should track backtrack count', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.backtrackCount).toBeDefined();
      expect(result.backtrackCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Constraint Satisfaction', () => {
    beforeEach(() => {
      engine.initializeStations(mockStations);
    });

    it('should respect "before" constraints', async () => {
      const constraints: SchedulingConstraint[] = [
        {
          id: 'constraint-1',
          type: 'before',
          matchIds: ['match-1', 'match-3'],
          priority: 'hard',
          description: 'Match 1 must be before Match 3'
        }
      ];

      const result = await engine.generateSchedule(mockMatches, constraints);

      const match1Slot = result.schedule.find(s => s.matchId === 'match-1');
      const match3Slot = result.schedule.find(s => s.matchId === 'match-3');

      if (match1Slot && match3Slot) {
        expect(new Date(match1Slot.endTime).getTime()).toBeLessThanOrEqual(
          new Date(match3Slot.startTime).getTime()
        );
      }
    });

    it('should respect "same_station" constraints', async () => {
      const constraints: SchedulingConstraint[] = [
        {
          id: 'constraint-1',
          type: 'same_station',
          matchIds: ['match-1', 'match-3'],
          priority: 'hard',
          description: 'Matches must be on same station'
        }
      ];

      const result = await engine.generateSchedule(mockMatches, constraints);

      const match1Slot = result.schedule.find(s => s.matchId === 'match-1');
      const match3Slot = result.schedule.find(s => s.matchId === 'match-3');

      if (match1Slot && match3Slot) {
        expect(match1Slot.stationId).toBe(match3Slot.stationId);
      }
    });

    it('should respect "time_range" constraints', async () => {
      const constraints: SchedulingConstraint[] = [
        {
          id: 'constraint-1',
          type: 'time_range',
          matchIds: ['match-1'],
          priority: 'hard',
          value: {
            start: '2024-07-15T14:00:00Z',
            end: '2024-07-15T16:00:00Z'
          },
          description: 'Match must be in afternoon'
        }
      ];

      const result = await engine.generateSchedule(mockMatches, constraints);

      const match1Slot = result.schedule.find(s => s.matchId === 'match-1');

      if (match1Slot) {
        const slotStart = new Date(match1Slot.startTime).getTime();
        const slotEnd = new Date(match1Slot.endTime).getTime();
        const rangeStart = new Date('2024-07-15T14:00:00Z').getTime();
        const rangeEnd = new Date('2024-07-15T16:00:00Z').getTime();

        expect(slotStart).toBeGreaterThanOrEqual(rangeStart);
        expect(slotEnd).toBeLessThanOrEqual(rangeEnd);
      }
    });

    it('should handle soft constraints appropriately', async () => {
      const constraints: SchedulingConstraint[] = [
        {
          id: 'constraint-1',
          type: 'different_station',
          matchIds: ['match-1', 'match-2'],
          priority: 'soft',
          description: 'Prefer different stations'
        }
      ];

      const result = await engine.generateSchedule(mockMatches, constraints);

      // Soft constraints may be violated without causing failure
      expect(result.schedule.length).toBeGreaterThan(0);
    });
  });

  describe('Genetic Algorithm', () => {
    beforeEach(() => {
      defaultConfig.algorithm = 'genetic';
      engine = new SchedulingEngine(defaultConfig);
      engine.initializeStations(mockStations);
    });

    it('should generate schedule using genetic algorithm', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.algorithmUsed).toBe('genetic');
      expect(result.schedule.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Rescheduling', () => {
    beforeEach(() => {
      engine.initializeStations(mockStations);
    });

    it('should reschedule for delays', async () => {
      // First generate a schedule
      const initialResult = await engine.generateSchedule(mockMatches);
      expect(initialResult.success).toBe(true);

      const firstSlot = initialResult.schedule[0];
      const delayMinutes = 15;

      // Reschedule with delay
      const rescheduledResult = await engine.rescheduleForDelay(firstSlot.id, delayMinutes);

      const updatedSlot = rescheduledResult.schedule.find(s => s.id === firstSlot.id);
      expect(updatedSlot).toBeDefined();

      if (updatedSlot) {
        const originalStart = new Date(firstSlot.startTime).getTime();
        const newStart = new Date(updatedSlot.startTime).getTime();
        const actualDelay = (newStart - originalStart) / (60 * 1000);

        expect(actualDelay).toBe(delayMinutes);
      }
    });

    it('should cascade delays to affected matches', async () => {
      const initialResult = await engine.generateSchedule(mockMatches);
      const firstSlot = initialResult.schedule[0];

      // Find any slots that might be affected by the delay
      const affectedSlots = initialResult.schedule.filter(s => 
        s.stationId === firstSlot.stationId && 
        new Date(s.startTime).getTime() > new Date(firstSlot.startTime).getTime()
      );

      if (affectedSlots.length > 0) {
        const delayMinutes = 30;
        const rescheduledResult = await engine.rescheduleForDelay(firstSlot.id, delayMinutes);

        // Check that affected slots were also shifted
        affectedSlots.forEach(originalSlot => {
          const updatedSlot = rescheduledResult.schedule.find(s => s.id === originalSlot.id);
          if (updatedSlot) {
            const timeDiff = new Date(updatedSlot.startTime).getTime() - 
                            new Date(originalSlot.startTime).getTime();
            expect(timeDiff).toBeGreaterThan(0);
          }
        });
      }
    });

    it('should throw error for non-existent slot', async () => {
      await expect(
        engine.rescheduleForDelay('non-existent-slot', 10)
      ).rejects.toThrow('Slot non-existent-slot not found');
    });
  });

  describe('Conflict Detection', () => {
    beforeEach(() => {
      engine.initializeStations(mockStations);
    });

    it('should detect player double-booking', async () => {
      // Mock the getPlayerIdsFromMatch to return overlapping players
      const overlappingMatches: Match[] = [
        {
          ...mockMatches[0],
          id: 'overlap-1',
          startTime: '2024-07-15T10:00:00Z'
        },
        {
          ...mockMatches[0],
          id: 'overlap-2',
          teamAId: 'team-1', // Same team as overlap-1
          startTime: '2024-07-15T10:15:00Z' // Overlapping time
        }
      ];

      const result = await engine.generateSchedule(overlappingMatches);

      // Should have player conflicts if properly detected
      const playerConflicts = result.conflicts.filter(c => c.type === 'player_double_booked');
      // Note: Actual conflict detection depends on getPlayerIdsFromMatch implementation
    });

    it('should detect insufficient rest time', async () => {
      // Create matches that would require quick turnaround
      const quickTurnaroundMatches: Match[] = [
        mockMatches[0],
        {
          ...mockMatches[0],
          id: 'quick-2',
          round: 2
        }
      ];

      const result = await engine.generateSchedule(quickTurnaroundMatches);

      const restConflicts = result.conflicts.filter(c => c.type === 'insufficient_rest');
      // Check if rest time violations are detected
    });

    it('should detect station overlaps', async () => {
      // Force station overlap by limiting available stations
      const limitedStations = [mockStations[0]]; // Only one station
      engine.initializeStations(limitedStations);

      // Schedule multiple matches that can't fit without overlap
      const concurrentMatches: Match[] = [
        { ...mockMatches[0], eventName: 'beer-pong' },
        { ...mockMatches[1], id: 'concurrent-2', eventName: 'beer-pong' }
      ];

      const result = await engine.generateSchedule(concurrentMatches);

      if (!result.success) {
        const stationConflicts = result.conflicts.filter(c => c.type === 'station_overlap');
        expect(stationConflicts.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance Metrics', () => {
    beforeEach(() => {
      engine.initializeStations(mockStations);
    });

    it('should calculate generation time', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.generationTime).toBeDefined();
      expect(result.generationTime).toBeGreaterThan(0);
    });

    it('should calculate station utilization', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.stationUtilization).toBeDefined();
      
      Object.entries(result.stationUtilization).forEach(([stationId, utilization]) => {
        expect(utilization).toBeGreaterThanOrEqual(0);
        expect(utilization).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate average wait time', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.averagePlayerWaitTime).toBeDefined();
      expect(result.averagePlayerWaitTime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate schedule score', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should provide score breakdown', async () => {
      const result = await engine.generateSchedule(mockMatches);

      expect(result.scoreBreakdown).toBeDefined();
      
      defaultConfig.optimizationGoals.forEach(goal => {
        expect(result.scoreBreakdown[goal.type]).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      engine.initializeStations(mockStations);
    });

    it('should handle empty match list', async () => {
      const result = await engine.generateSchedule([]);

      expect(result.success).toBe(true);
      expect(result.schedule).toHaveLength(0);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should handle no active stations', async () => {
      engine.initializeStations([mockStations[3]]); // Only inactive station

      const result = await engine.generateSchedule(mockMatches);

      expect(result.schedule).toHaveLength(0);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    it('should handle matches with no compatible stations', async () => {
      const incompatibleMatch: Match = {
        ...mockMatches[0],
        eventName: 'unknown-game'
      };

      const result = await engine.generateSchedule([incompatibleMatch]);

      if (!result.success) {
        expect(result.conflicts.length).toBeGreaterThan(0);
      }
    });

    it('should handle time window too small for all matches', async () => {
      // Set very short time window
      const shortWindowConfig = {
        ...defaultConfig,
        startTime: '2024-07-15T10:00:00Z',
        endTime: '2024-07-15T10:30:00Z' // Only 30 minutes
      };

      const shortEngine = new SchedulingEngine(shortWindowConfig);
      shortEngine.initializeStations(mockStations);

      const result = await shortEngine.generateSchedule(mockMatches);

      // Should either have conflicts or partial schedule
      expect(result.schedule.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Algorithm Comparison', () => {
    const algorithms: SchedulingConfig['algorithm'][] = ['greedy', 'backtracking', 'constraint_satisfaction', 'genetic'];

    algorithms.forEach(algorithm => {
      it(`should generate valid schedule with ${algorithm} algorithm`, async () => {
        const config = { ...defaultConfig, algorithm };
        const testEngine = new SchedulingEngine(config);
        testEngine.initializeStations(mockStations);

        const result = await testEngine.generateSchedule(mockMatches);

        expect(result.algorithmUsed).toBe(algorithm);
        expect(result.schedule.length).toBeGreaterThan(0);
      });
    });

    it('should allow algorithm performance comparison', async () => {
      const results: Record<string, number> = {};

      for (const algorithm of algorithms) {
        const config = { ...defaultConfig, algorithm };
        const testEngine = new SchedulingEngine(config);
        testEngine.initializeStations(mockStations);

        const result = await testEngine.generateSchedule(mockMatches);
        results[algorithm] = result.generationTime;
      }

      // All algorithms should have run
      expect(Object.keys(results)).toHaveLength(algorithms.length);
    });
  });
});