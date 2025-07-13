import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
 
  Laugh, 
  Crown, 
  Timer, 
  TrendingUp,
  Play,
  Sparkles,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface HighlightMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  uploaderId: string;
  uploaderName?: string;
  testimonial?: string;
  createdAt: string;
  confidence?: number;
  aiTags?: string[];
}

interface HighlightCategory {
  type: 'fastestChug' | 'biggestUpset' | 'funnyMoments';
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  media: HighlightMedia[];
}

interface HighlightsPanelProps {
  tournamentId: string;
  onGenerateReel?: (mediaIds: string[]) => void;
  onRefreshHighlights?: () => void;
  className?: string;
}

// Mock data for demonstration
const mockHighlights: HighlightCategory[] = [
  {
    type: 'fastestChug',
    title: 'Lightning Fast Chugs',
    icon: Timer,
    color: 'text-blue-600',
    description: 'AI detected these blazing fast drinking moments',
    media: [
      {
        id: 'fast1',
        type: 'video',
        url: '/api/placeholder/video/fast-chug-1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574391884720-bbc1b8d9c4c8?w=300&h=200',
        uploaderId: 'user1',
        uploaderName: 'Mike Thunder',
        testimonial: 'That was insane! Never seen anyone chug that fast!',
        createdAt: '2025-01-10T15:30:00Z',
        confidence: 0.92,
        aiTags: ['speed', 'drinking', 'impressive']
      },
      {
        id: 'fast2', 
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1574391884720-bbc1b8d9c4c8?w=600&h=400',
        uploaderId: 'user2',
        uploaderName: 'Sarah Quick',
        testimonial: 'The moment right before the record-breaking chug!',
        createdAt: '2025-01-10T16:15:00Z',
        confidence: 0.88,
        aiTags: ['preparation', 'focus', 'record']
      }
    ]
  },
  {
    type: 'biggestUpset',
    title: 'Shocking Upsets',
    icon: TrendingUp,
    color: 'text-orange-600',
    description: 'Underdog victories that shocked everyone',
    media: [
      {
        id: 'upset1',
        type: 'video',
        url: '/api/placeholder/video/upset-1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&h=200',
        uploaderId: 'user3',
        uploaderName: 'David Giant',
        testimonial: 'Nobody saw this coming! The underdogs prevail!',
        createdAt: '2025-01-10T17:45:00Z',
        confidence: 0.94,
        aiTags: ['celebration', 'victory', 'surprise']
      }
    ]
  },
  {
    type: 'funnyMoments',
    title: 'Comedy Gold',
    icon: Laugh,
    color: 'text-green-600', 
    description: 'Hilarious moments that had everyone cracking up',
    media: [
      {
        id: 'funny1',
        type: 'video',
        url: '/api/placeholder/video/funny-1.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200',
        uploaderId: 'user4',
        uploaderName: 'Jenny Laughs',
        testimonial: 'I cannot stop laughing at this! 😂',
        createdAt: '2025-01-10T18:20:00Z',
        confidence: 0.96,
        aiTags: ['funny', 'fail', 'laughter']
      },
      {
        id: 'funny2',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400',
        uploaderId: 'user5',
        uploaderName: 'Tom Silly',
        testimonial: 'Perfect timing on this photo!',
        createdAt: '2025-01-10T18:25:00Z',
        confidence: 0.89,
        aiTags: ['timing', 'expression', 'comedy']
      }
    ]
  }
];

