import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This is an admin-only background job
        const user = await base44.auth.me();
        if (user?.role !== 'admin') { 
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 }); 
        }

        // Get all meal plans for today
        const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC, might need timezone handling but this is a simple approach
        
        // Using service role to read all users' meal plans
        const mealPlans = await base44.asServiceRole.entities.MealPlan.filter({ date: todayStr });
        
        if (!mealPlans || mealPlans.length === 0) {
            return Response.json({ message: "No meals planned for today." });
        }

        // Group meal plans by user (created_by)
        const userMeals = {};
        for (const plan of mealPlans) {
            if (!userMeals[plan.created_by]) {
                userMeals[plan.created_by] = [];
            }
            userMeals[plan.created_by].push(plan);
        }

        const emailsSent = [];

        // Send an email to each user with their meals for the day
        for (const [email, plans] of Object.entries(userMeals)) {
            const mealListHtml = plans.map(p => `<li><strong>${p.meal_type.charAt(0).toUpperCase() + p.meal_type.slice(1)}:</strong> ${p.recipe_name}</li>`).join('');
            const body = `
                <h2>Your MoodFull Meals for Today!</h2>
                <p>Here is what you have planned for today:</p>
                <ul>${mealListHtml}</ul>
                <p>Happy cooking!</p>
            `;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: email,
                subject: "Your Daily Meal Plan",
                body: body
            });
            emailsSent.push(email);
        }

        return Response.json({ success: true, emailsSent });
    } catch (error) {
        console.error("Error sending daily meal reminders:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});