import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

interface MobileScoreEntryProps {
  matchId: string;
  teams: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
  gameType?: 'cups' | 'points' | 'time';
  onSubmit: (scores: Record<string, number>) => Promise<void>;
  onCancel: () => void;
}

export function MobileScoreEntry({
  matchId,
  teams,
  gameType = 'cups',
  onSubmit,
  onCancel,
}: MobileScoreEntryProps) {
  const [scores, setScores] = useState<Record<string, number>>(
    teams.reduce((acc, team) => ({ ...acc, [team.id]: 0 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe to cancel
  useEffect(() => {
    useSwipeGesture(containerRef, {
      onSwipeDown: onCancel,
    });
  }, [onCancel, containerRef]);

  const handleScoreChange = (teamId: string, delta: number) => {
    setScores(prev => ({
      ...prev,
      [teamId]: Math.max(0, prev[teamId] + delta),
    }));

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleSubmit = async () => {
    // Validate scores
    const hasScores = Object.values(scores).some(score => score > 0);
    if (!hasScores) {
      toast.error('Please enter at least one score');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(scores);
      toast.success('Score submitted!');
      
      // Haptic feedback for success
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch (error) {
      toast.error('Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreLabel = () => {
    switch (gameType) {
      case 'cups': return 'Cups';
      case 'points': return 'Points';
      case 'time': return 'Seconds';
      default: return 'Score';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="text-xl font-bold">Enter Scores</h2>
          <p className="text-sm text-muted-foreground">Swipe down to cancel</p>
        </div>

        {/* Score Entry */}
        <div className="px-6 pb-6 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {teams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-muted/50 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg" style={{ color: team.color }}>
                  {team.name}
                </h3>
                <span className="text-3xl font-bold tabular-nums">
                  {scores[team.id]}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4">
                {/* Decrease Button */}
                <button
                  onClick={() => handleScoreChange(team.id, -1)}
                  disabled={scores[team.id] === 0}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    "bg-background border-2 transition-all",
                    "active:scale-90 disabled:opacity-50",
                    scores[team.id] === 0 
                      ? "border-muted" 
                      : "border-red-500 text-red-500"
                  )}
                  aria-label={`Decrease ${team.name} score`}
                >
                  <Minus size={24} strokeWidth={3} />
                </button>

                {/* Score Display */}
                <div className="flex-1 text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    {getScoreLabel()}
                  </div>
                  <input
                    type="number"
                    value={scores[team.id]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setScores(prev => ({ ...prev, [team.id]: Math.max(0, value) }));
                    }}
                    className="w-full text-center text-4xl font-bold bg-transparent outline-none"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>

                {/* Increase Button */}
                <button
                  onClick={() => handleScoreChange(team.id, 1)}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    "bg-green-500 text-white transition-all",
                    "active:scale-90"
                  )}
                  aria-label={`Increase ${team.name} score`}
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Quick Score Buttons */}
              <div className="flex gap-2 mt-3 justify-center">
                {[5, 10, 15, 20].map((value) => (
                  <button
                    key={value}
                    onClick={() => setScores(prev => ({ ...prev, [team.id]: value }))}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      "bg-background border transition-all",
                      "active:scale-95",
                      scores[team.id] === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 pt-4 border-t bg-background">
          <button
            onClick={onCancel}
            className={cn(
              "flex-1 py-4 rounded-2xl font-semibold",
              "bg-muted hover:bg-muted/80 transition-colors",
              "active:scale-95"
            )}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.values(scores).every(s => s === 0)}
            className={cn(
              "flex-1 py-4 rounded-2xl font-semibold",
              "bg-primary text-primary-foreground transition-all",
              "active:scale-95 disabled:opacity-50",
              "flex items-center justify-center gap-2"
            )}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <X size={20} />
              </motion.div>
            ) : (
              <>
                <Check size={20} />
                Submit Score
              </>
            )}
          </button>
        </div>

        {/* Safe area padding */}
        <div className="h-safe-area-inset-bottom" />
      </motion.div>
    </AnimatePresence>
  );
}

// Compact score display for match history
export function MobileScoreDisplay({
  scores,
  teams,
  winner,
}: {
  scores: Record<string, number>;
  teams: Array<{ id: string; name: string; color?: string }>;
  winner?: string;
}) {
  return (
    <div className="flex items-center justify-around py-3">
      {teams.map((team, index) => (
        <React.Fragment key={team.id}>
          {index > 0 && <span className="text-muted-foreground mx-2">vs</span>}
          <div
            className={cn(
              "text-center",
              winner === team.id && "font-bold"
            )}
          >
            <div className="text-sm" style={{ color: team.color }}>
              {team.name}
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {scores[team.id] || 0}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}