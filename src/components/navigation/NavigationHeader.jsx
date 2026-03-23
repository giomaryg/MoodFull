import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationStack } from '@/lib/NavigationStackContext';

export default function NavigationHeader() {
  const location = useLocation();
  const { globalGoBack } = useNavigationStack();
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    };
    setIsIOS(checkIOS());
  }, []);

  // Don't show back button on root or main tabs
  if (location.pathname === '/' || location.pathname === '/Home' || location.pathname === '/RecipeGenerator') {
    return null;
  }

  return (
    <div 
      className="relative z-50 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
    >
      {!isIOS && (
        <Button variant="ghost" size="icon" onClick={globalGoBack} aria-label="Go back" className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-white shadow-sm border border-gray-100">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </Button>
      )}
      <span className={`font-semibold text-gray-800 capitalize ${!isIOS ? 'ml-4' : ''}`}>
        {location.pathname.replace('/', '').replace(/([A-Z])/g, ' $1').trim()}
      </span>
    </div>
  );
}