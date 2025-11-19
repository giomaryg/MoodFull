import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search, X, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeDisplay from '../components/recipe/RecipeDisplay';
import SimilarRecipes from '../components/recipe/SimilarRecipes';

export default function SavedRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return savedRecipes;

    const query = searchQuery.toLowerCase();
    return savedRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query) ||
      recipe.mood?.toLowerCase().includes(query) ||
      recipe.ingredients?.some((ing) => ing.toLowerCase().includes(query))
    );
  }, [savedRecipes, searchQuery]);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    findSimilarRecipes(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const findSimilarRecipes = (recipe) => {
    const similar = savedRecipes
      .filter((r) => r.id !== recipe.id)
      .filter((r) => {
        const hasSimilarMood = recipe.mood?.split(', ').some((mood) =>
          r.mood?.includes(mood)
        );
        const hasSimilarDifficulty = r.difficulty === recipe.difficulty;
        return hasSimilarMood || hasSimilarDifficulty;
      })
      .slice(0, 6);

    setSimilarRecipes(similar);
  };

  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-[#e8f0ea] pb-20">
        <div className="bg-slate-50 mx-auto px-4 pt-6 pb-8 max-w-6xl space-y-6">
          <RecipeDisplay recipe={selectedRecipe} onSave={() => {}} isSaved={true} />
          
          {similarRecipes.length > 0 && (
            <SimilarRecipes recipes={similarRecipes} onRecipeClick={handleRecipeClick} />
          )}

          <div className="flex justify-center">
            <button
              onClick={() => {
                setSelectedRecipe(null);
                setSimilarRecipes([]);
              }}
              className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] rounded-2xl px-8 py-4 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Back to Saved Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f0ea] pb-20">
      <div className="bg-slate-50 mx-auto px-4 pt-6 pb-8 max-w-6xl space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#6b9b76] rounded-xl">
            <BookmarkCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#6b9b76]">Saved Recipes</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
          <Input
            type="text"
            placeholder="Search saved recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b9b76] hover:text-[#5a8a65] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No recipes found matching "${searchQuery}"` : 'No saved recipes yet'}
            </p>
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
                  onClick={() => handleRecipeClick(recipe)}
                  className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#c5d9c9] bg-white hover:bg-[#f8faf8] rounded-2xl overflow-hidden"
                >
                  {recipe.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#e8f0ea] text-[#6b9b76] px-3 py-1 rounded-lg text-xs font-medium capitalize">
                        {recipe.mood}
                      </span>
                      {recipe.difficulty && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium capitalize">
                          {recipe.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}