import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[#f8faf8] font-sans px-6 py-12 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-[#6b9b76] hover:text-[#5a8a65] mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3d5244] mb-8">About MoodFull</h1>
          <div className="prose prose-lg text-gray-600">
            <p className="mb-6 leading-relaxed">
              Welcome to MoodFull, your personal food intelligence system. MoodFull is designed to eliminate the daily stress and overwhelming decision fatigue associated with answering the age-old question: "What should I eat today?" 
            </p>
            <p className="mb-6 leading-relaxed">
              Most recipe apps and platforms operate under the assumption that you already know what you are looking for, offering endless catalogs of recipes that require you to filter, scroll, and ultimately decide. MoodFull flips this paradigm on its head. Instead of asking you what you want to eat, we start by understanding how you feel. We recognize that eating is fundamentally emotional. Whether you are feeling lazy and just want something comforting with minimal effort, or you're feeling energetic and ready to tackle a complex, nutrient-dense meal, our AI-powered engine instantly matches your emotional state with the perfect dish.
            </p>
            <p className="mb-6 leading-relaxed">
              Our target audience includes busy professionals, parents balancing multiple responsibilities, and anyone who wants to eat healthier without the mental burden of traditional meal planning. By leveraging cutting-edge artificial intelligence, we seamlessly integrate your current mood, your specific health and dietary goals, and the ingredients you already have sitting in your pantry. This means fewer trips to the grocery store, significantly reduced food waste, and the confidence that every meal you prepare is aligned with your personal well-being.
            </p>
            <p className="leading-relaxed">
              MoodFull is built by a dedicated team of food enthusiasts, technologists, and wellness advocates who believe that technology should serve to simplify our lives, not complicate them. Our mission is to empower individuals to make smarter, healthier food choices effortlessly, ensuring that every meal is an opportunity to nourish both the body and the mind. Thank you for joining us on this journey to eat better, live better, and feel better—every single day.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}