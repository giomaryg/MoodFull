import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Zap, Droplets, Flame } from 'lucide-react';

export default function NutritionPanel({ nutrition, vitamins_minerals, health_benefits, servings, currentServings }) {
  const scaleFactor = currentServings / (servings || 1);

  const scaleValue = (value) => {
    if (!value) return value;
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    const scaled = Math.round(num * scaleFactor);
    return value.replace(/[\d.]+/, scaled.toString());
  };

  return (
    <div className="space-y-6">
      {/* Main Macros */}
      {nutrition && (
        <div className="bg-gradient-to-br from-[#faf6f2] to-[#f5e6dc] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-[#e8d5c4] shadow-inner">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-[#c17a7a] rounded-full" />
            Nutrition Facts
            <span className="text-xs font-normal text-gray-500 ml-2">
              (per serving{currentServings !== servings ? ` - adjusted for ${currentServings}` : ''})
            </span>
          </h4>
          
          {/* Primary Macros */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-4">
            {nutrition.calories && (
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-[#e8d5c4] text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-bold text-[#c17a7a]">
                  {Math.round(nutrition.calories * scaleFactor)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">Calories</div>
              </div>
            )}
            {nutrition.protein && (
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-[#e8d5c4] text-center">
                <Zap className="w-5 h-5 text-red-500 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-bold text-[#c17a7a]">{scaleValue(nutrition.protein)}</div>
                <div className="text-[10px] sm:text-xs text-gray-600">Protein</div>
              </div>
            )}
            {nutrition.carbs && (
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-[#e8d5c4] text-center">
                <Droplets className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-bold text-[#c17a7a]">{scaleValue(nutrition.carbs)}</div>
                <div className="text-[10px] sm:text-xs text-gray-600">Carbs</div>
              </div>
            )}
            {nutrition.fat && (
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-[#e8d5c4] text-center">
                <Leaf className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <div className="text-xl sm:text-2xl font-bold text-[#c17a7a]">{scaleValue(nutrition.fat)}</div>
                <div className="text-[10px] sm:text-xs text-gray-600">Fat</div>
              </div>
            )}
          </div>

          {/* Secondary Nutrition */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {nutrition.fiber && (
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <div className="text-sm font-semibold text-gray-700">{scaleValue(nutrition.fiber)}</div>
                <div className="text-[10px] text-gray-500">Fiber</div>
              </div>
            )}
            {nutrition.sugar && (
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <div className="text-sm font-semibold text-gray-700">{scaleValue(nutrition.sugar)}</div>
                <div className="text-[10px] text-gray-500">Sugar</div>
              </div>
            )}
            {nutrition.sodium && (
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <div className="text-sm font-semibold text-gray-700">{scaleValue(nutrition.sodium)}</div>
                <div className="text-[10px] text-gray-500">Sodium</div>
              </div>
            )}
            {nutrition.saturated_fat && (
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <div className="text-sm font-semibold text-gray-700">{scaleValue(nutrition.saturated_fat)}</div>
                <div className="text-[10px] text-gray-500">Sat. Fat</div>
              </div>
            )}
            {nutrition.cholesterol && (
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <div className="text-sm font-semibold text-gray-700">{scaleValue(nutrition.cholesterol)}</div>
                <div className="text-[10px] text-gray-500">Cholesterol</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vitamins & Minerals */}
      {vitamins_minerals && vitamins_minerals.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-blue-200 shadow-inner">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
            Key Vitamins & Minerals
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {vitamins_minerals.map((vm, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm"
              >
                <div className="font-semibold text-gray-800 text-sm">{vm.name}</div>
                <div className="text-xs text-gray-600 mt-1">{vm.amount}</div>
                {vm.daily_value && (
                  <div className="text-xs text-blue-600 font-medium mt-0.5">{vm.daily_value} DV</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Health Benefits */}
      {health_benefits && health_benefits.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-emerald-200 shadow-inner">
          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-5 sm:h-6 bg-emerald-500 rounded-full" />
            Health Benefits
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {health_benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-2 bg-white rounded-lg p-3 border border-emerald-100 shadow-sm"
              >
                <Leaf className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}