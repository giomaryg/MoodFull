import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import MoodSelector from '../components/recipe/MoodSelector';
import RecipeDisplay from '../components/recipe/RecipeDisplay';
import SavedRecipes from '../components/recipe/SavedRecipes';
import PreferenceSurvey from '../components/survey/PreferenceSurvey';
import RecipeGrid from '../components/recipe/RecipeGrid';

export default function RecipeGenerator() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  const queryClient = useQueryClient();

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 20)
  });

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
      adventurous: "bold, exotic flavors from around the world that excite the palate"
    };

    const moodContext = selectedMoods.map(mood => moodDescriptions[mood]).join(' and ');

    let preferencesContext = '';
    if (userPreferences && userPreferences.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) {
        prefs.push(`CRITICAL - AVOID these allergens: ${userPreferences.allergies}`);
      }
      if (userPreferences.diet_preferences) {
        prefs.push(`Follow these dietary preferences: ${userPreferences.diet_preferences}`);
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
        prompt: `Generate 8 diverse and delicious recipes for someone feeling ${selectedMoods.join(' and ')}. 
        
The recipes should match these moods: ${moodContext}.${preferencesContext}

Create 8 unique, appetizing recipes with variety in:
- Cuisine types (different cultures and cooking styles)
- Difficulty levels (mix of easy, medium, and hard)
- Preparation times (some quick, some more involved)
- Meal types (appetizers, mains, desserts)

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

      const recipesWithMood = response.recipes.map(recipe => ({
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
        setGeneratedRecipes(prev => 
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f5ebe0]">
      {/* Hero Section */}
      <div className="bg-[#f5ebe0] border-b border-[#e8d5c4]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4">

            <div className="flex justify-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/691ce8ad33694c9622f52699/924d048e6_ChatGPTImageNov182025at05_01_45PM.png"
                alt="MoodFull Logo" className="w-80 h-auto" />


            </div>
            <p className="text-[#9b8175] mx-auto text-xl leading-relaxed max-w-2xl">Discover recipes that match your mood. Let your feelings guide your next delicious meal.

            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#f5ebe0] mx-auto px-6 py-12 max-w-6xl space-y-12">
        {/* Survey */}
        {showSurvey &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}>

            <PreferenceSurvey
            onComplete={handleSurveyComplete}
            initialData={userPreferences || {}} />

          </motion.div>
        }

        {!showSurvey &&
        <>
            {/* Update Preferences Button */}
            {userPreferences?.survey_completed &&
          <div className="flex justify-end">
                <Button
              onClick={() => setShowSurvey(true)}
              variant="outline"
              size="sm" className="border-2 border-[#c17a7a] hover:border-[#b06a6a] hover:bg-[#f5e6dc] text-[#c17a7a]">


                  Update Preferences
                </Button>
              </div>
          }

            {/* Mood Selector */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>

              <MoodSelector
              selectedMoods={selectedMoods}
              onMoodSelect={setSelectedMoods} />

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
                size="lg"
                className="bg-[#c17a7a] hover:bg-[#b06a6a] text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-10 py-7 rounded-3xl font-semibold">

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
              exit={{ opacity: 0, y: -20 }}
            >
              <RecipeGrid
                recipes={generatedRecipes}
                onRecipeClick={(recipe) => {
                  setCurrentRecipe(recipe);
                  setSavedRecipeId(null);
                }}
                onStartOver={() => {
                  setGeneratedRecipes([]);
                  setSelectedMoods([]);
                }}
              />
            </motion.div>
          }
        </AnimatePresence>

        {/* Recipe Display */}
        <AnimatePresence mode="wait">
          {currentRecipe &&
            <div className="space-y-6">
              <RecipeDisplay
                recipe={currentRecipe}
                onSave={handleSaveRecipe}
                isSaved={!!savedRecipeId} />

              
              {!isGenerating &&
              <div className="flex justify-center gap-4">
                  <Button
                  onClick={() => {
                    setCurrentRecipe(null);
                    setSavedRecipeId(null);
                  }}
                  variant="outline"
                  size="lg"
                  className="border-2 border-[#c17a7a] hover:border-[#b06a6a] hover:bg-[#f5e6dc] text-[#c17a7a] rounded-2xl px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all">

                    Back to Results
                  </Button>
                </div>
              }
            </div>
            }
        </AnimatePresence>

            {/* Saved Recipes */}
            {!currentRecipe && savedRecipes.length > 0 &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}>

                <SavedRecipes
              recipes={savedRecipes}
              onRecipeClick={handleSavedRecipeClick} />

              </motion.div>
          }
          </>
        }
      </div>
    </div>);

}