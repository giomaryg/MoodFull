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
import PreferenceSurvey from '../components/recipe/PreferenceSurvey';

export default function RecipeGenerator() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.preferences) {
          setUserPreferences(currentUser.preferences);
        } else {
          setShowSurvey(true);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 20),
  });

  const saveRecipeMutation = useMutation({
    mutationFn: (recipeData) => base44.entities.Recipe.create(recipeData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setSavedRecipeId(data.id);
      toast.success('Recipe saved to your collection!');
    },
  });

  const handleSurveyComplete = async (preferences) => {
    try {
      await base44.auth.updateMe({ preferences });
      setUserPreferences(preferences);
      setShowSurvey(false);
      toast.success('Preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    }
  };

  const generateRecipe = async () => {
    if (!selectedMood) return;

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

    // Build personalized prompt based on user preferences
    let preferencesContext = '';
    if (userPreferences) {
      const prefs = [];
      if (userPreferences.allergies) {
        prefs.push(`AVOID these allergens: ${userPreferences.allergies}`);
      }
      if (userPreferences.diet_preferences) {
        prefs.push(`Follow these dietary preferences: ${userPreferences.diet_preferences}`);
      }
      if (userPreferences.priorities?.length > 0) {
        prefs.push(`Prioritize: ${userPreferences.priorities.join(', ')}`);
      }
      if (userPreferences.preferred_cuisines?.length > 0) {
        prefs.push(`Preferred cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
      }
      if (userPreferences.meals_per_week) {
        prefs.push(`User cooks ${userPreferences.meals_per_week} meals per week`);
      }
      
      if (prefs.length > 0) {
        preferencesContext = `\n\nIMPORTANT USER PREFERENCES:\n${prefs.join('\n')}`;
      }
    }

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a delicious recipe for someone feeling ${selectedMood}. 
        
The recipe should match this mood: ${moodDescriptions[selectedMood]}.${preferencesContext}

Create a unique, appetizing recipe with:
- A creative and appealing name
- A brief, enticing description (2-3 sentences)
- Complete list of ingredients with measurements
- Step-by-step cooking instructions
- Preparation and cooking times
- Number of servings
- Difficulty level (easy, medium, or hard)

Make it special and memorable!`,
        response_json_schema: {
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
            }
          }
        }
      });

      setCurrentRecipe({
        ...response,
        mood: selectedMood
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
    setSelectedMood(recipe.mood);
    setSavedRecipeId(recipe.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl shadow-xl">
                <UtensilsCrossed className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent leading-tight">
              MoodFull
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover recipes that match your mood. Let your feelings guide your next delicious meal.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Survey */}
        {showSurvey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PreferenceSurvey 
              onComplete={handleSurveyComplete}
              initialData={userPreferences || {}}
            />
          </motion.div>
        )}

        {!showSurvey && userPreferences && (
          <>
            {/* Show Update Preferences Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowSurvey(true)}
                variant="outline"
                size="sm"
                className="border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50"
              >
                Update Preferences
              </Button>
            </div>
            {/* Mood Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MoodSelector
                selectedMood={selectedMood}
                onMoodSelect={setSelectedMood}
              />
            </motion.div>

            {/* Generate Button */}
            <AnimatePresence mode="wait">
              {selectedMood && !currentRecipe && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={generateRecipe}
                    disabled={isGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-6 rounded-2xl"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating your perfect recipe...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Recipe
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recipe Display */}
            <AnimatePresence mode="wait">
              {currentRecipe && (
                <div className="space-y-6">
                  <RecipeDisplay
                    recipe={currentRecipe}
                    onSave={handleSaveRecipe}
                    isSaved={!!savedRecipeId}
                  />
                  
                  {!isGenerating && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => {
                          setCurrentRecipe(null);
                          setSavedRecipeId(null);
                        }}
                        variant="outline"
                        size="lg"
                        className="border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl"
                      >
                        Generate Another Recipe
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {/* Saved Recipes */}
            {!currentRecipe && savedRecipes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <SavedRecipes
                  recipes={savedRecipes}
                  onRecipeClick={handleSavedRecipeClick}
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}