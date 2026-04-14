import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SupportChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      const initChat = async () => {
        setIsLoading(true);
        try {
          const conv = await base44.agents.createConversation({
            agent_name: "privacy_support",
            metadata: { name: "Support Chat" }
          });
          setConversationId(conv.id);
          setMessages(conv.messages || []);
        } catch (error) {
          console.error("Failed to start support chat", error);
        }
        setIsLoading(false);
      };
      initChat();
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    if (conversationId && isOpen) {
      const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsubscribe();
    }
  }, [conversationId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;

    const userMsg = input.trim();
    setInput('');
    try {
      await base44.agents.addMessage({ id: conversationId, messages }, {
        role: "user",
        content: userMsg
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[80vh] max-h-[800px] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#f0f9f2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6b9b76] rounded-full flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#6b9b76]">Privacy & Support</h3>
              <p className="text-xs text-gray-500">AI Support Assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 bg-gray-50/50">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#6b9b76]" />
            </div>
          )}
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center p-6 bg-white rounded-xl border border-[#e8f0ea]">
                <Shield className="w-12 h-12 text-[#6b9b76]/50 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  Welcome to MoodFull Support. Feel free to ask any questions regarding our Privacy Policy, data usage, or account management.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#e8f0ea] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#6b9b76]" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-[#6b9b76] text-white' : 'bg-white border border-gray-100 shadow-sm text-gray-700'}`}>
                  <ReactMarkdown 
                    className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-0 [&>p]:mt-0"
                    components={{
                      a: ({node, ...props}) => <a {...props} className="text-blue-500 hover:underline" target="_blank" />
                    }}
                  >
                    {msg.content || ''}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about privacy, data deletion, etc..."
              className="flex-1 border-[#c5d9c9] focus:border-[#6b9b76]"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="bg-[#6b9b76] hover:bg-[#5a8a65]">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}