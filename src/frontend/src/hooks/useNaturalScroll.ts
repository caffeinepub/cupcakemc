import { useEffect, useRef } from 'react';

/**
 * Custom hook that implements natural scrolling behavior site-wide.
 * When user scrolls up (wheel up or swipe up), page scrolls up.
 * When user scrolls down (wheel down or swipe down), page scrolls down.
 * On touch devices, scrolling is accelerated for faster navigation.
 */
export function useNaturalScroll(config?: { touchMultiplier?: number }) {
  const touchMultiplier = config?.touchMultiplier ?? 2.5;
  const rafIdRef = useRef<number | null>(null);
  const touchStateRef = useRef({
    startY: 0,
    isScrolling: false,
    isTouchDevice: false,
  });

  useEffect(() => {
    // Detect if device supports touch/coarse pointer
    const isTouchDevice = 
      ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) ||
      (window.matchMedia('(pointer: coarse)').matches);
    
    touchStateRef.current.isTouchDevice = isTouchDevice;

    // Handle mouse wheel events
    const handleWheel = (e: WheelEvent) => {
      // Skip if event is inside an element that should scroll normally
      const target = e.target as HTMLElement;
      if (shouldSkipCustomScroll(target)) {
        return;
      }

      e.preventDefault();
      
      // Use natural scroll direction (no multiplier for wheel)
      const delta = e.deltaY;
      
      // Apply smooth scrolling with natural direction
      window.scrollBy({
        top: delta,
        behavior: 'auto',
      });
    };

    // Handle touch start for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldSkipCustomScroll(target)) {
        return;
      }
      
      touchStateRef.current.startY = e.touches[0].clientY;
      touchStateRef.current.isScrolling = false;
    };

    // Handle touch move for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldSkipCustomScroll(target)) {
        return;
      }

      // Only apply custom scrolling on touch devices
      if (!touchStateRef.current.isTouchDevice) {
        return;
      }

      e.preventDefault();

      if (!touchStateRef.current.isScrolling) {
        touchStateRef.current.isScrolling = true;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = touchStateRef.current.startY - touchY;
      
      // Apply touch multiplier for faster scrolling on touch devices
      const delta = deltaY * touchMultiplier;
      
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Use requestAnimationFrame for smooth, batched scrolling
      rafIdRef.current = requestAnimationFrame(() => {
        window.scrollBy({
          top: delta,
          behavior: 'auto',
        });
        rafIdRef.current = null;
      });
      
      // Update touch start position for continuous scrolling
      touchStateRef.current.startY = touchY;
    };

    // Handle touch end/cancel to clean up state
    const handleTouchEnd = () => {
      touchStateRef.current.isScrolling = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    // Helper function to determine if we should skip custom scrolling for certain elements
    const shouldSkipCustomScroll = (element: HTMLElement): boolean => {
      // Check if the element or any parent is a scrollable container that should maintain normal scrolling
      let current: HTMLElement | null = element;
      
      while (current && current !== document.body) {
        // Skip custom scrolling for:
        // - Input fields, textareas, and select elements
        // - Elements with overflow scroll/auto (modals, dropdowns, etc.)
        // - Elements with data-no-scroll attribute
        const tagName = current.tagName.toLowerCase();
        const isFormElement = ['input', 'textarea', 'select'].includes(tagName);
        const hasNoScroll = current.hasAttribute('data-no-scroll');
        
        if (isFormElement || hasNoScroll) {
          return true;
        }

        // Check if element has scrollable overflow
        const computedStyle = window.getComputedStyle(current);
        const overflowY = computedStyle.overflowY;
        const isScrollable = ['auto', 'scroll'].includes(overflowY);
        
        // If element is scrollable and has content that overflows, skip custom scrolling
        if (isScrollable && current.scrollHeight > current.clientHeight) {
          return true;
        }

        current = current.parentElement;
      }
      
      return false;
    };

    // Add event listeners
    // Wheel: passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    // Touch events: only preventDefault on touchmove when needed
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [touchMultiplier]);
}
