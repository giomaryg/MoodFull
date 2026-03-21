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
import SaveToCollectionDialog from './SaveToCollectionDialog';
import { Play, Flame, Zap, Wand2, Twitter, Facebook, Link as LinkIcon, Send, Coffee, CupSoda, Beer, Droplets, GlassWater, Utensils } from 'lucide-react';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';

function RecipeDisplay({ recipe, onSave, isSaved, onSimilarRecipeClick, onUpdate, onBack }) {
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const queryClient = useQueryClient();
  const descriptionRef = useRef(null);
  const images = recipe.imageUrls || (recipe.imageUrl || recipe.image_url ? [recipe.imageUrl || recipe.image_url] : []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [recipe.id]);

  // Reset servings when recipe changes
  React.useEffect(() => {
    if (recipe?.servings) {
      setCurrentServings(recipe.servings);
    }
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
    if (recipe.id && isSaved) {
      updateReviewMutation.mutate({ id: recipe.id, data: { review } });
    }
  };

  const updateRecipeMutation = useOptimisticMutation({
    queryKey: ['recipes'],
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, data),
    action: 'update'
  });

  const handleEditSave = (formData) => {
    if (recipe.id && isSaved) {
      updateRecipeMutation.mutate({ id: recipe.id, data: formData });
    }
    if (onUpdate) onUpdate(formData);
    setShowEditDialog(false);
  };

  const handleRate = (rating) => {
    if (recipe.id && isSaved) {
      updateRatingMutation.mutate({ id: recipe.id, data: { rating } });
    }
  };

  const [activeSubstitutions, setActiveSubstitutions] = useState({});
  const [aiSubstitutions, setAiSubstitutions] = useState({});
  const [loadingSubFor, setLoadingSubFor] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
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

    setLoadingSubFor(index);
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
      setLoadingSubFor(null);
    }
  };

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
  
  const handleShare = () => {
    const shareText = `Check out this recipe: ${recipe.name}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
    if (navigator.share) {
      navigator.share({
        title: recipe.name,
        text: shareText,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Recipe copied to clipboard!');
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
      className="bg-[#fdf8f4] rounded-[2rem] overflow-hidden shadow-2xl relative"
    >
      {/* Top Section */}
      <div className="pt-6 px-6 sm:px-10 relative z-10 min-h-[320px] sm:min-h-[400px]">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Go back" className="bg-white rounded-full shadow-sm mb-6 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Button>
        )}
        <div className="flex justify-between relative h-full">
          <div className="w-[55%] sm:w-1/2 z-10 flex flex-col">
            <div className="flex items-start gap-3 mb-8 pr-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {recipe.name}
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)} className="mt-1 shrink-0 bg-white/50 hover:bg-white rounded-full min-h-[44px] min-w-[44px]">
                <Pencil className="w-5 h-5 text-gray-700" />
              </Button>
            </div>
            
            <div className="space-y-5 mt-auto pb-8">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">{recipe.nutrition?.calories || 240}</span>
                  <span className="text-sm text-gray-500 font-medium">Calories</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-200 mt-1"></div>
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">{parseMacro(recipe.nutrition?.protein) || 19}g</span>
                  <span className="text-sm text-gray-500 font-medium">Protein</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-200 mt-1"></div>
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">{parseMacro(recipe.nutrition?.carbs) || 5}g</span>
                  <span className="text-sm text-gray-500 font-medium">Carbs</span>
                </div>
                <div className="h-0.5 w-12 bg-gray-200 mt-1"></div>
              </div>
            </div>
          </div>
          
          {/* Right side circular image */}
          <div className="absolute right-[-3rem] sm:right-[-4rem] top-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl border-[8px] border-white z-0">
            {images.length > 0 ? (
              <img src={images[currentImageIndex]} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ChefHat className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom White Card Overlay */}
      <div className="bg-white rounded-t-[2.5rem] px-6 sm:px-10 pt-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20">
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8 justify-end">
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
            onClick={() => setShowAddMeal(true)}
            variant="outline"
            className="rounded-full px-6 border-gray-200 hover:bg-gray-50"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            Plan
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
            {recipe.prep_time || '-'} prep
          </Badge>
          <Badge variant="secondary" className="bg-[#fdf8f4] text-gray-700 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
            {recipe.cook_time || '-'} cook
          </Badge>
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

        <div className="space-y-8">
          {/* Enhanced Nutrition Panel */}
          <NutritionPanel
            nutrition={recipe.nutrition}
            vitamins_minerals={recipe.vitamins_minerals}
            health_benefits={recipe.health_benefits}
            servings={recipe.servings}
            currentServings={currentServings}
          />

          {/* Similar Recipes Section - Prominently Displayed */}
          {similarRecipes.length > 0 && (
            <div className="bg-gradient-to-br from-[#f0f9f2] to-white rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-[#c5d9c9] my-6">
              <SimilarRecipes
                recipes={similarRecipes}
                onRecipeClick={onSimilarRecipeClick}
              />
            </div>
          )}

          {/* User Rating & Review */}
          <RecipeReview
            recipe={recipe}
            isSaved={isSaved}
            onRate={handleRate}
            onReviewSave={handleReviewSave}
          />

          {/* Public Community Comments */}
          <RecipeComments 
            recipe={recipe}
            currentUser={currentUser}
          />

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
                      disabled={loadingSubFor === index}
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
                      {loadingSubFor === index ? (
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
              {recipe.instructions?.map((instruction, index) =>
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
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-purple-500 rounded-full" />
                Perfect Pairings
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner border border-purple-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {recipe.pairings.map((pairing, index) => {
                    const lower = pairing.toLowerCase();
                    let Icon = Wine;
                    let iconColor = "text-purple-600";
                    
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
                    else if (lower.includes('sauce') || lower.includes('dip') || lower.includes('dressing') || lower.includes('salsa') || lower.includes('guacamole') || lower.includes('hummus') || lower.includes('gravy') || lower.includes('syrup') || lower.includes('glaze') || lower.includes('ketchup') || lower.includes('mustard') || lower.includes('mayo') || lower.includes('aioli') || lower.includes('pesto') || lower.includes('chutney') || lower.includes('marinade') || lower.includes('vinaigrette') || lower.includes('oil') || lower.includes('vinegar')) { Icon = Droplets; iconColor = "text-orange-600"; }
                    // Salads / Veggies
                    else if (lower.includes('salad') || lower.includes('greens') || lower.includes('vegetable') || lower.includes('broccoli') || lower.includes('asparagus') || lower.includes('spinach') || lower.includes('kale') || lower.includes('carrot') || lower.includes('potato') || lower.includes('tomato') || lower.includes('onion') || lower.includes('garlic') || lower.includes('pepper') || lower.includes('mushroom') || lower.includes('corn') || lower.includes('pea') || lower.includes('bean') || lower.includes('lentil') || lower.includes('chickpea')) { Icon = Leaf; iconColor = "text-green-500"; }
                    // Default to Utensils for other things that aren't beverages
                    else if (!lower.includes('drink') && !lower.includes('beverage') && !lower.includes('sip') && !lower.includes('glass') && !lower.includes('cup') && !lower.includes('mug') && !lower.includes('bottle') && !lower.includes('can') && !lower.includes('pint') && !lower.includes('shot') && !lower.includes('pour') && !lower.includes('splash') && !lower.includes('drop') && !lower.includes('liquid') && !lower.includes('fluid')) {
                      Icon = Utensils; iconColor = "text-amber-600";
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 shadow-sm"
                      >
                        <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
                        <span className="text-gray-800 text-sm sm:text-base leading-relaxed">{pairing}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
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
            if (!isSaved && onSave) onSave(updatedRecipe);
          }}
        />
      )}

      {/* Interactive Cooking Mode */}
      {showCookingMode && (
        <InteractiveCookingMode
          recipe={recipe}
          onClose={() => setShowCookingMode(false)}
        />
      )}
    </motion.div>
  );
}

export default React.memo(RecipeDisplay);