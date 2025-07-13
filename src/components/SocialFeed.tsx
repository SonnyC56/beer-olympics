import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  PartyPopper,
  Send,
  X,
  Sparkles,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Crown,
  Smile
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption?: string;
}

interface FeedPost {
  id: string;
  type: 'update' | 'result' | 'media' | 'achievement' | 'announcement';
  author: {
    id: string;
    name: string;
    teamId?: string;
    teamName?: string;
    teamColor?: string;
    avatar?: string;
    isOrganizer?: boolean;
  };
  content: string;
  media?: MediaItem[];
  gameData?: {
    gameId: string;
    gameName: string;
    team1: { name: string; score: number; color: string };
    team2: { name: string; score: number; color: string };
    winner: string;
  };
  achievement?: {
    type: 'first_win' | 'perfect_game' | 'comeback' | 'streak' | 'champion';
    title: string;
    description: string;
    icon: string;
  };
  timestamp: string;
  likes: number;
  comments: Comment[];
  hasLiked?: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
}

interface SocialFeedProps {
  posts: FeedPost[];
  currentUserId?: string;
  onPostCreate?: (post: Partial<FeedPost>) => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  onShare?: (postId: string) => void;
  allowPosting?: boolean;
}

const ACHIEVEMENT_ICONS = {
  first_win: '🎉',
  perfect_game: '💯',
  comeback: '🔥',
  streak: '⚡',
  champion: '👑'
};

const POST_TYPE_STYLES = {
  update: 'bg-white/10',
  result: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
  media: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
  achievement: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
  announcement: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20'
};

