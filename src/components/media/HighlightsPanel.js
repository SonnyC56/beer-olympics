import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Laugh, Crown, Timer, TrendingUp, Play, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
// Mock data for demonstration
const mockHighlights = [
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
function HighlightCard({ highlight, onPlayMedia }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, whileHover: { y: -2 }, className: "bg-white rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer", onClick: () => onPlayMedia(highlight), children: [_jsxs("div", { className: "relative", children: [_jsx("img", { src: highlight.thumbnailUrl || highlight.url, alt: highlight.testimonial || 'Highlight moment', className: "w-full h-32 object-cover" }), highlight.type === 'video' && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-colors", children: _jsx(Play, { className: "w-6 h-6 text-white" }) })), highlight.confidence && (_jsxs("div", { className: "absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1", children: [_jsx(Sparkles, { className: "w-3 h-3" }), _jsxs("span", { children: [Math.round(highlight.confidence * 100), "%"] })] }))] }), _jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("div", { className: "w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center", children: _jsx(Crown, { className: "w-3 h-3 text-gray-600" }) }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: highlight.uploaderName }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(highlight.createdAt).toLocaleDateString() })] }), highlight.testimonial && (_jsx("p", { className: "text-sm text-gray-700 mb-2 line-clamp-2", children: highlight.testimonial })), highlight.aiTags && (_jsx("div", { className: "flex flex-wrap gap-1", children: highlight.aiTags.slice(0, 2).map((tag, index) => (_jsx("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full", children: tag }, index))) }))] })] }));
}
function HighlightSection({ category, onPlayMedia, onSelectForReel, selectedForReel }) {
    const Icon = category.icon;
    if (category.media.length === 0) {
        return (_jsxs(Card, { className: "p-6 text-center", children: [_jsx(Icon, { className: `w-8 h-8 mx-auto mb-2 ${category.color}` }), _jsx("h3", { className: "font-medium text-gray-900 mb-1", children: category.title }), _jsx("p", { className: "text-sm text-gray-500", children: "No highlights detected yet" })] }));
    }
    return (_jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: `p-2 rounded-lg bg-gray-100`, children: _jsx(Icon, { className: `w-5 h-5 ${category.color}` }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: category.title }), _jsx("p", { className: "text-sm text-gray-600", children: category.description })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-sm text-gray-500", children: [category.media.length, " highlight", category.media.length !== 1 ? 's' : ''] }), _jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: category.media.map((highlight) => (_jsxs("div", { className: "relative", children: [_jsx(HighlightCard, { highlight: highlight, onPlayMedia: onPlayMedia }), _jsx("div", { className: "absolute top-2 left-2 z-10", children: _jsx("input", { type: "checkbox", checked: selectedForReel.has(highlight.id), onChange: () => onSelectForReel(highlight.id), className: "w-4 h-4 text-orange-600 bg-white border-2 border-white rounded focus:ring-orange-500 focus:ring-2 shadow-lg", onClick: (e) => e.stopPropagation() }) })] }, highlight.id))) })] }));
}
export function HighlightsPanel({ onGenerateReel, onRefreshHighlights, className }) {
    const [highlights] = useState(mockHighlights);
    const [selectedForReel, setSelectedForReel] = useState(new Set());
    const [isGeneratingReel, setIsGeneratingReel] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Toggle media selection for highlight reel
    const toggleMediaSelection = (mediaId) => {
        setSelectedForReel(prev => {
            const newSet = new Set(prev);
            if (newSet.has(mediaId)) {
                newSet.delete(mediaId);
            }
            else {
                newSet.add(mediaId);
            }
            return newSet;
        });
    };
    // Generate highlight reel
    const handleGenerateReel = async () => {
        if (selectedForReel.size === 0)
            return;
        setIsGeneratingReel(true);
        try {
            await onGenerateReel?.(Array.from(selectedForReel));
            setSelectedForReel(new Set()); // Clear selection after generation
        }
        catch (error) {
            console.error('Failed to generate highlight reel:', error);
        }
        finally {
            setIsGeneratingReel(false);
        }
    };
    // Refresh highlights
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefreshHighlights?.();
            // In a real implementation, this would fetch new highlights
        }
        catch (error) {
            console.error('Failed to refresh highlights:', error);
        }
        finally {
            setIsRefreshing(false);
        }
    };
    // Play media (opens lightbox)
    const handlePlayMedia = (media) => {
        // This would open the media in a lightbox/modal
        console.log('Playing media:', media);
    };
    const totalHighlights = highlights.reduce((sum, category) => sum + category.media.length, 0);
    return (_jsxs("div", { className: className, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg", children: _jsx(Sparkles, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "AI Highlights" }), _jsxs("p", { className: "text-sm text-gray-600", children: [totalHighlights, " moments detected automatically"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handleRefresh, disabled: isRefreshing, className: "flex items-center space-x-2", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}` }), _jsx("span", { children: "Refresh" })] }), _jsxs(Button, { onClick: handleGenerateReel, disabled: selectedForReel.size === 0 || isGeneratingReel, className: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2", children: [_jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: isGeneratingReel ? 'Generating...' : `Create Reel (${selectedForReel.size})` })] })] })] }), selectedForReel.size > 0 && (_jsx(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-purple-600" }), _jsxs("span", { className: "text-sm font-medium text-purple-900", children: [selectedForReel.size, " moment", selectedForReel.size !== 1 ? 's' : '', " selected for highlight reel"] })] }), _jsx("button", { onClick: () => setSelectedForReel(new Set()), className: "text-sm text-purple-600 hover:text-purple-800", children: "Clear selection" })] }) })), _jsx("div", { className: "space-y-6", children: highlights.map((category) => (_jsx(HighlightSection, { category: category, onPlayMedia: handlePlayMedia, onSelectForReel: toggleMediaSelection, selectedForReel: selectedForReel }, category.type))) }), totalHighlights === 0 && (_jsx(Card, { className: "p-12 text-center", children: _jsxs("div", { className: "text-gray-500", children: [_jsx(Sparkles, { className: "w-16 h-16 mx-auto mb-4 text-gray-300" }), _jsx("h3", { className: "text-xl font-medium mb-2", children: "No highlights detected yet" }), _jsx("p", { className: "text-sm mb-4", children: "Our AI will automatically identify exciting moments as media is uploaded." }), _jsxs(Button, { onClick: handleRefresh, variant: "outline", className: "flex items-center space-x-2 mx-auto", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Check for highlights" })] })] }) }))] }));
}
