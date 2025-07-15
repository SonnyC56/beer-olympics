import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpc } from '../utils/trpc';
export function useMedia() {
    const queryClient = useQueryClient();
    const [uploadProgress, setUploadProgress] = useState({});
    // Upload media mutation
    const uploadMutation = useMutation({
        mutationFn: async (options) => {
            const { file } = options;
            // Convert file to base64
            const reader = new FileReader();
            const fileDataPromise = new Promise((resolve) => {
                reader.onload = () => {
                    const result = reader.result;
                    resolve(result.split(',')[1]); // Remove data URL prefix
                };
            });
            reader.readAsDataURL(file);
            await fileDataPromise;
            // Simulate upload progress
            const fileId = `${Date.now()}-${Math.random()}`;
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => ({
                    ...prev,
                    [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
                }));
            }, 200);
            try {
                // TODO: Replace with actual tRPC mutation
                const result = await Promise.resolve({ media: { id: 'temp-id' }, success: true });
                // const result = await trpc.media.upload.mutateAsync({
                //   ...rest,
                //   fileData,
                // });
                clearInterval(progressInterval);
                setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
                // Remove progress after completion
                setTimeout(() => {
                    setUploadProgress(prev => {
                        const { [fileId]: removed, ...rest } = prev;
                        return rest;
                    });
                }, 2000);
                return result;
            }
            catch (error) {
                clearInterval(progressInterval);
                setUploadProgress(prev => {
                    const { [fileId]: removed, ...rest } = prev;
                    return rest;
                });
                throw error;
            }
        },
        onSuccess: (_data, variables) => {
            // Invalidate and refetch media queries
            queryClient.invalidateQueries({
                queryKey: ['media', 'match', variables.matchId]
            });
            queryClient.invalidateQueries({
                queryKey: ['media', 'tournament', variables.tournamentId]
            });
        },
    });
    // Delete media mutation
    const deleteMutation = useMutation({
        mutationFn: async (mediaId) => {
            // TODO: Replace with actual tRPC mutation
            console.log('Delete media:', mediaId);
            return Promise.resolve();
        },
        onSuccess: () => {
            // Invalidate all media queries
            queryClient.invalidateQueries({
                queryKey: ['media']
            });
        },
    });
    // Generate highlight reel mutation
    const generateReelMutation = useMutation({
        mutationFn: ({ tournamentId, videoIds }) => 
        // TODO: Replace with actual tRPC mutation
        Promise.resolve({ success: true, reelUrl: 'temp-url' }),
    });
    // Query hooks
    const useMatchMedia = (matchId) => {
        return useQuery({
            queryKey: ['media', 'match', matchId],
            queryFn: () => trpc.media.getMatchMedia.fetch({ matchId }),
            enabled: !!matchId,
        });
    };
    const useTournamentMedia = (options) => {
        return useQuery({
            queryKey: ['media', 'tournament', options.tournamentId, options.limit, options.offset],
            queryFn: async () => {
                // TODO: Replace with actual tRPC query
                return { media: [], total: 0 };
            },
            enabled: !!options.tournamentId,
        });
    };
    const useHighlights = (tournamentId) => {
        return useQuery({
            queryKey: ['media', 'highlights', tournamentId],
            queryFn: () => trpc.media.getHighlights.fetch({ tournamentId }),
            enabled: !!tournamentId,
        });
    };
    // Upload helper function
    const uploadMedia = useCallback(async (options) => {
        return uploadMutation.mutateAsync(options);
    }, [uploadMutation]);
    // Delete helper function
    const deleteMedia = useCallback(async (mediaId) => {
        return deleteMutation.mutateAsync(mediaId);
    }, [deleteMutation]);
    // Generate reel helper function
    const generateHighlightReel = useCallback(async (tournamentId, videoIds) => {
        return generateReelMutation.mutateAsync({ tournamentId, videoIds });
    }, [generateReelMutation]);
    return {
        // Upload functions
        uploadMedia,
        uploadProgress,
        isUploading: uploadMutation.isPending,
        uploadError: uploadMutation.error,
        // Delete functions
        deleteMedia,
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error,
        // Highlight reel functions
        generateHighlightReel,
        isGeneratingReel: generateReelMutation.isPending,
        reelError: generateReelMutation.error,
        // Query hooks
        useMatchMedia,
        useTournamentMedia,
        useHighlights,
        // Utilities
        reset: () => {
            uploadMutation.reset();
            deleteMutation.reset();
            generateReelMutation.reset();
            setUploadProgress({});
        },
    };
}
// Hook specifically for match media
export function useMatchMedia(matchId) {
    const { useMatchMedia } = useMedia();
    return useMatchMedia(matchId);
}
// Hook specifically for tournament media
export function useTournamentMedia(tournamentId, options) {
    const { useTournamentMedia } = useMedia();
    return useTournamentMedia({ tournamentId, ...options });
}
// Hook specifically for highlights
export function useHighlights(tournamentId) {
    const { useHighlights } = useMedia();
    return useHighlights(tournamentId);
}
