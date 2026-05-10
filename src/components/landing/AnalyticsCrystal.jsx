import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, TrendingUp, Sparkles } from 'lucide-react';

export default function AnalyticsCrystal() {
  return (
    <div className="relative h-[400px] w-full rounded-3xl bg-gradient-to-br from-[#e0ede4]/30 to-[#f0f9f2]/30 border border-white/60 overflow-hidden flex items-center justify-center shadow-inner perspective-[1000px] mt-12">
      
      {/* Main Glass Panel */}
      <motion.div
        initial={{ rotateY: -10, rotateX: 5 }}
        animate={{ rotateY: 10, rotateX: -5 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
        className="relative z-20 w-80 h-64 rounded-3xl bg-white/40 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 flex flex-col justify-between"
      >
        <div className="flex justify-between items-center text-[#3d5244]">
          <span className="font-bold text-lg">Wellness Score</span>
          <Activity className="w-6 h-6 text-[#6b9b76]" />
        </div>
        
        {/* Animated Rings/Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>Protein Goal</span>
              <span>85%</span>
            </div>
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} transition={{ duration: 1 }} className="h-full bg-[#6b9b76] rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
              <span>Mood Alignment</span>
              <span>92%</span>
            </div>
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-blue-400 rounded-full" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-[#f0f9f2] p-2 rounded-full text-[#6b9b76]"><Sparkles className="w-4 h-4" /></div>
          <div className="text-sm font-bold text-[#3d5244]">You're feeling more energetic this week!</div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div animate={{ y: [-15, 15, -15], rotateZ: -5 }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 z-30 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white flex items-center gap-3">
        <Heart className="w-6 h-6 text-rose-400" />
        <div>
          <div className="text-xs font-bold text-gray-500">Favorite Meal</div>
          <div className="text-sm font-bold text-[#3d5244]">Salmon Bowl</div>
        </div>
      </motion.div>

      <motion.div animate={{ y: [15, -15, 15], rotateZ: 5 }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-10 right-10 z-30 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-blue-500" />
        <div>
          <div className="text-xs font-bold text-gray-500">Takeout Saved</div>
          <div className="text-sm font-bold text-[#3d5244]">$140 this month</div>
        </div>
      </motion.div>

    </div>
  );
}