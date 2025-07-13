import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
 
 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  User,
  Clock,
  Trophy
} from 'lucide-react';
import { Card } from '../ui/card';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  uploaderId: string;
  uploaderName?: string;
  testimonial?: string;
  createdAt: string;
  matchId: string;
  tags?: string[];
  duration?: number; // For videos
}

interface MediaGalleryProps {
  media: MediaItem[];
  onMediaClick?: (media: MediaItem, index: number) => void;
  viewMode?: 'grid' | 'list';
  showFilter?: boolean;
  showUploader?: boolean;
  allowDownload?: boolean;
  className?: string;
}

interface LightboxProps {
  media: MediaItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

// Lightbox component for viewing media
function MediaLightbox({ media, currentIndex, onClose, onNext, onPrev }: LightboxProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const currentMedia = media[currentIndex];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `beer-olympics-${currentMedia.id}.${currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Beer Olympics Media',
          text: currentMedia.testimonial || 'Check out this moment from Beer Olympics!',
          url: currentMedia.url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(currentMedia.url);
      // You could show a toast notification here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Navigation */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-400 z-10"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-400 z-10"
        disabled={currentIndex === media.length - 1}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-orange-400 z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Media container */}
      <div 
        className="max-w-5xl max-h-full p-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media display */}
        <div className="relative mb-4">
          {currentMedia.type === 'photo' ? (
            <img
              src={currentMedia.url}
              alt="Beer Olympics moment"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          ) : (
            <div className="relative">
              <video
                src={currentMedia.url}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                controls
                autoPlay={isPlaying}
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video controls overlay */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Media info */}
        <div className="bg-gray-900 bg-opacity-80 text-white p-4 rounded-lg max-w-2xl">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{currentMedia.uploaderName || 'Anonymous'}</span>
              <Clock className="w-4 h-4 ml-4" />
              <span className="text-sm">
                {new Date(currentMedia.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-700 rounded-full"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-700 rounded-full"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {currentMedia.testimonial && (
            <p className="text-sm text-gray-300 mb-2">{currentMedia.testimonial}</p>
          )}
          
          {currentMedia.tags && currentMedia.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {currentMedia.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-500 bg-opacity-30 text-orange-200 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Media counter */}
        <div className="mt-4 text-white text-sm">
          {currentIndex + 1} of {media.length}
        </div>
      </div>
    </motion.div>
  );
}

export function MediaGallery({
  media,
  onMediaClick,
  viewMode = 'grid',
  showFilter = true,
  showUploader = true,
  className,
}: MediaGalleryProps) {
  const [filteredMedia, setFilteredMedia] = useState(media);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'uploader'>('newest');

  // Update filtered media when media or filter changes
  useEffect(() => {
    let filtered = [...media];
    
    // Apply type filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(item => item.type === currentFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'uploader':
          return (a.uploaderName || '').localeCompare(b.uploaderName || '');
        default:
          return 0;
      }
    });
    
    setFilteredMedia(filtered);
  }, [media, currentFilter, sortBy]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    onMediaClick?.(filteredMedia[index], index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextMedia = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredMedia.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevMedia = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  if (media.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No media yet</h3>
          <p className="text-sm">
            Be the first to capture and share moments from this match!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      {showFilter && (
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Filter tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: media.length },
              { key: 'photo', label: 'Photos', count: media.filter(m => m.type === 'photo').length },
              { key: 'video', label: 'Videos', count: media.filter(m => m.type === 'video').length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setCurrentFilter(key as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentFilter === key
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* View and sort controls */}
          <div className="flex items-center space-x-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="uploader">By uploader</option>
            </select>

            {/* View mode toggle */}
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentViewMode('grid')}
                className={`p-2 rounded ${currentViewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentViewMode('list')}
                className={`p-2 rounded ${currentViewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media grid/list */}
      <div className={
        currentViewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          : 'space-y-4'
      }>
        {filteredMedia.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={
              currentViewMode === 'grid'
                ? 'group cursor-pointer'
                : 'flex space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer'
            }
            onClick={() => openLightbox(index)}
          >
            {currentViewMode === 'grid' ? (
              // Grid view
              <Card className="overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt="Beer Olympics moment"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Overlay for videos */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-colors">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {/* Duration for videos */}
                  {item.type === 'video' && item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                
                {showUploader && (
                  <div className="p-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{item.uploaderName || 'Anonymous'}</span>
                    </div>
                    {item.testimonial && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.testimonial}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ) : (
              // List view
              <>
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24">
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt="Beer Olympics moment"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {item.uploaderName || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {item.testimonial && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-3">
                      {item.testimonial}
                    </p>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <MediaLightbox
            media={filteredMedia}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={nextMedia}
            onPrev={prevMedia}
          />
        )}
      </AnimatePresence>
    </div>
  );
}