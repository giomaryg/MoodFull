import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, ShoppingCart, Tag, Zap, ChevronRight, PackageCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SmartRestock({ inventory, mealPlans, onGenerateShoppingList }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const queryClient = useQueryClient();

  const updateIngredientMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Ingredient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const handleUpdatePreference = (id, field, value) => {
    updateIngredientMutation.mutate({ id, data: { [field]: value } });
    toast.success('Preference updated!');
  };

  const generateSmartRestock = async () => {
    setIsGenerating(true);
    try {
      const inventoryContext = inventory.map(i => `${i.name} (Qty: ${i.quantity}, Min: ${i.min_stock || 0}, Brand: ${i.preferred_brand || 'Any'}, Store: ${i.preferred_store || 'Any'})`).join('; ');
      
      const upcomingMeals = mealPlans
        .filter(m => new Date(m.date) >= new Date())
        .slice(0, 14)
        .map(m => m.recipe_name).join(', ');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Act as a smart pantry restock AI.
        Current Inventory: ${inventoryContext}
        Upcoming Meals (Next 14 days): ${upcomingMeals || 'None planned'}

        Analyze this data to:
        1. Identify staples that are low or nearing depletion based on quantities and minimums.
        2. Proactively suggest restocking items needed for the upcoming meals.
        3. Identify 2-3 bulk purchase opportunities or potential store-specific discounts based on the user's preferred stores and items they use heavily.
        
        Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            urgent_restocks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  reason: { type: "string" },
                  recommended_qty: { type: "number" }
                }
              }
            },
            bulk_deals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  deal_description: { type: "string" },
                  store: { type: "string" }
                }
              }
            },
            proactive_meal_prep: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  for_meal: { type: "string" }
                }
              }
            }
          }
        }
      });
      setSuggestions(response);
      toast.success("Smart restock plan generated!");
    } catch (e) {
      toast.error("Failed to generate restock plan.");
    }
    setIsGenerating(false);
  };

  const addAllToShoppingList = () => {
    if (!suggestions) return;
    
    let allItems = [];
    if (suggestions.urgent_restocks) {
      allItems = [...allItems, ...suggestions.urgent_restocks.map(i => ({ item: i.item, reason: i.reason }))];
    }
    if (suggestions.bulk_deals) {
      allItems = [...allItems, ...suggestions.bulk_deals.map(i => ({ item: `${i.item} (Bulk/Deal)`, reason: i.deal_description }))];
    }
    if (suggestions.proactive_meal_prep) {
      allItems = [...allItems, ...suggestions.proactive_meal_prep.map(i => ({ item: i.item, reason: `For upcoming meal: ${i.for_meal}` }))];
    }
    
    if (onGenerateShoppingList && allItems.length > 0) {
      onGenerateShoppingList(allItems);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Zap className="w-32 h-32 text-blue-600" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            AI Restock Automation
          </h3>
          <p className="text-blue-700 mb-6 max-w-xl">
            The AI learns your consumption rates and checks your upcoming meal plans to proactively suggest what you need to restock before you run out.
          </p>
          <Button 
            onClick={generateSmartRestock} 
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PackageCheck className="w-4 h-4 mr-2" />}
            {isGenerating ? 'Analyzing Patterns...' : 'Run Smart Restock Analysis'}
          </Button>
        </div>
      </div>

      {suggestions && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={addAllToShoppingList} className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white">
              <ShoppingCart className="w-4 h-4 mr-2" /> Add All to Shopping List
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardContent className="p-5">
                <h4 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5" /> Urgent Restocks
                </h4>
                <div className="space-y-3">
                  {suggestions.urgent_restocks?.length > 0 ? suggestions.urgent_restocks.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{item.item}</p>
                        <p className="text-xs text-gray-500">{item.reason}</p>
                      </div>
                      <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">
                        Qty: {item.recommended_qty}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No urgent restocks needed.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#c5d9c9] bg-[#f0f9f2]/50">
              <CardContent className="p-5">
                <h4 className="font-bold text-[#5a6f60] flex items-center gap-2 mb-4">
                  <PackageCheck className="w-5 h-5" /> Proactive Meal Prep
                </h4>
                <div className="space-y-3">
                  {suggestions.proactive_meal_prep?.length > 0 ? suggestions.proactive_meal_prep.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-[#c5d9c9] shadow-sm">
                      <p className="font-semibold text-gray-900">{item.item}</p>
                      <p className="text-xs text-[#6b9b76] flex items-center mt-1">
                        <ChevronRight className="w-3 h-3 mr-1" /> Needed for: {item.for_meal}
                      </p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">All set for upcoming meals.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 bg-amber-50/50 md:col-span-2">
              <CardContent className="p-5">
                <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5" /> Bulk Purchase Opportunities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {suggestions.bulk_deals?.length > 0 ? suggestions.bulk_deals.map((deal, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm relative">
                      <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl">
                        {deal.store || 'Any Store'}
                      </div>
                      <p className="font-bold text-gray-900 mt-2 mb-1">{deal.item}</p>
                      <p className="text-xs text-gray-600">{deal.deal_description}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No bulk deals identified currently.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mt-8">
        <h4 className="font-bold text-gray-800 mb-4">Your Brand & Store Preferences</h4>
        <p className="text-sm text-gray-500 mb-6">Tell AI your favorite brands and stores so it can optimize your restock recommendations.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.slice(0, 12).map(item => (
            <div key={item.id} className="p-3 border border-gray-200 rounded-xl">
              <p className="font-semibold text-gray-800 mb-3">{item.name}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Preferred Brand</label>
                  <Input 
                    placeholder="e.g. Heinz, local farm..." 
                    defaultValue={item.preferred_brand || ''}
                    onBlur={(e) => {
                      if (e.target.value !== item.preferred_brand) {
                        handleUpdatePreference(item.id, 'preferred_brand', e.target.value);
                      }
                    }}
                    className="h-8 text-xs border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Preferred Store</label>
                  <Input 
                    placeholder="e.g. Whole Foods, Costco..." 
                    defaultValue={item.preferred_store || ''}
                    onBlur={(e) => {
                      if (e.target.value !== item.preferred_store) {
                        handleUpdatePreference(item.id, 'preferred_store', e.target.value);
                      }
                    }}
                    className="h-8 text-xs border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}