import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, Clock, Leaf, ArrowRight, UtensilsCrossed, Menu, X, 
  Brain, ShoppingCart, Activity, ShieldCheck, Download, Camera
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
          <a href="#what-is" className="hover:text-[#6b9b76] transition-colors">What is it?</a>
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
                <a href="#what-is" onClick={() => setIsMobileMenuOpen(false)}>What is it?</a>
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
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-left"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-[#3d5244] tracking-tight mb-6 leading-tight">
                AI Meal Planner Based on Your Mood
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
                Discover what to eat instantly with MoodFull—an AI-powered food assistant that creates meals based on your mood, health goals, and lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center md:justify-start">
                <Button 
                  onClick={handleLogin} 
                  className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto shadow-lg shadow-[#6b9b76]/30 transition-all hover:scale-105"
                >
                  Get Started Free
                </Button>
                <Button 
                  onClick={handleLogin} 
                  variant="outline"
                  className="border-[#6b9b76] text-[#6b9b76] hover:bg-[#f0f9f2] px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all"
                >
                  Try a Recipe Now
                </Button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative h-[500px] w-full rounded-3xl bg-gradient-to-br from-[#e0ede4] to-[#f0f9f2] border border-[#c5d9c9] overflow-hidden flex items-center justify-center shadow-inner">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-10 left-6 bg-white p-4 rounded-2xl shadow-lg border border-[#e0ede4] z-20">
                  <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Current Mood</div>
                  <div className="flex gap-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">🛋️ Lazy</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">🌧️ Stressed</span>
                  </div>
                </motion.div>
                
                <motion.div className="bg-white rounded-[2rem] shadow-2xl w-64 border border-[#e0ede4] overflow-hidden z-10 relative">
                  <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" className="h-40 w-full object-cover" alt="Recipe mockup" />
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-[#3d5244] leading-tight mb-1">15-Min Comfort Bowl</h3>
                    <p className="text-xs text-gray-500 mb-3">Warm, soothing, and zero effort.</p>
                    <div className="flex justify-between items-center text-xs font-semibold text-[#6b9b76] mb-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> 15m</span>
                      <span>Easy</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-gray-100 rounded-lg px-2 py-1 text-[10px] flex-1 text-center"><strong>320</strong><br/>Cal</div>
                      <div className="bg-gray-100 rounded-lg px-2 py-1 text-[10px] flex-1 text-center"><strong>14g</strong><br/>Pro</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute bottom-12 right-6 bg-white p-4 rounded-2xl shadow-lg border border-[#e0ede4] z-20">
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

        {/* What is MoodFull */}
        <section id="what-is" className="bg-white py-24 border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-[#f0f9f2] rounded-3xl transform -rotate-3 scale-105" />
              <div className="relative h-[400px] w-full rounded-3xl bg-white border border-[#e0ede4] shadow-lg overflow-hidden flex flex-col">
                <div className="bg-[#f0f9f2] p-4 border-b border-[#e0ede4] flex items-center gap-3">
                  <Camera className="w-5 h-5 text-[#6b9b76]" />
                  <span className="font-semibold text-[#3d5244]">Smart Pantry Scanner</span>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-4 bg-gray-50/50">
                  <div className="bg-white p-3 rounded-xl border border-[#e0ede4] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">🥚</div>
                      <span className="font-medium text-gray-700">Eggs</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">In stock</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#e0ede4] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">🥑</div>
                      <span className="font-medium text-gray-700">Avocados</span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">Expiring soon</span>
                  </div>
                  <div className="mt-auto bg-[#6b9b76] text-white p-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md">
                    <Sparkles className="w-4 h-4" /> Generate recipes with these
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-6">What Is MoodFull?</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                MoodFull is an AI-powered meal planner that helps you decide what to eat based on how you feel. Instead of scrolling endlessly through recipes, MoodFull understands your mood, preferences, and health goals to generate personalized meals instantly.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you’re feeling stressed, energized, tired, or just unsure what to eat, MoodFull removes the guesswork and gives you meals that match both your emotional and nutritional needs.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-6">How Mood-Based Eating Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Food isn’t just fuel—it directly impacts how you feel. MoodFull uses AI to connect your emotional state with the right meals, helping you:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <FeatureCard icon={<Activity className="w-6 h-6" />} title="Improve energy levels" />
              <FeatureCard icon={<Brain className="w-6 h-6" />} title="Reduce stress through balanced nutrition" />
              <FeatureCard icon={<ShieldCheck className="w-6 h-6" />} title="Avoid unhealthy impulse eating" />
              <FeatureCard icon={<Sparkles className="w-6 h-6" />} title="Stay consistent with your health goals" />
            </div>

            <p className="text-center text-lg text-[#3d5244] font-medium">
              Simply select your mood—or type your own—and MoodFull generates meals tailored to you.
            </p>
          </div>
        </section>

        {/* AI Recipe Generator */}
        <section className="bg-white py-24 border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-6">AI-Powered Recipe Generator</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                MoodFull’s AI creates recipes in seconds based on:
              </p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Your mood</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Dietary preferences</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Health goals</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Available ingredients</li>
              </ul>
              <p className="text-lg font-bold text-[#3d5244] mb-6">No more searching. No more guessing.</p>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">Get complete recipes with:</p>
              <ul className="space-y-2 text-gray-600">
                <li>• Ingredients</li>
                <li>• Step-by-step instructions</li>
                <li>• Nutrition breakdown</li>
                <li>• Smart substitutions</li>
              </ul>
            </div>
            <div className="bg-[#f0f9f2] p-8 rounded-3xl border border-[#c5d9c9] shadow-inner h-full min-h-[400px] flex items-center justify-center">
               <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Generating Recipe...</div>
                      <div className="text-sm text-gray-500">Matching mood: Stressed</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Healthy Takeout Alternatives */}
        <section id="takeout" className="py-24 bg-[#fffcf7] border-t border-[#f2b769]/30">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-6">Healthy Alternatives to Takeout</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Craving takeout but want to stay healthy? MoodFull helps you find smarter choices by generating healthier versions of your favorite meals or suggesting better options from delivery apps.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
              <div className="bg-white rounded-2xl shadow-sm border border-[#e0ede4] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                <img src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/43aae0888_IMG_0129.jpg" alt="Lean turkey burger" className="h-48 w-full object-cover" />
                <div className="p-6">
                  <div className="text-gray-500 line-through mb-2">Greasy fast food</div>
                  <div className="text-[#6b9b76] font-bold flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 shrink-0 mt-0.5" /> Lean turkey burger with sweet potato fries
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-[#e0ede4] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                <img src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/7c951bbb1_IMG_0130.jpg" alt="Zucchini noodles" className="h-48 w-full object-cover" />
                <div className="p-6">
                  <div className="text-gray-500 line-through mb-2">Heavy cream pasta</div>
                  <div className="text-[#6b9b76] font-bold flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 shrink-0 mt-0.5" /> Zucchini noodles with avocado pesto
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-[#e0ede4] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                <img src="https://media.base44.com/images/public/691ce8ad33694c9622f52699/dd8894f01_IMG_0132.jpg" alt="Cauliflower pizza" className="h-48 w-full object-cover" />
                <div className="p-6">
                  <div className="text-gray-500 line-through mb-2">Delivery pizza</div>
                  <div className="text-[#6b9b76] font-bold flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 shrink-0 mt-0.5" /> Cauliflower crust margherita pizza
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-2xl font-bold text-[#3d5244]">Eat what you love—just better.</p>
          </div>
        </section>

        {/* Smart Meal Planning & Pantry */}
        <section className="bg-white py-24 border-t border-[#e0ede4]">
          <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-[#3d5244] mb-6">Smarter Meal Planning with AI</h2>
              <p className="text-lg text-gray-600 mb-6">Plan your entire week in seconds. MoodFull adapts your meals based on:</p>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Your mood trends</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Nutrition goals</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Schedule</li>
                <li className="flex items-center gap-3"><div className="w-2 h-2 bg-[#6b9b76] rounded-full" /> Pantry items</li>
              </ul>
              <p className="font-bold text-[#3d5244]">No spreadsheets. No stress. Just smart planning.</p>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-[#3d5244] mb-6">Smart Pantry & Auto-Generated Shopping Lists</h2>
              <p className="text-lg text-gray-600 mb-6">MoodFull tracks what you have and what you need.</p>
              <ul className="space-y-3 mb-8 text-gray-700">
                <li className="flex items-center gap-3"><ShoppingCart className="w-5 h-5 text-[#6b9b76]" /> Scan your pantry</li>
                <li className="flex items-center gap-3"><UtensilsCrossed className="w-5 h-5 text-[#6b9b76]" /> Get restock suggestions</li>
                <li className="flex items-center gap-3"><Leaf className="w-5 h-5 text-[#6b9b76]" /> Generate shopping lists instantly</li>
              </ul>
              <p className="font-bold text-[#3d5244]">Everything stays organized automatically.</p>
            </div>
          </div>
        </section>

        {/* Insights & Personalization + Why Different */}
        <section className="py-24 bg-[#f8faf8] border-t border-[#e0ede4]">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e0ede4] flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-[#3d5244] mb-6">Understand Your Habits</h2>
              <p className="text-lg text-gray-600 mb-6">MoodFull doesn’t just suggest meals—it helps you understand your patterns.</p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-[#6b9b76] rounded-full shrink-0" />
                  Track nutrition
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-[#6b9b76] rounded-full shrink-0" />
                  See mood-to-food insights
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 bg-[#6b9b76] rounded-full shrink-0" />
                  Improve your habits over time
                </li>
              </ul>
            </div>

            <div className="bg-[#3d5244] text-white p-8 rounded-3xl shadow-sm flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6">Why Different?</h2>
              <p className="text-lg text-white/80 mb-6 font-medium">Most apps tell you what to eat. MoodFull understands why you eat.</p>
              <ul className="space-y-3 mb-8 text-white/90">
                <li>• Mood-based personalization</li>
                <li>• AI-powered recommendations</li>
                <li>• Real-time recipe generation</li>
                <li>• Healthy takeout alternatives</li>
                <li>• Smart pantry integration</li>
              </ul>
              <p className="font-bold text-[#f2b769] text-lg">It’s a food intelligence system.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white border-t border-[#e0ede4]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3d5244] mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem 
                question="What should I eat based on my mood?" 
                answer="MoodFull uses AI to recommend meals that match how you feel, helping improve both your mood and nutrition." 
              />
              <FaqItem 
                question="Is MoodFull free?" 
                answer="MoodFull offers free features with optional premium upgrades." 
              />
              <FaqItem 
                question="Can MoodFull help me eat healthier?" 
                answer="Yes. MoodFull suggests balanced meals and healthier alternatives to common foods and takeout." 
              />
              <FaqItem 
                question="Does MoodFull work with my diet?" 
                answer="MoodFull supports various dietary preferences including high-protein, low-carb, and more." 
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[#3d5244] text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Stop Guessing What to Eat</h2>
            <p className="text-xl text-white/80 mb-12">Let AI decide for you—based on your mood.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white px-8 py-6 rounded-full text-lg w-full sm:w-auto shadow-lg transition-all hover:scale-105"
              >
                Get Started Free
              </Button>
              <Button 
                onClick={handleLogin} 
                variant="outline"
                className="border-white text-gray-900 bg-white hover:bg-gray-100 px-8 py-6 rounded-full text-lg w-full sm:w-auto transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download MoodFull
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