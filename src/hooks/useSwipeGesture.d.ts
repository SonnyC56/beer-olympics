interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}
export declare function useSwipeGesture(elementRef: React.RefObject<HTMLElement | null>, handlers: SwipeHandlers, options?: {
    threshold?: number;
    velocity?: number;
    disableScroll?: boolean;
}): {
    isSwiping: boolean;
};
export declare function useSwipeNavigation(elementRef: React.RefObject<HTMLElement | null>, { onNext, onPrevious, vertical, }: {
    onNext?: () => void;
    onPrevious?: () => void;
    vertical?: boolean;
}): {
    isSwiping: boolean;
};
export {};
