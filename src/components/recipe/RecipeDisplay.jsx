import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, BookmarkPlus, Check, CalendarPlus, Lightbulb, RefreshCw, Wine, Sparkles, Star, Minus, Plus, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AddMealDialog from '../mealplan/AddMealDialog';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
// SimilarRecipes imported below to avoid circular dependency issues if any, 
// but standard import works fine in most setups. 
import SimilarRecipes from './SimilarRecipes';
import RecipeEditDialog from './RecipeEditDialog';

function RecipeDisplay({ recipe, onSave, isSaved, onSimilarRecipeClick, onUpdate }) {
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
    const [currentServings, setCurrentServings] = useState(recipe?.servings || 4);
  const queryClient = useQueryClient();
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
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

  if (!recipe) return null;

  return (
    <motion.div
                initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}>

      <Card className="overflow-hidden shadow-2xl border-0 bg-white rounded-2xl sm:rounded-3xl">
        {/* Header Section with Image */}
        <div className="h-56 sm:h-64 md:h-80 bg-gradient-to-br from-[#f5e6dc] to-[#e8d5c4] relative overflow-hidden">
          {recipe.imageUrl ?
          <>
              <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="absolute inset-0 w-full h-full object-cover" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </> :

          <>
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}>

                  <ChefHat className="w-20 h-20 text-[#c17a7a] opacity-40" />
                </motion.div>
              </div>
            </>
          }
        </div>

        <CardHeader className="pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6">
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={onSave}
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
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Saved
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
          </div>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5">
            {recipe.prep_time &&
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5" />
                Prep: {recipe.prep_time}
              </Badge>
            }
            {recipe.cook_time &&
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5" />
                Cook: {recipe.cook_time}
              </Badge>
            }
            {recipe.servings &&
              <div className="flex items-center bg-green-50 text-green-700 border border-green-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-2" />
                <button 
                  onClick={() => setCurrentServings(Math.max(1, currentServings - 1))}
                  className="p-1 hover:bg-green-100 rounded-full transition-colors focus:outline-none"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="mx-2 font-bold text-sm sm:text-base min-w-[1.5rem] text-center">
                  {currentServings}
                </span>
                <button 
                  onClick={() => setCurrentServings(currentServings + 1)}
                  className="p-1 hover:bg-green-100 rounded-full transition-colors focus:outline-none"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="ml-1 text-xs sm:text-sm font-medium">servings</span>
              </div>
            }
            {recipe.difficulty &&
            <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 capitalize px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                {recipe.difficulty}
              </Badge>
            }
          </div>

          {/* Nutritional Information */}
          {recipe.nutrition &&
          <div className="mt-4 sm:mt-6 bg-gradient-to-br from-[#faf6f2] to-[#f5e6dc] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-[#e8d5c4] shadow-inner">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-[#c17a7a] rounded-full" />
                Nutrition Facts (per serving)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                {recipe.nutrition.calories &&
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#e8d5c4]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#c17a7a]">{recipe.nutrition.calories}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Calories</div>
                  </div>
              }
                {recipe.nutrition.protein &&
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#e8d5c4]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#c17a7a]">{recipe.nutrition.protein}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Protein</div>
                  </div>
              }
                {recipe.nutrition.carbs &&
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#e8d5c4]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#c17a7a]">{recipe.nutrition.carbs}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Carbs</div>
                  </div>
              }
                {recipe.nutrition.fat &&
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#e8d5c4]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#c17a7a]">{recipe.nutrition.fat}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Fat</div>
                  </div>
              }
                {recipe.nutrition.fiber &&
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#e8d5c4]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#c17a7a]">{recipe.nutrition.fiber}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Fiber</div>
                  </div>
              }
                {recipe.nutrition.sodium &&
              <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#e8d5c4]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#c17a7a]">{recipe.nutrition.sodium}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Sodium</div>
                  </div>
              }
              </div>
            </div>
          }
          </CardHeader>

        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
          {/* Ingredients */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-[#c17a7a] rounded-full" />
              Ingredients
            </h3>
            <div className="bg-[#faf6f2] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner border border-[#e8d5c4]">
              <ul className="space-y-2 sm:space-y-3">
                {scaledIngredients.map((ingredient, index) =>
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 sm:gap-3 text-gray-800 text-sm sm:text-base">

                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#c17a7a] mt-1.5 sm:mt-2 shrink-0 shadow-sm" />
                    <span className="leading-relaxed">{ingredient}</span>
                  </motion.li>
                )}
              </ul>
              {currentServings !== recipe.servings && (
                <p className="text-xs text-gray-500 mt-4 text-right italic">
                  * Ingredients adjusted for {currentServings} servings
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-[#c17a7a] rounded-full" />
              Instructions
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {recipe.instructions?.map((instruction, index) =>
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex gap-3 sm:gap-4 items-start group hover:bg-[#faf6f2] p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200">

                  <div className="bg-[#242424] text-white text-sm font-bold rounded-full shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center sm:text-base shadow-lg">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-800 leading-relaxed pt-1 sm:pt-1.5 md:pt-2 text-sm sm:text-base">
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
    </motion.div>
  );
}

export default React.memo(RecipeDisplay);