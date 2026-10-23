import "./Loading.css";

function Loading() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-mark" aria-hidden="true">
          <span>PMS</span>
        </div>
        <div className="loading-spinner" aria-hidden="true" />
        <div className="loading-copy">
          <strong>Loading workspace</strong>
          <span>Please wait a moment...</span>
        </div>
      </div>
    </div>
  );
}

export default Loading;
