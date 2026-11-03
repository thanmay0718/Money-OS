// src/features/onboarding/components/SelectableCard.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function SelectableCard({
  selected = false,
  onClick,
  title,
  description,
  icon,
  badge,
  type = 'radio', // 'radio' | 'checkbox'
  disabled = false,
  className = '',
  id,
}) {
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      id={id}
      role={type}
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={`relative group flex flex-col p-4 rounded-xl border text-left transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C3ABFA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010] ${
        disabled
          ? 'opacity-40 cursor-not-allowed bg-[#181818]/50 border-[#292929]'
          : selected
          ? 'bg-[#C3ABFA]/10 border-[#C3ABFA] text-[#FAFAFA] shadow-[0_0_20px_rgba(195,171,250,0.14)] ring-1 ring-[#C3ABFA]/50'
          : 'bg-[#181818] hover:bg-[#1F1F1F] border-[#292929] hover:border-[#3D3D3D] text-[#A3A3A3]'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span
              className={`text-xl flex-shrink-0 transition-transform duration-200 ${
                selected ? 'scale-110' : 'group-hover:scale-105'
              }`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <span
            className={`font-medium text-sm leading-snug transition-colors ${
              selected ? 'text-[#FAFAFA]' : 'text-[#E5E5E5] group-hover:text-white'
            }`}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {badge && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#222222] border border-[#333333] text-[#D5C5FF]">
              {badge}
            </span>
          )}

          {/* Indicator circle or checkbox */}
          <div
            className={`w-4 h-4 rounded-${type === 'radio' ? 'full' : 'md'} border flex items-center justify-center transition-all duration-200 ${
              selected
                ? 'bg-[#C3ABFA] border-[#C3ABFA]'
                : 'border-[#444444] bg-[#141414] group-hover:border-[#666666]'
            }`}
          >
            {selected && (
              type === 'radio' ? (
                <div className="w-1.5 h-1.5 rounded-full bg-[#101010]" />
              ) : (
                <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 stroke-[#101010]" strokeWidth={2.2}>
                  <path d="M2 5l2.2 2.2L8 2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            )}
          </div>
        </div>
      </div>

      {description && (
        <p
          className={`text-xs leading-relaxed transition-colors mt-0.5 ${
            selected ? 'text-[#D5C5FF]/90' : 'text-[#888888] group-hover:text-[#A3A3A3]'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

SelectableCard.propTypes = {
  selected: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  badge: PropTypes.string,
  type: PropTypes.oneOf(['radio', 'checkbox']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};
