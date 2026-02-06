import { useEffect } from 'react';

/**
 * Custom hook that implements natural scrolling behavior site-wide.
 * When user scrolls up (wheel up or swipe up), page scrolls up.
 * When user scrolls down (wheel down or swipe down), page scrolls down.
 * This is the standard, expected scrolling behavior.
 */
export function useNaturalScroll() {
  useEffect(() => {
    let touchStartY = 0;
    let isScrolling = false;

    // Handle mouse wheel events
    const handleWheel = (e: WheelEvent) => {
      // Skip if event is inside an element that should scroll normally
      const target = e.target as HTMLElement;
      if (shouldSkipCustomScroll(target)) {
        return;
      }

      e.preventDefault();
      
      // Use natural scroll direction
      const delta = e.deltaY;
      
      // Apply smooth scrolling with natural direction
      window.scrollBy({
        top: delta,
        behavior: 'auto', // Use 'auto' for immediate response, feels more natural
      });
    };

    // Handle touch start for mobile devices
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldSkipCustomScroll(target)) {
        return;
      }
      
      touchStartY = e.touches[0].clientY;
      isScrolling = false;
    };

    // Handle touch move for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (shouldSkipCustomScroll(target)) {
        return;
      }

      if (!isScrolling) {
        isScrolling = true;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      
      // Use natural scroll direction for touch
      const delta = deltaY;
      
      // Apply the natural scroll
      window.scrollBy({
        top: delta,
        behavior: 'auto',
      });
      
      // Update touch start position for continuous scrolling
      touchStartY = touchY;
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

    // Add event listeners with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
}
