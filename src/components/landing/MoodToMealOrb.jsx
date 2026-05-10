import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const moods = [
  { id: 'stressed', icon: '😫', label: 'Stressed', meal: 'Comfort Mac & Cheese', color: 'from-blue-200 to-indigo-100', img: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=400' },
  { id: 'energetic', icon: '⚡', label: 'Energetic', meal: 'Power Quinoa Bowl', color: 'from-yellow-200 to-orange-100', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
  { id: 'cozy', icon: '🧶', label: 'Cozy', meal: 'Creamy Tomato Soup', color: 'from-orange-200 to-red-100', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400' },
  { id: 'romantic', icon: '✨', label: 'Romantic', meal: 'Truffle Mushroom Pasta', color: 'from-pink-200 to-rose-100', img: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400' }
];

export default function MoodToMealOrb() {
  const [active, setActive] = useState(moods[0]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-12">
      {/* Orb */}
      <div className="relative w-72 h-72 rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-br ${active.color} backdrop-blur-xl border border-white/50`}
          >
            <img src={active.img} alt={active.meal} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-gray-800 drop-shadow-md">
              <span className="text-5xl mb-2">{active.icon}</span>
              <h3 className="text-2xl font-bold bg-white/60 px-4 py-1 rounded-xl backdrop-blur-sm">{active.meal}</h3>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_20px_40px_rgba(255,255,255,0.8)] pointer-events-none" />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        {moods.map(m => (
          <button
            key={m.id}
            onMouseEnter={() => setActive(m)}
            onClick={() => setActive(m)}
            className={`px-6 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 ${active.id === m.id ? 'bg-white shadow-xl scale-105 border border-[#6b9b76]/30' : 'bg-white/50 hover:bg-white/80 border border-transparent'}`}
          >
            <span className="text-2xl">{m.icon}</span>
            <span className="text-lg font-bold text-[#3d5244]">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}