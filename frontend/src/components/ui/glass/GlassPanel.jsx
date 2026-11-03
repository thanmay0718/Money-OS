// src/components/ui/glass/GlassPanel.jsx
import React from 'react'
import PropTypes from 'prop-types'
import GlassSurface from './GlassSurface'

/**
 * GlassPanel provides high-depth, refined container styling with deeper
 * backdrop blur and specular highlights for focal financial panels.
 */
export default function GlassPanel({ children, className = '', ...props }) {
  return (
    <GlassSurface variant="elevated" className={`p-6 ${className}`} {...props}>
      {children}
    </GlassSurface>
  )
}

GlassPanel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}
