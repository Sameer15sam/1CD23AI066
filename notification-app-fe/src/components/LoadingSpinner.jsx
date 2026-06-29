export default function LoadingSpinner({ message = "Loading notifications…" }) {
  return (
    <div className="loading-spinner-wrap">
      <div className="spinner" aria-hidden="true" />
      <p className="spinner-text">{message}</p>
    </div>
  );
}
