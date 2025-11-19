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


export default function MoodSelector({ selectedMoods, onMoodSelect, userName }) {
  const handleMoodToggle = (moodId) => {
    if (selectedMoods.includes(moodId)) {
      onMoodSelect(selectedMoods.filter(m => m !== moodId));
    } else {
      onMoodSelect([...selectedMoods, moodId]);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-2 sm:space-y-3 px-4">
        <h2 className="text-[#c17a7a] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium">
          How are you feeling{userName ? `, ${userName}` : ''}?
        </h2>
        <p className="text-[#9b8175] text-sm sm:text-base">Choose your mood(s) and we'll create the perfect recipe for you</p>
        <p className="text-[#c17a7a] text-xs sm:text-sm font-medium italic pt-1">✨ Where every mood meets its perfect meal ✨</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMoods.includes(mood.id);

          return (
            <motion.button
              key={mood.id}
              onClick={() => handleMoodToggle(mood.id)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }} 
              className={`p-3 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl relative border-2 transition-all duration-300 shadow-md hover:shadow-xl ${
                isSelected 
                  ? 'bg-[#f5e6dc] border-[#c17a7a]' 
                  : 'bg-white border-[#e8d5c4] hover:border-[#c17a7a]'
              }`}>








              <div className="flex flex-col items-center gap-3">
                <div className="bg-[#c17a7a] p-4 rounded-2xl transform transition-transform shadow-md">



                  <Icon className="text-white w-7 h-7" />
                </div>
                <span className={`
                  text-sm font-semibold tracking-wide
                  ${isSelected ? 'text-[#c17a7a]' : 'text-[#9b8175]'}
                `}>
                  {mood.label}
                </span>
              </div>
              
              {isSelected &&
              <motion.div
                layoutId="mood-indicator"
                className="absolute -bottom-1.5 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-12 sm:w-16 h-1 sm:h-1.5 bg-[#c17a7a] rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }} />

              }
            </motion.button>);

        })}
      </div>
    </div>);

}