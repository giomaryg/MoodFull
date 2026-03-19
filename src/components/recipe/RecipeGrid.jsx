import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, ChefHat, ArrowUpDown, Filter, RotateCcw, RefreshCw, Loader2, Heart } from 'lucide-react';
import HighlightedText from './HighlightedText';
import TiltCard from '../ui/TiltCard';

function RecipeGrid({ recipes, onRecipeClick, onStartOver, onRefresh, searchQuery = '' }) {
  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  const parseMacro = (str) => {
    if (!str) return 0;
    const match = String(str).match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
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
              className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] text-sm flex-1 sm:flex-none min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Refresh Ideas
            </Button>
          )}
          {onStartOver && (
            <Button
              onClick={onStartOver}
              variant="outline"
              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 text-sm flex-1 sm:flex-none min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.filter(r => r && r.name).map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              role="button"
              tabIndex={0}
              aria-label={`View details for ${recipe.name}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRecipeClick(recipe); } }}
              onClick={() => onRecipeClick(recipe)}
              className="cursor-pointer rounded-[2rem] overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white h-full flex flex-col hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow duration-300"
            >
              <div className="relative h-48 sm:h-56 shrink-0 bg-gray-100">
                {recipe._loading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                     <ChefHat className="w-12 h-12 text-muted-foreground/30" />
                   </div>
                 ) : recipe.imageLoading ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                     <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                   </div>
                 ) : (recipe.imageUrl || recipe.image_url) ? (
                  <img src={recipe.imageUrl || recipe.image_url} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover" />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]/50">
                     <ChefHat className="w-12 h-12 text-[#6b9b76]/50" />
                   </div>
                 )}
                 
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="flex-1 pr-4">
                    {recipe._loading ? (
                      <div className="space-y-2">
                        <div className="h-6 bg-white/40 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-white/40 rounded w-1/2 animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-1 line-clamp-2">
                          <HighlightedText text={recipe.name} query={searchQuery} />
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm line-clamp-1">
                          {recipe.description || `${recipe.prep_time || '25 min'} · ${recipe.difficulty || 'Easy'}`}
                        </p>
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Like recipe" className="w-11 h-11 min-h-[44px] min-w-[44px] bg-white rounded-full shadow-md shrink-0 text-red-500 hover:scale-110 transition-transform hover:bg-white hover:text-red-600">
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
              </div>
              
              <div className="p-5 flex justify-between items-center bg-card mt-auto border-t border-border/50">
                {recipe._loading ? (
                  <>
                    <div className="w-12 h-10 bg-muted animate-pulse rounded"></div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="w-12 h-10 bg-muted animate-pulse rounded"></div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="w-12 h-10 bg-muted animate-pulse rounded"></div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <p className="font-bold text-lg text-foreground">{recipe.nutrition?.calories || 290}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Calories</p>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-foreground">{parseMacro(recipe.nutrition?.protein) || 16}g</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Protein</p>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-foreground">{parseMacro(recipe.nutrition?.carbs) || 56}g</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Carbs</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
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