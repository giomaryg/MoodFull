import React from 'react';
import { motion } from 'framer-motion';

export default function IntroScreen({ userName, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden cursor-pointer"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #d4e8d8 0%, #e8f0ea 70%)' }}
      onClick={onContinue}
    >
      <div className="relative w-full max-w-sm aspect-[9/16] flex flex-col items-center justify-center pointer-events-none">
        {/* Orbit rings */}
        <div className="s1-orbit orbit-anim border-[#6b9b76]/15" style={{width:'110px',height:'110px',top:'50%',left:'50%',marginTop:'-90px',marginLeft:'-55px'}}></div>
        <div className="s1-orbit orbit-anim-rev border-[#6b9b76]/15" style={{width:'160px',height:'160px',top:'50%',left:'50%',marginTop:'-115px',marginLeft:'-80px'}}></div>
        <div className="s1-orbit border-[#6b9b76]/15" style={{width:'210px',height:'210px',top:'50%',left:'50%',marginTop:'-140px',marginLeft:'-105px',opacity:0.5}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] w-2 h-2 rounded-full bg-[#6b9b76] shadow-[0_0_16px_rgba(107,155,118,0.7)]"></div>
        
        {/* Corner brackets */}
        <div className="s1-corner" style={{top:'16px',left:'16px',borderTopWidth:'1.5px',borderLeftWidth:'1.5px',borderRightWidth:'0',borderBottomWidth:'0'}}></div>
        <div className="s1-corner" style={{top:'16px',right:'16px',borderTopWidth:'1.5px',borderRightWidth:'1.5px',borderLeftWidth:'0',borderBottomWidth:'0'}}></div>
        <div className="s1-corner" style={{bottom:'16px',left:'16px',borderBottomWidth:'1.5px',borderLeftWidth:'1.5px',borderRightWidth:'0',borderTopWidth:'0'}}></div>
        <div className="s1-corner" style={{bottom:'16px',right:'16px',borderBottomWidth:'1.5px',borderRightWidth:'1.5px',borderLeftWidth:'0',borderTopWidth:'0'}}></div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 flex flex-col items-center mt-[60px]"
        >
          <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#6b9b76] mb-3">
            ◎ System Ready
          </div>
          <div className="text-5xl font-normal tracking-normal leading-[1.1] text-gradient text-center pb-2 px-4" style={{ fontFamily: "'Brittany Signature', cursive" }}>
            Hey, {userName || 'Alex'}.
          </div>
          <div className="text-[11px] text-[#5a6f60]/55 mt-2">
            Your mood shapes your meal.
          </div>
          <div className="font-mono text-[9px] tracking-[0.1em] text-[#6b9b76]/50 mt-9">
            tap anywhere to enter →
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}