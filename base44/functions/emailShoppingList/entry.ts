import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminUser = await base44.auth.me();
    
    // Require admin context to run this background scheduled job
    if (adminUser?.role !== 'admin') { 
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 }); 
    }

    // Get all users to process emails
    const users = await base44.asServiceRole.entities.User.list();
    const emailsSent = [];
    
    // Date bounds for the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    // Load data needed across users
    const mealPlans = await base44.asServiceRole.entities.MealPlan.list();
    const inventoryItems = await base44.asServiceRole.entities.Ingredient.list();
    const recipes = await base44.asServiceRole.entities.Recipe.list();

    const recipesMap = {};
    recipes.forEach(r => {
        if (r.id) recipesMap[r.id] = r;
        recipesMap[r.name] = r;
    });

    for (const u of users) {
        if (!u.email) continue;
        
        // Find upcoming meals for this user
        const upcomingMeals = mealPlans.filter(m => m.created_by === u.email && m.date >= todayStr && m.date <= nextWeekStr);
        if (upcomingMeals.length === 0) continue;

        // Find user inventory
        const userInventory = inventoryItems.filter(i => i.created_by === u.email);

        const upcomingData = upcomingMeals.map(m => {
          const r = recipesMap[m.recipe_id] || recipesMap[m.recipe_name];
          return {
            meal: m.recipe_name,
            date: m.date,
            ingredients: r ? r.ingredients : m.custom_ingredients || []
          };
        });

        const prompt = `Based on these upcoming scheduled meals for the week:
${JSON.stringify(upcomingData)}

And the user's current pantry inventory:
${JSON.stringify(userInventory.map(i => ({name: i.name, quantity: i.quantity, unit: i.unit})))}

Please generate a beautifully formatted shopping list of the ingredients the user is missing and needs to buy for their upcoming meals. Include quantities. Group them by category (e.g., Produce, Meat, Pantry). If they have everything they need, let them know. Be concise, friendly, and return just the text of the email body (html is preferred).`;

        try {
            const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: prompt
            });
            
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: u.email,
                subject: "Your Weekly MoodFull Shopping List 🛒",
                body: response
            });
            
            emailsSent.push(u.email);
        } catch (err) {
            console.error(`Failed to generate/send list for ${u.email}`, err);
        }
    }

    return Response.json({ success: true, emailsSent });
  } catch (error) {
    console.error("Error in emailShoppingList job:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});