function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <h2>Start building an AI conversation</h2>

      <p>
        This interface simulates how modern AI products handle user prompts,
        assistant responses, loading states, errors, and response actions.
      </p>

      <div className="empty-grid">
        <div>
          <strong>UX states</strong>
          <span>Empty, loading, error, and success states.</span>
        </div>

        <div>
          <strong>AI interaction</strong>
          <span>User and assistant message roles.</span>
        </div>

        <div>
          <strong>Product actions</strong>
          <span>Copy, regenerate, and clear chat.</span>
        </div>
      </div>
    </section>
  );
}

export default EmptyState;