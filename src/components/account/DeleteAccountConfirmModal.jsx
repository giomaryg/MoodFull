import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DeleteAccountConfirmModal({ isOpen, onClose, onConfirm, isDeleting }) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText === 'DELETE') {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isDeleting}>
            <X className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Account</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          This action cannot be undone. All your saved recipes, meal plans, inventory items, and preferences will be permanently deleted.
        </p>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Please type <span className="font-bold text-red-600">DELETE</span> to confirm.
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="border-gray-300"
            disabled={isDeleting}
          />
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1" 
            disabled={confirmText !== 'DELETE' || isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : 'Delete My Account'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}