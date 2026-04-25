import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationConsentModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('moodfull_notification_consent');
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleConsent = async (granted) => {
    localStorage.setItem('moodfull_notification_consent', granted ? 'granted' : 'denied');
    setIsOpen(false);
    
    if (granted) {
      toast.success('Notifications enabled! You can change this in your account settings.');
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          await base44.auth.updateMe({
            notifications_enabled: true,
            notification_types: ['daily_reminder', 'promotions'],
            notification_methods: ['email']
          });
        }
      } catch (e) {
        // user not logged in or error
      }
    }
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
                <Bell className="w-8 h-8 text-[#6b9b76]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Stay in the Loop</h2>
              <p className="text-sm text-gray-600">
                Would you like to receive a daily reminder to log your mood and pick a meal for the evening?
              </p>
              
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={() => handleConsent(true)} 
                  className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl py-6 text-base font-semibold"
                >
                  Allow Notifications
                </Button>
                <Button 
                  onClick={() => handleConsent(false)} 
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-6 text-base font-semibold"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}