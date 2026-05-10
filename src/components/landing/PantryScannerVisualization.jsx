import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function PantryScannerVisualization() {
  return (
    <div className="relative h-[300px] w-full max-w-2xl mx-auto rounded-3xl bg-[#f8faf8] border border-[#e0ede4] overflow-hidden flex items-center justify-center shadow-inner my-16 perspective-[1000px]">
      
      {/* Ingredients on counter */}
      <div className="absolute bottom-10 flex gap-6">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl drop-shadow-xl">🥑</motion.div>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="text-6xl drop-shadow-xl">🥚</motion.div>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} className="text-6xl drop-shadow-xl">🥬</motion.div>
      </div>

      {/* Scanning Beam */}
      <motion.div 
        animate={{ x: [-200, 200, -200] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-[#6b9b76]/20 to-transparent skew-x-12 z-20 pointer-events-none"
      />
      
      {/* Scan Line */}
      <motion.div 
        animate={{ x: [-200, 200, -200] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-[2px] bg-[#6b9b76] z-20 shadow-[0_0_15px_#6b9b76] pointer-events-none"
      />

      {/* Floating Tag */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="absolute top-10 bg-white px-6 py-3 rounded-full shadow-lg border border-[#c5d9c9] flex items-center gap-2 z-30"
      >
        <Sparkles className="w-5 h-5 text-[#6b9b76]" />
        <span className="font-bold text-[#3d5244]">3 meals generated from pantry</span>
      </motion.div>

    </div>
  );
}