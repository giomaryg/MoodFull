import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        const planData = {
          recipe_name: "Test Meal",
          date: "2026-05-10",
          meal_type: "dinner"
        };
        
        const res = await base44.entities.MealPlan.create(planData);
        
        await new Promise(r => setTimeout(r, 500));
        
        const list = await base44.entities.MealPlan.list();
        
        return Response.json({ success: true, userEmail: user.email, createdId: res?.id, listLength: list.length, res, list });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});