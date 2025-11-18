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
}];


export default function MoodSelector({ selectedMood, onMoodSelect }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="bg-clip-text text-[#e878a7] text-4xl font-medium md:text-5xl from-orange-500 via-rose-500 to-pink-500">How are you feeling?

        </h2>
        <p className="text-[#a2a0a0] text-base">Choose your mood and we'll create the perfect recipe for you</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              onClick={() => onMoodSelect(mood.id)}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 0.95 }} className="bg-[#ffadad] p-5 rounded-3xl relative border-2 transition-all duration-300 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl">








              <div className="flex flex-col items-center gap-3">
                <div className="bg-[#d12e2e] p-4 rounded-2xl from-yellow-400 to-orange-400 transform transition-transform shadow-md">



                  <Icon className="bg-transparent text-[#f0e0e0] lucide lucide-smile w-7 h-7" />
                </div>
                <span className={`
                  text-sm font-semibold tracking-wide
                  ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                `}>
                  {mood.label}
                </span>
              </div>
              
              {isSelected &&
              <motion.div
                layoutId="mood-indicator"
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }} />

              }
            </motion.button>);

        })}
      </div>
    </div>);

}