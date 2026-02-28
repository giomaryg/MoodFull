import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Play, Pause, CheckCircle2, Mic, MicOff, Bot, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function InteractiveCookingMode({ recipe, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  useEffect(() => {
    let recognition = null;
    if (isVoiceActive && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onstart = () => toast.success('Voice navigation active (say "next", "previous", "start timer")');
      
      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.toLowerCase();
        
        if (transcript.includes('next') || transcript.includes('forward')) {
          setCurrentStep(prev => Math.min(instructions.length - 1, prev + 1));
        } else if (transcript.includes('previous') || transcript.includes('back')) {
          setCurrentStep(prev => Math.max(0, prev - 1));
        } else if (transcript.includes('start timer') || transcript.includes('start the timer')) {
          setIsTimerRunning(true);
        } else if (transcript.includes('pause timer') || transcript.includes('stop timer')) {
          setIsTimerRunning(false);
        }
      };
      
      recognition.onend = () => {
         if (isVoiceActive && recognition) {
             try { recognition.start(); } catch(e) {}
         }
      };
      
      recognition.start();
    } else if (isVoiceActive) {
        toast.error("Voice recognition not supported in this browser.");
        setIsVoiceActive(false);
    }
    
    return () => {
      if (recognition) {
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, [isVoiceActive, instructions.length]);

  const handleAskAI = async (e) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const stepText = instructions[currentStep];
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `The user is cooking "${recipe.name}" and is currently on step: "${stepText}". They asked: "${aiQuery}". Provide a very short, concise, and helpful answer (1-2 sentences) about technique clarification or substitutions.`
      });
      setAiResponse(response);
      setAiQuery('');
    } catch (err) {
      setAiResponse('Sorry, I could not process your request right now.');
    } finally {
      setIsAiLoading(false);
    }
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
              type="button"
              className="border-gray-700 text-gray-800 bg-gray-100 hover:bg-gray-300 h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
              <span>Previous</span>
            </Button>
            
            {currentStep === instructions.length - 1 ? (
              <Button 
                onClick={onClose}
                type="button"
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(107,155,118,0.4)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                <span>Finish</span>
              </Button>
            ) : (
              <Button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextStep(); }}
                type="button"
                className="bg-white hover:bg-gray-200 text-black h-10 sm:h-12 px-3 sm:px-5 text-xs sm:text-sm rounded-xl transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-1" />
              </Button>
            )}
            
            <Button
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              type="button"
              variant="outline"
              className={`h-10 sm:h-12 px-3 sm:px-4 rounded-xl transition-all ${isVoiceActive ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-gray-700 text-gray-400 bg-gray-900 hover:bg-gray-800'}`}
              title="Voice Commands"
            >
              {isVoiceActive ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
            </Button>
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

        {/* AI Assistant Chat */}
        <div className="w-full max-w-4xl mx-auto mt-auto p-4 sm:p-8 shrink-0">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4 shadow-xl">
            {aiResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-gray-800 rounded-xl text-gray-200 text-sm sm:text-base flex items-start gap-3 text-left"
              >
                <Bot className="w-5 h-5 text-[#6b9b76] shrink-0 mt-0.5" />
                <p>{aiResponse}</p>
              </motion.div>
            )}
            <form onSubmit={handleAskAI} className="flex gap-2">
              <Input 
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Ask AI about this step, technique, or substitute..."
                className="bg-gray-800 border-gray-700 text-white focus:border-[#6b9b76] rounded-xl h-12"
              />
              <Button 
                type="submit" 
                disabled={isAiLoading || !aiQuery.trim()}
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white w-12 h-12 rounded-xl p-0 shrink-0"
              >
                {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}