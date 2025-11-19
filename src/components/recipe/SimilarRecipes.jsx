import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Sparkles } from 'lucide-react';

export default function SimilarRecipes({ recipes, onRecipeClick }) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#6b9b76] rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#6b9b76]">Similar Recipes You Might Like</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              onClick={() => onRecipeClick(recipe)}
              className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#c5d9c9] bg-white hover:bg-[#f8faf8] group rounded-2xl overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#6b9b76] transition-colors line-clamp-1">
                    {recipe.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#c5d9c9]">
                  {recipe.cuisine_type && (
                    <Badge 
                      variant="secondary" 
                      className="bg-[#e8f0ea] text-[#6b9b76] border-0 text-xs px-2 py-1 rounded-lg font-medium"
                    >
                      {recipe.cuisine_type}
                    </Badge>
                  )}
                  {recipe.prep_time && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-xs px-3 py-1 rounded-lg">
                      <Clock className="w-3 h-3 mr-1" />
                      {recipe.prep_time}
                    </Badge>
                  )}
                  {recipe.servings && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-xs px-3 py-1 rounded-lg">
                      <Users className="w-3 h-3 mr-1" />
                      {recipe.servings}
                    </Badge>
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