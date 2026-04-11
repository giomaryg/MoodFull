import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookMarked, User, Calendar, Package, BarChart2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SwipeDownNav({ isOpen, onClose, activeTab, onTabChange, enablePantry = true }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saved', label: 'Saved', icon: BookMarked },
    { id: 'planner', label: 'Planner', icon: Calendar },
    ...(enablePantry ? [{ id: 'inventory', label: 'Pantry', icon: Package }] : []),
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
    { id: 'account', label: 'Account', icon: User }
  ];

  // Prevent body scroll when navigation overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Swipe up to dismiss gesture
  useEffect(() => {
    if (!isOpen) return;
    let startY = null;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      if (startY !== null) {
        const distance = startY - e.touches[0].clientY;
        // If swiped up by 40px, close the overlay
        if (distance > 40) {
          onClose();
          startY = null;
        }
      }
    };
    
    const handleTouchEnd = () => {
      startY = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-start">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Main dropdown panel */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full bg-white/95 backdrop-blur-md border-b border-[#c5d9c9] shadow-2xl rounded-b-[2rem]"
            style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
          >
            <div className="px-4 pb-6 pt-2 space-y-4 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-bold text-lg text-[#3d5244] tracking-tight">Quick Menu</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose} 
                  className="rounded-full h-8 w-8 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      onClick={() => {
                        onTabChange(tab.id);
                        onClose();
                      }}
                      className={`flex flex-col h-auto gap-2 py-4 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-[#6b9b76]/10 text-[#3d5244] border border-[#6b9b76]/40 shadow-sm' 
                          : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100 shadow-sm'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'text-[#6b9b76]' : ''}`} />
                      <span className={`text-xs font-medium ${isActive ? 'text-[#3d5244]' : 'text-gray-500'}`}>
                        {tab.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Swipe indicator pill */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-6 opacity-80" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}