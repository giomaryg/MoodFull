import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, BookmarkPlus, Check, CalendarPlus, Lightbulb, RefreshCw, Wine, Sparkles, Star, Minus, Plus, Pencil, Leaf, ChevronLeft, ChevronRight, FolderPlus, Loader2, Share2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AddMealDialog from '../mealplan/AddMealDialog';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
// SimilarRecipes imported below to avoid circular dependency issues if any, 
// but standard import works fine in most setups. 
import SimilarRecipes from './SimilarRecipes';
import RecipeEditDialog from './RecipeEditDialog';
import NutritionPanel from './NutritionPanel';
import RecipeReview from './RecipeReview';
import RecipeComments from './RecipeComments';
import InteractiveCookingMode from './InteractiveCookingMode';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import RecipeTimer from './RecipeTimer';
import SaveToCollectionDialog from './SaveToCollectionDialog';
import { Play, Flame, Zap, Wand2, Twitter, Facebook, Link as LinkIcon, Send, Coffee, CupSoda, Beer, Droplets, GlassWater, Utensils } from 'lucide-react';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import SmartTakeoutPanel from '../takeout/SmartTakeoutPanel';
import { toast } from 'sonner';
import ApplianceSelector from './ApplianceSelector';
import RecipeAssistantSheet from './RecipeAssistantSheet';
import InteractivePairingSheet from './InteractivePairingSheet';