export default function SocialFeed({
  posts: initialPosts,
  currentUserId,
  onPostCreate,
  onLike,
  onComment,
  onShare,
  allowPosting = true
}: SocialFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'updates' | 'results' | 'media' | 'achievements'>('all');
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedMedia.length > 4) {
      toast.error('Maximum 4 media items allowed per post');
      return;
    }

    setSelectedMedia(prev => [...prev, ...files]);

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const createPost = () => {
    if (!postContent.trim() && selectedMedia.length === 0) {
      toast.error('Please add content or media');
      return;
    }

    const newPost: Partial<FeedPost> = {
      content: postContent,
      type: selectedMedia.length > 0 ? 'media' : 'update',
      media: mediaPreview.map((url, index) => ({
        id: Date.now().toString() + index,
        type: selectedMedia[index].type.startsWith('video') ? 'video' : 'image',
        url,
        caption: postContent
      }))
    };

    onPostCreate?.(newPost);
    
    // Reset form
    setPostContent('');
    setSelectedMedia([]);
    setMediaPreview([]);
    setShowCreatePost(false);
    toast.success('Post created successfully!');
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.hasLiked ? post.likes - 1 : post.likes + 1, hasLiked: !post.hasLiked }
        : post
    ));
    onLike?.(postId);
  };

  const handleComment = (postId: string) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        id: currentUserId || 'user',
        name: 'You',
        avatar: '👤'
      },
      content: comment,
      timestamp: new Date().toISOString()
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    onComment?.(postId, comment);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleVideoPlay = (videoId: string) => {
    setPlayingVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        videoRefs.current[videoId]?.pause();
      } else {
        newSet.add(videoId);
        videoRefs.current[videoId]?.play();
      }
      return newSet;
    });
  };

  const toggleVideoMute = (videoId: string) => {
    setMutedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'updates') return post.type === 'update';
    if (filter === 'results') return post.type === 'result';
    if (filter === 'media') return post.type === 'media';
    if (filter === 'achievements') return post.type === 'achievement';
    return true;
  });

  const renderPost = (post: FeedPost, index: number) => {
    const isExpanded = expandedComments.has(post.id);

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className={`${POST_TYPE_STYLES[post.type]} backdrop-blur-sm`}>
          <CardContent className="p-4 space-y-3">
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-party flex items-center justify-center text-white font-bold">
                  {post.author.avatar || post.author.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-party text-white">{post.author.name}</h4>
                    {post.author.teamName && (
                      <>
                        <span className="text-white/50">•</span>
                        <span 
                          className="text-sm text-white/70"
                          style={{ color: post.author.teamColor }}
                        >
                          {post.author.teamName}
                        </span>
                      </>
                    )}
                    {post.author.isOrganizer && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-white/50">{formatTimestamp(post.timestamp)}</p>
                </div>
              </div>
              {post.type === 'announcement' && (
                <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                  <span className="text-xs font-party text-blue-400">Announcement</span>
                </div>
              )}
            </div>

            {/* Achievement Badge */}
            {post.achievement && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-victory rounded-xl p-4 text-center"
              >
                <div className="text-4xl mb-2">{ACHIEVEMENT_ICONS[post.achievement.type]}</div>
                <h3 className="font-beer text-xl text-white mb-1">{post.achievement.title}</h3>
                <p className="text-sm text-white/80">{post.achievement.description}</p>
              </motion.div>
            )}

            {/* Game Result */}
            {post.gameData && (
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-center text-sm font-party text-white/70 mb-3">
                  {post.gameData.gameName} Result
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: post.gameData.team1.color }}
                    />
                    <p className="font-party text-white">{post.gameData.team1.name}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {post.gameData.team1.score}
                    </p>
                  </div>
                  <div className="text-2xl text-white/50">VS</div>
                  <div className="text-center flex-1">
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: post.gameData.team2.color }}
                    />
                    <p className="font-party text-white">{post.gameData.team2.name}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {post.gameData.team2.score}
                    </p>
                  </div>
                </div>
                {post.gameData.winner && (
                  <div className="mt-3 text-center">
                    <span className="bg-gradient-party text-white px-3 py-1 rounded-full text-sm font-party">
                      🏆 {post.gameData.winner} Wins!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            {post.content && (
              <p className="text-white/90">{post.content}</p>
            )}

            {/* Media Grid */}
            {post.media && post.media.length > 0 && (
              <div className={`grid gap-2 ${
                post.media.length === 1 ? 'grid-cols-1' : 
                post.media.length === 2 ? 'grid-cols-2' : 
                'grid-cols-2'
              }`}>
                {post.media.map((media, mediaIndex) => (
                  <div 
                    key={media.id}
                    className={`relative rounded-xl overflow-hidden ${
                      post.media!.length === 3 && mediaIndex === 0 ? 'col-span-2' : ''
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.caption || ''}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          // Open in modal or lightbox
                        }}
                      />
                    ) : (
                      <div className="relative bg-black rounded-xl">
                        <video
                          ref={el => {
                            if (el) videoRefs.current[media.id] = el;
                          }}
                          src={media.url}
                          className="w-full h-full"
                          muted={mutedVideos.has(media.id)}
                          loop
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            onClick={() => toggleVideoPlay(media.id)}
                            variant="ghost"
                            size="icon"
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                          >
                            {playingVideos.has(media.id) ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6" />
                            )}
                          </Button>
                        </div>
                        <Button
                          onClick={() => toggleVideoMute(media.id)}
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                        >
                          {mutedVideos.has(media.id) ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.hasLiked ? 'text-party-pink' : 'text-white/70 hover:text-party-pink'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-party">{post.likes}</span>
                </button>
                
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 text-white/70 hover:text-party-cyan transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-party">{post.comments.length}</span>
                </button>
                
                <button
                  onClick={() => {
                    onShare?.(post.id);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="flex items-center gap-2 text-white/70 hover:text-party-yellow transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 pt-3 border-t border-white/10"
                >
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        {comment.author.avatar || comment.author.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white/10 rounded-xl p-3">
                          <p className="font-party text-sm text-white mb-1">{comment.author.name}</p>
                          <p className="text-sm text-white/90">{comment.content}</p>
                        </div>
                        <p className="text-xs text-white/50 mt-1">{formatTimestamp(comment.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Input
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleComment(post.id);
                        }
                      }}
                      placeholder="Add a comment..."
                      className="input-party"
                    />
                    <Button
                      onClick={() => handleComment(post.id)}
                      className="btn-party"
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Create Post */}
      {allowPosting && (
        <Card className="card-party">
          <CardContent className="p-4">
            {!showCreatePost ? (
              <button
                onClick={() => setShowCreatePost(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-party flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/70 font-party">Share your Beer Olympics moment...</span>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-party flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="What's happening at the tournament?"
                      className="input-party w-full min-h-[100px] resize-none"
                      autoFocus
                    />
                    
                    {/* Media Preview */}
                    {mediaPreview.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {mediaPreview.map((preview, index) => (
                          <div key={index} className="relative rounded-xl overflow-hidden">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              onClick={() => removeMedia(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pl-13">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Media
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      <Smile className="w-4 h-4 mr-2" />
                      Emoji
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowCreatePost(false);
                        setPostContent('');
                        setSelectedMedia([]);
                        setMediaPreview([]);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createPost}
                      className="btn-party"
                      size="sm"
                      disabled={!postContent.trim() && selectedMedia.length === 0}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All Posts', icon: Sparkles },
          { value: 'updates', label: 'Updates', icon: MessageCircle },
          { value: 'results', label: 'Results', icon: Trophy },
          { value: 'media', label: 'Photos & Videos', icon: Camera },
          { value: 'achievements', label: 'Achievements', icon: Star }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-party whitespace-nowrap transition-all ${
              filter === tab.value
                ? 'bg-gradient-party text-white shadow-glow'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredPosts.map((post, index) => renderPost(post, index))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card className="card-party">
          <CardContent className="py-12 text-center">
            <PartyPopper className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50 font-party">No posts yet. Be the first to share!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}