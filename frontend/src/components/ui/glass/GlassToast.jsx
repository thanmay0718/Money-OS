// src/components/ui/glass/GlassToast.jsx
import React from 'react'
import PropTypes from 'prop-types'

/**
 * GlassToast provides a floating alert or status notification with translucent styling
 * and specular border highlights.
 */
export default function GlassToast({
  message,
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  onClose,
  className = '',
}) {
  const typeStyles = {
    success: 'bg-[#1B1D20]/95 border-[#72D6A3]/40 text-[#72D6A3] shadow-[0_4px_20px_rgba(114,214,163,0.2)]',
    error: 'bg-[#1B1D20]/95 border-[#F08080]/40 text-[#F08080] shadow-[0_4px_20px_rgba(240,128,128,0.2)]',
    warning: 'bg-[#1B1D20]/95 border-[#E9BC68]/40 text-[#E9BC68] shadow-[0_4px_20px_rgba(233,188,104,0.2)]',
    info: 'bg-[#1B1D20]/95 border-[#D6B875]/40 text-[#F1DFB1] shadow-[0_4px_20px_rgba(214,184,117,0.2)]',
  }[type] || 'bg-[#1B1D20]/95 border-[rgba(241,223,177,0.12)] text-[#F5F3ED]'

  const icons = {
    success: (
      <svg className="w-4 h-4 text-[#72D6A3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4 text-[#F08080] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4 text-[#E9BC68] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4 text-[#D6B875] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-lg text-xs sm:text-sm font-medium ${typeStyles} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {icons[type]}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

GlassToast.propTypes = {
  message: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func,
  className: PropTypes.string,
}
