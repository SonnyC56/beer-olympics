import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Grid, List, User, Clock, Trophy } from 'lucide-react';
import { Card } from '../ui/card';
// Lightbox component for viewing media
function MediaLightbox({ media, currentIndex, onClose, onNext, onPrev }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const currentMedia = media[currentIndex];
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
            if (e.key === 'ArrowLeft')
                onPrev();
            if (e.key === 'ArrowRight')
                onNext();
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
        }
        catch (error) {
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
            }
            catch (error) {
                console.log('Share cancelled');
            }
        }
        else {
            // Fallback to copying URL
            navigator.clipboard.writeText(currentMedia.url);
            // You could show a toast notification here
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center", onClick: onClose, children: [_jsx("button", { onClick: (e) => { e.stopPropagation(); onPrev(); }, className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-400 z-10", disabled: currentIndex === 0, children: _jsx(ChevronLeft, { className: "w-8 h-8" }) }), _jsx("button", { onClick: (e) => { e.stopPropagation(); onNext(); }, className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-400 z-10", disabled: currentIndex === media.length - 1, children: _jsx(ChevronRight, { className: "w-8 h-8" }) }), _jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-white hover:text-orange-400 z-10", children: _jsx(X, { className: "w-8 h-8" }) }), _jsxs("div", { className: "max-w-5xl max-h-full p-4 flex flex-col items-center", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "relative mb-4", children: currentMedia.type === 'photo' ? (_jsx("img", { src: currentMedia.url, alt: "Beer Olympics moment", className: "max-w-full max-h-[70vh] object-contain rounded-lg" })) : (_jsxs("div", { className: "relative", children: [_jsx("video", { src: currentMedia.url, className: "max-w-full max-h-[70vh] object-contain rounded-lg", controls: true, autoPlay: isPlaying, muted: isMuted, onPlay: () => setIsPlaying(true), onPause: () => setIsPlaying(false) }), _jsxs("div", { className: "absolute bottom-4 left-4 flex space-x-2", children: [_jsx("button", { onClick: () => setIsPlaying(!isPlaying), className: "bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70", children: isPlaying ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setIsMuted(!isMuted), className: "bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70", children: isMuted ? _jsx(VolumeX, { className: "w-4 h-4" }) : _jsx(Volume2, { className: "w-4 h-4" }) })] })] })) }), _jsxs("div", { className: "bg-gray-900 bg-opacity-80 text-white p-4 rounded-lg max-w-2xl", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm", children: currentMedia.uploaderName || 'Anonymous' }), _jsx(Clock, { className: "w-4 h-4 ml-4" }), _jsx("span", { className: "text-sm", children: new Date(currentMedia.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: handleShare, className: "p-2 hover:bg-gray-700 rounded-full", title: "Share", children: _jsx(Share2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleDownload, className: "p-2 hover:bg-gray-700 rounded-full", title: "Download", children: _jsx(Download, { className: "w-4 h-4" }) })] })] }), currentMedia.testimonial && (_jsx("p", { className: "text-sm text-gray-300 mb-2", children: currentMedia.testimonial })), currentMedia.tags && currentMedia.tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-1", children: currentMedia.tags.map((tag, index) => (_jsxs("span", { className: "px-2 py-1 bg-orange-500 bg-opacity-30 text-orange-200 text-xs rounded-full", children: ["#", tag] }, index))) }))] }), _jsxs("div", { className: "mt-4 text-white text-sm", children: [currentIndex + 1, " of ", media.length] })] })] }));
}
export function MediaGallery({ media, onMediaClick, viewMode = 'grid', showFilter = true, showUploader = true, className, }) {
    const [filteredMedia, setFilteredMedia] = useState(media);
    const [currentFilter, setCurrentFilter] = useState('all');
    const [currentViewMode, setCurrentViewMode] = useState(viewMode);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
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
    const openLightbox = (index) => {
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
        return (_jsx(Card, { className: `p-8 text-center ${className}`, children: _jsxs("div", { className: "text-gray-500", children: [_jsx(Trophy, { className: "w-12 h-12 mx-auto mb-4 text-gray-300" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No media yet" }), _jsx("p", { className: "text-sm", children: "Be the first to capture and share moments from this match!" })] }) }));
    }
    return (_jsxs("div", { className: className, children: [showFilter && (_jsxs("div", { className: "flex flex-wrap items-center justify-between mb-6 gap-4", children: [_jsx("div", { className: "flex space-x-1 bg-gray-100 rounded-lg p-1", children: [
                            { key: 'all', label: 'All', count: media.length },
                            { key: 'photo', label: 'Photos', count: media.filter(m => m.type === 'photo').length },
                            { key: 'video', label: 'Videos', count: media.filter(m => m.type === 'video').length },
                        ].map(({ key, label, count }) => (_jsxs("button", { onClick: () => setCurrentFilter(key), className: `px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentFilter === key
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'}`, children: [label, " (", count, ")"] }, key))) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "text-sm border border-gray-300 rounded-md px-2 py-1", children: [_jsx("option", { value: "newest", children: "Newest first" }), _jsx("option", { value: "oldest", children: "Oldest first" }), _jsx("option", { value: "uploader", children: "By uploader" })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => setCurrentViewMode('grid'), className: `p-2 rounded ${currentViewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`, children: _jsx(Grid, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => setCurrentViewMode('list'), className: `p-2 rounded ${currentViewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`, children: _jsx(List, { className: "w-4 h-4" }) })] })] })] })), _jsx("div", { className: currentViewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-4', children: filteredMedia.map((item, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.05 }, className: currentViewMode === 'grid'
                        ? 'group cursor-pointer'
                        : 'flex space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer', onClick: () => openLightbox(index), children: currentViewMode === 'grid' ? (
                    // Grid view
                    _jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "relative aspect-square", children: [_jsx("img", { src: item.thumbnailUrl || item.url, alt: "Beer Olympics moment", className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" }), item.type === 'video' && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-colors", children: _jsx(Play, { className: "w-8 h-8 text-white" }) })), item.type === 'video' && item.duration && (_jsxs("div", { className: "absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded", children: [Math.floor(item.duration / 60), ":", (item.duration % 60).toString().padStart(2, '0')] }))] }), showUploader && (_jsxs("div", { className: "p-3", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(User, { className: "w-3 h-3" }), _jsx("span", { children: item.uploaderName || 'Anonymous' })] }), item.testimonial && (_jsx("p", { className: "text-xs text-gray-500 mt-1 line-clamp-2", children: item.testimonial }))] }))] })) : (
                    // List view
                    _jsxs(_Fragment, { children: [_jsx("div", { className: "flex-shrink-0", children: _jsxs("div", { className: "relative w-24 h-24", children: [_jsx("img", { src: item.thumbnailUrl || item.url, alt: "Beer Olympics moment", className: "w-full h-full object-cover rounded-lg" }), item.type === 'video' && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg", children: _jsx(Play, { className: "w-4 h-4 text-white" }) }))] }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("span", { className: "text-sm font-medium text-gray-900", children: item.uploaderName || 'Anonymous' }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(item.createdAt).toLocaleDateString() })] }), item.testimonial && (_jsx("p", { className: "text-sm text-gray-700 mb-2 line-clamp-3", children: item.testimonial })), item.tags && item.tags.length > 0 && (_jsxs("div", { className: "flex flex-wrap gap-1", children: [item.tags.slice(0, 3).map((tag, tagIndex) => (_jsxs("span", { className: "px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full", children: ["#", tag] }, tagIndex))), item.tags.length > 3 && (_jsxs("span", { className: "text-xs text-gray-500", children: ["+", item.tags.length - 3, " more"] }))] }))] })] })) }, item.id))) }), _jsx(AnimatePresence, { children: lightboxIndex !== null && (_jsx(MediaLightbox, { media: filteredMedia, currentIndex: lightboxIndex, onClose: closeLightbox, onNext: nextMedia, onPrev: prevMedia })) })] }));
}
