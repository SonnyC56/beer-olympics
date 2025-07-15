import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Images, Sparkles, Camera, Video, Users, } from 'lucide-react';
import { Card } from '../components/ui/card';
import { MediaUpload, MediaGallery, HighlightsPanel } from '../components/media';
import { useMatchMedia, useTournamentMedia, useHighlights, useMedia } from '../hooks/useMedia';
export function MediaPage() {
    const { tournamentId, matchId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'gallery');
    const { generateHighlightReel } = useMedia();
    // Data queries
    const matchMediaQuery = useMatchMedia(matchId || '');
    const tournamentMediaQuery = useTournamentMedia(tournamentId || '');
    const highlightsQuery = useHighlights(tournamentId || '');
    // Update URL when tab changes
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };
    // Handle media upload completion
    const handleUploadComplete = (media) => {
        console.log('Media uploaded:', media);
        // Refresh relevant queries
        if (matchId) {
            matchMediaQuery.refetch();
        }
        tournamentMediaQuery.refetch();
    };
    // Handle highlight reel generation
    const handleGenerateReel = async (mediaIds) => {
        if (!tournamentId)
            return;
        try {
            const result = await generateHighlightReel(tournamentId, mediaIds);
            console.log('Highlight reel generated:', result);
            // Could show a success toast here
        }
        catch (error) {
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
    const totalPhotos = mediaData.filter((m) => m.type === 'photo').length;
    const totalVideos = mediaData.filter((m) => m.type === 'video').length;
    const totalHighlights = highlightsQuery.data ?
        Object.values(highlightsQuery.data).flat().length : 0;
    const tabs = [
        {
            id: 'gallery',
            label: 'Gallery',
            icon: Images,
            count: totalMedia,
            description: 'Browse all media'
        },
        {
            id: 'upload',
            label: 'Upload',
            icon: Upload,
            count: undefined,
            description: 'Share your moments'
        },
        {
            id: 'highlights',
            label: 'AI Highlights',
            icon: Sparkles,
            count: totalHighlights,
            description: 'Automatically detected moments'
        }
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: matchId ? 'Match Media' : 'Tournament Media' }), _jsx("p", { className: "text-gray-600 mt-1", children: matchId
                                            ? 'Photos and videos from this match'
                                            : 'All media from this tournament' })] }), _jsxs("div", { className: "hidden lg:flex items-center space-x-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx(Camera, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: totalPhotos })] }), _jsx("p", { className: "text-sm text-gray-600", children: "Photos" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx(Video, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: totalVideos })] }), _jsx("p", { className: "text-sm text-gray-600", children: "Videos" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx(Sparkles, { className: "w-4 h-4 text-purple-500" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: totalHighlights })] }), _jsx("p", { className: "text-sm text-gray-600", children: "Highlights" })] })] })] }) }) }), _jsx("div", { className: "lg:hidden bg-white border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-4", children: _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx(Camera, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: totalPhotos })] }), _jsx("p", { className: "text-xs text-gray-600", children: "Photos" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx(Video, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: totalVideos })] }), _jsx("p", { className: "text-xs text-gray-600", children: "Videos" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center space-x-1", children: [_jsx(Sparkles, { className: "w-4 h-4 text-purple-500" }), _jsx("span", { className: "text-xl font-bold text-gray-900", children: totalHighlights })] }), _jsx("p", { className: "text-xs text-gray-600", children: "Highlights" })] })] }) }) }), _jsx("div", { className: "bg-white border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("nav", { className: "flex space-x-8", children: tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (_jsxs("button", { onClick: () => handleTabChange(tab.id), className: `py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${isActive
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label }), tab.count !== undefined && (_jsx("span", { className: `px-2 py-1 rounded-full text-xs ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`, children: tab.count }))] }, tab.id));
                        }) }) }) }), _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, children: [activeTab === 'upload' && (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx(MediaUpload, { matchId: matchId || '', tournamentId: tournamentId || '', onUploadComplete: handleUploadComplete, onUploadError: (error) => console.error('Upload error:', error), acceptedTypes: "both", maxSizeMB: 50 }), _jsxs(Card, { className: "mt-6 p-6", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Upload Tips" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Camera, { className: "w-4 h-4 mt-0.5 text-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Photos" }), _jsx("p", { children: "JPG, PNG, WebP, GIF up to 10MB" })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Video, { className: "w-4 h-4 mt-0.5 text-green-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Videos" }), _jsx("p", { children: "MP4, WebM, MOV up to 50MB" })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Sparkles, { className: "w-4 h-4 mt-0.5 text-purple-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "AI Detection" }), _jsx("p", { children: "Our AI will automatically tag highlights" })] })] }), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx(Users, { className: "w-4 h-4 mt-0.5 text-orange-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Share Stories" }), _jsx("p", { children: "Add captions to tell the story behind each moment" })] })] })] })] })] })), activeTab === 'gallery' && (_jsx("div", { children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" }) })) : (_jsx(MediaGallery, { media: mediaData, viewMode: "grid", showFilter: true, showUploader: true, allowDownload: true })) })), activeTab === 'highlights' && (_jsx(HighlightsPanel, { tournamentId: tournamentId || '', onGenerateReel: handleGenerateReel, onRefreshHighlights: () => highlightsQuery.refetch() }))] }, activeTab) })] }));
}
