import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';

export default function SwapMealDialog({ currentMeal, recipes, onSwap, onClose }) {
  const queryClient = useQueryClient();
  if (!currentMeal) return null;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    const validRecipes = recipes.filter(r => r && r.name && r.description);
    if (!searchQuery.trim()) return validRecipes;
    
    const query = searchQuery.toLowerCase();
    return validRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query) ||
      recipe.ingredients?.some((ing) => ing.toLowerCase().includes(query))
    );
  }, [recipes, searchQuery]);

  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#6b9b76]">Swap Meal</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Currently: {currentMeal.recipe_name}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76]"
            />
          </div>
        </CardHeader>

        <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(); }} className="p-4 overflow-y-auto max-h-[calc(85vh-200px)]">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No recipes found. Try a different search or generate some recipes first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  onClick={() => onSwap(recipe)}
                  className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-[#c5d9c9] hover:border-[#6b9b76]"
                >
                  <CardContent className="p-4">
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">
                      {recipe.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.difficulty && (
                        <Badge
                          variant="secondary"
                          className={`capitalize text-xs ${difficultyColors[recipe.difficulty]}`}
                        >
                          {recipe.difficulty}
                        </Badge>
                      )}
                      {recipe.prep_time && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {recipe.prep_time}
                        </Badge>
                      )}
                      {recipe.servings && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {recipe.servings}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </PullToRefresh>
      </Card>
    </motion.div>
  );
}