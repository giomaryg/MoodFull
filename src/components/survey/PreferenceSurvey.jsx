import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Sparkles, Check } from 'lucide-react';

const priorities = [
  'Quick & Easy',
  'Healthy & Nutritious',
  'Budget-Friendly',
  'Family-Friendly',
  'Gourmet & Special',
  'Meal Prep'
];

const cuisines = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai',
  'Mediterranean', 'French', 'Middle Eastern', 'Korean', 'Vietnamese',
  'American', 'Greek', 'Spanish', 'Caribbean', 'Other'
];

const mealOptions = ['1-3 meals', '4-7 meals', '8-14 meals', '15+ meals'];

export default function PreferenceSurvey({ onComplete, initialData = {} }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    allergies: initialData.allergies || '',
    diet_preferences: initialData.diet_preferences || '',
    priorities: initialData.priorities || [],
    open_to_new_cuisines: initialData.open_to_new_cuisines ?? null,
    preferred_cuisines: initialData.preferred_cuisines || [],
    meals_per_week: initialData.meals_per_week || ''
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({ ...formData, survey_completed: true });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInArray = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return true;
      case 3: return formData.priorities.length > 0;
      case 4: return formData.open_to_new_cuisines !== null;
      case 5: return formData.preferred_cuisines.length > 0;
      case 6: return formData.meals_per_week !== '';
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-block p-3 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl mb-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to MoodFull! 🍽️</h2>
              <p className="text-gray-600">Let's personalize your recipe experience</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="allergies" className="text-base font-semibold">
                Are there any allergies we should know about?
              </Label>
              <Textarea
                id="allergies"
                placeholder="E.g., nuts, dairy, shellfish, gluten..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="min-h-24 resize-none"
              />
              <p className="text-sm text-gray-500">Leave blank if none</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="diet" className="text-base font-semibold">
                Do you have any specific diet plans or preferences you have or are open to?
              </Label>
              <Textarea
                id="diet"
                placeholder="E.g., vegetarian, vegan, keto, paleo, low-carb, halal, kosher..."
                value={formData.diet_preferences}
                onChange={(e) => setFormData({ ...formData, diet_preferences: e.target.value })}
                className="min-h-24 resize-none"
              />
              <p className="text-sm text-gray-500">Tell us about any dietary preferences or restrictions</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                What are your priorities?
              </Label>
              <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {priorities.map((priority) => {
                  const isSelected = formData.priorities.includes(priority);
                  return (
                    <motion.button
                      key={priority}
                      onClick={() => toggleInArray('priorities', priority)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'bg-orange-50 border-orange-400 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{priority}</span>
                        {isSelected && <Check className="w-5 h-5 text-orange-600" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Are you open to trying new cuisines?
              </Label>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <motion.button
                  onClick={() => setFormData({ ...formData, open_to_new_cuisines: true })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    formData.open_to_new_cuisines === true
                      ? 'bg-orange-50 border-orange-400 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-base">Yes, I love exploring new flavors!</div>
                      <div className="text-sm text-gray-500 mt-1">Bring on the culinary adventure ✨</div>
                    </div>
                    {formData.open_to_new_cuisines === true && (
                      <Check className="w-6 h-6 text-orange-600 ml-2" />
                    )}
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setFormData({ ...formData, open_to_new_cuisines: false })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    formData.open_to_new_cuisines === false
                      ? 'bg-orange-50 border-orange-400 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-base">I prefer sticking to what I know</div>
                      <div className="text-sm text-gray-500 mt-1">Comfort in the familiar 🏠</div>
                    </div>
                    {formData.open_to_new_cuisines === false && (
                      <Check className="w-6 h-6 text-orange-600 ml-2" />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Please select cuisines you are interested in trying!
              </Label>
              <p className="text-sm text-gray-500 mb-4">Choose your favorites</p>
              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                {cuisines.map((cuisine) => {
                  const isSelected = formData.preferred_cuisines.includes(cuisine);
                  return (
                    <Badge
                      key={cuisine}
                      onClick={() => toggleInArray('preferred_cuisines', cuisine)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cuisine}
                      {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                How many meals do you usually cook in a week?
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {mealOptions.map((option) => {
                  const isSelected = formData.meals_per_week === option;
                  return (
                    <motion.button
                      key={option}
                      onClick={() => setFormData({ ...formData, meals_per_week: option })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-orange-50 border-orange-400 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">{option}</span>
                        {isSelected && <Check className="w-6 h-6 text-orange-600" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-2xl rounded-3xl">
        <CardContent className="p-10">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 shadow-md"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-80"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={step === 1}
              className="border-2"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 hover:from-orange-600 hover:via-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all rounded-xl px-6"
            >
              {step === totalSteps ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}