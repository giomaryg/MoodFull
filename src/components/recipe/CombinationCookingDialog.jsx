import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckSquare, Square, Package, UtensilsCrossed, Sparkles, Loader2 } from 'lucide-react';

export default function CombinationCookingDialog({ isOpen, onClose, inventory = [], savedRecipes = [], onGenerate, isGenerating }) {
  const [selectedIngredients, setSelectedIngredients] = useState(new Set());
  const [selectedRecipes, setSelectedRecipes] = useState(new Set());

  const toggleIngredient = (name) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(name)) newSelected.delete(name);
    else newSelected.add(name);
    setSelectedIngredients(newSelected);
  };

  const toggleRecipe = (name) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(name)) newSelected.delete(name);
    else newSelected.add(name);
    setSelectedRecipes(newSelected);
  };

  const handleGenerate = () => {
    onGenerate({
      ingredients: Array.from(selectedIngredients),
      recipes: Array.from(selectedRecipes)
    });
  };

  const canGenerate = selectedIngredients.size > 0 || selectedRecipes.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#fcfdfc] border-2 border-[#c5d9c9] rounded-2xl">
        <DialogHeader className="p-6 pb-2 border-b border-[#c5d9c9]/50 bg-white">
          <DialogTitle className="text-2xl font-bold text-[#6b9b76] flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Combination Cooking
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select ingredients from your pantry and/or recipes you like. We'll generate new complementary dishes that combine these flavors!
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#c5d9c9]/50">
          <div className="flex-1 flex flex-col max-h-[40vh] sm:max-h-full">
            <div className="p-3 bg-[#f0f9f2] font-semibold text-[#5a6f60] flex items-center gap-2 border-b border-[#c5d9c9]/50">
              <Package className="w-4 h-4" /> Pantry Ingredients
              <Badge variant="outline" className="ml-auto bg-white">{selectedIngredients.size} selected</Badge>
            </div>
            <ScrollArea className="flex-1 p-3">
              {inventory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Your pantry is empty.</p>
              ) : (
                <div className="space-y-1">
                  {inventory.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => toggleIngredient(item.name)}
                      className="flex items-center gap-3 p-2 hover:bg-[#e8f0ea] rounded-lg cursor-pointer transition-colors"
                    >
                      {selectedIngredients.has(item.name) ? <CheckSquare className="w-4 h-4 text-[#6b9b76]" /> : <Square className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col max-h-[40vh] sm:max-h-full">
            <div className="p-3 bg-[#fdf6f0] font-semibold text-[#8a6849] flex items-center gap-2 border-b border-[#c5d9c9]/50">
              <UtensilsCrossed className="w-4 h-4" /> Saved Recipes
              <Badge variant="outline" className="ml-auto bg-white">{selectedRecipes.size} selected</Badge>
            </div>
            <ScrollArea className="flex-1 p-3">
              {savedRecipes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No saved recipes.</p>
              ) : (
                <div className="space-y-1">
                  {savedRecipes.map((recipe, i) => (
                    <div 
                      key={i} 
                      onClick={() => toggleRecipe(recipe.name)}
                      className="flex items-center gap-3 p-2 hover:bg-[#f5e6dc] rounded-lg cursor-pointer transition-colors"
                    >
                      {selectedRecipes.has(recipe.name) ? <CheckSquare className="w-4 h-4 text-[#d4a373]" /> : <Square className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm text-gray-700 line-clamp-1">{recipe.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="p-4 border-t border-[#c5d9c9]/50 bg-white flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Cancel</Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!canGenerate || isGenerating}
            className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cooking...</> : 'Combine & Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}