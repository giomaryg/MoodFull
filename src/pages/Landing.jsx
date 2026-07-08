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
    <div className="min-h-screen bg-[#FAFCFB] text-gray-800 flex flex-col font-sans overflow-x-hidden selection:bg-[#A29BE3] selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C1D7D0] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob" style={{animationDuration: "25s"}}></div>
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-[#E6DDF2] rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-blob" style={{animationDelay: "3s", animationDuration: "30s"}}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-[#DCEAF5] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob" style={{animationDelay: "6s", animationDuration: "28s"}}></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[#FCF5E3] rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob" style={{animationDelay: "9s", animationDuration: "22s"}}></div>
        
        {/* Subtle Organic Noise Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15] mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-[#FAFCFB]/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7A9F87] to-[#A29BE3] flex items-center justify-center shadow-[0_0_15px_rgba(162,155,227,0.3)]">
            <Orbit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">MoodFull</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-gray-500 font-medium text-sm">
          <a href="#why-moodfull" className="hover:text-gray-900 transition-colors">How it Thinks</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#takeout" className="hover:text-gray-900 transition-colors">Smart Takeout</a>
        </nav>
        <div className="hidden md:block">
          <Button onClick={handleLogin} variant="outline" className="border-[#A29BE3]/50 text-[#A29BE3] hover:bg-[#A29BE3]/10 hover:text-[#7A9F87] rounded-full px-6 transition-all bg-transparent">
            Get Started
          </Button>
        </div>
        <button 
          className="md:hidden text-gray-900 p-2" 
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
              className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#FAFCFB] border-l border-black/10 z-[70] shadow-2xl flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 p-2 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-6 text-gray-600 font-medium text-lg">
                <a href="#why-moodfull" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-900 transition-colors">How it Thinks</a>
                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-900 transition-colors">How it Works</a>
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-900 transition-colors">Features</a>
                <a href="#takeout" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-900 transition-colors">Smart Takeout</a>
                <div className="pt-6 border-t border-black/10">
                  <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-[#7A9F87] to-[#A29BE3] text-white hover:opacity-90 rounded-full px-6 py-6 text-lg transition-all shadow-[0_4px_14px_rgba(162,155,227,0.3)] border-0">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur-md border border-gray-200 text-[#7A9F87] text-sm font-mono mb-6 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#A29BE3] animate-pulse" />
                AI READY
              </div>
              <h1 className="text-6xl md:text-[5.5rem] lg:text-8xl font-serif text-gray-900 tracking-tighter mb-6 leading-[1.05]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A29BE3] to-[#89B6D9] font-sans font-bold italic">AI</span> decides<br/>
                what you should <span className="text-[#6DBE7C] italic font-serif">eat.</span>
              </h1>
              <p className="text-lg md:text-2xl text-gray-600 mb-8 leading-relaxed font-light max-w-xl">
                Skip the endless scrolling. Personalized restaurant and meal recommendations based on your mood, budget, location, and energy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center md:justify-start mb-6">
                <Button 
                  onClick={handleLogin} 
                  className="btn-shimmer bg-gradient-to-r from-[#7A9F87] to-[#A29BE3] text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto shadow-[0_8px_32px_rgba(162,155,227,0.3)] transition-all hover:scale-105 hover:shadow-[0_12px_40px_rgba(162,155,227,0.5)] font-bold"
                >
                  Find My Food
                </Button>
                <Button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} 
                  variant="outline"
                  className="border-gray-200 text-gray-700 bg-white/50 backdrop-blur-md hover:bg-white/80 px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all flex items-center gap-2"
                >
                  See How It Works <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 justify-center md:justify-start">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#7A9F87]"/> Restaurants</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#7A9F87]"/> Delivery</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#7A9F87]"/> Recipes</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#7A9F87]"/> Grocery ideas</span>
              </div>
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
        <section className="bg-white/40 backdrop-blur-md text-[#7A9F87] py-6 border-y border-black/5 font-mono tracking-widest uppercase text-xs sm:text-sm overflow-hidden relative flex">
          <motion.div 
            className="flex whitespace-nowrap w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-12 sm:gap-24 px-6 sm:px-12 items-center">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Takeout First</div>
                <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Cooking Second</div>
                <div className="flex items-center gap-2"><Brain className="w-4 h-4" /> AI Powered</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4" /> Decisions Always</div>
              </div>
            ))}
          </motion.div>
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
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">Stop Overthinking</h2>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed font-light">
              Most individuals do not struggle with the mechanics of cooking.<br/>They struggle with the stress of deciding what to eat.
            </p>
            <p className="text-xl font-bold text-[#7A9F87] mb-8 uppercase tracking-widest text-sm">Let AI Take the Wheel.</p>
            
            <motion.div 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.6)" }}
              className="inline-flex flex-col items-start text-left bg-white/40 p-8 rounded-3xl border border-white/60 shadow-xl backdrop-blur-xl mb-8 transition-all"
            >
              <ul className="space-y-4 text-lg text-gray-700 font-medium">
                <li className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><X className="w-4 h-4 text-red-500" /></div> Endless scrolling eliminated</li>
                <li className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><X className="w-4 h-4 text-red-500" /></div> Confusing cravings solved</li>
              </ul>
            </motion.div>
            
            <p className="text-2xl font-light text-gray-900">Open the app. Get your answer.</p>
          </motion.div>
        </section>

        {/* MOOD CAROUSEL */}
        <section id="how-it-works" className="py-32 bg-white/30 backdrop-blur-md border-y border-black/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#7A9F87] to-transparent opacity-30"></div>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Smart Mood Matching</h2>
              <p className="text-lg text-[#7A9F87] font-mono tracking-widest text-sm uppercase">Adapting perfectly to how you feel</p>
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
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">Smart Takeout Finder</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16 font-light">
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
              className="text-2xl font-light text-gray-900"
            >
              Eat what you love. No compromises.
            </motion.p>
          </div>
        </section>

        {/* PRODUCT VALUE (WHAT YOU ACTUALLY GET) */}
        <section className="py-32 bg-white/30 backdrop-blur-md border-y border-black/5">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Complete Meals, Not Just Recipes</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 font-light">
                MoodFull creates everything you need instantly:
              </p>
              <motion.ul 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
                className="space-y-6 text-gray-700 text-lg font-medium mb-8"
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
                    <div className="w-10 h-10 rounded-full bg-white/60 border border-white/80 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-[#7A9F87]" />
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
                className="text-2xl font-light text-gray-900"
              >
                Created specifically for <span className="font-bold text-[#7A9F87]">you</span>.
              </motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring" }}
              style={{ perspective: 1000 }}
              className="bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl h-full min-h-[400px] flex items-center justify-center relative overflow-hidden group"
            >
               <motion.div 
                 whileHover={{ scale: 1.05, rotateY: 0 }}
                 className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 border border-gray-100 transition-all duration-500"
               >
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Brain className="w-5 h-5 text-[#7A9F87] animate-pulse" />
                    <span className="font-mono text-sm tracking-widest text-gray-600 uppercase">AI Analysis</span>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg text-gray-800">Goal: Protein Rich</div>
                      <div className="text-xs bg-[#EAF2EC] text-[#7A9F87] px-3 py-1 rounded-md font-mono border border-[#C5DACD]">MATCH 98%</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-[#7A9F87] w-[98%] rounded-full shadow-[0_0_10px_rgba(122,159,135,0.5)]"></div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full w-5/6"></div>
                    </div>
                    <div className="pt-5 border-t border-gray-100 space-y-2">
                      <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">AI Log</div>
                      <div className="text-sm text-gray-600 font-light">Missing ingredient. Swapped <span className="line-through text-gray-400">butter</span> for <span className="text-[#7A9F87] font-bold">olive oil</span>.</div>
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
              className="text-3xl md:text-5xl font-bold text-gray-900 mb-16 tracking-tight"
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
                { icon: <Brain className="w-6 h-6"/>, title: 'AI Engine', desc: 'Analyzes your mood to generate precise food recommendations instantly.' },
                { icon: <MapPin className="w-6 h-6"/>, title: 'Location Tracker', desc: 'Maps out top-tier takeout options in your immediate vicinity.' },
                { icon: <Zap className="w-6 h-6"/>, title: 'Energy Matching', desc: 'Adjusts meal complexity based on how much effort you can spare.' },
                { icon: <Sparkles className="w-6 h-6"/>, title: 'Smart Results', desc: 'Provides full nutritional breakdowns and step-by-step instructions.' },
                { icon: <Camera className="w-6 h-6"/>, title: 'Pantry Scanner', desc: 'Uses your camera to identify ingredients you already have at home.' },
                { icon: <UtensilsCrossed className="w-6 h-6"/>, title: 'Smart Swaps', desc: 'Adapts recipes dynamically based on your available inventory.' },
                { icon: <Activity className="w-6 h-6"/>, title: 'Health Insights', desc: 'Monitors your nutritional intake and highlights wellness trends.' },
                { icon: <LineChart className="w-6 h-6"/>, title: 'Mood History', desc: 'Tracks how your feelings correlate with your eating habits over time.' }
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  variants={{ hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)" } }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.8)", borderColor: "rgba(122,159,135,0.3)" }}
                  className="bg-white/40 p-8 rounded-3xl border border-white/60 shadow-lg flex flex-col items-center text-center gap-4 transition-all cursor-default backdrop-blur-xl"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-[#7A9F87] shadow-sm shrink-0">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-800 tracking-wide text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ANALYTICS CRYSTAL DASHBOARD */}
        <section className="py-32 bg-white/30 backdrop-blur-md border-y border-black/5">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Your Health Dashboard</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                Beautiful data visualizations that adapt to your mood and history.
              </p>
            </motion.div>
            
            <AnalyticsCrystal />
          </div>
        </section>

        {/* FINAL CTA (DARK SECTION) */}
        <section className="py-40 relative overflow-hidden text-center flex flex-col items-center justify-center border-t border-black/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#D4E4E6] to-transparent rounded-full mix-blend-multiply filter blur-[150px] opacity-60 pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring" }}
            className="max-w-3xl mx-auto px-6 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-[#7A9F87] shadow-sm text-sm font-mono mb-8 uppercase tracking-widest">
              <Brain className="w-4 h-4 text-[#A29BE3]" /> Intelligence Ready
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-gray-900">Stop Guessing</h2>
            <p className="text-2xl text-gray-600 font-light mb-12">Let our AI find the perfect meal for you.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                className="bg-gradient-to-r from-[#7A9F87] to-[#A29BE3] text-white hover:opacity-90 px-10 py-7 rounded-full text-xl w-full sm:w-auto shadow-[0_8px_32px_rgba(162,155,227,0.3)] transition-all hover:scale-105 font-bold"
              >
                Start Now
              </Button>
              <Button 
                onClick={handleLogin} 
                variant="outline"
                className="border-gray-200 text-gray-700 bg-white/60 hover:bg-white/90 px-10 py-7 rounded-full text-xl w-full sm:w-auto transition-all font-medium backdrop-blur-md hover:border-gray-300"
              >
                <Download className="w-5 h-5 mr-3" />
                Download App
              </Button>
            </div>
          </motion.div>
        </section>

      </main>

      <footer className="bg-white/40 backdrop-blur-md pt-12 pb-12 text-center text-gray-500 text-sm flex flex-col items-center border-t border-black/5 relative z-10 font-mono uppercase tracking-widest">
        <p className="mb-8 font-bold text-gray-400 tracking-[0.2em]">MoodFull — Eat Smarter.</p>
        <div className="flex gap-8 mb-12">
          <a href="/about" className="hover:text-gray-800 transition-colors">About</a>
          <a href="/contact" className="hover:text-gray-800 transition-colors">Contact</a>
          <a href="/privacy" className="hover:text-gray-800 transition-colors">Privacy</a>
        </div>
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} MoodFull Systems. All rights reserved.</p>
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