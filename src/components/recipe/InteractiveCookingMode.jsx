import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Play, Pause, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InteractiveCookingMode({ recipe, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const instructions = recipe?.instructions || [];
  const progress = ((currentStep + 1) / instructions.length) * 100;

  // Simple timer extraction logic from step text
  useEffect(() => {
    const stepText = instructions[currentStep] || '';
    const timeMatch = stepText.match(/(\d+)\s*(min|minute|minutes|sec|second|seconds)/i);
    if (timeMatch) {
      const amount = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      if (unit.startsWith('min')) {
        setTimeLeft(amount * 60);
      } else {
        setTimeLeft(amount);
      }
    } else {
      setTimeLeft(0);
      setIsTimerRunning(false);
    }
  }, [currentStep, instructions]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < instructions.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (!instructions.length) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-[#6b9b76]">{recipe.name}</h2>
        <Button onClick={onClose} variant="ghost" className="text-white hover:bg-gray-800 rounded-full h-12 w-12 p-0">
          <X className="w-8 h-8" />
        </Button>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-800 h-2">
        <div className="bg-[#6b9b76] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 text-center relative overflow-y-auto">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 flex flex-col items-start gap-3 sm:gap-4 z-10">
          <div className="text-gray-500 font-mono text-base sm:text-xl">
            Step {currentStep + 1} of {instructions.length}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              variant="outline"
              className="border-gray-700 text-gray-800 bg-gray-100 hover:bg-gray-300 h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
              <span>Previous</span>
            </Button>
            
            {currentStep === instructions.length - 1 ? (
              <Button 
                onClick={onClose}
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(107,155,118,0.4)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                <span>Finish</span>
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="bg-white hover:bg-gray-200 text-black h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-1" />
              </Button>
            )}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl w-full my-auto"
          >
            <p className="text-2xl sm:text-4xl md:text-5xl font-medium leading-tight text-gray-100 mt-8 sm:mt-0">
              {instructions[currentStep]}
            </p>

            {/* Timer if applicable */}
            {timeLeft > 0 || isTimerRunning ? (
              <div className="mt-12 flex flex-col items-center">
                <div className="text-6xl sm:text-8xl font-mono text-[#6b9b76] mb-6">
                  {formatTime(timeLeft)}
                </div>
                <Button 
                  size="lg" 
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`rounded-full px-8 py-6 text-xl ${isTimerRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#6b9b76] hover:bg-[#5a8a65]'}`}
                >
                  {isTimerRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                </Button>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      </div>

    </div>
    </div>
  );
}