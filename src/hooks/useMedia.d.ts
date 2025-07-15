export interface MediaUploadOptions {
    matchId: string;
    tournamentId: string;
    type: 'photo' | 'video';
    file: File;
    testimonial?: string;
    tags?: string[];
}
export interface MediaQueryOptions {
    matchId?: string;
    tournamentId?: string;
    limit?: number;
    offset?: number;
}
export declare function useMedia(): {
    uploadMedia: (options: MediaUploadOptions) => Promise<{
        media: {
            id: string;
        };
        success: boolean;
    }>;
    uploadProgress: {
        [key: string]: number;
    };
    isUploading: boolean;
    uploadError: Error | null;
    deleteMedia: (mediaId: string) => Promise<void>;
    isDeleting: boolean;
    deleteError: Error | null;
    generateHighlightReel: (tournamentId: string, videoIds: string[]) => Promise<{
        success: boolean;
        reelUrl: string;
    }>;
    isGeneratingReel: boolean;
    reelError: Error | null;
    useMatchMedia: (matchId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    useTournamentMedia: (options: MediaQueryOptions) => import("@tanstack/react-query").UseQueryResult<{
        media: never[];
        total: number;
    }, Error>;
    useHighlights: (tournamentId: string) => import("@tanstack/react-query").UseQueryResult<any, Error>;
    reset: () => void;
};
export declare function useMatchMedia(matchId: string): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useTournamentMedia(tournamentId: string, options?: {
    limit?: number;
    offset?: number;
}): import("@tanstack/react-query").UseQueryResult<{
    media: never[];
    total: number;
}, Error>;
export declare function useHighlights(tournamentId: string): import("@tanstack/react-query").UseQueryResult<any, Error>;
