import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Infinity, Star, Lock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    id: 'annual',
    label: 'Annual',
    badge: 'Best Value — Save 17%',
    price: '$79.99',
    period: 'year',
    monthly: '$6.67/mo',
    highlight: true,
  },
  {
    id: 'monthly',
    label: 'Monthly',
    badge: null,
    price: '$7.99',
    period: 'month',
    monthly: null,
    highlight: false,
  },
];

const FEATURES = [
  { label: 'Moods available', free: '3 moods', premium: 'Unlimited' },
  { label: 'Recipes per session', free: '8–10', premium: 'Unlimited' },
  { label: 'Meal planner', free: true, premium: true },
  { label: 'Shopping list', free: false, premium: true },
  { label: 'Save recipes', free: false, premium: true },
  { label: 'Personalized preferences', free: false, premium: true },
  { label: 'AI-powered recommendations', free: false, premium: true },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', text: '"I used to spend 20 minutes deciding what to cook. Now it takes 10 seconds."', stars: 5 },
  { name: 'James R.', text: '"Best $8 I spend every month. Dinner stress is gone."', stars: 5 },
];

export default function Paywall({ onClose, onSubscribe }) {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [showFaq, setShowFaq] = useState(false);

  const plan = PLANS.find(p => p.id === selectedPlan);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[96vh] overflow-y-auto shadow-2xl"
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-[#6b9b76] via-[#7aab85] to-[#5a8a65] px-6 pt-10 pb-8 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {['🥑','🍋','🌿','🫐','🍊','🌾','🍓','🧄'].map((emoji, i) => (
              <span key={i} className="absolute text-2xl select-none" style={{
                top: `${Math.random() * 80}%`,
                left: `${(i / 8) * 100}%`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`
              }}>{emoji}</span>
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Lock className="w-3 h-3" /> You've reached your free limit
            </div>

            <h2 className="text-white text-3xl font-bold leading-tight mb-2" style={{ fontFamily: 'Italiana, serif' }}>
              Never stress about<br />dinner again.
            </h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-xs mx-auto">
              You've already felt the magic. Unlock unlimited moods, recipes, and calm — every single day.
            </p>
          </motion.div>
        </div>

        {/* Social proof strip */}
        <div className="bg-[#f5f9f6] border-b border-[#e0ede4] px-6 py-3 flex items-center justify-center gap-4">
          <div className="flex -space-x-2">
            {['🧑‍🍳','👩‍🍳','🧑‍🍳'].map((e, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-[#c5d9c9] border-2 border-white flex items-center justify-center text-sm">{e}</div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            <span className="text-[#6b9b76] font-semibold">4,200+ people</span> cook with less stress every week
          </p>
        </div>

        <div className="px-5 py-6 space-y-5">

          {/* Plan Toggle */}
          <div className="space-y-3">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 relative ${
                  selectedPlan === p.id
                    ? 'border-[#6b9b76] bg-[#f0f9f2] shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#a8cdb0]'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 right-4 bg-[#6b9b76] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlan === p.id ? 'border-[#6b9b76] bg-[#6b9b76]' : 'border-gray-300'
                    }`}>
                      {selectedPlan === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.label}</p>
                      {p.monthly && <p className="text-xs text-[#6b9b76] font-medium">{p.monthly} billed annually</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{p.price}</p>
                    <p className="text-xs text-gray-400">per {p.period}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Button
              onClick={() => onSubscribe?.(selectedPlan, 'card')}
              className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white text-base font-semibold py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
              {selectedPlan === 'annual' ? (
                <div className="flex items-center">
                  <span>Start for $6.67/mo</span>
                  <span className="text-xs font-normal opacity-80 ml-1.5">— Billed Annually</span>
                </div>
              ) : (
                <span>Start for $7.99/month</span>
              )}
            </Button>
            
            <div className="flex gap-3">
              <Button
                onClick={() => onSubscribe?.(selectedPlan, 'apple_pay')}
                variant="outline"
                className="flex-1 bg-black hover:bg-gray-900 text-white border-0 py-6 rounded-2xl transition-all"
              >
                <svg viewBox="0 0 448 512" className="h-5 w-5 mr-2 fill-white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                Pay
              </Button>
              <Button
                onClick={() => onSubscribe?.(selectedPlan, 'samsung_pay')}
                variant="outline"
                className="flex-1 bg-[#1428a0] hover:bg-[#0f1d7a] text-white border-0 py-6 rounded-2xl transition-all font-bold tracking-tight"
              >
                SAMSUNG Pay
              </Button>
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-2">
              Cancel anytime · No commitment
            </p>
          </motion.div>

          {/* Comparison Table */}
          <div className="rounded-2xl border border-[#e0ede4] overflow-hidden">
            <div className="grid grid-cols-3 bg-[#f5f9f6] px-4 py-2 text-xs font-semibold text-gray-500">
              <span className="col-span-1">Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center text-[#6b9b76]">Premium</span>
            </div>
            {FEATURES.map((f, i) => (
              <div key={i} className={`grid grid-cols-3 px-4 py-2.5 text-xs items-center ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafcfb]'}`}>
                <span className="text-gray-600 col-span-1">{f.label}</span>
                <span className="text-center">
                  {typeof f.free === 'boolean'
                    ? f.free ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                    : <span className="text-gray-500">{f.free}</span>
                  }
                </span>
                <span className="text-center">
                  {typeof f.premium === 'boolean'
                    ? f.premium ? <Check className="w-4 h-4 text-[#6b9b76] mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                    : <span className="font-semibold text-[#6b9b76] flex items-center justify-center gap-0.5">
                        <Infinity className="w-3.5 h-3.5" />
                      </span>
                  }
                </span>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="space-y-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#f5f9f6] rounded-2xl px-4 py-3">
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed">{t.text}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">— {t.name}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <button
            onClick={() => setShowFaq(v => !v)}
            className="w-full flex items-center justify-between text-sm text-gray-500 py-1"
          >
            <span>Questions? See our FAQ</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFaq ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFaq && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3 text-xs text-gray-500"
              >
                {[
                  { q: 'Can I cancel anytime?', a: 'Yes, absolutely. Cancel from your account settings and you won\'t be charged again.' },
                  { q: 'What happens to my recipes if I cancel?', a: 'Your saved recipes stay yours. You just lose access to generating new ones.' },
                  { q: 'Is there a free trial?', a: 'Your free experience already lets you explore. Premium starts with your first payment — no hidden trial fees.' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="font-semibold text-gray-700 mb-1">{item.q}</p>
                    <p>{item.a}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust footer */}
          <p className="text-center text-[11px] text-gray-400 pb-2">
            Secure payment · Privacy protected · Made with care 🌿
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}