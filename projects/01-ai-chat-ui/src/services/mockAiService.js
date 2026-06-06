const responseMap = [
  {
    keywords: ["state", "management", "react"],
    response:
      "For an AI chat interface, state management usually includes the message list, current input value, loading state, error state, and metadata like message roles. In this project, local component state is enough because the app is small. In a larger product, this could move to Context, Redux Toolkit, Zustand, or server-backed conversation storage.",
  },
  {
    keywords: ["interview", "explain", "project"],
    response:
      "In an interview, you can explain this project as a React-based AI chat experience. The focus is not only UI, but also frontend architecture: reusable components, message role handling, async mock service integration, loading and error states, copy response, regenerate response, and clean separation between UI and service logic.",
  },
  {
    keywords: ["ux", "improvements", "assistant"],
    response:
      "Useful UX improvements include streaming responses, message persistence, keyboard shortcuts, markdown rendering, code block formatting, prompt templates, conversation history, feedback buttons, and accessibility improvements like better focus states and screen reader labels.",
  },
];

const fallbackResponses = [
  "This is a simulated AI response. In a real product, this layer would call an AI API and return the assistant response. The UI would remain almost the same because the service logic is separated from the components.",
  "A good AI frontend should handle more than just text rendering. It should manage loading states, errors, retries, message roles, empty states, and user actions like copy or regenerate.",
  "From a frontend engineering point of view, this project shows component design, asynchronous UI handling, state updates, and AI-product interaction patterns.",
];

const wait = (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

export async function getMockAiResponse(prompt) {
  await wait(1200);

  const normalizedPrompt = prompt.toLowerCase();

  if (normalizedPrompt.includes("trigger error")) {
    throw new Error(
      "Mock AI service failed. This is intentional so you can test the error state."
    );
  }

  const matchedResponse = responseMap.find((item) => {
    return item.keywords.some((keyword) => normalizedPrompt.includes(keyword));
  });

  if (matchedResponse) {
    return matchedResponse.response;
  }

  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}