import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, Suspense, lazy } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, UtensilsCrossed, Search, X, Package, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

import MoodSelector from '../components/recipe/MoodSelector';
import RecipeDisplay from '../components/recipe/RecipeDisplay';
import RecipeGrid from '../components/recipe/RecipeGrid';
import IntroScreen from '../components/IntroScreen';
import BottomNav from '../components/navigation/BottomNav';
import AdvancedFilters from '../components/recipe/AdvancedFilters';
import RecommendedRecipes from '../components/recipe/RecommendedRecipes';
import DiscoveryFeed from '../components/recipe/DiscoveryFeed';
import ThreeBackground from '../components/ThreeBackground';
import WellnessRecommendationCard from '../components/oura/WellnessRecommendationCard';
import OrderOutSuggestion from '../components/oura/OrderOutSuggestion';

import { useNavigationStack } from '@/lib/NavigationStackContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';

const SavedRecipes = lazy(() => import('../components/recipe/SavedRecipes'));
const PreferenceSurvey = lazy(() => import('../components/survey/PreferenceSurvey'));
const AccountInfo = lazy(() => import('../components/account/AccountInfo'));
const MealPlanner = lazy(() => import('../components/mealplan/MealPlanner'));
const ShoppingList = lazy(() => import('../components/mealplan/ShoppingList'));
const Paywall = lazy(() => import('../components/paywall/Paywall'));
const CombinationCookingDialog = lazy(() => import('../components/recipe/CombinationCookingDialog'));
const InventoryManagement = lazy(() => import('../components/inventory/InventoryManagement'));
const AnalyticsDashboard = lazy(() => import('../components/analytics/AnalyticsDashboard'));
const AICoach = lazy(() => import('../components/recipe/AICoach'));
const TutorialOverlay = lazy(() => import('../components/onboarding/TutorialOverlay'));

const ENABLE_PANTRY_FEATURE = true;

