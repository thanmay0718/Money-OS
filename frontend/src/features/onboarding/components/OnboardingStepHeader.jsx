// src/features/onboarding/components/OnboardingStepHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function OnboardingStepHeader({
  stepNumber,
  totalSteps = 6,
  title,
  subtitle,
  category,
}) {
  return (
    <div className="mb-6 pb-4 border-b border-[#292929]">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C3ABFA]/10 border border-[#C3ABFA]/30 text-xs font-mono font-medium text-[#D5C5FF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C3ABFA]" />
          Step {stepNumber} of {totalSteps}
          {category && <span className="text-[#888888]">• {category}</span>}
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-[#FAFAFA] tracking-tight">
        {title}
      </h2>

      {subtitle && (
        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

OnboardingStepHeader.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  totalSteps: PropTypes.number,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  category: PropTypes.string,
};
