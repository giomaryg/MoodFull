import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare, Pencil, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecipeReview({ recipe, isSaved, onRate, onReviewSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState(recipe?.review || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSaveReview = () => {
    onReviewSave(reviewText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setReviewText(recipe?.review || '');
    setIsEditing(false);
  };

  if (!isSaved) return null;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-amber-200 shadow-inner">
      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-1 h-5 sm:h-6 bg-amber-500 rounded-full" />
        Your Rating & Review
      </h4>

      {/* Star Rating */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium text-gray-700">Rating:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  (hoverRating || recipe.rating || 0) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200'
                }`}
              />
            </button>
          ))}
        </div>
        {recipe.rating > 0 && (
          <span className="text-sm text-gray-500">({recipe.rating}/5)</span>
        )}
      </div>

      {/* Review Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Your Notes:
          </span>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
            >
              <Pencil className="w-4 h-4 mr-1" />
              {recipe.review ? 'Edit' : 'Add Notes'}
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Add your personal notes about this recipe... What did you love? Any modifications you made?"
                className="min-h-[100px] border-amber-200 focus:border-amber-400"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="border-gray-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveReview}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg p-4 border border-amber-100 min-h-[60px]"
            >
              {recipe.review ? (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{recipe.review}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">No notes yet. Click "Add Notes" to share your thoughts!</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}