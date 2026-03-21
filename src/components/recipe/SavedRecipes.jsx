import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Users, Sparkles, Search, Trash2, ShoppingCart, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import HighlightedText from './HighlightedText';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';

function SavedRecipes({ recipes, onRecipeClick, searchQuery: externalSearchQuery = '', onOpenShoppingList, currentUser }) {
  const queryClient = useQueryClient();

  const deleteRecipeMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    action: 'delete',
    onSuccessMessage: 'Recipe removed from your collection',
    onErrorMessage: 'Failed to remove recipe'
  });

  const updateRecipeMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, data),
    action: 'update'
  });

  const handleDelete = (e, recipeId) => {
    e.stopPropagation();
    deleteRecipeMutation.mutate(recipeId);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const displayQuery = externalSearchQuery || searchQuery;

  const collections = useMemo(() => {
    const cols = new Set();
    if (recipes) {
      recipes.forEach(r => {
        if (r.collections) r.collections.forEach(c => cols.add(c));
      });
    }
    return Array.from(cols).sort();
  }, [recipes]);

  const tags = useMemo(() => {
    const t = new Set();
    if (recipes) {
      recipes.forEach(r => {
        if (r.ai_tags) r.ai_tags.forEach(tag => t.add(tag));
      });
    }
    return Array.from(t).sort();
  }, [recipes]);

  const autoTagRecipes = async () => {
    setIsAutoTagging(true);
    try {
      const recipesToTag = recipes.filter(r => !r.ai_tags || r.ai_tags.length === 0);
      if (recipesToTag.length === 0) {
        toast.info("All recipes are already tagged!");
        setIsAutoTagging(false);
        return;
      }
      
      toast.info(`Auto-tagging ${recipesToTag.length} recipes...`);
      
      for (const recipe of recipesToTag) {
        try {
          const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Analyze this recipe: "${recipe.name}" (Ingredients: ${recipe.ingredients?.join(', ')}, Instructions: ${recipe.instructions?.join(', ')}). Generate exactly 3-5 tags for it. Include at least one for: Cuisine, Dietary Needs, Meal Type, and Mood/Occasion. Keep tags concise (1-2 words). Return as a list of strings.`,
            response_json_schema: {
              type: "object",
              properties: {
                tags: { type: "array", items: { type: "string" } }
              }
            }
          });
          
          if (response?.tags) {
            await updateRecipeMutation.mutateAsync({ id: recipe.id, data: { ai_tags: response.tags } });
          }
        } catch (e) {
          console.error(`Failed to tag ${recipe.name}`, e);
        }
      }
      
      toast.success('Recipes auto-tagged successfully!');
    } catch (e) {
      toast.error('Auto-tagging failed');
    }
    setIsAutoTagging(false);
  };

  const filteredRecipes = useMemo(() => {
    const query = displayQuery.trim();
    
    return recipes.filter(recipe => {
      if (!recipe || !recipe.name) return false;
      
      if (selectedCollection && (!recipe.collections || !recipe.collections.includes(selectedCollection))) {
        return false;
      }

      if (selectedTag && (!recipe.ai_tags || !recipe.ai_tags.includes(selectedTag))) {
        return false;
      }
      
      if (!query) return true;
      
      const lowerQuery = query.toLowerCase();
      return (
        recipe.name.toLowerCase().includes(lowerQuery) ||
        recipe.description?.toLowerCase().includes(lowerQuery) ||
        recipe.mood?.toLowerCase().includes(lowerQuery) ||
        recipe.ingredients?.some(ing => ing.toLowerCase().includes(lowerQuery))
      );
    });
  }, [recipes, displayQuery, selectedCollection]);

  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#6b9b76] rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#6b9b76]">Your Saved Recipes</h3>
          {currentUser?.role === 'admin' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs bg-blue-50 text-blue-600 border-blue-200 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                base44.entities.Recipe.create({
                  name: "Sample Feature Recipe " + Math.floor(Math.random() * 100),
                  mood: "Testing",
                  description: "A quick test recipe to view features.",
                  prep_time: "10 min",
                  cook_time: "20 min",
                  servings: 2,
                  difficulty: "easy",
                  ingredients: ["1 cup Flour", "2 Eggs", "1/2 cup Sugar"],
                  instructions: ["Mix ingredients", "Bake for 20 mins at 350F", "Enjoy!"],
                  collections: ["Dev Test"],
                  nutrition: { calories: 350, protein: "10g", carbs: "40g", fat: "15g" },
                  rating: 5
                }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['recipes'] });
                  toast.success('Added sample recipe');
                });
              }}
            >
              Dev: Add Recipe
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs bg-purple-50 text-purple-600 border-purple-200 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              autoTagRecipes();
            }}
            disabled={isAutoTagging}
          >
            {isAutoTagging ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Tag className="w-3 h-3 mr-1" />}
            Auto-Tag
          </Button>
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

      {(collections.length > 0 || tags.length > 0) && (
        <div className="flex flex-col gap-3 pt-1">
          {collections.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-500 font-medium w-20">Collections:</span>
              <Badge 
                role="button"
                tabIndex={0}
                aria-pressed={selectedCollection === null}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCollection(null); } }}
                onClick={() => setSelectedCollection(null)}
                variant={selectedCollection === null ? "default" : "outline"}
                className={`cursor-pointer ${selectedCollection === null ? 'bg-[#6b9b76] hover:bg-[#5a8a65]' : 'text-gray-500 hover:text-[#6b9b76]'}`}
              >
                All
              </Badge>
              {collections.map(c => (
                <Badge 
                  key={c}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCollection === c}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCollection(c); } }}
                  onClick={() => setSelectedCollection(c)}
                  variant={selectedCollection === c ? "default" : "outline"}
                  className={`cursor-pointer ${selectedCollection === c ? 'bg-[#6b9b76] hover:bg-[#5a8a65]' : 'text-gray-500 hover:text-[#6b9b76]'}`}
                >
                  {c}
                </Badge>
              ))}
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-purple-500 font-medium w-20">AI Tags:</span>
              <Badge 
                role="button"
                tabIndex={0}
                aria-pressed={selectedTag === null}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTag(null); } }}
                onClick={() => setSelectedTag(null)}
                variant={selectedTag === null ? "default" : "outline"}
                className={`cursor-pointer ${selectedTag === null ? 'bg-purple-500 hover:bg-purple-600' : 'text-gray-500 hover:text-purple-500'}`}
              >
                All
              </Badge>
              {tags.map(t => (
                <Badge 
                  key={t}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedTag === t}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTag(t); } }}
                  onClick={() => setSelectedTag(t)}
                  variant={selectedTag === t ? "default" : "outline"}
                  className={`cursor-pointer ${selectedTag === t ? 'bg-purple-500 hover:bg-purple-600' : 'text-gray-500 hover:text-purple-500'}`}
                >
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

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
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${recipe.name}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRecipeClick(recipe); } }}
                  onClick={() => onRecipeClick(recipe)}
                  className="cursor-pointer glass-panel p-3 flex gap-3 items-center hover:scale-[1.02] transition-transform duration-200 group relative shadow-[0_2px_8px_rgba(107,155,118,0.06)]"
                >
                  <div className="w-11 h-11 rounded-[10px] flex-shrink-0 flex items-center justify-center text-xl relative overflow-hidden bg-gradient-to-br from-[#8db894] to-[#5a8a65]">
                    🥗
                    {recipe.image_url && (
                      <img src={recipe.image_url} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-[11px] font-semibold text-[#3d5244] whitespace-nowrap overflow-hidden text-ellipsis mb-0.5">
                      <HighlightedText text={recipe.name} query={displayQuery} />
                    </div>
                    <div className="text-[#6b9b76] text-[8px] tracking-widest mb-0.5">
                      {'★'.repeat(recipe.rating || 5)}{'☆'.repeat(5 - (recipe.rating || 5))}
                    </div>
                    <div className="font-mono text-[8px] text-[#5a6f60]/45 tracking-[0.04em]">
                      {recipe.prep_time || '25 min'} · {recipe.difficulty || 'Easy'} {recipe.nutrition?.calories ? `· ${recipe.nutrition.calories} kcal` : ''}
                    </div>
                    {recipe.collections && recipe.collections.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {recipe.collections.map((c, i) => (
                          <span key={i} className="text-[7px] bg-[#6b9b76]/10 text-[#6b9b76] px-1.5 py-0.5 rounded-sm border border-[#6b9b76]/20 uppercase tracking-widest font-mono">{c}</span>
                        ))}
                      </div>
                    )}
                    {recipe.ai_tags && recipe.ai_tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {recipe.ai_tags.map((t, i) => (
                          <span key={i} className="text-[7px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-sm border border-purple-200 uppercase tracking-widest font-mono">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                    <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all z-10">
                      {/* Dev Edit Button for testing */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const randomData = {
                            prep_time: Math.floor(Math.random() * 30 + 10) + ' min',
                            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
                          };
                          updateRecipeMutation.mutate({ id: recipe.id, data: randomData });
                          toast.success('Dev: Recipe updated for testing');
                        }}
                        className="p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-blue-50 text-[8px] font-bold text-blue-500 uppercase flex items-center justify-center w-6 h-6"
                        title="Dev: Randomly update recipe info"
                      >
                        DEV
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, recipe.id)}
                        className="p-1.5 bg-white/80 rounded-full shadow-sm hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-[#c5d9c9]/70 flex items-center justify-center text-[9px] text-[#6b9b76] mt-auto">
                      →
                    </div>
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