function RecipeDisplay({ recipe, onSave, isSaved, onSimilarRecipeClick, onUpdate, onBack }) {
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTakeoutPanel, setShowTakeoutPanel] = useState(false);
  const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [adaptedRecipe, setAdaptedRecipe] = useState(null);
  const [selectedPairing, setSelectedPairing] = useState(null);
  const queryClient = useQueryClient();

  const displayRecipe = {
    ...recipe,
    ...adaptedRecipe
  };
  const descriptionRef = useRef(null);
  const images = recipe.imageUrls || (recipe.imageUrl || recipe.image_url ? [recipe.imageUrl || recipe.image_url] : []);

  // Scroll behavior now handled by fixed container rendering

  // Reset servings when recipe changes
  React.useEffect(() => {
    if (recipe?.servings) {
      setCurrentServings(recipe.servings);
    }
    // Reset substitution states
    setActiveSubstitutions({});
    setAiSubstitutions({});
    setLoadingSubs({});
  }, [recipe?.id, recipe?.servings]);

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const updateRatingMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: ({ id, rating }) => base44.entities.Recipe.update(id, { rating }),
    action: 'update'
  });

  const updateReviewMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: ({ id, review }) => base44.entities.Recipe.update(id, { review }),
    action: 'update'
  });

  const handleReviewSave = (review) => {
    if (recipe.id && !String(recipe.id).startsWith('temp-')) {
      updateReviewMutation.mutate({ id: recipe.id, data: { review } });
    }
    if (onUpdate) onUpdate({ review });
  };

  const updateRecipeMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, data),
    action: 'update'
  });

  const handleEditSave = (formData) => {
    if (recipe.id && !String(recipe.id).startsWith('temp-')) {
      updateRecipeMutation.mutate({ id: recipe.id, data: formData });
    }
    if (onUpdate) onUpdate(formData);
    setShowEditDialog(false);
  };

  const handleRate = (rating) => {
    if (recipe.id && !String(recipe.id).startsWith('temp-')) {
      updateRatingMutation.mutate({ id: recipe.id, data: { rating } });
    }
    if (onUpdate) onUpdate({ rating });
  };

  const [activeSubstitutions, setActiveSubstitutions] = useState({});
  const [aiSubstitutions, setAiSubstitutions] = useState({});
  const [loadingSubs, setLoadingSubs] = useState({});
  const autoFetchedSubs = useRef(new Set());

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        return isAuth ? await base44.auth.me() : null;
      } catch {
        return null;
      }
    }
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const handleAISubstitution = async (index, ingredient) => {
    // If we already have a generated AI substitution for this index, just toggle it on
    if (aiSubstitutions[index]) {
      setActiveSubstitutions(prev => ({ ...prev, [index]: true }));
      return;
    }

    setLoadingSubs(prev => ({ ...prev, [index]: true }));
    try {
      const inventoryContext = inventory.length > 0 
        ? `\nPrioritize using these ingredients from their pantry if possible: ${inventory.map(i => i.name).join(', ')}` 
        : '';
        
      const dietaryContext = currentUser?.diet_preferences || currentUser?.allergies 
        ? `\nDietary restrictions: ${currentUser.diet_preferences || 'None'}. Allergies: ${currentUser.allergies || 'None'}` 
        : '';

      const response = await base44.functions.invoke('suggestSubstitution', {
        ingredient,
        recipeName: recipe.name,
        dietaryContext,
        inventoryContext
      });

      setAiSubstitutions(prev => ({
        ...prev,
        [index]: { ingredient, substitute: response.data.substitute }
      }));
      setActiveSubstitutions(prev => ({ ...prev, [index]: true }));
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSubs(prev => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    if (inventory.length > 0 && recipe?.ingredients) {
      recipe.ingredients.forEach((ingredient, index) => {
        const fetchKey = `${recipe.id}-${index}`;
        if (autoFetchedSubs.current.has(fetchKey)) return;

        const words = ingredient.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
        const invMatch = inventory.find(i => {
           const iName = i.name.toLowerCase();
           return words.some(w => iName.includes(w)) || iName.includes(words[words.length-1]);
        });
        const isMissingOrLow = inventory.length > 0 && (!invMatch || invMatch.quantity <= (invMatch.min_stock || 0));
        
        if (isMissingOrLow) {
          autoFetchedSubs.current.add(fetchKey);
          const hasPredefinedSub = recipe?.substitutions?.find(s => ingredient.toLowerCase().includes(s.ingredient.toLowerCase()));
          if (!hasPredefinedSub) {
            handleAISubstitution(index, ingredient);
          } else {
            setActiveSubstitutions(prev => ({ ...prev, [index]: true }));
          }
        }
      });
    }
  }, [inventory, recipe?.ingredients, recipe?.id]);

  const toggleSubstitution = (index, ingredient) => {
    const hasPredefinedSub = recipe?.substitutions?.find(s => ingredient.toLowerCase().includes(s.ingredient.toLowerCase()));
    
    if (activeSubstitutions[index]) {
      // Revert back to original
      setActiveSubstitutions(prev => ({ ...prev, [index]: false }));
    } else if (hasPredefinedSub) {
      // Use predefined sub
      setActiveSubstitutions(prev => ({ ...prev, [index]: true }));
    } else {
      // Generate AI sub
      handleAISubstitution(index, ingredient);
    }
  };

  const scaledIngredients = useMemo(() => {
    if (!recipe?.ingredients) return [];
    const factor = currentServings / (recipe.servings || 1);
    if (factor === 1) return recipe.ingredients;

    return recipe.ingredients.map(ing => {
      // Matches: "1 cup", "1/2 cup", "1.5 cups", "1-2 cups"
      const match = ing.match(/^((?:\d+(?:[\/.]\d+)?)(?:\s*-\s*\d+(?:[\/.]\d+)?)?)(.*)$/);
      
      if (!match) return ing;
      
      const [_, quantityPart, rest] = match;
      
      const scaleValue = (valStr) => {
        if (valStr.includes('/')) {
          const [num, den] = valStr.split('/').map(Number);
          return (num / den) * factor;
        }
        return parseFloat(valStr) * factor;
      };

      const formatValue = (val) => {
        // Round to 2 decimal places
        const rounded = Math.round(val * 100) / 100;
        
        // Convert common decimals to fractions
        const fractionMap = {
          0.25: '1/4', 0.33: '1/3', 0.5: '1/2', 0.66: '2/3', 0.75: '3/4'
        };
        
        // Check for exact integer
        if (Math.abs(rounded % 1) < 0.01) return Math.round(rounded).toString();

        // Check for close matches to fractions
        for (const [dec, frac] of Object.entries(fractionMap)) {
          if (Math.abs((rounded % 1) - parseFloat(dec)) < 0.05) {
            const whole = Math.floor(rounded);
            return whole > 0 ? `${whole} ${frac}` : frac;
          }
        }
        
        return rounded.toString();
      };

      let newQuantity;
      if (quantityPart.includes('-')) {
        newQuantity = quantityPart.split('-').map(p => formatValue(scaleValue(p.trim()))).join(' - ');
      } else {
        newQuantity = formatValue(scaleValue(quantityPart));
      }

      return `${newQuantity}${rest}`;
    });
  }, [recipe?.ingredients, recipe?.servings, currentServings]);

  // Find similar recipes based on ingredients and cuisine
  const similarRecipes = useMemo(() => {
    if (!recipe || !recipes.length) return [];
    
    return recipes
      .filter(r => r.id !== recipe.id)
      .map(r => {
        let score = 0;
        
        // Check for matching cuisine type
        if (recipe.cuisine_type && r.cuisine_type === recipe.cuisine_type) {
          score += 3;
        }
        
        // Check for matching main ingredients
        if (recipe.main_ingredients && r.main_ingredients) {
          const matchingIngredients = recipe.main_ingredients.filter(ing =>
            r.main_ingredients.some(rIng => rIng.toLowerCase().includes(ing.toLowerCase()))
          );
          score += matchingIngredients.length * 2;
        }
        
        // Check for matching difficulty
        if (recipe.difficulty === r.difficulty) {
          score += 1;
        }
        
        // Check for matching mood
        if (recipe.mood && r.mood === recipe.mood) {
          score += 1;
        }
        
        return { recipe: r, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.recipe);
  }, [recipe, recipes]);

  const [customVariation, setCustomVariation] = useState('');

  const generateCustomVariation = async (typeOrPrompt) => {
    setIsGeneratingVariation(true);
    try {
      const response = await base44.functions.invoke('generateRecipeVariation', {
        recipe,
        typeOrPrompt
      });

      if (onSimilarRecipeClick) {
        onSimilarRecipeClick({
          ...recipe,
          id: undefined,
          ...response.data,
          mood: `Variation: ${typeOrPrompt}`,
          image_url: recipe.imageUrl || recipe.imageUrls?.[0]
        });
        toast.success(`Generated variation!`);
      }
    } catch (e) {
      toast.error('Failed to generate variation');
    }
    setIsGeneratingVariation(false);
  };

  const [isRegeneratingSteps, setIsRegeneratingSteps] = useState(false);
  
  const handleShare = async () => {
    if (!recipe.id || String(recipe.id).startsWith('temp-')) {
      toast.error('Please save the recipe first to share it!');
      return;
    }
    try {
      if (!recipe.is_public) {
        updateRecipeMutation.mutate({ id: recipe.id, data: { is_public: true } });
        if (onUpdate) onUpdate({ is_public: true });
      }
      
      const shareUrl = `${window.location.origin}/shared-recipe/${recipe.id}`;
      if (navigator.share) {
        navigator.share({
          title: recipe.name,
          text: `Check out this recipe: ${recipe.name}`,
          url: shareUrl
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (e) {
      toast.error('Failed to share recipe');
    }
  };

  const authorRecipesCount = useMemo(() => {
    if (!recipe.created_by) return 0;
    return recipes.filter(r => r.created_by === recipe.created_by).length;
  }, [recipes, recipe.created_by]);

  const handleRegenerateSteps = async (mode) => {
    setIsRegeneratingSteps(true);
    try {
      const response = await base44.functions.invoke('regenerateInstructions', {
        recipeName: recipe.name,
        instructions: recipe.instructions,
        mode
      });
      
      if (response.data.instructions) {
         if (recipe.id && isSaved) {
           updateRecipeMutation.mutate({ id: recipe.id, data: { instructions: response.data.instructions } });
         }
         if (onUpdate) {
           onUpdate({ instructions: response.data.instructions });
         }
         toast.success("Instructions updated!");
      }
    } catch (e) {
      toast.error('Failed to regenerate instructions');
    }
    setIsRegeneratingSteps(false);
  };

  if (!recipe) return null;

  const parseMacro = (str) => {
    if (!str) return 0;
    const match = String(str).match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white shadow-2xl relative min-h-screen"
    >
      {/* Hero Image Section */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] min-h-[350px] max-h-[600px] overflow-hidden">
        {images.length > 0 ? (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={images[currentImageIndex]} 
            alt={recipe.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ChefHat className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300" />
          </div>
        )}
        
        {/* Soft elegant gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none" />
        
        {/* Back Button */}
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            aria-label="Go back" 
            className="absolute top-6 left-6 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/20 rounded-full transition-all min-h-[44px] min-w-[44px] z-20 group"
          >
            <ChevronLeft className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" />
          </Button>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-10 left-0 right-0 px-6 sm:px-10 z-10 flex justify-between items-end">
          <div className="flex-1 pr-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight drop-shadow-lg"
            >
              {recipe.name}
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowEditDialog(true)} 
              className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-full min-h-[48px] min-w-[48px] shadow-lg transition-all"
            >
              <Pencil className="w-5 h-5 text-white" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content Overlay Card */}
      <div className="bg-white rounded-t-[2.5rem] px-6 sm:px-10 pt-8 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] relative z-20 -mt-8 sm:-mt-12 min-h-screen">
        
        {/* Quick Nutrition Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-around sm:justify-start gap-4 sm:gap-12 mb-10 pb-8 border-b border-gray-100"
        >
          <div className="text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{recipe.nutrition?.calories || 240}</span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">kcal</span>
            </div>
            <div className="h-1 w-8 bg-[#6b9b76] rounded-full mx-auto sm:mx-0 mt-1"></div>
          </div>
          
          <div className="text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{parseMacro(recipe.nutrition?.protein) || 19}</span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">g pro</span>
            </div>
            <div className="h-1 w-8 bg-[#c17a7a] rounded-full mx-auto sm:mx-0 mt-1"></div>
          </div>
          
          <div className="text-center sm:text-left">
            <div className="flex items-baseline justify-center sm:justify-start gap-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">{parseMacro(recipe.nutrition?.carbs) || 5}</span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">g carb</span>
            </div>
            <div className="h-1 w-8 bg-[#f2b769] rounded-full mx-auto sm:mx-0 mt-1"></div>
          </div>
        </motion.div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-end">
          <Button
            onClick={() => setShowTakeoutPanel(true)}
            variant="ghost"
            className="rounded-full px-4 sm:px-6 text-gray-500 hover:text-[#6b9b76] hover:bg-[#f0f9f2] border border-transparent hover:border-[#c5d9c9] transition-colors whitespace-nowrap"
          >
            🥡 Order smarter instead
          </Button>
          <Button
            onClick={() => {
              setShowCookingMode(true);
              base44.analytics.track({
                eventName: "recipe_cooking_started",
                properties: { recipe_id: recipe.id, recipe_name: recipe.name }
              });
            }}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
          >
            <Play className="w-4 h-4 mr-2 fill-white" />
            Cook
          </Button>
          <Button
            onClick={() => setShowSaveDialog(true)}
            variant={isSaved ? "default" : "outline"}
            className={`rounded-full px-6 ${isSaved ? 'bg-[#c17a7a] hover:bg-[#b06a6a]' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            {isSaved ? <FolderPlus className="w-4 h-4 mr-2" /> : <BookmarkPlus className="w-4 h-4 mr-2" />}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="rounded-full px-6 border-gray-200 hover:bg-gray-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => setShowAddMeal(true)}
            variant="outline"
            className="rounded-full px-6 border-gray-200 hover:bg-gray-50"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Plan
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isGeneratingVariation} className="rounded-full px-6 border-gray-200 hover:bg-gray-50">
                {isGeneratingVariation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Complexity
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => generateCustomVariation('Make the recipe simpler, easier, and use fewer ingredients')}>
                Make it Simpler
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateCustomVariation('Make the recipe more complex, gourmet, and use advanced techniques')}>
                Make it Fancier
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {displayRecipe.prep_time && displayRecipe.prep_time !== '-' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-[#f5ece4] transition-colors" title="Click to start prep timer">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                  {displayRecipe.prep_time} prep
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent">
                <RecipeTimer timeString={displayRecipe.prep_time} label="Prep Timer" />
              </PopoverContent>
            </Popover>
          ) : (
            <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
              - prep
            </Badge>
          )}
          
          {displayRecipe.cook_time && displayRecipe.cook_time !== '-' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-[#f5ece4] transition-colors" title="Click to start cook timer">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                  {displayRecipe.cook_time} cook
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent">
                <RecipeTimer timeString={displayRecipe.cook_time} label="Cook Timer" />
              </PopoverContent>
            </Popover>
          ) : (
            <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
              - cook
            </Badge>
          )}
          <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl flex items-center gap-2 min-h-[44px]">
            <Users className="w-4 h-4 mr-1 text-gray-400" />
            <Button variant="ghost" size="icon" aria-label="Decrease servings" onClick={() => setCurrentServings(Math.max(1, currentServings - 1))} className="hover:text-gray-900 p-0 min-w-[44px] min-h-[44px]"><Minus className="w-4 h-4" /></Button>
            <span className="font-bold">{currentServings}</span>
            <Button variant="ghost" size="icon" aria-label="Increase servings" onClick={() => setCurrentServings(currentServings + 1)} className="hover:text-gray-900 p-0 min-w-[44px] min-h-[44px]"><Plus className="w-4 h-4" /></Button>
          </Badge>
          <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl capitalize">
            <ChefHat className="w-4 h-4 mr-1.5 text-gray-400" />
            {recipe.difficulty || '-'}
          </Badge>
        </div>

        <p ref={descriptionRef} className="text-gray-600 text-base leading-relaxed mb-8">
          {recipe.description}
        </p>

        {currentUser?.pregnancy_status && ['pregnant', 'trying'].includes(currentUser.pregnancy_status) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-semibold text-amber-900 text-sm">Pregnancy & Health Notice</h4>
              <p className="text-amber-800 text-sm mt-1">MoodFull is not a medical professional. Recommendations are AI-generated and may not always be accurate. If you are pregnant or trying to conceive, please consult a qualified healthcare professional for personalized advice and ensure all ingredients meet your safety guidelines.</p>
            </div>
          </motion.div>
        )}

        <ApplianceSelector 
          recipe={recipe} 
          onAdaptationStart={() => {}} 
          onAdaptationComplete={setAdaptedRecipe} 
        />

        {adaptedRecipe && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-[#f0f9f2] rounded-xl border border-[#c5d9c9]">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#6b9b76] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Adapted for {adaptedRecipe.appliance}</h4>
                <p className="text-gray-700 text-sm mt-1">{adaptedRecipe.appliance_notes}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Nutrition, Ingredients, Pairings */}
          <div className="lg:col-span-5 space-y-8">
          {/* Enhanced Nutrition Panel */}
          <NutritionPanel
            nutrition={recipe.nutrition}
            vitamins_minerals={recipe.vitamins_minerals}
            health_benefits={recipe.health_benefits}
            servings={recipe.servings}
            currentServings={currentServings}
          />

          {/* Public Community Comments */}
          {false && (
            <RecipeComments 
              recipe={recipe}
              currentUser={currentUser}
            />
          )}

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
                <p className="text-sm text-gray-500">{scaledIngredients.length} healthy ingredients</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {scaledIngredients.map((ingredient, index) => {
                const hasSub = recipe?.substitutions?.find(s => ingredient.toLowerCase().includes(s.ingredient.toLowerCase()));
                const isSubbed = activeSubstitutions[index];
                
                const words = ingredient.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
                const invMatch = inventory.find(i => {
                   const iName = i.name.toLowerCase();
                   return words.some(w => iName.includes(w)) || iName.includes(words[words.length-1]);
                });
                const isMissingOrLow = inventory.length > 0 && (!invMatch || invMatch.quantity <= (invMatch.min_stock || 0));
                
                // Try to extract amount and name for better display
                const match = ingredient.match(/^((?:\d+(?:[\/.]\d+)?)(?:\s*-\s*\d+(?:[\/.]\d+)?)?(?:\s*[a-zA-Z]+)?)\s+(.*)$/);
                const amount = match ? match[1] : '';
                const name = match ? match[2] : ingredient;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-[#fdf8f4] rounded-2xl group"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <Leaf className="w-6 h-6 text-[#6b9b76]" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-gray-900 text-sm sm:text-base ${isSubbed ? 'line-through opacity-50' : ''}`}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </h4>
                      <p className={`text-xs sm:text-sm text-gray-500 ${isSubbed ? 'line-through opacity-50' : ''}`}>
                        {amount || ingredient}
                        {isMissingOrLow && !isSubbed && <span className="inline-block ml-2 text-[10px] uppercase tracking-wider text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Low/Missing</span>}
                      </p>
                      
                      <AnimatePresence>
                        {isSubbed && (hasSub || aiSubstitutions[index]) && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-1 text-[#c17a7a] font-medium flex items-center gap-2 text-xs"
                          >
                            <span className="flex-1">
                              Use: {hasSub ? hasSub.substitute : aiSubstitutions[index].substitute}
                            </span>
                            {!hasSub && <Sparkles className="w-3 h-3 opacity-50 shrink-0" title="AI Suggested" />}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSubstitution(index, ingredient)}
                      disabled={loadingSubs[index]}
                      aria-label={`Substitute ${name}`}
                      className={`rounded-xl transition-colors min-h-[44px] min-w-[44px] ${
                        isSubbed 
                          ? 'bg-[#c17a7a] text-white hover:bg-[#b06a6a] hover:text-white' 
                          : hasSub || aiSubstitutions[index]
                            ? 'bg-white text-[#c17a7a] hover:bg-gray-50'
                            : isMissingOrLow 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                              : 'bg-white text-gray-400 hover:text-[#c17a7a] opacity-0 group-hover:opacity-100'
                      }`}
                      title={isSubbed ? "Revert ingredient" : hasSub ? "Use suggested substitute" : "Ask AI for pantry-based substitute"}
                    >
                      {loadingSubs[index] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        isSubbed || hasSub ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                );
              })}
              {currentServings !== recipe.servings && (
                <p className="text-xs text-gray-500 mt-2 text-right italic">
                  * Ingredients adjusted for {currentServings} servings
                </p>
              )}
            </div>
          </div>

          </div>
          
          {/* Right Column: Instructions, Tips, Substitutions, Reviews */}
          <div className="lg:col-span-7 space-y-8 lg:mt-0">
          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
              <div className="flex gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => handleRegenerateSteps('simplify')} 
                   disabled={isRegeneratingSteps}
                   aria-label="Simplify instructions"
                   className="h-11 min-h-[44px] text-xs border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                   title="Make instructions simpler and easier to follow"
                 >
                   {isRegeneratingSteps ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <RefreshCw className="w-3 h-3 mr-1.5" />} Simplify
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => handleRegenerateSteps('detail')} 
                   disabled={isRegeneratingSteps}
                   aria-label="Detail instructions"
                   className="h-11 min-h-[44px] text-xs border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                   title="Make instructions extremely detailed with visual cues"
                 >
                   {isRegeneratingSteps ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />} Detail
                 </Button>
              </div>
            </div>
            <div className="space-y-4">
              {displayRecipe.instructions?.map((instruction, index) =>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-4 items-start group p-4 bg-[#fdf8f4] rounded-2xl transition-all duration-200">

                  <div className="bg-white text-gray-900 font-bold rounded-xl shrink-0 w-10 h-10 flex items-center justify-center shadow-sm text-lg">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-700 leading-relaxed pt-1 text-sm sm:text-base">
                    {instruction}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Cooking Tips */}
          {recipe.cooking_tips && recipe.cooking_tips.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-[#6b9b76] rounded-full" />
                Cooking Tips & Tricks
              </h3>
              <div className="bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner border border-[#c5d9c9]">
                <ul className="space-y-2.5 sm:space-y-3">
                  {recipe.cooking_tips.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2 sm:gap-3 text-gray-800 text-sm sm:text-base"
                    >
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-[#6b9b76] shrink-0 mt-0.5 sm:mt-1" />
                      <span className="leading-relaxed">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Ingredient Substitutions */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-[#c17a7a] rounded-full" />
                Ingredient Substitutions
              </h3>
              <div className="bg-gradient-to-br from-[#faf6f2] to-[#f5e6dc] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner border border-[#e8d5c4]">
                <div className="grid gap-3 sm:gap-4">
                  {recipe.substitutions.map((sub, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-[#e8d5c4] shadow-sm"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">{sub.ingredient}</span>
                      </div>
                      <RefreshCw className="w-4 h-4 text-[#c17a7a] shrink-0" />
                      <div className="flex-1 text-right">
                        <span className="text-gray-700 text-sm sm:text-base">{sub.substitute}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wine & Beverage Pairings */}
          {recipe.pairings && recipe.pairings.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-purple-500 rounded-full" />
                  Perfect Pairings
                </h3>
                <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-md hidden sm:inline-block">Click any pairing to add to meal</span>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner border border-purple-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {recipe.pairings.map((pairing, index) => {
                    const lower = pairing.toLowerCase();
                    let Icon = Wine;
                    let iconColor = "text-purple-600";
                    let category = "drink";
                    
                    // Beverages
                    if (lower.includes('coffee') || lower.includes('espresso') || lower.includes('latte') || lower.includes('cappuccino')) { Icon = Coffee; iconColor = "text-amber-800"; }
                    else if (lower.includes('tea') || lower.includes('matcha') || lower.includes('chai')) { Icon = Coffee; iconColor = "text-green-600"; }
                    else if (lower.includes('smoothie') || lower.includes('juice') || lower.includes('lemonade')) { Icon = CupSoda; iconColor = "text-orange-500"; }
                    else if (lower.includes('beer') || lower.includes('ale') || lower.includes('stout') || lower.includes('ipa') || lower.includes('lager')) { Icon = Beer; iconColor = "text-yellow-600"; }
                    else if (lower.includes('water') || lower.includes('sparkling') || lower.includes('seltzer')) { Icon = GlassWater; iconColor = "text-blue-400"; }
                    else if (lower.includes('milk') || lower.includes('shake')) { Icon = GlassWater; iconColor = "text-blue-200"; }
                    else if (lower.includes('wine') || lower.includes('cabernet') || lower.includes('chardonnay') || lower.includes('merlot') || lower.includes('pinot') || lower.includes('sauvignon') || lower.includes('syrah') || lower.includes('zinfandel') || lower.includes('bordeaux') || lower.includes('blend') || lower.includes('champagne') || lower.includes('prosecco') || lower.includes('rose') || lower.includes('rosé')) { Icon = Wine; iconColor = "text-purple-600"; }
                    else if (lower.includes('cocktail') || lower.includes('margarita') || lower.includes('martini') || lower.includes('mojito') || lower.includes('vodka') || lower.includes('gin') || lower.includes('rum') || lower.includes('tequila') || lower.includes('whiskey') || lower.includes('bourbon') || lower.includes('scotch')) { Icon = Wine; iconColor = "text-pink-500"; }
                    // Sauces / Dips
                    else if (lower.includes('sauce') || lower.includes('dip') || lower.includes('dressing') || lower.includes('salsa') || lower.includes('guacamole') || lower.includes('hummus') || lower.includes('gravy') || lower.includes('syrup') || lower.includes('glaze') || lower.includes('ketchup') || lower.includes('mustard') || lower.includes('mayo') || lower.includes('aioli') || lower.includes('pesto') || lower.includes('chutney') || lower.includes('marinade') || lower.includes('vinaigrette') || lower.includes('oil') || lower.includes('vinegar')) { Icon = Droplets; iconColor = "text-orange-600"; category = "sauce"; }
                    // Salads / Veggies
                    else if (lower.includes('salad') || lower.includes('greens') || lower.includes('vegetable') || lower.includes('broccoli') || lower.includes('asparagus') || lower.includes('spinach') || lower.includes('kale') || lower.includes('carrot') || lower.includes('potato') || lower.includes('tomato') || lower.includes('onion') || lower.includes('garlic') || lower.includes('pepper') || lower.includes('mushroom') || lower.includes('corn') || lower.includes('pea') || lower.includes('bean') || lower.includes('lentil') || lower.includes('chickpea')) { Icon = Leaf; iconColor = "text-green-500"; category = "side"; }
                    // Default to Utensils for other things that aren't beverages
                    else if (!lower.includes('drink') && !lower.includes('beverage') && !lower.includes('sip') && !lower.includes('glass') && !lower.includes('cup') && !lower.includes('mug') && !lower.includes('bottle') && !lower.includes('can') && !lower.includes('pint') && !lower.includes('shot') && !lower.includes('pour') && !lower.includes('splash') && !lower.includes('drop') && !lower.includes('liquid') && !lower.includes('fluid')) {
                      Icon = Utensils; iconColor = "text-amber-600"; category = "side";
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPairing({ name: pairing, category, iconColor, Icon })}
                        className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 shadow-sm cursor-pointer hover:shadow-md hover:border-purple-300 transition-all group"
                      >
                        <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors`}>
                          <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
                        </div>
                        <span className="text-gray-800 text-sm sm:text-base leading-relaxed flex-1">{pairing}</span>
                        <ChevronRight className="w-4 h-4 text-purple-300 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* User Rating & Review */}
          <RecipeReview
            recipe={recipe}
            isSaved={isSaved}
            onRate={handleRate}
            onReviewSave={handleReviewSave}
          />

          </div>
        </div>

        <div className="w-full mt-12 mb-6">
          {/* Similar Recipes Section */}
          {similarRecipes.length > 0 && (
            <div className="bg-gradient-to-br from-[#f0f9f2] to-white rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-[#c5d9c9]">
              <SimilarRecipes
                recipes={similarRecipes}
                onRecipeClick={onSimilarRecipeClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Meal Dialog */}
      {showAddMeal && (
        <AddMealDialog
          date={new Date()}
          mealType="dinner"
          enableDateSelection={true}
          recipes={isSaved ? recipes : [...recipes, recipe]}
          onClose={() => setShowAddMeal(false)}
        />
      )}

      {/* Edit Recipe Dialog */}
      {showEditDialog && (
        <RecipeEditDialog
          recipe={recipe}
          onSave={handleEditSave}
          onClose={() => setShowEditDialog(false)}
        />
      )}

      {/* Save to Collection Dialog */}
      {showSaveDialog && (
        <SaveToCollectionDialog
          recipe={recipe}
          onClose={() => setShowSaveDialog(false)}
          onSaveComplete={(updatedRecipe) => {
            if (onUpdate) onUpdate(updatedRecipe);
          }}
        />
      )}

      {/* Interactive Cooking Mode */}
      {showCookingMode && (
        <InteractiveCookingMode
          recipe={displayRecipe}
          onClose={() => setShowCookingMode(false)}
        />
      )}

      {/* Recipe Assistant Sheet */}
      <RecipeAssistantSheet recipe={displayRecipe} />

      {/* Interactive Pairing Sheet */}
      <InteractivePairingSheet
        isOpen={!!selectedPairing}
        onClose={() => setSelectedPairing(null)}
        pairingName={selectedPairing?.name}
        mainRecipe={displayRecipe}
        category={selectedPairing?.category}
        iconColor={selectedPairing?.iconColor}
        Icon={selectedPairing?.Icon}
      />

      {/* Smart Takeout Panel */}
      <SmartTakeoutPanel
        isOpen={showTakeoutPanel}
        onClose={() => setShowTakeoutPanel(false)}
        contextRecipe={displayRecipe}
        userPreferences={currentUser || {}}
      />
    </motion.div>
  );
}

export default React.memo(RecipeDisplay);