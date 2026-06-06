import { useState } from "react";

function MessageBubble({ message, showRegenerate, onRegenerate }) {
  const [copyLabel, setCopyLabel] = useState("Copy");

  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyLabel("Copied");

      setTimeout(() => {
        setCopyLabel("Copy");
      }, 1200);
    } catch {
      setCopyLabel("Failed");

      setTimeout(() => {
        setCopyLabel("Copy");
      }, 1200);
    }
  };

  return (
    <article className={`message-row ${isAssistant ? "assistant" : "user"}`}>
      <div className="avatar">
        {isAssistant ? "AI" : "You"}
      </div>

      <div className="message-content">
        <div className="message-meta">
          <strong>{isAssistant ? "Assistant" : "You"}</strong>
          <span>{message.createdAt}</span>
          {message.isRegenerated && <span className="regenerated">Regenerated</span>}
        </div>

        <p>{message.content}</p>

        {isAssistant && (
          <div className="message-actions">
            <button type="button" onClick={handleCopy}>
              {copyLabel}
            </button>

            {showRegenerate && (
              <button type="button" onClick={onRegenerate}>
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default MessageBubble;