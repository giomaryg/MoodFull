import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, ChefHat, ArrowUpDown, Filter, RotateCcw, RefreshCw, Loader2 } from 'lucide-react';
import HighlightedText from './HighlightedText';
import TiltCard from '../ui/TiltCard';

function RecipeGrid({ recipes, onRecipeClick, onStartOver, onRefresh, searchQuery = '' }) {
  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with summary and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#e8d5c4]">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#6b9b76] flex items-center gap-2 sm:gap-3">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            Recipe Collection
          </h2>
          <p className="text-[#5a6f60] mt-1 text-sm sm:text-base">Showing {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] text-sm flex-1 sm:flex-none"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Refresh Ideas
            </Button>
          )}
          {onStartOver && (
            <Button
              onClick={onStartOver}
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 text-sm flex-1 sm:flex-none"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="flex flex-col gap-2">
        {recipes.filter(r => r && r.name).map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
          >
            <TiltCard>
            <div
              onClick={() => onRecipeClick(recipe)}
              className="cursor-pointer glass-panel p-3 flex gap-3 items-center hover:shadow-[0_10px_25px_rgba(107,155,118,0.2)] transition-shadow duration-300 group relative shadow-[0_2px_8px_rgba(107,155,118,0.06)] bg-white/70"
            >
              <div className="w-11 h-11 rounded-[10px] flex-shrink-0 flex items-center justify-center text-xl relative overflow-hidden bg-gradient-to-br from-[#8db894] to-[#5a8a65] shadow-inner">
                {recipe._loading ? (
                   <Loader2 className="w-4 h-4 text-white animate-spin" />
                 ) : recipe.imageLoading ? (
                   <ChefHat className="w-4 h-4 text-white opacity-50" />
                 ) : (recipe.imageUrl || recipe.image_url) ? (
                  <img src={recipe.imageUrl || recipe.image_url} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover" />
                 ) : (
                   <span>🥗</span>
                 )}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <div className="text-[11px] font-semibold text-[#3d5244] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">
                  <HighlightedText text={recipe.name} query={searchQuery} />
                </div>
                <div className="text-[#6b9b76] text-[8px] tracking-widest mb-0.5">
                  {'★'.repeat(recipe.rating || 5)}{'☆'.repeat(5 - (recipe.rating || 5))}
                </div>
                <div className="font-mono text-[8px] text-[#5a6f60]/45 tracking-[0.04em]">
                  {recipe.prep_time || '25 min'} · {recipe.difficulty || 'Easy'} {recipe.nutrition?.calories ? `· ${recipe.nutrition.calories} kcal` : ''}
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border border-[#c5d9c9]/70 flex items-center justify-center text-[9px] text-[#6b9b76] flex-shrink-0">
                →
              </div>
            </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-[#5a6f60] text-sm sm:text-base md:text-lg px-4">No recipes match your filters. Try adjusting your selection.</p>
        </div>
      )}
    </div>
  );
}

export default React.memo(RecipeGrid);