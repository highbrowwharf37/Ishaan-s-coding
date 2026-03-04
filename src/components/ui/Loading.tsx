export function Loading() {
  return (
    <div className="loading-bar">
      <div className="spinner" />
      Loading...
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="error-box">
      ⚠️ <strong>Could not load data.</strong> Try refreshing.<br />
      <small>{message}</small>
    </div>
  );
}

export function Empty({ message = 'No data.' }: { message?: string }) {
  return <div className="loading-bar">{message}</div>;
}