function HighlightCard({ highlight, onPlayMedia }: { highlight: HighlightMedia; onPlayMedia: (media: HighlightMedia) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => onPlayMedia(highlight)}
    >
      <div className="relative">
        <img
          src={highlight.thumbnailUrl || highlight.url}
          alt={highlight.testimonial || 'Highlight moment'}
          className="w-full h-32 object-cover"
        />
        
        {/* Video play overlay */}
        {highlight.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-colors">
            <Play className="w-6 h-6 text-white" />
          </div>
        )}
        
        {/* AI Confidence badge */}
        {highlight.confidence && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>{Math.round(highlight.confidence * 100)}%</span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <Crown className="w-3 h-3 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {highlight.uploaderName}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(highlight.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        {highlight.testimonial && (
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {highlight.testimonial}
          </p>
        )}
        
        {highlight.aiTags && (
          <div className="flex flex-wrap gap-1">
            {highlight.aiTags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HighlightSection({ 
  category, 
  onPlayMedia, 
  onSelectForReel, 
  selectedForReel 
}: { 
  category: HighlightCategory;
  onPlayMedia: (media: HighlightMedia) => void;
  onSelectForReel: (mediaId: string) => void;
  selectedForReel: Set<string>;
}) {
  const Icon = category.icon;
  
  if (category.media.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
        <h3 className="font-medium text-gray-900 mb-1">{category.title}</h3>
        <p className="text-sm text-gray-500">No highlights detected yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gray-100`}>
            <Icon className={`w-5 h-5 ${category.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.title}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {category.media.length} highlight{category.media.length !== 1 ? 's' : ''}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.media.map((highlight) => (
          <div key={highlight.id} className="relative">
            <HighlightCard
              highlight={highlight}
              onPlayMedia={onPlayMedia}
            />
            
            {/* Reel selection checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedForReel.has(highlight.id)}
                onChange={() => onSelectForReel(highlight.id)}
                className="w-4 h-4 text-orange-600 bg-white border-2 border-white rounded focus:ring-orange-500 focus:ring-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function HighlightsPanel({ 
  onGenerateReel, 
  onRefreshHighlights,
  className 
}: HighlightsPanelProps) {
  const [highlights] = useState<HighlightCategory[]>(mockHighlights);
  const [selectedForReel, setSelectedForReel] = useState<Set<string>>(new Set());
  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle media selection for highlight reel
  const toggleMediaSelection = (mediaId: string) => {
    setSelectedForReel(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  // Generate highlight reel
  const handleGenerateReel = async () => {
    if (selectedForReel.size === 0) return;
    
    setIsGeneratingReel(true);
    try {
      await onGenerateReel?.(Array.from(selectedForReel));
      setSelectedForReel(new Set()); // Clear selection after generation
    } catch (error) {
      console.error('Failed to generate highlight reel:', error);
    } finally {
      setIsGeneratingReel(false);
    }
  };

  // Refresh highlights
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshHighlights?.();
      // In a real implementation, this would fetch new highlights
    } catch (error) {
      console.error('Failed to refresh highlights:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Play media (opens lightbox)
  const handlePlayMedia = (media: HighlightMedia) => {
    // This would open the media in a lightbox/modal
    console.log('Playing media:', media);
  };

  const totalHighlights = highlights.reduce((sum, category) => sum + category.media.length, 0);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Highlights</h2>
            <p className="text-sm text-gray-600">
              {totalHighlights} moments detected automatically
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          {/* Generate reel button */}
          <Button
            onClick={handleGenerateReel}
            disabled={selectedForReel.size === 0 || isGeneratingReel}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>
              {isGeneratingReel ? 'Generating...' : `Create Reel (${selectedForReel.size})`}
            </span>
          </Button>
        </div>
      </div>

      {/* Selection instructions */}
      {selectedForReel.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                {selectedForReel.size} moment{selectedForReel.size !== 1 ? 's' : ''} selected for highlight reel
              </span>
            </div>
            <button
              onClick={() => setSelectedForReel(new Set())}
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Clear selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Highlight categories */}
      <div className="space-y-6">
        {highlights.map((category) => (
          <HighlightSection
            key={category.type}
            category={category}
            onPlayMedia={handlePlayMedia}
            onSelectForReel={toggleMediaSelection}
            selectedForReel={selectedForReel}
          />
        ))}
      </div>

      {/* No highlights state */}
      {totalHighlights === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium mb-2">No highlights detected yet</h3>
            <p className="text-sm mb-4">
              Our AI will automatically identify exciting moments as media is uploaded.
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check for highlights</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}