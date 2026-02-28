import React from 'react';
import { Home, BookMarked, User, Calendar, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav({ activeTab, onTabChange, isVisible = true }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saved', label: 'Saved', icon: BookMarked },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'inventory', label: 'Pantry', icon: Package },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 150, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 150, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 w-[calc(100%-24px)] sm:max-w-md bg-white/80 backdrop-blur-md border border-[#c5d9c9]/60 rounded-3xl p-2 flex items-center justify-around shadow-[0_4px_20px_rgba(107,155,118,0.12)] z-[100]"
        >
          {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl relative transition-colors ${
              isActive ? 'bg-[#6b9b76]/10' : ''
            }`}
          >
            <Icon
              strokeWidth={isActive ? 2.5 : 2}
              className={`w-5 h-5 transition-colors ${
                isActive ? 'text-[#6b9b76]' : 'text-[#5a6f60]/40'
              }`}
            />
            <span
              className={`font-mono text-[8px] sm:text-[9px] tracking-[0.07em] uppercase transition-colors ${
                isActive ? 'text-[#6b9b76]' : 'text-[#5a6f60]/40'
              }`}
            >
              {tab.label}
            </span>
            
            {isActive && (
              <motion.div
                layoutId="activeTabDot"
                className="absolute -bottom-[2px] left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#6b9b76] rounded-full shadow-[0_0_5px_rgba(107,155,118,0.7)]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}