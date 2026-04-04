import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X, Sparkles, Clock, Flame, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SUGGESTIONS = [
  { text: "quick healthy dinner", icon: Clock },
  { text: "something cozy and warm", icon: Flame },
  { text: "high protein vegetarian", icon: Leaf },
  { text: "easy pasta recipes", icon: Search },
];

export default function SmartSearchBar({ 
  query, 
  setQuery, 
  isSearching, 
  onEnter, 
  placeholder = "Search recipes, ingredients, or moods...",
  intent
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1 w-full group">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5">
        {isSearching ? (
          <Loader2 className="w-5 h-5 text-[#6b9b76] animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-[#6b9b76] group-focus-within:text-[#5a8a65] transition-colors" />
        )}
      </div>
      
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            onEnter();
            setIsFocused(false);
          }
        }}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="bg-white/80 backdrop-blur-sm pt-6 pr-10 pb-6 pl-10 text-sm rounded-2xl flex h-12 w-full transition-all border-2 border-[#c5d9c9] focus:border-[#6b9b76] focus:shadow-[0_0_15px_rgba(107,155,118,0.2)] shadow-sm sm:text-base"
      />

      <AnimatePresence>
        {isFocused && !query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50"
          >
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Try searching for...</h4>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion, idx) => {
                const Icon = suggestion.icon;
                return (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    onClick={() => {
                      setQuery(suggestion.text);
                      setIsFocused(false);
                      if (onEnter) onEnter();
                    }}
                    className="cursor-pointer bg-gray-50 hover:bg-[#e8f0ea] hover:text-[#6b9b76] text-gray-600 px-3 py-2 text-sm border-0 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 mr-2 opacity-50" />
                    {suggestion.text}
                  </Badge>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {query && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intent Badge */}
      <AnimatePresence>
        {intent && !isSearching && query && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-3 left-6 bg-gradient-to-r from-[#6b9b76] to-[#5a8a65] text-white text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10"
          >
            <Sparkles className="w-3 h-3" />
            Looking for: {intent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}