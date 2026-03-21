import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Moon, Zap, Coffee, Droplets } from 'lucide-react';
import { getOuraWellnessData } from '@/lib/ouraService';

export default function WellnessRecommendationCard({ user, onApplyWellnessContext }) {
  const [wellnessData, setWellnessData] = useState(null);

  useEffect(() => {
    if (user?.oura_connected && user?.oura_data_consent) {
      const data = getOuraWellnessData();
      setWellnessData(data);
      if (onApplyWellnessContext) {
        onApplyWellnessContext(data);
      }
    }
  }, [user]);

  const [isVisible, setIsVisible] = useState(true);

  if (!user?.oura_connected || !user?.oura_data_consent || !wellnessData || !isVisible) {
    return null;
  }

  const getIcon = () => {
    if (wellnessData.sleep === 'poor') return <Moon className="w-5 h-5 text-indigo-500" />;
    if (wellnessData.readiness === 'low') return <Coffee className="w-5 h-5 text-amber-500" />;
    if (wellnessData.activity === 'high') return <Zap className="w-5 h-5 text-amber-500" />;
    return <Activity className="w-5 h-5 text-emerald-500" />;
  };

  const getBgColor = () => {
    if (wellnessData.readiness === 'low' || wellnessData.sleep === 'poor') return 'bg-indigo-50 border-indigo-100';
    if (wellnessData.activity === 'high') return 'bg-amber-50 border-amber-100';
    return 'bg-emerald-50 border-emerald-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-2xl border ${getBgColor()} flex flex-col sm:flex-row items-start gap-4 shadow-sm`}
    >
      <div className="bg-white p-2 rounded-full shadow-sm shrink-0">
        {getIcon()}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 text-sm">Oura Wellness Insight</h3>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-white px-2 py-0.5 rounded-full text-gray-500 shadow-sm border border-gray-100">
            Readiness: {wellnessData.score}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {wellnessData.message}
        </p>
        <div className="mt-2 flex gap-2">
          {wellnessData.readiness === 'low' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-100/50 px-2 py-1 rounded-md">
              <Droplets className="w-3 h-3" /> Focus on hydration
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}