import React from 'react';
import { motion } from 'framer-motion';

export default function IntroScreen({ userName, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#6b9b76] z-50 flex items-center justify-center"
      onClick={onContinue}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center space-y-6 px-6"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white text-4xl sm:text-5xl md:text-6xl"
          style={{ fontFamily: 'Brittany Signature, cursive' }}
        >
          Hi, {userName || 'there'}! ✨
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/80 text-lg sm:text-xl"
          style={{ fontFamily: 'Brittany Signature, cursive' }}
        >
          tap anywhere to continue
        </motion.p>
      </motion.div>
    </motion.div>
  );
}