export default function RecipeGenerator() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  const handleTabChange = (newTab) => {
    if (activeTab === newTab) {
      clearStack(newTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      saveScrollPosition(activeTab, window.scrollY);
      setSearchParams({ tab: newTab }, { replace: true });
    }
  };

  const queryClient = useQueryClient();
  const { pushToStack, popFromStack, peekStack, replaceTopStack, clearStack, getStack, saveScrollPosition, getScrollPosition, direction } = useNavigationStack();
  const currentRecipe = peekStack(activeTab)?.recipe || null;

  const setCurrentRecipe = (recipe) => {
    if (recipe === null) {
      clearStack(activeTab);
    } else {
      pushToStack(activeTab, { recipe });
    }
  };

  const handleBack = () => {
    popFromStack(activeTab);
    setSavedRecipeId(null);
  };

  const updateCurrentRecipe = (recipe) => {
    replaceTopStack(activeTab, { recipe });
  };

  const renderTabStack = (tabName) => (
    <AnimatePresence custom={direction}>
      {getStack(tabName).map((stackItem, index) => {
        const isTop = index === getStack(tabName).length - 1;
        return (
          <motion.div
            key={`${tabName}-stack-${index}-${stackItem.recipe?.id || stackItem.recipe?.name}`}
            custom={direction}
            initial={{ x: direction === 'backward' ? '-30%' : '100%', opacity: direction === 'backward' ? 0.5 : 1, boxShadow: direction === 'backward' ? 'none' : '-10px 0 20px rgba(0,0,0,0.1)' }}
            animate={{ x: isTop ? 0 : '-30%', opacity: isTop ? 1 : 0.5, boxShadow: isTop ? '-10px 0 20px rgba(0,0,0,0.1)' : 'none' }}
            exit={{ x: direction === 'backward' ? '100%' : '-30%', opacity: direction === 'backward' ? 1 : 0.5, boxShadow: direction === 'backward' ? '-10px 0 20px rgba(0,0,0,0.1)' : 'none' }}
            transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
            className={`w-full bg-background ${isTop ? 'relative z-50' : 'absolute top-0 left-0 z-40 pointer-events-none'}`}
            style={{ minHeight: '100vh' }}
          >
            <RecipeDisplay
              recipe={stackItem.recipe}
              onSave={handleSaveRecipe}
              isSaved={isRecipeSaved(stackItem.recipe)}
              onBack={() => popFromStack(tabName)}
              onUpdate={(updatedRecipe) => { if (isTop) replaceTopStack(tabName, { recipe: { ...stackItem.recipe, ...updatedRecipe } }); }}
              onSimilarRecipeClick={(recipe) => {
                pushToStack(tabName, { recipe });
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };




  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCombineDialog, setShowCombineDialog] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [hideExpiringAlert, setHideExpiringAlert] = useState(false);
  const [forceShowTutorial, setForceShowTutorial] = useState(false);
  const [wellnessContext, setWellnessContext] = useState(null);
  const fileInputRef = useRef(null);

  const handleFridgeScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      
      if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await updateUserMutation.mutateAsync({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
      }

      const quickResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Look at this photo of a fridge/pantry. Identify the ingredients and generate 4 realistic recipe ideas using them. Provide varied options.`,
        file_urls: [uploadRes.file_url],
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

      const quickRecipes = (quickResponse.recipes || []).filter((r) => r && r.name && r.description).map((recipe) => ({
        ...recipe,
        mood: 'Fridge Scan',
        ingredients: [],
        instructions: [],
        _loading: true
      }));

      setGeneratedRecipes(quickRecipes);
      setIsGenerating(false);

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

      enrichPromises.forEach(async (promise) => {
        const { index, detail } = await promise;
        setGeneratedRecipes((prev) => prev.map((r, i) =>
          i === index ? { ...r, ...detail, _loading: false, imageLoading: true } : r
        ));

        try {
          const recipe = quickRecipes[index];
          const [img1, img2, img3] = await Promise.all([
            base44.integrations.Core.GenerateImage({ prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.` }),
            base44.integrations.Core.GenerateImage({ prompt: `Overhead top-down view of ${recipe.name}. ${recipe.description}. Beautiful plating, on a rustic table, appetizing, high quality.` }),
            base44.integrations.Core.GenerateImage({ prompt: `Close up macro shot of ${recipe.name}. ${recipe.description}. Appetizing details, high quality.` })
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
      toast.error('Failed to scan fridge. Please try again.');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory' && !ENABLE_PANTRY_FEATURE) {
      setActiveTab('home');
      return;
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    if (!currentRecipe && !showSurvey) {
      window.scrollTo({ top: getScrollPosition(activeTab), behavior: 'instant' });
    }
  }, [activeTab, currentRecipe, showSurvey, getScrollPosition]);

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

    if (advancedFilters.includeIngredients) {
      const inclusions = advancedFilters.includeIngredients.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
      if (inclusions.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.ingredients) return false;
          return inclusions.every((inc) => recipe.ingredients.some((ing) => ing.toLowerCase().includes(inc)));
        });
      }
    }

    if (advancedFilters.excludeIngredients) {
      const exclusions = advancedFilters.excludeIngredients.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
      if (exclusions.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.ingredients) return true;
          return !recipe.ingredients.some((ing) => exclusions.some((ex) => ing.toLowerCase().includes(ex)));
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

    if (advancedFilters.usePantry && inventory && inventory.length > 0) {
      const inventoryNames = inventory.map((i) => i.name.toLowerCase());
      filtered = filtered.filter((recipe) => {
        if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
        const matchCount = recipe.ingredients.filter((ing) =>
        inventoryNames.some((inv) => ing.toLowerCase().includes(inv))
        ).length;
        return matchCount / recipe.ingredients.length >= 0.5;
      });
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
  }, [savedRecipes, globalSearchQuery, advancedFilters, inventory]);

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

    if (advancedFilters.includeIngredients) {
      const inclusions = advancedFilters.includeIngredients.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
      if (inclusions.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.ingredients) return false;
          return inclusions.every((inc) => recipe.ingredients.some((ing) => ing.toLowerCase().includes(inc)));
        });
      }
    }

    if (advancedFilters.excludeIngredients) {
      const exclusions = advancedFilters.excludeIngredients.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
      if (exclusions.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.ingredients) return true;
          return !recipe.ingredients.some((ing) => exclusions.some((ex) => ing.toLowerCase().includes(ex)));
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

    if (advancedFilters.usePantry && inventory && inventory.length > 0) {
      const inventoryNames = inventory.map((i) => i.name.toLowerCase());
      filtered = filtered.filter((recipe) => {
        if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
        const matchCount = recipe.ingredients.filter((ing) =>
        inventoryNames.some((inv) => ing.toLowerCase().includes(inv))
        ).length;
        return matchCount / recipe.ingredients.length >= 0.5;
      });
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
  }, [generatedRecipes, globalSearchQuery, advancedFilters, inventory]);

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

  const saveRecipeMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: (recipeData) => base44.entities.Recipe.create(recipeData),
    action: 'create',
    onSuccessMessage: 'Recipe saved to your collection!',
    onErrorMessage: 'Failed to save recipe',
    onSuccessCallback: (data) => {
      setSavedRecipeId(data.id);
    }
  });

  const updateUserMutation = useOptimisticMutation({
    queryKey: ['currentUser'],
    mutationFn: (data) => base44.auth.updateMe(data),
    action: 'update'
  });

  const handleSurveyComplete = async (preferences) => {
    try {
      await updateUserMutation.mutateAsync(preferences);
      setUserPreferences({ ...userPreferences, ...preferences });
      setShowSurvey(false);
      setSelectedMoods([]);
      setGeneratedRecipes([]);
      setCurrentRecipe(null);
      setSavedRecipeId(null);
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
      kid_friendly: "realistic, simple, very easy meals with extremely familiar ingredients that kids actually eat",
      family_friendly: "realistic, simple, everyday family-friendly meals with familiar, accessible ingredients that the whole family will enjoy",
      nostalgic: "classic, traditional recipes",
      sick: "easy to digest, soothing, warm, hydrating, gentle, immune-supporting meals like soups or broths"
    };

    const moodContext = selectedMoods.map((mood) => moodDescriptions[mood]).join(', ');

    let preferencesContext = '';
    if (wellnessContext && currentUser?.oura_data_consent) {
      preferencesContext += ` User's wellness context from Oura: Readiness is ${wellnessContext.readiness}, Sleep was ${wellnessContext.sleep}, Activity is ${wellnessContext.activity}. Please ensure the recipe recommendations support this wellness state (e.g., energizing if sleep was poor, comforting if readiness is low, protein-forward if activity is high).`;
    }

    if (userPreferences?.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) prefs.push(`AVOID: ${userPreferences.allergies}`);
      if (userPreferences.diet_preferences) prefs.push(`Diet: ${userPreferences.diet_preferences}`);
      if (userPreferences.advanced_dietary) prefs.push(`Advanced Dietary Rules: ${userPreferences.advanced_dietary}`);
      if (userPreferences.blood_sugar_friendly) prefs.push(`Low glycemic`);
      if (userPreferences.preferred_cuisines?.length > 0) prefs.push(`Cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
      if (userPreferences.cooking_skill) prefs.push(`Skill Level: ${userPreferences.cooking_skill}`);
      if (userPreferences.techniques_to_practice) prefs.push(`Techniques to Practice (Teach these!): ${userPreferences.techniques_to_practice}`);
      if (userPreferences.equipment?.length > 0) prefs.push(`Available Equipment: ${userPreferences.equipment.join(', ')}`);
      if (userPreferences.extra_equipment) prefs.push(`Extra Equipment Available: ${userPreferences.extra_equipment}`);
      if (userPreferences.vitamin_targets) prefs.push(`Nutritional/Vitamin Targets: ${userPreferences.vitamin_targets}`);
      if (prefs.length > 0) preferencesContext = ` [${prefs.join('. ')}]`;
    }

    const recentMeals = mealPlans.filter((m) => new Date(m.date) <= new Date()).slice(0, 15).map((m) => m.recipe_name).join(', ');
    if (recentMeals) {
      preferencesContext += ` History (AVOID repeats, learn preferences): ${recentMeals}.`;
    }

    try {
      const searchContext = globalSearchQuery ? `matching "${globalSearchQuery}"` : '';
      const moodPart = selectedMoods.length > 0 ? `for mood: ${moodContext}` : '';
      const mealTypePart = selectedMealTypes.length > 0 ? ` Meal type(s): ${selectedMealTypes.join(', ')}.` : '';

      let filtersContext = [];
      if (advancedFilters.cuisine) filtersContext.push(`Cuisine: ${advancedFilters.cuisine}`);
      if (advancedFilters.dietary) filtersContext.push(`Dietary: ${advancedFilters.dietary}`);
      if (advancedFilters.mealType) filtersContext.push(`Meal Type: ${advancedFilters.mealType}`);
      if (advancedFilters.maxPrepTime) filtersContext.push(`Max Prep Time: ${advancedFilters.maxPrepTime} mins`);
      if (advancedFilters.difficulty) filtersContext.push(`Difficulty: ${advancedFilters.difficulty}`);
      if (advancedFilters.maxCalories) filtersContext.push(`Max Calories: ${advancedFilters.maxCalories}`);
      if (advancedFilters.includeIngredients) filtersContext.push(`MUST Include: ${advancedFilters.includeIngredients}`);
      if (advancedFilters.excludeIngredients) filtersContext.push(`MUST AVOID: ${advancedFilters.excludeIngredients}`);
      const filterString = filtersContext.length > 0 ? ` Requirements: ${filtersContext.join(', ')}.` : '';

      // Phase 1: Fast - generate just names, descriptions, and basic info (< 5 seconds)
      const quickResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 8 diverse recipe ideas ${moodPart} ${searchContext}.${mealTypePart}${preferencesContext}${filterString} Include a wide variety of proteins (e.g. steak, chicken, salmon, shrimp, pork, lamb, tofu) and cuisines and difficulty levels. Focus heavily on requested nutritional goals and cooking techniques. Do NOT generate 8 similar recipes - make them varied and interesting.`,
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
        await updateUserMutation.mutateAsync({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
      }

      // Show recipes immediately
      setGeneratedRecipes(quickRecipes);
      setIsGenerating(false);

      // Phase 2: Enrich all recipes in parallel (ingredients, instructions, nutrition, etc.)
      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate full recipe details for "${recipe.name}" (${recipe.description}). Factor in any specific nutritional goals, specific dietary restrictions, and teach any requested cooking techniques in the instructions. Include: ingredients with measurements, step-by-step instructions, nutrition per serving (calories as number, protein/carbs/fat/fiber/sodium/sugar/saturated_fat/cholesterol as strings), vitamins_minerals (name/amount/daily_value, 4 items focusing on user targets if any), health_benefits (3), cooking_tips (3), substitutions (ingredient+substitute, 3), pairings (2).`,
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
          })]
          );
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

  const generateFromInventory = async (expiringItemsList = null) => {
    if (inventory.length === 0 && !expiringItemsList) {
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
    if (wellnessContext && currentUser?.oura_data_consent) {
      preferencesContext += ` User's wellness context from Oura: Readiness is ${wellnessContext.readiness}, Sleep was ${wellnessContext.sleep}, Activity is ${wellnessContext.activity}. Please ensure the recipe recommendations support this wellness state (e.g., energizing if sleep was poor, comforting if readiness is low, protein-forward if activity is high).`;
    }

    if (userPreferences?.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) prefs.push(`AVOID: ${userPreferences.allergies}`);
      if (userPreferences.diet_preferences) prefs.push(`Diet: ${userPreferences.diet_preferences}`);
      if (userPreferences.advanced_dietary) prefs.push(`Advanced Dietary Rules: ${userPreferences.advanced_dietary}`);
      if (userPreferences.blood_sugar_friendly) prefs.push(`Low glycemic`);
      if (userPreferences.preferred_cuisines?.length > 0) prefs.push(`Cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
      if (userPreferences.cooking_skill) prefs.push(`Skill Level: ${userPreferences.cooking_skill}`);
      if (userPreferences.techniques_to_practice) prefs.push(`Techniques to Practice (Teach these!): ${userPreferences.techniques_to_practice}`);
      if (userPreferences.equipment?.length > 0) prefs.push(`Available Equipment: ${userPreferences.equipment.join(', ')}`);
      if (userPreferences.extra_equipment) prefs.push(`Extra Equipment Available: ${userPreferences.extra_equipment}`);
      if (userPreferences.vitamin_targets) prefs.push(`Nutritional/Vitamin Targets: ${userPreferences.vitamin_targets}`);
      if (prefs.length > 0) preferencesContext = ` [${prefs.join('. ')}]`;
    }

    const recentMeals = mealPlans.filter((m) => new Date(m.date) <= new Date()).slice(0, 15).map((m) => m.recipe_name).join(', ');
    if (recentMeals) {
      preferencesContext += ` History (AVOID repeats, learn preferences): ${recentMeals}.`;
    }

    const inventoryList = inventory.map((i) => `${i.name}`).join(', ');
    const priorityItems = expiringItemsList ? `URGENT - MUST USE these expiring items: ${expiringItemsList.join(', ')}` : `Prioritize using: ${inventoryList}`;

    let filtersContext = [];
    if (advancedFilters.cuisine) filtersContext.push(`Cuisine: ${advancedFilters.cuisine}`);
    if (advancedFilters.dietary) filtersContext.push(`Dietary: ${advancedFilters.dietary}`);
    if (advancedFilters.mealType) filtersContext.push(`Meal Type: ${advancedFilters.mealType}`);
    if (advancedFilters.maxPrepTime) filtersContext.push(`Max Prep Time: ${advancedFilters.maxPrepTime} mins`);
    if (advancedFilters.difficulty) filtersContext.push(`Difficulty: ${advancedFilters.difficulty}`);
    if (advancedFilters.maxCalories) filtersContext.push(`Max Calories: ${advancedFilters.maxCalories}`);
    if (advancedFilters.includeIngredients) filtersContext.push(`MUST Include: ${advancedFilters.includeIngredients}`);
    if (advancedFilters.excludeIngredients) filtersContext.push(`MUST AVOID: ${advancedFilters.excludeIngredients}`);
    const filterString = filtersContext.length > 0 ? ` Requirements: ${filtersContext.join(', ')}.` : '';

    try {
      const quickResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 4 realistic recipe ideas. ${priorityItems}. Try to minimize extra ingredients needed. ${preferencesContext}${filterString} Provide varied options.`,
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
        mood: 'From Pantry',
        ingredients: [],
        instructions: [],
        _loading: true
      }));

      if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await updateUserMutation.mutateAsync({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
      }

      setGeneratedRecipes(quickRecipes);
      setIsGenerating(false);

      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate full recipe details for "${recipe.name}" (${recipe.description}). ${priorityItems}. Factor in any specific nutritional goals, specific dietary restrictions, and teach any requested cooking techniques in the instructions. Include: ingredients with measurements, step-by-step instructions, nutrition per serving (calories as number, protein/carbs/fat/fiber/sodium/sugar/saturated_fat/cholesterol as strings), vitamins_minerals (name/amount/daily_value, 4 items focusing on user targets if any), health_benefits (3), cooking_tips (3), substitutions (ingredient+substitute, 3), pairings (2).`,
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
          })]
          );
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

  const handleCombineAndGenerate = async ({ ingredients, recipes }) => {
    setShowCombineDialog(false);
    setIsGenerating(true);
    setSavedRecipeId(null);
    setGlobalSearchQuery('');
    setAdvancedFilters({});

    let preferencesContext = '';
    if (wellnessContext && currentUser?.oura_data_consent) {
      preferencesContext += ` User's wellness context from Oura: Readiness is ${wellnessContext.readiness}, Sleep was ${wellnessContext.sleep}, Activity is ${wellnessContext.activity}. Please ensure the recipe recommendations support this wellness state (e.g., energizing if sleep was poor, comforting if readiness is low, protein-forward if activity is high).`;
    }

    if (userPreferences?.survey_completed) {
      const prefs = [];
      if (userPreferences.allergies) prefs.push(`AVOID: ${userPreferences.allergies}`);
      if (userPreferences.diet_preferences) prefs.push(`Diet: ${userPreferences.diet_preferences}`);
      if (userPreferences.advanced_dietary) prefs.push(`Advanced Dietary Rules: ${userPreferences.advanced_dietary}`);
      if (userPreferences.blood_sugar_friendly) prefs.push(`Low glycemic`);
      if (userPreferences.preferred_cuisines?.length > 0) prefs.push(`Cuisines: ${userPreferences.preferred_cuisines.join(', ')}`);
      if (userPreferences.cooking_skill) prefs.push(`Skill Level: ${userPreferences.cooking_skill}`);
      if (userPreferences.techniques_to_practice) prefs.push(`Techniques to Practice (Teach these!): ${userPreferences.techniques_to_practice}`);
      if (userPreferences.equipment?.length > 0) prefs.push(`Available Equipment: ${userPreferences.equipment.join(', ')}`);
      if (userPreferences.extra_equipment) prefs.push(`Extra Equipment Available: ${userPreferences.extra_equipment}`);
      if (userPreferences.vitamin_targets) prefs.push(`Nutritional/Vitamin Targets: ${userPreferences.vitamin_targets}`);
      if (prefs.length > 0) preferencesContext = ` [${prefs.join('. ')}]`;
    }

    let combinePrompt = [];
    if (ingredients.length > 0) combinePrompt.push(`Must incorporate these ingredients: ${ingredients.join(', ')}`);
    if (recipes.length > 0) combinePrompt.push(`Draw inspiration from or combine elements of these dishes: ${recipes.join(', ')}`);

    try {
      const quickResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 completely new, creative recipe ideas by combining these elements: ${combinePrompt.join('. ')}. Make sure they are coherent and tasty. ${preferencesContext}`,
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
        mood: 'Combined Creation',
        ingredients: [],
        instructions: [],
        _loading: true
      }));

      setGeneratedRecipes(quickRecipes);
      setIsGenerating(false);

      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate full recipe details for "${recipe.name}" (${recipe.description}). It is a fusion/combination recipe. Factor in any specific nutritional goals, specific dietary restrictions, and teach any requested cooking techniques in the instructions. Include: ingredients with measurements, step-by-step instructions, nutrition per serving (calories as number, protein/carbs/fat/fiber/sodium/sugar/saturated_fat/cholesterol as strings), vitamins_minerals (name/amount/daily_value, 4 items focusing on user targets if any), health_benefits (3), cooking_tips (3), substitutions (ingredient+substitute, 3), pairings (2).`,
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
          })]
          );
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
      toast.error('Failed to generate combined recipes.');
      setIsGenerating(false);
    }
  };

  const isRecipeSaved = (recipe) => !!savedRecipes.find(r => r.id === recipe.id || (r.name === recipe.name && r.description === recipe.description));

  const handleSaveRecipe = () => {
    const recipeToSave = peekStack(activeTab)?.recipe;
    if (recipeToSave && !isRecipeSaved(recipeToSave)) {
      // Persist the photo URL under image_url field
      const { imageUrl, imageUrls, imageLoading, _loading, ...rest } = recipeToSave;
      saveRecipeMutation.mutate({ ...rest, image_url: imageUrl || (imageUrls ? imageUrls[0] : null) });
    }
  };

  const handleRecipeClick = (recipe) => {
    saveScrollPosition(activeTab, window.scrollY);
    setCurrentRecipe(recipe);
    if (recipe.mood && activeTab === 'saved') {
      setSelectedMoods(recipe.mood.split(', '));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSavedRecipeClick = handleRecipeClick;



  return (
    <>
      <TutorialOverlay forceShow={forceShowTutorial} onCloseForceShow={() => setForceShowTutorial(false)} />

      <AnimatePresence>
        {showIntro && currentUser &&
        <IntroScreen
          userName={currentUser?.full_name?.split(' ')[0]}
          onContinue={() => setShowIntro(false)} />

        }
      </AnimatePresence>

      <PullToRefresh onRefresh={handleRefresh} isGlobal={true}>
      <div className="min-h-screen bg-background/80 relative z-10 transition-colors">
        <ThreeBackground />
        {/* Hero Section */}
        {!showIntro &&
        <div 
          className="glass-header fixed top-0 left-0 right-0 z-50 border-b-0"
          style={{ paddingTop: 'calc(0.25rem + env(safe-area-inset-top))' }}
        >
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
        <div 
          className="mx-auto px-4 sm:px-6 max-w-6xl space-y-6 sm:space-y-8"
          style={{ 
            paddingTop: 'calc(6rem + env(safe-area-inset-top))',
            paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))'
          }}
        >
          <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#6b9b76]" /></div>}>
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

          {/* Home Tab */}
          <div style={{ display: !showSurvey && activeTab === 'home' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
              animate={{ x: getStack('home').length > 0 ? '-30%' : 0, opacity: getStack('home').length > 0 ? 0.5 : 1 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
              className={`space-y-6 sm:space-y-8 w-full ${getStack('home').length > 0 ? 'absolute top-0 left-0 pointer-events-none' : 'relative'}`}
            >
              <>
              <WellnessRecommendationCard 
                user={currentUser} 
                onApplyWellnessContext={setWellnessContext} 
              />
              
              <OrderOutSuggestion user={currentUser} />

              {/* Proactive Expiring Items Alert */}
              {(() => {
                if (!ENABLE_PANTRY_FEATURE) return null;
                if (hideExpiringAlert) return null;
                const expiringItems = inventory.filter(item => {
                  if (!item.expiry_date) return false;
                  return new Date(item.expiry_date) <= new Date(Date.now() + 7 * 86400000);
                });
                if (expiringItems.length === 0 || globalSearchQuery || Object.keys(advancedFilters).length > 0) return null;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setHideExpiringAlert(true)}
                      className="absolute top-2 right-2 text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors"
                      title="Dismiss notification"
                      aria-label="Dismiss expiring items notification"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="pr-6">
                      <h4 className="font-bold text-amber-800 flex items-center gap-2">
                        <span className="text-xl">⚠️</span> Expiring Soon!
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        You have {expiringItems.length} items expiring soon (e.g. {expiringItems[0].name}).
                      </p>
                    </div>
                    <Button 
                      onClick={() => generateFromInventory(expiringItems.map(i => i.name))}
                      disabled={isGenerating}
                      className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm w-full sm:w-auto whitespace-nowrap"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Use Them Up
                    </Button>
                  </motion.div>
                );
              })()}

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
                    onKeyDown={(e) => { if (e.key === 'Enter' && activeTab === 'home') generateRecipe(); }}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)} className="bg-transparent my-3 pt-6 pr-8 pb-6 pl-10 text-sm rounded-xl flex h-9 w-full transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-2 border-[#c5d9c9] focus:border-[#6b9b76] sm:text-base shadow-md" />


                    {globalSearchQuery &&
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGlobalSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#6b9b76] hover:text-[#5a8a65] hover:bg-transparent">

                        <X className="w-4 h-4" />
                      </Button>
                  }
                  </div>

                  {/* Update Preferences Button */}
                  {userPreferences?.survey_completed &&
                <Button
                  onClick={() => setShowSurvey(true)}
                  variant="outline"
                  aria-label="Update Preferences"
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
                        <p className="text-amber-700 text-xs">You've used your 3 free generations for today. Resets in 24 hours — or <Button variant="link" className="p-0 h-auto font-semibold text-amber-800 underline" onClick={() => setShowPaywall(true)}>upgrade for unlimited</Button>.</p>
                        <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          await updateUserMutation.mutateAsync({ daily_mood_count: 0, daily_mood_reset_date: null });
                          toast.success('Daily limit reset for testing!');
                        }}
                        aria-label="Reset daily limit for testing"
                        className="mt-2 text-[10px] font-medium bg-amber-200/50 text-amber-800 hover:bg-amber-200 transition-colors">

                          Reset Limit (Dev)
                        </Button>
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
                {(selectedMoods.length > 0 || selectedMealTypes.length > 0 || globalSearchQuery.trim().length > 0 || Object.keys(advancedFilters).length > 0) && !currentRecipe && generatedRecipes.length === 0 &&
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 w-full">

                    <Button
                  onClick={generateRecipe}
                  disabled={isGenerating}
                  aria-label="Generate Recipes"
                  className="bg-gradient-to-br from-[#6b9b76] to-[#5a8a65] text-white shadow-[0_0_18px_rgba(107,155,118,0.35)] hover:shadow-[0_0_24px_rgba(107,155,118,0.5)] transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2">
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</> : <>✦ Generate</>}
                    </Button>

                    {ENABLE_PANTRY_FEATURE && (
                      <Button
                        onClick={generateFromInventory}
                        disabled={isGenerating}
                        aria-label="Generate Recipes from Pantry"
                        className="bg-white text-[#6b9b76] border-2 border-[#6b9b76] shadow-[0_0_18px_rgba(107,155,118,0.15)] hover:bg-[#f0f9f2] transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2">
                        {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</> : <><Package className="w-4 h-4 sm:w-5 sm:h-5" /> Use Pantry</>}
                      </Button>
                    )}

                    <Button
                  onClick={() => setShowCombineDialog(true)}
                  disabled={isGenerating} 
                  aria-label="Combine and Create Recipes"
                  className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.3)] hover:shadow-[0_0_24px_rgba(168,85,247,0.4)] transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2">
                      <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" /> Combine
                    </Button>

                    <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFridgeScan} />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                      aria-label="Scan Fridge with AI"
                      className="bg-white text-gray-800 border-2 border-gray-200 shadow-[0_0_18px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</> : <><Camera className="w-4 h-4 sm:w-5 sm:h-5" /> Scan Fridge</>}
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
                  onRecipeClick={handleRecipeClick}
                  onStartOver={() => {
                    setGeneratedRecipes([]);
                    setSelectedMoods([]);
                    setGlobalSearchQuery('');
                    setAdvancedFilters({});
                  }}
                  onRefresh={() => {
                    if (generatedRecipes[0]?.mood === 'From Pantry') {
                      generateFromInventory();
                    } else if (generatedRecipes[0]?.mood === 'Combined Creation') {
                      setShowCombineDialog(true);
                    } else {
                      generateRecipe();
                    }
                  }}
                  searchQuery={globalSearchQuery} />

                  </motion.div>
              }
              </AnimatePresence>



              {/* Personalized Recommendations - Only show when not searching */}
              {!currentRecipe && generatedRecipes.length === 0 && !globalSearchQuery && Object.keys(advancedFilters).length === 0 &&
                <RecommendedRecipes
                  userPreferences={userPreferences}
                  inventory={inventory}
                  onRecipeClick={handleRecipeClick} 
                />
              }

              {/* Personalized Discovery Feed - Only show when not searching for specific generated recipes */}
              {ENABLE_PANTRY_FEATURE && !currentRecipe && generatedRecipes.length === 0 &&
            <DiscoveryFeed
              userPreferences={userPreferences}
              inventory={inventory}
              searchQuery={globalSearchQuery}
              advancedFilters={advancedFilters}
              selectedMoods={selectedMoods}
              selectedMealTypes={selectedMealTypes}
              onRecipeClick={handleRecipeClick} />

            }

            </>
            </motion.div>

            {renderTabStack('home')}
            </div>

            {/* Saved Recipes Tab */}
          <div style={{ display: !showSurvey && activeTab === 'saved' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
              animate={{ x: getStack('saved').length > 0 ? '-30%' : 0, opacity: getStack('saved').length > 0 ? 0.5 : 1 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
              className={`space-y-6 w-full ${getStack('saved').length > 0 ? 'absolute top-0 left-0 pointer-events-none' : 'relative'}`}
            >
          <div className="space-y-6">

              <div className="text-center space-y-2">
                <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Your Saved Recipes</h2>
                <p className="text-gray-600">Browse and manage your collection</p>
              </div>

              {!currentUser?.is_premium && currentUser?.role !== 'admin' ?
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGlobalSearchQuery('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#6b9b76] hover:bg-transparent">

                          <X className="w-4 h-4" />
                        </Button>
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
            </div>
            </motion.div>

            {renderTabStack('saved')}
          </div>

          {/* Planner Tab */}
          <div style={{ display: !showSurvey && activeTab === 'planner' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
              animate={{ x: getStack('planner').length > 0 ? '-30%' : 0, opacity: getStack('planner').length > 0 ? 0.5 : 1 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
              className={`w-full ${getStack('planner').length > 0 ? 'absolute top-0 left-0 pointer-events-none' : 'relative'}`}
            >
              <MealPlanner
                onOpenShoppingList={() => setShowShoppingList(true)}
                generatedRecipes={generatedRecipes}
                onRequirePremium={() => setShowPaywall(true)} 
              />
            </motion.div>
            {renderTabStack('planner')}
          </div>

          {/* Inventory Tab */}
          <div style={{ display: !showSurvey && activeTab === 'inventory' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
              animate={{ x: getStack('inventory').length > 0 ? '-30%' : 0, opacity: getStack('inventory').length > 0 ? 0.5 : 1 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
              className={`w-full ${getStack('inventory').length > 0 ? 'absolute top-0 left-0 pointer-events-none' : 'relative'}`}
            >
              <InventoryManagement
                onGenerateFromExpiring={(items) => {
                  setActiveTab('home');
                  generateFromInventory(items);
                }} 
              />
            </motion.div>
            {renderTabStack('inventory')}
          </div>

          {/* Analytics Tab */}
          <div style={{ display: !showSurvey && activeTab === 'analytics' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
              animate={{ x: getStack('analytics').length > 0 ? '-30%' : 0, opacity: getStack('analytics').length > 0 ? 0.5 : 1 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
              className={`space-y-6 w-full ${getStack('analytics').length > 0 ? 'absolute top-0 left-0 pointer-events-none' : 'relative'}`}
            >
              {(!currentUser?.is_premium && currentUser?.role !== 'admin') ? (
                <div className="relative">
                  <div className="blur-sm pointer-events-none select-none">
                     <AnalyticsDashboard />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl z-10">
                    <div className="text-center px-6 py-8 bg-white rounded-2xl shadow-lg border border-[#c5d9c9] max-w-xs mx-auto">
                      <span className="text-4xl mb-3 block">🔒</span>
                      <h3 className="text-[#6b9b76] font-bold text-lg mb-1">Advanced Insights — Premium</h3>
                      <p className="text-gray-500 text-sm mb-4">Unlock detailed nutritional analytics, ingredient usage trends, and cost savings.</p>
                      <Button onClick={() => setShowPaywall(true)} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl w-full">
                        Unlock Premium
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <AnalyticsDashboard />
              )}
            </motion.div>
            {renderTabStack('analytics')}
          </div>

          {/* Account Tab */}
          <div style={{ display: !showSurvey && activeTab === 'account' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
              animate={{ x: getStack('account').length > 0 ? '-30%' : 0, opacity: getStack('account').length > 0 ? 0.5 : 1 }}
              transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
              className={`w-full ${getStack('account').length > 0 ? 'absolute top-0 left-0 pointer-events-none' : 'relative'}`}
            >
              <AccountInfo
                user={currentUser}
                onUpdatePreferences={() => setShowSurvey(true)}
                recipeCount={savedRecipes.length}
                onReplayTutorial={() => setForceShowTutorial(true)} 
              />
            </motion.div>
            {renderTabStack('account')}
          </div>
          </Suspense>
        </div>
      </div>

      {/* Bottom Navigation */}
      {!showIntro && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} isVisible={!showShoppingList} enablePantry={ENABLE_PANTRY_FEATURE} />}

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

      <CombinationCookingDialog
        isOpen={showCombineDialog}
        onClose={() => setShowCombineDialog(false)}
        inventory={inventory}
        savedRecipes={savedRecipes}
        onGenerate={handleCombineAndGenerate}
        isGenerating={isGenerating} />


      {/* Floating AI Coach Button */}
      {!showIntro && !showShoppingList && !showSurvey && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowAICoach(true)}
          aria-label="Open AI Coach"
          className="fixed right-6 sm:right-8 bg-gradient-to-r from-[#f2b769] to-[#e6a245] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all z-40 group flex items-center justify-center border-2 border-white/20 min-h-[44px] min-w-[44px]"
          style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold pl-0 group-hover:pl-2">
            AI Coach
          </span>
        </motion.button>
      )}

      {/* AI Coach Drawer */}
      <AICoach 
        isOpen={showAICoach} 
        onClose={() => setShowAICoach(false)} 
        userPreferences={userPreferences}
        mealPlans={mealPlans}
        inventory={inventory}
        onSuggestRecipe={(recipeName) => {
          setActiveTab('home');
          setGlobalSearchQuery(recipeName);
          generateRecipe();
        }}
      />

      {/* Global Shopping List Modal */}
      {showShoppingList &&
      <div className="fixed inset-0 z-50">
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-[#6b9b76]" /></div>}>
          <ShoppingList
          mealPlans={mealPlans}
          recipes={savedRecipes}
          onClose={() => setShowShoppingList(false)}
          currentUser={currentUser} />
        </Suspense>
        </div>
      }
      </PullToRefresh>
    </>);

}