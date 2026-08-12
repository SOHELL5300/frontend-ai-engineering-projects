export default function ErrorMessage({ message }) {
  return (
    <div className="errorBox" role="alert">
      <strong>Something went wrong</strong>
      <p>{message}</p>
    </div>
  );
}