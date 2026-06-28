import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Heart, Frown, Coffee, Zap, Loader2, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MoodLogHistory() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['moodLogs'],
    queryFn: () => base44.entities.MoodLog.list('-date', 50)
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b9b76]" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No food mood logs yet. Cook some generated recipes to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-[#6b9b76] text-3xl font-bold">Food & Mood History</h2>
        <p className="text-gray-600">See what you ate based on how you felt</p>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {logs.map((log, i) => (
          <motion.div 
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#6b9b76] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute md:relative left-0 md:left-auto">
              <span className="text-sm">🍽️</span>
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-auto md:ml-0 px-4">
              <Card className="hover:shadow-md transition-shadow duration-300 overflow-hidden border-0 shadow-sm bg-white/80 backdrop-blur">
                <CardContent className="p-0">
                  <div className="flex">
                    {log.image_url && (
                      <div className="w-24 shrink-0">
                        <img src={log.image_url} alt={log.recipe_name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-4 flex-1">
                      <div className="text-xs font-semibold text-[#6b9b76] mb-1">
                        {log.date ? format(new Date(log.date), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight mb-2">
                        {log.recipe_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-md">
                        <span className="font-medium text-gray-800">Felt:</span> 
                        <span className="capitalize px-2 py-0.5 bg-[#f0f9f2] text-[#3A6B4F] rounded-full text-xs font-semibold">
                          {log.mood}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}