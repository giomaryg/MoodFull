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
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#e8d5c4]">
        <div>
          <h2 className="text-3xl font-bold text-[#c17a7a] flex items-center gap-3">
            <ChefHat className="w-8 h-8" />
            Your Recipe Options
          </h2>
          <p className="text-[#9b8175] mt-1">Found {filteredAndSortedRecipes.length} recipe{filteredAndSortedRecipes.length !== 1 ? 's' : ''} for you</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filter by difficulty */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9b8175]" />
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-36 border-[#e8d5c4]">
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
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#9b8175]" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-[#e8d5c4]">
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
            className="border-2 border-[#c17a7a] hover:border-[#b06a6a] hover:bg-[#f5e6dc] text-[#c17a7a]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedRecipes.map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onRecipeClick(recipe)}
              className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#e8d5c4] bg-white hover:bg-[#faf6f2] group rounded-2xl overflow-hidden h-full"
            >
              <CardContent className="p-6 space-y-4 flex flex-col h-full">
                {/* Recipe name */}
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#c17a7a] transition-colors line-clamp-2 leading-tight">
                    {recipe.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="space-y-3 pt-3 border-t border-[#e8d5c4]">
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`capitalize text-xs px-3 py-1 rounded-lg font-medium border ${difficultyColors[recipe.difficulty] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {recipe.difficulty}
                    </Badge>
                    {recipe.prep_time && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-3 py-1 rounded-lg">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prep_time}
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-3 py-1 rounded-lg">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings}
                      </Badge>
                    )}
                  </div>
                  
                  {recipe.cook_time && (
                    <div className="flex items-center gap-2 text-xs text-[#9b8175]">
                      <Clock className="w-3 h-3" />
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
        <div className="text-center py-12">
          <p className="text-[#9b8175] text-lg">No recipes match your filters. Try adjusting your selection.</p>
        </div>
      )}
    </div>
  );
}