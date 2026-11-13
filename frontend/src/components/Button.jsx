export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  type,
  ...props
}) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const resolvedType =
    Component === 'button' && type === undefined ? 'button' : type

  return (
    <Component className={classes} type={resolvedType} {...props}>
      {children}
    </Component>
  )
}
