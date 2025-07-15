interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    caption?: string;
}
interface FeedPost {
    id: string;
    type: 'update' | 'result' | 'media' | 'achievement' | 'announcement';
    author: {
        id: string;
        name: string;
        teamId?: string;
        teamName?: string;
        teamColor?: string;
        avatar?: string;
        isOrganizer?: boolean;
    };
    content: string;
    media?: MediaItem[];
    gameData?: {
        gameId: string;
        gameName: string;
        team1: {
            name: string;
            score: number;
            color: string;
        };
        team2: {
            name: string;
            score: number;
            color: string;
        };
        winner: string;
    };
    achievement?: {
        type: 'first_win' | 'perfect_game' | 'comeback' | 'streak' | 'champion';
        title: string;
        description: string;
        icon: string;
    };
    timestamp: string;
    likes: number;
    comments: Comment[];
    hasLiked?: boolean;
}
interface Comment {
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    timestamp: string;
}
interface SocialFeedProps {
    posts: FeedPost[];
    currentUserId?: string;
    onPostCreate?: (post: Partial<FeedPost>) => void;
    onLike?: (postId: string) => void;
    onComment?: (postId: string, comment: string) => void;
    onShare?: (postId: string) => void;
    allowPosting?: boolean;
}
export default function SocialFeed({ posts: initialPosts, currentUserId, onPostCreate, onLike, onComment, onShare, allowPosting }: SocialFeedProps): import("react/jsx-runtime").JSX.Element;
export {};
