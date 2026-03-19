import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { X, Search, Plus, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AddMealDialog({ date, mealType, recipes, onClose, enableDateSelection = false }) {
  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedMealType, setSelectedMealType] = useState(mealType || 'dinner');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [servings, setServings] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('select'); // 'select' or 'create'
  const [customMealName, setCustomMealName] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  const queryClient = useQueryClient();

  const addMealMutation = useMutation({
    mutationFn: (mealData) => {
      base44.analytics.track({
        eventName: "meal_added_to_plan",
        properties: { recipe_name: mealData.recipe_name, meal_type: mealData.meal_type }
      });
      return base44.entities.MealPlan.create(mealData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      toast.success('Meal added to plan!');
      onClose();
    }
  });

  const filteredRecipes = recipes.filter((recipe) =>
    recipe && recipe.name && (
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.mood?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleAddMeal = () => {
    if (mode === 'select') {
      if (!selectedRecipe) return;

      let finalIngredients = selectedRecipe.ingredients || [];
      const newServings = servings ? parseInt(servings) : selectedRecipe.servings;
      
      if (newServings && selectedRecipe.servings && newServings !== selectedRecipe.servings) {
        const ratio = newServings / selectedRecipe.servings;
        finalIngredients = finalIngredients.map(ing => {
          return ing.replace(/^([\d\s\.\/]+)/, (match) => {
            try {
              const val = match.trim().split(' ').reduce((acc, part) => {
                if (part.includes('/')) {
                  const [num, den] = part.split('/');
                  return acc + (Number(num) / Number(den));
                }
                return acc + Number(part);
              }, 0);
              if (isNaN(val) || val === 0) return match;
              
              let newVal = val * ratio;
              newVal = Math.round(newVal * 100) / 100;
              return newVal + ' ';
            } catch (e) {
              return match;
            }
          });
        });
      }

      addMealMutation.mutate({
        recipe_id: selectedRecipe.id,
        recipe_name: selectedRecipe.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        meal_type: selectedMealType,
        servings: newServings,
        custom_ingredients: finalIngredients,
        notes
      });
    } else {
      if (!customMealName.trim()) return;

      addMealMutation.mutate({
        recipe_name: customMealName,
        custom_ingredients: customIngredients ? customIngredients.split('\n').filter(i => i.trim()) : [],
        custom_instructions: customInstructions ? customInstructions.split('\n').filter(i => i.trim()) : [],
        date: format(selectedDate, 'yyyy-MM-dd'),
        meal_type: selectedMealType,
        servings: servings ? parseInt(servings) : 4,
        notes
      });
    }
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
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        <PullToRefresh onRefresh={async () => { await queryClient.invalidateQueries(); }} className="p-6 overflow-y-auto h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[#6b9b76]">Add Meal</h3>
            {!enableDateSelection ? (
              <p className="text-sm text-gray-600">
                {format(selectedDate, 'EEEE, MMM d')} - {selectedMealType}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="relative">
                  <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                                      const [year, month, day] = e.target.value.split('-').map(Number);
                                      setSelectedDate(new Date(year, month - 1, day));
                                    }}
                    className="pl-8 h-8 text-sm w-40"
                  />
                </div>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger className="h-8 w-32 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setMode('select')}
            variant={mode === 'select' ? 'default' : 'outline'}
            className={mode === 'select' ? 'bg-[#6b9b76] hover:bg-[#5a8a65] text-white' : 'border-2 border-[#c5d9c9]'}
          >
            <Search className="w-4 h-4 mr-2" />
            Select Recipe
          </Button>
          <Button
            onClick={() => setMode('create')}
            variant={mode === 'create' ? 'default' : 'outline'}
            className={mode === 'create' ? 'bg-[#6b9b76] hover:bg-[#5a8a65] text-white' : 'border-2 border-[#c5d9c9]'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Custom Meal
          </Button>
        </div>

        {mode === 'select' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#5a6f60] mb-2">
                Meal Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. Grilled Chicken Salad"
                value={customMealName}
                onChange={(e) => setCustomMealName(e.target.value)}
                className="border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5a6f60] mb-2">
                Ingredients (optional, one per line)
              </label>
              <Textarea
                placeholder="2 chicken breasts&#10;1 cup lettuce&#10;2 tbsp olive oil"
                value={customIngredients}
                onChange={(e) => setCustomIngredients(e.target.value)}
                className="border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5a6f60] mb-2">
                Instructions (optional, one per line)
              </label>
              <Textarea
                placeholder="Season chicken with salt and pepper&#10;Grill for 6-8 minutes per side&#10;Slice and serve over lettuce"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="border-2 border-[#c5d9c9] focus:border-[#6b9b76] rounded-xl h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5a6f60] mb-2">
                Servings
              </label>
              <Input
                type="number"
                placeholder="4"
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
            disabled={(mode === 'select' && !selectedRecipe) || (mode === 'create' && !customMealName.trim()) || addMealMutation.isPending}
            className="flex-1 bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
          >
            Add to Plan
          </Button>
        </div>
        </PullToRefresh>
      </motion.div>
    </motion.div>
  );
}