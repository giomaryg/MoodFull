import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import AddMealDialog from './AddMealDialog';
import ShoppingList from './ShoppingList';

export default function MealPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const queryClient = useQueryClient();

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 100)
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list('-created_date', 100)
  });

  const deleteMealMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getMealsForDay = (date, mealType) => {
    return mealPlans.filter(
      (plan) => isSameDay(new Date(plan.date), date) && plan.meal_type === mealType
    );
  };

  const handleAddMeal = (date, mealType) => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setShowAddMeal(true);
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Meal Planner</h2>
        <Button
          onClick={() => setShowShoppingList(true)}
          className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Shopping List
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 border-2 border-[#c5d9c9]">
        <Button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          variant="ghost"
          size="icon"
        >
          <ChevronLeft className="w-5 h-5 text-[#6b9b76]" />
        </Button>
        <div className="text-center">
          <p className="text-[#6b9b76] font-semibold text-lg">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </p>
        </div>
        <Button
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          variant="ghost"
          size="icon"
        >
          <ChevronRight className="w-5 h-5 text-[#6b9b76]" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border-2 border-[#c5d9c9] overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px bg-[#c5d9c9]">
          {weekDays.map((day) => (
            <div key={day.toString()} className="bg-[#6b9b76] p-3 text-center">
              <p className="text-white font-semibold text-sm">
                {format(day, 'EEE')}
              </p>
              <p className="text-white text-xs">
                {format(day, 'MMM d')}
              </p>
            </div>
          ))}
        </div>

        {/* Meal Rows */}
        {mealTypes.map((mealType) => (
          <div key={mealType} className="grid grid-cols-7 gap-px bg-[#c5d9c9] border-t-2 border-[#c5d9c9]">
            {weekDays.map((day) => {
              const meals = getMealsForDay(day, mealType);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={`${day.toString()}-${mealType}`}
                  className={`bg-white p-2 min-h-[120px] ${isToday ? 'bg-[#f0f9f2]' : ''}`}
                >
                  {weekDays.indexOf(day) === 0 && (
                    <p className="text-xs font-semibold text-[#6b9b76] mb-2 capitalize">
                      {mealType}
                    </p>
                  )}
                  
                  <div className="space-y-1">
                    <AnimatePresence>
                      {meals.map((meal) => (
                        <motion.div
                          key={meal.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="bg-[#f5e6dc] rounded-lg p-2 text-xs group relative"
                        >
                          <p className="font-medium text-[#5a6f60] truncate">
                            {meal.recipe_name}
                          </p>
                          {meal.servings && (
                            <p className="text-gray-500 text-xs">
                              {meal.servings} servings
                            </p>
                          )}
                          <button
                            onClick={() => deleteMealMutation.mutate(meal.id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <Button
                    onClick={() => handleAddMeal(day, mealType)}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-[#6b9b76] hover:bg-[#f0f9f2]"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Add Meal Dialog */}
      {showAddMeal && (
        <AddMealDialog
          date={selectedDate}
          mealType={selectedMealType}
          recipes={recipes}
          onClose={() => {
            setShowAddMeal(false);
            setSelectedDate(null);
            setSelectedMealType(null);
          }}
        />
      )}

      {/* Shopping List Dialog */}
      {showShoppingList && (
        <ShoppingList
          mealPlans={mealPlans}
          recipes={recipes}
          onClose={() => setShowShoppingList(false)}
        />
      )}
    </div>
  );
}