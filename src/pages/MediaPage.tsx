import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Images, 
  Sparkles, 
  Camera, 
  Video,
  Users,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { MediaUpload, MediaGallery, HighlightsPanel } from '../components/media';
import { useMatchMedia, useTournamentMedia, useHighlights, useMedia } from '../hooks/useMedia';

type TabType = 'upload' | 'gallery' | 'highlights';

export function MediaPage() {
  const { tournamentId, matchId } = useParams<{ tournamentId: string; matchId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    (searchParams.get('tab') as TabType) || 'gallery'
  );

  const { generateHighlightReel } = useMedia();

  // Data queries
  const matchMediaQuery = useMatchMedia(matchId || '');
  const tournamentMediaQuery = useTournamentMedia(tournamentId || '');
  const highlightsQuery = useHighlights(tournamentId || '');

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Handle media upload completion
  const handleUploadComplete = (media: any) => {
    console.log('Media uploaded:', media);
    // Refresh relevant queries
    if (matchId) {
      matchMediaQuery.refetch();
    }
    tournamentMediaQuery.refetch();
  };

  // Handle highlight reel generation
  const handleGenerateReel = async (mediaIds: string[]) => {
    if (!tournamentId) return;
    
    try {
      const result = await generateHighlightReel(tournamentId, mediaIds);
      console.log('Highlight reel generated:', result);
      // Could show a success toast here
    } catch (error) {
      console.error('Failed to generate reel:', error);
      // Could show an error toast here
    }
  };

  // Get the appropriate media data based on context
  const getMediaData = () => {
    if (matchId && matchMediaQuery.data) {
      return matchMediaQuery.data;
    }
    if (tournamentMediaQuery.data) {
      return tournamentMediaQuery.data.media || [];
    }
    return [];
  };

  const mediaData = getMediaData();
  const isLoading = matchMediaQuery.isLoading || tournamentMediaQuery.isLoading;

  // Stats for the header
  const totalMedia = mediaData.length;
  const totalPhotos = mediaData.filter((m: any) => m.type === 'photo').length;
  const totalVideos = mediaData.filter((m: any) => m.type === 'video').length;
  const totalHighlights = highlightsQuery.data ? 
    Object.values(highlightsQuery.data).flat().length : 0;

  const tabs = [
    {
      id: 'gallery' as const,
      label: 'Gallery',
      icon: Images,
      count: totalMedia,
      description: 'Browse all media'
    },
    {
      id: 'upload' as const,
      label: 'Upload',
      icon: Upload,
      count: undefined,
      description: 'Share your moments'
    },
    {
      id: 'highlights' as const,
      label: 'AI Highlights',
      icon: Sparkles,
      count: totalHighlights,
      description: 'Automatically detected moments'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {matchId ? 'Match Media' : 'Tournament Media'}
              </h1>
              <p className="text-gray-600 mt-1">
                {matchId 
                  ? 'Photos and videos from this match' 
                  : 'All media from this tournament'
                }
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Camera className="w-4 h-4 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">{totalPhotos}</span>
                </div>
                <p className="text-sm text-gray-600">Photos</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Video className="w-4 h-4 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">{totalVideos}</span>
                </div>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-2xl font-bold text-gray-900">{totalHighlights}</span>
                </div>
                <p className="text-sm text-gray-600">Highlights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="lg:hidden bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Camera className="w-4 h-4 text-blue-500" />
                <span className="text-xl font-bold text-gray-900">{totalPhotos}</span>
              </div>
              <p className="text-xs text-gray-600">Photos</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Video className="w-4 h-4 text-green-500" />
                <span className="text-xl font-bold text-gray-900">{totalVideos}</span>
              </div>
              <p className="text-xs text-gray-600">Videos</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xl font-bold text-gray-900">{totalHighlights}</span>
              </div>
              <p className="text-xs text-gray-600">Highlights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    isActive
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto">
              <MediaUpload
                matchId={matchId || ''}
                tournamentId={tournamentId || ''}
                onUploadComplete={handleUploadComplete}
                onUploadError={(error) => console.error('Upload error:', error)}
                acceptedTypes="both"
                maxSizeMB={50}
              />
              
              {/* Upload tips */}
              <Card className="mt-6 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Upload Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Camera className="w-4 h-4 mt-0.5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Photos</p>
                      <p>JPG, PNG, WebP, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Video className="w-4 h-4 mt-0.5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Videos</p>
                      <p>MP4, WebM, MOV up to 50MB</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 mt-0.5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">AI Detection</p>
                      <p>Our AI will automatically tag highlights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 mt-0.5 text-orange-500" />
                    <div>
                      <p className="font-medium text-gray-900">Share Stories</p>
                      <p>Add captions to tell the story behind each moment</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <MediaGallery
                  media={mediaData}
                  viewMode="grid"
                  showFilter={true}
                  showUploader={true}
                  allowDownload={true}
                />
              )}
            </div>
          )}

          {activeTab === 'highlights' && (
            <HighlightsPanel
              tournamentId={tournamentId || ''}
              onGenerateReel={handleGenerateReel}
              onRefreshHighlights={() => highlightsQuery.refetch()}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}