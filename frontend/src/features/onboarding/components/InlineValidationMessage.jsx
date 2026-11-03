// src/features/onboarding/components/InlineValidationMessage.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function InlineValidationMessage({ message, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 p-2.5 rounded-lg bg-[#F07891]/10 border border-[#F07891]/30 text-[#F07891] text-xs font-medium animate-in fade-in duration-150 ${className}`}
    >
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0 stroke-current" strokeWidth={2}>
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v4M8 11.5v.5" strokeLinecap="round" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

InlineValidationMessage.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};
