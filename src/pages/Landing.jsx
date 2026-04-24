import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ChefHat, Sparkles, Clock, Leaf, ArrowRight, UtensilsCrossed } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#e0ede4]">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#6b9b76] rounded-xl">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-[#3d5244]">MoodFull</span>
        </div>
        <Button onClick={handleLogin} variant="outline" className="border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] rounded-full px-6">
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[#6b9b76] font-semibold tracking-wider uppercase text-sm mb-4 block">
              Dinner decision engine
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-[#3d5244] tracking-tight mb-6 leading-tight">
              Stop deciding what to cook.<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6b9b76] to-[#4a7a55]">
                MoodFull decides for you.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Tell MoodFull how tonight feels and what you already have. We'll pick exactly 3–5 dinners you can actually cook tonight. Not 50 options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto shadow-lg shadow-[#6b9b76]/30 transition-all hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#6b9b76]" /> AI-Powered</div>
              <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-[#6b9b76]" /> Messy fridges welcome</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#6b9b76]" /> Built for busy people</div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24 border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-4">Deciding what to cook shouldn't feel this hard.</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                You're tired. You're hungry. You open the fridge and ask yourself "what should I cook tonight?" - then spend 20 minutes negotiating with yourself. MoodFull makes the dinner decision so you can just cook and move on.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Sparkles className="w-6 h-6" />} 
                title="Tell us how you feel" 
                desc="Exhausted? Energized? Craving something light? MoodFull starts with your energy level, not a search bar." 
              />
              <FeatureCard 
                icon={<Leaf className="w-6 h-6" />} 
                title="Cook with what you have" 
                desc="Snap a photo of your fridge. We figure out what's usable and what's realistic. No grocery run needed." 
              />
              <FeatureCard 
                icon={<Clock className="w-6 h-6" />} 
                title="3-5 realistic options" 
                desc="We narrow it down to a few dinners you can actually cook tonight. Pick one and go. No second-guessing." 
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-[#f0f9f2]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-16 text-center">Three steps to dinner. No scrolling, no stress.</h2>
            
            <div className="space-y-12">
              <Step 
                number="01" 
                title="Tell MoodFull how tonight feels" 
                desc="Tired? Craving something specific? Short on time? MoodFull starts with you, not a search bar." 
              />
              <Step 
                number="02" 
                title="We narrow it down" 
                desc="Based on your time, energy, and what's already in your kitchen. No scrolling. No unrealistic options." 
              />
              <Step 
                number="03" 
                title="You pick once and move on" 
                desc="Choose one and start cooking. No second-guessing. We'll give you step-by-step instructions." 
              />
            </div>
            
            <div className="mt-20 text-center">
              <Button 
                onClick={handleLogin} 
                className="bg-[#3d5244] hover:bg-[#2c3b31] text-white px-8 py-6 rounded-full text-lg shadow-lg transition-all hover:scale-105"
              >
                Start deciding faster
                <UtensilsCrossed className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-[#e0ede4] py-8 text-center text-gray-500 text-sm flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 opacity-50">
          <ChefHat className="w-5 h-5" />
          <span className="font-bold text-lg">MoodFull</span>
        </div>
        <p>© {new Date().getFullYear()} MoodFull. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-[#f8faf8] p-8 rounded-3xl border border-[#e0ede4] hover:shadow-md transition-shadow">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#6b9b76] shadow-sm mb-6 border border-[#e0ede4]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#3d5244] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="flex gap-6 items-start bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4]">
      <div className="text-5xl font-bold text-[#6b9b76]/20 pt-1 shrink-0">{number}</div>
      <div>
        <h3 className="text-2xl font-bold text-[#3d5244] mb-2">{title}</h3>
        <p className="text-lg text-gray-600">{desc}</p>
      </div>
    </div>
  );
}