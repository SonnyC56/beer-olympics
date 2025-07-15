interface MediaItem {
    id: string;
    type: 'photo' | 'video';
    url: string;
    thumbnailUrl?: string;
    uploaderId: string;
    uploaderName?: string;
    testimonial?: string;
    createdAt: string;
    matchId: string;
    tags?: string[];
    duration?: number;
}
interface MediaGalleryProps {
    media: MediaItem[];
    onMediaClick?: (media: MediaItem, index: number) => void;
    viewMode?: 'grid' | 'list';
    showFilter?: boolean;
    showUploader?: boolean;
    allowDownload?: boolean;
    className?: string;
}
export declare function MediaGallery({ media, onMediaClick, viewMode, showFilter, showUploader, className, }: MediaGalleryProps): import("react/jsx-runtime").JSX.Element;
export {};
