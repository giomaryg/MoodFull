import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFeatureAnnouncements } from '@/hooks/useFeatureAnnouncements';

export default function WhatsNewModal({ isReady = true }) {
  const { showAnnouncements, featuresToShow, acknowledgeFeatures, isAcknowledging } = useFeatureAnnouncements();

  const shouldShow = isReady && showAnnouncements && featuresToShow.length > 0;

  return (
    <AnimatePresence>
      {shouldShow && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 sm:px-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#c5d9c9] overflow-hidden"
          >
            <div className="px-6 pt-8 pb-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-[#6b9b76]/10 text-[#6b9b76] text-xs font-bold uppercase tracking-wider">
                  What's New
                </div>
                <h2 className="text-2xl font-bold text-[#3d5244] tracking-tight">Here's what's new in MoodFull</h2>
                <p className="text-gray-500 text-sm mt-2">We added a couple new features for you.</p>
              </div>

              <div className="space-y-4 mb-8">
                {featuresToShow.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="mt-1 bg-white p-2 rounded-xl shadow-sm text-[#6b9b76] shrink-0">
                        {Icon && <Icon className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={acknowledgeFeatures} 
                disabled={isAcknowledging}
                className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl py-6 text-base font-semibold transition-all shadow-sm"
              >
                {isAcknowledging ? 'Saving...' : 'Got it'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}