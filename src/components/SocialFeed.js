import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Heart, MessageCircle, Share2, Trophy, PartyPopper, Send, X, Sparkles, Star, Play, Pause, Volume2, VolumeX, Crown, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
export default function SocialFeed({ posts: initialPosts, currentUserId, onPostCreate, onLike, onComment, onShare, allowPosting = true }) {
    const [posts, setPosts] = useState(initialPosts);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [mediaPreview, setMediaPreview] = useState([]);
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [commentInputs, setCommentInputs] = useState({});
    const [filter, setFilter] = useState('all');
    const [playingVideos, setPlayingVideos] = useState(new Set());
    const [mutedVideos, setMutedVideos] = useState(new Set());
    const fileInputRef = useRef(null);
    const videoRefs = useRef({});
    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);
    const handleMediaSelect = (e) => {
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
                setMediaPreview(prev => [...prev, e.target?.result]);
            };
            reader.readAsDataURL(file);
        });
    };
    const removeMedia = (index) => {
        setSelectedMedia(prev => prev.filter((_, i) => i !== index));
        setMediaPreview(prev => prev.filter((_, i) => i !== index));
    };
    const createPost = () => {
        if (!postContent.trim() && selectedMedia.length === 0) {
            toast.error('Please add content or media');
            return;
        }
        const newPost = {
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
    const handleLike = (postId) => {
        setPosts(prev => prev.map(post => post.id === postId
            ? { ...post, likes: post.hasLiked ? post.likes - 1 : post.likes + 1, hasLiked: !post.hasLiked }
            : post));
        onLike?.(postId);
    };
    const handleComment = (postId) => {
        const comment = commentInputs[postId];
        if (!comment?.trim())
            return;
        const newComment = {
            id: Date.now().toString(),
            author: {
                id: currentUserId || 'user',
                name: 'You',
                avatar: '👤'
            },
            content: comment,
            timestamp: new Date().toISOString()
        };
        setPosts(prev => prev.map(post => post.id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        onComment?.(postId, comment);
    };
    const toggleComments = (postId) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postId)) {
                newSet.delete(postId);
            }
            else {
                newSet.add(postId);
            }
            return newSet;
        });
    };
    const toggleVideoPlay = (videoId) => {
        setPlayingVideos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(videoId)) {
                newSet.delete(videoId);
                videoRefs.current[videoId]?.pause();
            }
            else {
                newSet.add(videoId);
                videoRefs.current[videoId]?.play();
            }
            return newSet;
        });
    };
    const toggleVideoMute = (videoId) => {
        setMutedVideos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(videoId)) {
                newSet.delete(videoId);
            }
            else {
                newSet.add(videoId);
            }
            return newSet;
        });
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return date.toLocaleDateString();
    };
    const filteredPosts = posts.filter(post => {
        if (filter === 'all')
            return true;
        if (filter === 'updates')
            return post.type === 'update';
        if (filter === 'results')
            return post.type === 'result';
        if (filter === 'media')
            return post.type === 'media';
        if (filter === 'achievements')
            return post.type === 'achievement';
        return true;
    });
    const renderPost = (post, index) => {
        const isExpanded = expandedComments.has(post.id);
        return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, children: _jsx(Card, { className: `${POST_TYPE_STYLES[post.type]} backdrop-blur-sm`, children: _jsxs(CardContent, { className: "p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-party flex items-center justify-center text-white font-bold", children: post.author.avatar || post.author.name[0] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "font-party text-white", children: post.author.name }), post.author.teamName && (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-white/50", children: "\u2022" }), _jsx("span", { className: "text-sm text-white/70", style: { color: post.author.teamColor }, children: post.author.teamName })] })), post.author.isOrganizer && (_jsx(Crown, { className: "w-4 h-4 text-yellow-500" }))] }), _jsx("p", { className: "text-xs text-white/50", children: formatTimestamp(post.timestamp) })] })] }), post.type === 'announcement' && (_jsx("div", { className: "bg-blue-500/20 px-3 py-1 rounded-full", children: _jsx("span", { className: "text-xs font-party text-blue-400", children: "Announcement" }) }))] }), post.achievement && (_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: "bg-gradient-victory rounded-xl p-4 text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: ACHIEVEMENT_ICONS[post.achievement.type] }), _jsx("h3", { className: "font-beer text-xl text-white mb-1", children: post.achievement.title }), _jsx("p", { className: "text-sm text-white/80", children: post.achievement.description })] })), post.gameData && (_jsxs("div", { className: "bg-black/20 rounded-xl p-4", children: [_jsxs("p", { className: "text-center text-sm font-party text-white/70 mb-3", children: [post.gameData.gameName, " Result"] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-center flex-1", children: [_jsx("div", { className: "w-8 h-8 rounded-full mx-auto mb-2", style: { backgroundColor: post.gameData.team1.color } }), _jsx("p", { className: "font-party text-white", children: post.gameData.team1.name }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: post.gameData.team1.score })] }), _jsx("div", { className: "text-2xl text-white/50", children: "VS" }), _jsxs("div", { className: "text-center flex-1", children: [_jsx("div", { className: "w-8 h-8 rounded-full mx-auto mb-2", style: { backgroundColor: post.gameData.team2.color } }), _jsx("p", { className: "font-party text-white", children: post.gameData.team2.name }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: post.gameData.team2.score })] })] }), post.gameData.winner && (_jsx("div", { className: "mt-3 text-center", children: _jsxs("span", { className: "bg-gradient-party text-white px-3 py-1 rounded-full text-sm font-party", children: ["\uD83C\uDFC6 ", post.gameData.winner, " Wins!"] }) }))] })), post.content && (_jsx("p", { className: "text-white/90", children: post.content })), post.media && post.media.length > 0 && (_jsx("div", { className: `grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' :
                                post.media.length === 2 ? 'grid-cols-2' :
                                    'grid-cols-2'}`, children: post.media.map((media, mediaIndex) => (_jsx("div", { className: `relative rounded-xl overflow-hidden ${post.media.length === 3 && mediaIndex === 0 ? 'col-span-2' : ''}`, children: media.type === 'image' ? (_jsx("img", { src: media.url, alt: media.caption || '', className: "w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform", onClick: () => {
                                        // Open in modal or lightbox
                                    } })) : (_jsxs("div", { className: "relative bg-black rounded-xl", children: [_jsx("video", { ref: el => {
                                                if (el)
                                                    videoRefs.current[media.id] = el;
                                            }, src: media.url, className: "w-full h-full", muted: mutedVideos.has(media.id), loop: true, playsInline: true }), _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx(Button, { onClick: () => toggleVideoPlay(media.id), variant: "ghost", size: "icon", className: "bg-black/50 hover:bg-black/70 text-white rounded-full", children: playingVideos.has(media.id) ? (_jsx(Pause, { className: "w-6 h-6" })) : (_jsx(Play, { className: "w-6 h-6" })) }) }), _jsx(Button, { onClick: () => toggleVideoMute(media.id), variant: "ghost", size: "icon", className: "absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8", children: mutedVideos.has(media.id) ? (_jsx(VolumeX, { className: "w-4 h-4" })) : (_jsx(Volume2, { className: "w-4 h-4" })) })] })) }, media.id))) })), _jsx("div", { className: "flex items-center justify-between pt-2 border-t border-white/10", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { onClick: () => handleLike(post.id), className: `flex items-center gap-2 transition-colors ${post.hasLiked ? 'text-party-pink' : 'text-white/70 hover:text-party-pink'}`, children: [_jsx(Heart, { className: `w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}` }), _jsx("span", { className: "text-sm font-party", children: post.likes })] }), _jsxs("button", { onClick: () => toggleComments(post.id), className: "flex items-center gap-2 text-white/70 hover:text-party-cyan transition-colors", children: [_jsx(MessageCircle, { className: "w-5 h-5" }), _jsx("span", { className: "text-sm font-party", children: post.comments.length })] }), _jsx("button", { onClick: () => {
                                            onShare?.(post.id);
                                            toast.success('Link copied to clipboard!');
                                        }, className: "flex items-center gap-2 text-white/70 hover:text-party-yellow transition-colors", children: _jsx(Share2, { className: "w-5 h-5" }) })] }) }), _jsx(AnimatePresence, { children: isExpanded && (_jsxs(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "space-y-3 pt-3 border-t border-white/10", children: [post.comments.map((comment) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm", children: comment.author.avatar || comment.author.name[0] }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "bg-white/10 rounded-xl p-3", children: [_jsx("p", { className: "font-party text-sm text-white mb-1", children: comment.author.name }), _jsx("p", { className: "text-sm text-white/90", children: comment.content })] }), _jsx("p", { className: "text-xs text-white/50 mt-1", children: formatTimestamp(comment.timestamp) })] })] }, comment.id))), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { value: commentInputs[post.id] || '', onChange: (e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value })), onKeyPress: (e) => {
                                                    if (e.key === 'Enter') {
                                                        handleComment(post.id);
                                                    }
                                                }, placeholder: "Add a comment...", className: "input-party" }), _jsx(Button, { onClick: () => handleComment(post.id), className: "btn-party", size: "icon", children: _jsx(Send, { className: "w-4 h-4" }) })] })] })) })] }) }) }, post.id));
    };
    return (_jsxs("div", { className: "space-y-4", children: [allowPosting && (_jsx(Card, { className: "card-party", children: _jsx(CardContent, { className: "p-4", children: !showCreatePost ? (_jsxs("button", { onClick: () => setShowCreatePost(true), className: "w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-party flex items-center justify-center", children: _jsx(Sparkles, { className: "w-5 h-5 text-white" }) }), _jsx("span", { className: "text-white/70 font-party", children: "Share your Beer Olympics moment..." })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-party flex items-center justify-center", children: _jsx(Sparkles, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsx("textarea", { value: postContent, onChange: (e) => setPostContent(e.target.value), placeholder: "What's happening at the tournament?", className: "input-party w-full min-h-[100px] resize-none", autoFocus: true }), mediaPreview.length > 0 && (_jsx("div", { className: "grid grid-cols-2 gap-2", children: mediaPreview.map((preview, index) => (_jsxs("div", { className: "relative rounded-xl overflow-hidden", children: [_jsx("img", { src: preview, alt: `Preview ${index + 1}`, className: "w-full h-32 object-cover" }), _jsx("button", { onClick: () => removeMedia(index), className: "absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70", children: _jsx(X, { className: "w-4 h-4" }) })] }, index))) }))] })] }), _jsxs("div", { className: "flex items-center justify-between pl-13", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/*,video/*", multiple: true, onChange: handleMediaSelect, className: "hidden" }), _jsxs(Button, { onClick: () => fileInputRef.current?.click(), variant: "ghost", size: "sm", className: "text-white hover:bg-white/10", children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "Media"] }), _jsxs(Button, { variant: "ghost", size: "sm", className: "text-white hover:bg-white/10", children: [_jsx(Smile, { className: "w-4 h-4 mr-2" }), "Emoji"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => {
                                                    setShowCreatePost(false);
                                                    setPostContent('');
                                                    setSelectedMedia([]);
                                                    setMediaPreview([]);
                                                }, variant: "outline", size: "sm", className: "border-white/30 text-white hover:bg-white/10", children: "Cancel" }), _jsx(Button, { onClick: createPost, className: "btn-party", size: "sm", disabled: !postContent.trim() && selectedMedia.length === 0, children: "Post" })] })] })] })) }) })), _jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-2", children: [
                    { value: 'all', label: 'All Posts', icon: Sparkles },
                    { value: 'updates', label: 'Updates', icon: MessageCircle },
                    { value: 'results', label: 'Results', icon: Trophy },
                    { value: 'media', label: 'Photos & Videos', icon: Camera },
                    { value: 'achievements', label: 'Achievements', icon: Star }
                ].map((tab) => (_jsxs("button", { onClick: () => setFilter(tab.value), className: `flex items-center gap-2 px-4 py-2 rounded-xl font-party whitespace-nowrap transition-all ${filter === tab.value
                        ? 'bg-gradient-party text-white shadow-glow'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'}`, children: [_jsx(tab.icon, { className: "w-4 h-4" }), tab.label] }, tab.value))) }), _jsx("div", { className: "space-y-4", children: _jsx(AnimatePresence, { children: filteredPosts.map((post, index) => renderPost(post, index)) }) }), filteredPosts.length === 0 && (_jsx(Card, { className: "card-party", children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx(PartyPopper, { className: "w-12 h-12 text-white/30 mx-auto mb-3" }), _jsx("p", { className: "text-white/50 font-party", children: "No posts yet. Be the first to share!" })] }) }))] }));
}
