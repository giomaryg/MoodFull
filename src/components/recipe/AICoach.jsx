import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ChefHat, Sparkles, TrendingUp, Leaf, Target, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AICoach({ isOpen, onClose, userPreferences, mealPlans, inventory, onSuggestRecipe }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !insights && !isLoading) {
      generateInsights();
    }
  }, [isOpen]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const recentMeals = mealPlans.slice(0, 10).map(m => m.recipe_name).join(', ');
      const expiringItems = inventory
        .filter(i => i.expiry_date && new Date(i.expiry_date) < new Date(Date.now() + 7 * 86400000))
        .map(i => i.name)
        .join(', ');
      
      const goals = userPreferences?.daily_calorie_target 
        ? `${userPreferences.daily_calorie_target} cals, ${userPreferences.macro_protein_ratio}% protein` 
        : 'None specified';

      const prompt = `You are a personalized AI Culinary & Nutrition Coach.
User Info:
- Diet: ${userPreferences?.diet_preferences || 'None'}
- Goals: ${goals}
- Skill: ${userPreferences?.cooking_skill || 'Intermediate'}
- Recent Meals: ${recentMeals || 'None yet'}
- Expiring Soon: ${expiringItems || 'None'}

Provide:
1. A brief encouraging greeting.
2. A tip to improve their cooking skills based on their level.
3. A tip on reducing food waste (especially utilizing expiring items if any).
4. A tip on achieving their dietary goals.
5. ONE specific, creative recipe suggestion that fits their profile and uses their inventory.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            skill_tip: { type: "string" },
            waste_tip: { type: "string" },
            goal_tip: { type: "string" },
            recipe_suggestion: { 
              type: "object",
              properties: {
                name: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      });
      setInsights(response);
    } catch (e) {
      toast.error('Failed to connect to AI Coach.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#c5d9c9]"
      >
        <div className="p-6 bg-gradient-to-br from-[#6b9b76] to-[#4a7a55] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl">AI Recipe Coach</h2>
              <p className="text-white/80 text-sm">Personalized insights</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f8faf8]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6b9b76] space-y-4">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-medium animate-pulse">Analyzing your habits...</p>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e0ede4]">
                <p className="text-gray-800 font-medium leading-relaxed">
                  <Sparkles className="w-4 h-4 inline mr-2 text-yellow-500" />
                  {insights.greeting}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#e0ede4]">
                  <div className="shrink-0 mt-1">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Skill Building</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{insights.skill_tip}</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#e0ede4]">
                  <div className="shrink-0 mt-1">
                    <Leaf className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Reduce Waste</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{insights.waste_tip}</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#e0ede4]">
                  <div className="shrink-0 mt-1">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Dietary Goals</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{insights.goal_tip}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea] p-5 rounded-2xl border-2 border-[#6b9b76]/30">
                <h4 className="font-bold text-[#5a6f60] mb-2 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#6b9b76]" /> Try This Next
                </h4>
                <p className="font-bold text-lg text-[#6b9b76] mb-1">{insights.recipe_suggestion.name}</p>
                <p className="text-sm text-gray-600 mb-4">{insights.recipe_suggestion.reason}</p>
                <Button 
                  onClick={() => {
                    onClose();
                    onSuggestRecipe(insights.recipe_suggestion.name);
                  }}
                  className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl"
                >
                  Generate Recipe <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              <p>Could not load insights.</p>
              <Button onClick={generateInsights} variant="outline" className="mt-4">Try Again</Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}