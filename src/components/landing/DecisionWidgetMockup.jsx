import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Clock, DollarSign, Brain } from 'lucide-react';

export default function DecisionWidgetMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Sequence: 0 = Input, 1 = Processing, 2 = Outcome
    const timer1 = setTimeout(() => setStep(1), 3000); // After 3s, start processing
    const timer2 = setTimeout(() => setStep(2), 5000); // After 5s total, show outcome
    const timer3 = setTimeout(() => setStep(0), 12000); // Reset after 12s
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step]);

  return (
    <div className="bg-gradient-to-br from-[#FCF5E3] to-[#E6DDF2] rounded-[40px] p-6 sm:p-10 shadow-2xl border border-white/60 relative max-w-sm mx-auto h-[480px] flex items-center justify-center">
      {/* Floating Accents */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, 10, 0] }} 
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-6 sm:-left-12 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-white/50 text-sm font-bold flex items-center gap-2 text-gray-700 z-20"
          >
            <span className="text-lg leading-none">😩</span> Stressed
          </motion.div>
        )}
        
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-6 right-0 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-white/50 text-sm font-bold flex items-center gap-2 text-[#7A9F87] z-20"
          >
            <Brain className="w-4 h-4 animate-pulse" /> AI Processing
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-4 right-0 sm:-right-6 bg-[#A29BE3] text-white px-5 py-2.5 rounded-full shadow-xl border border-white/20 text-sm font-bold flex items-center gap-2 z-20"
          >
            <Sparkles className="w-4 h-4" /> Perfect Match
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white relative z-10 w-full"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-1">How are you?</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">Tap to tune the AI</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {['Stressed', 'Tired', 'Happy', 'Lazy'].map((word, i) => (
                  <motion.div 
                    key={word}
                    animate={i === 0 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${i===0 ? 'bg-[#DCEAF5] text-[#4A7294] shadow-sm ring-2 ring-[#89B6D9]' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {word}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex justify-between text-sm font-bold text-gray-700 mb-3">
                    <span>Budget</span>
                    <motion.span 
                      animate={{ color: ['#374151', '#7A9F87', '#374151'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      $14
                    </motion.span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ w: "10%" }}
                      animate={{ width: "35%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-[#7A9F87] rounded-full shadow-[0_0_10px_rgba(122,159,135,0.5)]" 
                    />
                  </div>
                </div>
              </div>

              <button className="w-full bg-gray-900 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg">
                Find My Food
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white flex flex-col items-center justify-center w-full min-h-[320px]"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-t-[#A29BE3] border-r-[#89B6D9] border-b-[#C1D7D0] border-l-[#FCF5E3] mb-6"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing...</h3>
              <p className="text-sm text-gray-500 text-center">Matching mood, budget, and local options</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100 relative z-10 w-full"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-[#FFD166] to-[#FF9F1C] rounded-full flex items-center justify-center shadow-xl border-4 border-white text-4xl">
                🍜
              </div>
              
              <div className="pt-10 text-center mb-6">
                <div className="text-xs font-bold tracking-widest text-[#A29BE3] uppercase mb-2">AI Picked This</div>
                <h3 className="text-2xl font-black text-gray-900 mb-1">Ramen House</h3>
                <div className="flex items-center justify-center gap-3 text-sm font-medium text-gray-600">
                  <span className="flex items-center"><Star className="w-3.5 h-3.5 text-[#FFD166] mr-1 fill-current" /> 4.8</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> 17m</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 text-[#7A9F87] -mr-0.5" />14</span>
                </div>
              </div>

              <div className="bg-[#FCF5E3]/50 rounded-2xl p-4 mb-6 border border-[#FDF0D5]">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Because you're stressed:</strong> Warm broth and carbs trigger serotonin release. It's fast, under budget, and exactly what you need right now.
                </p>
              </div>

              <button className="w-full bg-gray-900 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Order Delivery
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}