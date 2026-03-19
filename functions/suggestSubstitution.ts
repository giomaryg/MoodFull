import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { ingredient, recipeName, dietaryContext, inventoryContext } = await req.json();

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Suggest ONE single best substitution for "${ingredient}" in the recipe "${recipeName}".${dietaryContext}${inventoryContext}\nReturn ONLY the name of the substitute ingredient and the amount to use. Keep it very concise.`,
          response_json_schema: {
            type: "object",
            properties: {
              substitute: { type: "string" }
            }
          }
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});