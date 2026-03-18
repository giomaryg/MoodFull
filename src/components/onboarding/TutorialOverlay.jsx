import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Package, Calendar, Search, ChevronRight, Check } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to MoodFull',
    description: 'Your personal AI chef. Generate delicious recipes based on your current mood, dietary needs, and cravings.',
    icon: Sparkles,
    color: 'text-[#f2b769]',
    bg: 'bg-[#fffcf7]'
  },
  {
    id: 'pantry',
    title: 'Smart Pantry & Fridge Scan',
    description: 'Track your ingredients to get smarter recipe suggestions. Use your camera to scan your fridge and let AI identify your items automatically!',
    icon: Package,
    color: 'text-[#6b9b76]',
    bg: 'bg-[#f0f9f2]'
  },
  {
    id: 'planner',
    title: 'Intelligent Meal Planning',
    description: 'Plan your week, track your nutritional goals, and instantly generate smart shopping lists from your selected recipes.',
    icon: Calendar,
    color: 'text-[#c17a7a]',
    bg: 'bg-[#fdf5f5]'
  },
  {
    id: 'discovery',
    title: 'Search & Discover',
    description: 'Find exactly what you are looking for. Use advanced filters to sort by cuisine, prep time, calories, and more.',
    icon: Search,
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  }
];

export default function TutorialOverlay({ forceShow = false, onCloseForceShow }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('moodfull_tutorial_seen');
    if (!hasSeenTutorial || forceShow) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [forceShow]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('moodfull_tutorial_seen', 'true');
    setIsVisible(false);
    if (onCloseForceShow) onCloseForceShow();
  };

  if (!isVisible) return null;

  const StepIcon = TUTORIAL_STEPS[currentStep].icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-[#c5d9c9]"
          >
            <div className={`p-8 flex flex-col items-center text-center transition-colors duration-500 ${TUTORIAL_STEPS[currentStep].bg}`}>
              <div className={`w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 ${TUTORIAL_STEPS[currentStep].color}`}>
                <StepIcon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {TUTORIAL_STEPS[currentStep].title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {TUTORIAL_STEPS[currentStep].description}
              </p>
            </div>

            <div className="p-6 bg-white">
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {TUTORIAL_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep ? 'w-6 bg-[#6b9b76]' : 'w-2 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleComplete}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 rounded-xl font-semibold shadow-md"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? (
                    <>
                      Get Started <Check className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}