import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending
    toast.success("Thanks for reaching out! We'll get back to you soon.");
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] font-sans px-6 py-12 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-[#6b9b76] hover:text-[#5a8a65] mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3d5244] mb-6">Contact Us</h1>
          <p className="text-lg text-gray-600 mb-10">
            Have questions, feedback, or just want to say hi? We'd love to hear from you. Drop us a message below or email us directly.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your name" className="bg-white border-[#e0ede4]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="your@email.com" className="bg-white border-[#e0ede4]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="How can we help?" className="flex w-full rounded-md border border-[#e0ede4] bg-white px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[120px] resize-y" />
                </div>
                <Button type="submit" className="w-full bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-xl py-6">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </div>
            
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0ede4]">
                <h3 className="font-bold text-[#3d5244] text-xl mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#6b9b76]" /> Email Us
                </h3>
                <p className="text-gray-600 mb-2">For general inquiries and support:</p>
                <a href="mailto:hello@moodfull.ai" className="text-[#6b9b76] font-medium hover:underline">hello@moodfull.ai</a>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0ede4]">
                <h3 className="font-bold text-[#3d5244] text-xl mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#6b9b76]" /> Social Media
                </h3>
                <p className="text-gray-600 mb-2">Follow our journey and send us a DM:</p>
                <a href="https://instagram.com/moodfullai" target="_blank" rel="noreferrer" className="text-[#6b9b76] font-medium hover:underline">@moodfullai on Instagram</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}