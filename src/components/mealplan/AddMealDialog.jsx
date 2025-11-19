import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AddMealDialog({ date, mealType, recipes, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [servings, setServings] = useState('');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const addMealMutation = useMutation({
    mutationFn: (mealData) => base44.entities.MealPlan.create(mealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success('Meal added to plan!');
      onClose();
    }
  });

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.mood?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMeal = () => {
    if (!selectedRecipe) return;

    addMealMutation.mutate({
      recipe_id: selectedRecipe.id,
      recipe_name: selectedRecipe.name,
      date: format(date, 'yyyy-MM-dd'),
      meal_type: mealType,
      servings: servings ? parseInt(servings) : selectedRecipe.servings,
      notes
    });
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
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#6b9b76]">Add Meal</h3>
            <p className="text-sm text-gray-600">
              {format(date, 'EEEE, MMM d')} - {mealType}
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6b9b76]" />
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
          />
        </div>

        {/* Recipe List */}
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                selectedRecipe?.id === recipe.id
                  ? 'bg-[#f5e6dc] border-[#c17a7a]'
                  : 'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'
              }`}
            >
              <p className="font-semibold text-[#5a6f60]">{recipe.name}</p>
              <p className="text-xs text-gray-500">
                {recipe.prep_time} • {recipe.servings} servings
              </p>
            </button>
          ))}
          {filteredRecipes.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recipes found</p>
          )}
        </div>

        {/* Meal Details */}
        {selectedRecipe && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#5a6f60] mb-2">
                Servings
              </label>
              <Input
                type="number"
                placeholder={selectedRecipe.servings?.toString()}
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className="border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5a6f60] mb-2">
                Notes (optional)
              </label>
              <Input
                type="text"
                placeholder="Add notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-[#c5d9c9]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMeal}
            disabled={!selectedRecipe || addMealMutation.isPending}
            className="flex-1 bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
          >
            Add to Plan
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}