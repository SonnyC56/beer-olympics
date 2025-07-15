import { useEffect, useRef, useState } from 'react';
export function useSwipeGesture(elementRef, handlers, options = {}) {
    const { threshold = 50, velocity = 0.5, disableScroll = false } = options;
    const touchData = useRef(null);
    const [isSwiping, setIsSwiping] = useState(false);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        let rafId = null;
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            touchData.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                startTime: Date.now(),
            };
            setIsSwiping(true);
        };
        const handleTouchMove = (e) => {
            if (!touchData.current)
                return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchData.current.startX;
            const deltaY = touch.clientY - touchData.current.startY;
            // Prevent scrolling if horizontal swipe is detected
            if (disableScroll && Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
            }
            // Visual feedback during swipe (optional)
            if (rafId !== null)
                cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (element.style) {
                    const transform = `translateX(${deltaX * 0.2}px)`;
                    element.style.transform = transform;
                    element.style.transition = 'none';
                }
            });
        };
        const handleTouchEnd = (e) => {
            if (!touchData.current)
                return;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchData.current.startX;
            const deltaY = touch.clientY - touchData.current.startY;
            const deltaTime = Date.now() - touchData.current.startTime;
            // Reset visual feedback
            if (element.style) {
                element.style.transform = '';
                element.style.transition = 'transform 0.3s ease-out';
            }
            // Calculate velocity
            const velocityX = Math.abs(deltaX) / deltaTime;
            const velocityY = Math.abs(deltaY) / deltaTime;
            // Determine if it was a swipe based on threshold and velocity
            const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
            const isVerticalSwipe = !isHorizontalSwipe;
            if (isHorizontalSwipe && (Math.abs(deltaX) > threshold || velocityX > velocity)) {
                if (deltaX > 0) {
                    handlers.onSwipeRight?.();
                }
                else {
                    handlers.onSwipeLeft?.();
                }
            }
            else if (isVerticalSwipe && (Math.abs(deltaY) > threshold || velocityY > velocity)) {
                if (deltaY > 0) {
                    handlers.onSwipeDown?.();
                }
                else {
                    handlers.onSwipeUp?.();
                }
            }
            touchData.current = null;
            setIsSwiping(false);
        };
        const handleTouchCancel = () => {
            // Reset everything on cancel
            if (element.style) {
                element.style.transform = '';
                element.style.transition = 'transform 0.3s ease-out';
            }
            touchData.current = null;
            setIsSwiping(false);
        };
        // Add passive: false to allow preventDefault
        const touchOptions = { passive: !disableScroll };
        element.addEventListener('touchstart', handleTouchStart, touchOptions);
        element.addEventListener('touchmove', handleTouchMove, touchOptions);
        element.addEventListener('touchend', handleTouchEnd, touchOptions);
        element.addEventListener('touchcancel', handleTouchCancel, touchOptions);
        return () => {
            if (rafId !== null)
                cancelAnimationFrame(rafId);
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchcancel', handleTouchCancel);
        };
    }, [elementRef, handlers, threshold, velocity, disableScroll]);
    return { isSwiping };
}
// Helper hook for common swipe patterns
export function useSwipeNavigation(elementRef, { onNext, onPrevious, vertical = false, }) {
    return useSwipeGesture(elementRef, vertical
        ? {
            onSwipeUp: onNext,
            onSwipeDown: onPrevious,
        }
        : {
            onSwipeLeft: onNext,
            onSwipeRight: onPrevious,
        }, {
        threshold: 50,
        velocity: 0.5,
        disableScroll: true,
    });
}
