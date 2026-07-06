import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, ChefHat, ArrowUpDown, Filter, RotateCcw, RefreshCw, Loader2, Heart, Search, Sparkles } from 'lucide-react';
import HighlightedText from './HighlightedText';
import TiltCard from '../ui/TiltCard';

function RecipeGrid({ recipes, onRecipeClick, onStartOver, onRefresh, searchQuery = '', isGenerating }) {
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
              disabled={isGenerating}
              className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] text-sm flex-1 sm:flex-none min-h-[44px]"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              )}
              Refresh Ideas
            </Button>
          )}
          {onStartOver && (
            <Button
              onClick={onStartOver}
              variant="outline"
              disabled={isGenerating}
              className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 text-sm flex-1 sm:flex-none min-h-[44px]"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
              )}
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {recipes.filter(r => r && r.name).map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
            className="h-full"
          >
            <Card
              role="button"
              tabIndex={0}
              aria-label={`View details for ${recipe.name}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRecipeClick(recipe); } }}
              onClick={() => onRecipeClick(recipe)}
              className="group cursor-pointer rounded-[2rem] overflow-hidden glass-panel bg-white/40 backdrop-blur-xl border border-white/60 ai-glow h-full flex flex-col hover:-translate-y-2 transition-all duration-500 ease-out"
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
                  <img src={recipe.imageUrl || recipe.image_url} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]/50">
                     <ChefHat className="w-12 h-12 text-[#6b9b76]/50" />
                   </div>
                 )}
                 
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                  <div className="flex-1 pr-3 sm:pr-4">
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
                        <p className="text-white/80 text-xs sm:text-sm line-clamp-1 mb-1.5">
                          {recipe.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-white/90 text-[10px] sm:text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{recipe.prep_time || '25 min'}</span>
                          <span className="opacity-50">•</span>
                          <span>{recipe.difficulty || 'Easy'}</span>
                        </div>
                        {recipe.searchReason && (
                          <div className="mt-2 text-[10px] sm:text-xs bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-md inline-flex items-center gap-1 border border-white/20">
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            {recipe.searchReason}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Like recipe" className="w-11 h-11 min-h-[44px] min-w-[44px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg shrink-0 text-red-500 hover:scale-110 transition-transform hover:bg-white hover:text-red-600">
                    <Heart className="w-5 h-5 fill-current" />
                  </Button>
                </div>
              </div>
              
              <div className="px-6 py-5 flex justify-between items-center bg-transparent mt-auto border-t border-gray-100/30">
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
        <div className="text-center py-12 px-4 bg-white/50 rounded-3xl border-2 border-dashed border-[#c5d9c9] max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#e8f0ea] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#6b9b76]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No recipes found</h3>
          <p className="text-[#5a6f60] mb-6">We couldn't find any recipes matching your current filters and search.</p>
          {onStartOver && (
            <Button onClick={onStartOver} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl">
              Clear Search & Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(RecipeGrid);