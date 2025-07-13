import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings,
  Timer,
  Users,
  Trophy,
  Target,
  Info,
  Plus,
  Trash2,
  Copy,
  Save,
  RotateCcw,
  Star,
  Medal,
  Crown,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

interface GameConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  duration: number; // in minutes
  pointsForWin: number;
  pointsForSecond: number;
  pointsForThird: number;
  bonusPoints: BonusPoint[];
  rules: string[];
  equipment: string[];
  customSettings: Record<string, any>;
}

interface BonusPoint {
  id: string;
  name: string;
  points: number;
  description: string;
}

interface GameConfigPanelProps {
  games: string[];
  onSave: (configs: GameConfig[]) => void;
  initialConfigs?: GameConfig[];
}

const DEFAULT_GAME_CONFIGS: Record<string, Partial<GameConfig>> = {
  'beer-pong': {
    name: 'Beer Pong',
    icon: '🏓',
    description: 'Classic cup elimination game',
    minPlayers: 2,
    maxPlayers: 4,
    duration: 15,
    pointsForWin: 100,
    pointsForSecond: 50,
    pointsForThird: 25,
    rules: [
      'Standard 10-cup triangle formation',
      'Elbow rule enforced',
      'Re-racks at 6, 3, and 1 cups',
      'Redemption shots allowed'
    ],
    equipment: ['Table', 'Cups', 'Ping pong balls', 'Beer'],
    bonusPoints: [
      { id: '1', name: 'Perfect Game', points: 50, description: 'Win without losing a cup' },
      { id: '2', name: 'Trick Shot', points: 10, description: 'Score with a bounce or behind-the-back' }
    ]
  },
  'flip-cup': {
    name: 'Flip Cup',
    icon: '🥤',
    description: 'Fast-paced team relay race',
    minPlayers: 4,
    maxPlayers: 10,
    duration: 5,
    pointsForWin: 75,
    pointsForSecond: 40,
    pointsForThird: 20,
    rules: [
      'Teams line up on opposite sides',
      'Must drink then flip cup',
      'Next player goes after successful flip',
      'First team to finish wins'
    ],
    equipment: ['Table', 'Plastic cups', 'Beer'],
    bonusPoints: [
      { id: '1', name: 'Clean Sweep', points: 25, description: 'Win by 3+ cups' },
      { id: '2', name: 'One Flip Wonder', points: 15, description: 'Flip on first try' }
    ]
  },
  'cornhole': {
    name: 'Cornhole',
    icon: '🎯',
    description: 'Aim for the hole with bean bags',
    minPlayers: 2,
    maxPlayers: 4,
    duration: 20,
    pointsForWin: 100,
    pointsForSecond: 50,
    pointsForThird: 25,
    rules: [
      'Play to 21 points',
      '3 points for hole, 1 for board',
      'Cancel out scoring',
      'Win by 2'
    ],
    equipment: ['Cornhole boards', 'Bean bags'],
    bonusPoints: [
      { id: '1', name: 'Four Bagger', points: 30, description: 'All 4 bags in the hole' },
      { id: '2', name: 'Skunk', points: 20, description: 'Win 21-0' }
    ]
  }
};

