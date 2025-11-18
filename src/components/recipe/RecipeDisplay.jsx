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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden shadow-xl border-0 bg-white">
        {/* Header Section */}
        <div className="h-48 bg-gradient-to-br from-orange-100 via-rose-50 to-amber-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat className="w-16 h-16 text-orange-600 opacity-30" />
          </div>
        </div>

        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold text-gray-900 leading-tight">
                {recipe.name}
              </CardTitle>
              <p className="text-gray-600 mt-2 leading-relaxed">{recipe.description}</p>
            </div>
            <Button
              onClick={onSave}
              variant={isSaved ? "default" : "outline"}
              className={`
                shrink-0 transition-all duration-300
                ${isSaved 
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600' 
                  : 'hover:border-orange-300 hover:bg-orange-50'
                }
              `}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.prep_time && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                Prep: {recipe.prep_time}
              </Badge>
            )}
            {recipe.cook_time && (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                <Clock className="w-3 h-3 mr-1" />
                Cook: {recipe.cook_time}
              </Badge>
            )}
            {recipe.servings && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <Users className="w-3 h-3 mr-1" />
                {recipe.servings} servings
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 capitalize">
                {recipe.difficulty}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Ingredients */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full" />
              Ingredients
            </h3>
            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-5">
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{ingredient}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-rose-500 rounded-full" />
              Instructions
            </h3>
            <div className="space-y-3">
              {recipe.instructions?.map((instruction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-4 items-start group"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-700 leading-relaxed pt-1">
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