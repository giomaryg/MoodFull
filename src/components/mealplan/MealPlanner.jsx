import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, ShoppingCart, Sparkles, RefreshCw, Loader2, Repeat, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AddMealDialog from './AddMealDialog';
import SwapMealDialog from './SwapMealDialog';
import RepeatMealDialog from './RepeatMealDialog';
import RecipeDetailModal from './RecipeDetailModal';

function MealPlanner({ onOpenShoppingList, savedRecipes = [], generatedRecipes = [] }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [swappingMeal, setSwappingMeal] = useState(null);
  const [repeatingMeal, setRepeatingMeal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingRecipeId, setLoadingRecipeId] = useState(null);

  const queryClient = useQueryClient();

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 100)
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const deleteMealMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  });

  const createMealMutation = useMutation({
    mutationFn: (mealData) => base44.entities.MealPlan.create(mealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MealPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getMealsForDay = (date, mealType) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return mealPlans.filter(
      (plan) => plan.date === dateString && plan.meal_type === mealType
    );
  };

  const handleAddMeal = (date, mealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowAddMeal(true);
  };

  const handleSwapMeal = async (meal, newRecipe) => {
    await updateMealMutation.mutateAsync({
      id: meal.id,
      data: {
        recipe_id: newRecipe.id,
        recipe_name: newRecipe.name,
        servings: newRecipe.servings
      }
    });
    setSwappingMeal(null);
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    if (source.droppableId === 'recipes-list') {
      const isGenerated = draggableId.startsWith('gen-');
      const realId = isGenerated ? draggableId.replace('gen-', '') : draggableId;
      
      let recipe = null;
      if (isGenerated) {
        recipe = generatedRecipes[parseInt(realId)];
      } else {
        recipe = savedRecipes.find(r => r.id === realId) || recipes.find(r => r.id === realId);
      }

      if (!recipe) return;

      const [destDate, destMealType] = destination.droppableId.split('|');

      let finalRecipeId = recipe.id;

      if (isGenerated && !recipe.id) {
        try {
          const saved = await base44.entities.Recipe.create({
            name: recipe.name,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            prep_time: recipe.prep_time,
            cook_time: recipe.cook_time,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            nutrition: recipe.nutrition,
            image_url: recipe.imageUrl || (recipe.imageUrls ? recipe.imageUrls[0] : null),
            mood: recipe.mood || 'generated'
          });
          finalRecipeId = saved.id;
          queryClient.invalidateQueries({ queryKey: ['recipes'] });
        } catch (e) {
          console.error("Failed to save generated recipe", e);
        }
      }

      createMealMutation.mutate({
        recipe_id: finalRecipeId,
        recipe_name: recipe.name,
        date: destDate,
        meal_type: destMealType,
        servings: recipe.servings || 4
      });
      return;
    }

    const [destDate, destMealType] = destination.droppableId.split('|');

    const meal = mealPlans.find(m => m.id === draggableId);
    if (!meal) return;

    // Optimistically update the UI immediately
    queryClient.setQueryData(['mealPlans'], (oldData) => {
      if (!oldData) return oldData;
      return oldData.map(m => 
        m.id === draggableId 
          ? { ...m, date: destDate, meal_type: destMealType }
          : m
      );
    });

    try {
      await base44.entities.MealPlan.update(meal.id, {
        date: destDate,
        meal_type: destMealType
      });
      // Refetch to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    } catch (error) {
      console.error('Failed to move meal:', error);
      // Revert on error by refetching
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  };

  const generateWeeklyPlan = async () => {
    if (!currentUser) return;
    
    setIsGeneratingPlan(true);
    
    try {
      // Build user context
      let contextParts = [];
      if (currentUser.diet_preferences) {
        contextParts.push(`Dietary preferences: ${currentUser.diet_preferences}`);
      }
      if (currentUser.allergies) {
        contextParts.push(`MUST AVOID allergens: ${currentUser.allergies}`);
      }
      if (currentUser.blood_sugar_friendly) {
        contextParts.push(`Blood sugar friendly meals required`);
      }
      if (currentUser.preferred_cuisines?.length > 0) {
        contextParts.push(`Preferred cuisines: ${currentUser.preferred_cuisines.join(', ')}`);
      }
      
      const userContext = contextParts.join('\n');

      const mealSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          ingredients: { type: "array", items: { type: "string" } },
          instructions: { type: "array", items: { type: "string" } },
          prep_time: { type: "string" },
          cook_time: { type: "string" },
          servings: { type: "number" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
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
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a balanced weekly meal plan (7 days) with breakfast, lunch, and dinner for each day.

${userContext}

Requirements:
- Variety: Each day should have different meals
- Balance: Mix of proteins, carbs, and vegetables
- Practicality: Consider using similar ingredients across days to reduce waste
- Include at least 2-3 easy quick meals for busy days
- Include 1-2 special occasion meals for the week

For each meal provide:
- Recipe name
- Brief description
- Main ingredients list
- Cooking instructions
- Prep time and cook time
- Servings (default to 4)
- Difficulty level`,
        response_json_schema: {
          type: "object",
          properties: {
            week_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  breakfast: mealSchema,
                  lunch: mealSchema,
                  dinner: mealSchema
                }
              }
            }
          }
        }
      });

      // Save recipes and create meal plans
      const mealCreations = [];
      
      for (const dayPlan of response.week_plan) {
        const date = addDays(currentWeekStart, dayPlan.day);
        
        for (const mealType of ['breakfast', 'lunch', 'dinner']) {
          const meal = dayPlan[mealType];
          if (!meal) continue;

          // Save recipe first
          const recipe = await base44.entities.Recipe.create({
            name: meal.name,
            description: meal.description,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            prep_time: meal.prep_time,
            cook_time: meal.cook_time,
            servings: meal.servings,
            difficulty: meal.difficulty,
            nutrition: meal.nutrition,
            vitamins_minerals: meal.vitamins_minerals,
            health_benefits: meal.health_benefits,
            cooking_tips: meal.cooking_tips,
            substitutions: meal.substitutions,
            pairings: meal.pairings,
            mood: 'meal plan'
          });

          base44.integrations.Core.GenerateImage({
            prompt: `Professional food photography of ${meal.name}. ${meal.description}. Beautiful plating, natural lighting, appetizing, high quality.`
          }).then(img => {
            if (img && img.url) {
              base44.entities.Recipe.update(recipe.id, { image_url: img.url }).then(() => {
                queryClient.invalidateQueries({ queryKey: ['recipes'] });
              });
            }
          }).catch(console.error);

          // Create meal plan entry
          mealCreations.push(
            createMealMutation.mutateAsync({
              recipe_id: recipe.id,
              recipe_name: recipe.name,
              date: format(date, 'yyyy-MM-dd'),
              meal_type: mealType,
              servings: meal.servings
            })
          );
        }
      }

      await Promise.all(mealCreations);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const regenerateDay = async (date) => {
    if (!currentUser) return;
    
    setRegeneratingDay(format(date, 'yyyy-MM-dd'));
    
    try {
      // Delete existing meals for this day
      const dateString = format(date, 'yyyy-MM-dd');
      const existingMeals = mealPlans.filter(plan => 
        plan.date === dateString
      );
      await Promise.all(existingMeals.map(meal => 
        deleteMealMutation.mutateAsync(meal.id)
      ));

      // Build user context
      let contextParts = [];
      if (currentUser.diet_preferences) {
        contextParts.push(`Dietary preferences: ${currentUser.diet_preferences}`);
      }
      if (currentUser.allergies) {
        contextParts.push(`MUST AVOID allergens: ${currentUser.allergies}`);
      }
      if (currentUser.blood_sugar_friendly) {
        contextParts.push(`Blood sugar friendly meals required`);
      }
      
      const userContext = contextParts.join('\n');

      const mealSchema = {
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
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create meals for one day: breakfast, lunch, and dinner.

${userContext}

Make them balanced, diverse, and delicious. Include:
- Recipe name
- Brief description  
- Main ingredients
- Cooking instructions
- Prep and cook times
- Servings (default 4)
- Difficulty level`,
        response_json_schema: {
          type: "object",
          properties: {
            breakfast: mealSchema,
            lunch: mealSchema,
            dinner: mealSchema
          }
        }
      });

      // Save recipes and create meal plans
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        const meal = response[mealType];
        if (!meal) continue;

        const recipe = await base44.entities.Recipe.create({
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prep_time: meal.prep_time,
          cook_time: meal.cook_time,
          servings: meal.servings,
          difficulty: meal.difficulty,
          nutrition: meal.nutrition,
          vitamins_minerals: meal.vitamins_minerals,
          health_benefits: meal.health_benefits,
          cooking_tips: meal.cooking_tips,
          substitutions: meal.substitutions,
          pairings: meal.pairings,
          mood: 'meal plan'
        });

        base44.integrations.Core.GenerateImage({
          prompt: `Professional food photography of ${meal.name}. ${meal.description}. Beautiful plating, natural lighting, appetizing, high quality.`
        }).then(img => {
          if (img && img.url) {
            base44.entities.Recipe.update(recipe.id, { image_url: img.url }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['recipes'] });
            });
          }
        }).catch(console.error);

        await createMealMutation.mutateAsync({
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          date: format(date, 'yyyy-MM-dd'),
          meal_type: mealType,
          servings: meal.servings
        });
      }

      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      
    } catch (error) {
      console.error('Failed to regenerate day:', error);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Meal Planner</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={generateWeeklyPlan}
            disabled={isGeneratingPlan}
            className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white flex-1 sm:flex-none"
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Plan
              </>
            )}
          </Button>
          <Button
            onClick={onOpenShoppingList}
            className="bg-[#c17a7a] hover:bg-[#b06a6a] text-white flex-1 sm:flex-none"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopping List
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 border-2 border-[#c5d9c9]">
        <Button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          variant="ghost"
          size="icon"
        >
          <ChevronLeft className="w-5 h-5 text-[#6b9b76]" />
        </Button>
        <div className="text-center">
          <p className="text-[#6b9b76] font-semibold text-lg">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <Button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          variant="ghost"
          size="icon"
        >
          <ChevronRight className="w-5 h-5 text-[#6b9b76]" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar for Recipes */}
          <div className="lg:w-72 w-full bg-white rounded-xl p-4 border-2 border-[#c5d9c9] max-h-[800px] overflow-y-auto hidden lg:block flex-shrink-0">
            <h3 className="font-bold text-[#6b9b76] mb-4">Drag to Plan</h3>
            <Droppable droppableId="recipes-list" isDropDisabled={true}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[100px]">
                  {generatedRecipes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Generated Ideas</p>
                      {generatedRecipes.map((recipe, index) => (
                        <Draggable key={`gen-${index}`} draggableId={`gen-${index}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border-2 border-[#c5d9c9] rounded-lg p-3 text-sm cursor-grab active:cursor-grabbing mb-2 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-[#6b9b76] rotate-2' : 'hover:border-[#6b9b76] transition-colors'}`}
                            >
                              <p className="font-semibold text-[#3d5244] line-clamp-2">{recipe.name}</p>
                              {recipe.prep_time && <p className="text-xs text-gray-500 mt-1">⏱ {recipe.prep_time}</p>}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Saved Collection</p>
                  {savedRecipes.slice(0, 15).map((recipe, index) => (
                    <Draggable key={recipe.id} draggableId={recipe.id} index={index + generatedRecipes.length}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white border-2 border-[#c5d9c9] rounded-lg p-3 text-sm cursor-grab active:cursor-grabbing mb-2 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-[#6b9b76] rotate-2' : 'hover:border-[#6b9b76] transition-colors'}`}
                        >
                          <p className="font-semibold text-[#3d5244] line-clamp-2">{recipe.name}</p>
                          {recipe.prep_time && <p className="text-xs text-gray-500 mt-1">⏱ {recipe.prep_time}</p>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div className="flex-1 bg-white rounded-xl border-2 border-[#c5d9c9] overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-px bg-[#c5d9c9]">
              {weekDays.map((day) => (
              <div key={day.toString()} className="bg-[#6b9b76] p-3 text-center relative group">
                <p className="text-white font-semibold text-sm">
                  {format(day, 'EEE')}
                </p>
                <p className="text-white text-xs">
                  {format(day, 'MMM d')}
                </p>
                <Button
                  onClick={() => regenerateDay(day)}
                  disabled={regeneratingDay === format(day, 'yyyy-MM-dd')}
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-opacity"
                >
                  {regeneratingDay === format(day, 'yyyy-MM-dd') ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-white" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Meal Rows */}
              {mealTypes.map((mealType) => (
                <div key={mealType} className="grid grid-cols-7 gap-px bg-[#c5d9c9] border-t-2 border-[#c5d9c9]">
                  {weekDays.map((day) => {
                const meals = getMealsForDay(day, mealType);
                const isToday = isSameDay(day, new Date());
                const dropId = `${format(day, 'yyyy-MM-dd')}|${mealType}`;

                return (
                  <Droppable key={dropId} droppableId={dropId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-white p-2 min-h-[100px] transition-colors ${
                          isToday ? 'bg-[#f0f9f2]' : ''
                        } ${snapshot.isDraggingOver ? 'bg-[#e8f0ea] ring-2 ring-[#6b9b76]' : ''}`}
                      >
                        {weekDays.indexOf(day) === 0 && (
                          <p className="text-xs font-semibold text-[#6b9b76] mb-2 capitalize">
                            {mealType}
                          </p>
                        )}
                        
                        <div className="space-y-1">
                          {meals.map((meal, index) => {
                            const linkedRecipe = recipes.find(r => r.id === meal.recipe_id);
                            return (
 <Draggable key={meal.id} draggableId={meal.id} index={index}>
   {(provided, snapshot) => (
     <div
       ref={provided.innerRef}
       {...provided.draggableProps}
       className={`bg-[#f5e6dc] rounded-lg text-xs group relative ${
         snapshot.isDragging ? 'shadow-lg ring-2 ring-[#6b9b76] opacity-90' : ''
       }`}
     >
       {/* Drag handle — small grip area only */}
       <div
         {...provided.dragHandleProps}
         className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-move opacity-30 group-hover:opacity-60"
       >
         <div className="flex flex-col gap-0.5">
           <div className="w-1 h-1 rounded-full bg-gray-500" />
           <div className="w-1 h-1 rounded-full bg-gray-500" />
           <div className="w-1 h-1 rounded-full bg-gray-500" />
         </div>
       </div>

       {/* Clickable content area */}
       <div
         className="pl-5 pr-8 py-2 cursor-pointer"
         onClick={async () => {
           if (linkedRecipe) {
             setSelectedRecipe(linkedRecipe);
             return;
           }
           if (meal.recipe_id) {
             setLoadingRecipeId(meal.id);
             try {
               const results = await base44.entities.Recipe.filter({ id: meal.recipe_id });
               if (results?.length > 0) {
                 setSelectedRecipe(results[0]);
               } else {
                 setSelectedRecipe({
                   name: meal.recipe_name,
                   ingredients: meal.custom_ingredients || [],
                   instructions: meal.custom_instructions || [],
                   servings: meal.servings,
                   notes: meal.notes
                 });
               }
             } catch (e) {
               setSelectedRecipe({
                 name: meal.recipe_name,
                 ingredients: meal.custom_ingredients || [],
                 instructions: meal.custom_instructions || [],
                 servings: meal.servings,
                 notes: meal.notes
               });
             }
             setLoadingRecipeId(null);
           } else {
             setSelectedRecipe({
               name: meal.recipe_name,
               ingredients: meal.custom_ingredients || [],
               instructions: meal.custom_instructions || [],
               servings: meal.servings,
               notes: meal.notes
             });
           }
         }}
       >
         <p className="font-medium text-[#5a6f60] break-words text-xs leading-normal hover:underline">
           {loadingRecipeId === meal.id ? '...' : meal.recipe_name}
         </p>
         {meal.servings && (
           <p className="text-gray-500 text-xs">{meal.servings} servings</p>
         )}
       </div>

       <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button
           onClick={(e) => { e.stopPropagation(); setSwappingMeal(meal); }}
           className="p-1 hover:bg-white/50 rounded"
           title="Swap Meal"
         >
           <ArrowLeftRight className="w-3 h-3 text-[#6b9b76]" />
         </button>
         <button
           onClick={(e) => { e.stopPropagation(); setRepeatingMeal(meal); }}
           className="p-1 hover:bg-white/50 rounded"
           title="Repeat Meal"
         >
           <Repeat className="w-3 h-3 text-[#6b9b76]" />
         </button>
         <button
           onClick={(e) => { e.stopPropagation(); deleteMealMutation.mutate(meal.id); }}
           className="p-1 hover:bg-white/50 rounded"
           title="Remove Meal"
         >
           <Trash2 className="w-3 h-3 text-red-500" />
         </button>
       </div>
     </div>
   )}
 </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>

                        <Button
                          onClick={() => handleAddMeal(day, mealType)}
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2 text-[#6b9b76] hover:bg-[#f0f9f2]"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </DragDropContext>

      {/* Add Meal Dialog */}
      {showAddMeal && (
        <AddMealDialog
          date={selectedDate}
          mealType={selectedMealType}
          recipes={recipes}
          enableDateSelection={true}
          onClose={() => {
            setShowAddMeal(false);
            setSelectedDate(null);
            setSelectedMealType(null);
          }}
        />
      )}



      {/* Swap Meal Dialog */}
      {swappingMeal && (
        <SwapMealDialog
          currentMeal={swappingMeal}
          recipes={recipes}
          onSwap={(newRecipe) => handleSwapMeal(swappingMeal, newRecipe)}
          onClose={() => setSwappingMeal(null)}
        />
      )}

      {repeatingMeal && (
        <RepeatMealDialog
          meal={repeatingMeal}
          onClose={() => setRepeatingMeal(null)}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

export default React.memo(MealPlanner);