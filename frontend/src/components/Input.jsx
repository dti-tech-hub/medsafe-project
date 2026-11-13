import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Input({
  label,
  id,
  type = 'text',
  hint,
  error,
  revealable = false,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const [visible, setVisible] = useState(false)
  const inputType = revealable && visible ? 'text' : type

  return (
    <div className={`form-field${className ? ` ${className}` : ''}`}>
      {label ? (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <span className="input-shell">
        <input
          id={inputId}
          type={inputType}
          className="text-input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {revealable ? (
          <button
            className="input-action"
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </span>
      {hint ? (
        <span className="form-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="form-error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

export function Textarea({ label, id, hint, error, className = '', ...props }) {
  const generatedId = useId()
  const inputId = id || generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`form-field${className ? ` ${className}` : ''}`}>
      {label ? (
        <label className="form-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        className="text-input textarea"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {hint ? (
        <span className="form-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="form-error" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  )
}
