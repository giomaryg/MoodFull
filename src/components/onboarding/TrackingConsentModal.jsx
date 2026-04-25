import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function TrackingConsentModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already responded
    const consent = localStorage.getItem('moodfull_tracking_consent');
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleConsent = (granted) => {
    localStorage.setItem('moodfull_tracking_consent', granted ? 'granted' : 'denied');
    setIsOpen(false);
    // If granted, we could initialize analytics here if needed.
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#f0f9f2] rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-[#6b9b76]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Personalized Experience</h2>
              <p className="text-sm text-gray-600">
                To help us deliver better recipe recommendations and improve our AI suggestions, we may ask for permission to track certain activity on the next screen. You are fully in control of your data.
              </p>
              
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={() => handleConsent(true)} 
                  className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl py-6 text-base font-semibold"
                >
                  Continue
                </Button>
                <Button 
                  onClick={() => handleConsent(false)} 
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-6 text-base font-semibold"
                >
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}