export default function GameConfigPanel({ games, onSave, initialConfigs = [] }: GameConfigPanelProps) {
  const [configs, setConfigs] = useState<GameConfig[]>(() => {
    return games.map(gameId => {
      const existing = initialConfigs.find(c => c.id === gameId);
      if (existing) return existing;
      
      const defaultConfig = DEFAULT_GAME_CONFIGS[gameId] || {};
      return {
        id: gameId,
        name: defaultConfig.name || gameId,
        icon: defaultConfig.icon || '🎮',
        description: defaultConfig.description || '',
        minPlayers: defaultConfig.minPlayers || 2,
        maxPlayers: defaultConfig.maxPlayers || 4,
        duration: defaultConfig.duration || 15,
        pointsForWin: defaultConfig.pointsForWin || 100,
        pointsForSecond: defaultConfig.pointsForSecond || 50,
        pointsForThird: defaultConfig.pointsForThird || 25,
        bonusPoints: defaultConfig.bonusPoints || [],
        rules: defaultConfig.rules || [],
        equipment: defaultConfig.equipment || [],
        customSettings: {}
      };
    });
  });

  const [selectedGame, setSelectedGame] = useState<string>(games[0] || '');
  const [newRule, setNewRule] = useState('');
  const [newEquipment, setNewEquipment] = useState('');

  const currentConfig = configs.find(c => c.id === selectedGame);

  const updateConfig = (gameId: string, updates: Partial<GameConfig>) => {
    setConfigs(prev => prev.map(config => 
      config.id === gameId ? { ...config, ...updates } : config
    ));
  };

  const addBonusPoint = (gameId: string) => {
    const newBonus: BonusPoint = {
      id: Date.now().toString(),
      name: '',
      points: 10,
      description: ''
    };
    
    updateConfig(gameId, {
      bonusPoints: [...(currentConfig?.bonusPoints || []), newBonus]
    });
  };

  const updateBonusPoint = (gameId: string, bonusId: string, updates: Partial<BonusPoint>) => {
    const config = configs.find(c => c.id === gameId);
    if (!config) return;
    
    updateConfig(gameId, {
      bonusPoints: config.bonusPoints.map(bonus =>
        bonus.id === bonusId ? { ...bonus, ...updates } : bonus
      )
    });
  };

  const removeBonusPoint = (gameId: string, bonusId: string) => {
    const config = configs.find(c => c.id === gameId);
    if (!config) return;
    
    updateConfig(gameId, {
      bonusPoints: config.bonusPoints.filter(bonus => bonus.id !== bonusId)
    });
  };

  const addRule = (gameId: string) => {
    if (!newRule.trim()) return;
    
    const config = configs.find(c => c.id === gameId);
    if (!config) return;
    
    updateConfig(gameId, {
      rules: [...config.rules, newRule.trim()]
    });
    setNewRule('');
  };

  const removeRule = (gameId: string, index: number) => {
    const config = configs.find(c => c.id === gameId);
    if (!config) return;
    
    updateConfig(gameId, {
      rules: config.rules.filter((_, i) => i !== index)
    });
  };

  const addEquipment = (gameId: string) => {
    if (!newEquipment.trim()) return;
    
    const config = configs.find(c => c.id === gameId);
    if (!config) return;
    
    updateConfig(gameId, {
      equipment: [...config.equipment, newEquipment.trim()]
    });
    setNewEquipment('');
  };

  const removeEquipment = (gameId: string, index: number) => {
    const config = configs.find(c => c.id === gameId);
    if (!config) return;
    
    updateConfig(gameId, {
      equipment: config.equipment.filter((_, i) => i !== index)
    });
  };

  const copyConfig = (fromId: string, toId: string) => {
    const sourceConfig = configs.find(c => c.id === fromId);
    if (!sourceConfig) return;
    
    updateConfig(toId, {
      ...sourceConfig,
      id: toId
    });
    
    toast.success(`Copied settings from ${sourceConfig.name}`);
  };

  const resetConfig = (gameId: string) => {
    const defaultConfig = DEFAULT_GAME_CONFIGS[gameId];
    if (defaultConfig) {
      updateConfig(gameId, defaultConfig);
      toast.success('Reset to default settings');
    }
  };

  const handleSave = () => {
    onSave(configs);
    toast.success('Game configurations saved!');
  };

  if (!currentConfig) return null;

  return (
    <div className="space-y-6">
      {/* Game Selector */}
      <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-2xl">
        {configs.map((config) => (
          <motion.button
            key={config.id}
            onClick={() => setSelectedGame(config.id)}
            className={`px-4 py-2 rounded-xl font-party transition-all ${
              selectedGame === config.id
                ? 'bg-gradient-party text-white shadow-glow'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{config.icon}</span>
            {config.name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedGame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Basic Settings */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-party text-sm text-party-pink">Game Name</label>
                  <Input
                    value={currentConfig.name}
                    onChange={(e) => updateConfig(selectedGame, { name: e.target.value })}
                    className="input-party"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-party text-sm text-party-cyan">Icon</label>
                  <Input
                    value={currentConfig.icon}
                    onChange={(e) => updateConfig(selectedGame, { icon: e.target.value })}
                    className="input-party text-center text-2xl"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-party text-sm text-party-yellow">Description</label>
                <textarea
                  value={currentConfig.description}
                  onChange={(e) => updateConfig(selectedGame, { description: e.target.value })}
                  className="input-party w-full min-h-[80px] resize-none"
                  placeholder="Brief game description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-party text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Min Players
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={currentConfig.minPlayers}
                    onChange={(e) => updateConfig(selectedGame, { minPlayers: parseInt(e.target.value) || 1 })}
                    className="input-party"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-party text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max Players
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={currentConfig.maxPlayers}
                    onChange={(e) => updateConfig(selectedGame, { maxPlayers: parseInt(e.target.value) || 4 })}
                    className="input-party"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-party text-sm flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Duration (min)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={currentConfig.duration}
                    onChange={(e) => updateConfig(selectedGame, { duration: parseInt(e.target.value) || 15 })}
                    className="input-party"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => resetConfig(selectedGame)}
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => {
                    const otherGames = configs.filter(c => c.id !== selectedGame);
                    if (otherGames.length > 0) {
                      copyConfig(selectedGame, otherGames[0].id);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Others
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Points Settings */}
          <Card className="card-party">
            <CardHeader>
              <CardTitle className="font-beer text-2xl flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Points & Scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-party text-sm flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    1st Place
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={currentConfig.pointsForWin}
                    onChange={(e) => updateConfig(selectedGame, { pointsForWin: parseInt(e.target.value) || 0 })}
                    className="input-party"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-party text-sm flex items-center gap-1">
                    <Medal className="w-4 h-4 text-gray-400" />
                    2nd Place
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={currentConfig.pointsForSecond}
                    onChange={(e) => updateConfig(selectedGame, { pointsForSecond: parseInt(e.target.value) || 0 })}
                    className="input-party"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-party text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-700" />
                    3rd Place
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={currentConfig.pointsForThird}
                    onChange={(e) => updateConfig(selectedGame, { pointsForThird: parseInt(e.target.value) || 0 })}
                    className="input-party"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-party text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Bonus Points
                  </h4>
                  <Button
                    onClick={() => addBonusPoint(selectedGame)}
                    size="sm"
                    className="btn-party h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {currentConfig.bonusPoints.map((bonus) => (
                    <motion.div
                      key={bonus.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/10 rounded-xl p-3 space-y-2"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={bonus.name}
                          onChange={(e) => updateBonusPoint(selectedGame, bonus.id, { name: e.target.value })}
                          placeholder="Bonus name"
                          className="input-party h-8 text-sm"
                        />
                        <Input
                          type="number"
                          value={bonus.points}
                          onChange={(e) => updateBonusPoint(selectedGame, bonus.id, { points: parseInt(e.target.value) || 0 })}
                          placeholder="Points"
                          className="input-party h-8 text-sm"
                        />
                        <Button
                          onClick={() => removeBonusPoint(selectedGame, bonus.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-red-400 hover:bg-red-400/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={bonus.description}
                        onChange={(e) => updateBonusPoint(selectedGame, bonus.id, { description: e.target.value })}
                        placeholder="Description"
                        className="input-party h-8 text-sm"
                      />
                    </motion.div>
                  ))}
                  
                  {currentConfig.bonusPoints.length === 0 && (
                    <p className="text-center text-white/50 py-4">No bonus points yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules & Equipment */}
          <Card className="card-party lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-beer text-2xl flex items-center gap-2">
                <Info className="w-6 h-6" />
                Rules & Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-party text-lg mb-3 text-party-pink">Game Rules</h4>
                <div className="space-y-2 mb-3">
                  {currentConfig.rules.map((rule, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 bg-white/10 rounded-lg p-2"
                    >
                      <span className="flex-1 text-sm">{rule}</span>
                      <Button
                        onClick={() => removeRule(selectedGame, index)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addRule(selectedGame);
                      }
                    }}
                    placeholder="Add a rule..."
                    className="input-party"
                  />
                  <Button
                    onClick={() => addRule(selectedGame)}
                    className="btn-party"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-party text-lg mb-3 text-party-cyan">Equipment Needed</h4>
                <div className="space-y-2 mb-3">
                  {currentConfig.equipment.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 bg-white/10 rounded-lg p-2"
                    >
                      <Target className="w-4 h-4 text-party-yellow" />
                      <span className="flex-1 text-sm">{item}</span>
                      <Button
                        onClick={() => removeEquipment(selectedGame, index)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-400 hover:bg-red-400/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addEquipment(selectedGame);
                      }
                    }}
                    placeholder="Add equipment..."
                    className="input-party"
                  />
                  <Button
                    onClick={() => addEquipment(selectedGame)}
                    className="btn-party"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="btn-party"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          Save All Configurations
        </Button>
      </div>
    </div>
  );
}