import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Download, CheckSquare, Square, ChevronDown, ChevronUp, Plus, ShoppingCart, Sparkles, Loader2, PackagePlus, Tag, FileText, Barcode, MoreHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
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
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shoppingListCheckedItems')) || {}; } catch { return {}; }
  });
  const [customItems, setCustomItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shoppingListCustomItems')) || []; } catch { return []; }
  });
  const [newCustomItem, setNewCustomItem] = useState('');
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [viewMode, setViewMode] = useState('selection'); // 'selection', 'consolidated', 'by-recipe', or 'history'

  const [itemCategories, setItemCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shoppingListItemCategories')) || {}; } catch { return {}; }
  });
  const fileInputRef = React.useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    localStorage.setItem('shoppingListItemCategories', JSON.stringify(itemCategories));
  }, [itemCategories]);

  useEffect(() => {
    localStorage.setItem('shoppingListCheckedItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem('shoppingListCustomItems', JSON.stringify(customItems));
  }, [customItems]);
  
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

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

    const fromCustom = customItems.length > 0 ? [{
      id: 'custom-items-group',
      recipeName: 'Custom Items',
      details: 'Added Manually',
      ingredients: customItems.map(c => c.name),
      isCustomGroup: true,
      servings: null
    }] : [];

    return [...fromPlans, ...fromRecipes, ...fromCustom];
  }, [selectedMeals, selectedExtraRecipes, recipes, customItems]);

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

    const AISLES = [
      'Produce (Aisle)', 'Meat & Seafood (Aisle)', 'Dairy & Eggs (Aisle)', 
      'Bakery (Aisle)', 'Frozen (Aisle)', 'Pantry (Aisle)', 
      'Beverages (Aisle)', 'Snacks (Aisle)', 'Household (Aisle)', 'Other'
    ];

    // Group by category
    const categorized = {
      'Produce (Aisle)': [],
      'Meat & Seafood (Aisle)': [],
      'Dairy & Eggs (Aisle)': [],
      'Bakery (Aisle)': [],
      'Frozen (Aisle)': [],
      'Pantry (Aisle)': [],
      'Beverages (Aisle)': [],
      'Snacks (Aisle)': [],
      'Household (Aisle)': [],
      'Custom Items': [],
      'Other': []
    };

    Object.entries(ingredientMap).forEach(([key, data]) => {
      const item = { key, ...data };
      const lower = key.toLowerCase();

      if (itemCategories[item.original] && categorized[itemCategories[item.original]]) {
        categorized[itemCategories[item.original]].push(item);
      } else if (lower.match(/lettuce|tomato|onion|pepper|carrot|celery|cucumber|spinach|kale|fruit|vegetable|potato|garlic|herb|basil|parsley/)) {
        categorized['Produce (Aisle)'].push(item);
      } else if (lower.match(/chicken|beef|pork|turkey|steak|fish|salmon|meat|poultry|bacon|sausage|ham/)) {
        categorized['Meat & Seafood (Aisle)'].push(item);
      } else if (lower.match(/milk|cheese|yogurt|butter|cream|egg/)) {
        categorized['Dairy & Eggs (Aisle)'].push(item);
      } else if (lower.match(/bread|bun|roll|bagel|croissant|pastry/)) {
        categorized['Bakery (Aisle)'].push(item);
      } else if (lower.match(/frozen|ice cream|pizza/)) {
        categorized['Frozen (Aisle)'].push(item);
      } else if (lower.match(/flour|sugar|salt|pepper|oil|rice|pasta|spice|sauce|stock|broth|canned|bean|lentil|vinegar|soy/)) {
        categorized['Pantry (Aisle)'].push(item);
      } else {
        categorized['Other'].push(item);
      }
    });

    customItems.forEach((item) => {
      if (itemCategories[item.name] && categorized[itemCategories[item.name]]) {
        categorized[itemCategories[item.name]].push({
          key: item.id,
          original: item.name,
          count: 1,
          recipes: ['Added Manually']
        });
      } else {
        categorized['Custom Items'].push({
          key: item.id,
          original: item.name,
          count: 1,
          recipes: ['Added Manually']
        });
      }
    });

    if (inventory && inventory.length > 0) {
      const lowStockItems = inventory.filter(i => i.min_stock > 0 && i.quantity < i.min_stock);
      if (lowStockItems.length > 0) {
        categorized['Restock Needed'] = [];
        lowStockItems.forEach(item => {
          categorized['Restock Needed'].push({
            key: `restock-${item.id}`,
            original: item.name,
            count: item.min_stock - item.quantity,
            recipes: ['Low Inventory']
          });
        });
      }
    }

    return categorized;
  }, [selectedMeals, selectedExtraRecipes, recipes, customItems, inventory]);

  const [aiInsights, setAiInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const getAIInsights = async () => {
    setIsGeneratingInsights(true);
    try {
       const itemsToAnalyze = Object.values(shoppingList).flat().map(i => i.original);
       const inventoryNames = inventory.map(i => i.name).join(', ');
       const upcomingMeals = mealPlans.filter(m => new Date(m.date) >= new Date()).slice(0, 7).map(m => m.recipe_name).join(', ');

       const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this shopping list: ${itemsToAnalyze.join(', ')}.
Current Pantry Inventory: ${inventoryNames || 'None'}
Upcoming Meals (next 7 days): ${upcomingMeals || 'None'}

1. Categorize these items into logical grocery aisles (e.g. Produce, Meat, Dairy, Pantry, Frozen, etc) to optimize for grocery store layout.
2. Estimate the total cost in USD and provide a breakdown per category to optimize for cost-efficiency.
3. Suggest 2-3 smart substitutions specifically based on what they already have in their Pantry Inventory.
4. Suggest 2-3 proactive items they might need for their Upcoming Meals but forgot to add to the list.
5. Suggest item-specific bulk buying opportunities or promotions based on these items.
Return JSON.`,
          response_json_schema: {
             type: "object",
             properties: {
                categories: {
                   type: "array",
                   items: {
                      type: "object",
                      properties: {
                         categoryName: { type: "string" },
                         items: { type: "array", items: { type: "string" } }
                      }
                   }
                },
                categoryCosts: {
                   type: "array",
                   items: {
                      type: "object",
                      properties: {
                         category: { type: "string" },
                         cost: { type: "string" }
                      }
                   }
                },
                itemCosts: {
                   type: "array",
                   items: {
                      type: "object",
                      properties: {
                         item: { type: "string" },
                         estimatedCost: { type: "string" }
                      }
                   }
                },
                estimatedTotalCost: { type: "string" },
                substitutions: { type: "array", items: { type: "string" } },
                proactiveSuggestions: { type: "array", items: { type: "string" } },
                bulkOpportunities: { type: "array", items: { type: "string" } }
             }
          }
       });
       setAiInsights(response);
    } catch (e) {
       toast.error("Failed to generate AI insights");
    }
    setIsGeneratingInsights(false);
  };

  const { displayCategories, inPantryItems } = useMemo(() => {
    const flat = Object.values(shoppingList).flat();
    const result = [];
    
    if (aiInsights && aiInsights.categories) {
      aiInsights.categories.forEach(cat => {
        const catItems = cat.items.map(orig => flat.find(f => f.original === orig)).filter(Boolean);
        if (catItems.length > 0) {
          result.push({ category: cat.categoryName, items: catItems });
        }
      });
      const aiMissed = flat.filter(f => !aiInsights.categories.some(c => c.items.includes(f.original)));
      if (aiMissed.length > 0) result.push({ category: 'Other', items: aiMissed });
    } else {
      Object.entries(shoppingList).forEach(([category, items]) => {
        if (items.length > 0) result.push({ category, items });
      });
    }

    const toBuy = result.map(c => ({
      category: c.category,
      items: c.items.filter(item => !checkedItems[item.key])
    })).filter(c => c.items.length > 0);

    const pantry = flat.filter(item => checkedItems[item.key]);

    return { displayCategories: toBuy, inPantryItems: pantry };
  }, [shoppingList, aiInsights, checkedItems]);

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

  const downloadListPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(18);
      doc.setTextColor(107, 155, 118);
      doc.text('My Grocery List', 20, y);
      y += 15;
      
      displayCategories.forEach(({ category, items }) => {
        if (items.length > 0) {
          doc.setFontSize(14);
          doc.setTextColor(90, 111, 96);
          doc.setFont(undefined, 'bold');
          doc.text(category, 20, y);
          y += 8;
          
          doc.setFontSize(11);
          doc.setTextColor(50, 50, 50);
          doc.setFont(undefined, 'normal');
          items.forEach((item) => {
            const isChecked = checkedItems[item.key];
            doc.text(`${isChecked ? '[X]' : '[ ]'} ${item.original}`, 25, y);
            y += 6;
            
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
          });
          y += 5;
        }
      });

      if (inPantryItems.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(90, 111, 96);
        doc.setFont(undefined, 'bold');
        doc.text('Already In Pantry', 20, y);
        y += 8;
        doc.setFontSize(11);
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'normal');
        inPantryItems.forEach((item) => {
          doc.text(`[X] ${item.original}`, 25, y);
          y += 6;
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
        });
      }

      doc.save('shopping-list.pdf');
      toast.success('PDF Downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF. Make sure jspdf is installed.');
    }
  };

  const downloadList = () => {
    let text = '🛒 Shopping List\n\n';
    
    text += '=== BY MEAL ===\n\n';
    shoppingByRecipe.forEach((group) => {
      text += `${group.recipeName}\n`;
      text += `${group.details}\n`;
      group.ingredients.forEach(ingredient => {
        text += `  - ${ingredient}\n`;
      });
      text += '\n';
    });

    text += '\n=== TO BUY ===\n\n';
    displayCategories.forEach(({ category, items }) => {
      if (items.length > 0) {
        text += `${category}\n`;
        items.forEach((item) => {
          text += `  ○ ${item.original}`;
          if (item.recipes.length > 1) {
            text += ` (${item.recipes.length} recipes)`;
          }
          text += '\n';
        });
        text += '\n';
      }
    });

    if (inPantryItems.length > 0) {
       text += '\n=== ALREADY IN PANTRY ===\n\n';
       inPantryItems.forEach((item) => {
          text += `  ✓ ${item.original}\n`;
       });
    }

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

  useEffect(() => {
    if (inventory.length > 0) {
      const newChecked = { ...checkedItems };
      let updated = false;

      const checkMatch = (ingredient) => {
        return inventory.some(invItem => ingredient.toLowerCase().includes(invItem.name.toLowerCase()));
      };

      Object.entries(shoppingList).forEach(([category, items]) => {
        items.forEach(item => {
          if (checkMatch(item.original) && newChecked[item.key] === undefined) {
            newChecked[item.key] = true;
            updated = true;
          }
        });
      });

      shoppingByRecipe.forEach((group, index) => {
        group.ingredients.forEach((ingredient, ingIndex) => {
          const itemId = `recipe-${index}-${ingIndex}`;
          if (checkMatch(ingredient) && newChecked[itemId] === undefined) {
            newChecked[itemId] = true;
            updated = true;
          }
        });
      });

      if (updated) setCheckedItems(newChecked);
    }
  }, [inventory, shoppingList, shoppingByRecipe, checkedItems]);

  const handleOrderGroceries = (service) => {
    toast.success(`Searching items on ${service}...`);
    const query = Object.values(shoppingList).flat().filter(i => !checkedItems[i.key]).map(i => i.original).join(' ');
    setTimeout(() => {
      let url = '';
      if (service === 'Instacart') url = `https://www.instacart.com/store/s?k=${encodeURIComponent(query)}`;
      else if (service === 'Walmart') url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
      else if (service === 'Amazon Fresh') url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=amazonfresh`;
      else if (service === 'Kroger') url = `https://www.kroger.com/search?query=${encodeURIComponent(query)}`;
      else if (service === 'Safeway') url = `https://www.safeway.com/shop/search-results.html?q=${encodeURIComponent(query)}`;
      else if (service === 'Aldi') url = `https://new.aldi.us/results?q=${encodeURIComponent(query)}`;
      else if (service === 'Costco') url = `https://www.costco.com/CatalogSearch?keyword=${encodeURIComponent(query)}`;
      else if (service === 'H-E-B') url = `https://www.heb.com/search/?q=${encodeURIComponent(query)}`;
      else if (service === 'Wegmans') url = `https://shop.wegmans.com/search?search_term=${encodeURIComponent(query)}`;
      else if (service === 'Uber Eats') url = `https://www.ubereats.com/search?q=${encodeURIComponent(query)}`;
      else if (service === 'DoorDash') url = `https://www.doordash.com/search/${encodeURIComponent(query)}/`;
      else if (service === 'Shipt') url = `https://www.shipt.com/search?q=${encodeURIComponent(query)}`;
      else if (service === 'Target') url = `https://www.target.com/s?searchTerm=${encodeURIComponent(query)}`;
      else if (service === 'Sprouts') url = `https://shop.sprouts.com/search?search_term=${encodeURIComponent(query)}`;
      else if (service === 'Whole Foods') url = `https://www.wholefoodsmarket.com/search?text=${encodeURIComponent(query)}`;
      else url = `https://www.${service.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/search?q=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }, 1500);
  };

  const [isPurchasing, setIsPurchasing] = useState(false);
  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.success('Scanning barcode / item...');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Identify the grocery product from this image or barcode. Return the product name. JSON format.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" }
          }
        }
      });
      
      if (response.name) {
        const newItem = { id: `custom-${Date.now()}-${Math.random()}`, name: response.name };
        setCustomItems(prev => [...prev, newItem]);
        toast.success(`Added ${response.name} to shopping list!`);
      }
    } catch (err) {
      toast.error('Failed to scan item.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePurchaseToPantry = async () => {
    const itemsToBuy = displayCategories.flatMap(c => c.items).filter(item => !checkedItems[item.key]);
    if (itemsToBuy.length === 0) return;
    
    setIsPurchasing(true);
    try {
      const promises = itemsToBuy.map(item => 
        base44.entities.Ingredient.create({
          name: item.original,
          quantity: item.count || 1,
          unit: 'units',
          category: 'Pantry'
        })
      );
      await Promise.all(promises);
      
      const newChecked = { ...checkedItems };
      itemsToBuy.forEach(i => newChecked[i.key] = true);
      setCheckedItems(newChecked);
      
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Added ${itemsToBuy.length} items directly to your Pantry!`);
    } catch (e) {
      toast.error("Failed to add items to pantry.");
    }
    setIsPurchasing(false);
  };

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
        className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-50"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Premium gate */}
        {(!currentUser?.is_premium && currentUser?.role !== 'admin') ? (
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
        <div className={`space-y-4 mb-6 ${(!currentUser?.is_premium && currentUser?.role !== 'admin') ? 'hidden' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#6b9b76]">Shopping List</h3>
              <p className="text-sm text-gray-600">
                {checkedCount} of {totalItems} items checked
              </p>
            </div>
            <div className="flex gap-2 mr-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={totalItems === 0 || checkedCount === totalItems}
                    className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 hidden sm:block" /> Order
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-[#c5d9c9] overflow-hidden max-h-80 overflow-y-auto">
                  {['Instacart', 'Amazon Fresh', 'Walmart', 'Target', 'Sprouts', 'Whole Foods', 'Kroger', 'Safeway', 'Aldi', 'Costco', 'H-E-B', 'Wegmans', 'Uber Eats', 'DoorDash', 'Shipt', 'Peapod', 'FreshDirect', 'Gopuff', 'Meijer', 'Publix', 'Albertsons', 'Vons', 'Jewel-Osco', 'Stop & Shop', 'Giant', 'Food Lion', 'Hannaford', 'Ralphs', 'Smith\'s', 'Fred Meyer', 'Fry\'s', 'King Soopers'].sort().map(service => (
                    <DropdownMenuItem 
                      key={service}
                      onClick={() => handleOrderGroceries(service)}
                      className="cursor-pointer hover:bg-[#f0f9f2] text-gray-700 focus:bg-[#f0f9f2] focus:text-[#6b9b76] px-4 py-2"
                    >
                      Order via {service}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-2 border-[#6b9b76] text-[#6b9b76]"
                  >
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg border border-[#c5d9c9] overflow-hidden">
                  <DropdownMenuItem onClick={downloadList} className="cursor-pointer hover:bg-[#f0f9f2] px-4 py-2">
                    <FileText className="w-4 h-4 mr-2" /> Text File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadListPDF} className="cursor-pointer hover:bg-[#f0f9f2] px-4 py-2">
                    <Download className="w-4 h-4 mr-2" /> PDF Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              By Meal
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
        {(currentUser?.is_premium || currentUser?.role === 'admin') && viewMode === 'selection' && (
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
        {(currentUser?.is_premium || currentUser?.role === 'admin') && viewMode === 'history' ? (
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
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isChecked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {ingredient}
                            </span>
                            {isChecked && (
                              <span className="text-[10px] font-medium bg-[#f0f9f2] text-[#6b9b76] px-1.5 py-0.5 rounded border border-[#6b9b76]/30">In Pantry</span>
                            )}
                          </div>
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
            {/* Add Custom Item Input */}
            <div className="flex gap-2 mb-4 bg-[#f0f9f2] p-2 sm:p-3 rounded-xl border border-[#c5d9c9]">
              <input
                type="text"
                placeholder="Add a custom item..."
                value={newCustomItem}
                onChange={(e) => setNewCustomItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCustomItem.trim()) {
                    const newItem = { id: `custom-${Date.now()}-${Math.random()}`, name: newCustomItem.trim() };
                    setCustomItems(prev => [...prev, newItem]);
                    setNewCustomItem('');
                  }
                }}
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-lg border border-[#c5d9c9] focus:outline-none focus:ring-2 focus:ring-[#6b9b76] text-sm"
              />
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                onChange={handleScan}
                className="hidden" 
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                variant="outline"
                className="border-[#c5d9c9] text-[#6b9b76] hover:bg-[#e8f0ea] px-3 bg-white shrink-0"
                title="Scan Barcode / Item"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Barcode className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => {
                  if (newCustomItem.trim()) {
                    const newItem = { id: `custom-${Date.now()}-${Math.random()}`, name: newCustomItem.trim() };
                    setCustomItems(prev => [...prev, newItem]);
                    setNewCustomItem('');
                  }
                }}
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white shrink-0 px-3 sm:px-4"
              >
                <Plus className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Add</span>
              </Button>
            </div>

            {!aiInsights && (
              <Button 
                onClick={getAIInsights} 
                disabled={isGeneratingInsights} 
                className="w-full bg-gradient-to-r from-[#6b9b76] to-[#5a8a65] text-white shadow-md hover:shadow-lg transition-all border-none py-4 sm:py-6 rounded-xl h-auto"
              >
                {isGeneratingInsights ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin shrink-0" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />}
                <span className="font-bold text-sm sm:text-lg whitespace-normal leading-tight text-center">Generate AI Shopping Insights</span>
              </Button>
            )}

            {aiInsights && (
              <div className="bg-[#f8faf8] p-5 rounded-2xl border-2 border-[#c5d9c9] mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-[#6b9b76] flex items-center gap-2">
                    <Sparkles className="w-5 h-5"/> AI Shopping Assistant
                  </h4>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Estimated Total</p>
                    <p className="font-bold text-2xl text-[#5a6f60]">{aiInsights.estimatedTotalCost}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[#5a6f60] mb-2 flex items-center gap-1.5">
                      <span>💡</span> Smart Substitutions (from Pantry)
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1.5">
                      {aiInsights.substitutions.map((sub, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6b9b76] mt-1.5 shrink-0" />
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {aiInsights.proactiveSuggestions && aiInsights.proactiveSuggestions.length > 0 && (
                    <div className="pt-3 border-t border-[#c5d9c9]/50">
                      <p className="text-sm font-bold text-[#5a6f60] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#6b9b76]" /> Proactive Additions for Meals
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        {aiInsights.proactiveSuggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6b9b76] mt-1.5 shrink-0" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.categoryCosts && (
                    <div className="pt-3 border-t border-[#c5d9c9]/50">
                      <p className="text-sm font-bold text-[#5a6f60] mb-2">Category Breakdown</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {aiInsights.categoryCosts.map((cat, i) => (
                          <div key={i} className="bg-white p-2 rounded-lg border border-[#c5d9c9] text-xs flex justify-between">
                            <span className="text-gray-600 font-medium">{cat.category}</span>
                            <span className="text-[#6b9b76] font-bold">{cat.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-[#c5d9c9]/50">
                    <p className="text-sm font-bold text-[#5a6f60] mb-2 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-blue-500" /> Bulk Opportunities & Promos
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1.5">
                      {aiInsights.bulkOpportunities?.map((deal, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{deal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {displayCategories.length > 0 && (
              <div className="flex justify-end mb-4">
                <Button 
                  onClick={handlePurchaseToPantry}
                  disabled={isPurchasing}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm w-full sm:w-auto h-auto py-2.5 px-3 sm:px-4 whitespace-normal text-left sm:text-center text-xs sm:text-sm flex items-center justify-center gap-2 leading-tight"
                >
                  {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <PackagePlus className="w-4 h-4 shrink-0" />}
                  <span className="flex-1 sm:flex-none">Mark Remaining as Purchased & Add to Pantry</span>
                </Button>
              </div>
            )}

            {displayCategories.map(({ category, items }) => (
              <div key={category}>
                <h4 className="text-lg font-semibold text-[#6b9b76] mb-3 pb-2 border-b-2 border-[#c5d9c9]">
                  {category}
                </h4>
                <div className="space-y-2">
                  {items.map((item) => {
                    const aiCost = aiInsights?.itemCosts?.find(c => c.item === item.original)?.estimatedCost;
                    return (
                    <button
                      key={item.key}
                      onClick={() => toggleItem(item.key)}
                      className="w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 bg-white border-[#c5d9c9] hover:border-[#6b9b76] group"
                    >
                      <Square className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-[#6b9b76]" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-[#5a6f60]">
                            {item.original}
                          </p>
                          {aiCost && (
                            <span className="text-xs font-semibold text-[#6b9b76] bg-[#f0f9f2] px-2 py-0.5 rounded-md border border-[#c5d9c9]">
                              {aiCost}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.recipes.length > 1 ? `Used in ${item.recipes.length} recipes: ` : 'Used in: '}
                          {item.recipes.join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#6b9b76]">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Move to Aisle</div>
                            {['Produce (Aisle)', 'Meat & Seafood (Aisle)', 'Dairy & Eggs (Aisle)', 'Bakery (Aisle)', 'Frozen (Aisle)', 'Pantry (Aisle)', 'Beverages (Aisle)', 'Snacks (Aisle)', 'Household (Aisle)', 'Other'].map(aisle => (
                              <DropdownMenuItem 
                                key={aisle} 
                                onClick={() => setItemCategories(prev => ({...prev, [item.original || item.name]: aisle}))}
                                className="text-sm cursor-pointer"
                              >
                                {aisle}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {item.key.startsWith('custom-') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomItems(prev => prev.filter(c => c.id !== item.key));
                            const newChecked = { ...checkedItems };
                            delete newChecked[item.key];
                            setCheckedItems(newChecked);
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-colors ml-2"
                          title="Remove custom item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </button>
                  )})}
                </div>
              </div>
            ))}

            {inPantryItems.length > 0 && (
              <div className="mt-10 opacity-70 hover:opacity-100 transition-opacity bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Already in Pantry ({inPantryItems.length})
                </h4>
                <div className="space-y-2">
                  {inPantryItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleItem(item.key)}
                      className="w-full text-left px-3 py-2 rounded-xl border border-transparent hover:border-gray-300 transition-all flex items-center gap-3 bg-white shadow-sm"
                    >
                      <CheckSquare className="w-4 h-4 text-[#6b9b76] flex-shrink-0" />
                      <div className="flex-1 flex items-center gap-2">
                        <p className="text-sm font-medium line-through text-gray-500">
                          {item.original}
                        </p>
                        {!item.key.startsWith('custom-') && (
                          <span className="text-[10px] font-medium bg-[#f0f9f2] text-[#6b9b76] px-1.5 py-0.5 rounded border border-[#6b9b76]/30">In Pantry</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default React.memo(ShoppingList);