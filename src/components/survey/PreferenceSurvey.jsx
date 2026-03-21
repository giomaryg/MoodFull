import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ChevronLeft, Sparkles, Check, X } from 'lucide-react';

const priorities = [
'None',
'Quick & Easy',
'Healthy & Nutritious',
'Budget-Friendly',
'Family-Friendly',
'Gourmet & Special',
'Meal Prep'];


const cuisines = [
  'Open Minded', 'Afghan', 'African', 'American', 'Argentine', 'Armenian', 'Asian', 'Australian', 'Austrian', 'Bangladeshi', 'BBQ', 'Belgian', 'Brazilian', 'British', 'Burmese', 'Cajun', 'Cambodian', 'Canadian', 'Caribbean', 'Chilean', 'Chinese', 'Colombian', 'Cuban', 'Danish', 'Dutch', 'Eastern European', 'Ecuadorian', 'Egyptian', 'Ethiopian', 'Filipino', 'French', 'Georgian', 'German', 'Greek', 'Guatemalan', 'Hawaiian', 'Honduran', 'Hungarian', 'Indian', 'Indonesian', 'Irish', 'Israeli', 'Italian', 'Jamaican', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Lebanese', 'Malaysian', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Moroccan', 'Native American', 'Nepalese', 'New American', 'Nigerian', 'Norwegian', 'Pakistani', 'Persian', 'Peruvian', 'Polish', 'Portuguese', 'Puerto Rican', 'Romanian', 'Russian', 'Salvadoran', 'Scandinavian', 'Scottish', 'Seafood', 'Senegalese', 'Somali', 'Soul Food', 'Southern', 'Spanish', 'Sri Lankan', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Thai', 'Tibetan', 'Turkish', 'Ukrainian', 'Vegan', 'Vegetarian', 'Venezuelan', 'Vietnamese', 'Welsh', 'Other'
];


const mealOptions = ['1-3 meals', '4-7 meals', '8-14 meals', '15+ meals'];
const cookingSkills = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const equipmentList = ['Oven', 'Stove', 'Microwave', 'Air Fryer', 'Slow Cooker', 'Instant Pot', 'Blender', 'Food Processor', 'Stand Mixer', 'Grill'];

