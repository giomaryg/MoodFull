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

  const queryClient = useQueryClient();

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const filteredSavedRecipes = useMemo(() => {
    if (!globalSearchQuery.trim()) return savedRecipes;

    const query = globalSearchQuery.toLowerCase();
    return savedRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(query) ||
    recipe.description?.toLowerCase().includes(query) ||
    recipe.mood?.toLowerCase().includes(query) ||
    recipe.ingredients?.some((ing) => ing.toLowerCase().includes(query))
    );
  }, [savedRecipes, globalSearchQuery]);

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
      stressed: "simple, soothing comfort food that's easy to make and calming to eat",
      romantic: "elegant, sophisticated dishes perfect for a special dinner for two",
      adventurous: "bold, exotic flavors from around the world that excite the palate",
      kid_friendly: "fun, nutritious, family-friendly meals that kids will love - simple flavors, colorful presentation, finger foods, and dishes that are easy for children to eat and enjoy"
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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 18 diverse and delicious recipes for someone feeling ${selectedMoods.join(' and ')}. 
        
The recipes should match these moods: ${moodContext}.${preferencesContext}

Create 15-20 unique, appetizing recipes with variety in:
- Cuisine types (different cultures and cooking styles)
- Difficulty levels (mix of easy, medium, and hard)
- Preparation times (some quick, some more involved)
- Meal types (appetizers, mains, desserts, side dishes)

Each recipe must have:
- A creative and appealing name
- A brief, enticing description (2-3 sentences)
- Complete list of ingredients with measurements
- Step-by-step cooking instructions
- Preparation and cooking times (be realistic)
- Number of servings
- Difficulty level (easy, medium, or hard)
- Complete nutritional information per serving (calories, protein, carbs, fat, fiber, sodium)

Make each recipe special and memorable!`,
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
                  ingredients: {
                    type: "array",
                    items: { type: "string" }
                  },
                  instructions: {
                    type: "array",
                    items: { type: "string" }
                  },
                  prep_time: { type: "string" },
                  cook_time: { type: "string" },
                  servings: { type: "number" },
                  difficulty: {
                    type: "string",
                    enum: ["easy", "medium", "hard"]
                  },
                  nutrition: {
                    type: "object",
                    properties: {
                      calories: { type: "number" },
                      protein: { type: "string" },
                      carbs: { type: "string" },
                      fat: { type: "string" },
                      fiber: { type: "string" },
                      sodium: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const recipesWithMood = response.recipes.map((recipe) => ({
        ...recipe,
        mood: selectedMoods.join(', '),
        imageUrl: null,
        imageLoading: true
      }));

      setGeneratedRecipes(recipesWithMood);

      // Generate images for each recipe in parallel
      Promise.all(
        recipesWithMood.map(async (recipe, index) => {
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
        setGeneratedRecipes((prev) =>
        prev.map((recipe, i) => ({
          ...recipe,
          imageUrl: images[i].url,
          imageLoading: false
        }))
        );
      });
    } catch (error) {
      toast.error('Failed to generate recipe. Please try again.');
    } finally {
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Global Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
                <Input
                type="text"
                placeholder="Search all recipes..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="pl-10 pr-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl text-sm sm:text-base" />

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

            {/* Mood Selector */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>

              <MoodSelector
              selectedMoods={selectedMoods}
              onMoodSelect={setSelectedMoods}
              userName={currentUser?.full_name?.split(' ')[0]} />

            </motion.div>

        {/* Generate Button */}
        <AnimatePresence mode="wait">
          {selectedMoods.length > 0 && !currentRecipe && generatedRecipes.length === 0 &&
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
                recipes={generatedRecipes}
                onRecipeClick={(recipe) => {
                  setCurrentRecipe(recipe);
                  setSavedRecipeId(null);
                }}
                onStartOver={() => {
                  setGeneratedRecipes([]);
                  setSelectedMoods([]);
                }} />

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

            {/* Search */}
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

            {savedRecipes.length > 0 ? (
              <SavedRecipes
                recipes={globalSearchQuery ? filteredSavedRecipes : savedRecipes}
                onRecipeClick={(recipe) => {
                  handleSavedRecipeClick(recipe);
                  setActiveTab('home');
                }}
              />
            ) : (
              <div className="text-center py-12">
                <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No saved recipes yet. Generate some recipes to get started!</p>
              </div>
            )}
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
    </>
  );

}