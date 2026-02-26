import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { CreditCard, AlertCircle, CheckCircle2, Receipt, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingPanel({ isOpen, onClose, user }) {
  const [isCancelling, setIsCancelling] = useState(false);
  const isPremium = user?.is_premium;

  const handleCancelSubscription = () => {
    // In a real app, this would call a backend function to cancel the subscription
    toast.success('Your subscription cancellation request has been received.');
    setIsCancelling(false);
    onClose();
  };

  const handleChangeSubscription = () => {
    // In a real app, this would redirect to a customer portal like Stripe
    toast.info('Redirecting to subscription management portal...');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-white">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-[#6b9b76] flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Billing & Subscription
          </SheetTitle>
          <SheetDescription>
            Manage your subscription, billing details, and payment methods.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Current Plan Section */}
          <div className="p-5 bg-[#f5f9f6] border border-[#e0ede4] rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Current Plan</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isPremium ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium text-gray-800">
                  {isPremium ? 'Premium Plan' : 'Free Plan'}
                </span>
              </div>
              <span className="text-sm font-bold text-[#6b9b76]">
                {isPremium ? '$7.99 / month' : '$0.00'}
              </span>
            </div>

            {isPremium && (
              <div className="text-sm text-gray-600 flex items-center gap-2 mb-6">
                <Calendar className="w-4 h-4" />
                Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleChangeSubscription}
                className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl"
              >
                {isPremium ? 'Change Subscription' : 'Upgrade to Premium'}
              </Button>
              
              {isPremium && (
                <Button 
                  onClick={() => setIsCancelling(true)}
                  variant="outline" 
                  className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-xl"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>

          {/* Cancellation Confirmation */}
          {isCancelling && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <p className="text-sm text-red-800 font-medium">Are you sure you want to cancel? You will lose access to premium features at the end of your billing cycle.</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleCancelSubscription}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  Yes, Cancel
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsCancelling(false)}
                  className="flex-1 bg-white border-red-200 text-red-700"
                >
                  Keep Plan
                </Button>
              </div>
            </div>
          )}

          {/* Payment Method */}
          {isPremium && (
            <div className="p-5 bg-white border border-[#c5d9c9] rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold italic">VISA</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Visa ending in 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/2025</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[#6b9b76] hover:bg-[#f0f9f2]" onClick={handleChangeSubscription}>
                  Edit
                </Button>
              </div>
            </div>
          )}

          {/* Billing History */}
          {isPremium && (
            <div className="p-5 bg-white border border-[#c5d9c9] rounded-2xl">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Billing History</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Monthly Plan</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">$7.99</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#6b9b76]">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}