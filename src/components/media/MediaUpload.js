import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Video, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
export function MediaUpload({ onUploadComplete, onUploadError, acceptedTypes = 'both', maxSizeMB = 50, className, }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [dragActive, setDragActive] = useState(false);
    const [testimonials, setTestimonials] = useState({});
    const fileInputRef = useRef(null);
    // Get accepted file types
    const getAcceptedTypes = () => {
        switch (acceptedTypes) {
            case 'photo':
                return 'image/jpeg,image/jpg,image/png,image/webp,image/gif';
            case 'video':
                return 'video/mp4,video/mpeg,video/quicktime,video/webm';
            default:
                return 'image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/mpeg,video/quicktime,video/webm';
        }
    };
    // Validate file
    const validateFile = (file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (acceptedTypes === 'photo' && !isImage) {
            return 'Only image files are allowed';
        }
        if (acceptedTypes === 'video' && !isVideo) {
            return 'Only video files are allowed';
        }
        if (!isImage && !isVideo) {
            return 'Only image and video files are allowed';
        }
        const maxSize = maxSizeMB * 1024 * 1024;
        if (file.size > maxSize) {
            return `File size must be less than ${maxSizeMB}MB`;
        }
        return null;
    };
    // Create file preview
    const createPreview = (file) => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            }
            else {
                // For videos, create a thumbnail
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    video.currentTime = 1; // Seek to 1 second
                };
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    resolve(canvas.toDataURL());
                };
                video.src = URL.createObjectURL(file);
            }
        });
    };
    // Handle file selection
    const handleFiles = useCallback(async (fileList) => {
        const newFiles = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const validation = validateFile(file);
            if (validation) {
                onUploadError?.(validation);
                continue;
            }
            const fileWithPreview = file;
            fileWithPreview.id = `${Date.now()}-${i}`;
            fileWithPreview.preview = await createPreview(file);
            newFiles.push(fileWithPreview);
        }
        setFiles(prev => [...prev, ...newFiles]);
    }, [maxSizeMB, acceptedTypes, onUploadError]);
    // Drag and drop handlers
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);
    // Remove file
    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        setTestimonials(prev => {
            const { [fileId]: removed, ...rest } = prev;
            return rest;
        });
    };
    // Upload files
    const uploadFiles = async () => {
        if (files.length === 0)
            return;
        setUploading(true);
        try {
            for (const file of files) {
                if (!file.id)
                    continue;
                // Convert file to base64
                const reader = new FileReader();
                const fileDataPromise = new Promise((resolve) => {
                    reader.onload = () => {
                        const result = reader.result;
                        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
                    };
                });
                reader.readAsDataURL(file);
                await fileDataPromise;
                // Simulate upload progress
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [file.id]: Math.min((prev[file.id] || 0) + 10, 90)
                    }));
                }, 100);
                try {
                    // Here you would call your upload API
                    // const result = await trpc.media.upload.mutate({
                    //   matchId,
                    //   tournamentId,
                    //   type: file.type.startsWith('image/') ? 'photo' : 'video',
                    //   fileData,
                    //   testimonial: testimonials[file.id],
                    // });
                    // Simulate API call for now
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    clearInterval(progressInterval);
                    setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
                    setTimeout(() => {
                        onUploadComplete?.({
                            id: `media_${Date.now()}`,
                            type: file.type.startsWith('image/') ? 'photo' : 'video',
                            url: file.preview,
                            name: file.name,
                        });
                    }, 500);
                }
                catch (error) {
                    clearInterval(progressInterval);
                    onUploadError?.(`Failed to upload ${file.name}`);
                }
            }
            // Clear files after successful upload
            setTimeout(() => {
                setFiles([]);
                setTestimonials({});
                setUploadProgress({});
            }, 2000);
        }
        catch (error) {
            onUploadError?.('Upload failed');
        }
        finally {
            setUploading(false);
        }
    };
    return (_jsxs(Card, { className: `p-6 ${className}`, children: [_jsx("div", { className: `border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-400'}`, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, children: _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsxs("div", { className: "flex space-x-2", children: [acceptedTypes === 'photo' || acceptedTypes === 'both' ? (_jsx(Camera, { className: "w-8 h-8 text-gray-400" })) : null, acceptedTypes === 'video' || acceptedTypes === 'both' ? (_jsx(Video, { className: "w-8 h-8 text-gray-400" })) : null, _jsx(Upload, { className: "w-8 h-8 text-gray-400" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-lg font-medium text-gray-900", children: ["Drop your ", acceptedTypes === 'both' ? 'photos and videos' : acceptedTypes, " here"] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["or", ' ', _jsx("button", { type: "button", className: "text-orange-600 hover:text-orange-500 font-medium", onClick: () => fileInputRef.current?.click(), children: "browse to upload" })] }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: ["Max size: ", maxSizeMB, "MB per file"] })] })] }) }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: getAcceptedTypes(), onChange: (e) => e.target.files && handleFiles(e.target.files), className: "hidden" }), _jsx(AnimatePresence, { children: files.length > 0 && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, className: "mt-6 space-y-4", children: [_jsx("h3", { className: "font-medium text-gray-900", children: "Files to upload" }), _jsx("div", { className: "space-y-3", children: files.map((file) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "flex items-start space-x-4 p-4 border rounded-lg", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("img", { src: file.preview, alt: file.name, className: "w-16 h-16 object-cover rounded" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: file.name }), _jsxs("p", { className: "text-xs text-gray-500", children: [(file.size / 1024 / 1024).toFixed(1), " MB"] }), _jsx("textarea", { placeholder: "Add a caption or story... (optional)", value: testimonials[file.id] || '', onChange: (e) => setTestimonials(prev => ({
                                                    ...prev,
                                                    [file.id]: e.target.value
                                                })), className: "mt-2 w-full text-sm border rounded px-2 py-1 resize-none", rows: 2, disabled: uploading }), uploadProgress[file.id] !== undefined && (_jsx("div", { className: "mt-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "flex-1 bg-gray-200 rounded-full h-2", children: _jsx(motion.div, { className: "bg-orange-500 h-2 rounded-full", initial: { width: 0 }, animate: { width: `${uploadProgress[file.id]}%` } }) }), uploadProgress[file.id] === 100 ? (_jsx(CheckCircle, { className: "w-4 h-4 text-green-500" })) : (_jsxs("span", { className: "text-xs text-gray-500", children: [uploadProgress[file.id], "%"] }))] }) }))] }), _jsx("button", { type: "button", onClick: () => removeFile(file.id), className: "flex-shrink-0 p-1 text-gray-400 hover:text-red-500", disabled: uploading, children: _jsx(X, { className: "w-4 h-4" }) })] }, file.id))) }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => {
                                        setFiles([]);
                                        setTestimonials({});
                                        setUploadProgress({});
                                    }, disabled: uploading, children: "Clear All" }), _jsx(Button, { onClick: uploadFiles, disabled: uploading || files.length === 0, className: "bg-orange-500 hover:bg-orange-600", children: uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}` })] })] })) })] }));
}
