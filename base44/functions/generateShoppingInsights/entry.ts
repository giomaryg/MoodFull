import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { itemsToAnalyze, inventoryNames, upcomingMeals } = await req.json();

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyze this shopping list: ${itemsToAnalyze.join(', ')}.
Current Pantry Inventory: ${inventoryNames || 'None'}
Upcoming Meals (next 7 days): ${upcomingMeals || 'None'}

1. Categorize these items into logical grocery aisles (e.g. Produce, Meat, Dairy, Pantry, Frozen, etc) to optimize for grocery store layout.
2. Estimate the total cost in USD and provide a breakdown per category to optimize for cost-efficiency.
3. Suggest 2-3 smart substitutions specifically based on what they already have in their Pantry Inventory.
4. Suggest 2-3 proactive items they might need for their Upcoming Meals but forgot to add to the list.
5. Suggest item-specific bulk buying opportunities or promotions based on these items.
Return JSON.`,
          response_json_schema: {
             type: "object",
             properties: {
                categories: {
                   type: "array",
                   items: {
                      type: "object",
                      properties: {
                         categoryName: { type: "string" },
                         items: { type: "array", items: { type: "string" } }
                      }
                   }
                },
                categoryCosts: {
                   type: "array",
                   items: {
                      type: "object",
                      properties: {
                         category: { type: "string" },
                         cost: { type: "string" }
                      }
                   }
                },
                itemCosts: {
                   type: "array",
                   items: {
                      type: "object",
                      properties: {
                         item: { type: "string" },
                         estimatedCost: { type: "string" }
                      }
                   }
                },
                estimatedTotalCost: { type: "string" },
                substitutions: { type: "array", items: { type: "string" } },
                proactiveSuggestions: { type: "array", items: { type: "string" } },
                bulkOpportunities: { type: "array", items: { type: "string" } }
             }
          }
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});