// src/features/onboarding/components/OnboardingLayout.jsx
import React from 'react';
import PropTypes from 'prop-types';
import OnboardingProgress from '../OnboardingProgress';

export default function OnboardingLayout({
  step,
  totalSteps,
  stepLabels,
  currentSectionTitle,
  onSelectStep,
  children,
  isEditMode = false,
  completed = false,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 flex flex-col items-center">
      {/* Top Banner / Heading */}
      <div className="w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#292929] mb-3">
          <span className="w-2 h-2 rounded-full bg-[#C3ABFA] animate-pulse" />
          <span className="text-xs font-mono text-[#D5C5FF] tracking-wider uppercase">
            {completed || isEditMode ? 'Financial Profile' : 'Financial Onboarding'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-display font-medium text-[#FAFAFA] tracking-tight">
          {completed || isEditMode ? 'Personalize your MoneyOS profile' : "Let's personalize your MoneyOS"}
        </h1>

        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2 max-w-xl mx-auto leading-relaxed">
          {completed || isEditMode
            ? 'Adjust your financial parameters, goals, and tracking preferences anytime.'
            : 'A few details will help us tailor your financial dashboard to your life.'}
        </p>
      </div>

      {/* Progress timeline */}
      <div className="w-full mb-8">
        <OnboardingProgress
          step={step}
          total={totalSteps}
          labels={stepLabels}
          onSelectStep={onSelectStep}
          currentSectionTitle={currentSectionTitle}
        />
      </div>

      {/* Main Form Card Container */}
      <div className="w-full bg-[#181818] border border-[#292929] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-5 sm:p-8 md:p-10 relative overflow-hidden backdrop-blur-sm">
        {/* Subtle top lavender highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3ABFA]/40 to-transparent" />
        
        {children}
      </div>
    </div>
  );
}

OnboardingLayout.propTypes = {
  step: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  stepLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentSectionTitle: PropTypes.string,
  onSelectStep: PropTypes.func,
  children: PropTypes.node.isRequired,
  isEditMode: PropTypes.bool,
  completed: PropTypes.bool,
};
