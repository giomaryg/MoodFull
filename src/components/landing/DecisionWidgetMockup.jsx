import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Zap, Brain, Star } from 'lucide-react';

export default function DecisionWidgetMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const sequence = async () => {
      while (isMounted) {
        setStep(0);
        await new Promise(r => setTimeout(r, 1500));
        if (!isMounted) break;
        setStep(1); // Selects Mood
        await new Promise(r => setTimeout(r, 1200));
        if (!isMounted) break;
        setStep(2); // Modifies Budget
        await new Promise(r => setTimeout(r, 1000));
        if (!isMounted) break;
        setStep(3); // Clicks Button
        await new Promise(r => setTimeout(r, 800));
        if (!isMounted) break;
        setStep(4); // Outcome state
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    sequence();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#E6F0EB] to-[#F2EEFA] rounded-[40px] p-6 sm:p-10 shadow-2xl border border-white/60 relative max-w-sm mx-auto overflow-hidden">
      
      {/* Subtle background orbs in widget */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#A29BE3]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#7A9F87]/20 rounded-full blur-3xl pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {step < 4 ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white relative z-10"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-1">What should I eat?</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Tell us how you feel</p>
            
            {/* Mood Words */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['Stressed', 'Tired', 'Happy', 'Lazy', 'Healthy'].map((word, i) => {
                const isSelected = step >= 1 && word === 'Stressed';
                return (
                  <motion.div 
                    key={i} 
                    animate={isSelected ? { scale: 1.05, backgroundColor: '#DFF5E6', borderColor: '#6DBE7C', color: '#3A6B4F' } : { scale: 1, backgroundColor: '#F9FAFB', borderColor: '#F3F4F6', color: '#9CA3AF' }}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors`}
                  >
                    {word}
                  </motion.div>
                );
              })}
            </div>

            {/* Sliders */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-3">
                  <span>Budget</span>
                  <span className="text-gray-900">${step >= 2 ? '14' : '25'}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: step >= 2 ? '40%' : '70%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="h-full bg-[#6DBE7C] rounded-full shadow-[0_0_10px_rgba(109,190,124,0.3)]" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-3">
                  <span>Effort</span>
                  <span className="text-gray-900">Low</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFE9D6] w-[20%] rounded-full" />
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.button 
              animate={step === 3 ? { scale: [1, 1.05, 1], backgroundColor: '#6DBE7C' } : { scale: 1, backgroundColor: '#3A6B4F' }}
              transition={{ duration: 0.4 }}
              className="w-full text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-5 h-5" /> Find My Food
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl border border-white relative z-10 flex flex-col h-full"
          >
            {/* Top Label */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#3A6B4F] flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#6DBE7C]" /> AI Picked This
              </div>
            </div>

            <div className="h-48 bg-gray-200 relative overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80" alt="Ramen" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            
            <div className="p-6 relative flex-1 flex flex-col">
              <div className="absolute -top-6 right-6 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-xl">
                🍜
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Kenji's Ramen House</h3>
              
              <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-600">
                <span className="flex items-center gap-1 text-yellow-500"><Star className="w-4 h-4 fill-current"/> 4.8</span>
                <span>•</span>
                <span>17 min</span>
                <span>•</span>
                <span className="text-[#6DBE7C] font-bold">$14</span>
              </div>

              <div className="bg-[#F0F7F2] border border-[#E0EFE5] rounded-2xl p-4 text-sm text-[#3A6B4F] mb-6 flex-1">
                <span className="font-bold block mb-1">Why this?</span>
                Because you're <strong>stressed</strong>, on a budget, and need something comforting. Warm broth reduces cortisol levels.
              </div>

              <button className="w-full bg-black text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors mt-auto shrink-0">
                Order Delivery
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}