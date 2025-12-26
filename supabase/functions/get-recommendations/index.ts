import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { readingHistory, watchlist, favoriteGenres, currentManga } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a manga recommendation expert. Based on the user's reading history, watchlist, favorite genres, and currently viewed manga, suggest similar manga they might enjoy.

Available manga in our database:
1. Solo Leveling - Action, Adventure, Fantasy, Supernatural
2. One Piece - Action, Adventure, Comedy, Fantasy
3. Jujutsu Kaisen - Action, Supernatural, School
4. My Hero Academia - Action, Superhero, School
5. Chainsaw Man - Action, Horror, Supernatural
6. Spy x Family - Action, Comedy, Slice of Life
7. Berserk - Action, Adventure, Dark Fantasy, Horror
8. Demon Slayer - Action, Supernatural, Historical

Always return recommendations as a JSON array with this structure:
[
  {
    "mangaId": "string (the id like 'solo-leveling')",
    "reason": "string explaining why this is recommended",
    "matchScore": number between 1-100
  }
]

Return 3-5 recommendations. Only recommend manga that exists in our database.`;

    const userMessage = `
User's reading history: ${JSON.stringify(readingHistory || [])}
User's watchlist: ${JSON.stringify(watchlist || [])}
User's favorite genres: ${JSON.stringify(favoriteGenres || [])}
Currently viewing: ${currentManga || "none"}

Please recommend manga based on this information.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_manga",
              description: "Return manga recommendations based on user preferences",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        mangaId: { type: "string" },
                        reason: { type: "string" },
                        matchScore: { type: "number" }
                      },
                      required: ["mangaId", "reason", "matchScore"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_manga" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const recommendations = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content as JSON
    const content = data.choices?.[0]?.message?.content || "[]";
    return new Response(JSON.stringify({ recommendations: JSON.parse(content) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
