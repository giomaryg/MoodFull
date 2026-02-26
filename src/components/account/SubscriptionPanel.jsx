import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Crown, ArrowUpCircle, ArrowDownCircle, XCircle, Receipt, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionPanel({ user, onUpgrade }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const isPremium = user?.is_premium;
  const planType = user?.plan_type || 'free'; // 'free', 'monthly', 'annual'

  const planDetails = {
    free: { label: 'Free', color: 'bg-gray-100 text-gray-700', price: '$0/mo' },
    monthly: { label: 'Premium Monthly', color: 'bg-[#e8f0ea] text-[#6b9b76]', price: '$9.99/mo' },
    annual: { label: 'Premium Annual', color: 'bg-amber-50 text-amber-700', price: '$4.99/mo' },
  };

  const current = planDetails[planType] || planDetails.free;

  const handleCancelSubscription = () => {
    toast.success('Cancellation request submitted. Your plan will remain active until the end of the billing period.');
    setShowCancelConfirm(false);
  };

  const billingDate = user?.billing_renewal_date
    ? new Date(user.billing_renewal_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="space-y-4"
    >
      {/* Current Plan */}
      <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-[#6b9b76] flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <Badge className={`${current.color} border-0 text-sm`}>{current.label}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="font-bold text-[#6b9b76]">{current.price}</p>
            </div>
          </div>

          {billingDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 px-1">
              <Receipt className="w-4 h-4 flex-shrink-0 text-[#6b9b76]" />
              <span>Next billing on <strong>{billingDate}</strong></span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-1">
            {!isPremium && (
              <Button
                onClick={onUpgrade}
                className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl flex items-center justify-between px-4"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4" />
                  Upgrade to Premium
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {isPremium && planType === 'monthly' && (
              <Button
                onClick={() => toast.info('Contact support to switch to annual billing and save 50%.')}
                variant="outline"
                className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl flex items-center justify-between px-4"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4" />
                  Switch to Annual (Save 50%)
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {isPremium && planType === 'annual' && (
              <Button
                onClick={() => toast.info('Contact support to switch to monthly billing.')}
                variant="outline"
                className="w-full border-2 border-[#c5d9c9] text-gray-600 hover:bg-gray-50 rounded-xl flex items-center justify-between px-4"
              >
                <span className="flex items-center gap-2">
                  <ArrowDownCircle className="w-4 h-4" />
                  Switch to Monthly
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}

            {isPremium && !showCancelConfirm && (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                variant="ghost"
                className="w-full text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </Button>
            )}

            {showCancelConfirm && (
              <div className="border-2 border-red-200 rounded-xl p-4 bg-red-50 space-y-3">
                <p className="text-sm text-red-700 font-medium">Are you sure? You'll lose access to all premium features.</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelSubscription}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm"
                  >
                    Yes, Cancel
                  </Button>
                  <Button
                    onClick={() => setShowCancelConfirm(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 text-sm"
                  >
                    Keep Plan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Info */}
      <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-[#6b9b76] flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPremium ? (
            <>
              <div className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-gradient-to-r from-blue-500 to-blue-700 rounded-md flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">•••• •••• •••• 4242</p>
                    <p className="text-xs text-gray-500">Expires 12/27</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#6b9b76] text-xs"
                  onClick={() => toast.info('Contact support to update your payment method.')}
                >
                  Update
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full border-2 border-[#c5d9c9] text-gray-600 hover:bg-gray-50 rounded-xl flex items-center justify-between px-4"
                onClick={() => toast.info('Billing history will be sent to your email.')}
              >
                <span className="flex items-center gap-2 text-sm">
                  <Receipt className="w-4 h-4" />
                  View Billing History
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2 italic">No billing information on file.</p>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-white border-2 border-[#c5d9c9] rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-[#6b9b76] flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: 'Change Password', action: () => toast.info('A password reset link will be sent to your email.') },
            { label: 'Two-Factor Authentication', action: () => toast.info('2FA settings coming soon.') },
            { label: 'Download My Data', action: () => toast.info('Your data export will be sent to your email within 24 hours.') },
            { label: 'Delete Account', action: () => toast.error('Contact support to delete your account.'), red: true },
          ].map(({ label, action, red }) => (
            <Button
              key={label}
              onClick={action}
              variant="outline"
              className={`w-full border-2 rounded-xl flex items-center justify-between px-4 text-sm ${
                red
                  ? 'border-red-200 text-red-500 hover:bg-red-50'
                  : 'border-[#c5d9c9] text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{label}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}