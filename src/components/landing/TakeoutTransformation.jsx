import React, { useState } from 'react';
import { motion } from 'framer-motion';

const items = [
  { bad: 'Fast food burger', good: 'Lean turkey burger', badImg: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400', goodImg: 'https://media.base44.com/images/public/691ce8ad33694c9622f52699/43aae0888_IMG_0129.jpg' },
  { bad: 'Creamy pasta', good: 'Zucchini noodles', badImg: 'https://images.unsplash.com/photo-1621996316585-f2083ce81b0a?auto=format&fit=crop&q=80&w=400', goodImg: 'https://media.base44.com/images/public/691ce8ad33694c9622f52699/7c951bbb1_IMG_0130.jpg' },
  { bad: 'Delivery pizza', good: 'Cauliflower crust pizza', badImg: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400', goodImg: 'https://media.base44.com/images/public/691ce8ad33694c9622f52699/dd8894f01_IMG_0132.jpg' }
];

export default function TakeoutTransformation() {
  return (
    <div className="grid md:grid-cols-3 gap-8 text-left perspective-[1000px]">
      {items.map((item, idx) => (
        <TransformationCard key={idx} item={item} delay={idx * 0.2} />
      ))}
    </div>
  );
}

function TransformationCard({ item, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Bad Item */}
      <div className="absolute inset-0">
        <img src={item.badImg} alt={item.bad} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-6 left-6 text-white">
          <span className="text-sm font-bold uppercase tracking-wider text-red-300">Takeout</span>
          <h3 className="text-2xl font-bold">{item.bad}</h3>
        </div>
      </div>

      {/* Good Item Reveal */}
      <motion.div 
        animate={{ clipPath: hovered ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 z-10 bg-white"
      >
        <img src={item.goodImg} alt={item.good} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#6b9b76]/80 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <span className="text-sm font-bold uppercase tracking-wider text-green-200">MoodFull Magic</span>
          <h3 className="text-2xl font-bold">{item.good}</h3>
        </div>
      </motion.div>
    </motion.div>
  );
}