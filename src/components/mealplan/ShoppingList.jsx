import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShoppingList({ mealPlans, recipes, onClose }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [viewMode, setViewMode] = useState('consolidated'); // 'consolidated' or 'by-recipe'

  const shoppingByRecipe = useMemo(() => {
    return mealPlans.map((plan) => {
      const recipe = recipes.find((r) => r.id === plan.recipe_id);
      return {
        planId: plan.id,
        recipeName: recipe?.name || 'Unknown Recipe',
        mealDate: plan.date,
        mealType: plan.meal_type,
        ingredients: recipe?.ingredients || []
      };
    });
  }, [mealPlans, recipes]);

  const shoppingList = useMemo(() => {
    const ingredientMap = {};

    mealPlans.forEach((plan) => {
      const recipe = recipes.find((r) => r.id === plan.recipe_id);
      if (!recipe || !recipe.ingredients) return;

      const servingMultiplier = (plan.servings || recipe.servings) / recipe.servings;

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

      if (lower.match(/lettuce|tomato|onion|pepper|carrot|celery|cucumber|spinach|kale|fruit|vegetable/)) {
        categorized['Produce'].push(item);
      } else if (lower.match(/chicken|beef|pork|turkey|steak|fish|salmon|meat|poultry/)) {
        categorized['Meat & Poultry'].push(item);
      } else if (lower.match(/milk|cheese|yogurt|butter|cream|egg/)) {
        categorized['Dairy & Eggs'].push(item);
      } else if (lower.match(/flour|sugar|salt|pepper|oil|rice|pasta|spice|sauce|stock|broth/)) {
        categorized['Pantry'].push(item);
      } else {
        categorized['Other'].push(item);
      }
    });

    return categorized;
  }, [mealPlans, recipes]);

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
        {/* Header */}
        <div className="space-y-4 mb-6">
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
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('consolidated')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'consolidated'
                  ? 'bg-white text-[#6b9b76] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Consolidated
            </button>
            <button
              onClick={() => setViewMode('by-recipe')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'by-recipe'
                  ? 'bg-white text-[#6b9b76] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Recipe
            </button>
          </div>
        </div>

        {/* Shopping List */}
        {totalItems === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No meals planned yet. Add some meals to generate a shopping list!</p>
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
                      {group.mealType} • {new Date(group.mealDate).toLocaleDateString()}
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