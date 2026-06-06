import { useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import ErrorBanner from "./components/ErrorBanner";
import { getMockAiResponse } from "./services/mockAiService";
import { createAssistantMessage, createUserMessage } from "./utils/messageUtils";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [error, setError] = useState("");

  const hasMessages = messages.length > 0;

  const lastUserMessage = useMemo(() => {
    const userMessages = messages.filter((message) => message.role === "user");
    return userMessages[userMessages.length - 1];
  }, [messages]);

  const sendMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isAssistantTyping) {
      return;
    }

    const userMessage = createUserMessage(trimmedMessage);

    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setError("");
    setIsAssistantTyping(true);

    try {
      const aiResponse = await getMockAiResponse(trimmedMessage);
      const assistantMessage = createAssistantMessage(aiResponse);

      setMessages((previousMessages) => [...previousMessages, assistantMessage]);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while generating the AI response. Please try again."
      );
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const regenerateResponse = async () => {
    if (!lastUserMessage || isAssistantTyping) {
      return;
    }

    setError("");
    setIsAssistantTyping(true);

    setMessages((previousMessages) => {
      const lastMessage = previousMessages[previousMessages.length - 1];

      if (lastMessage?.role === "assistant") {
        return previousMessages.slice(0, previousMessages.length - 1);
      }

      return previousMessages;
    });

    try {
      const aiResponse = await getMockAiResponse(lastUserMessage.content);
      const assistantMessage = createAssistantMessage(aiResponse, true);

      setMessages((previousMessages) => [...previousMessages, assistantMessage]);
    } catch (err) {
      setError(
        err.message ||
          "Unable to regenerate the response. Please try again."
      );
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    setIsAssistantTyping(false);
  };

  return (
    <main className="app-shell">
      <Sidebar
        hasMessages={hasMessages}
        onClearChat={clearChat}
        onPromptSelect={sendMessage}
      />

      <section className="chat-panel">
        <Header />

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={() => setError("")}
            onRetry={regenerateResponse}
            canRetry={Boolean(lastUserMessage)}
          />
        )}

        <ChatWindow
          messages={messages}
          isAssistantTyping={isAssistantTyping}
          onRegenerate={regenerateResponse}
        />

        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isAssistantTyping}
        />
      </section>
    </main>
  );
}

export default App;