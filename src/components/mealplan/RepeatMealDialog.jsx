import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function RepeatMealDialog({ meal, onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const queryClient = useQueryClient();

  const createMealMutation = useMutation({
    mutationFn: (mealData) => base44.entities.MealPlan.create(mealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success('Meal repeated successfully!');
      onClose();
    }
  });

  const handleRepeat = () => {
    createMealMutation.mutate({
      recipe_id: meal.recipe_id,
      recipe_name: meal.recipe_name,
      date: format(selectedDate, 'yyyy-MM-dd'),
      meal_type: meal.meal_type,
      servings: meal.servings,
      custom_ingredients: meal.custom_ingredients,
      custom_instructions: meal.custom_instructions,
      notes: meal.notes
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-start justify-center pt-40 pb-4 px-4 sm:pt-48"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[#6b9b76]">Repeat Meal</h3>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="font-semibold text-[#5a6f60] mb-2">Meal to Repeat:</p>
            <div className="bg-[#f5e6dc] p-3 rounded-xl border border-[#c5d9c9]">
              <p className="font-bold text-[#5a6f60]">{meal.recipe_name}</p>
              <p className="text-xs text-gray-600 capitalize">{meal.meal_type}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#5a6f60] mb-2">
              Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
              <Input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="pl-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-[#c5d9c9]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRepeat}
            className="flex-1 bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
          >
            Repeat Meal
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}