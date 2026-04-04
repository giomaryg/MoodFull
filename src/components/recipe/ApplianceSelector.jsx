import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, Flame, Wind, Microwave, Thermometer, Box } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const APPLIANCES = [
  { id: 'oven', label: 'Oven', icon: Box },
  { id: 'stovetop', label: 'Stovetop', icon: Flame },
  { id: 'air_fryer', label: 'Air Fryer', icon: Wind },
  { id: 'slow_cooker', label: 'Slow Cooker', icon: Thermometer },
  { id: 'microwave', label: 'Microwave', icon: Microwave },
  { id: 'pressure_cooker', label: 'Pressure Cooker', icon: Zap },
];

export default function ApplianceSelector({ recipe, onAdaptationStart, onAdaptationComplete }) {
  const [selected, setSelected] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);

  const handleSelect = async (applianceId) => {
    if (selected === applianceId) {
      setSelected('');
      onAdaptationComplete(null);
      return;
    }

    setSelected(applianceId);
    setIsAdapting(true);
    onAdaptationStart();

    const appliance = APPLIANCES.find(a => a.id === applianceId);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Adapt this recipe for a ${appliance.label}. 
Recipe: ${recipe.name}
Ingredients: ${recipe.ingredients?.join(', ')}
Original Instructions: ${recipe.instructions?.join('\n')}
Original Prep Time: ${recipe.prep_time}
Original Cook Time: ${recipe.cook_time}

Provide updated instructions, prep time, cook time, and any specific notes for cooking this in a ${appliance.label}.
If it's a terrible idea to cook this in a ${appliance.label} (e.g. baking cookies in a microwave), set is_compatible to false and provide a warning message.`,
        response_json_schema: {
          type: "object",
          properties: {
            is_compatible: { type: "boolean" },
            warning_message: { type: "string" },
            instructions: { type: "array", items: { type: "string" } },
            prep_time: { type: "string" },
            cook_time: { type: "string" },
            appliance_notes: { type: "string" }
          },
          required: ["is_compatible"]
        }
      });

      if (!response.is_compatible) {
        toast.error(response.warning_message || `This recipe is not recommended for a ${appliance.label}.`);
        setSelected('');
        onAdaptationComplete(null);
      } else {
        toast.success(`Recipe adapted for ${appliance.label}!`);
        onAdaptationComplete({
          appliance: appliance.label,
          instructions: response.instructions || recipe.instructions,
          prep_time: response.prep_time || recipe.prep_time,
          cook_time: response.cook_time || recipe.cook_time,
          appliance_notes: response.appliance_notes
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to adapt recipe for ' + appliance.label);
      setSelected('');
      onAdaptationComplete(null);
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="my-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-[#6b9b76]" /> Cook With (AI Adaptation)
      </h3>
      <div className="flex flex-wrap gap-2">
        {APPLIANCES.map(appliance => {
          const Icon = appliance.icon;
          const isSelected = selected === appliance.id;
          return (
            <Button
              key={appliance.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleSelect(appliance.id)}
              disabled={isAdapting && !isSelected}
              className={`rounded-xl transition-all ${
                isSelected 
                  ? 'bg-[#6b9b76] hover:bg-[#5a8a65] text-white border-[#6b9b76]' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isSelected && isAdapting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-2" />
              )}
              {appliance.label}
            </Button>
          );
        })}
      </div>
      {isAdapting && (
        <p className="text-xs text-gray-500 mt-2 animate-pulse">
          AI is analyzing and rewriting recipe instructions for the new appliance...
        </p>
      )}
    </div>
  );
}