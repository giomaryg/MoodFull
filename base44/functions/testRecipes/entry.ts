import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        const recipeData = {
          name: "Test Recipe By User",
          mood: "Test Mood",
          description: "Test Description"
        };
        
        const res = await base44.entities.Recipe.create(recipeData);
        
        // Wait a bit just in case
        await new Promise(r => setTimeout(r, 500));
        
        const list = await base44.entities.Recipe.list();
        
        return Response.json({ success: true, userEmail: user.email, createdId: res?.id, listLength: list.length, res, list });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});