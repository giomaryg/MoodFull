import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Clock, ChefHat, Sparkles, X, ChevronRight, Check, Flame } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';

export default function InteractivePairingSheet({ 
  isOpen, 
  onClose, 
  pairingName, 
  mainRecipe,
  category, // "drink", "side", "dessert", "sauce", etc.
  iconColor,
  Icon
}) {
  const [loading, setLoading] = useState(false);
  const [pairingDetails, setPairingDetails] = useState(null);
  const [added, setAdded] = useState(false);

  const queryClient = useQueryClient();

  const addMealMutation = useOptimisticMutation({
    queryKey: ['mealPlans'],
    mutationFn: (mealData) => base44.entities.MealPlan.create(mealData),
    action: 'create',
    onSuccessMessage: 'Added to your meal plan!',
  });

  // Fetch AI generated recipe details for the pairing when the sheet opens
  React.useEffect(() => {
    if (isOpen && pairingName && !pairingDetails) {
      generatePairingDetails();
      setAdded(false);
    }
  }, [isOpen, pairingName]);

  const generatePairingDetails = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        model: 'gemini_3_flash',
        prompt: `Generate a quick, practical recipe for "${pairingName}" that perfectly complements the main dish "${mainRecipe.name}". 
        The category is ${category}. Keep it concise, simple, and highlight WHY it pairs well with the main dish.`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            prep_time: { type: "string" },
            cook_time: { type: "string" },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            why_it_pairs: { type: "string" },
            ingredients: { type: "array", items: { type: "string" } },
            instructions: { type: "array", items: { type: "string" } }
          }
        }
      });
      setPairingDetails(response);
    } catch (error) {
      console.error('Failed to generate pairing details:', error);
      toast.error('Failed to load pairing details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMeal = async () => {
    if (!pairingDetails) return;
    
    const mealData = {
      recipe_name: pairingName,
      date: new Date().toISOString().split('T')[0],
      meal_type: category === 'drink' ? 'snack' : 'dinner', // default fallback, could be smarter
      servings: mainRecipe.servings || 4,
      custom_ingredients: pairingDetails.ingredients,
      custom_instructions: pairingDetails.instructions,
      notes: `Pairing for ${mainRecipe.name}. ${pairingDetails.why_it_pairs}`
    };

    try {
      await addMealMutation.mutateAsync(mealData);
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e) {
      toast.error('Failed to add to meal plan.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh] rounded-t-3xl px-0 pb-0 flex flex-col bg-[#fdf8f4] gap-0">
        
        {/* Header Area */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl bg-white border shadow-sm ${iconColor.replace('text-', 'border-').replace('600', '200').replace('500', '200')}`}>
              {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                Perfect Pairing • {category}
              </p>
              <SheetTitle className="text-xl sm:text-2xl font-bold leading-tight">
                {pairingName}
              </SheetTitle>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full py-12 text-center"
              >
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-[#6b9b76]/20 rounded-full animate-ping" />
                  <div className="absolute inset-2 bg-[#6b9b76]/40 rounded-full animate-pulse" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#6b9b76] animate-bounce" />
                </div>
                <p className="text-gray-600 font-medium">Crafting the perfect pairing recipe...</p>
                <p className="text-sm text-gray-400 mt-1">Analyzing flavors from {mainRecipe.name}</p>
              </motion.div>
            ) : pairingDetails ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-2"
              >
                <p className="text-gray-600 text-sm sm:text-base">
                  {pairingDetails.description}
                </p>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 text-sm mb-1">Why it works</h4>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        {pairingDetails.why_it_pairs}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-white border-gray-200 text-gray-700">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {pairingDetails.prep_time} prep
                  </Badge>
                  {pairingDetails.cook_time && pairingDetails.cook_time !== '0 mins' && (
                    <Badge variant="secondary" className="bg-white border-gray-200 text-gray-700">
                      <Flame className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                      {pairingDetails.cook_time} cook
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-white border-gray-200 text-gray-700 capitalize">
                    <ChefHat className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    {pairingDetails.difficulty}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-[#6b9b76] rounded-full" />
                    What you'll need
                  </h3>
                  <ul className="space-y-2">
                    {pairingDetails.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6b9b76] mt-1.5 shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-[#6b9b76] rounded-full" />
                    How to make it
                  </h3>
                  <div className="space-y-3">
                    {pairingDetails.instructions.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-gray-400 text-sm mt-0.5">{idx + 1}.</span>
                        <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Sticky Bottom Action */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
          <Button 
            onClick={handleAddToMeal}
            disabled={loading || !pairingDetails || added}
            className={`w-full h-12 rounded-xl text-base font-semibold shadow-lg transition-all ${
              added 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white'
            }`}
          >
            {added ? (
              <><Check className="w-5 h-5 mr-2" /> Added to Meal Plan</>
            ) : (
              <><Plus className="w-5 h-5 mr-2" /> Add to Meal Plan</>
            )}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}