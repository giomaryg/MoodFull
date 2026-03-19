import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { recipe, typeOrPrompt } = await req.json();

        const promptMap = {
          'quicker': `Provide a quicker variation of "${recipe.name}". Simplify the ingredients and instructions.`,
          'gourmet': `Provide a complex, gourmet, chef-level variation of "${recipe.name}" that takes longer but is extremely elevated.`,
          'vegan': `Provide a vegan variation of "${recipe.name}". Replace any animal products with vegan alternatives.`,
          'spicier': `Provide a spicier variation of "${recipe.name}". Add heat and bold spices.`
        };

        const finalPrompt = promptMap[typeOrPrompt] || `Create a variation of "${recipe.name}" with this specific modification: "${typeOrPrompt}". Adapt the ingredients and instructions accordingly.`;

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `${finalPrompt} Keep the core identity but apply the requested changes.`,
          response_json_schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              ingredients: { type: "array", items: { type: "string" } },
              instructions: { type: "array", items: { type: "string" } },
              prep_time: { type: "string" },
              cook_time: { type: "string" },
              servings: { type: "number" },
              difficulty: { type: "string" },
              nutrition: {
                type: "object",
                properties: {
                  calories: { type: "number" },
                  protein: { type: "string" },
                  carbs: { type: "string" },
                  fat: { type: "string" },
                  fiber: { type: "string" },
                  sodium: { type: "string" },
                  sugar: { type: "string" }
                }
              }
            }
          }
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});