import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const recipeData = {
          name: "Test Recipe",
          mood: "Test Mood",
          description: "Test Description"
        };
        
        const res = await base44.asServiceRole.entities.Recipe.create(recipeData);
        
        // Wait a bit just in case
        await new Promise(r => setTimeout(r, 500));
        
        const fetchBack = await base44.asServiceRole.entities.Recipe.list();
        const getById = await base44.asServiceRole.entities.Recipe.get(res.id);
        
        return Response.json({ success: true, createdId: res.id, count: fetchBack.length, fetchBack, getById });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});