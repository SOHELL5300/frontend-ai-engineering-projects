import { starterPrompts } from "../data/starterPrompts";

function Sidebar({ hasMessages, onClearChat, onPromptSelect }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">AI</div>
        <div>
          <h2>AI Product UI</h2>
          <p>Frontend AI Engineering</p>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Starter prompts</h3>

        <div className="prompt-list">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt.id}
              className="prompt-card"
              type="button"
              onClick={() => onPromptSelect(prompt.prompt)}
            >
              <span>{prompt.title}</span>
              <small>{prompt.prompt}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          className="clear-button"
          type="button"
          onClick={onClearChat}
          disabled={!hasMessages}
        >
          Clear chat
        </button>

        <p>
          Built for React.js developers learning AI-powered frontend systems.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;