import React from 'react'

/**
 * Reusable Button
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'emergency' | 'success'
 * size: 'sm' | 'md' | 'lg'
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  id,
  ...rest
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''

  return (
    <button
      id={id}
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="spinner spinner-sm" aria-hidden="true" />
      ) : icon ? (
        <span className="btn-icon-inner" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

export default Button
