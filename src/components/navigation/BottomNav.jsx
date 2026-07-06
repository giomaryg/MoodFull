import React from 'react';
import { Home, Clock, Heart, User, Sparkles, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav({ activeTab, onTabChange, isVisible = true, onOpenChat }) {
  if (!isVisible) return null;

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'moodlog', icon: Clock, label: 'History' },
    { id: 'chat', icon: null, label: 'Chat', isCenter: true },
    { id: 'saved', icon: Heart, label: 'Favorites' },
    { id: 'settings', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-0 w-full flex justify-center z-[100] px-4 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-border/40 shadow-xl rounded-[2rem] flex items-center justify-between px-6 py-3 w-full max-w-md pointer-events-auto relative">
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <div key="center-brain" className="relative -top-6 flex flex-col items-center justify-center">
                <button
                  onClick={onOpenChat}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-[3px] border-transparent cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #7A9F87, #A29BE3, #89B6D9) border-box',
                  }}
                  aria-label="Chat with AI"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#brainGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7A9F87" />
                        <stop offset="50%" stopColor="#A29BE3" />
                        <stop offset="100%" stopColor="#89B6D9" />
                      </linearGradient>
                    </defs>
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
                    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
                    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
                    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
                    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
                    <path d="M6 18a4 4 0 0 1-1.967-.516" />
                    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
                  </svg>
                </button>
              </div>
            );
          }

          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 min-w-[50px]"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-[#6b9b76] fill-[#6b9b76]/20' : 'text-gray-400'
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive ? 'text-[#6b9b76] font-medium' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}