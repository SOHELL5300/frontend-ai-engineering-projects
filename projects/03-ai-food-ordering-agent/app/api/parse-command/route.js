import { getAIProvider } from "@/services/ai/aiProvider";

/**
 * POST /api/parse-command
 *
 * Receives a natural-language command from the frontend
 * and sends it to our configured AI provider.
 *
 * Example request:
 *
 * {
 *   "command": "Order one masala dosa from South Kitchen"
 * }
 *
 * Example response:
 *
 * {
 *   "success": true,
 *   "parsedCommand": {
 *     "intent": "ADD_TO_CART",
 *     "restaurantName": "South Kitchen",
 *     "items": [
 *       {
 *         "name": "masala dosa",
 *         "quantity": 1,
 *         "modifiers": []
 *       }
 *     ],
 *     "originalCommand": "Order one masala dosa from South Kitchen"
 *   }
 * }
 */
export async function POST(request) {
  try {
    /**
     * Read the JSON body sent by the frontend.
     */
    const body = await request.json();

    const command = body?.command;

    /**
     * Validate the incoming command.
     *
     * We don't want to send an empty command
     * to the AI model.
     */
    if (!command || typeof command !== "string" || !command.trim()) {
      return Response.json(
        {
          success: false,
          error: "Command is required.",
        },
        {
          status: 400,
        }
      );
    }

    console.log("=================================");
    console.log("Received command:", command);
    console.log("=================================");

    /**
     * Get the currently configured AI provider.
     *
     * At the moment this returns Ollama.
     *
     * Later we can change this to OpenAI, Gemini,
     * or another provider without modifying this API route.
     */
    const aiProvider = getAIProvider();

    /**
     * Ask the AI provider to understand the command.
     */
    const parsedCommand = await aiProvider.parseCommand(
      command.trim()
    );

    console.log("Parsed command:", parsedCommand);

    /**
     * Return the structured command to the frontend.
     */
    return Response.json(
      {
        success: true,
        parsedCommand,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    /**
     * This error is intentionally logged on the server.
     *
     * During development, this allows us to see the
     * actual Ollama error in the terminal instead of
     * only seeing "500 Internal Server Error" in the browser.
     */
    console.error("=================================");
    console.error("AI command parsing failed:");
    console.error(error);
    console.error("=================================");

    /**
     * Return a safe error response to the frontend.
     *
     * We don't expose unnecessary internal information
     * such as stack traces to the browser.
     */
    return Response.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to parse command. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}