import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, ArrowRight, Menu, X, 
  Brain, Activity, Download, Camera, Loader2,
  LineChart, MapPin, Zap, Orbit, Check, UtensilsCrossed
} from 'lucide-react';
import DecisionWidgetMockup from '@/components/landing/DecisionWidgetMockup';
import TakeoutTransformation from '@/components/landing/TakeoutTransformation';
import AnalyticsCrystal from '@/components/landing/AnalyticsCrystal';
import MoodCarousel from '@/components/landing/MoodCarousel';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-[#0A0D10] text-[#E0EDE4] flex flex-col font-sans overflow-x-hidden selection:bg-[#6DBE7C] selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#183525] mix-blend-screen filter blur-[100px] animate-pulse opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#122A1E] mix-blend-screen filter blur-[150px] animate-pulse opacity-40 delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-[#0A0D10]/50 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A6B4F] to-[#6DBE7C] flex items-center justify-center shadow-[0_0_15px_rgba(109,190,124,0.3)]">
            <Orbit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MoodFull</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[#A8C7B3] font-medium text-sm">
          <a href="#why-moodfull" className="hover:text-white transition-colors">How it Thinks</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#takeout" className="hover:text-white transition-colors">Smart Takeout</a>
        </nav>
        <div className="hidden md:block">
          <Button onClick={handleLogin} variant="outline" className="border-[#3A6B4F] text-[#6DBE7C] hover:bg-[#3A6B4F]/20 hover:text-white rounded-full px-6 transition-all bg-transparent">
            Get Started
          </Button>
        </div>
        <button 
          className="md:hidden text-white p-2" 
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#0E1511] border-l border-white/10 z-[70] shadow-2xl flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-2 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-6 text-[#A8C7B3] font-medium text-lg">
                <a href="#why-moodfull" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors">How it Thinks</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors">How it Works</a>
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</a>
                <a href="#takeout" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors">Smart Takeout</a>
                <div className="pt-6 border-t border-white/10">
                  <Button onClick={handleLogin} className="w-full bg-[#3A6B4F] text-white hover:bg-[#6DBE7C] rounded-full px-6 py-6 text-lg transition-all shadow-[0_0_20px_rgba(58,107,79,0.3)] border-0">
                    Get Started
                  </Button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 relative z-10">
        {/* HERO SECTION */}
        <section className="px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183525] border border-[#3A6B4F] text-[#6DBE7C] text-sm font-mono mb-6">
                <div className="w-2 h-2 rounded-full bg-[#6DBE7C] animate-pulse" />
                AI READY
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                AI Decides.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6DBE7C] to-[#3A6B4F]">You Enjoy.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#A8C7B3] mb-8 leading-relaxed font-light">
                An AI decision engine that finds your perfect meal based on your mood, budget, and energy. We check takeout first, then recipes. No more guessing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center md:justify-start mb-4">
                <Button 
                  onClick={handleLogin} 
                  className="bg-white text-[#0A0D10] px-8 py-6 rounded-full text-lg w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:scale-105 font-bold"
                >
                  Find My Food
                </Button>
                <Button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} 
                  variant="outline"
                  className="border-white/20 text-white bg-transparent hover:bg-white/5 px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all flex items-center gap-2"
                >
                  See How It Works <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-white/40 font-mono">ZERO EFFORT. INSTANT RESULTS.</p>
            </motion.div>

            {/* DECISION WIDGET HERO */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
              style={{ perspective: 1000 }}
              className="relative hidden md:block"
            >
              <DecisionWidgetMockup />
            </motion.div>
          </div>
        </section>

        {/* INSTANT VALUE STRIP */}
        <section className="bg-[#0E1511] text-[#6DBE7C] py-6 border-y border-white/5 font-mono tracking-widest uppercase text-xs sm:text-sm">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-6">
            <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Takeout First</div>
            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Cooking Second</div>
            <div className="flex items-center gap-2"><Brain className="w-4 h-4" /> AI Powered</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4" /> Decisions Always</div>
          </div>
        </section>

        {/* CORE HOOK SECTION */}
        <section id="why-moodfull" className="py-32 relative overflow-hidden text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto px-6 relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Stop Overthinking</h2>
            <p className="text-xl text-[#A8C7B3] mb-6 leading-relaxed font-light">
              Most individuals do not struggle with the mechanics of cooking.<br/>They struggle with the stress of deciding what to eat.
            </p>
            <p className="text-xl font-bold text-[#6DBE7C] mb-8 uppercase tracking-widest text-sm">Let AI Take the Wheel.</p>
            
            <motion.div 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
              className="inline-flex flex-col items-start text-left bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm mb-8 transition-all"
            >
              <ul className="space-y-4 text-lg text-gray-300 font-medium">
                <li className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"><X className="w-4 h-4 text-red-400" /></div> Endless scrolling eliminated</li>
                <li className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"><X className="w-4 h-4 text-red-400" /></div> Confusing cravings solved</li>
              </ul>
            </motion.div>
            
            <p className="text-2xl font-light text-white">Open the app. Get your answer.</p>
          </motion.div>
        </section>

        {/* MOOD CAROUSEL */}
        <section id="how-it-works" className="py-32 bg-[#0E1511] border-y border-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#6DBE7C] to-transparent opacity-30"></div>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Smart Mood Matching</h2>
              <p className="text-lg text-[#6DBE7C] font-mono tracking-widest text-sm uppercase">Adapting perfectly to how you feel</p>
            </motion.div>
            
            <MoodCarousel />
          </div>
        </section>

        {/* TAKEOUT KILLER SECTION */}
        <section id="takeout" className="py-32 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Smart Takeout Finder</h2>
              <p className="text-xl text-[#A8C7B3] max-w-3xl mx-auto leading-relaxed mb-16 font-light">
                The best options from restaurants near you — found in milliseconds.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <TakeoutTransformation />
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-2xl font-light text-white"
            >
              Eat what you love. No compromises.
            </motion.p>
          </div>
        </section>

        {/* PRODUCT VALUE (WHAT YOU ACTUALLY GET) */}
        <section className="py-32 bg-[#0E1511] border-y border-white/5">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Complete Meals, Not Just Recipes</h2>
              <p className="text-lg text-[#A8C7B3] leading-relaxed mb-8 font-light">
                MoodFull creates everything you need instantly:
              </p>
              <motion.ul 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                className="space-y-6 text-gray-300 text-lg font-medium mb-8"
              >
                {[
                  "Full nutritional breakdowns",
                  "Clear, step-by-step instructions",
                  "Smart ingredient swaps based on your pantry",
                  "Adjustments for your kitchen appliances"
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} 
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#6DBE7C]" />
                    </div>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 1 }}
                className="text-2xl font-light text-white"
              >
                Created specifically for <span className="font-bold text-[#6DBE7C]">you</span>.
              </motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
              style={{ perspective: 1000 }}
              className="bg-gradient-to-br from-[#183525] to-[#0A0D10] p-8 rounded-3xl border border-white/10 shadow-2xl h-full min-h-[400px] flex items-center justify-center relative overflow-hidden group"
            >
               <motion.div 
                 whileHover={{ scale: 1.05, rotateY: 0 }}
                 className="bg-[#0E1511] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 border border-white/10 transition-all duration-500"
               >
                  <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3 backdrop-blur-md">
                    <Brain className="w-5 h-5 text-[#6DBE7C] animate-pulse" />
                    <span className="font-mono text-sm tracking-widest text-white uppercase">AI Analysis</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg text-white">Goal: Protein Rich</div>
                      <div className="text-xs bg-[#183525] text-[#6DBE7C] px-3 py-1 rounded-md font-mono border border-[#3A6B4F]">MATCH 98%</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-[#6DBE7C] w-[98%] rounded-full shadow-[0_0_10px_#6DBE7C]"></div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full w-5/6"></div>
                    </div>
                    <div className="pt-5 border-t border-white/5 space-y-2">
                      <div className="text-xs font-mono text-[#A8C7B3] uppercase tracking-wider">AI Log</div>
                      <div className="text-sm text-gray-400 font-light">Missing ingredient. Swapped <span className="line-through text-white/40">butter</span> for <span className="text-[#6DBE7C] font-bold">olive oil</span>.</div>
                    </div>
                  </div>
               </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FEATURE STACK */}
        <section id="features" className="py-32 relative">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white mb-16 tracking-tight"
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
                { icon: <Brain className="w-6 h-6"/>, title: 'AI Engine' },
                { icon: <MapPin className="w-6 h-6"/>, title: 'Location Tracker' },
                { icon: <Zap className="w-6 h-6"/>, title: 'Energy Matching' },
                { icon: <Sparkles className="w-6 h-6"/>, title: 'Smart Results' },
                { icon: <Camera className="w-6 h-6"/>, title: 'Pantry Scanner' },
                { icon: <UtensilsCrossed className="w-6 h-6"/>, title: 'Smart Swaps' },
                { icon: <Activity className="w-6 h-6"/>, title: 'Health Insights' },
                { icon: <LineChart className="w-6 h-6"/>, title: 'Mood History' }
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  variants={{ hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)" } }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(109,190,124,0.5)" }}
                  className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center gap-6 transition-all cursor-default backdrop-blur-sm"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#183525] to-[#0A0D10] border border-[#3A6B4F] rounded-2xl flex items-center justify-center text-[#6DBE7C] shadow-[0_0_15px_rgba(58,107,79,0.5)]">
                    {feature.icon}
                  </div>
                  <span className="font-medium text-gray-200 tracking-wide">{feature.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ANALYTICS CRYSTAL DASHBOARD */}
        <section className="py-32 bg-[#0E1511] border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Your Health Dashboard</h2>
              <p className="text-xl text-[#A8C7B3] max-w-2xl mx-auto font-light">
                Beautiful data visualizations that adapt to your mood and history.
              </p>
            </motion.div>
            
            <AnalyticsCrystal />
          </div>
        </section>

        {/* FINAL CTA (DARK SECTION) */}
        <section className="py-40 relative overflow-hidden text-center flex flex-col items-center justify-center border-t border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#183525] to-transparent rounded-full mix-blend-screen filter blur-[150px] opacity-40 pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring" }}
            className="max-w-3xl mx-auto px-6 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-mono mb-8 uppercase tracking-widest">
              <Brain className="w-4 h-4 text-[#6DBE7C]" /> Intelligence Ready
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white">Stop Guessing</h2>
            <p className="text-2xl text-[#A8C7B3] font-light mb-12">Let our AI find the perfect meal for you.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                className="bg-white text-[#0A0D10] hover:bg-[#E0EDE4] px-10 py-7 rounded-full text-xl w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 font-bold"
              >
                Start Now
              </Button>
              <Button 
                onClick={handleLogin} 
                variant="outline"
                className="border-white/20 text-white bg-white/5 hover:bg-white/10 px-10 py-7 rounded-full text-xl w-full sm:w-auto transition-all font-medium backdrop-blur-md hover:border-white/40"
              >
                <Download className="w-5 h-5 mr-3" />
                Download App
              </Button>
            </div>
          </motion.div>
        </section>

      </main>

      <footer className="bg-[#050709] pt-12 pb-12 text-center text-[#A8C7B3] text-sm flex flex-col items-center border-t border-white/5 relative z-10 font-mono uppercase tracking-widest">
        <p className="mb-8 font-bold text-white/50 tracking-[0.2em]">MoodFull — Eat Smarter.</p>
        <div className="flex gap-8 mb-12">
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        </div>
        <p className="text-xs text-white/20">© {new Date().getFullYear()} MoodFull Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left px-6 py-6 flex justify-between items-center transition-colors"
      >
        <span className="font-medium text-white text-lg pr-4">{question}</span>
        <span className="text-[#6DBE7C] text-2xl font-light leading-none shrink-0">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="px-6 py-6 bg-black/20 text-[#A8C7B3] leading-relaxed border-t border-white/5 font-light">
          {answer}
        </div>
      )}
    </div>
  );
}