export default function PreferenceSurvey({ onComplete, onSkip, initialData = {}, currentUser = {} }) {
  const [step, setStep] = useState(1);
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || currentUser.full_name || '',
    gender: initialData.gender || currentUser.gender || '',
    phone_number: initialData.phone_number || currentUser.phone_number || '',
    birthday: initialData.birthday || currentUser.birthday || '',
    allergies: initialData.allergies || '',
    diet_preferences: initialData.diet_preferences || '',
    blood_sugar_friendly: initialData.blood_sugar_friendly ?? null,
    priorities: initialData.priorities || [],
    open_to_new_cuisines: initialData.open_to_new_cuisines ?? null,
    preferred_cuisines: initialData.preferred_cuisines || [],
    otherCuisine: '',
    meals_per_week: initialData.meals_per_week || '',
    cooking_skill: initialData.cooking_skill || '',
    equipment: initialData.equipment || []
  });

  const totalSteps = 10;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const finalCuisines = formData.preferred_cuisines.filter((c) => c !== 'Other');
      if (formData.preferred_cuisines.includes('Other') && formData.otherCuisine) {
        finalCuisines.push(formData.otherCuisine);
      }

      onComplete({
        ...formData,
        preferred_cuisines: finalCuisines,
        survey_completed: true
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInArray = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ?
      prev[field].filter((i) => i !== item) :
      [...prev[field], item]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:return formData.full_name && formData.gender && formData.phone_number && formData.birthday;
      case 2:return true;
      case 3:return true;
      case 4:return formData.blood_sugar_friendly !== null;
      case 5:return formData.priorities.length > 0;
      case 6:return formData.open_to_new_cuisines !== null;
      case 7:return formData.preferred_cuisines.length > 0;
      case 8:return formData.meals_per_week !== '';
      case 9:return formData.cooking_skill !== '';
      case 10:return true; // equipment is optional
      default:return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <div className="inline-block p-3 bg-[#6b9b76] rounded-2xl mb-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome to MoodFull! 🍽️</h2>
              <p className="text-gray-600">Let's get to know you better</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-base font-semibold">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Your Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-semibold">
                  Gender
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-base font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} />

              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-base font-semibold">
                  Birthday
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} />

              </div>
            </div>
          </div>);


      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="allergies" className="text-base font-semibold">
                Are there any allergies we should know about?
              </Label>
              <Textarea
                id="allergies"
                placeholder="E.g., nuts, dairy, shellfish, gluten..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="min-h-24 resize-none" />

              <p className="text-sm text-gray-500">Leave blank if none</p>
            </div>
          </div>);


      case 3:
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
                className="min-h-24 resize-none" />

              <p className="text-sm text-gray-500">Tell us about any dietary preferences or restrictions</p>
            </div>
          </div>);


      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Do you need blood sugar friendly recipes?
              </Label>
              <p className="text-sm text-gray-500">For diabetes management or blood sugar control</p>
              <div className="grid grid-cols-1 gap-3 mt-4">
                <motion.button
                  onClick={() => setFormData({ ...formData, blood_sugar_friendly: true })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                  formData.blood_sugar_friendly === true ?
                  'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                  'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                  }>

                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-base">Yes, please prioritize low glycemic recipes</div>
                      <div className="text-sm text-gray-500 mt-1">Focus on balanced blood sugar levels 🩺</div>
                    </div>
                    {formData.blood_sugar_friendly === true &&
                    <Check className="w-6 h-6 text-[#6b9b76] ml-2" />
                    }
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setFormData({ ...formData, blood_sugar_friendly: false })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                  formData.blood_sugar_friendly === false ?
                  'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                  'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                  }>

                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-base">No special requirements</div>
                      <div className="text-sm text-gray-500 mt-1">Standard recipe recommendations 🍴</div>
                    </div>
                    {formData.blood_sugar_friendly === false &&
                    <Check className="w-6 h-6 text-[#6b9b76] ml-2" />
                    }
                  </div>
                </motion.button>
              </div>
            </div>
          </div>);


      case 5:
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
                      onClick={() => {
                        if (priority === 'None') {
                          setFormData(prev => ({ ...prev, priorities: ['None'] }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            priorities: prev.priorities.includes(priority)
                              ? prev.priorities.filter(p => p !== priority)
                              : [...prev.priorities.filter(p => p !== 'None'), priority]
                          }));
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected ?
                      'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                      'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                      }>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{priority}</span>
                        {isSelected && <Check className="w-5 h-5 text-[#6b9b76]" />}
                      </div>
                    </motion.button>);

                })}
              </div>
            </div>
          </div>);


      case 6:
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
                  formData.open_to_new_cuisines === true ?
                  'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                  'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                  }>

                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-base">Yes, I love exploring new flavors!</div>
                      <div className="text-sm text-gray-500 mt-1">Bring on the culinary adventure ✨</div>
                    </div>
                    {formData.open_to_new_cuisines === true &&
                    <Check className="w-6 h-6 text-[#6b9b76] ml-2" />
                    }
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setFormData({ ...formData, open_to_new_cuisines: false })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl border-2 transition-all ${
                  formData.open_to_new_cuisines === false ?
                  'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                  'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                  }>

                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-semibold text-base">I prefer sticking to what I know</div>
                      <div className="text-sm text-gray-500 mt-1">Comfort in the familiar 🏠</div>
                    </div>
                    {formData.open_to_new_cuisines === false &&
                    <Check className="w-6 h-6 text-[#6b9b76] ml-2" />
                    }
                  </div>
                </motion.button>
              </div>
            </div>
          </div>);


      case 7:
        const filteredCuisines = cuisines.filter(c => c.toLowerCase().includes(cuisineSearch.toLowerCase()));
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Please select cuisines you are interested in trying!
              </Label>
              <p className="text-sm text-gray-500 mb-4">Choose your favorites</p>
              
              <Input 
                placeholder="Search cuisines..." 
                value={cuisineSearch}
                onChange={(e) => setCuisineSearch(e.target.value)}
                className="mb-4 border-[#c5d9c9] focus:border-[#6b9b76]"
              />

              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto mb-4 p-1">
                {filteredCuisines.map((cuisine) => {
                  const isSelected = formData.preferred_cuisines.includes(cuisine);
                  return (
                    <Badge
                      key={cuisine}
                      onClick={() => {
                        if (cuisine === 'Open Minded') {
                          setFormData(prev => ({ ...prev, preferred_cuisines: ['Open Minded'] }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
                              ? prev.preferred_cuisines.filter(c => c !== cuisine)
                              : [...prev.preferred_cuisines.filter(c => c !== 'Open Minded'), cuisine]
                          }));
                        }
                      }}
                      className={`cursor-pointer px-3 py-1.5 text-xs transition-all ${
                      isSelected ?
                      'bg-[#6b9b76] hover:bg-[#5a8a65] text-white shadow-md scale-105' :
                      'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-[#6b9b76]'}`
                      }>

                      {cuisine}
                      {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                    </Badge>);

                })}
                {filteredCuisines.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No cuisines found matching "{cuisineSearch}".</p>
                )}
              </div>
              
              {formData.preferred_cuisines.includes('Other') &&
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2">

                  <Label htmlFor="otherCuisine" className="text-sm font-medium text-gray-700">
                    Please specify the other cuisine:
                  </Label>
                  <Input
                  id="otherCuisine"
                  placeholder="e.g. Ethiopian, Moroccan, Peruvian..."
                  value={formData.otherCuisine}
                  onChange={(e) => setFormData({ ...formData, otherCuisine: e.target.value })}
                  className="border-[#c5d9c9] focus:border-[#6b9b76]"
                  autoFocus />

                </motion.div>
              }
            </div>
          </div>);


      case 8:
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
                      isSelected ?
                      'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                      'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                      }>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">{option}</span>
                        {isSelected && <Check className="w-6 h-6 text-[#6b9b76]" />}
                      </div>
                    </motion.button>);

                })}
              </div>
            </div>
          </div>);


      case 9:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                How would you describe your cooking skills?
              </Label>
              <div className="grid grid-cols-1 gap-3 mt-4">
                {cookingSkills.map((skill) => {
                  const isSelected = formData.cooking_skill === skill;
                  return (
                    <motion.button
                      key={skill}
                      onClick={() => setFormData({ ...formData, cooking_skill: skill })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-5 rounded-xl border-2 transition-all ${
                      isSelected ?
                      'bg-[#f5e8e8] border-[#6b9b76] shadow-md' :
                      'bg-white border-[#c5d9c9] hover:border-[#6b9b76]'}`
                      }>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">{skill}</span>
                        {isSelected && <Check className="w-6 h-6 text-[#6b9b76]" />}
                      </div>
                    </motion.button>);

                })}
              </div>
            </div>
          </div>);


      case 10:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                What cooking equipment do you have access to?
              </Label>
              <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto mb-4">
                {equipmentList.map((item) => {
                  const isSelected = formData.equipment.includes(item);
                  return (
                    <Badge
                      key={item}
                      onClick={() => toggleInArray('equipment', item)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                      isSelected ?
                      'bg-[#6b9b76] hover:bg-[#5a8a65] text-white' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                      }>

                      {item}
                      {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                    </Badge>);

                })}
              </div>
            </div>
          </div>);


      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card className="border-0 shadow-2xl rounded-2xl sm:rounded-3xl relative">
        {onSkip &&
        <Button
          variant="ghost"
          size="icon"
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Skip survey">

            <X className="w-5 h-5" />
          </Button>
        }
        <CardContent className="p-6 sm:p-8 md:p-10">
          <div className="mb-8">
            <div className="text-gray-500 mr-6 mb-2 text-sm flex justify-between">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(step / totalSteps * 100)}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-[#6b9b76] shadow-md"
                initial={{ width: 0 }}
                animate={{ width: `${step / totalSteps * 100}%` }}
                transition={{ duration: 0.3 }} />

            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-64 sm:min-h-80">

              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={step === 1}
              className="border-2">

              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {onSkip &&
            <Button
              onClick={onSkip}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700">

                Skip
              </Button>
            }
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[#6b9b76] hover:bg-[#5a8a65] shadow-lg hover:shadow-xl transition-all rounded-xl px-6">

              {step === totalSteps ?
              <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Complete
                </> :

              <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);

}