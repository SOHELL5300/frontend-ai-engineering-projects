import EmptyState from "./EmptyState";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

function ChatWindow({ messages, isAssistantTyping, onRegenerate }) {
  if (messages.length === 0 && !isAssistantTyping) {
    return <EmptyState />;
  }

  return (
    <section className="chat-window" aria-label="Chat messages">
      {messages.map((message, index) => {
        const isLastAssistantMessage =
          message.role === "assistant" && index === messages.length - 1;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            showRegenerate={isLastAssistantMessage}
            onRegenerate={onRegenerate}
          />
        );
      })}

      {isAssistantTyping && <TypingIndicator />}
    </section>
  );
}

export default ChatWindow;