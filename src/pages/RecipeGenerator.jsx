import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, UtensilsCrossed, Search, X, Package } from 'lucide-react';
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
import Paywall from '../components/paywall/Paywall';
import ThreeBackground from '../components/ThreeBackground';
import InventoryManagement from '../components/inventory/InventoryManagement';

export default function RecipeGenerator() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);




  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  useLayoutEffect(() => {
    if (!currentRecipe) {
      window.scrollTo({ top: scrollPosition, behavior: 'auto' });
    }
  }, [currentRecipe, scrollPosition]);

  const queryClient = useQueryClient();

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 100)
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const filteredSavedRecipes = useMemo(() => {
    let filtered = savedRecipes.filter((r) => r && r.name);

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

    if (advancedFilters.allergens) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.allergens.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.allergens.toLowerCase()) ||
        recipe.ingredients?.some((ing) => ing.toLowerCase().includes(advancedFilters.allergens.toLowerCase()))
      );
    }

    if (advancedFilters.excludeIngredients) {
      const exclusions = advancedFilters.excludeIngredients.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      if (exclusions.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.ingredients) return true;
          return !recipe.ingredients.some(ing => exclusions.some(ex => ing.toLowerCase().includes(ex)));
        });
      }
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
        case 'time_asc':{
            const getMin = (t) => parseInt(t?.match(/(\d+)/)?.[1] || 999);
            return getMin(a.prep_time) - getMin(b.prep_time);
          }
        case 'calories_asc':
          return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
        case 'difficulty_asc':{
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
    let filtered = generatedRecipes.filter((r) => r && r.name);

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

    if (advancedFilters.allergens) {
      filtered = filtered.filter((recipe) =>
        recipe.description?.toLowerCase().includes(advancedFilters.allergens.toLowerCase()) ||
        recipe.name.toLowerCase().includes(advancedFilters.allergens.toLowerCase()) ||
        recipe.ingredients?.some((ing) => ing.toLowerCase().includes(advancedFilters.allergens.toLowerCase()))
      );
    }

    if (advancedFilters.excludeIngredients) {
      const exclusions = advancedFilters.excludeIngredients.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
      if (exclusions.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.ingredients) return true;
          return !recipe.ingredients.some(ing => exclusions.some(ex => ing.toLowerCase().includes(ex)));
        });
      }
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
        case 'time_asc':{
            const getMin = (t) => parseInt(t?.match(/(\d+)/)?.[1] || 999);
            return getMin(a.prep_time) - getMin(b.prep_time);
          }
        case 'calories_asc':
          return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
        case 'difficulty_asc':{
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
    if (!selectedMoods.length && !selectedMealTypes.length && !globalSearchQuery) return;

    // Free limit: 3 mood generations per day (resets every 24h)
    if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
      const today = new Date().toISOString().slice(0, 10);
      const lastReset = currentUser?.daily_mood_reset_date;
      const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
      if (dailyCount >= 3) {
        setShowPaywall(true);
        return;
      }
    }

    setIsGenerating(true);
    setSavedRecipeId(null);

    const moodDescriptions = {
      happy: "light, fun, colorful dishes",
      cozy: "warm, comforting meals",
      energetic: "nutritious, energizing dishes",
      lazy: "easy, minimal-effort comfort food",
      stressed: "simple, soothing comfort food",
      romantic: "elegant dishes for two",
      adventurous: "bold, exotic flavors",
      anxious: "calming, grounding meals",
      kid_friendly: "fun, family-friendly meals kids love",
      nostalgic: "classic, traditional recipes"
    };

    const moodContext = selectedMoods.map((mood) => moodDescriptions[mood]).join(', ');

    let preferencesContext = '';
    if (userPreferences?.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) prefs.push(`AVOID: ${userPreferences.allergies}`);
      if (userPreferences.diet_preferences) prefs.push(`Diet: ${userPreferences.diet_preferences}`);
      if (userPreferences.blood_sugar_friendly) prefs.push(`Low glycemic`);
      if (userPreferences.preferred_cuisines?.length > 0) prefs.push(`Cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
      if (prefs.length > 0) preferencesContext = ` [${prefs.join('. ')}]`;
    }

    try {
      const searchContext = globalSearchQuery ? `matching "${globalSearchQuery}"` : '';
      const moodPart = selectedMoods.length > 0 ? `for mood: ${moodContext}` : '';
      const mealTypePart = selectedMealTypes.length > 0 ? ` Meal type(s): ${selectedMealTypes.join(', ')}.` : '';

      // Phase 1: Fast - generate just names, descriptions, and basic info (< 5 seconds)
      const quickResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 8 diverse recipe ideas ${moodPart} ${searchContext}.${mealTypePart}${preferencesContext} Include a wide variety of proteins (e.g. steak, chicken, salmon, shrimp, pork, lamb, tofu) and cuisines and difficulty levels. Do NOT generate 8 similar recipes - make them varied and interesting.`,
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
                  prep_time: { type: "string" },
                  cook_time: { type: "string" },
                  servings: { type: "number" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  cuisine_type: { type: "string" },
                  main_ingredients: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      const quickRecipes = (quickResponse.recipes || []).
      filter((r) => r && r.name && r.description).
      map((recipe) => ({
        ...recipe,
        mood: selectedMoods.join(', '),
        ingredients: [],
        instructions: [],
        _loading: true
      }));

      // Increment daily usage count (reset if new day)
      if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await base44.auth.updateMe({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }

      // Show recipes immediately
      setGeneratedRecipes(quickRecipes);
      setIsGenerating(false);

      // Phase 2: Enrich all recipes in parallel (ingredients, instructions, nutrition, etc.)
      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate full recipe details for "${recipe.name}" (${recipe.description}). Include: ingredients with measurements, step-by-step instructions, nutrition per serving (calories as number, protein/carbs/fat/fiber/sodium/sugar/saturated_fat/cholesterol as strings), vitamins_minerals (name/amount/daily_value, 4 items), health_benefits (3), cooking_tips (3), substitutions (ingredient+substitute, 3), pairings (2).`,
          response_json_schema: {
            type: "object",
            properties: {
              ingredients: { type: "array", items: { type: "string" } },
              instructions: { type: "array", items: { type: "string" } },
              nutrition: {
                type: "object",
                properties: {
                  calories: { type: "number" },
                  protein: { type: "string" },
                  carbs: { type: "string" },
                  fat: { type: "string" },
                  fiber: { type: "string" },
                  sodium: { type: "string" },
                  sugar: { type: "string" },
                  saturated_fat: { type: "string" },
                  cholesterol: { type: "string" }
                }
              },
              vitamins_minerals: { type: "array", items: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" }, daily_value: { type: "string" } } } },
              health_benefits: { type: "array", items: { type: "string" } },
              cooking_tips: { type: "array", items: { type: "string" } },
              substitutions: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, substitute: { type: "string" } } } },
              pairings: { type: "array", items: { type: "string" } }
            }
          }
        });
        return { index, detail };
      });

      // Update recipes as each detail comes in, then load photo after detail is ready
      enrichPromises.forEach(async (promise) => {
        const { index, detail } = await promise;
        setGeneratedRecipes((prev) => prev.map((r, i) =>
        i === index ? { ...r, ...detail, _loading: false, imageLoading: true } : r
        ));

        // Load photo only after recipe details are shown
        try {
          const recipe = quickRecipes[index];
          const [img1, img2, img3] = await Promise.all([
            base44.integrations.Core.GenerateImage({
              prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.`
            }),
            base44.integrations.Core.GenerateImage({
              prompt: `Overhead top-down view of ${recipe.name}. ${recipe.description}. Beautiful plating, on a rustic table, appetizing, high quality.`
            }),
            base44.integrations.Core.GenerateImage({
              prompt: `Close up macro shot of ${recipe.name}. ${recipe.description}. Appetizing details, high quality.`
            })
          ]);
          setGeneratedRecipes((prev) => prev.map((r, i) =>
          i === index ? { ...r, imageUrls: [img1.url, img2.url, img3.url], imageUrl: img1.url, imageLoading: false } : r
          ));
        } catch {
          setGeneratedRecipes((prev) => prev.map((r, i) =>
          i === index ? { ...r, imageLoading: false } : r
          ));
        }
      });

    } catch (error) {
      toast.error('Failed to generate recipe. Please try again.');
      setIsGenerating(false);
    }
  };

  const generateFromInventory = async () => {
    if (inventory.length === 0) {
      toast.error('Add items to your pantry first!');
      setActiveTab('inventory');
      return;
    }
    
    if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
      const today = new Date().toISOString().slice(0, 10);
      const lastReset = currentUser?.daily_mood_reset_date;
      const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
      if (dailyCount >= 3) {
        setShowPaywall(true);
        return;
      }
    }

    setIsGenerating(true);
    setSavedRecipeId(null);
    setGlobalSearchQuery('');
    setAdvancedFilters({});

    let preferencesContext = '';
    if (userPreferences?.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) prefs.push(`AVOID: ${userPreferences.allergies}`);
      if (userPreferences.diet_preferences) prefs.push(`Diet: ${userPreferences.diet_preferences}`);
      if (userPreferences.blood_sugar_friendly) prefs.push(`Low glycemic`);
      if (userPreferences.preferred_cuisines?.length > 0) prefs.push(`Cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
      if (prefs.length > 0) preferencesContext = ` [${prefs.join('. ')}]`;
    }

    const inventoryList = inventory.map(i => `${i.name}`).join(', ');

    try {
      const quickResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 realistic recipe ideas using ONLY or MAINLY these ingredients I already have: ${inventoryList}. Try to minimize extra ingredients needed. ${preferencesContext}. Provide varied options.`,
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
                  prep_time: { type: "string" },
                  cook_time: { type: "string" },
                  servings: { type: "number" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  cuisine_type: { type: "string" },
                  main_ingredients: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      const quickRecipes = (quickResponse.recipes || [])
        .filter((r) => r && r.name && r.description)
        .map((recipe) => ({
          ...recipe,
          mood: 'From Pantry',
          ingredients: [],
          instructions: [],
          _loading: true
        }));

      if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await base44.auth.updateMe({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }

      setGeneratedRecipes(quickRecipes);
      setIsGenerating(false);

      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate full recipe details for "${recipe.name}" (${recipe.description}). Prioritize using: ${inventoryList}. Include: ingredients with measurements, step-by-step instructions, nutrition per serving (calories as number, protein/carbs/fat/fiber/sodium/sugar/saturated_fat/cholesterol as strings), vitamins_minerals (name/amount/daily_value, 4 items), health_benefits (3), cooking_tips (3), substitutions (ingredient+substitute, 3), pairings (2).`,
          response_json_schema: {
            type: "object",
            properties: {
              ingredients: { type: "array", items: { type: "string" } },
              instructions: { type: "array", items: { type: "string" } },
              nutrition: {
                type: "object",
                properties: {
                  calories: { type: "number" },
                  protein: { type: "string" },
                  carbs: { type: "string" },
                  fat: { type: "string" },
                  fiber: { type: "string" },
                  sodium: { type: "string" },
                  sugar: { type: "string" },
                  saturated_fat: { type: "string" },
                  cholesterol: { type: "string" }
                }
              },
              vitamins_minerals: { type: "array", items: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" }, daily_value: { type: "string" } } } },
              health_benefits: { type: "array", items: { type: "string" } },
              cooking_tips: { type: "array", items: { type: "string" } },
              substitutions: { type: "array", items: { type: "object", properties: { ingredient: { type: "string" }, substitute: { type: "string" } } } },
              pairings: { type: "array", items: { type: "string" } }
            }
          }
        });
        return { index, detail };
      });

      enrichPromises.forEach(async (promise) => {
        const { index, detail } = await promise;
        setGeneratedRecipes((prev) => prev.map((r, i) =>
          i === index ? { ...r, ...detail, _loading: false, imageLoading: true } : r
        ));

        try {
          const recipe = quickRecipes[index];
          const [img1, img2, img3] = await Promise.all([
            base44.integrations.Core.GenerateImage({
              prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.`
            }),
            base44.integrations.Core.GenerateImage({
              prompt: `Overhead top-down view of ${recipe.name}. ${recipe.description}. Beautiful plating, on a rustic table, appetizing, high quality.`
            }),
            base44.integrations.Core.GenerateImage({
              prompt: `Close up macro shot of ${recipe.name}. ${recipe.description}. Appetizing details, high quality.`
            })
          ]);
          setGeneratedRecipes((prev) => prev.map((r, i) =>
            i === index ? { ...r, imageUrls: [img1.url, img2.url, img3.url], imageUrl: img1.url, imageLoading: false } : r
          ));
        } catch {
          setGeneratedRecipes((prev) => prev.map((r, i) =>
            i === index ? { ...r, imageLoading: false } : r
          ));
        }
      });
    } catch (error) {
      toast.error('Failed to generate recipe from pantry. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = () => {
    if (currentRecipe && !savedRecipeId) {
      // Persist the photo URL under image_url field
      const { imageUrl, imageUrls, imageLoading, _loading, ...rest } = currentRecipe;
      saveRecipeMutation.mutate({ ...rest, image_url: imageUrl || (imageUrls ? imageUrls[0] : null) });
    }
  };

  const handleSavedRecipeClick = (recipe) => {
    setScrollPosition(window.scrollY);
    setCurrentRecipe(recipe);
    setSelectedMoods(recipe.mood.split(', '));
    setSavedRecipeId(recipe.id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };



  return (
    <>
      <AnimatePresence>
        {showIntro && currentUser &&
        <IntroScreen
          userName={currentUser?.full_name?.split(' ')[0]}
          onContinue={() => setShowIntro(false)} />

        }
      </AnimatePresence>

      <div className="min-h-screen bg-[#e8f0ea]/80 relative z-10">
        <ThreeBackground />
        {/* Hero Section */}
        {!showIntro &&
        <div className="pt-1 glass-header fixed top-0 left-0 right-0 z-50 border-b-0">
            <div className="mx-auto my-1 px-3 max-w-6xl">
              <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center">
                <header>
                  <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#6b9b76] mb-1 opacity-80">
                    ◎ AI Recipe Generator
                  </div>
                  <h1 className="text-gradient my-2 pt-4 pb-2 text-3xl font-normal tracking-tight sm:text-6xl" style={{ fontFamily: "'Brittany Signature', cursive" }}>
                    MoodFull
                  </h1>
                </header>
              </motion.div>
            </div>
          </div>
        }

        {/* Main Content */}
        <div className="mx-auto px-4 pt-24 sm:pt-28 pb-32 sm:px-6 max-w-6xl space-y-6 sm:space-y-8">
          {/* Survey */}
          {showSurvey &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}>

              <PreferenceSurvey
              onComplete={handleSurveyComplete}
              onSkip={() => setShowSurvey(false)}
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
                    onChange={(e) => setGlobalSearchQuery(e.target.value)} className="bg-transparent my-3 pt-6 pr-8 pb-6 pl-10 text-sm rounded-xl flex h-9 w-full transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-2 border-[#c5d9c9] focus:border-[#6b9b76] sm:text-base shadow-md" />


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
                setShowFilters={setShowFilters} />

              </div>

              {/* Show Saved Recipes when searching or when no generated recipes */}
              {(globalSearchQuery || Object.keys(advancedFilters).length > 0) && !currentRecipe && generatedRecipes.length === 0 &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#6b9b76]">
                      Search Results ({filteredSavedRecipes.length})
                    </h3>
                    <Button
                  onClick={() => generateRecipe()}
                  disabled={isGenerating}
                  variant="outline"
                  className="border-2 border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] w-full sm:w-auto">

                      {isGenerating ?
                  <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </> :

                  <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate "{globalSearchQuery}" recipes
                        </>
                  }
                    </Button>
                  </div>
                  {filteredSavedRecipes.length > 0 ?
              <SavedRecipes
                recipes={filteredSavedRecipes}
                onRecipeClick={(recipe) => {
                  handleSavedRecipeClick(recipe);
                }}
                searchQuery={globalSearchQuery} /> :


              <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#c5d9c9]">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg mb-2">No saved recipes found matching "{globalSearchQuery}"</p>
                      <p className="text-gray-500 text-sm mb-6">But you can generate new ones!</p>
                      
                      <Button
                  onClick={() => generateRecipe()}
                  disabled={isGenerating}
                  className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white">

                        {isGenerating ?
                  <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating "{globalSearchQuery}" recipes...
                          </> :

                  <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate recipes for "{globalSearchQuery}"
                          </>
                  }
                      </Button>
                    </div>
              }
                </motion.div>
            }

              {/* Daily limit notice */}
              {!currentUser?.is_premium && currentUser?.role !== 'admin' && !globalSearchQuery && Object.keys(advancedFilters).length === 0 && (() => {
              const today = new Date().toISOString().slice(0, 10);
              const lastReset = currentUser?.daily_mood_reset_date;
              const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
              const remaining = Math.max(0, 3 - dailyCount);
              if (dailyCount >= 3) {
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm">
                      <span className="text-xl">⏳</span>
                      <div>
                        <p className="font-semibold text-amber-800">Daily limit reached</p>
                        <p className="text-amber-700 text-xs">You've used your 3 free generations for today. Resets in 24 hours — or <button onClick={() => setShowPaywall(true)} className="underline font-semibold">upgrade for unlimited</button>.</p>
                        <button 
                          onClick={async () => {
                            await base44.auth.updateMe({ daily_mood_count: 0, daily_mood_reset_date: null });
                            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
                            toast.success('Daily limit reset for testing!');
                          }} 
                          className="mt-2 text-[10px] font-medium bg-amber-200/50 text-amber-800 px-2 py-1 rounded hover:bg-amber-200 transition-colors"
                        >
                          Reset Limit (Dev)
                        </button>
                      </div>
                    </motion.div>);

              }
              if (dailyCount > 0) {
                return (
                  <p className="text-xs text-center text-gray-400">{remaining} free generation{remaining !== 1 ? 's' : ''} left today</p>);

              }
              return null;
            })()}

              {/* Mood Selector - Only show when not searching */}
              {!globalSearchQuery && Object.keys(advancedFilters).length === 0 &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}>

                  <MoodSelector
                selectedMoods={selectedMoods}
                onMoodSelect={setSelectedMoods}
                selectedMealTypes={selectedMealTypes}
                onMealTypeSelect={setSelectedMealTypes}
                userName={currentUser?.full_name?.split(' ')[0]} />

                </motion.div>
            }

              {/* Generate Button */}
              <AnimatePresence mode="wait">
                {(selectedMoods.length > 0 || selectedMealTypes.length > 0) && !currentRecipe && generatedRecipes.length === 0 && !globalSearchQuery && Object.keys(advancedFilters).length === 0 &&
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row justify-center gap-4">

                    <Button
                  onClick={generateRecipe}
                  disabled={isGenerating}
                  className="bg-gradient-to-br from-[#6b9b76] to-[#5a8a65] text-white shadow-[0_0_18px_rgba(107,155,118,0.35)] hover:shadow-[0_0_24px_rgba(107,155,118,0.5)] transition-all duration-300 text-sm sm:text-base px-8 sm:px-12 py-6 sm:py-7 rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-2">
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <>✦ Generate Recipes</>}
                    </Button>

                    <Button
                  onClick={generateFromInventory}
                  disabled={isGenerating}
                  className="bg-white text-[#6b9b76] border-2 border-[#6b9b76] shadow-[0_0_18px_rgba(107,155,118,0.15)] hover:bg-[#f0f9f2] transition-all duration-300 text-sm sm:text-base px-8 sm:px-12 py-6 sm:py-7 rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-2">
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</> : <><Package className="w-5 h-5" /> Use My Pantry</>}
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
                    setScrollPosition(window.scrollY);
                    setCurrentRecipe(recipe);
                    setSavedRecipeId(null);
                    window.scrollTo({ top: 0, behavior: 'auto' });
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
              <motion.div

                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 sm:space-y-8">

                    <RecipeDisplay
                  recipe={currentRecipe}
                  onSave={handleSaveRecipe}
                  isSaved={!!savedRecipeId}
                  onUpdate={(updatedRecipe) => {
                    // Update the current recipe with the new data
                    setCurrentRecipe({ ...currentRecipe, ...updatedRecipe });
                  }}
                  onSimilarRecipeClick={(recipe) => {
                    // When clicking a similar recipe, we want to scroll to the top of the new recipe display
                    // rather than maintaining the previous scroll position.
                    setScrollPosition(0);
                    setCurrentRecipe(recipe);
                    const savedVersion = savedRecipes.find((r) => r.id === recipe.id);
                    setSavedRecipeId(savedVersion ? savedVersion.id : null);
                  }} />



                    {!isGenerating &&
                <div className="flex justify-center gap-4">
                        <Button
                    onClick={() => {
                      // The useLayoutEffect will restore the scroll position automatically
                      setCurrentRecipe(null);
                      setSavedRecipeId(null);
                    }}
                    variant="outline"
                    className="border-2 border-[#6b9b76] hover:border-[#5a8a65] hover:bg-[#f5e8e8] text-[#6b9b76] rounded-2xl px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto">

                          Back to Results
                        </Button>
                      </div>
                }
                  </motion.div>
              }
              </AnimatePresence>

              {/* Personalized Recommendations - Only show when not searching */}
              {!currentRecipe && generatedRecipes.length === 0 && !globalSearchQuery && Object.keys(advancedFilters).length === 0 &&
            <RecommendedRecipes
              userPreferences={userPreferences}
              onRecipeClick={(recipe) => {
                setScrollPosition(window.scrollY);
                setCurrentRecipe(recipe);
                setSavedRecipeId(null);
                window.scrollTo({ top: 0, behavior: 'auto' });
              }} />

            }

            </>
          }

          {/* Saved Recipes Tab */}
          {!showSurvey && activeTab === 'saved' &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6">

              <div className="text-center space-y-2">
                <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Your Saved Recipes</h2>
                <p className="text-gray-600">Browse and manage your collection</p>
              </div>

              {(!currentUser?.is_premium && currentUser?.role !== 'admin') ?
            <div className="relative">
                  {/* Blurred preview */}
                  <div className="blur-sm pointer-events-none select-none">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) =>
                  <div key={i} className="bg-white rounded-2xl border-2 border-[#c5d9c9] p-4 flex gap-4">
                          <div className="w-20 h-20 bg-[#c5d9c9] rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[#c5d9c9] rounded w-2/3" />
                            <div className="h-3 bg-[#e0ede4] rounded w-full" />
                            <div className="h-3 bg-[#e0ede4] rounded w-1/2" />
                          </div>
                        </div>
                  )}
                    </div>
                  </div>
                  {/* Overlay CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl">
                    <div className="text-center px-6 py-8 bg-white rounded-2xl shadow-lg border border-[#c5d9c9] max-w-xs mx-auto">
                      <span className="text-4xl mb-3 block">🔒</span>
                      <h3 className="text-[#6b9b76] font-bold text-lg mb-1">Save Recipes — Premium</h3>
                      <p className="text-gray-500 text-sm mb-4">Unlock unlimited recipe saving, shopping lists & more.</p>
                      <Button onClick={() => setShowPaywall(true)} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl w-full">
                        Unlock Premium
                      </Button>
                    </div>
                  </div>
                </div> :

            <>
                  {/* Search and Filters */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
                      <Input
                    type="text"
                    placeholder="Search saved recipes..."
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="pl-10 pr-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl" />

                      {globalSearchQuery &&
                  <button
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b9b76]">

                          <X className="w-4 h-4" />
                        </button>
                  }
                    </div>

                    <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={setAdvancedFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters} />

                  </div>

                  {savedRecipes.length > 0 ?
              <SavedRecipes
                recipes={globalSearchQuery || Object.keys(advancedFilters).length > 0 ? filteredSavedRecipes : savedRecipes}
                onRecipeClick={(recipe) => {
                  handleSavedRecipeClick(recipe);
                  setActiveTab('home');
                }}
                searchQuery={globalSearchQuery}
                onOpenShoppingList={() => setShowShoppingList(true)} /> :


              <div className="text-center py-12">
                      <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No saved recipes yet. Generate some recipes to get started!</p>
                    </div>
              }
                </>
            }
            </motion.div>
          }

          {/* Planner Tab */}
          {!showSurvey && activeTab === 'planner' &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>

              <MealPlanner onOpenShoppingList={() => setShowShoppingList(true)} />
            </motion.div>
          }

          {/* Inventory Tab */}
          {!showSurvey && activeTab === 'inventory' &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>
              <InventoryManagement />
            </motion.div>
          }

          {/* Account Tab */}
          {!showSurvey && activeTab === 'account' &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}>

              <AccountInfo
              user={currentUser}
              onUpdatePreferences={() => setShowSurvey(true)}
              recipeCount={savedRecipes.length} />

            </motion.div>
          }
        </div>
      </div>

      {/* Bottom Navigation */}
      {!showIntro && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall &&
        <Paywall
          onClose={() => setShowPaywall(false)}
          onSubscribe={(plan, method = 'card') => {
            // Placeholder: hook up real payment here
            const methodText = method === 'apple_pay' ? 'Apple Pay' : method === 'samsung_pay' ? 'Samsung Pay' : 'Card';
            toast.success(`You selected the ${plan} plan using ${methodText}! Payment coming soon.`);
            setShowPaywall(false);
          }} />

        }
      </AnimatePresence>

      {/* Global Shopping List Modal */}
      {showShoppingList &&
      <div className="fixed inset-0 z-50">
          <ShoppingList
          mealPlans={mealPlans}
          recipes={savedRecipes}
          onClose={() => setShowShoppingList(false)}
          currentUser={currentUser} />

        </div>
      }
    </>);

}