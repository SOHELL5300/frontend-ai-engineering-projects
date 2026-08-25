import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildFallbackResponse(command) {
  return {
    intent: "UNKNOWN",
    restaurantName: "",
    items: [],
    originalCommand: command,
  };
}

export async function POST(request) {
  try {
    const { command } = await request.json();

    if (!command || !command.trim()) {
      return Response.json(
        { error: "Command is required." },
        { status: 400 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    console.log("Checking Model for the api: ", model);

    const prompt = `
You are an AI command parser for a food ordering app.

Your job is to convert the user's natural language command into valid JSON only.

Supported intents:
1. ADD_TO_CART
2. REMOVE_FROM_CART
3. CLEAR_CART
4. PLACE_ORDER
5. SHOW_CART
6. UNKNOWN

Return only this JSON shape:
{
  "intent": "ADD_TO_CART",
  "restaurantName": "Restaurant name if mentioned",
  "items": [
    {
      "name": "Item name",
      "quantity": 1,
      "modifiers": ["extra cheese"]
    }
  ],
  "originalCommand": "user command"
}

Rules:
- If user wants to order/add/buy food, use ADD_TO_CART.
- If user wants to remove an item, use REMOVE_FROM_CART.
- If user wants to clear cart, use CLEAR_CART.
- If user wants to place/confirm/finalize order, use PLACE_ORDER.
- If user wants to see cart, use SHOW_CART.
- If quantity is missing, use 1.
- If restaurant is not mentioned, keep restaurantName empty.
- Return JSON only. No markdown. No explanation.

User command:
"${command}"
`;

    const response = await client.responses.create({
      model,
      input: prompt,
    });

    const outputText = response.output_text;

    let parsedCommand;

    try {
      parsedCommand = JSON.parse(outputText);
    } catch (error) {
      parsedCommand = buildFallbackResponse(command);
    }

    return Response.json({
      parsedCommand,
    });
  } catch (error) {
    console.error("AI command parsing failed:", error);

    return Response.json(
      {
        error: "Failed to parse command. Please try again.",
      },
      { status: 500 }
    );
  }
}