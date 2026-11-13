export function Badge({ tone = 'neutral', icon, children, className = '' }) {
  return (
    <span
      className={`badge badge--${tone}${className ? ` ${className}` : ''}`}
    >
      {icon ? (
        <span className="badge-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  )
}
