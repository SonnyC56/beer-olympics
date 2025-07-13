import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Video, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface MediaUploadProps {
  matchId?: string;
  tournamentId?: string;
  onUploadComplete?: (media: any) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: 'photo' | 'video' | 'both';
  maxSizeMB?: number;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

export function MediaUpload({
  onUploadComplete,
  onUploadError,
  acceptedTypes = 'both',
  maxSizeMB = 50,
  className,
}: MediaUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState(false);
  const [testimonials, setTestimonials] = useState<{ [key: string]: string }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const validateFile = (file: File): string | null => {
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
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
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
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        };
        video.src = URL.createObjectURL(file);
      }
    });
  };

  // Handle file selection
  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const validation = validateFile(file);
      
      if (validation) {
        onUploadError?.(validation);
        continue;
      }

      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.id = `${Date.now()}-${i}`;
      fileWithPreview.preview = await createPreview(file);
      newFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [maxSizeMB, acceptedTypes, onUploadError]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setTestimonials(prev => {
      const { [fileId]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Upload files
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      for (const file of files) {
        if (!file.id) continue;
        
        // Convert file to base64
        const reader = new FileReader();
        const fileDataPromise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          };
        });
        reader.readAsDataURL(file);
        await fileDataPromise;

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.id!]: Math.min((prev[file.id!] || 0) + 10, 90)
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
          setUploadProgress(prev => ({ ...prev, [file.id!]: 100 }));
          
          setTimeout(() => {
            onUploadComplete?.({
              id: `media_${Date.now()}`,
              type: file.type.startsWith('image/') ? 'photo' : 'video',
              url: file.preview,
              name: file.name,
            });
          }, 500);
        } catch (error) {
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
    } catch (error) {
      onUploadError?.('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-orange-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {acceptedTypes === 'photo' || acceptedTypes === 'both' ? (
              <Camera className="w-8 h-8 text-gray-400" />
            ) : null}
            {acceptedTypes === 'video' || acceptedTypes === 'both' ? (
              <Video className="w-8 h-8 text-gray-400" />
            ) : null}
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              Drop your {acceptedTypes === 'both' ? 'photos and videos' : acceptedTypes} here
            </p>
            <p className="text-sm text-gray-500">
              or{' '}
              <button
                type="button"
                className="text-orange-600 hover:text-orange-500 font-medium"
                onClick={() => fileInputRef.current?.click()}
              >
                browse to upload
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: {maxSizeMB}MB per file
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptedTypes()}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4"
          >
            <h3 className="font-medium text-gray-900">Files to upload</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    
                    {/* Testimonial Input */}
                    <textarea
                      placeholder="Add a caption or story... (optional)"
                      value={testimonials[file.id!] || ''}
                      onChange={(e) => setTestimonials(prev => ({
                        ...prev,
                        [file.id!]: e.target.value
                      }))}
                      className="mt-2 w-full text-sm border rounded px-2 py-1 resize-none"
                      rows={2}
                      disabled={uploading}
                    />

                    {/* Progress Bar */}
                    {uploadProgress[file.id!] !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <motion.div
                              className="bg-orange-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress[file.id!]}%` }}
                            />
                          </div>
                          {uploadProgress[file.id!] === 100 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <span className="text-xs text-gray-500">
                              {uploadProgress[file.id!]}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(file.id!)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  setTestimonials({});
                  setUploadProgress({});
                }}
                disabled={uploading}
              >
                Clear All
              </Button>
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}