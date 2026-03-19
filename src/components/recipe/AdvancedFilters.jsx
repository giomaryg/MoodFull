import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedFilters({ filters, onFiltersChange, showFilters, setShowFilters }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleManualIngredients = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Keep it simple
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`gap-2 ${showFilters || activeFilterCount > 0 ? 'border-[#6b9b76] text-[#6b9b76] bg-[#f0f9f2]' : 'text-gray-600'}`}
        >
          <Filter className="w-4 h-4" />
          AI Recipe Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-[#6b9b76] text-white hover:bg-[#5a8a65] ml-1 h-5 px-1.5 min-w-[1.25rem]">
              {activeFilterCount}
            </Badge>
          )}
          {showFilters ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-red-500 h-8 px-2 text-xs">
            Clear all
            <X className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-4 rounded-xl border-2 border-[#c5d9c9] shadow-sm mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              
              {/* Cuisine */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Cuisine</Label>
                <Select value={filters.cuisine || "all"} onValueChange={(val) => handleFilterChange('cuisine', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Cuisine</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="American">American</SelectItem>
                    <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Indian">Indian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Dietary</Label>
                <Select value={filters.dietary || "all"} onValueChange={(val) => handleFilterChange('dietary', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Diet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Diet</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Gluten-Free">Gluten-Free</SelectItem>
                    <SelectItem value="Keto">Keto</SelectItem>
                    <SelectItem value="Paleo">Paleo</SelectItem>
                    <SelectItem value="Low-Carb">Low-Carb</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Type */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Meal Type</Label>
                <Select value={filters.mealType || "all"} onValueChange={(val) => handleFilterChange('mealType', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snack">Snack</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Difficulty</Label>
                <Select value={filters.difficulty || "all"} onValueChange={(val) => handleFilterChange('difficulty', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Difficulty</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Prep Time */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Max Prep Time</Label>
                <Select value={filters.maxPrepTime || "all"} onValueChange={(val) => handleFilterChange('maxPrepTime', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="15">15 mins or less</SelectItem>
                    <SelectItem value="30">30 mins or less</SelectItem>
                    <SelectItem value="45">45 mins or less</SelectItem>
                    <SelectItem value="60">1 hour or less</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Calories */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Max Calories</Label>
                <Select value={filters.maxCalories || "all"} onValueChange={(val) => handleFilterChange('maxCalories', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Calories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Calories</SelectItem>
                    <SelectItem value="300">Under 300 kcal</SelectItem>
                    <SelectItem value="500">Under 500 kcal</SelectItem>
                    <SelectItem value="800">Under 800 kcal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Sort By</Label>
                <Select value={filters.sortBy || "date_desc"} onValueChange={(val) => handleFilterChange('sortBy', val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="time_asc">Fastest Prep</SelectItem>
                    <SelectItem value="calories_asc">Lowest Calories</SelectItem>
                    <SelectItem value="difficulty_asc">Easiest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Allergens */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Allergies</Label>
                <Select value={filters.allergens || "all"} onValueChange={(val) => handleFilterChange('allergens', val === "all" ? null : val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="No restrictions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">No restrictions</SelectItem>
                    <SelectItem value="Dairy-Free">Dairy-Free</SelectItem>
                    <SelectItem value="Nut-Free">Nut-Free</SelectItem>
                    <SelectItem value="Shellfish-Free">Shellfish-Free</SelectItem>
                    <SelectItem value="Soy-Free">Soy-Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Use Pantry */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Ingredients</Label>
                <Select value={filters.usePantry ? "yes" : "all"} onValueChange={(val) => handleFilterChange('usePantry', val === "yes")}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Ingredients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ingredients</SelectItem>
                    <SelectItem value="yes">In My Pantry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include Ingredients */}
              <div className="space-y-2 col-span-1 sm:col-span-2 mt-2">
                <Label className="text-xs font-semibold text-[#6b9b76] uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3"/> Ingredients on Hand
                </Label>
                <Input 
                placeholder="e.g. chicken, spinach, rice" 
                value={filters.includeIngredients || ""}
                onChange={(e) => handleFilterChange('includeIngredients', e.target.value)}
                onKeyDown={handleManualIngredients}
                className="h-11 border-[#c5d9c9] focus:border-[#6b9b76] bg-[#f0f9f2]"
                />
                <p className="text-[10px] text-gray-500">AI will use these to generate custom variations.</p>
              </div>

              {/* Exclude Ingredients */}
              <div className="space-y-2 col-span-1 sm:col-span-2 mt-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Exclude Ingredients</Label>
                <Input 
                placeholder="e.g. onions, garlic" 
                value={filters.excludeIngredients || ""}
                onChange={(e) => handleFilterChange('excludeIngredients', e.target.value)}
                className="h-11 border-[#c5d9c9] focus:border-[#6b9b76]"
                />
              </div>

              {/* Variations Toggle */}
              <div className="space-y-2 col-span-1 sm:col-span-2 mt-2 flex items-center gap-2">
                  <div className="flex-1">
                      <Label className="text-xs font-semibold text-[#6b9b76] uppercase flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Unique Variations
                      </Label>
                      <p className="text-[10px] text-gray-500">Allow AI to modify classic recipes based on your criteria.</p>
                  </div>
                  <Select value={filters.generateVariations ? "yes" : "no"} onValueChange={(val) => handleFilterChange('generateVariations', val === "yes")}>
                      <SelectTrigger className="h-11 w-32 border-[#6b9b76] text-[#6b9b76]">
                          <SelectValue placeholder="No" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="no">Standard</SelectItem>
                          <SelectItem value="yes">Creative AI</SelectItem>
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