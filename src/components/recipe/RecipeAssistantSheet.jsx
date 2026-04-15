import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2, Sparkles, ChefHat } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { useQuery } from '@tanstack/react-query';

import { createPortal } from 'react-dom';

export default function RecipeAssistantSheet({ recipe }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      if (messages.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content: `Hi! I'm your AI cooking assistant for **${recipe.name}**. What would you like to know? You can ask about substitutions, timing, or how to scale this recipe.`
          }
        ]);
      }
    }
  }, [isOpen, messages.length, recipe.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      
      const pregnancyContext = currentUser?.pregnancy_status && ['pregnant', 'trying'].includes(currentUser.pregnancy_status)
        ? `\nCRITICAL: The user is ${currentUser.pregnancy_status === 'pregnant' ? 'pregnant' : 'trying to conceive'}. Ensure all suggestions are pregnancy-safe (avoid raw/undercooked animal products, unpasteurized dairy, high-mercury fish, alcohol, etc). Do not give medical advice.`
        : '';

      const prompt = `You are a helpful culinary AI assistant specifically helping the user with the recipe "${recipe.name}".${pregnancyContext}
Recipe Details:
Description: ${recipe.description || 'N/A'}
Ingredients: ${recipe.ingredients?.join(', ')}
Instructions: ${recipe.instructions?.join('\n')}
Prep time: ${recipe.prep_time || 'N/A'}
Cook time: ${recipe.cook_time || 'N/A'}
Servings: ${recipe.servings || 'N/A'}
Nutrition: ${JSON.stringify(recipe.nutrition || {})}

Chat History:
${chatHistory}
User: ${text.trim()}

Provide a concise, practical, and helpful response. If you suggest modifications, clearly state that it is an AI suggestion.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble thinking right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    "Can I substitute an ingredient?",
    "Adjust this for another appliance",
    "How do I make this higher protein?",
    "What sides pair well with this?"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/2 -translate-y-1/2 right-4 z-[60] sm:top-auto sm:-translate-y-0 sm:bottom-6 sm:right-10"
            style={{ touchAction: 'none' }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center transition-transform hover:scale-105 cursor-grab active:cursor-grabbing pointer-events-auto"
            >
              <Sparkles className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assistant Sheet Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-[100] sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 z-[101] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] rounded-t-3xl border-t border-gray-200 flex flex-col sm:max-w-[420px] sm:right-8 sm:left-auto sm:w-full sm:bottom-8 sm:rounded-3xl"
              style={{ height: '75vh', maxHeight: '650px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#f0f9f2] to-white rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#6b9b76] rounded-full flex items-center justify-center shadow-sm">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Recipe Assistant</h3>
                    <p className="text-xs text-[#6b9b76] font-medium truncate max-w-[200px]">{recipe.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>

              {/* Chat Area */}
              <ScrollArea className="flex-1 p-4 bg-gray-50/50">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#6b9b76] text-white rounded-2xl rounded-br-sm shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="prose prose-sm max-w-none prose-p:my-1">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 text-[#6b9b76] animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>
              </ScrollArea>

              {/* Suggestions */}
              {messages.length === 1 && (
                <div className="px-4 py-3 bg-white flex overflow-x-auto gap-2 no-scrollbar border-t border-gray-100">
                  {SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="whitespace-nowrap px-4 py-2 bg-[#f0f9f2] hover:bg-[#e8f0ea] text-[#5a8a65] text-xs rounded-full transition-colors font-medium border border-[#c5d9c9]"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100 sm:rounded-b-3xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about this recipe..."
                    className="flex-1 rounded-full border-gray-200 focus:border-[#6b9b76] bg-gray-50 focus:bg-white h-11"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="rounded-full bg-[#6b9b76] hover:bg-[#5a8a65] w-11 h-11 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}