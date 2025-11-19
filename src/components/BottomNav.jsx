import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookmarkCheck, User } from 'lucide-react';

export default function BottomNav({ currentPage }) {
  const navItems = [
    { name: 'RecipeGenerator', label: 'Home', icon: Home },
    { name: 'SavedRecipesPage', label: 'Saved', icon: BookmarkCheck },
    { name: 'Account', label: 'Account', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#c5d9c9] shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.name;
            
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive
                    ? 'text-[#6b9b76]'
                    : 'text-gray-400 hover:text-[#6b9b76]'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6b9b76] rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}