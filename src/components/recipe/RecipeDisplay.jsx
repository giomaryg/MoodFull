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
      <Card className="overflow-hidden shadow-2xl border-0 bg-white rounded-3xl">
        {/* Header Section */}
        <div className="h-56 bg-gradient-to-br from-[#f5e6dc] to-[#e8d5c4] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800')] bg-cover bg-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <ChefHat className="w-20 h-20 text-[#c17a7a] opacity-40" />
            </motion.div>
          </div>
        </div>

        <CardHeader className="pb-6 pt-8">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <CardTitle className="text-4xl font-bold text-gray-900 leading-tight mb-3">
                {recipe.name}
              </CardTitle>
              <p className="text-gray-600 text-lg mt-3 leading-relaxed">{recipe.description}</p>
            </div>
            <Button
              onClick={onSave}
              variant={isSaved ? "default" : "outline"}
              size="lg"
              className={`
                shrink-0 transition-all duration-300 rounded-2xl px-6
                ${isSaved 
                  ? 'bg-[#c17a7a] hover:bg-[#b06a6a] shadow-lg' 
                  : 'border-2 hover:border-[#c17a7a] hover:bg-[#f5e6dc] hover:shadow-md'
                }
              `}
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-5 h-5 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-3 mt-5">
            {recipe.prep_time && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium rounded-xl">
                <Clock className="w-4 h-4 mr-1.5" />
                Prep: {recipe.prep_time}
              </Badge>
            )}
            {recipe.cook_time && (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 px-4 py-2 text-sm font-medium rounded-xl">
                <Clock className="w-4 h-4 mr-1.5" />
                Cook: {recipe.cook_time}
              </Badge>
            )}
            {recipe.servings && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium rounded-xl">
                <Users className="w-4 h-4 mr-1.5" />
                {recipe.servings} servings
              </Badge>
            )}
            {recipe.difficulty && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 capitalize px-4 py-2 text-sm font-medium rounded-xl">
                {recipe.difficulty}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-8">
          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#c17a7a] rounded-full" />
              Ingredients
            </h3>
            <div className="bg-[#faf6f2] rounded-2xl p-6 shadow-inner border border-[#e8d5c4]">
              <ul className="space-y-3">
                {recipe.ingredients?.map((ingredient, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 text-gray-800 text-base"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#c17a7a] mt-2 shrink-0 shadow-sm" />
                    <span className="leading-relaxed">{ingredient}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#c17a7a] rounded-full" />
              Instructions
            </h3>
            <div className="space-y-4">
              {recipe.instructions?.map((instruction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-4 items-start group hover:bg-[#faf6f2] p-4 rounded-2xl transition-all duration-200"
                  >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#c17a7a] flex items-center justify-center text-white font-bold text-base shadow-lg">
                    {index + 1}
                  </div>
                  <p className="flex-1 text-gray-800 leading-relaxed pt-2 text-base">
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