import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, ChefHat, Sparkles, TrendingUp, Leaf, Target, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AICoach({ isOpen, onClose, userPreferences, mealPlans, inventory, savedRecipes, onSuggestRecipe }) {
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

      const pregnancyContext = userPreferences?.pregnancy_status && ['pregnant', 'trying'].includes(userPreferences.pregnancy_status)
        ? `\nCRITICAL: The user is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Ensure all suggestions and advice are pregnancy-safe. Do not give medical advice.`
        : '';

      const savedMealsStr = savedRecipes?.slice(0, 15).map(r => r.name).join(', ');
      
      const prompt = `You are a personalized AI Culinary & Nutrition Coach.
User Info:
- Diet: ${userPreferences?.diet_preferences || 'None'}
- Goals: ${goals}
- Skill: ${userPreferences?.cooking_skill || 'Intermediate'}
- Saved Favorite Meals & Takeout/Restaurant Patterns: ${savedMealsStr || 'None yet'}
- Recent Meals: ${recentMeals || 'None yet'}
- Expiring Soon: ${expiringItems || 'None'}${pregnancyContext}

Provide:
1. A brief encouraging greeting.
2. A tip to improve their cooking skills based on their level.
3. A tip on reducing food waste (especially utilizing expiring items if any).
4. A tip on achieving their dietary goals.
5. THREE specific, customized suggestions that fit their profile and evolve based on their specific saved meal and restaurant preferences:
   - "Fastest": Quickest option for tonight (can be an ultra-fast recipe or a specific healthy takeout/restaurant order).
   - "Nutritional": Best fit for their dietary goals based on their eating patterns.
   - "Resourceful": Best utilization of their expiring inventory or pantry staples.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            skill_tip: { type: "string" },
            waste_tip: { type: "string" },
            goal_tip: { type: "string" },
            recipe_suggestions: { 
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", description: "e.g., Fastest, Nutritional, Resourceful" },
                  name: { type: "string" },
                  reason: { type: "string" }
                }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-5xl bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/40"
          >
            <div className="p-6 bg-gradient-to-br from-[#6b9b76] to-[#4a7a55] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl sm:text-2xl">AI Recipe Coach</h2>
                  <p className="text-white/90 text-sm">Personalized insights & tailored suggestions</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAFCFB]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-[#6b9b76] space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="font-medium animate-pulse text-lg">Analyzing your habits & inventory...</p>
                </div>
              ) : insights ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                  {/* Left Column: Quick Tips */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e0ede4]">
                      <p className="text-gray-800 font-medium leading-relaxed text-lg">
                        <Sparkles className="w-5 h-5 inline mr-2 text-yellow-500" />
                        {insights.greeting}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-[#e0ede4] hover:shadow-md transition-shadow">
                        <div className="shrink-0 mt-1 p-2 bg-blue-50 rounded-xl h-fit">
                          <TrendingUp className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1 text-base">Skill Building</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{insights.skill_tip}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-[#e0ede4] hover:shadow-md transition-shadow">
                        <div className="shrink-0 mt-1 p-2 bg-green-50 rounded-xl h-fit">
                          <Leaf className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1 text-base">Reduce Waste</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{insights.waste_tip}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-5 bg-white rounded-2xl shadow-sm border border-[#e0ede4] hover:shadow-md transition-shadow">
                        <div className="shrink-0 mt-1 p-2 bg-purple-50 rounded-xl h-fit">
                          <Target className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1 text-base">Dietary Goals</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{insights.goal_tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Recipe Suggestions */}
                  <div className="lg:col-span-7 flex flex-col">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                      <ChefHat className="w-6 h-6 text-[#6b9b76]" /> 
                      Curated For You
                    </h3>
                    <div className="space-y-4 flex-1">
                      {insights.recipe_suggestions?.map((suggestion, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea] p-5 rounded-2xl border-2 border-[#6b9b76]/20 hover:border-[#6b9b76]/50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#6b9b76] bg-white px-2 py-1 rounded-md shadow-sm border border-[#6b9b76]/20">
                                {suggestion.type}
                              </span>
                            </div>
                            <h4 className="font-bold text-lg text-gray-800 mb-1">{suggestion.name}</h4>
                            <p className="text-sm text-gray-600">{suggestion.reason}</p>
                          </div>
                          <Button 
                            onClick={() => {
                              onClose();
                              onSuggestRecipe(suggestion.name);
                            }}
                            className="w-full sm:w-auto bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl shadow-md shrink-0"
                          >
                            Generate <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
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
      )}
    </AnimatePresence>
  );
}