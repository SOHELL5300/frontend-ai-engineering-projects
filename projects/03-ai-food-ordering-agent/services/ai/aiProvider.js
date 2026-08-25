import { parseCommandWithOllama } from "./ollamaProvider";

/**
 * Returns the AI provider used by the application.
 *
 * Keeping the provider behind this function allows us to
 * switch between Ollama, OpenAI, Gemini, or another provider
 * later without changing the API route or frontend code.
 */
export function getAIProvider() {
  return {
    parseCommand: parseCommandWithOllama,
  };
}