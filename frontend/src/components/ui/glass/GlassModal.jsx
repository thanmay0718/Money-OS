// src/components/ui/glass/GlassModal.jsx
import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import GlassSurface from './GlassSurface'
import GlassIconButton from './GlassIconButton'

/**
 * GlassModal provides a floating translucent modal dialog
 * with soft refraction highlights, responsive mobile positioning,
 * and keyboard accessibility (ESC to close).
 */
export default function GlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'glass-modal-title' : undefined}
    >
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Glass Dialog / Bottom Sheet on Mobile */}
      <GlassSurface
        ref={modalRef}
        variant="elevated"
        className={`relative z-10 w-full ${maxWidth} rounded-t-3xl sm:rounded-3xl border border-[rgba(241,223,177,0.18)] bg-[#1B1D20]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(241,223,177,0.2)] p-6 sm:p-7 max-h-[92vh] flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[rgba(241,223,177,0.12)] mb-5">
          <div>
            {title && (
              <h2 id="glass-modal-title" className="text-lg sm:text-xl font-semibold text-[#F5F3ED] tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#A5A5A0] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <GlassIconButton
            size="sm"
            onClick={onClose}
            title="Close modal"
            ariaLabel="Close modal"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {children}
        </div>
      </GlassSurface>
    </div>
  )
}

GlassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  className: PropTypes.string,
}
