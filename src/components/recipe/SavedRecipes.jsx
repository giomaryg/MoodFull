import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Users, Sparkles, Search, Trash2, ShoppingCart, Loader2, Tag, Check } from 'lucide-react';
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

  const parseMacro = (str) => {
    if (!str) return 0;
    const match = String(str).match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

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
        <div className="text-center py-12 px-4 bg-white/50 rounded-3xl border-2 border-dashed border-[#c5d9c9] max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 bg-[#e8f0ea] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#6b9b76]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No exact matches found</h3>
          <p className="text-[#5a6f60] mb-6">We couldn't find anything matching "{displayQuery}". Try searching for something broader.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="bg-white hover:bg-gray-50 cursor-pointer py-1.5" onClick={() => setSearchQuery("healthy dinners")}>healthy dinners</Badge>
            <Badge variant="outline" className="bg-white hover:bg-gray-50 cursor-pointer py-1.5" onClick={() => setSearchQuery("quick meals")}>quick meals</Badge>
            <Badge variant="outline" className="bg-white hover:bg-gray-50 cursor-pointer py-1.5" onClick={() => setSearchQuery("comfort food")}>comfort food</Badge>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pt-4">
          <AnimatePresence>
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
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
                  className="group cursor-pointer rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] bg-white h-full flex flex-col hover:-translate-y-2 transition-all duration-500 ease-out"
                >
                  <div className="relative h-48 sm:h-56 shrink-0 bg-gray-100">
                    {(recipe.imageUrl || recipe.image_url) ? (
                      <img src={recipe.imageUrl || recipe.image_url} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]/50 text-4xl">
                        🥗
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {recipe.last_cooked_date && (
                      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-white/20 text-xs font-medium z-10">
                        <Check className="w-3.5 h-3.5 text-green-400" /> Cooked
                      </div>
                    )}

                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRecipeMutation.mutate({ 
                            id: recipe.id, 
                            data: { last_cooked_date: recipe.last_cooked_date ? null : new Date().toISOString() } 
                          });
                          toast.success(recipe.last_cooked_date ? 'Marked as uncooked' : 'Marked as cooked!');
                        }}
                        className={`w-9 h-9 min-h-[36px] min-w-[36px] rounded-full shadow-lg ${recipe.last_cooked_date ? 'bg-[#6b9b76] text-white hover:bg-[#5a8a65]' : 'bg-white/90 backdrop-blur-sm hover:bg-green-50 text-green-600'}`}
                        title={recipe.last_cooked_date ? "Mark as uncooked" : "Mark as cooked"}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            const randomData = {
                              prep_time: Math.floor(Math.random() * 30 + 10) + ' min',
                              difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
                            };
                            updateRecipeMutation.mutate({ id: recipe.id, data: randomData });
                            toast.success('Dev: Recipe updated');
                          }}
                          className="w-9 h-9 min-h-[36px] min-w-[36px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-[9px] font-bold text-blue-500 hover:bg-blue-50 hover:text-blue-600 uppercase"
                          title="Dev: Randomly update recipe info"
                        >
                          DEV
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(e, recipe.id)}
                        className="w-9 h-9 min-h-[36px] min-w-[36px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                      <div className="flex-1 pr-3 sm:pr-4">
                        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-1 line-clamp-2">
                          <HighlightedText text={recipe.name} query={displayQuery} />
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
                        <div className="mt-2 flex flex-wrap gap-1">
                          {recipe.collections && recipe.collections.map((c, i) => (
                            <span key={`col-${i}`} className="text-[10px] bg-white/20 backdrop-blur-md text-white px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider font-mono">{c}</span>
                          ))}
                          {recipe.ai_tags && recipe.ai_tags.map((t, i) => (
                            <span key={`tag-${i}`} className="text-[10px] bg-purple-500/30 backdrop-blur-md text-purple-100 px-1.5 py-0.5 rounded border border-purple-400/20 uppercase tracking-wider font-mono">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-5 flex justify-between items-center bg-white mt-auto border-t border-gray-100/60">
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
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
        </div>
        );
}

export default React.memo(SavedRecipes);