import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, UtensilsCrossed, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import MoodSelector from '../components/recipe/MoodSelector';
import RecipeDisplay from '../components/recipe/RecipeDisplay';
import SavedRecipes from '../components/recipe/SavedRecipes';
import SimilarRecipes from '../components/recipe/SimilarRecipes';
import PreferenceSurvey from '../components/survey/PreferenceSurvey';
import RecipeGrid from '../components/recipe/RecipeGrid';
import IntroScreen from '../components/IntroScreen';
import BottomNav from '../components/navigation/BottomNav';
import AccountInfo from '../components/account/AccountInfo';
import MealPlanner from '../components/mealplan/MealPlanner';
import ShoppingList from '../components/mealplan/ShoppingList';
import AdvancedFilters from '../components/recipe/AdvancedFilters';
import RecommendedRecipes from '../components/recipe/RecommendedRecipes';

export default function RecipeGenerator() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const queryClient = useQueryClient();

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 100)
  });

  const filteredSavedRecipes = useMemo(() => {
    let filtered = savedRecipes.filter(r => r && r.name);

    // Apply text search
    if (globalSearchQuery.trim()) {
      const query = globalSearchQuery.toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.mood?.toLowerCase().includes(query) ||
        recipe.ingredients?.some((ing) => ing.toLowerCase().includes(query))
      );
    }

    // Apply advanced filters
    if (advancedFilters.cuisine) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.cuisine.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.cuisine.toLowerCase())
      );
    }

    if (advancedFilters.dietary) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.dietary.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.dietary.toLowerCase()) ||
        recipe.ingredients?.some((ing) => ing.toLowerCase().includes(advancedFilters.dietary.toLowerCase()))
      );
    }

    if (advancedFilters.mealType) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.mealType.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.mealType.toLowerCase())
      );
    }

    if (advancedFilters.maxPrepTime) {
      const maxMinutes = parseInt(advancedFilters.maxPrepTime);
      filtered = filtered.filter((recipe) => {
        if (!recipe.prep_time) return false;
        const prepMatch = recipe.prep_time.match(/(\d+)/);
        if (!prepMatch) return false;
        return parseInt(prepMatch[1]) <= maxMinutes;
      });
    }

    if (advancedFilters.difficulty) {
      filtered = filtered.filter((recipe) => recipe.difficulty === advancedFilters.difficulty);
    }

    if (advancedFilters.maxCalories) {
      const maxCal = parseInt(advancedFilters.maxCalories);
      filtered = filtered.filter((recipe) => (recipe.nutrition?.calories || 0) <= maxCal);
    }

    // Sorting
    const sortBy = advancedFilters.sortBy || 'date_desc';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date_desc':
          return new Date(b.created_date || 0) - new Date(a.created_date || 0);
        case 'date_asc':
          return new Date(a.created_date || 0) - new Date(b.created_date || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'time_asc': {
          const getMin = (t) => parseInt(t?.match(/(\d+)/)?.[1] || 999);
          return getMin(a.prep_time) - getMin(b.prep_time);
        }
        case 'calories_asc':
          return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
        case 'difficulty_asc': {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [savedRecipes, globalSearchQuery, advancedFilters]);

  const filteredGeneratedRecipes = useMemo(() => {
    let filtered = generatedRecipes.filter(r => r && r.name);

    // Apply text search
    if (globalSearchQuery.trim()) {
      const query = globalSearchQuery.toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.mood?.toLowerCase().includes(query) ||
        recipe.ingredients?.some((ing) => ing.toLowerCase().includes(query))
      );
    }

    // Apply advanced filters
    if (advancedFilters.cuisine) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.cuisine.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.cuisine.toLowerCase())
      );
    }

    if (advancedFilters.dietary) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.dietary.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.dietary.toLowerCase()) ||
        recipe.ingredients?.some((ing) => ing.toLowerCase().includes(advancedFilters.dietary.toLowerCase()))
      );
    }

    if (advancedFilters.mealType) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.mealType.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.mealType.toLowerCase())
      );
    }

    if (advancedFilters.maxPrepTime) {
      const maxMinutes = parseInt(advancedFilters.maxPrepTime);
      filtered = filtered.filter((recipe) => {
        if (!recipe.prep_time) return false;
        const prepMatch = recipe.prep_time.match(/(\d+)/);
        if (!prepMatch) return false;
        return parseInt(prepMatch[1]) <= maxMinutes;
      });
    }

    if (advancedFilters.difficulty) {
      filtered = filtered.filter((recipe) => recipe.difficulty === advancedFilters.difficulty);
    }

    if (advancedFilters.maxCalories) {
      const maxCal = parseInt(advancedFilters.maxCalories);
      filtered = filtered.filter((recipe) => (recipe.nutrition?.calories || 0) <= maxCal);
    }

    // Sorting
    const sortBy = advancedFilters.sortBy || 'date_desc';
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date_desc':
          return new Date(b.created_date || 0) - new Date(a.created_date || 0);
        case 'date_asc':
          return new Date(a.created_date || 0) - new Date(b.created_date || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'time_asc': {
          const getMin = (t) => parseInt(t?.match(/(\d+)/)?.[1] || 999);
          return getMin(a.prep_time) - getMin(b.prep_time);
        }
        case 'calories_asc':
          return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
        case 'difficulty_asc': {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [generatedRecipes, globalSearchQuery, advancedFilters]);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await base44.auth.me();
      setUserPreferences(user);
      if (!user.survey_completed) {
        setShowSurvey(true);
      }
      return user;
    }
  });

  const saveRecipeMutation = useMutation({
    mutationFn: (recipeData) => base44.entities.Recipe.create(recipeData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setSavedRecipeId(data.id);
      toast.success('Recipe saved to your collection!');
    }
  });

  const handleSurveyComplete = async (preferences) => {
    try {
      await base44.auth.updateMe(preferences);
      setUserPreferences({ ...userPreferences, ...preferences });
      setShowSurvey(false);
      setSelectedMoods([]);
      setGeneratedRecipes([]);
      setCurrentRecipe(null);
      setSavedRecipeId(null);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const generateRecipe = async () => {
    if (!selectedMoods.length) return;

    setIsGenerating(true);
    setSavedRecipeId(null);

    const moodDescriptions = {
      happy: "light, fun, colorful dishes that bring joy and celebrate good times",
      cozy: "warm, comforting meals perfect for relaxing at home",
      energetic: "nutritious, energizing dishes with fresh ingredients to fuel your day",
      lazy: "easy, minimal-effort comfort food that requires little cooking - simple one-pot meals, no-fuss dishes, and relaxed cooking that still tastes great",
      stressed: "simple, soothing comfort food that's easy to make and calming to eat",
      romantic: "elegant, sophisticated dishes perfect for a special dinner for two",
      adventurous: "bold, exotic flavors from around the world that excite the palate",
      anxious: "calming, grounding meals with familiar flavors - gentle, easy-to-digest dishes that bring comfort and peace of mind",
      kid_friendly: "fun, nutritious, family-friendly meals that kids will love - simple flavors, colorful presentation, finger foods, and dishes that are easy for children to eat and enjoy",
      nostalgic: "classic, traditional recipes that evoke memories and comfort - timeless dishes from the past, grandmother's cooking, old-fashioned favorites, and recipes that bring back warm memories"
    };

    const moodContext = selectedMoods.map((mood) => moodDescriptions[mood]).join(' and ');

    let preferencesContext = '';
    if (userPreferences && userPreferences.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) {
        prefs.push(`CRITICAL - AVOID these allergens: ${userPreferences.allergies}`);
      }
      if (userPreferences.diet_preferences) {
        prefs.push(`Follow these dietary preferences: ${userPreferences.diet_preferences}`);
      }
      if (userPreferences.blood_sugar_friendly) {
        prefs.push(`CRITICAL - This user needs blood sugar friendly recipes. Focus on low glycemic index foods, balanced macros, minimal added sugars, complex carbs, and fiber-rich ingredients suitable for diabetes management.`);
      }
      if (userPreferences.priorities?.length > 0) {
        prefs.push(`Prioritize: ${userPreferences.priorities.join(', ')}`);
      }
      if (userPreferences.preferred_cuisines?.length > 0) {
        prefs.push(`Preferred cuisines to draw inspiration from: ${userPreferences.preferred_cuisines.join(', ')}`);
      }
      if (userPreferences.meals_per_week) {
        const complexity = userPreferences.meals_per_week.includes('1-3') ? 'Keep it simple and easy' : 'Can be more involved';
        prefs.push(`User cooks ${userPreferences.meals_per_week}. ${complexity}`);
      }

      if (prefs.length > 0) {
        preferencesContext = `\n\nUSER PREFERENCES:\n${prefs.join('\n')}`;
      }
    }

    try {
      const conversation = await base44.agents.createConversation({ agent_name: 'recipe_generator' });
      
      let finalRecipes = [];

      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          const text = lastMessage.content;
          // Parse NDJSON (New Line Delimited JSON)
          const lines = text.split('\n').filter(line => line.trim());
          const parsedRecipes = lines.map(line => {
            try {
              // Clean up potential markdown code block artifacts if they sneak in
              const cleanLine = line.replace(/```json/g, '').replace(/```/g, '').trim();
              if (!cleanLine) return null;
              return JSON.parse(cleanLine);
            } catch (e) {
              return null;
            }
          }).filter(r => r && r.name && r.description);

          if (parsedRecipes.length > 0) {
            const recipesWithMood = parsedRecipes.map((recipe) => ({
              ...recipe,
              mood: selectedMoods.join(', '),
              imageUrl: null,
              imageLoading: true
            }));
            
            finalRecipes = recipesWithMood;
            setGeneratedRecipes(recipesWithMood);
          }
        }
      });

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: `Generate 25 diverse and delicious recipes for someone feeling ${selectedMoods.join(' and ')}. 

      The recipes should match these moods: ${moodContext}.${preferencesContext}

      Create 30 unique, appetizing recipes with variety in:
      - Cuisine types (different cultures and cooking styles)
      - Difficulty levels (mix of easy, medium, and hard)
      - Preparation times (some quick, some more involved)
      - Meal types (appetizers, mains, desserts, side dishes)

      IMPORTANT: Include a good variety of steak and poultry dishes (chicken, turkey, duck). Make sure at least 30-40% of the recipes feature beef steaks or poultry as the main protein.

      Output strictly as Newline Delimited JSON. One recipe object per line. No array wrapping.

      Each recipe JSON object must have these fields:
      - name (string): Creative and appealing name
      - description (string): Brief, enticing description
      - ingredients (array of strings): Complete list with measurements
      - instructions (array of strings): Step-by-step cooking instructions
      - prep_time (string): e.g. "15 mins"
      - cook_time (string): e.g. "30 mins"
      - servings (number): e.g. 4
      - difficulty (string): "easy", "medium", or "hard"
      - nutrition (object): { calories (number), protein, carbs, fat, fiber, sodium (strings) }
      - cooking_tips (array of strings): 3-5 helpful tips
      - substitutions (array of objects): [{ ingredient, substitute }]
      - pairings (array of strings): Wine/beverage recommendations
      - cuisine_type (string)
      - main_ingredients (array of strings)
      
      Begin immediately with the first JSON object.`
      });

      unsubscribe();
      setIsGenerating(false);

      // Generate images in background for the final list
      if (finalRecipes.length > 0) {
        Promise.all(
          finalRecipes.map(async (recipe, index) => {
            try {
              const imageResponse = await base44.integrations.Core.GenerateImage({
                prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality, detailed, delicious looking meal.`
              });
              return { index, url: imageResponse.url };
            } catch (error) {
              return { index, url: null };
            }
          })
        ).then((images) => {
          setGeneratedRecipes((prev) => {
            // Map images to the recipes by index, preserving any that might have been added/changed if necessary
            // Note: Since we replaced the list, mapping by index 1:1 with the finalRecipes snapshot is safe
            const newRecipes = [...prev];
            images.forEach(({ index, url }) => {
              if (newRecipes[index]) {
                newRecipes[index] = {
                  ...newRecipes[index],
                  imageUrl: url,
                  imageLoading: false
                };
              }
            });
            return newRecipes;
          });
        });
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to generate recipes. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = () => {
    if (currentRecipe && !savedRecipeId) {
      saveRecipeMutation.mutate(currentRecipe);
    }
  };

  const handleSavedRecipeClick = (recipe) => {
    setCurrentRecipe(recipe);
    setSelectedMoods(recipe.mood.split(', '));
    setSavedRecipeId(recipe.id);
    findSimilarRecipes(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const findSimilarRecipes = (recipe) => {
    // Find recipes with similar mood, difficulty, or cuisine
    const similar = savedRecipes.
      filter((r) => r.id !== recipe.id).
      filter((r) => {
        const hasSimilarMood = recipe.mood?.split(', ').some((mood) =>
          r.mood?.includes(mood)
        );
        const hasSimilarDifficulty = r.difficulty === recipe.difficulty;
        return hasSimilarMood || hasSimilarDifficulty;
      }).
      slice(0, 6);

    setSimilarRecipes(similar);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && currentUser && (
          <IntroScreen
            userName={currentUser?.full_name?.split(' ')[0]}
            onContinue={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#e8f0ea]">
        {/* Hero Section */}
        {!showIntro && (
          <div className="fixed top-0 left-0 right-0 bg-[#e8f0ea] border-b border-[#c5d9c9] z-50">
            <div className="bg-slate-50 mx-auto px-4 py-4 max-w-6xl sm:px-6 sm:py-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3 sm:space-y-4">

                <header className="text-center">
                  <h1 className="text-[#6b9b76] text-4xl sm:text-5xl md:text-6xl" style={{ fontFamily: 'Brittany Signature, cursive' }}>
                    MoodFull
                  </h1>
                </header>
              </motion.div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-slate-50 mx-auto px-4 pt-32 sm:pt-40 pb-24 sm:px-6 max-w-6xl space-y-8 sm:space-y-12">
          {/* Survey */}
          {showSurvey &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}>

              <PreferenceSurvey
                onComplete={handleSurveyComplete}
                initialData={userPreferences || {}}
                currentUser={currentUser || {}} />

            </motion.div>
          }

          {!showSurvey && activeTab === 'home' &&
            <>
              {/* Search & Preferences */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  {/* Global Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6b9b76]" />
                    <Input
                      type="text"
                      placeholder="Search your recipes or generate new ones..."
                      value={globalSearchQuery}
                      onChange={(e) => setGlobalSearchQuery(e.target.value)}
                      className="pl-11 pr-10 py-6 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl text-sm sm:text-base shadow-md" />

                    {globalSearchQuery &&
                      <button
                        onClick={() => setGlobalSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b9b76] hover:text-[#5a8a65] transition-colors">

                        <X className="w-4 h-4" />
                      </button>
                    }
                  </div>

                  {/* Update Preferences Button */}
                  {userPreferences?.survey_completed &&
                    <Button
                      onClick={() => setShowSurvey(true)}
                      variant="outline"
                      className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] text-sm sm:text-base whitespace-nowrap">
                      Update Preferences
                    </Button>
                  }
                </div>

                {/* Advanced Filters */}
                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={setAdvancedFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                />
              </div>

              {/* Show Saved Recipes when searching or when no generated recipes */}
              {(globalSearchQuery || Object.keys(advancedFilters).length > 0) && !currentRecipe && generatedRecipes.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#6b9b76]">
                      Search Results ({filteredSavedRecipes.length})
                    </h3>
                  </div>
                  {filteredSavedRecipes.length > 0 ? (
                    <SavedRecipes
                      recipes={filteredSavedRecipes}
                      onRecipeClick={(recipe) => {
                        handleSavedRecipeClick(recipe);
                      }}
                      searchQuery={globalSearchQuery}
                    />
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#c5d9c9]">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg mb-2">No recipes found matching your search</p>
                      <p className="text-gray-500 text-sm">Try adjusting your filters or generate new recipes below</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Mood Selector - Only show when not searching */}
              {!globalSearchQuery && Object.keys(advancedFilters).length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MoodSelector
                    selectedMoods={selectedMoods}
                    onMoodSelect={setSelectedMoods}
                    userName={currentUser?.full_name?.split(' ')[0]}
                  />
                </motion.div>
              )}

              {/* Generate Button */}
              <AnimatePresence mode="wait">
                {selectedMoods.length > 0 && !currentRecipe && generatedRecipes.length === 0 && !globalSearchQuery && Object.keys(advancedFilters).length === 0 &&
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-center">

                    <Button
                      onClick={generateRecipe}
                      disabled={isGenerating}
                      className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 rounded-3xl font-semibold w-full sm:w-auto">

                      {isGenerating ?
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating your perfect recipes...
                        </> :

                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Recipes
                        </>
                      }
                    </Button>
                  </motion.div>
                }
              </AnimatePresence>

              {/* Recipe Grid */}
              <AnimatePresence mode="wait">
                {generatedRecipes.length > 0 && !currentRecipe &&
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}>

                    <RecipeGrid
                      recipes={filteredGeneratedRecipes}
                      onRecipeClick={(recipe) => {
                        setCurrentRecipe(recipe);
                        setSavedRecipeId(null);
                      }}
                      onStartOver={() => {
                        setGeneratedRecipes([]);
                        setSelectedMoods([]);
                        setGlobalSearchQuery('');
                        setAdvancedFilters({});
                      }}
                      searchQuery={globalSearchQuery} />

                  </motion.div>
                }
              </AnimatePresence>

              {/* Recipe Display */}
              <AnimatePresence mode="wait">
                {currentRecipe &&
                  <div className="space-y-6 sm:space-y-8">
                    <RecipeDisplay
                      recipe={currentRecipe}
                      onSave={handleSaveRecipe}
                      isSaved={!!savedRecipeId} />

                    {similarRecipes.length > 0 &&
                      <SimilarRecipes
                        recipes={similarRecipes}
                        onRecipeClick={handleSavedRecipeClick} />

                    }

                    {!isGenerating &&
                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={() => {
                            setCurrentRecipe(null);
                            setSavedRecipeId(null);
                            setSimilarRecipes([]);
                          }}
                          variant="outline"
                          className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] rounded-2xl px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto">

                          Back to Results
                        </Button>
                      </div>
                    }
                  </div>
                }
              </AnimatePresence>

              {/* Personalized Recommendations - Only show when not searching */}
              {!currentRecipe && generatedRecipes.length === 0 && !globalSearchQuery && Object.keys(advancedFilters).length === 0 && (
                <RecommendedRecipes
                  userPreferences={userPreferences}
                  onRecipeClick={(recipe) => {
                    setCurrentRecipe(recipe);
                    setSavedRecipeId(null);
                  }}
                />
              )}

            </>
          }

          {/* Saved Recipes Tab */}
          {!showSurvey && activeTab === 'saved' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Your Saved Recipes</h2>
                <p className="text-gray-600">Browse and manage your collection</p>
              </div>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
                  <Input
                    type="text"
                    placeholder="Search saved recipes..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="pl-10 pr-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
                  />
                  {globalSearchQuery && (
                    <button
                      onClick={() => setGlobalSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b9b76]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={setAdvancedFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                />
              </div>

              {savedRecipes.length > 0 ? (
                <SavedRecipes
                  recipes={globalSearchQuery || Object.keys(advancedFilters).length > 0 ? filteredSavedRecipes : savedRecipes}
                  onRecipeClick={(recipe) => {
                    handleSavedRecipeClick(recipe);
                    setActiveTab('home');
                  }}
                  searchQuery={globalSearchQuery}
                  onOpenShoppingList={() => setShowShoppingList(true)}
                />
              ) : (
                <div className="text-center py-12">
                  <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No saved recipes yet. Generate some recipes to get started!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Planner Tab */}
          {!showSurvey && activeTab === 'planner' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MealPlanner onOpenShoppingList={() => setShowShoppingList(true)} />
            </motion.div>
          )}

          {/* Account Tab */}
          {!showSurvey && activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AccountInfo
                user={currentUser}
                onUpdatePreferences={() => setShowSurvey(true)}
                recipeCount={savedRecipes.length}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      {!showIntro && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* Global Shopping List Modal */}
      {showShoppingList && (
        <div className="fixed inset-0 z-50">
          <ShoppingList
            mealPlans={mealPlans}
            recipes={savedRecipes}
            onClose={() => setShowShoppingList(false)}
          />
        </div>
      )}
    </>
  );
}