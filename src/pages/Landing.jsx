import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, Clock, Leaf, ArrowRight, UtensilsCrossed, Menu, X, 
  Brain, ShoppingCart, Activity, ShieldCheck, Download, Camera, Loader2,
  Calendar, LineChart
} from 'lucide-react';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <nav className="hidden md:flex items-center gap-8 text-[#5a6f60] font-medium">
          <a href="#why-moodfull" className="hover:text-[#6b9b76] transition-colors">Why MoodFull?</a>
          <a href="#how-it-works" className="hover:text-[#6b9b76] transition-colors">How it works</a>
          <a href="#takeout" className="hover:text-[#6b9b76] transition-colors">Takeout Alternatives</a>
          <a href="#faq" className="hover:text-[#6b9b76] transition-colors">FAQ</a>
        </nav>
        <div className="hidden md:block">
          <Button onClick={handleLogin} variant="outline" className="border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] rounded-full px-6">
            Sign In
          </Button>
        </div>
        <button 
          className="md:hidden text-[#3d5244] p-2" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Side Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-64 bg-white z-[70] shadow-2xl flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-800 p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-6 text-[#5a6f60] font-medium text-lg">
                <a href="#why-moodfull" onClick={() => setIsMobileMenuOpen(false)}>Why MoodFull?</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>How it works</a>
                <a href="#takeout" onClick={() => setIsMobileMenuOpen(false)}>Takeout Alternatives</a>
                <a href="#faq" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
                <div className="pt-6 border-t border-gray-100">
                  <Button onClick={handleLogin} variant="outline" className="w-full border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] rounded-full px-6 py-6 text-lg">
                    Sign In
                  </Button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-left"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-[#3d5244] tracking-tight mb-6 leading-tight">
                Your Next Meal Is 3 Seconds Away
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                MoodFull uses AI to instantly create meals based on your mood, health goals, and what’s already in your kitchen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center md:justify-start mb-4">
                <Button 
                  onClick={handleLogin} 
                  className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto shadow-lg shadow-[#6b9b76]/30 transition-all hover:scale-105"
                >
                  Generate My Meal
                </Button>
                <Button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} 
                  variant="outline"
                  className="border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all flex items-center gap-2"
                >
                  See how it works <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-500 font-medium">No planning. No stress. Free to start.</p>
            </motion.div>

            {/* LIVE-FEELING UI DEMO */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative h-[500px] w-full rounded-3xl bg-gradient-to-br from-[#e0ede4] to-[#f0f9f2] border border-[#c5d9c9] overflow-hidden flex flex-col items-center justify-center shadow-inner p-8">
                
                {/* Input Simulation */}
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20 space-y-6"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#e0ede4] w-64">
                    <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Mood</div>
                    <div className="flex gap-2 mb-4">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">🛋️ Lazy</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">🌧️ Stressed</span>
                    </div>
                    <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Pantry</div>
                    <div className="flex gap-2">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold">Eggs</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-semibold">Avocado</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#6b9b76] font-bold">
                    <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                  </div>
                </motion.div>

                {/* Result Simulation */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  className="bg-white rounded-[2rem] shadow-2xl w-72 border border-[#e0ede4] overflow-hidden z-10"
                >
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" className="h-48 w-full object-cover" alt="Recipe mockup" />
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-[#3d5244] leading-tight mb-2">15-Min Comfort Bowl</h3>
                    <div className="flex justify-between items-center text-sm font-semibold text-[#6b9b76] mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> 15m</span>
                      <span>Easy</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-gray-50 rounded-xl p-2 flex-1 text-center border border-gray-100">
                        <div className="font-bold text-gray-800">320</div>
                        <div className="text-xs text-gray-500">Cal</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 flex-1 text-center border border-gray-100">
                        <div className="font-bold text-gray-800">14g</div>
                        <div className="text-xs text-gray-500">Pro</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute bottom-12 right-12 bg-white p-4 rounded-2xl shadow-lg border border-[#e0ede4] z-30">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#6b9b76] rounded-full p-2 text-white">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#3d5244]">AI Magic</div>
                      <div className="text-xs text-gray-500">Perfect match found!</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* INSTANT VALUE STRIP */}
        <section className="bg-[#6b9b76] text-white py-6 border-y border-[#5a8a65]">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-6 font-medium text-sm md:text-base">
            <div className="flex items-center gap-2">⚡ Instant meals</div>
            <div className="flex items-center gap-2">🧠 Personalized to you</div>
            <div className="flex items-center gap-2">🥗 Healthier without effort</div>
            <div className="flex items-center gap-2">🛒 Uses what you already have</div>
          </div>
        </section>

        {/* CORE HOOK SECTION */}
        <section id="why-moodfull" className="bg-white py-24 border-t border-[#e0ede4] text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-[#3d5244] mb-8">Stop Overthinking Food</h2>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Most people don’t struggle with cooking.<br/>They struggle with deciding.
            </p>
            <p className="text-xl font-bold text-[#6b9b76] mb-8">MoodFull removes that completely.</p>
            
            <div className="inline-flex flex-col items-start text-left bg-[#f8faf8] p-8 rounded-3xl border border-[#e0ede4] shadow-sm mb-8">
              <ul className="space-y-4 text-lg text-gray-700 font-medium">
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> No more scrolling recipes</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> No more “what should I eat?”</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> No more defaulting to takeout</li>
              </ul>
            </div>
            
            <p className="text-2xl font-bold text-[#3d5244]">Just open the app—and get your answer instantly.</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-4">How It Works</h2>
              <p className="text-lg text-[#6b9b76] font-bold">Takes less than 10 seconds</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 items-start relative">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-[#c5d9c9] z-0 -mx-12"></div>
              
              <div className="relative z-10 bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4] text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#f0f9f2] rounded-full flex items-center justify-center text-[#6b9b76] font-bold text-2xl mb-6 shadow-sm border border-[#c5d9c9]">1</div>
                <h3 className="text-xl font-bold text-[#3d5244] mb-3">Choose your mood</h3>
                <p className="text-gray-600">Lazy, stressed, energetic—or type your own</p>
              </div>
              
              <div className="relative z-10 bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4] text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#f0f9f2] rounded-full flex items-center justify-center text-[#6b9b76] font-bold text-2xl mb-6 shadow-sm border border-[#c5d9c9]">2</div>
                <h3 className="text-xl font-bold text-[#3d5244] mb-3">Add what you have</h3>
                <p className="text-gray-600">Pantry scan or quick select</p>
              </div>
              
              <div className="relative z-10 bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4] text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#6b9b76] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md border border-[#5a8a65]"><Sparkles className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-[#3d5244] mb-3">Get your meal instantly</h3>
                <p className="text-gray-600">Full recipe, nutrition, steps</p>
              </div>
            </div>
          </div>
        </section>

        {/* TAKEOUT KILLER SECTION */}
        <section id="takeout" className="py-24 bg-[#fffcf7] border-t border-[#f2b769]/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-[#3d5244] mb-6">Craving Takeout? This Is Better.</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
              MoodFull turns your cravings into smarter meals.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
              <div className="bg-white rounded-3xl shadow-sm border border-[#e0ede4] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                <img src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/43aae0888_IMG_0129.jpg" alt="Lean turkey burger" className="h-56 w-full object-cover" />
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-medium line-through">Fast food burger</span>
                  </div>
                  <div className="text-[#6b9b76] font-bold text-lg flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 shrink-0" /> Lean turkey burger
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-[#e0ede4] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                <img src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/7c951bbb1_IMG_0130.jpg" alt="Zucchini noodles" className="h-56 w-full object-cover object-top" />
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-medium line-through">Creamy pasta</span>
                  </div>
                  <div className="text-[#6b9b76] font-bold text-lg flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 shrink-0" /> Zucchini noodles
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-[#e0ede4] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                <img src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/dd8894f01_IMG_0132.jpg" alt="Cauliflower pizza" className="h-56 w-full object-cover" />
                <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-medium line-through">Delivery pizza</span>
                  </div>
                  <div className="text-[#6b9b76] font-bold text-lg flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 shrink-0" /> Cauliflower crust pizza
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-2xl font-bold text-[#3d5244]">Eat what you love—without sacrificing your goals.</p>
          </div>
        </section>

        {/* PRODUCT VALUE (WHAT YOU ACTUALLY GET) */}
        <section className="bg-white py-24 border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-6">Not Just Recipes—Decisions Made For You</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                MoodFull instantly generates:
              </p>
              <ul className="space-y-4 text-gray-700 text-lg font-medium mb-8">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Full recipes</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Step-by-step instructions</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Nutrition breakdown</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Smart substitutions</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Appliance-based adjustments</li>
              </ul>
              <p className="text-2xl font-bold text-[#6b9b76]">All tailored to <em className="text-[#3d5244]">you</em>.</p>
            </div>
            <div className="bg-[#f0f9f2] p-8 rounded-3xl border border-[#c5d9c9] shadow-inner h-full min-h-[400px] flex items-center justify-center relative overflow-hidden">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 border border-[#e0ede4]">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#6b9b76]" />
                    <span className="font-bold text-gray-800">Your AI Chef</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg">Lemon Herb Salmon</div>
                      <div className="text-xs bg-[#f0f9f2] text-[#6b9b76] px-2 py-1 rounded-md font-bold">28g Protein</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Substitutions</div>
                      <div className="text-sm">Swap <span className="line-through text-gray-400">butter</span> for <span className="font-bold text-[#6b9b76]">olive oil</span></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* FEATURE STACK */}
        <section className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-12">Everything Works Together</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: <Sparkles className="w-6 h-6"/>, title: 'AI Recipe Generator' },
                { icon: <Camera className="w-6 h-6"/>, title: 'Smart Pantry Scanner' },
                { icon: <Clock className="w-6 h-6"/>, title: 'Weekly Meal Planning' },
                { icon: <Calendar className="w-6 h-6"/>, title: 'Apple Calendar Sync' },
                { icon: <Brain className="w-6 h-6"/>, title: 'AI Diet Assistant' },
                { icon: <UtensilsCrossed className="w-6 h-6"/>, title: 'Appliance Adaptation' },
                { icon: <Activity className="w-6 h-6"/>, title: 'Insights & Spending' },
                { icon: <LineChart className="w-6 h-6"/>, title: 'Mood & Rating History' }
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0ede4] flex flex-col items-center text-center gap-4 hover:border-[#6b9b76] transition-colors cursor-default">
                  <div className="w-12 h-12 bg-[#f0f9f2] rounded-full flex items-center justify-center text-[#6b9b76]">
                    {feature.icon}
                  </div>
                  <span className="font-bold text-[#3d5244]">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DIFFERENTIATION (EMOTIONAL EDGE) */}
        <section className="py-24 bg-[#3d5244] text-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">This Isn’t a Recipe App</h2>
            <p className="text-2xl text-[#f2b769] font-bold mb-12">It’s your personal food intelligence system.</p>
            
            <div className="max-w-3xl mx-auto bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20 mb-12">
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
                Most apps tell you what to eat.<br/>
                <span className="text-white font-bold text-3xl block mt-4">MoodFull understands <em className="text-[#6b9b76]">why you eat.</em></span>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <span className="bg-black/20 px-6 py-3 rounded-full">Mood-based personalization</span>
              <span className="bg-black/20 px-6 py-3 rounded-full">Real-time generation</span>
              <span className="bg-black/20 px-6 py-3 rounded-full">Pantry-aware meals</span>
              <span className="bg-black/20 px-6 py-3 rounded-full">Healthy takeout alternatives</span>
            </div>
          </div>
        </section>

        {/* PRODUCT SHOWCASE */}
        <section className="py-24 bg-white border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-4">Built for real life—not perfect routines.</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[#f8faf8] rounded-3xl p-6 border border-[#e0ede4] flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#c5d9c9] flex items-center justify-center text-[#6b9b76]"><Sparkles className="w-8 h-8"/></div>
                <div className="font-bold text-[#3d5244]">Recipe Screen</div>
              </div>
              <div className="bg-[#f8faf8] rounded-3xl p-6 border border-[#e0ede4] flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#c5d9c9] flex items-center justify-center text-[#6b9b76]"><Clock className="w-8 h-8"/></div>
                <div className="font-bold text-[#3d5244]">Planner Calendar</div>
              </div>
              <div className="bg-[#f8faf8] rounded-3xl p-6 border border-[#e0ede4] flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#c5d9c9] flex items-center justify-center text-[#6b9b76]"><Camera className="w-8 h-8"/></div>
                <div className="font-bold text-[#3d5244]">Pantry Scanner</div>
              </div>
              <div className="bg-[#f8faf8] rounded-3xl p-6 border border-[#e0ede4] flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#c5d9c9] flex items-center justify-center text-[#6b9b76]"><Activity className="w-8 h-8"/></div>
                <div className="font-bold text-[#3d5244]">Insights Dashboard</div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-24 bg-[#f0f9f2] border-t border-[#c5d9c9]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-[#3d5244] mb-12">What people are saying</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4]">
                <p className="text-lg text-gray-700 italic font-medium">"I stopped ordering takeout 4x a week."</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4]">
                <p className="text-lg text-gray-700 italic font-medium">"This actually made eating healthy easy."</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4]">
                <p className="text-lg text-gray-700 italic font-medium">"It feels like it reads my mind."</p>
              </div>
            </div>
            <a href="https://instagram.com/moodfullai" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-[#6b9b76] hover:text-[#3d5244] transition-colors text-lg">
              Follow the journey <ArrowRight className="w-5 h-5" /> @moodfullai
            </a>
          </div>
        </section>

        {/* BEHAVIORAL BENEFITS */}
        <section className="py-24 bg-white border-t border-[#e0ede4]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-[#3d5244] mb-6">Eat Better Without Trying Harder</h2>
            <p className="text-xl text-gray-600 mb-12">MoodFull helps you:</p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left mb-12">
              <div className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full"></div>
                <span className="text-lg font-bold text-gray-800">Reduce stress around food</span>
              </div>
              <div className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full"></div>
                <span className="text-lg font-bold text-gray-800">Avoid impulsive eating</span>
              </div>
              <div className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full"></div>
                <span className="text-lg font-bold text-gray-800">Stay consistent with your goals</span>
              </div>
              <div className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full"></div>
                <span className="text-lg font-bold text-gray-800">Improve energy levels</span>
              </div>
            </div>

            <p className="text-2xl font-bold text-[#6b9b76] italic">Without forcing discipline.</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem 
                question="How fast does it generate meals?" 
                answer="In seconds. No waiting." 
              />
              <FaqItem 
                question="Is MoodFull free?" 
                answer="Yes. Start free, upgrade anytime." 
              />
              <FaqItem 
                question="Do I need to cook?" 
                answer="No—get healthy takeout alternatives too." 
              />
              <FaqItem 
                question="Can it match my diet?" 
                answer="Yes—fully customizable to your needs." 
              />
            </div>
          </div>
        </section>

        {/* FINAL CTA (DARK SECTION) */}
        <section className="py-32 bg-[#1a231e] text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Stop Thinking About Food</h2>
            <p className="text-2xl text-[#6b9b76] font-bold mb-12">Let AI handle it—for you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 py-7 rounded-full text-xl w-full sm:w-auto shadow-[0_0_30px_rgba(107,155,118,0.3)] transition-all hover:scale-105 font-bold"
              >
                Generate My Meal
              </Button>
              <Button 
                onClick={handleLogin} 
                variant="outline"
                className="border-white/20 text-white bg-white/5 hover:bg-white/10 px-8 py-7 rounded-full text-xl w-full sm:w-auto transition-all font-bold backdrop-blur-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                Download MoodFull
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-[#1a231e] pt-4 pb-12 text-center text-white/50 text-sm flex flex-col items-center">
        <p className="mb-6 font-medium text-white/70">MoodFull — Eat what you love, just smarter.</p>
        <div className="flex gap-6 mb-8">
          <a href="/about" className="text-white/70 hover:text-white transition-colors">About Us</a>
          <a href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
        </div>
        <p className="mt-8 text-xs">© {new Date().getFullYear()} MoodFull. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-[#f8faf8] p-6 rounded-3xl border border-[#e0ede4] flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#6b9b76] shadow-sm mb-4 border border-[#e0ede4]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#3d5244]">{title}</h3>
      {desc && <p className="text-gray-600 mt-2">{desc}</p>}
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[#e0ede4] rounded-2xl overflow-hidden bg-[#f8faf8]">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left px-6 py-5 hover:bg-[#f0f9f2] flex justify-between items-center transition-colors"
      >
        <span className="font-bold text-[#3d5244] text-lg pr-4">{question}</span>
        <span className="text-[#6b9b76] text-2xl font-light leading-none shrink-0">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 py-5 bg-white text-gray-600 leading-relaxed border-t border-[#e0ede4]">
          {answer}
        </div>
      )}
    </div>
  );
}