import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Utensils, DollarSign, Activity } from 'lucide-react';

const COLORS = ['#6b9b76', '#a3c4a8', '#c5d9c9', '#e8f0ea', '#5a6f60'];

export default function AnalyticsDashboard({ currentUser }) {
  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list()
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list()
  });

  const stats = useMemo(() => {
    // Most Frequent Recipes
    const recipeCounts = {};
    mealPlans.forEach(plan => {
      if (plan.recipe_name) {
        recipeCounts[plan.recipe_name] = (recipeCounts[plan.recipe_name] || 0) + 1;
      }
    });
    
    const topRecipes = Object.entries(recipeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Nutritional Breakdown (averages across planned meals that have recipes)
    let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, validMeals = 0;
    
    mealPlans.forEach(plan => {
      if (plan.recipe_id) {
        const recipe = recipes.find(r => r.id === plan.recipe_id);
        if (recipe?.nutrition) {
          totalCals += (recipe.nutrition.calories || 0);
          totalProtein += parseFloat(recipe.nutrition.protein || 0);
          totalCarbs += parseFloat(recipe.nutrition.carbs || 0);
          totalFat += parseFloat(recipe.nutrition.fat || 0);
          validMeals++;
        }
      }
    });

    const nutritionData = validMeals > 0 ? [
      { name: 'Protein (g)', value: Math.round(totalProtein / validMeals) },
      { name: 'Carbs (g)', value: Math.round(totalCarbs / validMeals) },
      { name: 'Fat (g)', value: Math.round(totalFat / validMeals) },
    ] : [];

    // Estimated Spending Patterns (mock based on meal plan volume per month)
    const monthlySpending = {};
    mealPlans.forEach(plan => {
      if (plan.date) {
        const month = plan.date.substring(0, 7); // YYYY-MM
        // Estimate $15 per meal per serving
        const cost = (plan.servings || 2) * 15;
        monthlySpending[month] = (monthlySpending[month] || 0) + cost;
      }
    });
    
    const spendingData = Object.entries(monthlySpending)
      .map(([month, cost]) => ({ month, cost }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    return { topRecipes, nutritionData, spendingData, avgCalories: validMeals > 0 ? Math.round(totalCals / validMeals) : 0, totalMeals: mealPlans.length };
  }, [mealPlans, recipes]);

  if (!currentUser?.is_premium && currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh] p-8">
        <div className="text-center px-6 py-8 bg-white rounded-2xl shadow-lg border border-[#c5d9c9] max-w-sm mx-auto">
          <span className="text-4xl mb-3 block">🔒</span>
          <h3 className="text-[#6b9b76] font-bold text-lg mb-1">Analytics — Premium</h3>
          <p className="text-gray-500 text-sm">Upgrade to view detailed insights about your meal planning habits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 sm:px-6 mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-[#6b9b76] to-[#5a8a65] rounded-xl">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#6b9b76]">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600">Insights into your meal planning and nutrition</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Utensils className="w-4 h-4 mr-2" /> Total Meals Planned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#5a6f60]">{stats.totalMeals}</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Activity className="w-4 h-4 mr-2" /> Avg Calories / Meal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#5a6f60]">{stats.avgCalories} <span className="text-sm font-normal text-gray-400">kcal</span></div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#c5d9c9] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" /> This Month Est. Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#5a6f60]">
              ${stats.spendingData.length > 0 ? stats.spendingData[stats.spendingData.length - 1].cost : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-[#c5d9c9]">
          <CardHeader>
            <CardTitle className="text-lg text-[#5a6f60]">Most Frequent Recipes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.topRecipes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topRecipes} layout="vertical" margin={{ left: 50 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#5a6f60', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f0f9f2'}} contentStyle={{borderRadius: '8px', border: '1px solid #c5d9c9'}} />
                  <Bar dataKey="count" fill="#6b9b76" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Not enough data</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-[#c5d9c9]">
          <CardHeader>
            <CardTitle className="text-lg text-[#5a6f60]">Average Macros per Meal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.nutritionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.nutritionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #c5d9c9'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Not enough data</div>
            )}
            {stats.nutritionData.length > 0 && (
              <div className="flex justify-center gap-4 mt-2">
                {stats.nutritionData.map((entry, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                    {entry.name}: {entry.value}g
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-[#c5d9c9] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-[#5a6f60]">Estimated Spending Patterns (Grocery)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {stats.spendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.spendingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#5a6f60'}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} tick={{fill: '#5a6f60'}} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Est. Cost']}
                    contentStyle={{borderRadius: '8px', border: '1px solid #c5d9c9'}}
                  />
                  <Line type="monotone" dataKey="cost" stroke="#6b9b76" strokeWidth={3} dot={{r: 4, fill: '#6b9b76'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">Not enough data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}