import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This is a scheduled task, so it will run as admin (via service role if needed)
        const user = await base44.auth.me();
        if (user?.role !== 'admin') { 
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 }); 
        }

        // Fetch all ingredients across all users using service role
        const inventory = await base44.asServiceRole.entities.Ingredient.list();
        
        // Group by user email
        const userInventory = {};
        for (const item of inventory) {
            if (item.expiry_date && item.created_by) {
                const days = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                // Items expiring in 3 days or less
                if (days >= 0 && days <= 3) {
                    if (!userInventory[item.created_by]) {
                        userInventory[item.created_by] = [];
                    }
                    userInventory[item.created_by].push(item);
                }
            }
        }

        // Send notification emails
        for (const [email, items] of Object.entries(userInventory)) {
            const itemNames = items.map(i => i.name).join(', ');
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: email,
                subject: 'Action Required: Pantry Items Expiring Soon! 🕒',
                body: `Hello!\n\nYou have some ingredients expiring in the next 3 days: ${itemNames}.\n\nOpen your app and ask your AI Kitchen Assistant to suggest some recipes to use them up before they go bad!\n\nBest,\nYour Kitchen AI`
            });
        }

        return Response.json({ success: true, notifiedUsers: Object.keys(userInventory).length });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});