import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, CheckSquare, Square, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

function ShoppingList({ mealPlans, recipes, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [readdingId, setReaddingId] = useState(null);

  const handleReaddToMealPlan = async (plan) => {
    setReaddingId(plan.id);
    const today = new Date().toISOString().split('T')[0];
    await base44.entities.MealPlan.create({
      recipe_id: plan.recipe_id || null,
      recipe_name: plan.recipe_name,
      date: today,
      meal_type: plan.meal_type,
      servings: plan.servings || 2,
      notes: plan.notes || ''
    });
    queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    toast.success(`${plan.recipe_name} added to today's meal plan!`);
    setReaddingId(null);
  };
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'consolidated', 'by-recipe', or 'history'
  
  // Only pre-select meal plans that have a matching saved recipe with ingredients
  const validPlanIds = useMemo(() => 
    mealPlans
      .filter(p => {
        const recipe = recipes.find(r => r.id === p.recipe_id);
        return recipe && recipe.ingredients?.length > 0;
      })
      .map(p => p.id),
    [mealPlans, recipes]
  );

  // Selection state
  const [selectedPlanIds, setSelectedPlanIds] = useState(new Set(validPlanIds));
  const [selectedRecipeIds, setSelectedRecipeIds] = useState(new Set());

  // Remove deleted meal plans / recipes from selection; also drop plans with no recipe/ingredients
  useEffect(() => {
    const valid = new Set(validPlanIds);
    setSelectedPlanIds(prev => new Set([...prev].filter(id => valid.has(id))));
  }, [validPlanIds]);

  useEffect(() => {
    const validRecipeIds = new Set(recipes.map(r => r.id));
    setSelectedRecipeIds(prev => new Set([...prev].filter(id => validRecipeIds.has(id))));
  }, [recipes]);

  const togglePlanSelection = (id) => {
    const newSelected = new Set(selectedPlanIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedPlanIds(newSelected);
  };

  const toggleRecipeSelection = (id) => {
    const newSelected = new Set(selectedRecipeIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedRecipeIds(newSelected);
  };

  const selectedMeals = useMemo(() => {
    return mealPlans.filter(plan => selectedPlanIds.has(plan.id));
  }, [mealPlans, selectedPlanIds]);

  const selectedExtraRecipes = useMemo(() => {
    return recipes.filter(r => selectedRecipeIds.has(r.id));
  }, [recipes, selectedRecipeIds]);

  const shoppingByRecipe = useMemo(() => {
    const fromPlans = selectedMeals.map((plan) => {
      const recipe = recipes.find((r) => r.id === plan.recipe_id);
      return {
        id: `plan-${plan.id}`,
        recipeName: recipe?.name || 'Unknown Recipe',
        details: `${plan.meal_type} on ${new Date(plan.date).toLocaleDateString()}`,
        ingredients: recipe?.ingredients || [],
        servings: plan.servings
      };
    });

    const fromRecipes = selectedExtraRecipes.map(recipe => ({
      id: `recipe-${recipe.id}`,
      recipeName: recipe.name,
      details: 'Extra Item',
      ingredients: recipe.ingredients || [],
      servings: recipe.servings
    }));

    return [...fromPlans, ...fromRecipes];
  }, [selectedMeals, selectedExtraRecipes, recipes]);

  const shoppingList = useMemo(() => {
    const ingredientMap = {};

    // Process meal plans
    selectedMeals.forEach((plan) => {
      const recipe = recipes.find((r) => r.id === plan.recipe_id);
      if (!recipe || !recipe.ingredients) return;

      const servingMultiplier = (plan.servings || recipe.servings) / (recipe.servings || 1);
      
      recipe.ingredients.forEach((ingredient) => {
        const cleanIngredient = ingredient.toLowerCase().trim();
        if (!ingredientMap[cleanIngredient]) {
          ingredientMap[cleanIngredient] = {
            original: ingredient,
            count: 0,
            recipes: []
          };
        }
        ingredientMap[cleanIngredient].count += servingMultiplier;
        if (!ingredientMap[cleanIngredient].recipes.includes(recipe.name)) {
          ingredientMap[cleanIngredient].recipes.push(recipe.name);
        }
      });
    });

    // Process extra recipes
    selectedExtraRecipes.forEach((recipe) => {
      if (!recipe.ingredients) return;
      
      recipe.ingredients.forEach((ingredient) => {
        const cleanIngredient = ingredient.toLowerCase().trim();
        if (!ingredientMap[cleanIngredient]) {
          ingredientMap[cleanIngredient] = {
            original: ingredient,
            count: 0,
            recipes: []
          };
        }
        ingredientMap[cleanIngredient].count += 1; // Default 1x for extra recipes
        if (!ingredientMap[cleanIngredient].recipes.includes(recipe.name)) {
          ingredientMap[cleanIngredient].recipes.push(recipe.name);
        }
      });
    });

    // Group by category
    const categorized = {
      'Produce': [],
      'Meat & Poultry': [],
      'Dairy & Eggs': [],
      'Pantry': [],
      'Other': []
    };

    Object.entries(ingredientMap).forEach(([key, data]) => {
      const item = { key, ...data };
      const lower = key.toLowerCase();

      if (lower.match(/lettuce|tomato|onion|pepper|carrot|celery|cucumber|spinach|kale|fruit|vegetable|potato|garlic|herb|basil|parsley/)) {
        categorized['Produce'].push(item);
      } else if (lower.match(/chicken|beef|pork|turkey|steak|fish|salmon|meat|poultry|bacon|sausage|ham/)) {
        categorized['Meat & Poultry'].push(item);
      } else if (lower.match(/milk|cheese|yogurt|butter|cream|egg/)) {
        categorized['Dairy & Eggs'].push(item);
      } else if (lower.match(/flour|sugar|salt|pepper|oil|rice|pasta|spice|sauce|stock|broth|canned|bean|lentil|vinegar|soy/)) {
        categorized['Pantry'].push(item);
      } else {
        categorized['Other'].push(item);
      }
    });

    return categorized;
  }, [selectedMeals, selectedExtraRecipes, recipes]);

  const toggleItem = (key) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleRecipeExpand = (index) => {
    setExpandedRecipes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const downloadList = () => {
    let text = '🛒 Shopping List\n\n';
    
    text += '=== BY RECIPE ===\n\n';
    shoppingByRecipe.forEach((group) => {
      text += `${group.recipeName}\n`;
      text += `${group.mealType} on ${new Date(group.mealDate).toLocaleDateString()}\n`;
      group.ingredients.forEach(ingredient => {
        text += `  - ${ingredient}\n`;
      });
      text += '\n';
    });

    text += '\n=== CONSOLIDATED LIST ===\n\n';
    Object.entries(shoppingList).forEach(([category, items]) => {
      if (items.length > 0) {
        text += `${category}\n`;
        items.forEach((item) => {
          const check = checkedItems[item.key] ? '✓' : '○';
          text += `  ${check} ${item.original}`;
          if (item.recipes.length > 1) {
            text += ` (${item.recipes.length} recipes)`;
          }
          text += '\n';
        });
        text += '\n';
      }
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalItems = Object.values(shoppingList).reduce((sum, items) => sum + items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto"
      >
        {/* Premium gate */}
        {!currentUser?.is_premium ? (
          <div className="relative py-8">
            <div className="blur-sm pointer-events-none select-none space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl p-4 flex gap-3 items-center">
                  <div className="w-5 h-5 rounded bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 py-8 bg-white rounded-2xl shadow-lg border border-[#c5d9c9] max-w-xs mx-auto">
                <span className="text-4xl mb-3 block">🔒</span>
                <h3 className="text-[#6b9b76] font-bold text-lg mb-1">Shopping List — Premium</h3>
                <p className="text-gray-500 text-sm mb-4">Upgrade to generate shopping lists from your meal plans.</p>
                <Button onClick={onClose} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl w-full">
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Header */}
        <div className={`space-y-4 mb-6 ${!currentUser?.is_premium ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#6b9b76]">Shopping List</h3>
              <p className="text-sm text-gray-600">
                {checkedCount} of {totalItems} items checked
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadList}
                variant="outline"
                size="icon"
                className="border-2 border-[#6b9b76]"
              >
                <Download className="w-4 h-4 text-[#6b9b76]" />
              </Button>
              <Button onClick={onClose} variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setViewMode('selection')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'selection'
                  ? 'bg-white text-[#6b9b76] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Select Recipes
            </button>
            <button
              onClick={() => setViewMode('consolidated')}
              disabled={selectedPlanIds.size === 0 && selectedRecipeIds.size === 0}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'consolidated'
                  ? 'bg-white text-[#6b9b76] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
              }`}
            >
              Shopping List
            </button>
            <button
              onClick={() => setViewMode('by-recipe')}
              disabled={selectedPlanIds.size === 0 && selectedRecipeIds.size === 0}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'by-recipe'
                  ? 'bg-white text-[#6b9b76] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
              }`}
            >
              By Recipe
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                viewMode === 'history'
                  ? 'bg-white text-[#6b9b76] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content — only show for premium */}
        {/* Selection Mode */}
        {currentUser?.is_premium && viewMode === 'selection' && (
          <div className="space-y-8">
            {/* Meal Plan Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-[#5a6f60]">Weekly Meal Plan</h4>
                <Button
                  onClick={() => {
                    if (selectedPlanIds.size === validPlanIds.length) setSelectedPlanIds(new Set());
                    else setSelectedPlanIds(new Set(validPlanIds));
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-sm text-[#6b9b76]"
                >
                  {selectedPlanIds.size === validPlanIds.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              {validPlanIds.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No meals planned with saved recipes yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mealPlans.filter(p => validPlanIds.includes(p.id)).map((plan) => {
                    const recipe = recipes.find(r => r.id === plan.recipe_id);
                    const isSelected = selectedPlanIds.has(plan.id);
                    return (
                      <div
                        key={plan.id}
                        onClick={() => togglePlanSelection(plan.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#f0f9f2] border-[#6b9b76]'
                            : 'bg-white border-[#c5d9c9] hover:border-[#a3c4a8]'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#6b9b76]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{recipe?.name}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(plan.date), 'EEE, MMM d')} • {plan.meal_type}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Saved Recipes Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-[#5a6f60]">Extra Recipes</h4>
                <p className="text-sm text-gray-500">{selectedRecipeIds.size} selected</p>
              </div>
              {recipes.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No saved recipes.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {recipes.map((recipe) => {
                    const isSelected = selectedRecipeIds.has(recipe.id);
                    return (
                      <div
                        key={recipe.id}
                        onClick={() => toggleRecipeSelection(recipe.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#f0f9f2] border-[#6b9b76]'
                            : 'bg-white border-[#c5d9c9] hover:border-[#a3c4a8]'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#6b9b76]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{recipe.name}</p>
                          <p className="text-xs text-gray-500 truncate">{recipe.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 pt-4 bg-white border-t mt-6">
              <Button
                onClick={() => setViewMode('consolidated')}
                disabled={selectedPlanIds.size === 0 && selectedRecipeIds.size === 0}
                className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
              >
                Generate Shopping List ({selectedPlanIds.size + selectedRecipeIds.size} Items)
              </Button>
            </div>
          </div>
        )}

        {/* Shopping List Views */}
        {viewMode === 'history' ? (
          <div className="space-y-3">
            {mealPlans.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No meal history yet.</p>
            ) : (
              mealPlans.map((plan, index) => {
                const recipe = recipes.find(r => r.id === plan.recipe_id);
                return (
                <div key={plan.id} className="border-2 border-[#c5d9c9] rounded-xl overflow-hidden bg-white">
                  <div className="w-full p-4 bg-[#f5f5f5] flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{plan.recipe_name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {format(new Date(plan.date), 'EEE, MMM d')} · {plan.meal_type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReaddToMealPlan(plan)}
                      disabled={readdingId === plan.id}
                      className="flex items-center gap-1 text-xs bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-2.5 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-60"
                      title="Add to today's meal plan"
                    >
                      <Plus className="w-3 h-3" />
                      Add Again
                    </button>
                  </div>
                  <div className="px-4 pb-4 bg-white">
                    {recipe?.ingredients?.length > 0 ? (
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c5d9c9] mt-1.5 shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No ingredients on record.</p>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        ) : viewMode === 'by-recipe' ? (
          <div className="space-y-3">
            {shoppingByRecipe.map((group, index) => (
              <div key={index} className="border-2 border-[#c5d9c9] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleRecipeExpand(index)}
                  className="w-full p-4 bg-[#f5e6dc] hover:bg-[#f0dfd0] transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{group.recipeName}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {group.details}
                    </p>
                  </div>
                  {expandedRecipes[index] ? (
                    <ChevronUp className="w-5 h-5 text-[#6b9b76]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#6b9b76]" />
                  )}
                </button>
                {expandedRecipes[index] && (
                  <div className="p-4 bg-white space-y-2">
                    {group.ingredients.map((ingredient, ingIndex) => {
                      const itemId = `recipe-${index}-${ingIndex}`;
                      const isChecked = checkedItems[itemId];
                      
                      return (
                        <button
                          key={ingIndex}
                          onClick={() => toggleItem(itemId)}
                          className={`w-full text-left p-2 rounded-lg border transition-all flex items-center gap-3 ${
                            isChecked
                              ? 'bg-gray-50 border-gray-300 opacity-60'
                              : 'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#6b9b76] flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {ingredient}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(shoppingList).map(([category, items]) => {
              if (items.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="text-lg font-semibold text-[#6b9b76] mb-3 pb-2 border-b-2 border-[#c5d9c9]">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => toggleItem(item.key)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                          checkedItems[item.key]
                            ? 'bg-gray-50 border-gray-300 opacity-60'
                            : 'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'
                        }`}
                      >
                        {checkedItems[item.key] ? (
                          <CheckSquare className="w-5 h-5 text-[#6b9b76] flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium ${checkedItems[item.key] ? 'line-through text-gray-500' : 'text-[#5a6f60]'}`}>
                            {item.original}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.recipes.length > 1 ? `Used in ${item.recipes.length} recipes: ` : 'Used in: '}
                            {item.recipes.join(', ')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default React.memo(ShoppingList);