-- Migration: Add multi-station scheduling tables
-- Description: Adds tables for managing tournament stations, schedule slots, conflicts, and analytics

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
  id VARCHAR(255) PRIMARY KEY,
  tournament_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  capacity INTEGER,
  game_types JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  current_match_id VARCHAR(255),
  current_match_start_time TIMESTAMP,
  total_matches_played INTEGER DEFAULT 0,
  average_match_duration INTEGER, -- in minutes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_stations_tournament (tournament_id),
  INDEX idx_stations_status (status),
  INDEX idx_stations_active (is_active)
);

-- Schedule slots table
CREATE TABLE IF NOT EXISTS schedule_slots (
  id VARCHAR(255) PRIMARY KEY,
  tournament_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  station_id VARCHAR(255) NOT NULL,
  station_name VARCHAR(255),
  match_id VARCHAR(255),
  round INTEGER,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  buffer_before INTEGER DEFAULT 0, -- minutes
  buffer_after INTEGER DEFAULT 0, -- minutes
  has_conflict BOOLEAN DEFAULT false,
  conflict_reason TEXT,
  conflicting_slot_ids JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
  INDEX idx_slots_tournament (tournament_id),
  INDEX idx_slots_station (station_id),
  INDEX idx_slots_match (match_id),
  INDEX idx_slots_time (start_time, end_time),
  INDEX idx_slots_status (status),
  INDEX idx_slots_round (round)
);

-- Player availability table
CREATE TABLE IF NOT EXISTS player_availability (
  id SERIAL PRIMARY KEY,
  player_id VARCHAR(255) NOT NULL,
  tournament_id VARCHAR(255) NOT NULL,
  available_windows JSONB DEFAULT '[]',
  blackout_periods JSONB DEFAULT '[]',
  preferred_times JSONB DEFAULT '[]',
  preferred_stations JSONB DEFAULT '[]',
  min_rest_between_matches INTEGER DEFAULT 30, -- minutes
  max_matches_per_day INTEGER,
  max_consecutive_matches INTEGER DEFAULT 3,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_player_tournament (player_id, tournament_id),
  INDEX idx_availability_tournament (tournament_id),
  INDEX idx_availability_player (player_id)
);

-- Schedule conflicts table
CREATE TABLE IF NOT EXISTS schedule_conflicts (
  id VARCHAR(255) PRIMARY KEY,
  tournament_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('player_double_booked', 'station_overlap', 'insufficient_rest', 'availability_violation')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('warning', 'error', 'critical')),
  affected_slot_ids JSONB NOT NULL DEFAULT '[]',
  affected_match_ids JSONB NOT NULL DEFAULT '[]',
  affected_player_ids JSONB DEFAULT '[]',
  affected_station_ids JSONB DEFAULT '[]',
  description TEXT NOT NULL,
  suggested_resolution TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolution_action TEXT,
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_conflicts_tournament (tournament_id),
  INDEX idx_conflicts_type (type),
  INDEX idx_conflicts_severity (severity),
  INDEX idx_conflicts_resolved (is_resolved)
);

-- Schedule updates/changes log
CREATE TABLE IF NOT EXISTS schedule_updates (
  id SERIAL PRIMARY KEY,
  tournament_id VARCHAR(255) NOT NULL,
  update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('delay', 'cancellation', 'reschedule', 'station_change', 'duration_change')),
  affected_slot_ids JSONB NOT NULL DEFAULT '[]',
  affected_match_ids JSONB NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL,
  previous_values JSONB,
  new_values JSONB NOT NULL,
  cascading_updates JSONB DEFAULT '[]',
  updated_by VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  auto_generated BOOLEAN DEFAULT false,
  
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_updates_tournament (tournament_id),
  INDEX idx_updates_type (update_type),
  INDEX idx_updates_time (updated_at)
);

