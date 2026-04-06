export function LoadingSpinner({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <svg className="loading-spinner" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset="60"
          />
        </svg>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}