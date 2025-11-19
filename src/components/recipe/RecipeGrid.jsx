import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, ChefHat, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';

export default function RecipeGrid({ recipes, onRecipeClick, onStartOver }) {
  const [sortBy, setSortBy] = useState('default');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const filteredAndSortedRecipes = useMemo(() => {
    let result = [...recipes];

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      result = result.filter(recipe => recipe.difficulty === filterDifficulty);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'difficulty-easy':
        result.sort((a, b) => {
          const order = { easy: 1, medium: 2, hard: 3 };
          return order[a.difficulty] - order[b.difficulty];
        });
        break;
      case 'difficulty-hard':
        result.sort((a, b) => {
          const order = { easy: 3, medium: 2, hard: 1 };
          return order[a.difficulty] - order[b.difficulty];
        });
        break;
      case 'prep-time':
        result.sort((a, b) => {
          const getMinutes = (time) => {
            const match = time?.match(/(\d+)/);
            return match ? parseInt(match[1]) : 999;
          };
          return getMinutes(a.prep_time) - getMinutes(b.prep_time);
        });
        break;
      case 'servings':
        result.sort((a, b) => (a.servings || 0) - (b.servings || 0));
        break;
      default:
        break;
    }

    return result;
  }, [recipes, sortBy, filterDifficulty]);

  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 pb-4 border-b border-[#e8d5c4]">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#6b9b76] flex items-center gap-2 sm:gap-3">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            Your Recipe Options
          </h2>
          <p className="text-[#5a6f60] mt-1 text-sm sm:text-base">Found {filteredAndSortedRecipes.length} recipe{filteredAndSortedRecipes.length !== 1 ? 's' : ''} for you</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          {/* Filter by difficulty */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6b9b76]" />
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="flex-1 sm:w-32 md:w-36 border-[#c5d9c9] text-sm">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6b9b76]" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1 sm:w-36 md:w-40 border-[#c5d9c9] text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="difficulty-easy">Easiest First</SelectItem>
                <SelectItem value="difficulty-hard">Hardest First</SelectItem>
                <SelectItem value="prep-time">Quickest First</SelectItem>
                <SelectItem value="servings">Servings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start over button */}
          <Button
            onClick={onStartOver}
            variant="outline"
            className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] text-sm w-full sm:w-auto"
            >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            Start Over
          </Button>
          </div>
          </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {filteredAndSortedRecipes.map((recipe, index) => (
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
              {/* Recipe Image */}
              <div className="relative h-40 sm:h-44 md:h-48 bg-gradient-to-br from-[#f5e8e8] to-[#d4e4d6] overflow-hidden">
                {recipe.imageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c17a7a]"></div>
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
                    {recipe.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {recipe.description}
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

      {filteredAndSortedRecipes.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-[#5a6f60] text-sm sm:text-base md:text-lg px-4">No recipes match your filters. Try adjusting your selection.</p>
        </div>
      )}
    </div>
  );
}