-- Scheduling constraints table (for custom rules)
CREATE TABLE IF NOT EXISTS scheduling_constraints (
  id SERIAL PRIMARY KEY,
  tournament_id VARCHAR(255) NOT NULL,
  constraint_type VARCHAR(50) NOT NULL CHECK (constraint_type IN ('before', 'after', 'same_time', 'different_time', 'same_station', 'different_station', 'time_range')),
  match_ids JSONB NOT NULL DEFAULT '[]',
  constraint_value JSONB,
  priority VARCHAR(20) DEFAULT 'soft' CHECK (priority IN ('soft', 'hard')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
  INDEX idx_constraints_tournament (tournament_id),
  INDEX idx_constraints_type (constraint_type)
);

-- Add scheduling-related columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS scheduled_slot_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS scheduled_start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_station_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS scheduled_station_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_duration INTEGER, -- minutes
ADD COLUMN IF NOT EXISTS delay_reason TEXT,
ADD COLUMN IF NOT EXISTS delay_minutes INTEGER,
ADD COLUMN IF NOT EXISTS team_a_ready BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS team_b_ready BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS station_ready BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS referee_ready BOOLEAN DEFAULT false;

-- Add indices for the new match columns
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_time ON matches(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_matches_station ON matches(scheduled_station_id);
CREATE INDEX IF NOT EXISTS idx_matches_ready_status ON matches(team_a_ready, team_b_ready, station_ready, referee_ready);

-- Add scheduling configuration to tournaments table
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS scheduling_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stations_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_scheduling_enabled BOOLEAN DEFAULT false;

-- Create views for common queries

-- View: Current station status
CREATE OR REPLACE VIEW station_status AS
SELECT 
  s.*,
  m.team_a,
  m.team_b,
  m.event_name,
  CASE 
    WHEN s.current_match_id IS NOT NULL THEN 'occupied'
    WHEN EXISTS (
      SELECT 1 FROM schedule_slots ss 
      WHERE ss.station_id = s.id 
      AND ss.status = 'scheduled'
      AND ss.start_time <= CURRENT_TIMESTAMP + INTERVAL '15 minutes'
      AND ss.start_time > CURRENT_TIMESTAMP
    ) THEN 'reserved'
    ELSE s.status
  END as real_time_status
FROM stations s
LEFT JOIN matches m ON s.current_match_id = m.id;

-- View: Upcoming matches with full details
CREATE OR REPLACE VIEW upcoming_scheduled_matches AS
SELECT 
  m.*,
  ss.start_time as scheduled_time,
  ss.station_id,
  s.name as station_name,
  s.location as station_location,
  ta.name as team_a_name,
  tb.name as team_b_name
FROM matches m
JOIN schedule_slots ss ON m.id = ss.match_id
JOIN stations s ON ss.station_id = s.id
LEFT JOIN teams ta ON m.team_a = ta.id
LEFT JOIN teams tb ON m.team_b = tb.id
WHERE m.is_complete = false
AND ss.status IN ('scheduled', 'in_progress')
ORDER BY ss.start_time;

-- View: Schedule efficiency metrics
CREATE OR REPLACE VIEW schedule_efficiency AS
SELECT 
  tournament_id,
  COUNT(DISTINCT station_id) as total_stations,
  COUNT(*) as total_slots,
  SUM(duration) as total_match_time,
  SUM(buffer_before + buffer_after) as total_buffer_time,
  AVG(duration) as avg_match_duration,
  MIN(start_time) as schedule_start,
  MAX(end_time) as schedule_end,
  EXTRACT(EPOCH FROM (MAX(end_time) - MIN(start_time))) / 3600 as total_hours,
  COUNT(DISTINCT match_id) as scheduled_matches,
  SUM(CASE WHEN has_conflict THEN 1 ELSE 0 END) as conflicted_slots
FROM schedule_slots
GROUP BY tournament_id;

-- Function: Check for player conflicts when creating/updating a slot
CREATE OR REPLACE FUNCTION check_player_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  player_ids TEXT[];
  conflicting_slots RECORD;
BEGIN
  -- Get player IDs from the match
  SELECT ARRAY[m.team_a, m.team_b] INTO player_ids
  FROM matches m
  WHERE m.id = NEW.match_id;
  
  -- Check for overlapping slots with same players
  FOR conflicting_slots IN
    SELECT ss.*, m2.team_a, m2.team_b
    FROM schedule_slots ss
    JOIN matches m2 ON ss.match_id = m2.id
    WHERE ss.tournament_id = NEW.tournament_id
    AND ss.id != NEW.id
    AND (
      (NEW.start_time < ss.end_time AND NEW.end_time > ss.start_time)
      OR (ss.start_time < NEW.end_time AND ss.end_time > NEW.start_time)
    )
    AND (
      m2.team_a = ANY(player_ids) OR m2.team_b = ANY(player_ids)
    )
  LOOP
    -- Set conflict flag
    NEW.has_conflict := true;
    NEW.conflict_reason := 'Player double-booked';
    NEW.conflicting_slot_ids := array_append(NEW.conflicting_slot_ids::text[], conflicting_slots.id);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conflict checking
CREATE TRIGGER check_slot_conflicts
  BEFORE INSERT OR UPDATE ON schedule_slots
  FOR EACH ROW
  EXECUTE FUNCTION check_player_conflicts();

-- Function: Update station status when match starts/ends
CREATE OR REPLACE FUNCTION update_station_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Match started
    IF OLD.actual_start_time IS NULL AND NEW.actual_start_time IS NOT NULL THEN
      UPDATE stations 
      SET 
        status = 'occupied',
        current_match_id = NEW.id,
        current_match_start_time = NEW.actual_start_time
      WHERE id = NEW.scheduled_station_id;
    END IF;
    
    -- Match ended
    IF OLD.actual_end_time IS NULL AND NEW.actual_end_time IS NOT NULL THEN
      UPDATE stations 
      SET 
        status = 'available',
        current_match_id = NULL,
        current_match_start_time = NULL,
        total_matches_played = total_matches_played + 1,
        average_match_duration = (
          (average_match_duration * total_matches_played + NEW.actual_duration) / (total_matches_played + 1)
        )
      WHERE id = NEW.scheduled_station_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for station status updates
CREATE TRIGGER update_station_on_match_change
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (OLD.actual_start_time IS DISTINCT FROM NEW.actual_start_time 
     OR OLD.actual_end_time IS DISTINCT FROM NEW.actual_end_time)
  EXECUTE FUNCTION update_station_status();

-- Sample data for testing (commented out for production)
/*
-- Insert sample stations
INSERT INTO stations (id, tournament_id, name, description, location, capacity, game_types)
VALUES 
  ('station-1', 'tournament-1', 'Station A', 'Main beer pong station', 'Garage', 8, '["beer_pong", "flip_cup"]'),
  ('station-2', 'tournament-1', 'Station B', 'Outdoor games area', 'Backyard', 20, '["cornhole", "kan_jam"]'),
  ('station-3', 'tournament-1', 'Station C', 'Indoor games station', 'Living Room', 12, '["cards", "dice"]');
*/