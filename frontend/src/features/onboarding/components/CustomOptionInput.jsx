// src/features/onboarding/components/CustomOptionInput.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function CustomOptionInput({
  label = 'Please specify:',
  value = '',
  onChange,
  placeholder = 'Type your custom details…',
  maxLength = 100,
  error,
  className = '',
}) {
  return (
    <div className={`mt-3 p-3.5 rounded-xl bg-[#141414] border border-[#292929] animate-in fade-in slide-in-from-top-2 duration-150 ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-[#D5C5FF] tracking-wide flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-current" strokeWidth={2}>
            <path d="M12 2l2 2-9 9H3v-2l9-9z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {label}
        </label>
        {maxLength && (
          <span className="text-[10px] font-mono text-[#737373]">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-sm text-[#FAFAFA] placeholder-[#666666] focus:outline-none focus:border-[#C3ABFA] transition-colors"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange?.('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#737373] hover:text-[#FAFAFA] rounded-md transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 stroke-current" strokeWidth={2}>
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {error && <p className="text-[#F07891] text-xs mt-1.5">{error}</p>}
    </div>
  );
}

CustomOptionInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  error: PropTypes.string,
  className: PropTypes.string,
};
