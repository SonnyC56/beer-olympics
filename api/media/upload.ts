import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Simple CORS headers
const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, matchId, tournamentId, type, testimonial, tags, uploaderId } = req.body;

    if (!fileData || !matchId || !tournamentId || !type || !uploaderId) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileData, matchId, tournamentId, type, uploaderId' 
      });
    }

    // Validate file type
    if (!['photo', 'video'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type. Must be photo or video' });
    }

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
        ...(tags || [])
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

    // Upload to Cloudinary
    const result = await (cloudinary.uploader.upload as any)(
      `data:${type === 'video' ? 'video/mp4' : 'image/jpeg'};base64,${fileData}`,
      uploadOptions
    );

    // Extract thumbnail URL
    let thumbnailUrl = result.secure_url;
    if (result.eager && result.eager.length > 0) {
      thumbnailUrl = result.eager[0].secure_url;
    }

    // Return the upload result
    const mediaResult = {
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
      aiTags: result.tags?.filter((tag: any) => 
        !['beer-olympics', `tournament-${tournamentId}`, `match-${matchId}`, `uploader-${uploaderId}`].includes(tag)
      ),
    };

    res.status(200).json({
      success: true,
      media: mediaResult,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}