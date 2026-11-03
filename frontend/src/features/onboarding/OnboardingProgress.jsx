// src/features/onboarding/OnboardingProgress.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function OnboardingProgress({
  step,
  total,
  labels = [],
  onSelectStep,
  currentSectionTitle,
}) {
  const progressPercent = Math.round(((step - 1) / (total - 1)) * 100);

  return (
    <div className="w-full space-y-4">
      {/* Mobile-friendly compact summary */}
      <div className="flex sm:hidden items-center justify-between px-1">
        <div>
          <span className="text-xs font-mono font-semibold text-[#C3ABFA]">
            Step {step} of {total}
          </span>
          <span className="text-xs text-[#FAFAFA] font-medium ml-2">
            {labels[step - 1] || currentSectionTitle}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#888888]">{progressPercent}%</span>
      </div>

      {/* Progress bar line for mobile */}
      <div className="sm:hidden h-1.5 w-full bg-[#202020] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#C3ABFA] to-[#D5C5FF] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Desktop Step timeline */}
      <div className="hidden sm:flex items-center justify-between relative">
        {Array.from({ length: total }).map((_, idx) => {
          const num = idx + 1;
          const isActive = num === step;
          const isDone = num < step;
          const label = labels[idx] || `Step ${num}`;

          return (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => onSelectStep?.(num)}
                  disabled={!onSelectStep}
                  title={`Go to ${label}`}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C3ABFA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010] ${
                    isDone
                      ? 'bg-[#C3ABFA]/20 border border-[#C3ABFA]/60 text-[#D5C5FF] hover:bg-[#C3ABFA]/30'
                      : isActive
                      ? 'bg-[#C3ABFA] text-[#101010] font-bold shadow-[0_0_16px_rgba(195,171,250,0.5)] ring-2 ring-[#C3ABFA]/30'
                      : 'bg-[#181818] text-[#737373] border border-[#292929] hover:border-[#3D3D3D] hover:text-[#A3A3A3]'
                  }`}
                >
                  {isDone ? (
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 stroke-current" strokeWidth={2.5}>
                      <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    num
                  )}
                </button>

                <span
                  className={`mt-2 text-xs font-medium tracking-tight text-center whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-[#FAFAFA] font-semibold'
                      : isDone
                      ? 'text-[#C3ABFA]'
                      : 'text-[#666666]'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line */}
              {num < total && (
                <div className="flex-1 mx-2 -mt-5">
                  <div className="h-0.5 w-full bg-[#242424] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C3ABFA] transition-all duration-500"
                      style={{ width: isDone ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

OnboardingProgress.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  labels: PropTypes.arrayOf(PropTypes.string),
  onSelectStep: PropTypes.func,
  currentSectionTitle: PropTypes.string,
};
