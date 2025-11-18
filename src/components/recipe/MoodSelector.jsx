import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Cloud, Zap, Heart, Compass, Coffee } from 'lucide-react';

const moods = [
  { 
    id: 'happy', 
    label: 'Happy', 
    icon: Smile, 
    color: 'from-yellow-400 to-orange-400',
    bg: 'bg-yellow-50 hover:bg-yellow-100',
    border: 'border-yellow-300'
  },
  { 
    id: 'cozy', 
    label: 'Cozy', 
    icon: Coffee, 
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-300'
  },
  { 
    id: 'energetic', 
    label: 'Energetic', 
    icon: Zap, 
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50 hover:bg-green-100',
    border: 'border-green-300'
  },
  { 
    id: 'stressed', 
    label: 'Stressed', 
    icon: Cloud, 
    color: 'from-blue-400 to-indigo-400',
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-300'
  },
  { 
    id: 'romantic', 
    label: 'Romantic', 
    icon: Heart, 
    color: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50 hover:bg-pink-100',
    border: 'border-pink-300'
  },
  { 
    id: 'adventurous', 
    label: 'Adventurous', 
    icon: Compass, 
    color: 'from-purple-400 to-violet-500',
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-300'
  }
];

export default function MoodSelector({ selectedMood, onMoodSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
          How are you feeling?
        </h2>
        <p className="text-gray-500 text-sm">Choose your mood and we'll suggest the perfect recipe</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <motion.button
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-2xl border-2 transition-all duration-300
                ${isSelected 
                  ? `${mood.bg} ${mood.border} shadow-lg` 
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`
                  p-3 rounded-xl bg-gradient-to-br ${mood.color}
                  ${isSelected ? 'shadow-md' : 'shadow-sm'}
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`
                  text-sm font-medium
                  ${isSelected ? 'text-gray-800' : 'text-gray-600'}
                `}>
                  {mood.label}
                </span>
              </div>
              
              {isSelected && (
                <motion.div
                  layoutId="mood-indicator"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}