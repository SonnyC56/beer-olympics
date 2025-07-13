# Beer Olympics Media System

The Beer Olympics media system provides comprehensive photo and video upload, management, and AI-powered highlight detection capabilities.

## Features

### 🎥 Media Upload & Management
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **File Validation**: Automatic validation for file types and sizes
- **Cloud Storage**: Cloudinary integration for optimized media delivery
- **Thumbnails**: Automatic thumbnail generation for videos and images
- **Testimonials**: Users can add captions and stories to their uploads

### 🤖 AI-Powered Features
- **Auto Tagging**: Cloudinary's AI automatically tags uploaded content
- **Highlight Detection**: Identifies exciting moments like:
  - ⚡ Fastest chugs
  - 🏆 Biggest upsets  
  - 😂 Funny moments
- **Highlight Reels**: Generate automatic video compilations
- **Content Moderation**: AI-assisted content filtering

### 📱 Real-time Updates
- **Live Uploads**: Real-time notifications when media is uploaded
- **Instant Gallery**: Gallery updates automatically with new content
- **Highlight Alerts**: Notifications when AI detects special moments

## Architecture

### Backend Components

#### Media Service (`src/services/media.ts`)
Core service handling Cloudinary integration:
- File upload/delete operations
- Media validation and processing
- AI tag analysis and highlight detection
- Thumbnail generation

#### Media Router (`src/api/routers/media.ts`)
tRPC router providing API endpoints:
- `upload` - Upload new media
- `getMatchMedia` - Get media for specific match
- `getTournamentMedia` - Get all tournament media
- `getHighlights` - Get AI-detected highlights
- `generateHighlightReel` - Create video compilations
- `delete` - Remove media (owner/uploader only)

#### Real-time Service (`src/services/realtime-server.ts`)
Server-side event emission for:
- Media upload notifications
- Highlight detection alerts
- Gallery updates

### Frontend Components

#### MediaUpload (`src/components/media/MediaUpload.tsx`)
- Drag & drop interface
- File preview with progress
- Testimonial input
- Multi-file upload support

#### MediaGallery (`src/components/media/MediaGallery.tsx`)
- Grid/list view modes
- Filter by type (photo/video)
- Lightbox viewer with navigation
- Download and share functionality

#### HighlightsPanel (`src/components/media/HighlightsPanel.tsx`)
- AI-detected highlight categories
- Highlight reel creation interface
- Confidence scores and AI tags

#### MediaPage (`src/pages/MediaPage.tsx`)
- Complete media management interface
- Tabbed navigation (Upload/Gallery/Highlights)
- Stats and overview dashboard

### Hooks & Utilities

#### useMedia Hook (`src/hooks/useMedia.ts`)
React hook providing:
- Upload functionality with progress tracking
- Media queries for matches and tournaments
- Highlight data fetching
- Delete operations

## Configuration

### Environment Variables

Required for Cloudinary integration:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Real-time (optional)
VITE_PUSHER_KEY=your-pusher-key
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
VITE_PUSHER_CLUSTER=your-pusher-cluster
```

### Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret from the dashboard
3. Enable auto-tagging and categorization in settings
4. Configure upload presets if needed

## File Structure

```
src/
├── components/media/
│   ├── MediaUpload.tsx      # Upload interface
│   ├── MediaGallery.tsx     # Gallery viewer
│   ├── HighlightsPanel.tsx  # AI highlights
│   └── index.ts             # Exports
├── services/
│   ├── media.ts             # Core media service
│   └── realtime-server.ts   # Server-side events
├── hooks/
│   └── useMedia.ts          # Media React hooks
├── pages/
│   └── MediaPage.tsx        # Main media interface
└── api/
    └── routers/
        └── media.ts         # tRPC router

api/
└── media/
    └── upload.ts            # Vercel upload endpoint
```

## Usage Examples

### Basic Upload
```tsx
import { MediaUpload } from '@/components/media';

function MatchPage({ matchId, tournamentId }) {
  return (
    <MediaUpload
      matchId={matchId}
      tournamentId={tournamentId}
      onUploadComplete={(media) => console.log('Uploaded:', media)}
      acceptedTypes="both"
      maxSizeMB={50}
    />
  );
}
```

### Gallery Display
```tsx
import { MediaGallery } from '@/components/media';
import { useMatchMedia } from '@/hooks/useMedia';

function MatchGallery({ matchId }) {
  const { data: media, isLoading } = useMatchMedia(matchId);
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <MediaGallery
      media={media}
      viewMode="grid"
      showFilter={true}
      allowDownload={true}
    />
  );
}
```

### Highlights Panel
```tsx
import { HighlightsPanel } from '@/components/media';
import { useMedia } from '@/hooks/useMedia';

function TournamentHighlights({ tournamentId }) {
  const { generateHighlightReel } = useMedia();
  
  return (
    <HighlightsPanel
      tournamentId={tournamentId}
      onGenerateReel={(mediaIds) => generateHighlightReel(tournamentId, mediaIds)}
    />
  );
}
```

## API Reference

### Media Upload
```typescript
POST /api/trpc/media.upload
{
  matchId: string;
  tournamentId: string;
  type: 'photo' | 'video';
  fileData: string; // Base64 encoded
  testimonial?: string;
  tags?: string[];
}
```

### Get Match Media
```typescript
GET /api/trpc/media.getMatchMedia
{
  matchId: string;
}
```

### Get Highlights
```typescript
GET /api/trpc/media.getHighlights
{
  tournamentId: string;
}
```

## File Limits

| Type | Max Size | Formats |
|------|----------|---------|
| Photos | 10MB | JPG, PNG, WebP, GIF |
| Videos | 50MB | MP4, WebM, MOV |

## AI Features

### Auto-Tagging
Cloudinary's AI automatically tags content with:
- Object detection (beer, people, celebrations)
- Activity recognition (drinking, cheering, etc.)
- Emotion detection (happy, surprised, etc.)

### Highlight Detection
Custom AI logic identifies:
- **Fastest Chugs**: Speed-related tags and drinking actions
- **Biggest Upsets**: Celebration and victory indicators
- **Funny Moments**: Comedy and fail-related content

### Confidence Scores
All AI detections include confidence scores (0-1) to help filter results.

## Performance

### Optimization Features
- Automatic image optimization via Cloudinary
- Responsive image delivery
- Video thumbnail generation
- Progressive loading
- Lazy loading for gallery views

### Caching
- Cloudinary CDN for fast global delivery
- Browser caching for thumbnails
- API response caching via React Query

## Security

### Upload Security
- File type validation
- Size limit enforcement
- User authentication required
- Rate limiting on uploads

### Access Control
- Users can only delete their own uploads
- Admins can moderate all content
- Public viewing of approved content

## Monitoring

### Analytics
- Upload success/failure rates
- File size distributions
- Popular content types
- AI tagging accuracy

### Alerts
- Failed uploads
- Storage quota warnings
- Content moderation flags

## Future Enhancements

### Planned Features
- [ ] Live streaming integration
- [ ] Advanced video editing
- [ ] Social sharing improvements
- [ ] Enhanced AI moderation
- [ ] Batch operations
- [ ] Mobile app support

### AI Improvements
- [ ] Custom model training
- [ ] More highlight categories
- [ ] Sentiment analysis
- [ ] Face recognition for tagging
- [ ] Action sequence detection