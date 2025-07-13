import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Beer, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  PartyPopper,
  Star,
  Medal,
  Crown,
  Target,
  Zap,
  Camera,
  DollarSign,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TournamentWizardProps {
  onComplete: (data: TournamentData) => void;
  onCancel?: () => void;
}

interface TournamentData {
  // Basic Info
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  
  // Tournament Settings
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'group_stage' | 'free_for_all' | 'masters';
  maxTeams: number;
  teamSize: number;
  entryFee: number;
  prizePool: number;
  
  // Games Selection
  games: string[];
  customGames: string[];
  
  // Rules & Features
  scoringMethod: 'points' | 'wins' | 'combined';
  tieBreaker: string;
  features: string[];
  
  // Theme & Style
  theme: string;
  primaryColor: string;
  accentColor: string;
  
  // Additional Options
  isPublic: boolean;
  requiresApproval: boolean;
  allowLateJoin: boolean;
  streamingEnabled: boolean;
  photoSharing: boolean;
}

const WIZARD_STEPS = [
  { id: 'basics', title: 'Basic Info', icon: Trophy, description: 'Tournament name, date & location' },
  { id: 'format', title: 'Format', icon: Gamepad2, description: 'Choose tournament structure' },
  { id: 'games', title: 'Games', icon: Target, description: 'Select your games' },
  { id: 'rules', title: 'Rules', icon: Info, description: 'Scoring & tiebreakers' },
  { id: 'theme', title: 'Theme', icon: Sparkles, description: 'Customize the vibe' },
  { id: 'features', title: 'Features', icon: Star, description: 'Additional options' },
];

const PRESET_GAMES = [
  { id: 'beer-pong', name: 'Beer Pong', icon: '🏓', popularity: 95 },
  { id: 'flip-cup', name: 'Flip Cup', icon: '🥤', popularity: 90 },
  { id: 'cornhole', name: 'Cornhole', icon: '🎯', popularity: 85 },
  { id: 'quarters', name: 'Quarters', icon: '🪙', popularity: 75 },
  { id: 'giant-jenga', name: 'Giant Jenga', icon: '🗼', popularity: 70 },
  { id: 'kan-jam', name: 'Kan Jam', icon: '🥏', popularity: 65 },
  { id: 'dizzy-bat', name: 'Dizzy Bat', icon: '🦇', popularity: 60 },
  { id: 'beer-relay', name: 'Beer Relay', icon: '🏃', popularity: 55 },
  { id: 'spikeball', name: 'Spikeball', icon: '🏐', popularity: 50 },
  { id: 'ladder-golf', name: 'Ladder Golf', icon: '🪜', popularity: 45 },
];

const TOURNAMENT_FORMATS = [
  {
    id: 'single_elimination',
    name: 'Single Elimination',
    icon: Trophy,
    description: 'Classic knockout - lose once and you\'re out!',
    bestFor: 'Quick, exciting tournaments',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'double_elimination',
    name: 'Double Elimination',
    icon: Medal,
    description: 'Get a second chance through the losers bracket',
    bestFor: 'Fair, competitive play',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'round_robin',
    name: 'Round Robin',
    icon: Users,
    description: 'Everyone plays everyone',
    bestFor: 'Small groups, social events',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'group_stage',
    name: 'Group Stage + Playoffs',
    icon: Crown,
    description: 'Groups first, then knockout rounds',
    bestFor: 'Large tournaments',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'free_for_all',
    name: 'Free For All',
    icon: Zap,
    description: 'Points-based chaos!',
    bestFor: 'Casual, fun events',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    id: 'masters',
    name: 'Masters Series',
    icon: Star,
    description: 'Multiple tournaments, cumulative scoring',
    bestFor: 'Season-long competitions',
    color: 'from-indigo-500 to-purple-500'
  }
];

