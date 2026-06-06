import { useState } from "react";

function ChatInput({ onSendMessage, isLoading }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <textarea
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask something like: Explain streaming AI responses in React..."
        rows={1}
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
      >
        {isLoading ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;