import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, Sparkles, RefreshCw, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function RecommendedRecipes({ userPreferences, inventory = [], onRecipeClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState(() => {
    try {return JSON.parse(localStorage.getItem('recipeRecommendationsFeedback')) || { liked: [], disliked: [] };} catch {return { liked: [], disliked: [] };}
  });
  const queryClient = useQueryClient();

  const handleFeedback = (recipe, type, e) => {
    e.stopPropagation();
    const newFeedback = { ...feedback };
    if (type === 'dislike') {
      newFeedback.disliked.push(recipe.name);
      setRecommendations((prev) => prev.filter((r) => r.name !== recipe.name));
      toast.success('Got it! We will show you less recipes like this.');
    } else {
      if (!newFeedback.liked.includes(recipe.name)) {
        newFeedback.liked.push(recipe.name);
      }
      toast.success('Awesome! We will show you more recipes like this.');
    }
    setFeedback(newFeedback);
    localStorage.setItem('recipeRecommendationsFeedback', JSON.stringify(newFeedback));
  };

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 50)
  });

  const userContext = useMemo(() => {
    if (!userPreferences) return '';

    // Analyze user's saved recipes to find patterns
    const savedRecipeNames = savedRecipes.slice(0, 10).map((r) => r.name).join(', ');
    const savedMoods = [...new Set(savedRecipes.map((r) => r.mood).filter(Boolean))].join(', ');
    const mealPlanRecipes = mealPlans.slice(0, 10).map((m) => m.recipe_name).join(', ');

    // Build context about user preferences
    let contextParts = [];

    if (userPreferences.diet_preferences) {
      contextParts.push(`Dietary preferences: ${userPreferences.diet_preferences}`);
    }
    if (userPreferences.allergies) {
      contextParts.push(`MUST AVOID: ${userPreferences.allergies}`);
    }
    if (userPreferences.blood_sugar_friendly) {
      contextParts.push(`Needs blood sugar friendly recipes with low glycemic index`);
    }
    if (userPreferences.priorities?.length > 0) {
      contextParts.push(`Priorities: ${userPreferences.priorities.join(', ')}`);
    }
    if (userPreferences.preferred_cuisines?.length > 0) {
      contextParts.push(`Preferred cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
    }
    if (userPreferences.cooking_skill) {
      contextParts.push(`Skill level: ${userPreferences.cooking_skill}`);
    }
    if (userPreferences.equipment?.length > 0) {
      contextParts.push(`Available equipment: ${userPreferences.equipment.join(', ')}`);
    }
    if (savedRecipeNames) {
      contextParts.push(`Recently saved recipes: ${savedRecipeNames}`);
    }
    if (savedMoods) {
      contextParts.push(`Favorite moods: ${savedMoods}`);
    }
    if (mealPlanRecipes) {
      contextParts.push(`Recently planned meals: ${mealPlanRecipes}`);
    }

    if (inventory && inventory.length > 0) {
      const inventoryList = inventory.map((i) => i.name).join(', ');
      contextParts.push(`Current pantry inventory (prioritize using these): ${inventoryList}`);
    }

    if (feedback.liked.length > 0) {
      contextParts.push(`User recently LIKED these recommendations: ${feedback.liked.slice(-10).join(', ')}`);
    }
    if (feedback.disliked.length > 0) {
      contextParts.push(`User recently DISLIKED these recommendations: ${feedback.disliked.slice(-10).join(', ')}. Do NOT recommend these again.`);
    }

    return contextParts.join('\n');
  }, [userPreferences, savedRecipes, mealPlans, inventory]);

  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const [cookNextRecipe, setCookNextRecipe] = useState(null);

  const generateRecommendations = async () => {
    if (!userPreferences) return;

    setIsGenerating(true);

    try {
      const inventoryPrompt = inventory && inventory.length > 0 ?
      "Make sure at least 3 of these recommendations primarily use ingredients the user currently has in their pantry." :
      "";

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this user's preferences, recommend 6 diverse recipes:

${userContext}

${inventoryPrompt}

Generate 6 personalized recipe recommendations.
Each recipe must have:
- Name
- Description
- Ingredients with measurements
- Instructions
- Prep time
- Cook time`,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  ingredients: { type: "array", items: { type: "string" } },
                  instructions: { type: "array", items: { type: "string" } },
                  prep_time: { type: "string" },
                  cook_time: { type: "string" }
                }
              }
            }
          }
        }
      });

      const recipesWithImages = response.recipes.
      filter((r) => r && r.name && r.description).
      map((recipe) => ({
        ...recipe,
        mood: 'recommended',
        imageUrl: null,
        imageLoading: true
      }));

      setRecommendations(recipesWithImages);

      // Generate images individually to show them as they complete
      recipesWithImages.forEach(async (recipe, index) => {
        try {
          const imageResponse = await base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality, detailed.`
          });

          setRecommendations((prev) =>
          prev.map((r, i) => i === index ? { ...r, imageUrl: imageResponse.url, imageLoading: false } : r)
          );
        } catch (error) {
          // If image generation fails, just stop loading
          setRecommendations((prev) =>
          prev.map((r, i) => i === index ? { ...r, imageLoading: false } : r)
          );
        }
      });

      toast.success('Recommendations generated!');
    } catch (error) {
      toast.error('Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCookNext = async () => {
    if (!userPreferences) return;

    setIsGeneratingNext(true);

    try {
      const inventoryContext = inventory && inventory.length > 0 ?
      `Current pantry: ${inventory.map((i) => {
        let itemStr = i.name;
        if (i.expiry_date) {
          const days = Math.ceil((new Date(i.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
          if (days <= 7) itemStr += ` (EXPIRING in ${days} days - URGENT)`;
        }
        return itemStr;
      }).join(', ')}. You MUST prioritize using the expiring ingredients.` :
      "";

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the user's preferences and inventory, suggest EXACTLY ONE highly optimized recipe they should "Cook This Next".
        
${userContext}

${inventoryContext}

The recipe should be practical, use what they have (especially expiring items), and be exciting.
Generate the recipe with Name, Description, Ingredients, Instructions, Prep time, and Cook time.`,
        response_json_schema: {
          type: "object",
          properties: {
            recipe: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                ingredients: { type: "array", items: { type: "string" } },
                instructions: { type: "array", items: { type: "string" } },
                prep_time: { type: "string" },
                cook_time: { type: "string" }
              }
            }
          }
        }
      });

      if (response.recipe) {
        const generatedRecipe = {
          ...response.recipe,
          mood: 'Cook This Next',
          imageUrl: null,
          imageLoading: true
        };

        setCookNextRecipe(generatedRecipe);

        try {
          const imageResponse = await base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${generatedRecipe.name}. ${generatedRecipe.description}. Beautiful plating, natural lighting, appetizing, high quality, detailed.`
          });
          setCookNextRecipe((prev) => ({ ...prev, imageUrl: imageResponse.url, imageLoading: false }));
        } catch (error) {
          setCookNextRecipe((prev) => ({ ...prev, imageLoading: false }));
        }

        toast.success("We found the perfect next meal for you!");
      }

    } catch (error) {
      toast.error('Failed to generate Cook This Next recommendation');
    } finally {
      setIsGeneratingNext(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    hard: 'bg-red-50 text-red-700 border-red-200'
  };

  if (!userPreferences?.survey_completed) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#6b9b76] to-[#5a8a65] rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#6b9b76]">
              Recommended For You
            </h3>
            <p className="text-sm text-[#5a6f60]">
              Personalized based on your tastes and preferences
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
          <Button
            onClick={generateCookNext}
            disabled={isGeneratingNext || isGenerating} className="bg-[#f2b769] text-white px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9 from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 border-0">


            {isGeneratingNext ?
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking...</> :

            <><ChefHat className="w-4 h-4 mr-2" /> Cook This Next</>
            }
          </Button>
          <Button
            onClick={generateRecommendations}
            disabled={isGenerating || isGeneratingNext}
            className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white w-full sm:w-auto">

            {isGenerating ?
            <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </> :

            <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {recommendations.length > 0 ? 'Refresh' : 'Get Recommendations'}
              </>
            }
          </Button>
        </div>
      </div>

      {recommendations.length === 0 && !isGenerating &&
      <Card className="border-2 border-dashed border-[#c5d9c9] bg-[#f8faf8]">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-[#6b9b76] mx-auto mb-3 opacity-50" />
            <p className="text-[#5a6f60] mb-4">
              Discover recipes tailored just for you!
            </p>
            <p className="text-sm text-gray-500">
              Based on your preferences, saved recipes, meal planning history, and pantry inventory
            </p>
          </CardContent>
        </Card>
      }

      {cookNextRecipe &&
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card
          role="button"
          tabIndex={0}
          aria-label={`View details for ${cookNextRecipe.name}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRecipeClick(cookNextRecipe); } }}
          onClick={() => onRecipeClick(cookNextRecipe)}
          className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">

            <div className="absolute top-0 right-0 bg-orange-400 text-white px-4 py-1 font-bold text-sm rounded-bl-xl z-10 flex items-center gap-1 shadow-md">
              <Sparkles className="w-4 h-4" /> COOK THIS NEXT
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 h-48 md:h-auto bg-gray-200 relative overflow-hidden">
                {cookNextRecipe.imageLoading ?
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <ChefHat className="w-16 h-16 text-muted-foreground/50" />
                  </div> :
              cookNextRecipe.imageUrl ?
              <img src={cookNextRecipe.imageUrl} alt={cookNextRecipe.name} className="w-full h-full object-cover" /> :

              <div className="absolute inset-0 flex items-center justify-center bg-orange-100">
                    <ChefHat className="w-16 h-16 text-orange-300" />
                  </div>
              }
              </div>
              <div className="p-6 md:w-3/5 flex flex-col justify-center">
                <h4 className="font-bold text-2xl text-gray-900 mb-2">{cookNextRecipe.name}</h4>
                <p className="text-gray-600 mb-4">{cookNextRecipe.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-white/80 border-orange-200 text-orange-700">
                    <Clock className="w-3 h-3 mr-1" /> {cookNextRecipe.prep_time} prep
                  </Badge>
                  <Badge variant="outline" className="bg-white/80 border-orange-200 text-orange-700">
                    <Clock className="w-3 h-3 mr-1" /> {cookNextRecipe.cook_time} cook
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      }

      {recommendations.length > 0 &&
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {recommendations.map((recipe, index) =>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}>

              <Card
            role="button"
            tabIndex={0}
            aria-label={`View details for ${recipe.name}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRecipeClick(recipe); } }}
            onClick={() => onRecipeClick(recipe)}
            className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-[#6b9b76] bg-white hover:bg-[#f8faf8] group rounded-2xl overflow-hidden h-full">

                {/* Recipe Image */}
                <div className="relative h-40 sm:h-44 bg-gradient-to-br from-[#f5e8e8] to-[#d4e4d6] overflow-hidden">
                  {recipe.imageLoading ?
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                      <ChefHat className="w-12 h-12 text-muted-foreground/50" />
                    </div> :
              recipe.imageUrl ?
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> :


              <div className="absolute inset-0 flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-[#6b9b76] opacity-30" />
                    </div>
              }
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[#6b9b76] text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      For You
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                  onClick={(e) => handleFeedback(recipe, 'like', e)}
                  className={`p-1.5 rounded-full shadow-sm transition-colors ${feedback.liked.includes(recipe.name) ? 'bg-green-100 text-green-700' : 'bg-white/90 hover:bg-white text-gray-600 hover:text-green-600'}`}
                  title="Show more like this">

                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                  onClick={(e) => handleFeedback(recipe, 'dislike', e)}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-red-600 shadow-sm transition-colors"
                  title="Show less like this">

                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#6b9b76] transition-colors line-clamp-1">
                      {recipe.name}
                    </h4>
                    {recipe.recommendation_reason &&
                <p className="text-xs text-[#6b9b76] mt-1 italic line-clamp-2">
                        {recipe.recommendation_reason}
                      </p>
                }
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#c5d9c9]">
                    <Badge
                  variant="secondary"
                  className={`capitalize text-xs px-2 py-1 rounded-lg font-medium border ${difficultyColors[recipe.difficulty]}`}>

                      {recipe.difficulty}
                    </Badge>
                    {recipe.prep_time &&
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-1 rounded-lg">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prep_time}
                      </Badge>
                }
                    {recipe.servings &&
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings}
                      </Badge>
                }
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        )}
        </div>
      }
    </div>);

}

export default React.memo(RecommendedRecipes);