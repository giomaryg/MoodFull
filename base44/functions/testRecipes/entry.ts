import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const recipes = await base44.asServiceRole.entities.Recipe.list();
    return Response.json({ count: recipes.length, recipes });
});