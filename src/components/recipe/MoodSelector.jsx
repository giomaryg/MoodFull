import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Cloud, Zap, Heart, Compass, Coffee, Baby, Clock, Moon, AlertCircle, Sun, Salad, Utensils, Cookie, Apple, Users, Thermometer, Timer, Feather, Frown, HelpCircle, Plus, X, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mealTypes = [
{ id: 'breakfast', label: 'Breakfast', icon: Sun, color: 'from-yellow-400 to-orange-300' },
{ id: 'lunch', label: 'Lunch', icon: Salad, color: 'from-green-400 to-teal-400' },
{ id: 'dinner', label: 'Dinner', icon: Utensils, color: 'from-indigo-400 to-purple-500' },
{ id: 'dessert', label: 'Dessert', icon: Cookie, color: 'from-pink-400 to-rose-400' },
{ id: 'snack', label: 'Snacks', icon: Apple, color: 'from-amber-400 to-orange-400' }];


const moods = [
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
  id: 'family_friendly',
  label: 'Family',
  icon: Users,
  color: 'from-blue-400 to-cyan-500',
  bg: 'bg-blue-50 hover:bg-blue-100',
  border: 'border-blue-300'
},
{
  id: 'happy',
  label: 'Happy',
  icon: Smile,
  color: 'from-yellow-400 to-orange-400',
  bg: 'bg-yellow-50 hover:bg-yellow-100',
  border: 'border-yellow-300'
},
{
  id: 'in_a_rush',
  label: 'In a Rush',
  icon: Timer,
  color: 'from-orange-400 to-red-500',
  bg: 'bg-orange-50 hover:bg-orange-100',
  border: 'border-orange-300'
},
{
  id: 'indecisive',
  label: 'Indecisive',
  icon: HelpCircle,
  color: 'from-gray-300 to-slate-400',
  bg: 'bg-gray-50 hover:bg-gray-100',
  border: 'border-gray-200'
},
{
  id: 'kid_friendly',
  label: 'Kid Friendly',
  icon: Baby,
  color: 'from-teal-400 to-cyan-500',
  bg: 'bg-teal-50 hover:bg-teal-100',
  border: 'border-teal-300'
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
  id: 'light_bite',
  label: 'Light Bite',
  icon: Feather,
  color: 'from-green-200 to-lime-300',
  bg: 'bg-green-50 hover:bg-green-100',
  border: 'border-green-200'
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
  id: 'romantic',
  label: 'Romantic',
  icon: Heart,
  color: 'from-pink-400 to-rose-500',
  bg: 'bg-pink-50 hover:bg-pink-100',
  border: 'border-pink-300'
},
{
  id: 'sad',
  label: 'Sad',
  icon: Frown,
  color: 'from-blue-300 to-indigo-400',
  bg: 'bg-blue-50 hover:bg-blue-100',
  border: 'border-blue-200'
},
{
  id: 'sick',
  label: 'Sick',
  icon: Thermometer,
  color: 'from-teal-200 to-emerald-300',
  bg: 'bg-teal-50 hover:bg-teal-100',
  border: 'border-teal-200'
},
{
  id: 'stressed',
  label: 'Stressed',
  icon: Cloud,
  color: 'from-blue-400 to-indigo-400',
  bg: 'bg-blue-50 hover:bg-blue-100',
  border: 'border-blue-300'
}
];


export default function MoodSelector({ selectedMoods, onMoodSelect, selectedMealTypes = [], onMealTypeSelect, userName, location, onLocationChange, onDetectLocation }) {
  const [customMoodInput, setCustomMoodInput] = useState('');

  const handleMoodToggle = (moodId) => {
    if (selectedMoods.includes(moodId)) {
      onMoodSelect(selectedMoods.filter((m) => m !== moodId));
    } else {
      onMoodSelect([...selectedMoods, moodId]);
    }
  };

  const handleAddCustomMood = (e) => {
    e?.preventDefault();
    const trimmed = customMoodInput.trim().toLowerCase();
    if (!trimmed) return;
    
    // Check if it exists in predefined moods
    const existing = moods.find(m => m.id === trimmed || m.label.toLowerCase() === trimmed);
    const moodIdToUse = existing ? existing.id : trimmed;

    if (!selectedMoods.includes(moodIdToUse)) {
      onMoodSelect([...selectedMoods, moodIdToUse]);
    }
    setCustomMoodInput('');
  };

  const handleMealTypeToggle = (typeId) => {
    if (selectedMealTypes.includes(typeId)) {
      onMealTypeSelect && onMealTypeSelect(selectedMealTypes.filter((t) => t !== typeId));
    } else {
      onMealTypeSelect && onMealTypeSelect([...selectedMealTypes, typeId]);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full bg-white rounded-[32px] p-6 shadow-sm border border-[#e0ede4] mb-8">
      <h2 className="text-2xl font-bold text-[#3A6B4F] mb-6">What should I eat?</h2>
      
      {/* 1. Mood Pillar */}
      <div className="w-full mb-8">
        <div className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">1. Tell us how you feel</div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'stressed', label: 'Stressed' },
            { id: 'tired', label: 'Tired' },
            { id: 'happy', label: 'Happy' },
            { id: 'lazy', label: 'Lazy' },
            { id: 'hangover', label: 'Hangover' },
            { id: 'healthy', label: 'Healthy' },
            { id: 'treat', label: 'Treat' },
            { id: 'cozy', label: 'Cozy' }
          ].map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodToggle(mood.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isSelected ? 'bg-[#DFF5E6] border-2 border-[#6DBE7C] shadow-md text-[#3A6B4F] scale-105' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {mood.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Budget Pillar */}
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm font-bold text-[#3A6B4F] mb-3">
          <span className="uppercase tracking-wider">2. Budget</span>
          <span className="text-gray-900">$15</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative cursor-pointer">
          <div className="absolute top-0 left-0 h-full bg-[#6DBE7C] w-[40%] rounded-full shadow-[0_0_10px_rgba(109,190,124,0.5)]" />
        </div>
      </div>

      {/* 3. Effort Pillar */}
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm font-bold text-[#3A6B4F] mb-3">
          <span className="uppercase tracking-wider">3. Effort</span>
          <span className="text-gray-900">Low</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative cursor-pointer">
          <div className="absolute top-0 left-0 h-full bg-[#FFE9D6] w-[20%] rounded-full" />
        </div>
      </div>

      {/* 4. Location Pillar */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-sm font-bold text-[#3A6B4F] mb-3">
          <span className="uppercase tracking-wider">4. Location (For Takeout)</span>
        </div>
        <div className="relative flex items-center">
            <Input 
                value={location || ''}
                onChange={(e) => onLocationChange && onLocationChange(e.target.value)}
                placeholder="Enter city or zip code (or use pin)"
                className="w-full bg-gray-50 border-gray-200 pr-10"
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={onDetectLocation}
                title="Use current location"
                className="absolute right-1 text-[#6b9b76] hover:bg-transparent"
            >
                <MapPin className="w-5 h-5" />
            </Button>
        </div>
      </div>
      
      {/* Hidden legacy meal types for backward compatibility just in case */}
      <div className="hidden">
        {mealTypes.map((type) => (
          <button key={type.id} onClick={() => handleMealTypeToggle(type.id)} />
        ))}
      </div>
    </div>);

}