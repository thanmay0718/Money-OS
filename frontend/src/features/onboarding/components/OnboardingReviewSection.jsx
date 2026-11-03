// src/features/onboarding/components/OnboardingReviewSection.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function OnboardingReviewSection({
  title,
  stepNumber,
  onEdit,
  items = [], // array of { label, value, type: 'text' | 'currency' | 'chips' | 'badge' | 'custom' }
  currency = 'INR',
  className = '',
}) {
  // Filter out any items that have no completed value
  const activeItems = items.filter((item) => {
    if (item.value === null || item.value === undefined || item.value === '') return false;
    if (Array.isArray(item.value) && item.value.length === 0) return false;
    return true;
  });

  if (activeItems.length === 0) return null;

  const formatCurrency = (val) => {
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (currency === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return `${currency} ${num.toLocaleString()}`;
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl bg-[#181818] border border-[#292929] hover:border-[#383838] transition-colors ${className}`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242424]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C3ABFA]" />
          <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-wide">{title}</h3>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(stepNumber)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#C3ABFA] hover:text-[#D5C5FF] hover:bg-[#C3ABFA]/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C3ABFA]"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-current" strokeWidth={2}>
              <path d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {activeItems.map((item, idx) => {
          let renderedValue = null;

          if (item.type === 'currency') {
            renderedValue = (
              <span className="font-mono text-sm font-medium text-[#FAFAFA]">
                {formatCurrency(item.value)}
              </span>
            );
          } else if (item.type === 'chips' && Array.isArray(item.value)) {
            renderedValue = (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {item.value.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#222222] border border-[#333333] text-[11px] font-medium text-[#D5C5FF]"
                  >
                    {typeof v === 'object' && v?.label ? v.label : String(v)}
                  </span>
                ))}
              </div>
            );
          } else if (item.type === 'badge') {
            renderedValue = (
              <span className="px-2 py-0.5 rounded-full bg-[#C3ABFA]/15 border border-[#C3ABFA]/30 text-xs font-medium text-[#D5C5FF]">
                {String(item.value)}
              </span>
            );
          } else if (typeof item.value === 'boolean') {
            renderedValue = (
              <span
                className={`text-xs font-medium ${
                  item.value ? 'text-[#70D6A3]' : 'text-[#888888]'
                }`}
              >
                {item.value ? 'Enabled' : 'Disabled'}
              </span>
            );
          } else {
            renderedValue = (
              <span className="text-xs sm:text-sm text-[#FAFAFA] font-medium text-right max-w-[65%] break-words">
                {String(item.value)}
              </span>
            );
          }

          return (
            <div
              key={idx}
              className="flex items-start justify-between gap-4 py-1 text-xs sm:text-sm border-b border-[#202020] last:border-0"
            >
              <span className="text-[#888888] font-normal flex-shrink-0">{item.label}</span>
              {renderedValue}
            </div>
          );
        })}
      </div>
    </div>
  );
}

OnboardingReviewSection.propTypes = {
  title: PropTypes.string.isRequired,
  stepNumber: PropTypes.number.isRequired,
  onEdit: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
      type: PropTypes.oneOf(['text', 'currency', 'chips', 'badge', 'custom']),
    })
  ).isRequired,
  currency: PropTypes.string,
  className: PropTypes.string,
};
