import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Package, Sparkles, Loader2, AlertTriangle, ChefHat, Camera, Mic, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryManagement({ onGenerateFromExpiring }) {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: '', category: 'Pantry', min_stock: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = React.useRef(null);

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Ingredient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setNewItem({ name: '', quantity: 1, unit: '', category: 'Pantry', min_stock: 0 });
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

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast.success('Scanning receipt or barcode...');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract the main grocery ingredient from this image. It could be a barcode, a product package, or a receipt. Identify the product name, estimated quantity, and unit. Provide JSON.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" }
          }
        }
      });
      setNewItem(prev => ({
        ...prev,
        name: response.name || '',
        quantity: response.quantity || 1,
        unit: response.unit || 'units'
      }));
      toast.success('Scan complete! Review details and click Add.');
    } catch (err) {
      toast.error('Failed to scan image. Please enter manually.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... speak an ingredient to add.');
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      toast.success(`Heard: "${transcript}". Analyzing...`);
      setIsAnalyzing(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `The user spoke this to add to their pantry inventory: "${transcript}". Identify the product name, estimated quantity (default 1), and unit. Return JSON.`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" }
            }
          }
        });
        setNewItem(prev => ({
          ...prev,
          name: response.name || '',
          quantity: response.quantity || 1,
          unit: response.unit || 'units'
        }));
        toast.success('Voice scan complete! Review details and click Add.');
      } catch (err) {
        toast.error('Failed to parse voice input.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    recognition.onerror = (event) => {
      toast.error('Voice recognition failed or was cancelled.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleQuickAdd = async (itemName) => {
    setIsAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the grocery item: "${itemName}". Determine its standard grocery category (must be one of: Produce, Dairy, Meat, Pantry, Spices, Frozen, Other). Also estimate its typical shelf life in days from today, assuming proper storage. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"] },
            estimated_shelf_life_days: { type: "number" }
          }
        }
      });
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (response.estimated_shelf_life_days || 14));
      
      addMutation.mutate({
        name: itemName,
        quantity: 1,
        unit: 'units',
        min_stock: 0,
        category: response.category || 'Pantry',
        expiry_date: expiryDate.toISOString().split('T')[0]
      });
    } catch (err) {
      addMutation.mutate({
        name: itemName,
        quantity: 1,
        unit: 'units',
        min_stock: 0,
        category: 'Pantry'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    setIsAnalyzing(true);
    try {
      // Use AI to categorize and predict expiration
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the grocery item: "${newItem.name}". Determine its standard grocery category (must be one of: Produce, Dairy, Meat, Pantry, Spices, Frozen, Other). Also estimate its typical shelf life in days from today, assuming proper storage. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            category: { type: "string", enum: ["Produce", "Dairy", "Meat", "Pantry", "Spices", "Frozen", "Other"] },
            estimated_shelf_life_days: { type: "number" }
          }
        }
      });
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (response.estimated_shelf_life_days || 14));
      
      addMutation.mutate({
        ...newItem,
        category: response.category || 'Pantry',
        expiry_date: expiryDate.toISOString().split('T')[0]
      });
    } catch (err) {
      console.error(err);
      // Fallback
      addMutation.mutate(newItem);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getExpiringSoon = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return inventory.filter(item => {
      if (!item.expiry_date) return false;
      const exp = new Date(item.expiry_date);
      return exp <= nextWeek;
    });
  };

  const expiringItems = getExpiringSoon();

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
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div className="w-20">
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
            <div className="w-20">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Min</label>
              <Input 
                type="number" 
                min="0"
                step="0.1" 
                title="Minimum stock level"
                value={newItem.min_stock} 
                onChange={e => setNewItem({...newItem, min_stock: parseFloat(e.target.value) || 0})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wider">Unit</label>
              <Input 
                placeholder="pcs, cups" 
                value={newItem.unit} 
                onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                className="border-2 focus:border-[#6b9b76]"
              />
            </div>
            <div className="flex gap-2 h-10 mt-auto">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={fileInputRef}
                onChange={handleScan}
                className="hidden" 
              />
              <Button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                variant="outline"
                className="border-2 border-[#6b9b76] text-[#6b9b76] px-3"
                title="Scan Barcode / Receipt"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </Button>
              <Button 
                type="button" 
                onClick={handleVoiceInput}
                disabled={isListening}
                variant="outline"
                className={`border-2 px-3 ${isListening ? 'border-red-500 text-red-500 animate-pulse' : 'border-[#6b9b76] text-[#6b9b76]'}`}
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button type="submit" className="bg-[#6b9b76] hover:bg-[#5a8a65] text-white whitespace-nowrap" disabled={addMutation.isPending || isAnalyzing || !newItem.name}>
                {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Add Item'}</span>
                <span className="sm:hidden">{isAnalyzing ? '...' : 'Add'}</span>
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Quick Add Staples</p>
          <div className="flex flex-wrap gap-2">
            {['Milk', 'Eggs', 'Butter', 'Bread', 'Cheese', 'Onion', 'Garlic', 'Chicken Breast', 'Apples', 'Olive Oil'].map(item => (
              <button
                key={item}
                onClick={() => handleQuickAdd(item)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 hover:bg-[#f0f9f2] hover:text-[#6b9b76] border border-gray-200 hover:border-[#6b9b76] text-gray-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                <PlusCircle className="w-3 h-3" />
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {expiringItems.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5" />
                Expiring Soon ({expiringItems.length})
              </h3>
              <p className="text-sm text-amber-700">These items might go bad soon. Let's use them up!</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {expiringItems.map(item => (
                  <span key={item.id} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md font-medium border border-amber-200">
                    {item.name} ({new Date(item.expiry_date).toLocaleDateString()})
                  </span>
                ))}
              </div>
            </div>
            {onGenerateFromExpiring && (
              <Button 
                onClick={() => onGenerateFromExpiring(expiringItems.map(i => i.name))}
                className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap shadow-sm w-full sm:w-auto"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Generate Recipes
              </Button>
            )}
          </div>
        </div>
      )}

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
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                    {item.category && <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.category}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-[#6b9b76] font-medium">{item.quantity} {item.unit}</p>
                    {item.min_stock > 0 && (
                      <p className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.quantity < item.min_stock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        Min: {item.min_stock}
                      </p>
                    )}
                    {item.expiry_date && (
                      <p className={`text-xs ${new Date(item.expiry_date) < new Date(new Date().setDate(new Date().getDate() + 7)) ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                        Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
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