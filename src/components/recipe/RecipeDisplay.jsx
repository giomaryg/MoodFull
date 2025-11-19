import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, ChefHat, BookmarkPlus, Check } from 'lucide-react';

export default function RecipeDisplay({ recipe, onSave, isSaved }) {
  if (!recipe) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="overflow-hidden shadow-2xl border-0 bg-white rounded-2xl sm:rounded-3xl">
        {/* Header Section with Image */}
        <div className="h-56 sm:h-64 md:h-80 bg-gradient-to-br from-[#f5e8e8] to-[#d4e4d6] relative overflow-hidden">
          {recipe.imageUrl ? (
            <>
              <img 
                src={recipe.imageUrl} 
                alt={recipe.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <ChefHat className="w-20 h-20 text-[#6b9b76] opacity-40" />
                </motion.div>
              </div>
            </>
          )}
        </div>

        <CardHeader className="pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
                {recipe.name}
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2 sm:mt-3 leading-relaxed">{recipe.description}</p>
            </div>
            <Button
              onClick={onSave}
              variant={isSaved ? "default" : "outline"}
              className={`
                w-full sm:w-auto shrink-0 transition-all duration-300 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 text-sm sm:text-base
                ${isSaved 
                  ? 'bg-[#6b9b76] hover:bg-[#5a8a65] shadow-lg' 
                  : 'border-2 hover:border-[#6b9b76] hover:bg-[#f5e8e8] hover:shadow-md'
                }
              `}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5">
            {recipe.prep_time && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5" />
                Prep: {recipe.prep_time}
              </Badge>
            )}
            {recipe.cook_time && (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5" />
                Cook: {recipe.cook_time}
              </Badge>
            )}
            {recipe.servings && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5" />
                {recipe.servings} servings
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 capitalize px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl">
                {recipe.difficulty}
              </Badge>
            )}
          </div>

          {/* Nutritional Information */}
          {recipe.nutrition && (
            <div className="mt-4 sm:mt-6 bg-gradient-to-br from-[#f8faf8] to-[#f5e8e8] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-[#d4e4d6] shadow-inner">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-[#6b9b76] rounded-full" />
                Nutrition Facts (per serving)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
                {recipe.nutrition.calories && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#d4e4d6]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#6b9b76]">{recipe.nutrition.calories}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Calories</div>
                  </div>
                )}
                {recipe.nutrition.protein && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#d4e4d6]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#6b9b76]">{recipe.nutrition.protein}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Protein</div>
                  </div>
                )}
                {recipe.nutrition.carbs && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#d4e4d6]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#6b9b76]">{recipe.nutrition.carbs}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Carbs</div>
                  </div>
                )}
                {recipe.nutrition.fat && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#d4e4d6]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#6b9b76]">{recipe.nutrition.fat}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Fat</div>
                  </div>
                )}
                {recipe.nutrition.fiber && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#d4e4d6]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#6b9b76]">{recipe.nutrition.fiber}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Fiber</div>
                  </div>
                )}
                {recipe.nutrition.sodium && (
                  <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border border-[#d4e4d6]">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#6b9b76]">{recipe.nutrition.sodium}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">Sodium</div>
                  </div>
                )}
              </div>
            </div>
          )}
          </CardHeader>

        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 md:p-8">
          {/* Ingredients */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-[#6b9b76] rounded-full" />
              Ingredients
              </h3>
              <div className="bg-[#f8faf8] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-inner border border-[#d4e4d6]">
              <ul className="space-y-2 sm:space-y-3">
                {recipe.ingredients?.map((ingredient, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-2 sm:gap-3 text-gray-800 text-sm sm:text-base"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#6b9b76] mt-1.5 sm:mt-2 shrink-0 shadow-sm" />
                    <span className="leading-relaxed">{ingredient}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="w-1 sm:w-1.5 h-6 sm:h-8 bg-[#6b9b76] rounded-full" />
              Instructions
              </h3>
            <div className="space-y-3 sm:space-y-4">
              {recipe.instructions?.map((instruction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-3 sm:gap-4 items-start group hover:bg-[#f8faf8] p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200"
                  >
                  <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-[#6b9b76] flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-800 leading-relaxed pt-1 sm:pt-1.5 md:pt-2 text-sm sm:text-base">
                    {instruction}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}