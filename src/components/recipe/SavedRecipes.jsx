import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Sparkles } from 'lucide-react';

export default function SavedRecipes({ recipes, onRecipeClick }) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Your Saved Recipes</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50 group rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {recipe.name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {recipe.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 border-0 capitalize text-xs px-3 py-1 rounded-lg font-medium"
                    >
                      {recipe.mood}
                    </Badge>
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
        </AnimatePresence>
      </div>
    </div>
  );
}