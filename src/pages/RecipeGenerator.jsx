import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, Suspense, lazy } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, UtensilsCrossed, Search, X, Package, Camera, Frown, BarChart2, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import SmartSearchBar from '@/components/recipe/SmartSearchBar';
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

import { useNavigationStack } from '@/lib/NavigationStackContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useSwipeDownNavigation } from '@/hooks/useSwipeDownNavigation';
import SwipeDownNav from '../components/navigation/SwipeDownNav';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import WhatsNewModal from '../components/onboarding/WhatsNewModal';
import { getLatestVersion } from '@/lib/featureAnnouncements';
import { useRecipeCache } from '@/hooks/useRecipeCache';

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
const SmartTakeoutPanel = lazy(() => import('../components/takeout/SmartTakeoutPanel'));
const InlineTakeoutResults = lazy(() => import('../components/takeout/InlineTakeoutResults'));

const ENABLE_PANTRY_FEATURE = false;

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
  const { isOpen: isSwipeNavOpen, setIsOpen: setIsSwipeNavOpen } = useSwipeDownNavigation(60, 80);
  const { getCachedRecipes, setCachedRecipes } = useRecipeCache();

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

  function renderTabStack(tabName) {
    return <AnimatePresence custom={direction}>
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
          className={`fixed inset-0 bg-background overflow-y-auto overflow-x-hidden ${isTop ? 'z-[100]' : 'z-50 pointer-events-none'}`}
          >
          
            <RecipeDisplay
            recipe={stackItem.recipe}
            onSave={handleSaveRecipe}
            isSaved={isRecipeSaved(stackItem.recipe)}
            onBack={() => popFromStack(tabName)}
            onUpdate={(updatedRecipe) => {if (isTop) replaceTopStack(tabName, { recipe: { ...stackItem.recipe, ...updatedRecipe } });}}
            onSimilarRecipeClick={(recipe) => {
              pushToStack(tabName, { recipe });
              window.scrollTo({ top: 0, behavior: 'instant' });
            }} />
          
          </motion.div>);

    })}
    </AnimatePresence>;
  }


  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };




  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  // Used for text inputs, but smart search takes over for filtering
  const [globalSearchQueryText, setGlobalSearchQueryText] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCombineDialog, setShowCombineDialog] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showTakeoutPanel, setShowTakeoutPanel] = useState(false);
  const [hideExpiringAlert, setHideExpiringAlert] = useState(false);
  const [hideLimitAlert, setHideLimitAlert] = useState(false);
  const [forceShowTutorial, setForceShowTutorial] = useState(false);
  const fileInputRef = useRef(null);
  
  const [takeoutSuggestions, setTakeoutSuggestions] = useState(null);
  const [isGeneratingTakeout, setIsGeneratingTakeout] = useState(false);
  const [userLocation, setUserLocation] = useState('');

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      toast.loading("Detecting location...");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            toast.dismiss();
            if (data && data.address) {
              const locStr = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "Current Location";
              const fullLoc = `${locStr}, ${data.address.state || ''}`.replace(/,\s*$/, "");
              setUserLocation(fullLoc);
              toast.success(`Location set to ${fullLoc}`);
            } else {
              setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              toast.success("Location set");
            }
          } catch (e) {
             toast.dismiss();
             setUserLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
             toast.success("Location set");
          }
        },
        (err) => {
          toast.dismiss();
          toast.error("Could not detect location. Please type it manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const handleFridgeScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (false) {
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

      if (false) {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await updateUserMutation.mutateAsync({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
      }

      const quickResponse = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
        prompt: `Look at this photo of a fridge/pantry. Identify the ingredients and generate 6 realistic recipe ideas using them. Provide varied options.`,
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
      setIsGeneratingTakeout(false);
      setTakeoutSuggestions(null);

      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
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
          const img1 = await base44.integrations.Core.GenerateImage({ prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.` });
          setGeneratedRecipes((prev) => prev.map((r, i) =>
          i === index ? { ...r, imageUrls: [img1.url], imageUrl: img1.url, imageLoading: false } : r
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
      handleTabChange('home');
      return;
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    if (!currentRecipe && !showSurvey) {
      window.scrollTo({ top: getScrollPosition(activeTab), behavior: 'instant' });
    }
  }, [activeTab, currentRecipe, showSurvey, getScrollPosition]);

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

  const { data: savedRecipes = [] } = useQuery({
    queryKey: ['recipes', currentUser?.email],
    queryFn: () => currentUser?.email ? base44.entities.Recipe.list('-created_date', 100) : [],
    enabled: !!currentUser?.email
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 100)
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const availableRecipesForSearch = activeTab === 'saved' ? savedRecipes : generatedRecipes;
  const { 
    query: globalSearchQuery, 
    setQuery: setGlobalSearchQuery, 
    isSearching: isSmartSearching, 
    smartResults, 
    searchIntent 
  } = useSmartSearch(availableRecipesForSearch);

  // Sync the text version for legacy usages
  useEffect(() => {
    setGlobalSearchQueryText(globalSearchQuery);
  }, [globalSearchQuery]);

  const filteredSavedRecipes = useMemo(() => {
    let filtered = savedRecipes.filter((r) => r && r.name);

    // Apply Smart Search Results if available
    if (globalSearchQuery.trim() && smartResults !== null) {
      if (smartResults.length === 0) return []; // No results found by AI
      
      // Filter by the IDs returned by the AI, and attach the reason
      const resultIds = new Set(smartResults.map(r => r.id));
      filtered = filtered.filter(recipe => resultIds.has(recipe.id));
      
      // Inject the reason into the recipe object for display
      filtered = filtered.map(recipe => {
        const match = smartResults.find(r => r.id === recipe.id);
        return { ...recipe, searchReason: match?.reason };
      });
      
      // Sort by AI score
      filtered.sort((a, b) => {
        const scoreA = smartResults.find(r => r.id === a.id)?.score || 0;
        const scoreB = smartResults.find(r => r.id === b.id)?.score || 0;
        return scoreB - scoreA;
      });
    } else if (globalSearchQuery.trim()) {
      // Fallback basic text search
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
        const prepMatch = String(recipe.prep_time).match(/(\d+)/);
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
            const getMin = (t) => parseInt(String(t || '').match(/(\d+)/)?.[1] || 999);
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

    // Apply Smart Search Results if available
    if (globalSearchQuery.trim() && smartResults !== null) {
      if (smartResults.length === 0) return []; // No results found by AI
      
      // Filter by the IDs returned by the AI, and attach the reason
      const resultIds = new Set(smartResults.map(r => r.id));
      filtered = filtered.filter(recipe => resultIds.has(recipe.id));
      
      // Inject the reason into the recipe object for display
      filtered = filtered.map(recipe => {
        const match = smartResults.find(r => r.id === recipe.id);
        return { ...recipe, searchReason: match?.reason };
      });
      
      // Sort by AI score
      filtered.sort((a, b) => {
        const scoreA = smartResults.find(r => r.id === a.id)?.score || 0;
        const scoreB = smartResults.find(r => r.id === b.id)?.score || 0;
        return scoreB - scoreA;
      });
    } else if (globalSearchQuery.trim()) {
      // Fallback basic text search
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
        const prepMatch = String(recipe.prep_time).match(/(\d+)/);
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
            const getMin = (t) => parseInt(String(t || '').match(/(\d+)/)?.[1] || 999);
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
      const latestVersion = getLatestVersion();
      const updatedPrefs = { ...preferences, last_seen_features_version: latestVersion };
      await updateUserMutation.mutateAsync(updatedPrefs);
      // Ensure we also save to localStorage for immediate fallback consistency
      localStorage.setItem('moodfull_last_seen_features_version', latestVersion.toString());
      
      setUserPreferences({ ...userPreferences, ...updatedPrefs });
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

  const generateRecipe = async (ignoreCache = false) => {
    if (!selectedMoods.length && !selectedMealTypes.length && !globalSearchQuery) return;

    // Free limit: 3 mood generations per day (resets every 24h)
    if (false) {
      const today = new Date().toISOString().slice(0, 10);
      const lastReset = currentUser?.daily_mood_reset_date;
      const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
      if (dailyCount >= 3) {
        setShowPaywall(true);
        return;
      }
    }

    setSavedRecipeId(null);

    const cacheKeyParams = {
      moods: selectedMoods,
      meals: selectedMealTypes,
      query: globalSearchQuery,
      filters: advancedFilters
    };

    const triggerTakeoutGeneration = () => {
      setIsGeneratingTakeout(true);
      setTakeoutSuggestions(null);
      const diet = userPreferences?.diet_preferences || userPreferences?.allergies 
        ? `Diet: ${userPreferences.diet_preferences || 'None'}, Allergies: ${userPreferences.allergies || 'None'}` 
        : '';
      const preg = userPreferences?.pregnancy_status && ['pregnant', 'trying'].includes(userPreferences.pregnancy_status)
        ? `\nCRITICAL CONTEXT: The user is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Ensure all suggestions are pregnancy-safe (avoid raw/undercooked animal products, unpasteurized dairy, high-mercury fish, alcohol, etc).`
        : '';
        
      const locContext = userLocation 
        ? `\nUSER LOCATION: ${userLocation}. CRITICAL: You MUST include REAL RESTAURANT NAMES (chains or local favorites available in this specific location) and ACTUAL MENU ITEMS from them.` 
        : `\nCRITICAL: INCLUDE REAL RESTAURANT NAMES (prefer widely available chains or known local types if location isn't provided) and ACTUAL MENU ITEMS.`;

      base44.integrations.Core.InvokeLLM({
        prompt: `You are MoodFull's Smart Takeout AI. The user wants to order takeout instead of cooking.
Current mood/vibe: ${selectedMoods.join(', ')}
User clicked "Find My Food" - pick the absolute best option for them right now based on time of day and general healthy habits.
${diet}
${preg}
${locContext}

Based on this, suggest 1 dominant best order, and 2 alternatives.
For each, provide:
1. The restaurant type or specific restaurant name (e.g. "Sweetgreen", "Chipotle", or a local name if inferred from location)
2. The specific item name to order
3. What typical unhealthy meal this replaces (Swap Instead of Sacrifice)
4. Regret Reduction (e.g. "Saves ~400 calories vs typical order" or "High protein keeps you full")
5. Speed/Urgency (e.g. "Fastest option: ~18 min" or "Ready in ~25 min")
6. Smart Defaults (2 sides/drinks to complete the meal, e.g. "side of guac", "sparkling water")
7. Ordering modifications (e.g. "no mayo", "sauce on side")

Also provide a 'personalization_hook' that sounds like a friend talking (e.g. "You've been eating heavy this week—try this lighter option tonight" or "It's late—here's the fastest healthy choice").
Make it actionable, real, and immediate. Return a structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            personalization_hook: { type: "string" },
            dominant_recommendation: {
              type: "object",
              properties: {
                restaurant_type: { type: "string" },
                item_name: { type: "string" },
                replaces: { type: "string" },
                regret_reduction: { type: "string" },
                speed_urgency: { type: "string" },
                smart_defaults: { type: "array", items: { type: "string" } },
                modifications: { type: "array", items: { type: "string" } }
              },
              required: ["restaurant_type", "item_name", "replaces", "regret_reduction", "speed_urgency", "smart_defaults", "modifications"]
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  restaurant_type: { type: "string" },
                  item_name: { type: "string" },
                  replaces: { type: "string" },
                  regret_reduction: { type: "string" },
                  speed_urgency: { type: "string" },
                  smart_defaults: { type: "array", items: { type: "string" } },
                  modifications: { type: "array", items: { type: "string" } }
                }
              }
            }
          },
          required: ["personalization_hook", "dominant_recommendation", "alternatives"]
        }
      }).then(response => {
        setTakeoutSuggestions(response);
      }).catch(error => {
        console.error('Failed to generate takeout options:', error);
      }).finally(() => {
        setIsGeneratingTakeout(false);
      });
    };

    if (!ignoreCache) {
      const cached = getCachedRecipes('generator', cacheKeyParams);
      if (cached && cached.length > 0) {
        setGeneratedRecipes(cached);
        triggerTakeoutGeneration();
        return;
      }
    }

    const skeletons = Array(6).fill(null).map((_, i) => ({
      id: `temp-${Date.now()}-${i}`,
      name: "Crafting your recipe...",
      description: "Finding the perfect match for your mood and preferences...",
      mood: selectedMoods.join(', ') || 'AI Generated',
      _loading: true,
      imageLoading: true
    }));
    
    setGeneratedRecipes(skeletons);
    // Setting isGenerating to false gives an instant response feel 
    setIsGenerating(false);
    triggerTakeoutGeneration();

    // Run Takeout generation simultaneously
    setIsGeneratingTakeout(true);
    setTakeoutSuggestions(null);
    const dietaryContext = userPreferences?.diet_preferences || userPreferences?.allergies 
      ? `Diet: ${userPreferences.diet_preferences || 'None'}, Allergies: ${userPreferences.allergies || 'None'}` 
      : '';
    const pregnancyContext = userPreferences?.pregnancy_status && ['pregnant', 'trying'].includes(userPreferences.pregnancy_status)
      ? `\nCRITICAL CONTEXT: The user is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Ensure all suggestions are pregnancy-safe (avoid raw/undercooked animal products, unpasteurized dairy, high-mercury fish, alcohol, etc).`
      : '';

    base44.integrations.Core.InvokeLLM({
      prompt: `You are MoodFull's Smart Takeout AI. The user wants to order takeout instead of cooking.
Current mood/vibe: ${selectedMoods.join(', ')}
User clicked "Find My Food" - pick the absolute best option for them right now based on time of day and general healthy habits.
${dietaryContext}
${pregnancyContext}

Based on this, suggest 1 dominant best order, and 2 alternatives.
For each, provide:
1. The restaurant type or generic name (e.g. "Fresh Bowl Co." or "Local Mediterranean")
2. The specific item name to order
3. What typical unhealthy meal this replaces (Swap Instead of Sacrifice)
4. Regret Reduction (e.g. "Saves ~400 calories vs typical order" or "High protein keeps you full")
5. Speed/Urgency (e.g. "Fastest option: ~18 min" or "Ready in ~25 min")
6. Smart Defaults (2 sides/drinks to complete the meal, e.g. "side of guac", "sparkling water")
7. Ordering modifications (e.g. "no mayo", "sauce on side")

Also provide a 'personalization_hook' that sounds like a friend talking (e.g. "You've been eating heavy this week—try this lighter option tonight" or "It's late—here's the fastest healthy choice").
Make it actionable, real, and immediate. Return a structured JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          personalization_hook: { type: "string" },
          dominant_recommendation: {
            type: "object",
            properties: {
              restaurant_type: { type: "string" },
              item_name: { type: "string" },
              replaces: { type: "string" },
              regret_reduction: { type: "string" },
              speed_urgency: { type: "string" },
              smart_defaults: { type: "array", items: { type: "string" } },
              modifications: { type: "array", items: { type: "string" } }
            },
            required: ["restaurant_type", "item_name", "replaces", "regret_reduction", "speed_urgency", "smart_defaults", "modifications"]
          },
          alternatives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                restaurant_type: { type: "string" },
                item_name: { type: "string" },
                replaces: { type: "string" },
                regret_reduction: { type: "string" },
                speed_urgency: { type: "string" },
                smart_defaults: { type: "array", items: { type: "string" } },
                modifications: { type: "array", items: { type: "string" } }
              }
            }
          }
        },
        required: ["personalization_hook", "dominant_recommendation", "alternatives"]
      }
    }).then(response => {
      setTakeoutSuggestions(response);
    }).catch(error => {
      console.error('Failed to generate takeout options:', error);
    }).finally(() => {
      setIsGeneratingTakeout(false);
    });

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
      sick: "easy to digest, soothing, warm, hydrating, gentle, immune-supporting meals like soups or broths",
      in_a_rush: "ultra-fast, quick prep meals that can be made in under 15 minutes",
      light_bite: "small portions, low calorie, refreshing, and light meals or snacks",
      sad: "very comforting, nostalgic, indulgent, and mood-boosting foods like mac and cheese or warm stews",
      indecisive: "a fun, highly varied mix of safe bets, wildly different cuisines, and unexpected pleasant surprises"
    };

    const moodContext = selectedMoods.map((mood) => moodDescriptions[mood] || mood).join(', ');

    let preferencesContext = '';

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
      if (userPreferences.pregnancy_status === 'pregnant' || userPreferences.pregnancy_status === 'trying') {
        prefs.push(`CRITICAL CONTEXT: User is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Prioritize safe, nutrient-dense meals (iron, folate, protein, calcium). AVOID high-risk ingredients (raw/undercooked meats, fish, eggs, unpasteurized dairy, alcohol). Emphasize well-cooked, balanced, gentle and nourishing meals. Add 'Pregnancy-friendly' or 'Well-cooked & safe option' to the description or mood tags. Do not give medical advice.`);
      }
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
      const quickResponse = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
        prompt: `Generate 6 diverse recipe ideas ${moodPart} ${searchContext}.${mealTypePart}${preferencesContext}${filterString} Include a wide variety of proteins (e.g. steak, chicken, salmon, shrimp, pork, lamb, tofu) and cuisines and difficulty levels. Focus heavily on requested nutritional goals and cooking techniques. Do NOT generate 6 similar recipes - make them varied and interesting.`,
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
      if (false) {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await updateUserMutation.mutateAsync({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
      }

      // Update skeletons with generated basic info
      setGeneratedRecipes(quickRecipes);

      // Phase 2: Enrich all recipes in parallel (ingredients, instructions, nutrition, etc.)
      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
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
          const img1 = await base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.`
          });
          setGeneratedRecipes((prev) => {
            const next = prev.map((r, i) =>
              i === index ? { ...r, imageUrls: [img1.url], imageUrl: img1.url, imageLoading: false } : r
            );
            if (next.length > 0 && !next.some(r => r._loading || r.imageLoading)) {
              setCachedRecipes('generator', cacheKeyParams, next);
            }
            return next;
          });
        } catch {
          setGeneratedRecipes((prev) => {
            const next = prev.map((r, i) =>
              i === index ? { ...r, imageLoading: false } : r
            );
            if (next.length > 0 && !next.some(r => r._loading || r.imageLoading)) {
              setCachedRecipes('generator', cacheKeyParams, next);
            }
            return next;
          });
        }
      });

    } catch (error) {
      toast.error('Failed to generate recipe. Please try again.');
      setGeneratedRecipes([]); // Clear skeletons on error
      setIsGenerating(false);
    }
  };

  const generateFromInventory = async (expiringItemsList = null, ignoreCache = false) => {
    if (inventory.length === 0 && !expiringItemsList) {
      toast.error('Add items to your pantry first!');
      handleTabChange('inventory');
      return;
    }

    if (false) {
      const today = new Date().toISOString().slice(0, 10);
      const lastReset = currentUser?.daily_mood_reset_date;
      const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
      if (dailyCount >= 3) {
        setShowPaywall(true);
        return;
      }
    }

    setSavedRecipeId(null);
    setGlobalSearchQuery('');
    setAdvancedFilters({});

    const cacheKeyParams = {
      inventoryItems: inventory.map(i => i.name),
      expiringItemsList,
      filters: advancedFilters
    };

    if (!ignoreCache) {
      const cached = getCachedRecipes('pantry', cacheKeyParams);
      if (cached && cached.length > 0) {
        setGeneratedRecipes(cached);
        return;
      }
    }

    const skeletons = Array(6).fill(null).map((_, i) => ({
      id: `temp-${Date.now()}-${i}`,
      name: "Checking your pantry...",
      description: "Finding the best recipes for what you have...",
      mood: 'From Pantry',
      _loading: true,
      imageLoading: true
    }));
    
    setGeneratedRecipes(skeletons);
    setIsGenerating(false);
    setIsGeneratingTakeout(false);
    setTakeoutSuggestions(null);

    let preferencesContext = '';

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
      if (userPreferences.pregnancy_status === 'pregnant' || userPreferences.pregnancy_status === 'trying') {
        prefs.push(`CRITICAL CONTEXT: User is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Prioritize safe, nutrient-dense meals (iron, folate, protein, calcium). AVOID high-risk ingredients (raw/undercooked meats, fish, eggs, unpasteurized dairy, alcohol). Emphasize well-cooked, balanced, gentle and nourishing meals. Add 'Pregnancy-friendly' or 'Well-cooked & safe option' to the description or mood tags. Do not give medical advice.`);
      }
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
      const quickResponse = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
        prompt: `Generate 6 realistic recipe ideas. ${priorityItems}. Try to minimize extra ingredients needed. ${preferencesContext}${filterString} Provide varied options.`,
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

      if (false) {
        const today = new Date().toISOString().slice(0, 10);
        const lastReset = currentUser?.daily_mood_reset_date;
        const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
        await updateUserMutation.mutateAsync({ daily_mood_count: dailyCount + 1, daily_mood_reset_date: today });
      }

      // Update skeletons with generated basic info
      setGeneratedRecipes(quickRecipes);

      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
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
          const img1 = await base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.`
          });
          setGeneratedRecipes((prev) => {
            const next = prev.map((r, i) =>
              i === index ? { ...r, imageUrls: [img1.url], imageUrl: img1.url, imageLoading: false } : r
            );
            if (next.length > 0 && !next.some(r => r._loading || r.imageLoading)) {
              setCachedRecipes('pantry', cacheKeyParams, next);
            }
            return next;
          });
        } catch {
          setGeneratedRecipes((prev) => {
            const next = prev.map((r, i) =>
              i === index ? { ...r, imageLoading: false } : r
            );
            if (next.length > 0 && !next.some(r => r._loading || r.imageLoading)) {
              setCachedRecipes('pantry', cacheKeyParams, next);
            }
            return next;
          });
        }
      });
    } catch (error) {
      toast.error('Failed to generate recipe from pantry. Please try again.');
      setGeneratedRecipes([]); // Clear skeletons on error
      setIsGenerating(false);
    }
  };

  const handleCombineAndGenerate = async ({ ingredients, recipes }) => {
    setShowCombineDialog(false);
    setSavedRecipeId(null);
    setGlobalSearchQuery('');
    setAdvancedFilters({});

    const cacheKeyParams = {
      combineIngredients: ingredients,
      combineRecipes: recipes,
      filters: advancedFilters
    };

    const cached = getCachedRecipes('combine', cacheKeyParams);
    if (cached) {
      setGeneratedRecipes(cached);
      return;
    }

    const skeletons = Array(3).fill(null).map((_, i) => ({
      id: `temp-${Date.now()}-${i}`,
      name: "Creating fusion recipes...",
      description: "Blending ingredients and styles together...",
      mood: 'Combined Creation',
      _loading: true,
      imageLoading: true
    }));
    
    setGeneratedRecipes(skeletons);
    setIsGenerating(false);
    setIsGeneratingTakeout(false);
    setTakeoutSuggestions(null);

    let preferencesContext = '';

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
      if (userPreferences.pregnancy_status === 'pregnant' || userPreferences.pregnancy_status === 'trying') {
        prefs.push(`CRITICAL CONTEXT: User is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Prioritize safe, nutrient-dense meals (iron, folate, protein, calcium). AVOID high-risk ingredients (raw/undercooked meats, fish, eggs, unpasteurized dairy, alcohol). Emphasize well-cooked, balanced, gentle and nourishing meals. Add 'Pregnancy-friendly' or 'Well-cooked & safe option' to the description or mood tags. Do not give medical advice.`);
      }
      if (prefs.length > 0) preferencesContext = ` [${prefs.join('. ')}]`;
    }

    let combinePrompt = [];
    if (ingredients.length > 0) combinePrompt.push(`Must incorporate these ingredients: ${ingredients.join(', ')}`);
    if (recipes.length > 0) combinePrompt.push(`Draw inspiration from or combine elements of these dishes: ${recipes.join(', ')}`);

    try {
      const quickResponse = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
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
        _loading: true,
        imageLoading: true
      }));

      // Update skeletons with generated basic info
      setGeneratedRecipes(quickRecipes);

      const enrichPromises = quickRecipes.map(async (recipe, index) => {
        const detail = await base44.integrations.Core.InvokeLLM({ model: 'gemini_3_flash',
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
          const img1 = await base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${recipe.name}. ${recipe.description}. Beautiful plating, natural lighting, appetizing, high quality.`
          });
          setGeneratedRecipes((prev) => {
            const next = prev.map((r, i) =>
              i === index ? { ...r, imageUrls: [img1.url], imageUrl: img1.url, imageLoading: false } : r
            );
            if (next.length > 0 && !next.some(r => r._loading || r.imageLoading)) {
              setCachedRecipes('combine', cacheKeyParams, next);
            }
            return next;
          });
        } catch {
          setGeneratedRecipes((prev) => {
            const next = prev.map((r, i) =>
              i === index ? { ...r, imageLoading: false } : r
            );
            if (next.length > 0 && !next.some(r => r._loading || r.imageLoading)) {
              setCachedRecipes('combine', cacheKeyParams, next);
            }
            return next;
          });
        }
      });
    } catch (error) {
      toast.error('Failed to generate combined recipes.');
      setGeneratedRecipes([]); // Clear skeletons on error
      setIsGenerating(false);
    }
  };

  function isRecipeSaved(recipe) {
    if (!recipe) return false;
    return !!savedRecipes.find((r) => r.id === recipe.id || r.name === recipe.name && r.description === recipe.description);
  }

  function handleSaveRecipe(recipeArg) {
    const recipeToSave = recipeArg || peekStack(activeTab)?.recipe;
    if (recipeToSave && !isRecipeSaved(recipeToSave)) {
      // Persist the photo URL under image_url field
      const { id, searchReason, imageUrl, imageUrls, imageLoading, _loading, ...rest } = recipeToSave;
      saveRecipeMutation.mutate({ ...rest, image_url: imageUrl || (imageUrls ? imageUrls[0] : null) });
    }
  }

  function handleRecipeClick(recipe) {
    saveScrollPosition(activeTab, window.scrollY);
    setCurrentRecipe(recipe);
    if (recipe.mood && activeTab === 'saved') {
      setSelectedMoods(recipe.mood.split(', '));
    }
  }

  function handleSavedRecipeClick(recipe) {
    return handleRecipeClick(recipe);
  }



  return (
    <>
      <TutorialOverlay forceShow={forceShowTutorial} onCloseForceShow={() => setForceShowTutorial(false)} />
      <WhatsNewModal isReady={!showIntro && !showSurvey} />

      <AnimatePresence>
        {showIntro && currentUser &&
        <IntroScreen
          userName={(currentUser?.display_name || currentUser?.full_name)?.split(' ')[0]}
          onContinue={() => setShowIntro(false)} />

        }
      </AnimatePresence>

      <PullToRefresh onRefresh={handleRefresh} isGlobal={true}>
      <div className="min-h-screen bg-background/80 relative z-10 transition-colors">
        <ThreeBackground />
        {/* Hero Section */}
        {!showIntro &&
          <div
            className="glass-header relative z-50 border-b-0 pb-3"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}>
            
            <div className="mx-auto px-3 max-w-6xl relative flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute left-3 text-[#6b9b76] hover:bg-[#6b9b76]/10 rounded-full"
                onClick={() => {
                  handleTabChange('home');
                  clearStack('home');
                  setGeneratedRecipes([]);
                  setSelectedMoods([]);
                  setGlobalSearchQuery('');
                  setAdvancedFilters({});
                  setTakeoutSuggestions(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="Go to Home"
              >
                <Home className="w-5 h-5" />
              </Button>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center flex-1">
                <header 
                  className="cursor-pointer inline-block transition-transform hover:scale-105 active:scale-95"
                  onClick={() => {
                    handleTabChange('home');
                    clearStack('home');
                    setGeneratedRecipes([]);
                    setSelectedMoods([]);
                    setGlobalSearchQuery('');
                    setAdvancedFilters({});
                    setTakeoutSuggestions(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title="Go to Home"
                >
                  <div className="font-sans font-bold text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#6DBE7C] mb-1 opacity-80">
                    ◎ AI Decision Engine
                  </div>
                  <h1 className="text-[#3A6B4F] py-2 text-3xl font-extrabold tracking-tight sm:text-5xl" style={{ lineHeight: '1.2' }}>
                    MoodFull
                  </h1>
                </header>
              </motion.div>
            </div>
          </div>
          }

        {/* Main Content */}
        <div
            className="mx-auto px-4 sm:px-6 max-w-6xl space-y-6 sm:space-y-8 relative z-10 pt-4 sm:pt-6"
            style={{
              paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))'
            }}>
            
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
                  className={`space-y-6 sm:space-y-8 w-full ${getStack('home').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
              <>

              {/* Proactive Expiring Items Alert */}
              {(() => {
                      if (!ENABLE_PANTRY_FEATURE) return null;
                      if (hideExpiringAlert) return null;
                      const expiringItems = inventory.filter((item) => {
                        if (!item.expiry_date) return false;
                        return new Date(item.expiry_date) <= new Date(Date.now() + 7 * 86400000);
                      });
                      if (expiringItems.length === 0 || globalSearchQuery || Object.keys(advancedFilters).length > 0) return null;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 pr-12 sm:pr-14 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          
                    <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHideExpiringAlert(true)}
                            className="absolute top-2 right-2 text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors"
                            title="Dismiss notification"
                            aria-label="Dismiss expiring items notification">
                            
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
                            onClick={() => generateFromInventory(expiringItems.map((i) => i.name))}
                            disabled={isGenerating}
                            className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm w-full sm:w-auto whitespace-nowrap">
                            
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Use Them Up
                    </Button>
                  </motion.div>);

                    })()}

              {/* Search & Preferences */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  {/* Global Search */}
                  <div className="relative flex-1">
                    <SmartSearchBar
                      query={globalSearchQuery}
                      setQuery={setGlobalSearchQuery}
                      isSearching={isSmartSearching}
                      intent={searchIntent}
                      onEnter={() => {
                        if (activeTab === 'home' && generatedRecipes.length === 0) generateRecipe();
                      }}
                      placeholder="Search your recipes or generate new ones..."
                    />
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
              {false && !globalSearchQuery && Object.keys(advancedFilters).length === 0 && !hideLimitAlert && (() => {
                      const today = new Date().toISOString().slice(0, 10);
                      const lastReset = currentUser?.daily_mood_reset_date;
                      const dailyCount = lastReset === today ? currentUser?.daily_mood_count || 0 : 0;
                      const remaining = Math.max(0, 3 - dailyCount);
                      if (dailyCount >= 3) {
                        return (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="relative flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm">
                      <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setHideLimitAlert(true)}
                              className="absolute top-2 right-2 text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors w-6 h-6"
                              title="Dismiss notification"
                              aria-label="Dismiss limit notification">
                              
                        <X className="w-3 h-3" />
                      </Button>
                      <span className="text-xl">⏳</span>
                      <div className="pr-6">
                        <p className="font-semibold text-amber-800">Daily limit reached</p>
                        <p className="text-amber-700 text-xs">You've used your 3 free generations for today. Resets in 24 hours — or <Button variant="link" className="p-0 h-auto font-semibold text-amber-800 underline" onClick={() => setShowPaywall(true)}>upgrade for unlimited</Button>.</p>
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
              {!globalSearchQuery &&
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}>

                  <MoodSelector
                        selectedMoods={selectedMoods}
                        onMoodSelect={setSelectedMoods}
                        selectedMealTypes={selectedMealTypes}
                        onMealTypeSelect={setSelectedMealTypes}
                        userName={(currentUser?.display_name || currentUser?.full_name)?.split(' ')[0]}
                        location={userLocation}
                        onLocationChange={setUserLocation}
                        onDetectLocation={handleDetectLocation} />

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
                          aria-label="Find My Food"
                          className="bg-[#3A6B4F] text-white shadow-[0_0_18px_rgba(58,107,79,0.35)] hover:shadow-[0_0_24px_rgba(58,107,79,0.5)] hover:bg-[#6DBE7C] transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2">
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Deciding...</> : <><Sparkles className="w-5 h-5"/> Find My Food</>}
                    </Button>

                    {ENABLE_PANTRY_FEATURE &&
                        <Button
                          onClick={() => generateFromInventory()}
                          disabled={isGenerating}
                          aria-label="Generate Recipes from Pantry"
                          className="bg-white text-[#6b9b76] border-2 border-[#6b9b76] shadow-[0_0_18px_rgba(107,155,118,0.15)] hover:bg-[#f0f9f2] transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2">
                        {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</> : <><Package className="w-4 h-4 sm:w-5 sm:h-5" /> Use Pantry</>}
                      </Button>
                        }

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
                          className="bg-white text-gray-800 border-2 border-gray-200 shadow-[0_0_18px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-300 text-xs sm:text-base px-2 sm:px-8 py-5 sm:py-6 min-h-[44px] rounded-xl sm:rounded-[20px] font-bold tracking-tight w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2">
                          
                      {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wait...</> : <><Camera className="w-4 h-4 sm:w-5 sm:h-5" /> Scan Fridge</>}
                    </Button>
                  </motion.div>
                      }
              </AnimatePresence>

              {/* Removed original Takeout Option button here as we moved it to the results section */}

              {/* Recipe Grid */}
              <AnimatePresence mode="wait">
                {generatedRecipes.length > 0 && !currentRecipe &&
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}>

                    <div className="flex items-center gap-4 mb-6 mt-8">
                      <div className="h-px bg-[#e0ede4] flex-1"></div>
                      <span className="bg-[#DFF5E6] text-[#3A6B4F] font-bold px-4 py-2 rounded-full text-sm">
                        🥡 Takeout First
                      </span>
                      <div className="h-px bg-[#e0ede4] flex-1"></div>
                    </div>
                    
                    <div className="mb-10 w-full">
                      {(isGeneratingTakeout || takeoutSuggestions) && (
                        <InlineTakeoutResults suggestions={takeoutSuggestions} isGenerating={isGeneratingTakeout} userLocationStr={userLocation} />
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-6 mt-12">
                      <div className="h-px bg-[#e0ede4] flex-1"></div>
                      <span className="bg-[#FFE9D6] text-orange-800 font-bold px-4 py-2 rounded-full text-sm">
                        🍳 Or Cook This
                      </span>
                      <div className="h-px bg-[#e0ede4] flex-1"></div>
                    </div>

                    <RecipeGrid
                          recipes={filteredGeneratedRecipes}
                          isGenerating={isGenerating || generatedRecipes.some(r => r._loading)}
                          onRecipeClick={handleRecipeClick}
                          onStartOver={() => {
                            setGeneratedRecipes([]);
                            setSelectedMoods([]);
                            setGlobalSearchQuery('');
                            setAdvancedFilters({});
                            setTakeoutSuggestions(null);
                          }}
                          onRefresh={() => {
                            if (generatedRecipes[0]?.mood === 'From Pantry') {
                              generateFromInventory(null, true);
                            } else if (generatedRecipes[0]?.mood === 'Combined Creation') {
                              setShowCombineDialog(true);
                            } else {
                              generateRecipe(true);
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
                      onRecipeClick={handleRecipeClick} />

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
                  className={`space-y-6 w-full ${getStack('saved').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
          <div className="space-y-6">

              <div className="text-center space-y-2">
                <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Your Saved Recipes</h2>
                <p className="text-gray-600">Browse and manage your collection</p>
              </div>

              {false ?
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
                      <SmartSearchBar
                        query={globalSearchQuery}
                        setQuery={setGlobalSearchQuery}
                        isSearching={isSmartSearching}
                        intent={searchIntent}
                        placeholder="Search your saved recipes..."
                      />
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
                        currentUser={currentUser}
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
                  className={`w-full ${getStack('planner').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
              <MealPlanner
                    onOpenShoppingList={() => setShowShoppingList(true)}
                    generatedRecipes={generatedRecipes}
                    onRequirePremium={() => setShowPaywall(true)} />
                  
            </motion.div>
            {renderTabStack('planner')}
          </div>

          {/* Inventory Tab */}
          <div style={{ display: !showSurvey && activeTab === 'inventory' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
                  animate={{ x: getStack('inventory').length > 0 ? '-30%' : 0, opacity: getStack('inventory').length > 0 ? 0.5 : 1 }}
                  transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
                  className={`w-full ${getStack('inventory').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
              <InventoryManagement
                    onGenerateFromExpiring={(items) => {
                      handleTabChange('home');
                      generateFromInventory(items);
                    }} />
                  
            </motion.div>
            {renderTabStack('inventory')}
          </div>

          {/* Analytics Tab */}
          <div style={{ display: !showSurvey && activeTab === 'analytics' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
                  animate={{ x: getStack('analytics').length > 0 ? '-30%' : 0, opacity: getStack('analytics').length > 0 ? 0.5 : 1 }}
                  transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
                  className={`space-y-6 w-full ${getStack('analytics').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
              {false ?
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
                </div> :

                  <AnalyticsDashboard />
                  }
            </motion.div>
            {renderTabStack('analytics')}
          </div>

          {/* Settings Tab */}
          <div style={{ display: !showSurvey && activeTab === 'settings' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
                  animate={{ x: getStack('settings').length > 0 ? '-30%' : 0, opacity: getStack('settings').length > 0 ? 0.5 : 1 }}
                  transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
                  className={`w-full ${getStack('settings').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
              <AccountInfo
                    user={currentUser}
                    onUpdatePreferences={() => setShowSurvey(true)}
                    recipeCount={savedRecipes.length}
                    onReplayTutorial={() => setForceShowTutorial(true)} />
                  
            </motion.div>
            {renderTabStack('settings')}
          </div>

          {/* Shopping Tab */}
          <div style={{ display: !showSurvey && activeTab === 'shopping' ? 'block' : 'none' }} className="relative w-full">
            <motion.div
                  animate={{ x: getStack('shopping').length > 0 ? '-30%' : 0, opacity: getStack('shopping').length > 0 ? 0.5 : 1 }}
                  transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.4 }}
                  className={`w-full ${getStack('shopping').length > 0 ? 'pointer-events-none' : 'relative'}`}>
                  
              <ShoppingList
                  mealPlans={mealPlans}
                  recipes={savedRecipes}
                  isInline={true}
                  currentUser={currentUser} />
                  
            </motion.div>
            {renderTabStack('shopping')}
          </div>
          </Suspense>
        </div>
      </div>

      {/* Bottom Navigation */}
      {!showIntro && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} isVisible={!showShoppingList} enablePantry={ENABLE_PANTRY_FEATURE} />}

      <SwipeDownNav
        isOpen={isSwipeNavOpen}
        onClose={() => setIsSwipeNavOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        enablePantry={ENABLE_PANTRY_FEATURE}
      />

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

      <Suspense fallback={null}>
        {showTakeoutPanel && (
          <SmartTakeoutPanel
            isOpen={showTakeoutPanel}
            onClose={() => setShowTakeoutPanel(false)}
            contextMoods={selectedMoods}
            userPreferences={userPreferences}
          />
        )}
      </Suspense>



        

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