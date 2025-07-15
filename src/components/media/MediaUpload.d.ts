interface MediaUploadProps {
    matchId?: string;
    tournamentId?: string;
    onUploadComplete?: (media: any) => void;
    onUploadError?: (error: string) => void;
    acceptedTypes?: 'photo' | 'video' | 'both';
    maxSizeMB?: number;
    className?: string;
}
export declare function MediaUpload({ onUploadComplete, onUploadError, acceptedTypes, maxSizeMB, className, }: MediaUploadProps): import("react/jsx-runtime").JSX.Element;
export {};
