import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smile, Cloud, Zap, Heart, Compass, Coffee, Baby, Clock, Moon, AlertCircle, Sun, Salad, Utensils, Cookie, Apple, Users, Thermometer, Timer, Feather, Frown, HelpCircle, Plus, X, MapPin, Orbit, Target, Search } from 'lucide-react';
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


export default function MoodSelector({ selectedMoods, onMoodSelect, selectedMealTypes = [], onMealTypeSelect, userName, location, onLocationChange, onDetectLocation, effortLevel, onEffortSelect, budgetAmount = 15, onBudgetAmountChange, budgetCurrency = '$', onBudgetCurrencyChange }) {
  const [customMoodInput, setCustomMoodInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      // Don't search if it's too short or if the suggestions drop-down was closed explicitly
      if (!location || location.length < 3 || !showLocationSuggestions) {
        setLocationSuggestions([]);
        return;
      }
      setIsSearchingLocation(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&addressdetails=1`);
        const data = await res.json();
        
        // Filter out duplicates and format nice City, State, Country
        const uniqueSet = new Set();
        const formatted = [];
        for (const item of data) {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.municipality || item.name;
          const state = addr.state;
          const country = addr.country;
          const parts = [city, state, country].filter(Boolean);
          const label = parts.join(', ');
          
          if (!uniqueSet.has(label)) {
            uniqueSet.add(label);
            formatted.push({ id: item.place_id, label });
          }
        }
        setLocationSuggestions(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingLocation(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeoutId);
  }, [location, showLocationSuggestions]);

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
    <div className="flex flex-col items-center w-full glass-panel bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 mb-8 max-w-xl mx-auto">
      
      {/* 1. Mood Pillar */}
      <div className="w-full mb-10">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0">1</div>
          <div>
            <div className="text-lg font-bold text-gray-800 tracking-tight">How are you feeling?</div>
            <div className="text-sm text-gray-500 font-light">Pick your current mood</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'stressed', label: 'Stressed', icon: Orbit },
            { id: 'tired', label: 'Tired', icon: Frown },
            { id: 'happy', label: 'Happy', icon: Smile },
            { id: 'lazy', label: 'Lazy', icon: Moon },
            { id: 'hangover', label: 'Hangover', icon: Frown },
            { id: 'healthy', label: 'Healthy', icon: Feather },
            { id: 'cozy', label: 'Cozy', icon: Coffee },
            { id: 'romantic', label: 'Romantic', icon: Heart }
          ].map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodToggle(mood.id)}
                className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all ${
                  isSelected ? 'glass-panel bg-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.08)] scale-[1.02] relative border border-white/80' : 'bg-white/20 backdrop-blur-md text-gray-500 hover:bg-white/40 border border-white/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-[#7A9F87] via-[#A29BE3] to-[#89B6D9] -z-10" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
                )}
                <motion.div animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}} transition={{ duration: 0.4 }}>
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#A29BE3]' : 'text-gray-400'}`} strokeWidth={isSelected ? 2 : 1.5} />
                </motion.div>
                <span className={`text-[11px] font-medium ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Budget Pillar */}
      <div className="w-full mb-10">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0">2</div>
          <div className="w-full">
            <div className="text-lg font-bold text-gray-800 tracking-tight">What's your budget?</div>
            <div className="text-sm text-gray-500 font-light mb-4">Choose your range</div>
            
            <div className="flex items-end gap-1 mb-4">
              <motion.span 
                key={budgetAmount}
                initial={{ scale: 1.1, color: '#A29BE3' }}
                animate={{ scale: 1, color: '#6b9b76' }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold tracking-tight"
              >
                {budgetCurrency}{budgetAmount}
              </motion.span>
              <span className="text-gray-400 text-sm mb-1 font-medium">/ person</span>
            </div>

            <div className="flex items-center gap-4 w-full">
              <span className="text-gray-400 text-sm font-medium">$</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={budgetAmount} 
                onChange={(e) => onBudgetAmountChange && onBudgetAmountChange(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#A29BE3] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(162,155,227,0.6)] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white"
                style={{
                  background: `linear-gradient(to right, #A29BE3 0%, #A29BE3 ${budgetAmount}%, #e5e7eb ${budgetAmount}%, #e5e7eb 100%)`
                }}
              />
              <span className="text-gray-400 text-sm font-medium">$$$</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Effort Pillar */}
      <div className="w-full mb-10">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0">3</div>
          <div>
            <div className="text-lg font-bold text-gray-800 tracking-tight">How much effort?</div>
            <div className="text-sm text-gray-500 font-light">What are you in the mood for?</div>
          </div>
        </div>
        <div className="flex gap-3 pl-12">
          {[
            { id: 'Fast Takeout', label: 'Order it', sub: 'Takeout / Delivery', icon: Zap },
            { id: 'Quick & Easy', label: 'Keep it easy', sub: 'Simple to make', icon: Coffee },
            { id: 'Involved Cooking', label: 'Cook it', sub: 'More involved', icon: Thermometer }
          ].map(level => {
            const isSelected = effortLevel === level.id;
            const Icon = level.icon;
            return (
              <button
                key={level.id}
                onClick={() => onEffortSelect && onEffortSelect(level.id)}
                className={`flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all ${
                  isSelected ? 'bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] scale-[1.02] relative border-0' : 'bg-gray-50/50 text-gray-500 hover:bg-gray-100/50 border border-gray-100'
                }`}
              >
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-[#7A9F87] via-[#A29BE3] to-[#89B6D9] -z-10" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
                )}
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#6b9b76]' : 'text-gray-400'}`} strokeWidth={isSelected ? 2 : 1.5} />
                <span className={`text-[13px] font-bold ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>{level.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>{level.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Location Pillar */}
      <div className="w-full mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm shrink-0">4</div>
          <div className="w-full">
            <div className="text-lg font-bold text-gray-800 tracking-tight">Where are you?</div>
            <div className="text-sm text-gray-500 font-light mb-3">For best local options</div>
            
            <div className="relative flex items-center w-full">
                <Search className="w-5 h-5 absolute left-4 text-gray-400 pointer-events-none" strokeWidth={2} />
                <Input 
                    value={location || ''}
                    onChange={(e) => {
                      onLocationChange && onLocationChange(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => {
                      if (location && location.length >= 3) {
                        setShowLocationSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Small delay to allow click on suggestion
                      setTimeout(() => setShowLocationSuggestions(false), 200);
                    }}
                    placeholder="Use current location"
                    className="w-full bg-white border border-gray-200 h-14 pl-12 pr-12 rounded-2xl text-gray-700 shadow-sm focus-visible:ring-[#A29BE3]/30 focus-visible:border-[#A29BE3]/50"
                />
                
                {isSearchingLocation && (
                  <div className="absolute right-12 flex items-center justify-center">
                     <div className="w-4 h-4 border-2 border-[#A29BE3] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDetectLocation}
                    title="Use current location"
                    className="absolute right-2 text-gray-400 hover:text-[#A29BE3] hover:bg-transparent"
                >
                    <Target className="w-5 h-5" strokeWidth={2} />
                </Button>

                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {locationSuggestions.map(suggestion => (
                      <button
                        key={suggestion.id}
                        onMouseDown={(e) => {
                           e.preventDefault(); // Prevent input blur
                           onLocationChange && onLocationChange(suggestion.label);
                           setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
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