import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, Sparkles, RefreshCw, Loader2, CalendarPlus, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DiscoveryFeed({ 
  userPreferences, 
  inventory = [], 
  onRecipeClick, 
  advancedFilters = {}, 
  searchQuery = '',
  selectedMoods = [],
  selectedMealTypes = []
}) {
  const [feed, setFeed] = useState([]);
  const [recipeOfDay, setRecipeOfDay] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const queryClient = useQueryClient();

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 50)
  });

  const createMealMutation = useMutation({
    mutationFn: (mealData) => base44.entities.MealPlan.create(mealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success('Added to your meal plan!');
    }
  });

  const handleQuickAdd = async (e, recipe) => {
    e.stopPropagation();
    
    // Save recipe to DB first so we have an ID for the meal plan
    let savedId = recipe.id;
    if (!savedId) {
      try {
        const saved = await base44.entities.Recipe.create({
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          image_url: recipe.imageUrl,
          mood: recipe.mood || 'Discovery'
        });
        savedId = saved.id;
        queryClient.invalidateQueries({ queryKey: ['recipes'] });
      } catch (err) {
        toast.error('Failed to save recipe for meal plan.');
        return;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    createMealMutation.mutate({
      recipe_id: savedId,
      recipe_name: recipe.name,
      date: today,
      meal_type: 'dinner', // default
      servings: recipe.servings || 2
    });
  };

  const generateFeed = async () => {
    if (!userPreferences) return;

    setIsGenerating(true);

    try {
      let contextParts = [];

      // User preferences
      if (userPreferences.diet_preferences) contextParts.push(`Diet: ${userPreferences.diet_preferences}`);
      if (userPreferences.allergies) contextParts.push(`AVOID: ${userPreferences.allergies}`);
      if (userPreferences.cooking_skill) contextParts.push(`Skill level: ${userPreferences.cooking_skill}`);

      // Filters applied by user
      if (searchQuery) contextParts.push(`Must match search: "${searchQuery}"`);
      if (selectedMoods.length > 0) contextParts.push(`Moods: ${selectedMoods.join(', ')}`);
      if (selectedMealTypes.length > 0) contextParts.push(`Meal Types: ${selectedMealTypes.join(', ')}`);
      if (advancedFilters.cuisine) contextParts.push(`Cuisine: ${advancedFilters.cuisine}`);
      if (advancedFilters.dietary) contextParts.push(`Dietary: ${advancedFilters.dietary}`);
      if (advancedFilters.mealType) contextParts.push(`Meal Type: ${advancedFilters.mealType}`);
      if (advancedFilters.maxPrepTime) contextParts.push(`Max Prep Time: ${advancedFilters.maxPrepTime} mins`);
      if (advancedFilters.difficulty) contextParts.push(`Difficulty: ${advancedFilters.difficulty}`);
      if (advancedFilters.maxCalories) contextParts.push(`Max Calories: ${advancedFilters.maxCalories}`);
      if (advancedFilters.includeIngredients) contextParts.push(`MUST Include: ${advancedFilters.includeIngredients}`);
      if (advancedFilters.excludeIngredients) contextParts.push(`MUST AVOID: ${advancedFilters.excludeIngredients}`);
      
      if (advancedFilters.generateVariations) {
         contextParts.push(`CRITICAL: The user wants UNIQUE, CREATIVE AI VARIATIONS. Do not just return standard recipes. Combine cuisines, invent new flavor profiles, or completely reimagine classic dishes based on the constraints above.`);
      }

      // Past history & Pantry
      const savedRecipeNames = savedRecipes.slice(0, 10).map((r) => r.name).join(', ');
      if (savedRecipeNames) contextParts.push(`Recently saved: ${savedRecipeNames}`);
      
      if (inventory && inventory.length > 0) {
        const inventoryList = inventory.map((i) => i.name).join(', ');
        contextParts.push(`Current pantry (try to use these): ${inventoryList}`);
      }

      const userContext = contextParts.join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Act as a culinary discovery engine. Based on the user's preferences, filters, and history, generate:
1. A special "Recipe of the Day" that is highly aligned with their profile.
2. 6 diverse, exciting new recipes for their personalized feed.

Context & Filters:
${userContext}

Generate the full recipes. Each recipe must have Name, Description, Ingredients, Instructions, Prep time, and Cook time.`,
        response_json_schema: {
          type: "object",
          properties: {
            recipe_of_the_day: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
                instructions: { type: "array", items: { type: "string" } },
                prep_time: { type: "string" },
                cook_time: { type: "string" },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                servings: { type: "number" }
              }
            },
            feed: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  ingredients: { type: "array", items: { type: "string" } },
                  instructions: { type: "array", items: { type: "string" } },
                  prep_time: { type: "string" },
                  cook_time: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  servings: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Prepare Recipe of the Day
      if (response.recipe_of_the_day) {
        const rod = {
          ...response.recipe_of_the_day,
          mood: 'Recipe of the Day',
          imageUrl: null,
          imageLoading: true
        };
        setRecipeOfDay(rod);
        
        base44.integrations.Core.GenerateImage({
          prompt: `Professional food photography of ${rod.name}. ${rod.description}. Beautiful plating, natural lighting, appetizing, high quality, detailed.`
        }).then(img => {
          setRecipeOfDay(prev => ({ ...prev, imageUrl: img.url, imageLoading: false }));
        }).catch(() => {
          setRecipeOfDay(prev => ({ ...prev, imageLoading: false }));
        });
      }

      // Prepare Feed
      if (response.feed) {
        const feedItems = response.feed.filter(r => r && r.name && r.description).map(recipe => ({
          ...recipe,
          mood: 'Discovery',
          imageUrl: null,
          imageLoading: true
        }));
        
        setFeed(feedItems);

        feedItems.forEach((recipe, index) => {
          base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality, detailed.`
          }).then(img => {
            setFeed(prev => prev.map((r, i) => i === index ? { ...r, imageUrl: img.url, imageLoading: false } : r));
          }).catch(() => {
            setFeed(prev => prev.map((r, i) => i === index ? { ...r, imageLoading: false } : r));
          });
        });
      }

      setHasInitialLoad(true);
      if (searchQuery || Object.keys(advancedFilters).length > 0 || selectedMoods.length > 0 || selectedMealTypes.length > 0) {
        toast.success('Discovery feed updated with your filters!');
      } else {
        toast.success('Your personalized feed is ready!');
      }

    } catch (error) {
      toast.error('Failed to generate discovery feed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on first load if not done yet
  useEffect(() => {
    if (!hasInitialLoad && userPreferences) {
      generateFeed();
    }
  }, [userPreferences, hasInitialLoad]);

  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  if (!userPreferences?.survey_completed) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#6b9b76] to-[#5a8a65] rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Discovery Feed
            </h3>
            <p className="text-sm text-gray-500">
              Personalized recipes, just for you
            </p>
          </div>
        </div>

        <Button
          onClick={generateFeed}
          disabled={isGenerating}
          className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing Feed...</>
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" /> Refresh Feed</>
          )}
        </Button>
      </div>

      {!hasInitialLoad && isGenerating && (
        <div className="space-y-8">
          <div className="w-full h-80 bg-muted animate-pulse rounded-[2rem]"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-64 bg-muted animate-pulse rounded-[2rem]"></div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe of the Day */}
      {recipeOfDay && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h4 className="font-bold text-lg text-gray-800">Recipe of the Day</h4>
          </div>
          <Card
            onClick={() => onRecipeClick(recipeOfDay)}
            className="cursor-pointer rounded-[2rem] overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow duration-300"
          >
            <div className="relative h-64 sm:h-80 bg-gray-100">
              {recipeOfDay.imageLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <ChefHat className="w-16 h-16 text-muted-foreground/50" />
                </div>
              ) : recipeOfDay.imageUrl ? (
                <img src={recipeOfDay.imageUrl} alt={recipeOfDay.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]/50">
                  <ChefHat className="w-16 h-16 text-[#6b9b76]/50" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="flex-1 pr-4">
                  <h3 className="text-white font-bold text-2xl sm:text-3xl leading-tight mb-2">
                    {recipeOfDay.name}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base line-clamp-2">
                    {recipeOfDay.description}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleQuickAdd(e, recipeOfDay)}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md shrink-0 text-red-500 hover:scale-110 transition-transform"
                  title="Quick Add to Meal Plan"
                >
                  <CalendarPlus className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex justify-around items-center bg-card border-t border-border/50">
              <div className="text-center">
                <p className="font-bold text-xl text-foreground">{recipeOfDay.nutrition?.calories || 320}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Calories</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <p className="font-bold text-xl text-foreground">{recipeOfDay.nutrition?.protein ? String(recipeOfDay.nutrition.protein).match(/(\d+)/)?.[1] : 24}g</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Protein</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <p className="font-bold text-xl text-foreground">{recipeOfDay.nutrition?.carbs ? String(recipeOfDay.nutrition.carbs).match(/(\d+)/)?.[1] : 45}g</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Carbs</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Discovery Feed Grid */}
      {feed.length > 0 && (
        <div>
          <h4 className="font-bold text-lg text-gray-800 mb-4 px-1">Discover New Favorites</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed.map((recipe, index) => {
              const parseMacro = (str) => {
                if (!str) return 0;
                const match = String(str).match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
              };
              
              return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => onRecipeClick(recipe)}
                  className="cursor-pointer rounded-[2rem] overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-white h-full flex flex-col hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow duration-300"
                >
                  <div className="relative h-56 sm:h-64 shrink-0 bg-gray-100">
                    {recipe.imageLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    ) : recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]/50 text-6xl">🥗</div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div className="flex-1 pr-4">
                        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-1 line-clamp-2">
                          {recipe.name}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm line-clamp-1">
                          {recipe.description || `${recipe.prep_time || '25 min'} · ${recipe.difficulty || 'Easy'}`}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleQuickAdd(e, recipe)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md shrink-0 text-red-500 hover:scale-110 transition-transform"
                        title="Quick Add to Meal Plan"
                      >
                        <CalendarPlus className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex justify-between items-center bg-card mt-auto border-t border-border/50">
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
            )})}
          </div>
        </div>
      )}
    </div>
  );
}