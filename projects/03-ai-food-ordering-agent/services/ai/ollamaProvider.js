/**
 * Ollama configuration.
 *
 * Ollama runs locally on the developer's machine.
 * By default, Ollama exposes its API at:
 *
 * http://localhost:11434
 *
 * These values can be overridden using .env.local.
 */

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "llama3.2:3b";

/**
 * Parse a natural-language food ordering command
 * using a locally running Ollama model.
 *
 * Example input:
 *
 * "Order two paneer burgers from Burger House"
 *
 * Example output:
 *
 * {
 *   intent: "ADD_TO_CART",
 *   restaurantName: "Burger House",
 *   items: [
 *     {
 *       name: "paneer burger",
 *       quantity: 2,
 *       modifiers: []
 *     }
 *   ],
 *   originalCommand: "Order two paneer burgers from Burger House"
 * }
 *
 * @param {string} command - User's natural language command
 * @returns {Promise<object>} Structured command
 */
export async function parseCommandWithOllama(command) {
  /**
   * We explicitly tell the model what role it has.
   *
   * The model should interpret the user's request,
   * but it should NOT execute any real-world action.
   *
   * Actual actions such as adding something to the cart
   * will be handled by our application.
   */
  const prompt = `
You are an AI command parser for a food ordering application.

Your ONLY responsibility is to understand the user's command
and convert it into structured JSON.

You do NOT place orders.
You do NOT invent restaurants.
You do NOT invent menu items.
You only interpret what the user said.

Supported intents:

- ADD_TO_CART
- REMOVE_FROM_CART
- CLEAR_CART
- PLACE_ORDER
- SHOW_CART
- UNKNOWN

Return ONLY valid JSON.

Use exactly this structure:

{
  "intent": "ADD_TO_CART",
  "restaurantName": "",
  "items": [
    {
      "name": "",
      "quantity": 1,
      "modifiers": []
    }
  ],
  "originalCommand": ""
}

Rules:

1. Use ADD_TO_CART when the user wants to order, buy,
   add, or get a food item.

2. Use REMOVE_FROM_CART when the user wants to remove
   an item from the cart.

3. Use CLEAR_CART when the user wants to clear,
   empty, or remove everything from the cart.

4. Use PLACE_ORDER when the user explicitly wants to
   confirm or place the order.

5. Use SHOW_CART when the user wants to see their cart.

6. Use UNKNOWN when the command does not match any
   supported intent.

7. If quantity is not mentioned, use quantity 1.

8. If the user mentions a restaurant, put its name
   in restaurantName.

9. If no restaurant is mentioned, use an empty string
   for restaurantName.

10. If no food item is mentioned, use an empty items array.

11. If no modifier is mentioned, use an empty modifiers array.

12. Do not invent information that the user did not provide.

13. Keep the original user command exactly in originalCommand.

14. Return JSON only.

15. Do not use markdown.

16. Do not explain your answer.

User command:

${command}
`;

  console.log("Sending command to Ollama...");
  console.log("Model:", OLLAMA_MODEL);

  /**
   * Send the request to Ollama's local API.
   *
   * We use /api/chat because it provides a simple
   * conversational interface for our command parser.
   */
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model: OLLAMA_MODEL,

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      /**
       * We want one complete response instead of
       * receiving multiple streaming chunks.
       */
      stream: false,

      /**
       * Ask Ollama to return JSON.
       *
       * This significantly reduces the chance of receiving
       * normal conversational text instead of JSON.
       */
      format: "json",

      /**
       * Temperature 0 makes the model's output more
       * deterministic, which is useful for structured
       * command parsing.
       */
      options: {
        temperature: 0,
      },
    }),
  });

  /**
   * Ollama may return an HTTP error if:
   *
   * - Ollama is not running
   * - The model doesn't exist
   * - The request is invalid
   * - The local Ollama server has another problem
   */
  if (!response.ok) {
    const errorText = await response.text();

    console.error("Ollama API error:", errorText);

    throw new Error(
      `Ollama request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  console.log("Raw Ollama response received.");

  /**
   * Ollama's chat response contains the model's
   * generated content here:
   *
   * data.message.content
   */
  const outputText = data?.message?.content;

  if (!outputText) {
    throw new Error("Ollama returned an empty response.");
  }

  console.log("Ollama output:", outputText);

  /**
   * Convert the model's JSON string into an actual
   * JavaScript object.
   */
  try {
    const parsedCommand = JSON.parse(outputText);

    return parsedCommand;
  } catch (error) {
    console.error(
      "Failed to parse Ollama response as JSON:",
      outputText
    );

    throw new Error("Ollama returned invalid JSON.");
  }
}