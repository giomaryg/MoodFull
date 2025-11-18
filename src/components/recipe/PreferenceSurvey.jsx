import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const cuisines = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai',
  'French', 'Mediterranean', 'Korean', 'Vietnamese', 'Middle Eastern',
  'American', 'Greek', 'Spanish', 'Caribbean'
];

const priorities = [
  'Quick & Easy',
  'Healthy & Nutritious',
  'Budget Friendly',
  'Gourmet & Special',
  'Family Friendly',
  'Meal Prep'
];

const mealFrequencies = [
  { value: '1-2', label: '1-2 meals' },
  { value: '3-4', label: '3-4 meals' },
  { value: '5-7', label: '5-7 meals' },
  { value: '8+', label: '8+ meals' }
];

export default function PreferenceSurvey({ onComplete, initialData = {} }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    allergies: initialData.allergies || '',
    diet_preferences: initialData.diet_preferences || '',
    priorities: initialData.priorities || [],
    open_to_new_cuisines: initialData.open_to_new_cuisines ?? true,
    preferred_cuisines: initialData.preferred_cuisines || [],
    meals_per_week: initialData.meals_per_week || ''
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true; // allergies optional
      case 2: return true; // diet preferences optional
      case 3: return formData.priorities.length > 0;
      case 4: return formData.open_to_new_cuisines !== null;
      case 5: return formData.preferred_cuisines.length > 0;
      case 6: return formData.meals_per_week !== '';
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-2xl border-0 bg-white overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <CardHeader className="pb-4">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            Let's personalize your experience
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Allergies */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  Are there any allergies we should know about?
                </h3>
                <p className="text-sm text-gray-500">
                  We'll make sure to avoid these ingredients in your recipes
                </p>
                <Textarea
                  placeholder="E.g., peanuts, shellfish, dairy, gluten..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="min-h-[120px] text-base"
                />
              </motion.div>
            )}

            {/* Step 2: Diet Preferences */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  Do you have any specific diet plans or preferences?
                </h3>
                <p className="text-sm text-gray-500">
                  Like vegetarian, vegan, keto, paleo, etc.
                </p>
                <Textarea
                  placeholder="E.g., vegetarian, low-carb, Mediterranean diet..."
                  value={formData.diet_preferences}
                  onChange={(e) => setFormData({ ...formData, diet_preferences: e.target.value })}
                  className="min-h-[120px] text-base"
                />
              </motion.div>
            )}

            {/* Step 3: Priorities */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  What are your priorities?
                </h3>
                <p className="text-sm text-gray-500">
                  Select all that apply
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {priorities.map((priority) => (
                    <motion.button
                      key={priority}
                      onClick={() => toggleArrayItem('priorities', priority)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${formData.priorities.includes(priority)
                          ? 'bg-gradient-to-br from-orange-50 to-rose-50 border-orange-300 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{priority}</span>
                        {formData.priorities.includes(priority) && (
                          <Check className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Open to New Cuisines */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  Are you open to trying new cuisines?
                </h3>
                <p className="text-sm text-gray-500">
                  We can introduce you to exciting flavors from around the world
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setFormData({ ...formData, open_to_new_cuisines: true })}
                    variant={formData.open_to_new_cuisines === true ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 h-24 text-lg ${
                      formData.open_to_new_cuisines === true
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
                        : ''
                    }`}
                  >
                    Yes, I'm adventurous! 🌎
                  </Button>
                  <Button
                    onClick={() => setFormData({ ...formData, open_to_new_cuisines: false })}
                    variant={formData.open_to_new_cuisines === false ? "default" : "outline"}
                    size="lg"
                    className={`flex-1 h-24 text-lg ${
                      formData.open_to_new_cuisines === false
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
                        : ''
                    }`}
                  >
                    I prefer familiar flavors 🏠
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Preferred Cuisines */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  Please select cuisines you are interested in trying!
                </h3>
                <p className="text-sm text-gray-500">
                  Choose at least one
                </p>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map((cuisine) => (
                    <Badge
                      key={cuisine}
                      onClick={() => toggleArrayItem('preferred_cuisines', cuisine)}
                      className={`
                        cursor-pointer px-4 py-2 text-sm transition-all duration-200
                        ${formData.preferred_cuisines.includes(cuisine)
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {cuisine}
                      {formData.preferred_cuisines.includes(cuisine) && (
                        <Check className="w-3 h-3 ml-1 inline" />
                      )}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 6: Meals Per Week */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  How many meals do you usually cook in a week?
                </h3>
                <p className="text-sm text-gray-500">
                  This helps us understand your cooking habits
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {mealFrequencies.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, meals_per_week: option.value })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-6 rounded-xl border-2 transition-all duration-200
                        ${formData.meals_per_week === option.value
                          ? 'bg-gradient-to-br from-orange-50 to-rose-50 border-orange-300 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg text-gray-900">{option.label}</span>
                        {formData.meals_per_week === option.value && (
                          <Check className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={step === 1}
              className="border-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
            >
              {step === totalSteps ? (
                <>
                  Complete
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}