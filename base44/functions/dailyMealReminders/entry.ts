import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import DOMPurify from 'npm:isomorphic-dompurify@1.3.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This is an admin-only background job
        const adminUser = await base44.auth.me();
        if (adminUser?.role !== 'admin') { 
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 }); 
        }

        // Get all users
        const users = await base44.asServiceRole.entities.User.list();

        // Get all meal plans for today
        const todayStr = new Date().toISOString().slice(0, 10);
        const mealPlans = await base44.asServiceRole.entities.MealPlan.filter({ date: todayStr });
        const userMeals = {};
        for (const plan of mealPlans) {
            if (!userMeals[plan.created_by]) {
                userMeals[plan.created_by] = [];
            }
            userMeals[plan.created_by].push(plan);
        }
        
        const emailsSent = [];

        for (const u of users) {
            // Check if user has notifications enabled and has email method selected
            if (u.notifications_enabled && 
                u.notification_types?.includes('daily_reminder') && 
                u.notification_methods?.includes('email') && 
                u.email) {
                
                const plans = userMeals[u.email] || [];
                let mealContent = "";

                const escapeHtml = (unsafe) => {
                    return (unsafe || '').toString()
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                };

                if (plans.length > 0) {
                    const mealListHtml = plans.map(p => `<li><strong>${escapeHtml(p.meal_type).charAt(0).toUpperCase() + escapeHtml(p.meal_type).slice(1)}:</strong> ${escapeHtml(p.recipe_name)}</li>`).join('');
                    mealContent = `
                        <p>Here is what you have planned for today:</p>
                        <ul>${mealListHtml}</ul>
                        <p>Don't forget to log your mood this evening!</p>
                    `;
                } else {
                    mealContent = `
                        <p>Don't forget to log your mood and pick a meal for the evening.</p>
                        <p>MoodFull is ready to help you find the perfect recipe for your current vibe.</p>
                    `;
                }

                const body = `
                    <h2>Time to plan your evening! 🌙</h2>
                    <p>Hi ${escapeHtml(u.display_name || u.full_name || 'there')},</p>
                    ${mealContent}
                    <br/>
                    <a href="https://app.moodfull.com">Open MoodFull</a>
                    <br/><br/>
                    <p><small>You can change your notification settings in your Account info page.</small></p>
                `;

                const sanitizedBody = DOMPurify.sanitize(body);

                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: u.email,
                    subject: "Your Daily MoodFull Reminder",
                    body: sanitizedBody
                });
                emailsSent.push(u.email);
            }
        }

        return Response.json({ success: true, emailsSent });
    } catch (error) {
        console.error("Error sending daily meal reminders:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});