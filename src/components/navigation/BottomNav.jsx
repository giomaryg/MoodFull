import React, { useState, useEffect, useRef } from 'react';
import { Home, BookMarked, User, Calendar, Package, BarChart2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function BottomNav({ activeTab, onTabChange, isVisible = true, enablePantry = true }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (navRef.current && navRef.current.contains(e.target)) {
        return;
      }
      setIsMinimized(true);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, []);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saved', label: 'Saved', icon: BookMarked },
    { id: 'planner', label: 'Planner', icon: Calendar },
    ...(enablePantry ? [{ id: 'inventory', label: 'Pantry', icon: Package }] : []),
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          ref={navRef}
          initial={{ y: 150, x: "-50%", opacity: 0 }}
          animate={{ 
            y: isMinimized ? "75%" : 0, 
            x: "-50%", 
            opacity: isMinimized ? 0.7 : 1 
          }}
          exit={{ y: 150, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={() => isMinimized && setIsMinimized(false)}
          className={`fixed left-1/2 w-[calc(100%-24px)] sm:max-w-md bg-background/80 backdrop-blur-md border border-border/60 rounded-3xl shadow-lg z-[100] overflow-hidden ${isMinimized ? 'cursor-pointer hover:opacity-100' : ''}`}
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          {isMinimized && (
            <button 
              className="absolute top-0 left-0 w-full h-[44px] min-h-[44px] flex justify-center items-center"
              aria-label="Expand navigation"
            >
              <ChevronUp className="w-5 h-5 text-[#6b9b76]" />
            </button>
          )}
          <div className={`flex items-center justify-around w-full gap-1 overflow-x-auto scroll-smooth px-2 py-2 min-h-[64px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isMinimized ? 'pointer-events-none opacity-20' : ''}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => onTabChange(tab.id)}
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex-col h-auto gap-1.5 px-3 py-2 rounded-2xl relative flex-shrink-0 min-w-[72px] sm:min-w-[80px] min-h-[44px] ${
                    isActive ? 'bg-[#6b9b76]/10 hover:bg-[#6b9b76]/20' : 'hover:bg-gray-100/50'
                  }`}
                >
                  <Icon
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] sm:text-xs tracking-wider uppercase transition-colors w-full text-center truncate px-1 ${
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDot"
                      className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#6b9b76] rounded-full shadow-[0_0_5px_rgba(107,155,118,0.7)]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}