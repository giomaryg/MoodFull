import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Zap, Brain } from 'lucide-react';

export default function DecisionWidgetMockup() {
  return (
    <div className="bg-gradient-to-br from-[#DFF5E6] to-[#E9E1FF] rounded-[40px] p-6 sm:p-10 shadow-2xl border border-white/40 relative max-w-sm mx-auto">
      {/* Floating Accents */}
      <motion.div 
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -right-4 sm:-right-8 bg-white px-4 py-2 rounded-full shadow-xl border border-[#e0ede4] text-sm font-bold flex items-center gap-2 text-[#3A6B4F] z-10"
      >
        <Sparkles className="w-4 h-4 text-[#6DBE7C]" /> AI Deciding...
      </motion.div>
      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -left-6 sm:-left-12 bg-white px-4 py-2 rounded-full shadow-xl border border-[#e0ede4] text-sm font-bold flex items-center gap-2 text-[#3A6B4F] z-10"
      >
        <span className="text-lg leading-none">✨</span> Mood: Stressed
      </motion.div>
      <motion.div 
        animate={{ y: [0, -8, 0] }} 
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-4 right-0 sm:-right-4 bg-white px-4 py-2 rounded-full shadow-xl border border-[#e0ede4] text-sm font-bold flex items-center gap-2 text-[#3A6B4F] z-10"
      >
        <span className="text-[#6DBE7C] bg-[#DFF5E6] rounded-full w-5 h-5 flex items-center justify-center text-xs">$</span> Budget: $15
      </motion.div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e0ede4] relative z-0">
        <h3 className="text-2xl font-bold text-[#3A6B4F] mb-1">What should I eat?</h3>
        <p className="text-sm text-gray-500 font-medium mb-6">Tell us how you feel</p>
        
        {/* Mood Words */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['Stressed', 'Tired', 'Happy', 'Lazy', 'Hangover', 'Healthy', 'Treat', 'Cozy'].map((word, i) => (
            <div key={i} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${i===0 ? 'bg-[#DFF5E6] border-2 border-[#6DBE7C] shadow-md text-[#3A6B4F] scale-105' : 'bg-gray-50 text-gray-500 opacity-70 grayscale'}`}>
              {word}
            </div>
          ))}
        </div>

        {/* Sliders */}
        <div className="space-y-6 mb-8">
          <div>
            <div className="flex justify-between text-sm font-bold text-[#3A6B4F] mb-3">
              <span>Budget</span>
              <span className="text-gray-900">$15</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#6DBE7C] w-[40%] rounded-full shadow-[0_0_10px_rgba(109,190,124,0.5)]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-bold text-[#3A6B4F] mb-3">
              <span>Effort</span>
              <span className="text-gray-900">Low</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#FFE9D6] w-[20%] rounded-full" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full bg-[#3A6B4F] text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#6DBE7C] transition-colors shadow-lg">
          <Sparkles className="w-5 h-5" /> Find My Food
        </button>
      </div>
    </div>
  );
}