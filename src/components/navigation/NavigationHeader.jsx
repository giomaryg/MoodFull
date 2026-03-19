import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NavigationHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on root or main tabs
  if (location.pathname === '/' || location.pathname === '/Home' || location.pathname === '/RecipeGenerator') {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center"
      style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
    >
      <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-11 w-11 rounded-full bg-white shadow-sm border border-gray-100">
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </Button>
      <span className="ml-4 font-semibold text-gray-800 capitalize">
        {location.pathname.replace('/', '').replace(/([A-Z])/g, ' $1').trim()}
      </span>
    </div>
  );
}