// src/components/ui/Button.jsx
import React from 'react'
import PropTypes from 'prop-types'
import GlassButton from './glass/GlassButton'

/**
 * Standard button used throughout MoneyOS.
 * Upgraded to use the Apple Liquid Glass visual language.
 */
export default function Button({
  children,
  onClick,
  disabled,
  loading,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}) {
  return (
    <GlassButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant={variant}
      size={size}
      className={className}
      {...rest}
    >
      {children}
    </GlassButton>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'accent']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
}
