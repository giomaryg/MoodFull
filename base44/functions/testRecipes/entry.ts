import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const recipeData1 = {
          name: "Test Recipe By User",
          mood: "Test Mood",
          description: "Test Description"
        };
        
        const recipeData2 = {
          name: "Test Recipe By Admin",
          mood: "Test Mood",
          description: "Test Description"
        };
        const resAdmin = await base44.asServiceRole.entities.Recipe.create(recipeData2);
        const fetchedAdmin = await base44.asServiceRole.entities.Recipe.get(resAdmin.id).catch(e => e.message);
        const listAdmin = await base44.asServiceRole.entities.Recipe.list();

        let userRes = null, userFetched = null, listUser = [];
        try {
            userRes = await base44.entities.Recipe.create(recipeData1);
            userFetched = await base44.entities.Recipe.get(userRes.id).catch(e => e.message);
            listUser = await base44.entities.Recipe.list();
        } catch (err) {
            userRes = err.message;
        }
        
        return Response.json({ 
            success: true, 
            admin: { createdId: resAdmin.id, fetched: fetchedAdmin, listLength: listAdmin.length },
            user: { createdId: userRes?.id || userRes, fetched: userFetched, listLength: listUser.length }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});