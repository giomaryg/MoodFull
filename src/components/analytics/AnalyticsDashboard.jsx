import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { TrendingUp, Utensils, DollarSign, Activity, FileSpreadsheet, FileText, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AnalyticsDashboard() {
  const [aiReport, setAiReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list('-date', 200)
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list()
  });

  const stats = useMemo(() => {
    // 1. Most frequent recipes
    const recipeCounts = {};
    mealPlans.forEach(plan => {
      if (plan.recipe_name) {
        recipeCounts[plan.recipe_name] = (recipeCounts[plan.recipe_name] || 0) + 1;
      }
    });
    const frequentRecipes = Object.entries(recipeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Nutritional Breakdowns (average per meal)
    let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let mealsWithNutrition = 0;

    mealPlans.forEach(plan => {
      const recipe = recipes.find(r => r.id === plan.recipe_id);
      if (recipe && recipe.nutrition) {
        totalCals += (recipe.nutrition.calories || 0);
        totalProtein += parseInt(recipe.nutrition.protein) || 0;
        totalCarbs += parseInt(recipe.nutrition.carbs) || 0;
        totalFat += parseInt(recipe.nutrition.fat) || 0;
        mealsWithNutrition++;
      }
    });

    const avgNutrition = mealsWithNutrition > 0 ? [
      { name: 'Protein (g)', value: Math.round(totalProtein / mealsWithNutrition) },
      { name: 'Carbs (g)', value: Math.round(totalCarbs / mealsWithNutrition) },
      { name: 'Fat (g)', value: Math.round(totalFat / mealsWithNutrition) },
    ] : [];
    
    const avgCalories = mealsWithNutrition > 0 ? Math.round(totalCals / mealsWithNutrition) : 0;

    // 3. Spending patterns (Mocked based on ingredient counts across shopping lists / meal plans)
    // Estimate cost per meal plan: each ingredient roughly $2.50 per serving
    const spendingData = [];
    const monthlySpending = {};
    
    mealPlans.forEach(plan => {
      if (!plan.date) return;
      const month = plan.date.substring(0, 7); // YYYY-MM
      const recipe = recipes.find(r => r.id === plan.recipe_id);
      const ingredientCount = recipe?.ingredients?.length || plan.custom_ingredients?.length || 5;
      const estimatedCost = ingredientCount * 2.5 * ((plan.servings || 2) / 2); // basic scaling
      
      monthlySpending[month] = (monthlySpending[month] || 0) + estimatedCost;
    });

    Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .forEach(([month, cost]) => {
        spendingData.push({ month: month.substring(5) + '/' + month.substring(2,4), cost: Math.round(cost) });
      });

    return { frequentRecipes, avgNutrition, avgCalories, spendingData };
  }, [mealPlans, recipes]);

  const COLORS = ['#6b9b76', '#c17a7a', '#e8d5c4', '#5a6f60'];

  const exportToCSV = () => {
    const headers = "Recipe,Count\n";
    const csvContent = "data:text/csv;charset=utf-8," + headers + stats.frequentRecipes.map(e => `${e.name},${e.count}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "meal_plan_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Analytics & Reporting', 20, 20);
      doc.setFontSize(12);
      doc.text(`Total Meals Planned: ${mealPlans.length}`, 20, 30);
      doc.text(`Average Calories per Meal: ${stats.avgCalories}`, 20, 40);
      doc.text('Top Recipes:', 20, 50);
      stats.frequentRecipes.forEach((r, idx) => {
        doc.text(`${idx + 1}. ${r.name} (${r.count} times)`, 30, 60 + (idx * 10));
      });
      doc.save('analytics_report.pdf');
    });
  };

  const generateAIReport = async () => {
    setIsGeneratingReport(true);
    try {
      const dataStr = JSON.stringify({
        totalMeals: mealPlans.length,
        avgCalories: stats.avgCalories,
        topRecipes: stats.frequentRecipes,
        avgNutrition: stats.avgNutrition,
        spendingData: stats.spendingData
      });
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Act as an expert nutritionist and financial advisor. Analyze this user's meal planning data and provide a concise, insightful report on their trends, performance metrics (nutrition/spending), and actionable advice. Format using markdown. Data: ${dataStr}`,
      });
      setAiReport(response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-[#6b9b76] text-3xl sm:text-4xl font-bold">Insights & Analytics</h2>
          <p className="text-gray-600">Track your meal planning habits, nutrition, and spending</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button variant="outline" onClick={exportToCSV} className="border-2 border-[#c5d9c9] text-[#5a6f60] hover:bg-[#f0f9f2] bg-white">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            CSV Export
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="border-2 border-[#c5d9c9] text-[#5a6f60] hover:bg-[#f0f9f2] bg-white">
            <FileText className="w-4 h-4 mr-2" />
            PDF Export
          </Button>
          <Button onClick={generateAIReport} disabled={isGeneratingReport} className="bg-[#f2b769] hover:bg-[#e6a245] text-white">
            {isGeneratingReport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
            AI Report
          </Button>
        </div>
      </div>

      {aiReport && (
        <Card className="border-2 border-[#f2b769] bg-[#fffcf7] mb-8">
          <CardHeader>
            <CardTitle className="text-lg text-[#d4a373] flex items-center gap-2">
              <Bot className="w-5 h-5" /> AI Analytical Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm prose-p:leading-relaxed prose-headings:text-[#5a6f60] max-w-none text-gray-700">
              <ReactMarkdown>{aiReport}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#f0f9f2] rounded-xl">
              <Utensils className="w-6 h-6 text-[#6b9b76]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Meals Planned</p>
              <h4 className="text-2xl font-bold text-gray-900">{mealPlans.length}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#f5e6dc] rounded-xl">
              <Activity className="w-6 h-6 text-[#c17a7a]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Calories / Meal</p>
              <h4 className="text-2xl font-bold text-gray-900">{stats.avgCalories} <span className="text-sm font-normal text-gray-500">kcal</span></h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#e8f0ea] rounded-xl">
              <DollarSign className="w-6 h-6 text-[#5a6f60]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Est. Monthly Spend</p>
              <h4 className="text-2xl font-bold text-gray-900">${stats.spendingData.length > 0 ? stats.spendingData[stats.spendingData.length-1].cost : 0}</h4>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-[#fdf6f0] rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#d4a373]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Top Recipe</p>
              <h4 className="text-lg font-bold text-gray-900 truncate max-w-[120px]">{stats.frequentRecipes[0]?.name || '-'}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-[#c5d9c9]">
          <CardHeader>
            <CardTitle className="text-lg text-[#5a6f60]">Most Frequent Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.frequentRecipes} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f0f9f2' }} />
                  <Bar dataKey="count" fill="#6b9b76" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#c5d9c9]">
          <CardHeader>
            <CardTitle className="text-lg text-[#5a6f60]">Average Macros (per meal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {stats.avgNutrition.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.avgNutrition}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.avgNutrition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">No nutrition data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#c5d9c9] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-[#5a6f60]">Estimated Grocery Spending Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.spendingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(val) => `$${val}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Est. Cost']} />
                  <Line type="monotone" dataKey="cost" stroke="#c17a7a" strokeWidth={3} dot={{ r: 4, fill: '#c17a7a' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}