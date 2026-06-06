import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, Clock, Leaf, ArrowRight, UtensilsCrossed, Menu, X, 
  Brain, ShoppingCart, Activity, ShieldCheck, Download, Camera, Loader2,
  Calendar, LineChart
} from 'lucide-react';
import FloatingSmartBowl from '@/components/landing/FloatingSmartBowl';
import MoodToMealOrb from '@/components/landing/MoodToMealOrb';
import TakeoutTransformation from '@/components/landing/TakeoutTransformation';
import AnalyticsCrystal from '@/components/landing/AnalyticsCrystal';
import PantryScannerVisualization from '@/components/landing/PantryScannerVisualization';

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
          <a href="#features" className="hover:text-[#6b9b76] transition-colors">Features</a>
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
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
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

            {/* 3D FLOATING BOWL HERO */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <FloatingSmartBowl />
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
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto px-6"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#3d5244] mb-8">Stop Overthinking Food</h2>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Most people don’t struggle with cooking.<br/>They struggle with deciding.
            </p>
            <p className="text-xl font-bold text-[#6b9b76] mb-8">MoodFull removes that completely.</p>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="inline-flex flex-col items-start text-left bg-[#f8faf8] p-8 rounded-3xl border border-[#e0ede4] shadow-sm mb-8 transition-transform"
            >
              <ul className="space-y-4 text-lg text-gray-700 font-medium">
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> No more scrolling recipes</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> No more “what should I eat?”</li>
                <li className="flex items-center gap-3"><X className="w-5 h-5 text-red-400" /> No more defaulting to takeout</li>
              </ul>
            </motion.div>
            
            <p className="text-2xl font-bold text-[#3d5244]">Just open the app—and get your answer instantly.</p>
          </motion.div>
        </section>



        {/* TAKEOUT KILLER SECTION */}
        <section id="takeout" className="py-24 bg-[#fffcf7] border-t border-[#f2b769]/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-[#3d5244] mb-6">Craving Takeout? This Is Better.</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
                MoodFull turns your cravings into smarter meals.
              </p>
            </motion.div>

            <div className="mb-12">
              <TakeoutTransformation />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-[#3d5244]"
            >
              Eat what you love—without sacrificing your goals.
            </motion.p>
          </div>
        </section>

        {/* PRODUCT VALUE (WHAT YOU ACTUALLY GET) */}
        <section className="bg-white py-24 border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-6">Not Just Recipes—Decisions Made For You</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                MoodFull instantly generates:
              </p>
              <motion.ul 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                className="space-y-4 text-gray-700 text-lg font-medium mb-8"
              >
                <motion.li variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Full recipes</motion.li>
                <motion.li variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Step-by-step instructions</motion.li>
                <motion.li variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Nutrition breakdown</motion.li>
                <motion.li variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Smart substitutions</motion.li>
                <motion.li variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Appliance-based adjustments</motion.li>
              </motion.ul>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-[#6b9b76]"
              >
                All tailored to <em className="text-[#3d5244]">you</em>.
              </motion.p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#f0f9f2] p-8 rounded-3xl border border-[#c5d9c9] shadow-inner h-full min-h-[400px] flex items-center justify-center relative overflow-hidden group"
            >
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 border border-[#e0ede4] transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(107,155,118,0.15)]"
               >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#6b9b76] animate-pulse" />
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
               </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FEATURE STACK */}
        <section id="features" className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-12"
            >
              Everything Works Together
            </motion.h2>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
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
                <motion.div 
                  key={i} 
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ scale: 1.05, borderColor: '#6b9b76', boxShadow: '0 10px 25px -5px rgba(107, 155, 118, 0.1)' }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0ede4] flex flex-col items-center text-center gap-4 transition-colors cursor-default"
                >
                  <div className="w-12 h-12 bg-[#f0f9f2] rounded-full flex items-center justify-center text-[#6b9b76]">
                    {feature.icon}
                  </div>
                  <span className="font-bold text-[#3d5244]">{feature.title}</span>
                </motion.div>
              ))}
            </motion.div>
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

        {/* ANALYTICS CRYSTAL DASHBOARD */}
        <section className="py-24 bg-white border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-4">A Premium View of Your Health</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Beautiful, floating analytics that adapt to your mood and history.
              </p>
            </motion.div>
            
            <AnalyticsCrystal />
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-[#3d5244] mb-6">Eat Better Without Trying Harder</h2>
              <p className="text-xl text-gray-600 mb-12">MoodFull helps you:</p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid md:grid-cols-2 gap-6 text-left mb-12"
            >
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4 hover:shadow-md hover:border-[#c5d9c9] transition-all">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full shrink-0 shadow-[0_0_10px_rgba(107,155,118,0.5)]"></div>
                <span className="text-lg font-bold text-gray-800">Reduce stress around food</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4 hover:shadow-md hover:border-[#c5d9c9] transition-all">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full shrink-0 shadow-[0_0_10px_rgba(107,155,118,0.5)]"></div>
                <span className="text-lg font-bold text-gray-800">Avoid impulsive eating</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4 hover:shadow-md hover:border-[#c5d9c9] transition-all">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full shrink-0 shadow-[0_0_10px_rgba(107,155,118,0.5)]"></div>
                <span className="text-lg font-bold text-gray-800">Stay consistent with your goals</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="bg-[#f8faf8] p-6 rounded-2xl border border-[#e0ede4] flex items-center gap-4 hover:shadow-md hover:border-[#c5d9c9] transition-all">
                <div className="w-3 h-3 bg-[#6b9b76] rounded-full shrink-0 shadow-[0_0_10px_rgba(107,155,118,0.5)]"></div>
                <span className="text-lg font-bold text-gray-800">Improve energy levels</span>
              </motion.div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-[#6b9b76] italic"
            >
              Without forcing discipline.
            </motion.p>
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto px-6 relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Stop Thinking About Food</h2>
            <p className="text-2xl text-[#6b9b76] font-bold mb-12">Let AI handle it—for you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 py-7 rounded-full text-xl w-full sm:w-auto shadow-[0_0_30px_rgba(107,155,118,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(107,155,118,0.5)] font-bold"
              >
                Generate My Meal
              </Button>
              <Button 
                onClick={handleLogin} 
                variant="outline"
                className="border-white/20 text-white bg-white/5 hover:bg-white/10 px-8 py-7 rounded-full text-xl w-full sm:w-auto transition-all font-bold backdrop-blur-sm hover:border-white/40"
              >
                <Download className="w-5 h-5 mr-2" />
                Download MoodFull
              </Button>
            </div>
          </motion.div>
        </section>

      </main>

      <footer className="bg-[#1a231e] pt-4 pb-12 text-center text-white/50 text-sm flex flex-col items-center">
        <p className="mb-6 font-medium text-white/70">MoodFull — Eat what you love, just smarter.</p>
        <div className="flex gap-6 mb-8">
          <a href="/about" className="text-white/70 hover:text-white transition-colors">About Us</a>
          <a href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</a>
          <a href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a>
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