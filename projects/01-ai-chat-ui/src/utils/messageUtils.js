export function createUserMessage(content) {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    createdAt: getFormattedTime(),
  };
}

export function createAssistantMessage(content, isRegenerated = false) {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    createdAt: getFormattedTime(),
    isRegenerated,
  };
}

function getFormattedTime() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}