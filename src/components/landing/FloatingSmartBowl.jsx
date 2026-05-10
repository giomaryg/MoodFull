import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function FloatingSmartBowl() {
  return (
    <div className="relative h-[500px] w-full rounded-3xl bg-gradient-to-br from-[#e0ede4]/40 to-[#f0f9f2]/40 border border-white/60 overflow-hidden flex items-center justify-center shadow-[inset_0_0_100px_rgba(255,255,255,0.8)] perspective-[1000px]">
      
      {/* Central Bowl */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotateZ: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-64 h-64 rounded-full shadow-2xl bg-white p-2"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600" alt="Healthy Bowl" className="w-full h-full rounded-full object-cover shadow-inner" />
        
        {/* Glow */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(107,155,118,0.4)] pointer-events-none" />
      </motion.div>

      {/* Floating Orbits */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[350px] h-[350px] rounded-full border border-[#6b9b76]/20 border-dashed" />
      </motion.div>

      {/* Floating Chips */}
      <motion.div animate={{ y: [-15, 15, -15] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-1/4 left-8 z-30 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white font-bold text-[#3d5244] flex items-center gap-2">
        🥑 Avocado <span className="text-xs text-[#6b9b76]">+healthy fats</span>
      </motion.div>

      <motion.div animate={{ y: [15, -15, 15] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 right-8 z-30 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white font-bold text-[#3d5244] flex items-center gap-2">
        <div className="bg-orange-100 p-1 rounded-full text-xs">🧘‍♀️</div> Calming
      </motion.div>

      <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-1/3 right-12 z-30 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white font-bold text-[#3d5244]">
        <div className="text-xs text-gray-500">Protein</div>
        <div className="text-[#6b9b76]">32g</div>
      </motion.div>

      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute bottom-1/3 left-16 z-30 bg-[#6b9b76] text-white p-3 rounded-full shadow-lg">
        <Sparkles className="w-5 h-5" />
      </motion.div>
    </div>
  );
}