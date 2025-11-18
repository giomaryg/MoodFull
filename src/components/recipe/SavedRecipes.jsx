import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Sparkles } from 'lucide-react';

export default function SavedRecipes({ recipes, onRecipeClick }) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Your Saved Recipes</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => onRecipeClick(recipe)}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50 group"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {recipe.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-orange-100 text-orange-700 border-0 capitalize text-xs"
                    >
                      {recipe.mood}
                    </Badge>
                    {recipe.prep_time && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.prep_time}
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-0 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {recipe.servings}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}