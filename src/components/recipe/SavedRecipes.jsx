import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Users, Sparkles, Search, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import HighlightedText from './HighlightedText';

function SavedRecipes({ recipes, onRecipeClick, searchQuery: externalSearchQuery = '', onOpenShoppingList }) {
  const queryClient = useQueryClient();

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe removed from your collection');
    }
  });

  const handleDelete = (e, recipeId) => {
    e.stopPropagation();
    deleteRecipeMutation.mutate(recipeId);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const displayQuery = externalSearchQuery || searchQuery;

  const filteredRecipes = useMemo(() => {
    const query = displayQuery.trim();
    if (!query) return recipes;
    
    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe && recipe.name && (
        recipe.name.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery) ||
        recipe.mood?.toLowerCase().includes(lowerQuery) ||
        recipe.ingredients?.some(ing => ing.toLowerCase().includes(lowerQuery))
      )
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

        {onOpenShoppingList && (
          <Button
            onClick={onOpenShoppingList}
            className="bg-[#c17a7a] hover:bg-[#b06a6a] text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopping List
          </Button>
        )}
        
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-2 font-mono text-[7px] tracking-[0.15em] uppercase text-[#6b9b76]/45">
            <span>Recent</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c5d9c9]/50 to-transparent"></div>
          </div>
          <AnimatePresence>
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  onClick={() => onRecipeClick(recipe)}
                  className="cursor-pointer glass-panel p-3 flex gap-3 items-center hover:scale-[1.02] transition-transform duration-200 group relative shadow-[0_2px_8px_rgba(107,155,118,0.06)]"
                >
                  <button
                    onClick={(e) => handleDelete(e, recipe.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                  <div className="w-11 h-11 rounded-[10px] flex-shrink-0 flex items-center justify-center text-xl relative overflow-hidden bg-gradient-to-br from-[#8db894] to-[#5a8a65]">
                    🥗
                    {recipe.image_url && (
                      <img src={recipe.image_url} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="text-[11px] font-semibold text-[#3d5244] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">
                      <HighlightedText text={recipe.name} query={displayQuery} />
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
        </div>
        );
}

export default React.memo(SavedRecipes);