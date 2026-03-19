import { useEffect, useState } from 'react';

export function usePullToRefresh(onRefresh, scrollRef = null) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0;
    let isPulling = false;
    const element = scrollRef?.current || document;

    const handleTouchStart = (e) => {
      const scrollTop = scrollRef?.current ? scrollRef.current.scrollTop : window.scrollY;
      if (scrollTop <= 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling) return;
      const y = e.touches[0].clientY;
      if (y < startY) {
        isPulling = false;
      }
    };

    const handleTouchEnd = async (e) => {
      if (!isPulling) return;
      isPulling = false;
      const y = e.changedTouches[0].clientY;
      if (y - startY > 100 && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, isRefreshing, scrollRef]);

  return isRefreshing;
}