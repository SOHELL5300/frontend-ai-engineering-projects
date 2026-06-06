function TypingIndicator() {
  return (
    <article className="message-row assistant">
      <div className="avatar">AI</div>

      <div className="message-content typing-card">
        <div className="typing-indicator" aria-label="Assistant is typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </article>
  );
}

export default TypingIndicator;