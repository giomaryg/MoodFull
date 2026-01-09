import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Sparkles, ChefHat } from 'lucide-react';

export default function SimilarRecipes({ recipes, onRecipeClick }) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#6b9b76] flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Similar Recipes You Might Like
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id || index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onRecipeClick(recipe)}
            className="cursor-pointer group"
          >
            <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border border-[#c5d9c9] bg-white group-hover:border-[#6b9b76]">
              <div className="h-32 bg-gray-100 relative overflow-hidden">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f0f9f2] to-[#e8f0ea]">
                    <ChefHat className="w-10 h-10 text-[#6b9b76] opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              
              <CardContent className="p-3">
                <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#6b9b76] transition-colors">
                  {recipe.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-2">
                  {recipe.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {recipe.cuisine_type && (
                    <Badge variant="secondary" className="bg-[#f0f9f2] text-[#6b9b76] hover:bg-[#e8f0ea] border-0 text-[10px] px-1.5 h-5">
                      {recipe.cuisine_type}
                    </Badge>
                  )}
                  {recipe.prep_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{recipe.prep_time}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}