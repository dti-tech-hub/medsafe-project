import {
  CircleCheck,
  CircleAlert,
  Info,
  TriangleAlert,
} from 'lucide-react'

const ALERT_ICONS = {
  info: <Info size={19} />,
  success: <CircleCheck size={19} />,
  warning: <TriangleAlert size={19} />,
  danger: <CircleAlert size={19} />,
}

export function Alert({
  tone = 'info',
  title,
  children,
  className = '',
  role = 'note',
}) {
  return (
    <div
      className={`alert alert--${tone}${className ? ` ${className}` : ''}`}
      role={role}
    >
      <span className="alert-icon" aria-hidden="true">
        {ALERT_ICONS[tone] || ALERT_ICONS.info}
      </span>
      <div className="alert-body">
        {title ? <strong className="alert-title">{title}</strong> : null}
        {children ? <div className="alert-content">{children}</div> : null}
      </div>
    </div>
  )
}
