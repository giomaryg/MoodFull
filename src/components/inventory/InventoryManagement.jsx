import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Package, Sparkles, Loader2, AlertTriangle, ChefHat, Camera, Mic, PlusCircle, Barcode, Edit2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PantryAnalytics from './PantryAnalytics';
import SmartRestock from './SmartRestock';

export default function InventoryManagement({ onGenerateFromExpiring }) {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState('list');
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: '', category: 'Pantry', min_stock: 0, expiry_date: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hideExpiringAlert, setHideExpiringAlert] = useState(false);
  const [restockSuggestions, setRestockSuggestions] = useState([]);
  const [isGeneratingRestock, setIsGeneratingRestock] = useState(false);
  const fileInputRef = React.useRef(null);
  const pantryFileInputRef = React.useRef(null);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 50)
  });

  const addMutation = useMutation({
    mutationFn: (data) => {
      base44.analytics.track({
        eventName: "inventory_updated",
        properties: { item_name: data.name, category: data.category }
      });
      return base44.entities.Ingredient.create(data);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousInventory = queryClient.getQueryData(['inventory']);
      queryClient.setQueryData(['inventory'], old => [{...data, id: 'temp-id-' + Date.now()}, ...(old || [])]);
      return { previousInventory };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['inventory'], context.previousInventory);
      toast.error('Failed to add ingredient');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onSuccess: () => {
      setNewItem({ name: '', quantity: 1, unit: '', category: 'Pantry', min_stock: 0, expiry_date: '' });
      toast.success('Ingredient added to inventory');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }) => base44.entities.Ingredient.update(id, { category }),
    onMutate: async ({ id, category }) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousInventory = queryClient.getQueryData(['inventory']);
      queryClient.setQueryData(['inventory'], old => old?.map(item => item.id === id ? { ...item, category } : item));
      return { previousInventory };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['inventory'], context.previousInventory);
      toast.error('Failed to update category');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onSuccess: () => {
      toast.success('Category updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ingredient.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['inventory'] });
      const previousInventory = queryClient.getQueryData(['inventory']);
      queryClient.setQueryData(['inventory'], old => old?.filter(item => item.id !== id));
      return { previousInventory };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['inventory'], context.previousInventory);
      toast.error('Failed to remove ingredient');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onSuccess: () => {
      toast.success('Ingredient removed');
    }
  });

  const handlePantryScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.success('Scanning pantry with AI...');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image of a pantry or fridge. Identify all the visible grocery items. For each item, provide the product name, estimated quantity, unit, standard grocery category (Produce, Dairy, Meat, Pantry, Spices, Frozen, Other), and estimated shelf life in days from today assuming proper storage. Return a JSON object with an 'items' array containing these details.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  category: { type: "string", enum: ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"] },
                  estimated_shelf_life_days: { type: "number" }
                }
              }
            }
          }
        }
      });
      
      if (response.items && response.items.length > 0) {
        const itemsToCreate = response.items.map(item => {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + (item.estimated_shelf_life_days || 14));
          return {
            name: item.name || 'Unknown Item',
            quantity: item.quantity || 1,
            unit: item.unit || 'units',
            category: item.category || 'Pantry',
            expiry_date: expiryDate.toISOString().split('T')[0],
            min_stock: 0
          };
        });
        
        await base44.entities.Ingredient.bulkCreate(itemsToCreate);
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        toast.success(`Pantry scan complete! Added ${itemsToCreate.length} items to inventory.`);
      } else {
        toast.error('No items found in the image.');
      }
    } catch (err) {
      toast.error('Failed to scan pantry image. Please try again.');
    } finally {
      setIsScanning(false);
      if (pantryFileInputRef.current) pantryFileInputRef.current.value = '';
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.success('Scanning item with AI...');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the main grocery ingredient from this image or barcode. Identify the product name, estimated quantity, unit, standard grocery category (Produce, Dairy, Meat, Pantry, Spices, Frozen, Other), and estimated shelf life in days from today assuming proper storage. Provide JSON.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" },
            category: { type: "string", enum: ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"] },
            estimated_shelf_life_days: { type: "number" }
          }
        }
      });
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (response.estimated_shelf_life_days || 14));

      addMutation.mutate({
        name: response.name || 'Unknown Item',
        quantity: response.quantity || 1,
        unit: response.unit || 'units',
        category: response.category || 'Pantry',
        expiry_date: expiryDate.toISOString().split('T')[0],
        min_stock: 0
      });
      
      toast.success(`Scan complete! Added ${response.name || 'item'} to inventory.`);
      
      // Proactively suggest recipes based on the new ingredient
      if (onGenerateFromExpiring && response.name) {
        toast.success(`Updating recipe suggestions for ${response.name}...`);
        onGenerateFromExpiring([response.name]);
      }
    } catch (err) {
      toast.error('Failed to scan image. Please enter manually.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... speak an ingredient to add.');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      toast.success(`Heard: "${transcript}". Analyzing...`);
      setIsAnalyzing(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `The user spoke this to add to their pantry inventory: "${transcript}". Identify the product name, estimated quantity (default 1), and unit. Return JSON.`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" }
            }
          }
        });
        setNewItem(prev => ({
          ...prev,
          name: response.name || '',
          quantity: response.quantity || 1,
          unit: response.unit || 'units'
        }));
        toast.success('Voice scan complete! Review details and click Add.');
      } catch (err) {
        toast.error('Failed to parse voice input.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    recognition.onerror = (event) => {
      toast.error('Voice recognition failed or was cancelled.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleQuickAdd = async (itemName) => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the grocery item: "${itemName}". Determine its standard grocery category (must be one of: Produce, Dairy, Meat, Pantry, Spices, Frozen, Other). Also estimate its typical shelf life in days from today, assuming proper storage. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"] },
            estimated_shelf_life_days: { type: "number" }
          }
        }
      });
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (response.estimated_shelf_life_days || 14));
      
      addMutation.mutate({
        name: itemName,
        quantity: 1,
        unit: 'units',
        min_stock: 0,
        category: response.category || 'Pantry',
        expiry_date: expiryDate.toISOString().split('T')[0]
      });
    } catch (err) {
      addMutation.mutate({
        name: itemName,
        quantity: 1,
        unit: 'units',
        min_stock: 0,
        category: 'Pantry'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    setIsAnalyzing(true);
    try {
      // Use AI to categorize and predict expiration
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the grocery item: "${newItem.name}". Determine its standard grocery category (must be one of: Produce, Dairy, Meat, Pantry, Spices, Frozen, Other). Also estimate its typical shelf life in days from today, assuming proper storage. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"] },
            estimated_shelf_life_days: { type: "number" }
          }
        }
      });
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (response.estimated_shelf_life_days || 14));
      
      addMutation.mutate({
        ...newItem,
        category: response.category || 'Pantry',
        expiry_date: newItem.expiry_date || expiryDate.toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
      // Fallback
      addMutation.mutate(newItem);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getExpiringSoon = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return inventory.filter(item => {
      if (!item.expiry_date) return false;
      const exp = new Date(item.expiry_date);
      return exp <= nextWeek;
    });
  };

  const expiringItems = getExpiringSoon();

  const generateRestockSuggestions = async () => {
    setIsGeneratingRestock(true);
    try {
      const inventoryNames = inventory.map(i => i.name).join(', ');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this current pantry inventory: ${inventoryNames}. What are 5 common pantry staples this user is missing or low on that they should restock?`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setRestockSuggestions(response.suggestions || []);
      toast.success("Generated restock suggestions!");
    } catch (e) {
      toast.error("Failed to generate restock suggestions.");
    }
    setIsGeneratingRestock(false);
  };

  const recentlyAddedItems = React.useMemo(() => {
    return [...inventory]
      .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
      .slice(0, 5);
  }, [inventory]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
          <Package className="w-8 h-8" /> My Pantry
        </h2>
        <p className="text-gray-600">Track your ingredients to get smarter recipe suggestions</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <Button 
          onClick={() => pantryFileInputRef.current?.click()}
          disabled={isScanning}
          className="bg-gradient-to-r from-[#6b9b76] to-[#5a8a65] text-white shadow-md hover:shadow-lg transition-all px-6 py-6 rounded-xl font-bold flex items-center gap-3 w-full sm:w-auto"
        >
          {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          Scan Pantry / Fridge
        </Button>
        <div className="bg-gray-100 p-1 rounded-lg inline-flex shadow-inner w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-6 py-2 min-h-[44px] rounded-md text-sm font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-[#6b9b76] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Inventory List
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-6 py-2 min-h-[44px] rounded-md text-sm font-bold transition-all ${
              viewMode === 'analytics'
                ? 'bg-white text-[#6b9b76] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Analytics & Insights
          </button>
          <button
            onClick={() => setViewMode('restock')}
            className={`px-6 py-2 min-h-[44px] rounded-md text-sm font-bold transition-all ${
              viewMode === 'restock'
                ? 'bg-white text-[#6b9b76] shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Smart Restock
          </button>
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <PantryAnalytics 
          onGenerateShoppingList={(items) => {
            const existing = JSON.parse(localStorage.getItem('shoppingListCustomItems')) || [];
            const newItems = items.map(i => ({ id: `ai-suggested-${Date.now()}-${Math.random()}`, name: `${i.item} (${i.reason})` }));
            localStorage.setItem('shoppingListCustomItems', JSON.stringify([...existing, ...newItems]));
            toast.success(`Added ${items.length} AI suggestions to your Shopping List!`);
          }} 
        />
      ) : viewMode === 'restock' ? (
        <SmartRestock 
          inventory={inventory}
          mealPlans={mealPlans}
          onGenerateShoppingList={(items) => {
            const existing = JSON.parse(localStorage.getItem('shoppingListCustomItems')) || [];
            const newItems = items.map(i => ({ id: `ai-suggested-${Date.now()}-${Math.random()}`, name: `${i.item} (${i.reason})` }));
            localStorage.setItem('shoppingListCustomItems', JSON.stringify([...existing, ...newItems]));
            toast.success(`Added ${items.length} AI suggestions to your Shopping List!`);
          }}
        />
      ) : (
        <>
          <div className="bg-white p-6 rounded-2xl border-2 border-[#c5d9c9] shadow-sm">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] w-full">
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Ingredient Name</label>
            <Input 
              placeholder="e.g. Tomatoes, Chicken Breast..." 
              value={newItem.name} 
              onChange={e => setNewItem({...newItem, name: e.target.value})}
              className="border-2 focus:border-[#6b9b76]"
            />
          </div>
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="w-20">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Qty</label>
              <Input 
                type="number" 
                min="0.1"
                step="0.1" 
                value={newItem.quantity} 
                onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="w-20">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Min</label>
              <Input 
                type="number" 
                min="0"
                step="0.1" 
                title="Minimum stock level"
                value={newItem.min_stock} 
                onChange={e => setNewItem({...newItem, min_stock: parseFloat(e.target.value) || 0})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Unit</label>
              <Input 
                placeholder="pcs, cups" 
                value={newItem.unit} 
                onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="w-32">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Expiry</label>
              <Input 
                type="date"
                value={newItem.expiry_date} 
                onChange={e => setNewItem({...newItem, expiry_date: e.target.value})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="flex gap-2 h-10 mt-auto">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                onChange={handleScan}
                className="hidden" 
              />
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={pantryFileInputRef}
                onChange={handlePantryScan}
                className="hidden" 
              />
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                variant="outline"
                className="border-2 border-[#6b9b76] text-[#6b9b76] px-3"
                title="Scan Barcode / Single Item"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Barcode className="w-4 h-4" />}
              </Button>
              <Button 
                type="button" 
                onClick={() => pantryFileInputRef.current?.click()}
                disabled={isScanning}
                variant="outline"
                className="border-2 border-[#6b9b76] text-[#6b9b76] px-3"
                title="Scan Full Pantry / Fridge"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </Button>
              <Button 
                type="button" 
                onClick={handleVoiceInput}
                disabled={isListening}
                variant="outline"
                className={`border-2 px-3 ${isListening ? 'border-red-500 text-red-500 animate-pulse' : 'border-[#6b9b76] text-[#6b9b76]'}`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button type="submit" className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white whitespace-nowrap" disabled={addMutation.isPending || isAnalyzing || !newItem.name}>
                {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Add Item'}</span>
                <span className="sm:hidden">{isAnalyzing ? '...' : 'Add'}</span>
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Quick Add Staples</p>
          <div className="flex flex-wrap gap-2">
            {['Milk', 'Eggs', 'Butter', 'Bread', 'Cheese', 'Onion', 'Garlic', 'Chicken Breast', 'Apples', 'Olive Oil'].map(item => (
              <button
                key={item}
                onClick={() => handleQuickAdd(item)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 hover:bg-[#f0f9f2] hover:text-[#6b9b76] border border-gray-200 hover:border-[#6b9b76] text-gray-600 px-3 py-2 min-h-[44px] rounded-full transition-colors disabled:opacity-50"
              >
                <PlusCircle className="w-3 h-3" />
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {recentlyAddedItems.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6 mb-6">
          <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            What's New in Pantry
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentlyAddedItems.map(item => (
              <span key={item.id} className="text-xs bg-white text-blue-700 px-2.5 py-1.5 rounded-md font-medium border border-blue-200 shadow-sm flex items-center gap-1.5">
                {item.name} <span className="text-blue-400">({item.quantity} {item.unit})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5" />
              Low Stock & AI Restock Suggestions
            </h3>
            <p className="text-sm text-red-700">See what you're running low on or ask AI what you might be missing.</p>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" onClick={generateRestockSuggestions} disabled={isGeneratingRestock}>
            {isGeneratingRestock ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
            Suggest Restocks
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {inventory.filter(i => i.min_stock > 0 && i.quantity < i.min_stock).map(item => (
            <span key={item.id} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md font-medium border border-red-200">
              {item.name} ({item.quantity} / {item.min_stock} {item.unit})
            </span>
          ))}
          {restockSuggestions.map((item, idx) => (
            <span key={idx} className="text-xs bg-white text-red-700 px-2.5 py-1.5 rounded-md font-medium border border-red-300 border-dashed flex items-center gap-1 cursor-pointer hover:bg-red-50 shadow-sm" onClick={() => handleQuickAdd(item)} title="Click to Add">
              {item} <Plus className="w-3 h-3" />
            </span>
          ))}
          {inventory.filter(i => i.min_stock > 0 && i.quantity < i.min_stock).length === 0 && restockSuggestions.length === 0 && (
            <span className="text-xs text-red-600/70 italic">All min-stock levels met. Generate suggestions to see what to restock.</span>
          )}
        </div>
      </div>

      {expiringItems.length > 0 && !hideExpiringAlert && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6 mb-6 relative">
          <button 
            onClick={() => setHideExpiringAlert(true)}
            className="absolute top-2 right-2 text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pr-8">
            <div>
              <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5" />
                Expiring Soon ({expiringItems.length})
              </h3>
              <p className="text-sm text-amber-700">These items might go bad soon. Let's use them up!</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {expiringItems.map(item => (
                  <span key={item.id} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-medium border border-amber-200">
                    {item.name} ({new Date(item.expiry_date).toLocaleDateString()})
                  </span>
                ))}
              </div>
            </div>
            {onGenerateFromExpiring && (
              <Button 
                onClick={() => onGenerateFromExpiring(expiringItems.map(i => i.name))}
                className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap shadow-sm w-full sm:w-auto"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Generate Recipes
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-[#c5d9c9] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
            <p>Your pantry is empty.</p>
            <p className="text-sm">Add some ingredients above to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0ede4]">
            {inventory.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-[10px] uppercase tracking-wider bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-2 min-h-[44px] rounded-full transition-colors cursor-pointer flex items-center gap-1">
                          {item.category || 'Uncategorized'}
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"].map(cat => (
                          <DropdownMenuItem 
                            key={cat}
                            onClick={() => {
                              updateCategoryMutation.mutate({ id: item.id, category: cat });
                            }}
                          >
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-[#6b9b76] font-medium">{item.quantity} {item.unit}</p>
                    {item.quantity <= 0 ? (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">Out of Stock</span>
                    ) : item.min_stock > 0 && item.quantity <= item.min_stock ? (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">Low Stock</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">In Stock</span>
                    )}
                    {item.min_stock > 0 && (
                      <p className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.quantity < item.min_stock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        Min: {item.min_stock}
                      </p>
                    )}
                    {item.expiry_date && (
                      <p className={`text-xs ${new Date(item.expiry_date) < new Date(new Date().setDate(new Date().getDate() + 7)) ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                        Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}