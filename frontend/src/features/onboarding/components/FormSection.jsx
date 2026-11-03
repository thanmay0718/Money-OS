// src/features/onboarding/components/FormSection.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function FormSection({
  title,
  description,
  badge,
  children,
  collapsible = false,
  defaultOpen = true,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`flex items-start justify-between ${
          collapsible ? 'cursor-pointer select-none group' : ''
        }`}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight group-hover:text-white transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#222222] border border-[#333333] text-[#D5C5FF]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-[#888888] mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {collapsible && (
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#737373] group-hover:text-[#FAFAFA] group-hover:bg-[#222222] transition-colors"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse section' : 'Expand section'}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className={`w-4 h-4 transition-transform duration-200 stroke-current ${
                isOpen ? 'rotate-180 text-[#C3ABFA]' : ''
              }`}
              strokeWidth={2}
            >
              <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {(!collapsible || isOpen) && (
        <div className="animate-in fade-in duration-200">{children}</div>
      )}
    </div>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  badge: PropTypes.string,
  children: PropTypes.node.isRequired,
  collapsible: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  className: PropTypes.string,
};
