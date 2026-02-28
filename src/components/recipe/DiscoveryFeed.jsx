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
        <Card className="border-2 border-dashed border-[#c5d9c9] bg-[#f8faf8]">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-10 h-10 text-[#6b9b76] animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Curating your personalized recipe feed...</p>
          </CardContent>
        </Card>
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
            className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-[#c5d9c9] bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea] overflow-hidden relative"
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 h-56 md:h-auto bg-gray-200 relative overflow-hidden">
                {recipeOfDay.imageLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]/50">
                    <Loader2 className="w-8 h-8 text-[#6b9b76] animate-spin" />
                  </div>
                ) : recipeOfDay.imageUrl ? (
                  <img src={recipeOfDay.imageUrl} alt={recipeOfDay.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#e8f0ea]">
                    <ChefHat className="w-16 h-16 text-[#6b9b76]/50" />
                  </div>
                )}
              </div>
              <div className="p-6 md:w-3/5 flex flex-col justify-center">
                <h4 className="font-bold text-2xl text-gray-900 mb-2">{recipeOfDay.name}</h4>
                <p className="text-gray-600 mb-6">{recipeOfDay.description}</p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white/80 border-[#c5d9c9] text-[#5a8a65]">
                      <Clock className="w-3 h-3 mr-1" /> {recipeOfDay.prep_time} prep
                    </Badge>
                    <Badge variant="outline" className="bg-white/80 border-[#c5d9c9] text-[#5a8a65]">
                      <Clock className="w-3 h-3 mr-1" /> {recipeOfDay.cook_time} cook
                    </Badge>
                  </div>
                  <Button 
                    onClick={(e) => handleQuickAdd(e, recipeOfDay)}
                    disabled={createMealMutation.isPending}
                    size="sm"
                    className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-full shadow-md"
                  >
                    <CalendarPlus className="w-4 h-4 mr-1.5" /> Quick Add to Plan
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Discovery Feed Grid */}
      {feed.length > 0 && (
        <div>
          <h4 className="font-bold text-lg text-gray-800 mb-4 px-1">Discover New Favorites</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {feed.map((recipe, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => onRecipeClick(recipe)}
                  className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 bg-white group rounded-2xl overflow-hidden h-full flex flex-col"
                >
                  <div className="relative h-44 bg-gray-100 overflow-hidden shrink-0">
                    {recipe.imageLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      </div>
                    ) : recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Button
                        onClick={(e) => handleQuickAdd(e, recipe)}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-[#6b9b76] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0"
                        title="Quick Add to Meal Plan"
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-5 flex flex-col flex-1">
                    <div className="flex-1">
                      <h4 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#6b9b76] transition-colors line-clamp-2 mb-2">
                        {recipe.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 mt-auto border-t border-gray-100">
                      <Badge
                        variant="secondary"
                        className={`capitalize text-xs px-2 py-1 rounded-lg font-medium border ${difficultyColors[recipe.difficulty] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                      >
                        {recipe.difficulty || 'medium'}
                      </Badge>
                      {recipe.prep_time && (
                        <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200 text-xs px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {recipe.prep_time}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}