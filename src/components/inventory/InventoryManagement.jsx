import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function InventoryManagement() {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: '', category: 'Pantry' });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Ingredient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setNewItem({ name: '', quantity: 1, unit: '', category: 'Pantry' });
      toast.success('Ingredient added to inventory');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Ingredient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Ingredient removed');
    }
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    addMutation.mutate(newItem);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
          <Package className="w-8 h-8" /> My Pantry
        </h2>
        <p className="text-gray-600">Track your ingredients to get smarter recipe suggestions</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border-2 border-[#c5d9c9] shadow-sm">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] w-full">
            <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Ingredient Name</label>
            <Input 
              placeholder="e.g. Tomatoes, Chicken Breast..." 
              value={newItem.name} 
              onChange={e => setNewItem({...newItem, name: e.target.value})}
              className="border-2 focus:border-[#6b9b76]"
            />
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="w-24">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Qty</label>
              <Input 
                type="number" 
                min="0.1"
                step="0.1" 
                value={newItem.quantity} 
                onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="w-32">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Unit</label>
              <Input 
                placeholder="pcs, cups, lbs" 
                value={newItem.unit} 
                onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <Button type="submit" className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white whitespace-nowrap h-10 mt-auto" disabled={addMutation.isPending || !newItem.name}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#c5d9c9] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading inventory...</div>
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
            <p>Your pantry is empty.</p>
            <p className="text-sm">Add some ingredients above to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e0ede4]">
            {inventory.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id} 
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                  <p className="text-sm text-[#6b9b76] font-medium">{item.quantity} {item.unit}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}