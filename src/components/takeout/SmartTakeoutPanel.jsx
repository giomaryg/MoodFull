import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Utensils, Search, Leaf, ShieldAlert, ArrowRight, ExternalLink, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SmartTakeoutPanel({ isOpen, onClose, contextMoods = [], contextRecipe = null, userPreferences = {} }) {
  const [craving, setCraving] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  // Pre-fill if there's a recipe context
  useEffect(() => {
    if (isOpen) {
      if (contextRecipe) {
        setCraving(contextRecipe.name);
      } else {
        setCraving('');
      }
      setSuggestions(null);
    }
  }, [isOpen, contextRecipe]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!craving.trim() && !contextMoods.length && !contextRecipe) {
      toast.error("Tell us what you're craving first!");
      return;
    }

    setIsGenerating(true);
    setSuggestions(null);

    try {
      const moodContext = contextMoods.length > 0 ? `Current mood/vibe: ${contextMoods.join(', ')}` : '';
      const recipeContext = contextRecipe ? `User was looking at: ${contextRecipe.name} (${contextRecipe.description})` : '';
      const cravingContext = craving.trim() ? `User is specifically craving: ${craving.trim()}` : '';
      
      const dietaryContext = userPreferences?.diet_preferences || userPreferences?.allergies 
        ? `Diet: ${userPreferences.diet_preferences || 'None'}, Allergies: ${userPreferences.allergies || 'None'}` 
        : '';
      
      const pregnancyContext = userPreferences?.pregnancy_status && ['pregnant', 'trying'].includes(userPreferences.pregnancy_status)
        ? `\nCRITICAL CONTEXT: The user is ${userPreferences.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Ensure all suggestions are pregnancy-safe (avoid raw/undercooked animal products, unpasteurized dairy, high-mercury fish, alcohol, etc).`
        : '';

      const prompt = `You are MoodFull's Smart Takeout AI. The user decided not to cook and wants to order takeout.
${moodContext}
${recipeContext}
${cravingContext}
${dietaryContext}
${pregnancyContext}

Based on this, suggest 2 healthier takeout alternative meals from popular delivery platforms (like Uber Eats, DoorDash, or local restaurants).
For each suggestion, provide:
1. The healthier alternative meal name.
2. The typical unhealthy takeout meal it replaces (if applicable).
3. Why it's a better choice (nutritional improvements).
4. Specific ordering modifications (e.g., "Ask for dressing on the side", "Swap fries for salad", "Grilled instead of fried").

Make the tone helpful, non-judgmental, and encouraging. Return a structured JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            intro_message: { type: "string" },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  alternative_name: { type: "string" },
                  replaces: { type: "string" },
                  why_its_healthier: { type: "string" },
                  ordering_modifications: { type: "array", items: { type: "string" } },
                  badges: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openDeliveryPlatform = (platform) => {
    let url = '';
    const query = encodeURIComponent(craving || contextRecipe?.name || 'healthy food');
    if (platform === 'ubereats') url = `https://www.ubereats.com/search?q=${query}`;
    if (platform === 'doordash') url = `https://www.doordash.com/search/${query}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-[2rem]">
        <div className="bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea] p-6 sm:p-8 border-b border-[#c5d9c9]">
          <div className="flex items-center gap-3 mb-2 pr-8">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#c5d9c9]">
              <Utensils className="w-6 h-6 text-[#6b9b76]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">Order Smarter</DialogTitle>
              <DialogDescription className="text-[#5a8a65] font-medium">Smart Takeout Alternatives</DialogDescription>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">Not in the mood to cook? We get it. Let AI find healthier versions of your cravings from nearby restaurants.</p>
        </div>

        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto bg-gray-50/50">
          {!suggestions ? (
            <div className="space-y-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">What are you craving?</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={craving}
                      onChange={(e) => setCraving(e.target.value)}
                      placeholder="e.g., Spicy fried chicken, creamy pasta..."
                      className="pl-10 h-12 rounded-xl border-gray-200 focus:border-[#6b9b76] bg-white text-base"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full h-12 rounded-xl bg-[#6b9b76] hover:bg-[#5a8a65] text-white shadow-md transition-all text-base font-medium"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Cravings...</>
                  ) : (
                    <><Sparkles className="w-5 h-5 mr-2" /> Find Healthier Options</>
                  )}
                </Button>
              </form>

              {/* Suggestions Chips */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Quick cravings</p>
                <div className="flex flex-wrap gap-2">
                  {['Burger & Fries', 'Pizza', 'Chinese Takeout', 'Tacos', 'Sushi'].map(item => (
                    <button
                      key={item}
                      onClick={() => { setCraving(item); setTimeout(() => handleGenerate(), 100); }}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#6b9b76] hover:text-[#6b9b76] hover:bg-[#f0f9f2] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <p className="text-gray-800 font-medium">{suggestions.intro_message}</p>
                <Button variant="ghost" size="sm" onClick={() => setSuggestions(null)} className="text-[#6b9b76] hover:bg-[#f0f9f2]">
                  New Search
                </Button>
              </div>

              <div className="space-y-4">
                {suggestions.suggestions?.map((sug, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:border-[#c5d9c9] hover:shadow-md transition-all">
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {sug.badges?.slice(0,2).map((badge, bIdx) => (
                          <span key={bIdx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800">
                            {badge}
                          </span>
                        ))}
                      </div>
                      
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{sug.alternative_name}</h4>
                      {sug.replaces && (
                        <p className="text-sm text-gray-500 mb-4 line-through decoration-red-300 decoration-2">Instead of: {sug.replaces}</p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-start gap-2 bg-[#f8faf8] p-3 rounded-xl border border-[#e0ede4]">
                          <Leaf className="w-4 h-4 text-[#6b9b76] shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 leading-relaxed">{sug.why_its_healthier}</p>
                        </div>

                        {sug.ordering_modifications?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> 
                              How to order it
                            </p>
                            <ul className="space-y-1.5">
                              {sug.ordering_modifications.map((mod, mIdx) => (
                                <li key={mIdx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                  <span>{mod}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Integrations */}
              <div className="bg-gray-100 rounded-2xl p-5 border border-gray-200">
                <p className="text-sm font-bold text-gray-900 mb-3 text-center">Ready to order smarter?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => openDeliveryPlatform('ubereats')} className="w-full bg-black hover:bg-gray-800 text-white h-11 rounded-xl">
                    Uber Eats <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
                  </Button>
                  <Button onClick={() => openDeliveryPlatform('doordash')} className="w-full bg-[#EB1700] hover:bg-[#C91300] text-white h-11 rounded-xl">
                    DoorDash <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">Suggestions are AI-generated and for general guidance only.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}