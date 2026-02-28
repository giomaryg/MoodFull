import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Sparkles, Loader2, ShoppingBag, Leaf, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#6b9b76', '#f2b769', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#f59e0b'];

export default function PantryAnalytics({ onGenerateShoppingList }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingList, setIsGeneratingList] = useState(false);

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.Ingredient.list()
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 100)
  });

  const categoryData = useMemo(() => {
    const counts = {};
    inventory.forEach(item => {
      counts[item.category || 'Other'] = (counts[item.category || 'Other'] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  const expirationData = useMemo(() => {
    let expired = 0;
    let soon = 0; // < 7 days
    let upcoming = 0; // 7-30 days
    let good = 0; // > 30 days or none

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    inventory.forEach(item => {
      if (!item.expiry_date) {
        good++;
        return;
      }
      const exp = new Date(item.expiry_date);
      exp.setHours(0, 0, 0, 0);
      const diffTime = exp - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) expired++;
      else if (diffDays <= 7) soon++;
      else if (diffDays <= 30) upcoming++;
      else good++;
    });

    return [
      { name: 'Expired', count: expired, fill: '#ef4444' },
      { name: '< 7 Days', count: soon, fill: '#f59e0b' },
      { name: '7-30 Days', count: upcoming, fill: '#3b82f6' },
      { name: 'Good / N/A', count: good, fill: '#10b981' }
    ];
  }, [inventory]);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const inventorySummary = inventory.map(i => `${i.name} (${i.category}, exp: ${i.expiry_date || 'N/A'}, qty: ${i.quantity})`).join('; ');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this pantry inventory: ${inventorySummary}. 
        Provide insights on ingredient usage patterns.
        Identify any nutritional imbalances (e.g. too many carbs, lack of fresh produce, low protein) based on the current stock.
        Suggest 3 specific waste reduction opportunities focusing on items expiring soon.
        Estimate potential cost savings if expiring items are used instead of wasted.
        Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            usage_patterns: { type: "string" },
            nutritional_summary: { type: "string" },
            waste_reduction: { type: "array", items: { type: "string" } },
            cost_savings_opportunities: { type: "string" },
            overall_health_score: { type: "string" }
          }
        }
      });
      setAiInsights(response);
    } catch (e) {
      toast.error('Failed to generate insights');
    }
    setIsGenerating(false);
  };

  const generateShoppingList = async () => {
    setIsGeneratingList(true);
    try {
      const lowStock = inventory.filter(i => i.min_stock > 0 && i.quantity < i.min_stock).map(i => i.name);
      
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingMeals = mealPlans.filter(m => {
        const d = new Date(m.date);
        return d >= today && d <= nextWeek;
      }).map(m => m.recipe_name);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `The user has these low stock items: ${lowStock.join(', ')}. They plan to cook these meals in the next 7 days: ${upcomingMeals.join(', ')}. Based on typical recipes for these meals and the low stock items, generate a smart, consolidated shopping list of ingredients they likely need to buy. Group them logically but return as a flat array. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_items: { 
              type: "array", 
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (onGenerateShoppingList && response.suggested_items) {
        onGenerateShoppingList(response.suggested_items);
      }
    } catch (e) {
      toast.error('Failed to generate shopping list');
    }
    setIsGeneratingList(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-[#c5d9c9] shadow-sm">
          <h3 className="font-bold text-[#5a6f60] mb-4 text-center">Inventory by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-[#c5d9c9] shadow-sm">
          <h3 className="font-bold text-[#5a6f60] mb-4 text-center">Expiration Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expirationData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {expirationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={generateInsights} 
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-[#6b9b76] to-[#5a8a65] text-white py-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base font-semibold"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
          Generate AI Pantry Insights
        </Button>
        <Button 
          onClick={generateShoppingList} 
          disabled={isGeneratingList}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base font-semibold"
        >
          {isGeneratingList ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShoppingBag className="w-5 h-5 mr-2" />}
          Auto-Generate Shopping List
        </Button>
      </div>

      {aiInsights && (
        <div className="bg-[#f8faf8] p-6 rounded-2xl border-2 border-[#c5d9c9] space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-[#6b9b76]" />
              <h3 className="text-xl font-bold text-[#5a6f60]">Pantry Analysis</h3>
            </div>
            <span className="sm:ml-auto bg-[#e8f0ea] text-[#6b9b76] px-3 py-1 rounded-full text-sm font-bold border border-[#c5d9c9]">
              Health Score: {aiInsights.overall_health_score}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#e0ede4]">
              <h4 className="font-bold text-gray-800 mb-2">Usage Patterns</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{aiInsights.usage_patterns}</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-[#e0ede4]">
              <h4 className="font-bold text-gray-800 mb-2">Nutritional Summary</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{aiInsights.nutritional_summary}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e0ede4]">
            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Cost Saving Opportunities
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">{aiInsights.cost_savings_opportunities}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-[#e0ede4]">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> 
              Waste Reduction Opportunities
            </h4>
            <ul className="space-y-3">
              {aiInsights.waste_reduction.map((item, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    {i + 1}
                  </div>
                  <span className="mt-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}