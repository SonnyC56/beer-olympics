import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';
// import type { Media } from '../types'; // Currently unused

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  duration?: number; // For videos
  tags?: string[];
}

// File validation constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

class MediaService {
  /**
   * Upload a file to Cloudinary
   */
  async uploadFile(
    file: Buffer | string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const { matchId, tournamentId, uploaderId, type, tags = [], testimonial } = options;
    
    // Generate unique ID for the media
    const mediaId = `media_${nanoid()}`;
    
    // Prepare upload options
    const uploadOptions = {
      public_id: `beer-olympics/${tournamentId}/${matchId}/${mediaId}`,
      resource_type: type === 'video' ? 'video' : 'image',
      folder: `beer-olympics/${tournamentId}/${matchId}`,
      tags: [
        'beer-olympics',
        `tournament-${tournamentId}`,
        `match-${matchId}`,
        `uploader-${uploaderId}`,
        ...tags
      ],
      context: {
        uploaderId,
        matchId,
        tournamentId,
        testimonial: testimonial || '',
      },
      // Add transformations for optimization
      eager: type === 'photo' ? [
        { width: 200, height: 200, crop: 'thumb', gravity: 'faces' }, // Thumbnail
        { width: 800, height: 600, crop: 'limit', quality: 'auto' }, // Display size
      ] : [
        { width: 400, height: 300, crop: 'limit', format: 'jpg' }, // Video thumbnail
      ],
      eager_async: true,
      // AI tagging for photos
      categorization: type === 'photo' ? 'google_tagging' : undefined,
      auto_tagging: type === 'photo' ? 80 : undefined,
    };

    try {
      const result = await cloudinary.uploader.upload(
        typeof file === 'string' ? file : `data:${type === 'video' ? 'video/mp4' : 'image/jpeg'};base64,${file.toString('base64')}`,
        uploadOptions as any
      );

      // Extract thumbnail URL
      let thumbnailUrl = result.secure_url;
      if (result.eager && result.eager.length > 0) {
        thumbnailUrl = result.eager[0].secure_url;
      }

      return {
        id: mediaId,
        url: result.secure_url,
        thumbnailUrl,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        duration: result.duration,
        tags: result.tags,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload media');
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete media');
    }
  }

  /**
   * Get all media for a match
   */
  async getMatchMedia(matchId: string): Promise<Record<string, unknown>[]> {
    try {
      const result = await cloudinary.search
        .expression(`tags=match-${matchId}`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      return result.resources;
    } catch (error) {
      console.error('Cloudinary search error:', error);
      throw new Error('Failed to fetch match media');
    }
  }

  /**
   * Get all media for a tournament
   */
  async getTournamentMedia(tournamentId: string): Promise<Record<string, unknown>[]> {
    try {
      const result = await cloudinary.search
        .expression(`tags=tournament-${tournamentId}`)
        .sort_by('created_at', 'desc')
        .max_results(500)
        .execute();

      return result.resources;
    } catch (error) {
      console.error('Cloudinary search error:', error);
      throw new Error('Failed to fetch tournament media');
    }
  }

  /**
   * Generate a highlight reel from tournament videos
   */
  async generateHighlightReel(tournamentId: string, videoIds: string[]): Promise<string> {
    try {
      // Create a video compilation using Cloudinary's video transformation
      const transformation = videoIds.map((id, index) => ({
        overlay: `video:${id}`,
        flags: 'splice',
        start_offset: index * 5, // 5 seconds per clip
        end_offset: (index + 1) * 5,
      }));

      const result = await cloudinary.uploader.create_slideshow({
        tag: `tournament-${tournamentId}`,
        resource_type: 'video',
        transformation,
        notification_url: process.env.VITE_APP_URL + '/api/webhooks/cloudinary',
      });

      return result.secure_url;
    } catch (error) {
      console.error('Highlight reel generation error:', error);
      throw new Error('Failed to generate highlight reel');
    }
  }

  /**
   * Detect highlights using AI tags
   */
  async detectHighlights(mediaIds: string[]): Promise<{ fastestChug: string[]; biggestUpset: string[]; funnyMoments: string[] }> {
    const highlights = {
      fastestChug: [] as string[],
      biggestUpset: [] as string[],
      funnyMoments: [] as string[],
    };

    try {
      // Fetch media details with AI tags
      for (const mediaId of mediaIds) {
        const result = await cloudinary.api.resource(mediaId, {
          colors: true,
          faces: true,
          image_metadata: true,
          tags: true,
        });

        // Analyze tags for highlight categories
        const tags = result.tags || [];
        
        // Check for fastest chug indicators
        if (tags.some((tag: string) => 
          ['drinking', 'beer', 'fast', 'speed', 'chug', 'competition'].includes(tag.toLowerCase())
        )) {
          highlights.fastestChug.push(mediaId);
        }

        // Check for upset indicators (celebration, surprise)
        if (tags.some((tag: string) => 
          ['celebration', 'victory', 'surprise', 'upset', 'winner'].includes(tag.toLowerCase())
        )) {
          highlights.biggestUpset.push(mediaId);
        }

        // Check for funny moments
        if (tags.some((tag: string) => 
          ['funny', 'laugh', 'fail', 'blooper', 'comedy'].includes(tag.toLowerCase())
        )) {
          highlights.funnyMoments.push(mediaId);
        }
      }

      return highlights;
    } catch (error) {
      console.error('Highlight detection error:', error);
      return highlights;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: { mimetype: string; size: number }, type: 'photo' | 'video'): { valid: boolean; error?: string } {
    const allowedTypes = type === 'photo' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    const maxSize = type === 'photo' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      };
    }

    return { valid: true };
  }
}

export const mediaService = new MediaService();