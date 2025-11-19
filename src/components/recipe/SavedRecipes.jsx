import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Users, Sparkles, Search } from 'lucide-react';
import HighlightedText from './HighlightedText';

export default function SavedRecipes({ recipes, onRecipeClick, searchQuery: externalSearchQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const displayQuery = externalSearchQuery || searchQuery;

  const filteredRecipes = useMemo(() => {
    const query = displayQuery.trim();
    if (!query) return recipes;
    
    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description?.toLowerCase().includes(lowerQuery) ||
      recipe.mood?.toLowerCase().includes(lowerQuery) ||
      recipe.ingredients?.some(ing => ing.toLowerCase().includes(lowerQuery))
    );
  }, [recipes, displayQuery]);

  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#6b9b76] rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#6b9b76]">Your Saved Recipes</h3>
        </div>
        
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
          />
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[#5a6f60]">No recipes found matching "{displayQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
                {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => onRecipeClick(recipe)}
                className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#c5d9c9] bg-white hover:bg-[#f8faf8] group rounded-2xl overflow-hidden"
                >
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#6b9b76] transition-colors line-clamp-1">
                      <HighlightedText text={recipe.name} query={displayQuery} />
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      <HighlightedText text={recipe.description} query={displayQuery} />
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-[#e8f0ea] text-[#6b9b76] border-0 capitalize text-xs px-3 py-1 rounded-lg font-medium"
                    >
                      {recipe.mood}
                    </Badge>
                    {recipe.prep_time && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-xs px-3 py-1 rounded-lg">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prep_time}
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-xs px-3 py-1 rounded-lg">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        </div>
        )}
        </div>
        );
        }