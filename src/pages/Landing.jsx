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
          <img 
            src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/1c2a0298b_MoodFull-2.png" 
            alt="MoodFull Logo" 
            className="h-10 w-auto object-contain"
          />
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
              Meal decision engine
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-[#3d5244] tracking-tight mb-6 leading-tight">
              Where every mood meets its perfect meal.<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6b9b76] to-[#4a7a55]">
                MoodFull does it for you.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Ditch the endless scrolling. Just tell us your vibe and what's in the fridge—we'll curate a tight lineup of 3–5 crave-worthy meals you can whip up right now. Zero decision fatigue, 100% satisfaction.
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
                You're drained. You're hungry. You stare blankly into the fridge and spiral into decision paralysis. Stop negotiating with yourself. MoodFull reads the room (and your ingredients) so you can just cook, eat, and vibe.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Sparkles className="w-6 h-6" />} 
                title="Drop your vibe" 
                desc="Burnt out? Buzzing? Craving pure comfort? We don't ask what you want to eat—we ask how you feel. Your mood is the ultimate recipe filter." 
              />
              <FeatureCard 
                icon={<Leaf className="w-6 h-6" />} 
                title="Hack your fridge" 
                desc="Snap a pic of your chaotic fridge. We hack your ingredients to find what's actually usable right now. Skip the grocery run." 
              />
              <FeatureCard 
                icon={<Clock className="w-6 h-6" />} 
                title="Vibe-matched menus" 
                desc="We filter out the noise and hand you 3-5 hyper-curated meals that match your exact vibe. Tap one and cook. No second-guessing allowed." 
              />
            </div>
          </div>
        </section>

        {/* Sneak Peeks Section */}
        <section className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-4">A sneak peek inside MoodFull</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Sleek, intuitive, and built to cut the BS out of cooking. See how we turn your mood into your next meal.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="bg-[#f0f9f2] p-8 rounded-3xl border border-[#c5d9c9] shadow-inner relative overflow-hidden h-80 flex flex-col justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-[#e0ede4] transform rotate-[-2deg] -mx-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">How are you feeling?</div>
                      <div className="text-xs text-gray-500">Pick a mood</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded-xl text-center text-xs font-medium border border-gray-100">Exhausted</div>
                    <div className="bg-green-50 p-2 rounded-xl text-center text-xs font-medium border border-green-200 text-green-700">Cozy</div>
                    <div className="bg-gray-50 p-2 rounded-xl text-center text-xs font-medium border border-gray-100">Energized</div>
                    <div className="bg-gray-50 p-2 rounded-xl text-center text-xs font-medium border border-gray-100">Stressed</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#3d5244] mb-4">Vibe-Synced Recipes</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Forget endless recipe scrolling. Our AI reads your emotional and physical state, instantly matching your exact vibe with the ultimate recipe to either elevate your energy or wrap you in pure comfort.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold text-[#3d5244] mb-4">Fake-Out Takeout</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  About to order delivery? Tell us what you're craving, and MoodFull will hack it into a faster, fresher, home-cooked alternative that hits the exact same spot without killing your goals or your wallet.
                </p>
              </div>
              <div className="bg-[#fffcf7] p-8 rounded-3xl border border-[#f2b769]/30 shadow-inner relative overflow-hidden h-80 flex flex-col justify-center order-1 md:order-2">
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-[#e0ede4] transform rotate-[2deg] -mx-4">
                  <div className="font-bold text-sm mb-3 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    Instead of ordering Pizza...
                  </div>
                  <div className="flex gap-3 mb-2">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                      <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&q=80" alt="Pizza" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#3d5244]">Cauliflower Crust Margherita</div>
                      <div className="text-xs text-gray-500 mt-1">25 min • 350 cals</div>
                      <div className="text-[10px] text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded-full mt-1">Saves $15</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-[#f0f9f2]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-16 text-center">Three steps to your next meal. No scrolling, no stress.</h2>
            
            <div className="space-y-12">
              <Step 
                number="01" 
                title="Set your status" 
                desc="Running on empty? Craving pure comfort? Short on time? We read your vibe first. No endless scrolling, no generic search bars." 
              />
              <Step 
                number="02" 
                title="We cut the noise" 
                desc="We cross-reference your current energy with your fridge inventory, cutting the noise to serve up a curated mini-menu. No doom-scrolling. No chef skills required." 
              />
              <Step 
                number="03" 
                title="Lock it in and cook" 
                desc="Pick your vibe and hit the kitchen. We guide you step-by-step from prep to plate. No overthinking, just great food that fits your mood." 
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
          <img 
            src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/1c2a0298b_MoodFull-2.png" 
            alt="MoodFull Logo" 
            className="h-8 w-auto object-contain grayscale"
          />
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