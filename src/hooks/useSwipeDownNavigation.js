import { useEffect, useState } from 'react';

export function useSwipeDownNavigation(threshold = 60, topAreaThreshold = 80) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let startY = null;
    let isNearTop = false;

    // Prevent desktop swipe logic if needed, but touch events naturally handle mobile
    const handleTouchStart = (e) => {
      // Only track if we are scrolled to the top of the page
      if (window.scrollY <= 0 && e.touches[0].clientY < topAreaThreshold) {
        startY = e.touches[0].clientY;
        isNearTop = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isNearTop || startY === null) return;
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Prevent triggering if scrolling down the page quickly
      if (distance > threshold) {
        setIsOpen(true);
        // Reset immediately to prevent multi-fires
        startY = null;
        isNearTop = false;
      }
    };

    const handleTouchEnd = () => {
      startY = null;
      isNearTop = false;
    };

    // Passive listeners for performance, avoiding scroll blocking
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold, topAreaThreshold]);

  return { isOpen, setIsOpen };
}