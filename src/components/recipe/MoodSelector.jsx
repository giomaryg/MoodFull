import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Cloud, Zap, Heart, Compass, Coffee, Baby, Clock, Moon, AlertCircle, Sun, Salad, Utensils, Cookie, Apple } from 'lucide-react';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Sun, color: 'from-yellow-400 to-orange-300' },
  { id: 'lunch', label: 'Lunch', icon: Salad, color: 'from-green-400 to-teal-400' },
  { id: 'dinner', label: 'Dinner', icon: Utensils, color: 'from-indigo-400 to-purple-500' },
  { id: 'dessert', label: 'Dessert', icon: Cookie, color: 'from-pink-400 to-rose-400' },
  { id: 'snack', label: 'Snacks', icon: Apple, color: 'from-amber-400 to-orange-400' },
];

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
  id: 'lazy',
  label: 'Lazy',
  icon: Moon,
  color: 'from-indigo-400 to-blue-500',
  bg: 'bg-indigo-50 hover:bg-indigo-100',
  border: 'border-indigo-300'
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
},
{
  id: 'anxious',
  label: 'Anxious',
  icon: AlertCircle,
  color: 'from-slate-400 to-gray-500',
  bg: 'bg-slate-50 hover:bg-slate-100',
  border: 'border-slate-300'
},
{
  id: 'nostalgic',
  label: 'Nostalgic',
  icon: Clock,
  color: 'from-amber-400 to-yellow-500',
  bg: 'bg-amber-50 hover:bg-amber-100',
  border: 'border-amber-300'
},
{
  id: 'kid_friendly',
  label: 'Kid Friendly',
  icon: Baby,
  color: 'from-teal-400 to-cyan-500',
  bg: 'bg-teal-50 hover:bg-teal-100',
  border: 'border-teal-300'
}];


export default function MoodSelector({ selectedMoods, onMoodSelect, selectedMealTypes = [], onMealTypeSelect, userName }) {
  const handleMoodToggle = (moodId) => {
    if (selectedMoods.includes(moodId)) {
      onMoodSelect(selectedMoods.filter(m => m !== moodId));
    } else {
      onMoodSelect([...selectedMoods, moodId]);
    }
  };

  const handleMealTypeToggle = (typeId) => {
    if (selectedMealTypes.includes(typeId)) {
      onMealTypeSelect && onMealTypeSelect(selectedMealTypes.filter(t => t !== typeId));
    } else {
      onMealTypeSelect && onMealTypeSelect([...selectedMealTypes, typeId]);
    }
  };

  return (
    <div className="flex flex-col h-full -mx-4 sm:mx-0">
      <div className="glass-header py-6 sm:py-8 px-4 text-center rounded-t-3xl sm:rounded-3xl mb-4 sm:mb-6">
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[#6b9b76] mb-2 opacity-70">
          ◎ Mood Interface
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-gradient">
          How are you feeling?
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 px-4 flex-1">
        {moods.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMoods.includes(mood.id);

          return (
            <button
              key={mood.id}
              onClick={() => handleMoodToggle(mood.id)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#6b9b76]/10 border border-[#6b9b76]/50 shadow-[0_2px_12px_rgba(107,155,118,0.15)] relative overflow-hidden' 
                  : 'glass-panel hover:bg-white/70'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6b9b76]/50 to-transparent" />
              )}
              
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative ${
                isSelected 
                  ? 'border border-transparent scale-110 shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.1),_inset_4px_4px_10px_rgba(255,255,255,0.7),_0_0_20px_rgba(107,155,118,0.4)]' 
                  : 'bg-white/40 border border-[#c5d9c9]/30 shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.05),_inset_2px_2px_6px_rgba(255,255,255,0.5)] hover:shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.08),_inset_3px_3px_8px_rgba(255,255,255,0.6)]'
              }`}
              style={{
                background: isSelected ? 'radial-gradient(circle at 30% 30%, #e8f0ea 0%, #8db894 100%)' : ''
              }}>
                {isSelected && (
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${mood.color} mix-blend-overlay opacity-50`} />
                )}
                <Icon className={`w-6 h-6 relative z-10 transition-transform duration-300 ${isSelected ? 'text-[#3d5244] scale-110 drop-shadow-md' : 'text-[#5a6f60]/80'}`} />
              </div>
              <span className={`text-xs font-semibold ${isSelected ? 'text-[#3d5244]' : 'text-[#3d5244]/60'}`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Meal Type Selector */}
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-[#6b9b76]/40 text-center mb-3 w-full">
          Meal Type
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {mealTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedMealTypes.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => handleMealTypeToggle(type.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#6b9b76]/10 border-[#6b9b76]/45 text-[#6b9b76] font-medium'
                    : 'bg-white/50 border-[#c5d9c9]/60 text-[#5a6f60]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
              );
              }