import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, ChefHat, ArrowUpDown, Filter, RotateCcw, Loader2 } from 'lucide-react';
import HighlightedText from './HighlightedText';

function RecipeGrid({ recipes, onRecipeClick, onStartOver, searchQuery = '' }) {
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

        {onStartOver && (
          <Button
            onClick={onStartOver}
            variant="outline"
            className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] text-sm w-full sm:w-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            Start Over
          </Button>
        )}
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {recipes.filter(r => r && r.name).map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onRecipeClick(recipe)}
              className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#c5d9c9] bg-white hover:bg-[#f8faf8] group rounded-2xl overflow-hidden h-full"
              >
              {/* Recipe Image / Loading */}
               <div className="relative h-40 sm:h-44 md:h-48 bg-gradient-to-br from-[#f5e8e8] to-[#d4e4d6] overflow-hidden">
                 {recipe._loading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                     <Loader2 className="w-8 h-8 text-[#6b9b76] animate-spin" />
                     <span className="text-xs text-[#6b9b76] opacity-70">Loading details...</span>
                   </div>
                 ) : recipe.imageLoading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                     <ChefHat className="w-16 h-16 text-[#6b9b76] opacity-20" />
                     <span className="text-xs text-[#6b9b76] opacity-50">Loading photo...</span>
                   </div>
                 ) : recipe.imageUrl ? (
                   <img 
                     src={recipe.imageUrl} 
                     alt={recipe.name}
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <ChefHat className="w-16 h-16 text-[#6b9b76] opacity-30" />
                   </div>
                 )}
              </div>

              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 flex flex-col">
                {/* Recipe name */}
                <div className="flex-1">
                  <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 group-hover:text-[#6b9b76] transition-colors line-clamp-2 leading-tight">
                    <HighlightedText text={recipe.name} query={searchQuery} />
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    <HighlightedText text={recipe.description} query={searchQuery} />
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-[#c5d9c9]">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`capitalize text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-medium border ${difficultyColors[recipe.difficulty] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {recipe.difficulty}
                    </Badge>
                    {recipe.prep_time && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        {recipe.prep_time}
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
                        <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                        {recipe.servings}
                      </Badge>
                    )}
                    </div>

                    {recipe.cook_time && (
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#5a6f60]">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>Cook: {recipe.cook_time}</span>
                    </div>
                    )}
                </div>
              </CardContent>
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