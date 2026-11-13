export function EmptyState({
  icon: Icon,
  title,
  titleAs: Title = 'h2',
  children,
  action,
}) {
  return (
    <div className="empty-state">
      {Icon ? (
        <span className="empty-state-icon" aria-hidden="true">
          <Icon size={24} />
        </span>
      ) : null}
      <Title className="empty-state-title">{title}</Title>
      {children ? <div className="empty-state-body">{children}</div> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  )
}
