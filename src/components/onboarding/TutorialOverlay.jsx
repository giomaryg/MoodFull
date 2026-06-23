import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Zap, Activity, ChevronRight, Check } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'The AI Decision Engine',
    description: 'Stop overthinking your meals. MoodFull analyzes your mood, budget, and effort levels to make the perfect food decision for you instantly.',
    icon: Brain,
    color: 'text-[#3A6B4F]',
    bg: 'bg-[#f0f9f2]'
  },
  {
    id: 'takeout',
    title: 'Optimized Takeout First',
    description: 'Not in the mood to cook? Our AI maps your cravings to the best local takeout options, prioritizing convenience and budget.',
    icon: Zap,
    color: 'text-[#6DBE7C]',
    bg: 'bg-[#DFF5E6]'
  },
  {
    id: 'cooking',
    title: 'Adaptive Cooking Second',
    description: 'When you want to cook, MoodFull generates personalized recipes based on what is already in your kitchen, adapting to your dietary profile.',
    icon: Sparkles,
    color: 'text-[#3A6B4F]',
    bg: 'bg-[#f0f9f2]'
  },
  {
    id: 'insights',
    title: 'Continuous Learning',
    description: 'Every interaction improves your neural profile. Over time, MoodFull anticipates your cravings before you even feel them.',
    icon: Activity,
    color: 'text-[#6DBE7C]',
    bg: 'bg-[#DFF5E6]'
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
            initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.9, rotateX: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ perspective: 1000 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-[#c5d9c9]"
          >
            <div className={`p-8 flex flex-col items-center text-center transition-colors duration-500 ${TUTORIAL_STEPS[currentStep].bg}`}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className={`w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 ${TUTORIAL_STEPS[currentStep].color}`}
              >
                <StepIcon className="w-10 h-10" />
              </motion.div>
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
                      idx === currentStep ? 'w-6 bg-[#3A6B4F]' : 'w-2 bg-gray-200'
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
                  className="bg-[#3A6B4F] hover:bg-[#6DBE7C] text-white px-8 rounded-xl font-semibold shadow-md transition-colors"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? (
                    <>
                      Initialize <Check className="w-4 h-4 ml-2" />
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