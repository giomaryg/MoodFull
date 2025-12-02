import React from 'react';
import { Home, BookMarked, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saved', label: 'Saved', icon: BookMarked },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#c5d9c9] z-[100] pb-safe">
      <div className="w-full">
        <div className="flex items-center justify-between h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1"
                >
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-[#6b9b76]' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-[#6b9b76]' : 'text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[#6b9b76] rounded-b-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}