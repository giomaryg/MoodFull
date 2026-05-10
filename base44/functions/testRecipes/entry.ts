import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        const recipeData1 = {
          name: "Test Recipe By User Again",
          mood: "Test Mood",
          description: "Test Description"
        };
        
        // Use regular user token
        const recipeData2 = {
          name: "Test Recipe By Admin",
          mood: "Test Mood",
          description: "Test Description"
        };
        const res = await base44.asServiceRole.entities.Recipe.create(recipeData2);
        
        const fetched = await base44.asServiceRole.entities.Recipe.get(res.id).catch(e => e.message);
        
        const listAdmin = await base44.asServiceRole.entities.Recipe.list();
        
        return Response.json({ success: true, createdId: res.id, fetched, listAdminLength: listAdmin.length });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});