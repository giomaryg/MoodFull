import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Users, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RecipeDetailModal({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 pb-8" onClick={onClose}>
      <div className="flex justify-center py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header with image */}
        <div className="relative h-48 bg-gradient-to-br from-[#f5e6dc] to-[#e8d5c4] shrink-0">
          {(recipe.imageUrl || recipe.image_url) ? (
            <>
              <img
                src={recipe.imageUrl || recipe.image_url}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-[#c17a7a] opacity-40" />
            </div>
          )}
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full shadow-lg"
          >
            <X className="w-5 h-5" />
          </Button>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{recipe.name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Description */}
          {recipe.description && (
            <p className="text-gray-600">{recipe.description}</p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
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

          {/* Ingredients */}
          {recipe.ingredients?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#c17a7a] rounded-full" />
                Ingredients
              </h3>
              <ul className="bg-[#faf6f2] rounded-xl p-4 space-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c17a7a] mt-1.5 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#c17a7a] rounded-full" />
                Instructions
              </h3>
              <div className="space-y-3">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="bg-[#242424] text-white text-xs font-bold rounded-full shrink-0 w-6 h-6 flex items-center justify-center">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 text-sm pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cooking Tips */}
          {recipe.cooking_tips?.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-1 h-5 bg-[#6b9b76] rounded-full" />
                Tips
              </h3>
              <ul className="bg-[#f0f9f2] rounded-xl p-4 space-y-1.5">
                {recipe.cooking_tips.map((tip, i) => (
                  <li key={i} className="text-gray-700 text-sm">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
}