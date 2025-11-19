import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShoppingList({ mealPlans, recipes, onClose }) {
  const [checkedItems, setCheckedItems] = useState({});

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

  const downloadList = () => {
    let text = '🛒 Shopping List\n\n';
    Object.entries(shoppingList).forEach(([category, items]) => {
      if (items.length > 0) {
        text += `${category}\n`;
        items.forEach((item) => {
          const check = checkedItems[item.key] ? '✓' : '○';
          text += `  ${check} ${item.original}\n`;
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
        <div className="flex items-center justify-between mb-6">
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

        {/* Shopping List */}
        {totalItems === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No meals planned yet. Add some meals to generate a shopping list!</p>
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
                            Used in: {item.recipes.join(', ')}
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