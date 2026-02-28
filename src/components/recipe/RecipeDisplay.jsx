import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, BookmarkPlus, Check, CalendarPlus, Lightbulb, RefreshCw, Wine, Sparkles, Star, Minus, Plus, Pencil, Leaf, ChevronLeft, ChevronRight, FolderPlus, Loader2 } from 'lucide-react';
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
import InteractiveCookingMode from './InteractiveCookingMode';
import SaveToCollectionDialog from './SaveToCollectionDialog';
import { Play, Flame, Zap, Wand2 } from 'lucide-react';

function RecipeDisplay({ recipe, onSave, isSaved, onSimilarRecipeClick, onUpdate }) {
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

  const updateRatingMutation = useMutation({
    mutationFn: ({ id, rating }) => base44.entities.Recipe.update(id, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, review }) => base44.entities.Recipe.update(id, { review }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    }
  });

  const handleReviewSave = (review) => {
    if (recipe.id && isSaved) {
      updateReviewMutation.mutate({ id: recipe.id, review });
    }
  };

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Recipe.update(id, data),
    onSuccess: (updatedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setShowEditDialog(false);
      if (onUpdate) onUpdate(updatedRecipe);
    }
  });

  const handleEditSave = (formData) => {
    if (recipe.id && isSaved) {
      updateRecipeMutation.mutate({ id: recipe.id, data: formData });
    }
  };

  const handleRate = (rating) => {
    if (recipe.id && isSaved) {
      updateRatingMutation.mutate({ id: recipe.id, rating });
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

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest ONE single best substitution for "${ingredient}" in the recipe "${recipe.name}".${dietaryContext}${inventoryContext}\nReturn ONLY the name of the substitute ingredient and the amount to use. Keep it very concise.`,
        response_json_schema: {
          type: "object",
          properties: {
            substitute: { type: "string" }
          }
        }
      });

      setAiSubstitutions(prev => ({
        ...prev,
        [index]: { ingredient, substitute: response.substitute }
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
      const promptMap = {
        'quicker': `Provide a quicker variation of "${recipe.name}". Simplify the ingredients and instructions.`,
        'gourmet': `Provide a complex, gourmet, chef-level variation of "${recipe.name}" that takes longer but is extremely elevated.`,
        'vegan': `Provide a vegan variation of "${recipe.name}". Replace any animal products with vegan alternatives.`,
        'spicier': `Provide a spicier variation of "${recipe.name}". Add heat and bold spices.`
      };

      const finalPrompt = promptMap[typeOrPrompt] || `Create a variation of "${recipe.name}" with this specific modification: "${typeOrPrompt}". Adapt the ingredients and instructions accordingly.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${finalPrompt} Keep the core identity but apply the requested changes.`,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            ingredients: { type: "array", items: { type: "string" } },
            instructions: { type: "array", items: { type: "string" } },
            prep_time: { type: "string" },
            cook_time: { type: "string" },
            servings: { type: "number" },
            difficulty: { type: "string" },
            nutrition: {
              type: "object",
              properties: {
                calories: { type: "number" },
                protein: { type: "string" },
                carbs: { type: "string" },
                fat: { type: "string" },
                fiber: { type: "string" },
                sodium: { type: "string" },
                sugar: { type: "string" }
              }
            }
          }
        }
      });

      if (onSimilarRecipeClick) {
        onSimilarRecipeClick({
          ...recipe,
          id: undefined,
          ...response,
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
  
  const handleRegenerateSteps = async (mode) => {
    setIsRegeneratingSteps(true);
    try {
      const modePrompt = mode === 'simplify' 
        ? "Simplify these instructions to be as easy to understand as possible for a beginner. Reduce the number of steps if possible."
        : "Make these instructions extremely detailed, step-by-step, including visual cues, temperatures, and professional techniques.";
        
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Here are the current instructions for ${recipe.name}: \n${recipe.instructions.join('\n')}\n\n${modePrompt} Return ONLY a list of strings representing the new steps.`,
        response_json_schema: {
          type: "object",
          properties: {
            instructions: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      if (response.instructions) {
         if (recipe.id && isSaved) {
           updateRecipeMutation.mutate({ id: recipe.id, data: { instructions: response.instructions } });
         }
         if (onUpdate) {
           onUpdate({ instructions: response.instructions });
         }
         toast.success("Instructions updated!");
      }
    } catch (e) {
      toast.error('Failed to regenerate instructions');
    }
    setIsRegeneratingSteps(false);
  };

  if (!recipe) return null;

  return (
    <motion.div
                initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}>

      <Card className="overflow-hidden shadow-2xl border-0 bg-[#e8f0ea] rounded-[24px]">
        {/* Header Section with Image */}
        <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-[#8db894] via-[#5a8a65] to-[#3d5244] relative overflow-hidden flex items-center justify-center text-5xl perspective-1000">
          <div className="absolute inset-0 blur-md scale-110 opacity-60">
             {images.length > 0 && (
               <img src={images[currentImageIndex]} className="w-full h-full object-cover transition-all duration-500" alt="" />
             )}
          </div>
          
          {images.length > 0 ?
          <div className="relative z-10 flex items-center justify-center group h-full w-full">
            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 sm:left-12 bg-white/40 hover:bg-white/70 p-2 rounded-full text-gray-900 transition-colors z-30"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.4)] border-[6px] border-white/30 relative z-10"
              style={{ transformStyle: "preserve-3d" }}
            >
                <img
                key={images[currentImageIndex]}
                src={images[currentImageIndex]}
                alt={recipe.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" />
            </motion.div>

            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i + 1) % images.length); }}
                className="absolute right-4 sm:right-12 bg-white/40 hover:bg-white/70 p-2 rounded-full text-gray-900 transition-colors z-30"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                {images.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div> :

          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="text-7xl relative z-10"
          >
              🥗
          </motion.div>
          }
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#e8f0ea] z-20 pointer-events-none" />
          
          <div className="absolute top-3 left-4 font-mono text-[8px] sm:text-[9px] tracking-[0.12em] uppercase bg-[#6b9b76]/85 text-white px-2.5 py-1 rounded-md backdrop-blur-sm z-30">
            ◎ {recipe.mood ? recipe.mood.replace(/,/g, ' ·') : 'Recipe'}
          </div>
        </div>

        <CardHeader className="pb-4 sm:pb-6 pt-2 sm:pt-4 px-4 sm:px-6 bg-[#e8f0ea]">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
                {recipe.name}
              </CardTitle>
              <p ref={descriptionRef} className="text-gray-600 text-sm sm:text-base md:text-lg mt-2 sm:mt-3 leading-relaxed">{recipe.description}</p>
            </div>
            <div className="flex items-center gap-4">
              {isSaved && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (recipe.rating || 0) >= star
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowCookingMode(true)}
                className="flex-1 sm:flex-none bg-[#6b9b76] hover:bg-[#5a8a65] text-white shadow-lg rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 text-sm sm:text-base"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 fill-white" />
                Start Cooking
              </Button>
              <Button
                onClick={() => setShowSaveDialog(true)}
                variant={isSaved ? "default" : "outline"}
                className={`
                  flex-1 sm:flex-none shrink-0 transition-all duration-300 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 text-sm sm:text-base
                  ${isSaved ?
                'bg-[#c17a7a] hover:bg-[#b06a6a] shadow-lg' :
                'border-2 hover:border-[#c17a7a] hover:bg-[#f5e6dc] hover:shadow-md'}
                `
                }>

                {isSaved ?
                <>
                    <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Collections
                  </> :

                <>
                    <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Save
                  </>
                }
              </Button>
              {isSaved && (
                <Button
                  onClick={() => setShowEditDialog(true)}
                  variant="outline"
                  className="flex-1 sm:flex-none border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 text-sm sm:text-base"
                >
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Edit
                </Button>
              )}
              <Button
                onClick={() => setShowAddMeal(true)}
                variant="outline"
                className="flex-1 sm:flex-none border-2 border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 text-sm sm:text-base"
              >
                <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Add to Plan
              </Button>
            </div>
            
            <div className="w-full mt-4 pt-4 border-t border-[#c5d9c9]/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Refine & Create Variations</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Button 
                  onClick={() => generateCustomVariation('quicker')}
                  disabled={isGeneratingVariation}
                  variant="outline" 
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 text-[10px] h-7 px-2"
                >
                  <Zap className="w-3 h-3 mr-1" /> Quicker
                </Button>
                <Button 
                  onClick={() => generateCustomVariation('vegan')}
                  disabled={isGeneratingVariation}
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-[10px] h-7 px-2"
                >
                  <Leaf className="w-3 h-3 mr-1" /> Vegan
                </Button>
                <Button 
                  onClick={() => generateCustomVariation('spicier')}
                  disabled={isGeneratingVariation}
                  variant="outline" 
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-[10px] h-7 px-2"
                >
                  <Flame className="w-3 h-3 mr-1" /> Spicier
                </Button>
              </div>
              <div className="flex gap-1.5">
                <input 
                  placeholder="e.g. Make it low carb..." 
                  value={customVariation}
                  onChange={e => setCustomVariation(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customVariation.trim() && !isGeneratingVariation) {
                      generateCustomVariation(customVariation);
                    }
                  }}
                  className="flex-1 h-7 text-[10px] px-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#6b9b76]"
                />
                <Button 
                  onClick={() => generateCustomVariation(customVariation)}
                  disabled={isGeneratingVariation || !customVariation.trim()}
                  className="h-7 w-7 p-0 bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-md shrink-0"
                  title="Generate Custom Variation"
                >
                  {isGeneratingVariation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Prep: {recipe.prep_time || '-'}
            </Badge>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              Cook: {recipe.cook_time || '-'}
            </Badge>
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              <button onClick={() => setCurrentServings(Math.max(1, currentServings - 1))} className="p-0.5 hover:bg-purple-200 rounded-md"><Minus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
              <span className="font-bold min-w-[1ch] text-center">{currentServings}</span>
              <button onClick={() => setCurrentServings(currentServings + 1)} className="p-0.5 hover:bg-purple-200 rounded-md"><Plus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
            </Badge>
            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl capitalize">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              {recipe.difficulty || '-'}
            </Badge>
          </div>

          </CardHeader>

        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8 pt-0">
          {/* Enhanced Nutrition Panel */}
          <NutritionPanel
            nutrition={recipe.nutrition}
            vitamins_minerals={recipe.vitamins_minerals}
            health_benefits={recipe.health_benefits}
            servings={recipe.servings}
            currentServings={currentServings}
          />

          {/* User Rating & Review */}
          <RecipeReview
            recipe={recipe}
            isSaved={isSaved}
            onRate={handleRate}
            onReviewSave={handleReviewSave}
          />

          {/* Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-[#6b9b76]/70 mb-2">
              <span>Ingredients</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#c5d9c9]/60 to-transparent"></div>
            </div>
            <div className="space-y-1.5 perspective-1000">
              {scaledIngredients.map((ingredient, index) => {
                const hasSub = recipe?.substitutions?.find(s => ingredient.toLowerCase().includes(s.ingredient.toLowerCase()));
                const isSubbed = activeSubstitutions[index];
                
                const words = ingredient.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 2);
                const invMatch = inventory.find(i => {
                   const iName = i.name.toLowerCase();
                   return words.some(w => iName.includes(w)) || iName.includes(words[words.length-1]);
                });
                const isMissingOrLow = inventory.length > 0 && (!invMatch || invMatch.quantity <= (invMatch.min_stock || 0));
                
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, z: -30, rotateX: 10 }}
                    animate={{ opacity: 1, z: 0, rotateX: 0 }}
                    whileHover={{ scale: 1.02, z: 20, rotateX: -5, backgroundColor: 'rgba(255,255,255,0.8)' }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
                    className="group flex flex-col gap-1 text-[11px] sm:text-xs text-[#3d5244]/80 p-2 sm:p-2.5 bg-white/40 rounded-[10px] border border-[#c5d9c9]/30 list-none transform-gpu relative">
                      <div className="flex items-center gap-3 w-full">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_rgba(107,155,118,0.8)] ${isMissingOrLow && !isSubbed ? 'bg-amber-500' : 'bg-[#6b9b76]'}`} />
                        <span className={`leading-relaxed font-medium flex-1 ${isSubbed ? 'line-through opacity-50' : ''} ${isMissingOrLow && !isSubbed ? 'text-amber-700' : ''}`}>
                          {ingredient}
                          {isMissingOrLow && !isSubbed && <span className="inline-block ml-2 text-[9px] uppercase tracking-wider text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Low/Missing</span>}
                        </span>
                        <button 
                          onClick={() => toggleSubstitution(index, ingredient)}
                          disabled={loadingSubFor === index}
                          className={`p-1.5 rounded-md flex items-center gap-1 transition-colors ${
                            isSubbed 
                              ? 'bg-[#c17a7a] text-white' 
                              : hasSub || aiSubstitutions[index]
                                ? 'bg-[#f5e6dc] text-[#c17a7a] hover:bg-[#e8d5c4]'
                                : 'bg-gray-100 text-gray-400 hover:bg-[#f5e6dc] hover:text-[#c17a7a] opacity-0 group-hover:opacity-100'
                          }`}
                          title={isSubbed ? "Revert ingredient" : hasSub ? "Use suggested substitute" : "Ask AI for pantry-based substitute"}
                        >
                          {loadingSubFor === index ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            isSubbed || hasSub ? <RefreshCw className="w-3 h-3" /> : <Wand2 className="w-3 h-3 text-[#c17a7a]" />
                          )}
                          {(isSubbed || hasSub || aiSubstitutions[index]) ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                              {isSubbed ? 'Revert' : 'Substitute'}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#c17a7a]">
                              AI Swap
                            </span>
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {isSubbed && (hasSub || aiSubstitutions[index]) && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4.5 pt-1 text-[#c17a7a] font-medium flex items-center gap-2 text-xs"
                          >
                            <div className="w-1 h-1 rounded-full bg-[#c17a7a] shrink-0" />
                            <span className="flex-1">
                              Use: {hasSub ? hasSub.substitute : aiSubstitutions[index].substitute}
                            </span>
                            {!hasSub && <Sparkles className="w-3 h-3 opacity-50 shrink-0" title="AI Suggested" />}
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </motion.li>
                );
              })}
              {currentServings !== recipe.servings && (
                <p className="text-[10px] text-gray-500 mt-2 text-right italic">
                  * Ingredients adjusted for {currentServings} servings
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-[#6b9b76]/70 mb-2">
              <span>Instructions</span>
              <div className="flex-1 h-px bg-gradient-to-r from-[#c5d9c9]/60 to-transparent"></div>
              <div className="flex gap-1">
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => handleRegenerateSteps('simplify')} 
                   disabled={isRegeneratingSteps}
                   className="h-6 text-[10px] px-2 text-[#6b9b76] hover:bg-[#6b9b76]/10 font-sans tracking-normal normal-case"
                   title="Make instructions simpler and easier to follow"
                 >
                   {isRegeneratingSteps ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />} Simplify
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => handleRegenerateSteps('detail')} 
                   disabled={isRegeneratingSteps}
                   className="h-6 text-[10px] px-2 text-[#6b9b76] hover:bg-[#6b9b76]/10 font-sans tracking-normal normal-case"
                   title="Make instructions extremely detailed with visual cues"
                 >
                   {isRegeneratingSteps ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />} Detail
                 </Button>
              </div>
            </div>
            <div className="space-y-3">
              {recipe.instructions?.map((instruction, index) =>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-3 items-start group glass-panel p-3 sm:p-4 rounded-[14px] transition-all duration-200">

                  <div className="bg-[#6b9b76] text-white font-mono text-[10px] sm:text-xs font-bold rounded-xl shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-[#3d5244]/80 leading-relaxed pt-0.5 text-[11px] sm:text-xs">
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
                  {recipe.pairings.map((pairing, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 shadow-sm"
                    >
                      <Wine className="w-5 h-5 text-purple-600 shrink-0" />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">{pairing}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Similar Recipes Section */}
      {similarRecipes.length > 0 && (
        <div className="mt-8">
          <SimilarRecipes
            recipes={similarRecipes}
            onRecipeClick={onSimilarRecipeClick}
          />
        </div>
      )}

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