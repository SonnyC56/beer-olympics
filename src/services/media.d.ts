export interface UploadOptions {
    matchId: string;
    tournamentId: string;
    uploaderId: string;
    type: 'photo' | 'video';
    tags?: string[];
    testimonial?: string;
}
export interface UploadResult {
    id: string;
    url: string;
    thumbnailUrl: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    duration?: number;
    tags?: string[];
}
export declare const ALLOWED_IMAGE_TYPES: string[];
export declare const ALLOWED_VIDEO_TYPES: string[];
export declare const MAX_IMAGE_SIZE: number;
export declare const MAX_VIDEO_SIZE: number;
declare class MediaService {
    /**
     * Upload a file to Cloudinary
     */
    uploadFile(file: Buffer | string, options: UploadOptions): Promise<UploadResult>;
    /**
     * Delete a file from Cloudinary
     */
    deleteFile(publicId: string, resourceType?: 'image' | 'video'): Promise<void>;
    /**
     * Get all media for a match
     */
    getMatchMedia(matchId: string): Promise<Record<string, unknown>[]>;
    /**
     * Get all media for a tournament
     */
    getTournamentMedia(tournamentId: string): Promise<Record<string, unknown>[]>;
    /**
     * Generate a highlight reel from tournament videos
     */
    generateHighlightReel(tournamentId: string, videoIds: string[]): Promise<string>;
    /**
     * Detect highlights using AI tags
     */
    detectHighlights(mediaIds: string[]): Promise<{
        fastestChug: string[];
        biggestUpset: string[];
        funnyMoments: string[];
    }>;
    /**
     * Validate file before upload
     */
    validateFile(file: {
        mimetype: string;
        size: number;
    }, type: 'photo' | 'video'): {
        valid: boolean;
        error?: string;
    };
}
export declare const mediaService: MediaService;
export {};
