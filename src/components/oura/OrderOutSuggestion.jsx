import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, ExternalLink, ShoppingBag, ChevronRight, X } from 'lucide-react';
import { getOrderOutPattern } from '@/lib/ouraService';
import { Button } from '@/components/ui/button';

export default function OrderOutSuggestion({ user }) {
  const [pattern, setPattern] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show if user has consented to data usage (or if we want to show it generally, but let's tie it to Oura consent for now)
    if (user?.oura_connected && user?.oura_data_consent) {
      const data = getOrderOutPattern();
      setPattern(data);
    }
  }, [user]);

  if (!pattern?.isLikelyOrderOutDay || !isVisible) {
    return null;
  }

  const deliveryServices = [
    { name: 'Uber Eats', color: 'bg-green-600', hover: 'hover:bg-green-700' },
    { name: 'DoorDash', color: 'bg-red-500', hover: 'hover:bg-red-600' },
    { name: 'Grubhub', color: 'bg-orange-500', hover: 'hover:bg-orange-600' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8 bg-white rounded-3xl border-2 border-[#f2b769]/30 shadow-md overflow-hidden"
    >
      <div className="bg-gradient-to-r from-[#fffcf7] to-[#fdf5e6] p-6 border-b border-[#f2b769]/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#f2b769]/20 p-1.5 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-[#d4a373]" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Order Out Tonight?</h3>
            </div>
            <p className="text-gray-600 text-sm">
              {pattern.reason} Based on your current wellness data, we suggest these nourishing takeout options:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {pattern.suggestedCategories.map((cat, idx) => (
            <span key={idx} className="bg-white border border-[#f2b769]/40 text-[#d4a373] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-50/50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          Open Delivery App
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {deliveryServices.map((service) => (
            <Button
              key={service.name}
              variant="outline"
              className={`w-full justify-between border-gray-200 hover:border-transparent hover:text-white transition-all ${service.hover} group`}
              onClick={() => {
                // In a real app, these would be deep links like `ubereats://` or web URLs
                window.open(`https://www.google.com/search?q=${service.name}`, '_blank');
              }}
            >
              <span className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-gray-400 group-hover:text-white/80" />
                {service.name}
              </span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}