const THEME_OPTIONS = [
  { id: 'classic', name: 'Classic Beer Olympics', colors: ['#F59E0B', '#EAB308'], icon: Beer },
  { id: 'neon', name: 'Neon Party', colors: ['#FF6B6B', '#4ECDC4'], icon: Sparkles },
  { id: 'tropical', name: 'Tropical Paradise', colors: ['#10B981', '#3B82F6'], icon: PartyPopper },
  { id: 'retro', name: 'Retro Arcade', colors: ['#8B5CF6', '#EC4899'], icon: Gamepad2 },
  { id: 'elegant', name: 'Elegant Championship', colors: ['#1F2937', '#D97706'], icon: Crown },
  { id: 'custom', name: 'Custom Theme', colors: ['#000000', '#FFFFFF'], icon: Star },
];

export default function TournamentWizard({ onComplete, onCancel }: TournamentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TournamentData>({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    format: 'single_elimination',
    maxTeams: 16,
    teamSize: 2,
    entryFee: 0,
    prizePool: 0,
    games: [],
    customGames: [],
    scoringMethod: 'points',
    tieBreaker: 'head-to-head',
    features: [],
    theme: 'classic',
    primaryColor: '#F59E0B',
    accentColor: '#EAB308',
    isPublic: true,
    requiresApproval: false,
    allowLateJoin: true,
    streamingEnabled: false,
    photoSharing: true,
  });

  const updateFormData = (updates: Partial<TournamentData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 0 && (!formData.name || !formData.date)) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleGame = (gameId: string) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.includes(gameId)
        ? prev.games.filter(id => id !== gameId)
        : [...prev.games, gameId]
    }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const renderStepContent = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="font-party text-lg text-party-pink flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Tournament Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="Summer Beer Olympics 2024"
                className="input-party text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="font-party text-lg text-party-cyan flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="The ultimate backyard championship! Join us for an epic day of games, laughs, and legendary moments..."
                className="input-party w-full min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="font-party text-lg text-party-yellow flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData({ date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-party"
                />
              </div>

              <div className="space-y-3">
                <label className="font-party text-lg text-party-orange flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateFormData({ location: e.target.value })}
                  placeholder="123 Party St, Fun City"
                  className="input-party"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="font-party text-lg text-party-green flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Start Time
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateFormData({ startTime: e.target.value })}
                  className="input-party"
                />
              </div>

              <div className="space-y-3">
                <label className="font-party text-lg text-beer-amber flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  End Time
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateFormData({ endTime: e.target.value })}
                  className="input-party"
                />
              </div>
            </div>
          </div>
        );

      case 'format':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOURNAMENT_FORMATS.map((format) => (
                <motion.button
                  key={format.id}
                  onClick={() => updateFormData({ format: format.id as any })}
                  className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all ${
                    formData.format === format.id
                      ? 'ring-4 ring-party-pink shadow-glow scale-105'
                      : 'hover:scale-102'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${format.color} opacity-20`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <format.icon className="w-8 h-8 text-white" />
                      <h3 className="font-beer text-xl text-white">{format.name}</h3>
                    </div>
                    <p className="text-white/90 mb-2">{format.description}</p>
                    <p className="text-sm text-white/70">Best for: {format.bestFor}</p>
                  </div>
                  {formData.format === format.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-8 h-8 bg-party-pink rounded-full flex items-center justify-center"
                    >
                      <Star className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <label className="font-party text-lg text-party-cyan flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Max Teams
                </label>
                <Input
                  type="number"
                  min="4"
                  max="128"
                  value={formData.maxTeams}
                  onChange={(e) => updateFormData({ maxTeams: parseInt(e.target.value) || 16 })}
                  className="input-party"
                />
              </div>

              <div className="space-y-3">
                <label className="font-party text-lg text-party-yellow flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Size
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.teamSize}
                  onChange={(e) => updateFormData({ teamSize: parseInt(e.target.value) || 2 })}
                  className="input-party"
                />
              </div>

              <div className="space-y-3">
                <label className="font-party text-lg text-party-orange flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Entry Fee
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.entryFee}
                  onChange={(e) => updateFormData({ entryFee: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="input-party"
                />
              </div>
            </div>
          </div>
        );

      case 'games':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-beer text-2xl mb-4 text-party-pink">Select Your Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_GAMES.map((game) => (
                  <motion.button
                    key={game.id}
                    onClick={() => toggleGame(game.id)}
                    className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
                      formData.games.includes(game.id)
                        ? 'bg-gradient-party shadow-glow'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{game.icon}</span>
                        <div>
                          <h4 className="font-party text-lg text-white">{game.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-white h-2 rounded-full transition-all"
                                style={{ width: `${game.popularity}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/70">{game.popularity}% popular</span>
                          </div>
                        </div>
                      </div>
                      {formData.games.includes(game.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Star className="w-6 h-6 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-beer text-xl mb-3 text-party-cyan">Add Custom Games</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Enter custom game name and press Enter"
                  className="input-party"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      updateFormData({
                        customGames: [...formData.customGames, e.currentTarget.value.trim()]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
                {formData.customGames.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.customGames.map((game, index) => (
                      <span
                        key={index}
                        className="bg-gradient-beer text-beer-dark px-3 py-1 rounded-full text-sm font-party flex items-center gap-2"
                      >
                        {game}
                        <button
                          onClick={() => updateFormData({
                            customGames: formData.customGames.filter((_, i) => i !== index)
                          })}
                          className="hover:text-beer-amber"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'rules':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-beer text-2xl mb-4 text-party-pink">Scoring Method</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'points', name: 'Points Based', icon: Star, description: 'Teams earn points for placement' },
                  { id: 'wins', name: 'Win/Loss', icon: Trophy, description: 'Simple win/loss tracking' },
                  { id: 'combined', name: 'Combined', icon: Medal, description: 'Mix of points and wins' }
                ].map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => updateFormData({ scoringMethod: method.id as any })}
                    className={`card-party p-4 text-center ${
                      formData.scoringMethod === method.id ? 'ring-4 ring-party-pink' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <method.icon className="w-8 h-8 mx-auto mb-2 text-party-pink" />
                    <h4 className="font-party text-lg">{method.name}</h4>
                    <p className="text-sm text-neutral-600 mt-1">{method.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-beer text-2xl mb-4 text-party-cyan">Tiebreaker Rules</h3>
              <select
                value={formData.tieBreaker}
                onChange={(e) => updateFormData({ tieBreaker: e.target.value })}
                className="input-party w-full"
              >
                <option value="head-to-head">Head-to-Head Result</option>
                <option value="points-differential">Points Differential</option>
                <option value="total-points">Total Points Scored</option>
                <option value="sudden-death">Sudden Death Round</option>
                <option value="coin-flip">Coin Flip (Classic!)</option>
              </select>
            </div>

            <div className="card-beer p-6">
              <h4 className="font-beer text-xl mb-3 flex items-center gap-2">
                <Info className="w-6 h-6" />
                Tournament Rules Preview
              </h4>
              <ul className="space-y-2 text-beer-dark">
                <li>• Scoring: {formData.scoringMethod === 'points' ? 'Points-based system' : formData.scoringMethod === 'wins' ? 'Win/Loss tracking' : 'Combined scoring'}</li>
                <li>• Tiebreaker: {formData.tieBreaker.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
                <li>• Teams: {formData.maxTeams} max, {formData.teamSize} players each</li>
                <li>• Format: {TOURNAMENT_FORMATS.find(f => f.id === formData.format)?.name}</li>
              </ul>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-beer text-2xl mb-4 text-party-pink">Choose Your Vibe</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_OPTIONS.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => updateFormData({ 
                      theme: theme.id,
                      primaryColor: theme.colors[0],
                      accentColor: theme.colors[1]
                    })}
                    className={`relative overflow-hidden rounded-2xl p-6 text-center ${
                      formData.theme === theme.id ? 'ring-4 ring-party-pink scale-105' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                      }}
                    />
                    <div className="relative z-10">
                      <theme.icon className="w-12 h-12 mx-auto mb-3 text-white" />
                      <h4 className="font-party text-lg text-white">{theme.name}</h4>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {formData.theme === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="font-party text-lg">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                      className="w-16 h-16 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => updateFormData({ primaryColor: e.target.value })}
                      className="input-party"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="font-party text-lg">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => updateFormData({ accentColor: e.target.value })}
                      className="w-16 h-16 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) => updateFormData({ accentColor: e.target.value })}
                      className="input-party"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="card-party p-6">
              <h4 className="font-beer text-xl mb-3">Theme Preview</h4>
              <div 
                className="h-32 rounded-xl shadow-glow flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`
                }}
              >
                <span className="text-white font-beer text-3xl text-shadow-lg">
                  {formData.name || 'Your Tournament'}
                </span>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-beer text-2xl mb-4 text-party-pink">Tournament Features</h3>
              <div className="space-y-4">
                {[
                  { 
                    id: 'isPublic', 
                    label: 'Public Tournament', 
                    description: 'Anyone can view the leaderboard',
                    icon: Users 
                  },
                  { 
                    id: 'requiresApproval', 
                    label: 'Require Team Approval', 
                    description: 'You must approve teams before they can join',
                    icon: Crown 
                  },
                  { 
                    id: 'allowLateJoin', 
                    label: 'Allow Late Registration', 
                    description: 'Teams can join after tournament starts',
                    icon: Clock 
                  },
                  { 
                    id: 'streamingEnabled', 
                    label: 'Enable Live Streaming', 
                    description: 'Built-in streaming support for matches',
                    icon: Camera 
                  },
                  { 
                    id: 'photoSharing', 
                    label: 'Photo Sharing', 
                    description: 'Teams can upload and share photos',
                    icon: Camera 
                  }
                ].map((feature) => (
                  <label
                    key={feature.id}
                    className="card-party p-4 flex items-center gap-4 cursor-pointer hover:scale-102 transition-transform"
                  >
                    <input
                      type="checkbox"
                      checked={formData[feature.id as keyof TournamentData] as boolean}
                      onChange={(e) => updateFormData({ [feature.id]: e.target.checked })}
                      className="w-5 h-5 rounded text-party-pink focus:ring-party-pink"
                    />
                    <feature.icon className="w-6 h-6 text-party-pink" />
                    <div className="flex-1">
                      <h4 className="font-party text-lg">{feature.label}</h4>
                      <p className="text-sm text-neutral-600">{feature.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-beer text-2xl mb-4 text-party-cyan">Special Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Live Leaderboard Updates',
                  'SMS Notifications',
                  'QR Code Check-in',
                  'Custom Trophies',
                  'Sponsor Logos',
                  'Prize Tracking',
                  'Weather Updates',
                  'Music Playlist'
                ].map((feature) => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`p-3 rounded-xl font-party transition-all ${
                      formData.features.includes(feature)
                        ? 'bg-gradient-party text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`relative ${
                  index <= currentStep ? 'text-white' : 'text-white/30'
                }`}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-gradient-party' :
                  index === currentStep ? 'bg-gradient-party animate-pulse-glow' :
                  'bg-white/10'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                {index === currentStep && (
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-xs font-party whitespace-nowrap">{step.title}</span>
                  </motion.div>
                )}
              </motion.div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`w-full h-1 mx-2 ${
                  index < currentStep ? 'bg-gradient-party' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="card-party mb-8">
        <CardHeader>
          <CardTitle className="font-beer text-3xl flex items-center gap-3">
            {React.createElement(WIZARD_STEPS[currentStep].icon, { className: "w-8 h-8" })}
            {WIZARD_STEPS[currentStep].title}
          </CardTitle>
          <CardDescription className="font-party text-lg">
            {WIZARD_STEPS[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-white w-8' : 'bg-white/30'
              }`}
              animate={{
                width: index === currentStep ? 32 : 8,
              }}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="btn-party"
        >
          {currentStep === WIZARD_STEPS.length - 1 ? (
            <>
              Create Tournament
              <Trophy className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}