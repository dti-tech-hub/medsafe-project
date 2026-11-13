export function Spinner({ label = 'Loading' }) {
  return (
    <span className="spinner" role="status">
      <span className="sr-only">{label}</span>
    </span>
  )
}
