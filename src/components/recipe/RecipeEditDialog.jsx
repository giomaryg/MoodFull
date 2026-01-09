import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecipeEditDialog({ recipe, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: recipe.name || '',
    description: recipe.description || '',
    prep_time: recipe.prep_time || '',
    cook_time: recipe.cook_time || '',
    servings: recipe.servings || 4,
    difficulty: recipe.difficulty || 'medium',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    cooking_tips: recipe.cooking_tips || [],
    cuisine_type: recipe.cuisine_type || '',
  });

  const [newIngredient, setNewIngredient] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newTip, setNewTip] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({ ...formData, ingredients: [...formData.ingredients, newIngredient.trim()] });
      setNewIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setFormData({ ...formData, ingredients: formData.ingredients.filter((_, i) => i !== index) });
  };

  const addInstruction = () => {
    if (newInstruction.trim()) {
      setFormData({ ...formData, instructions: [...formData.instructions, newInstruction.trim()] });
      setNewInstruction('');
    }
  };

  const removeInstruction = (index) => {
    setFormData({ ...formData, instructions: formData.instructions.filter((_, i) => i !== index) });
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData({ ...formData, cooking_tips: [...formData.cooking_tips, newTip.trim()] });
      setNewTip('');
    }
  };

  const removeTip = (index) => {
    setFormData({ ...formData, cooking_tips: formData.cooking_tips.filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Edit Recipe</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Recipe Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Prep Time</Label>
                <Input
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                  placeholder="15 mins"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Cook Time</Label>
                <Input
                  value={formData.cook_time}
                  onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                  placeholder="30 mins"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Servings</Label>
                <Input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">Cuisine Type</Label>
              <Input
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                placeholder="Italian, Mexican, etc."
                className="mt-1"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Ingredients</Label>
            <div className="space-y-2">
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  <span className="flex-1 text-sm">{ing}</span>
                  <button type="button" onClick={() => removeIngredient(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add ingredient..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <Button type="button" onClick={addIngredient} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Instructions</Label>
            <div className="space-y-2">
              {formData.instructions.map((inst, index) => (
                <div key={index} className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg">
                  <span className="bg-[#6b9b76] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm">{inst}</span>
                  <button type="button" onClick={() => removeInstruction(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="Add instruction step..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
              />
              <Button type="button" onClick={addInstruction} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Cooking Tips */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Cooking Tips</Label>
            <div className="space-y-2">
              {formData.cooking_tips.map((tip, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  <span className="flex-1 text-sm">{tip}</span>
                  <button type="button" onClick={() => removeTip(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="Add cooking tip..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
              />
              <Button type="button" onClick={addTip} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#6b9b76] hover:bg-[#5a8a65]">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}