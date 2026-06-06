function ErrorBanner({ message, onDismiss, onRetry, canRetry }) {
  return (
    <div className="error-banner" role="alert">
      <div>
        <strong>Response failed</strong>
        <p>{message}</p>
      </div>

      <div className="error-actions">
        {canRetry && (
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        )}

        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default ErrorBanner;