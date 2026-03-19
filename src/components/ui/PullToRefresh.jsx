import React from 'react';
import { Loader2 } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

export function PullToRefresh({ onRefresh, children, className = "", isGlobal = false }) {
  const scrollRef = React.useRef(null);
  const isRefreshing = usePullToRefresh(onRefresh, isGlobal ? null : scrollRef);

  if (isGlobal) {
    return (
      <>
        {isRefreshing && (
          <div className="fixed top-[env(safe-area-inset-top)] left-0 right-0 flex justify-center z-50 pt-4 pointer-events-none">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Loader2 className="w-6 h-6 text-[#6b9b76] animate-spin" />
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div ref={scrollRef} className={`relative ${className}`}>
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 flex justify-center z-50 pt-4 pointer-events-none">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <Loader2 className="w-6 h-6 text-[#6b9b76] animate-spin" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}