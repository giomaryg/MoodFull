import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { recipeName, instructions, mode } = await req.json();

        const modePrompt = mode === 'simplify' 
          ? "Simplify these instructions to be as easy to understand as possible for a beginner. Reduce the number of steps if possible."
          : "Make these instructions extremely detailed, step-by-step, including visual cues, temperatures, and professional techniques.";
          
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Here are the current instructions for ${recipeName}: \n${instructions.join('\n')}\n\n${modePrompt} Return ONLY a list of strings representing the new steps.`,
          response_json_schema: {
            type: "object",
            properties: {
              instructions: { type: "array", items: { type: "string" } }
            }
          }
        });

        return Response.json(response);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});