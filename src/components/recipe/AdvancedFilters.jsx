import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const cuisines = ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'French', 'Thai', 'Chinese', 'Japanese'];
const dietaryRestrictions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Paleo'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'];

export default function AdvancedFilters({ filters, onFiltersChange, showFilters, setShowFilters }) {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(key => filters[key]).length;

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="w-full sm:w-auto border-2 border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2]"
      >
        <SlidersHorizontal className="w-4 h-4 mr-2" />
        Advanced Filters
        {activeFilterCount > 0 && (
          <Badge className="ml-2 bg-[#6b9b76] text-white">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.cuisine && (
            <Badge className="bg-[#f5e6dc] text-[#5a6f60] border border-[#c5d9c9] px-3 py-1">
              Cuisine: {filters.cuisine}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => clearFilter('cuisine')}
              />
            </Badge>
          )}
          {filters.dietary && (
            <Badge className="bg-[#f5e6dc] text-[#5a6f60] border border-[#c5d9c9] px-3 py-1">
              {filters.dietary}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => clearFilter('dietary')}
              />
            </Badge>
          )}
          {filters.mealType && (
            <Badge className="bg-[#f5e6dc] text-[#5a6f60] border border-[#c5d9c9] px-3 py-1">
              {filters.mealType}
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => clearFilter('mealType')}
              />
            </Badge>
          )}
          {filters.maxPrepTime && (
            <Badge className="bg-[#f5e6dc] text-[#5a6f60] border border-[#c5d9c9] px-3 py-1">
              Max {filters.maxPrepTime} min prep
              <X
                className="w-3 h-3 ml-2 cursor-pointer"
                onClick={() => clearFilter('maxPrepTime')}
              />
            </Badge>
          )}
          <Button
            onClick={clearAllFilters}
            variant="ghost"
            size="sm"
            className="text-[#6b9b76] hover:text-[#5a8a65] h-auto py-1 px-2"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Options Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border-2 border-[#c5d9c9] p-4 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cuisine Filter */}
              <div>
                <label className="text-sm font-medium text-[#5a6f60] mb-2 block">
                  Cuisine
                </label>
                <Select
                  value={filters.cuisine || ''}
                  onValueChange={(value) => updateFilter('cuisine', value)}
                >
                  <SelectTrigger className="border-2 border-[#c5d9c9]">
                    <SelectValue placeholder="Any cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any cuisine</SelectItem>
                    {cuisines.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Restrictions Filter */}
              <div>
                <label className="text-sm font-medium text-[#5a6f60] mb-2 block">
                  Dietary
                </label>
                <Select
                  value={filters.dietary || ''}
                  onValueChange={(value) => updateFilter('dietary', value)}
                >
                  <SelectTrigger className="border-2 border-[#c5d9c9]">
                    <SelectValue placeholder="Any diet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any diet</SelectItem>
                    {dietaryRestrictions.map((diet) => (
                      <SelectItem key={diet} value={diet}>
                        {diet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Type Filter */}
              <div>
                <label className="text-sm font-medium text-[#5a6f60] mb-2 block">
                  Meal Type
                </label>
                <Select
                  value={filters.mealType || ''}
                  onValueChange={(value) => updateFilter('mealType', value)}
                >
                  <SelectTrigger className="border-2 border-[#c5d9c9]">
                    <SelectValue placeholder="Any meal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any meal</SelectItem>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal}>
                        {meal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prep Time Filter */}
              <div>
                <label className="text-sm font-medium text-[#5a6f60] mb-2 block">
                  Max Prep Time
                </label>
                <Select
                  value={filters.maxPrepTime || ''}
                  onValueChange={(value) => updateFilter('maxPrepTime', value)}
                >
                  <SelectTrigger className="border-2 border-[#c5d9c9]">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any time</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}