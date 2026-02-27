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
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-row">
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
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 text-gray-500 font-mono text-base sm:text-xl">
          Step {currentStep + 1} of {instructions.length}
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

      {/* Navigation Footer / Side Panel */}
      <motion.div 
        layout
        className="p-3 sm:p-6 lg:p-8 border-l border-gray-800 flex flex-col justify-center gap-4 sm:gap-6 bg-gray-950 shrink-0 w-20 sm:w-64 lg:w-80"
      >
        <Button 
          onClick={prevStep} 
          disabled={currentStep === 0}
          variant="outline"
          className="border-gray-700 text-gray-800 bg-gray-100 hover:bg-gray-300 h-16 sm:h-16 px-0 sm:px-8 text-xs sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl disabled:opacity-30 w-full order-2 transition-all flex-col sm:flex-row justify-center items-center"
        >
          <ChevronLeft className="w-8 h-8 sm:mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        
        {currentStep === instructions.length - 1 ? (
          <Button 
            onClick={onClose}
            className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white h-16 sm:h-16 px-0 sm:px-8 text-xs sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(107,155,118,0.4)] w-full order-1 transition-all flex-col sm:flex-row justify-center items-center"
          >
            <CheckCircle2 className="w-8 h-8 sm:mr-2" />
            <span className="hidden sm:inline">Finish</span>
          </Button>
        ) : (
          <Button 
            onClick={nextStep}
            className="bg-white hover:bg-gray-200 text-black h-16 sm:h-16 px-0 sm:px-8 text-xs sm:text-lg lg:text-xl rounded-xl sm:rounded-2xl w-full order-1 transition-all flex-col sm:flex-row justify-center items-center"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-8 h-8 sm:ml-2" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}