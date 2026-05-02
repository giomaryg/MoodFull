import React, { useState, useEffect, useRef } from 'react';
import { Home, BookMarked, User, Calendar, Package, BarChart2, ChevronUp, ShoppingCart, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function BottomNav({ activeTab, onTabChange, isVisible = true, enablePantry = true }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saved', label: 'Saved', icon: BookMarked },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    ...(enablePantry ? [{ id: 'inventory', label: 'Pantry', icon: Package }] : []),
    { id: 'analytics', label: 'Insights', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const shouldShow = isVisible && !isKeyboardOpen;

  return (
    <>
      <AnimatePresence>
        {shouldShow && !isExpanded ? (
          <motion.div 
            key="nav-toggle"
            initial={{ x: -100, y: "-50%", opacity: 0 }}
            animate={{ x: 0, y: "-50%", opacity: 1 }}
            exit={{ x: -100, y: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-[100]"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(true)}
              className="bg-background/80 backdrop-blur-md border border-border/60 border-l-0 rounded-l-none rounded-r-2xl shadow-md hover:bg-accent h-16 w-8 flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {shouldShow && isExpanded ? (
          <motion.div 
            key="nav-bar"
            initial={{ x: -100, y: "-50%", opacity: 0 }}
            animate={{ x: 0, y: "-50%", opacity: 1 }}
            exit={{ x: -100, y: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-4 md:left-6 top-1/2 -translate-y-1/2 h-auto max-h-[90vh] w-auto min-w-[72px] sm:min-w-[80px] bg-background/80 backdrop-blur-md border border-border/60 rounded-3xl shadow-lg z-[100] overflow-hidden py-4"
          >
            <div className="flex flex-col items-center justify-center w-full gap-2 overflow-y-auto scroll-smooth px-2 min-h-[64px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="w-full rounded-2xl hover:bg-gray-100/50 mb-2 h-10"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsExpanded(false);
                    }}
                    aria-label={tab.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex-col justify-center h-auto gap-1.5 p-2 rounded-2xl relative flex-shrink-0 w-full min-h-[64px] ${
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
                      className={`font-mono text-[10px] sm:text-xs tracking-wider uppercase transition-colors w-full text-center whitespace-nowrap px-2 ${
                        isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {tab.label}
                    </span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTabDot"
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[#6b9b76] rounded-r-full shadow-[2px_0_5px_rgba(107,155,118,0.7)]"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}