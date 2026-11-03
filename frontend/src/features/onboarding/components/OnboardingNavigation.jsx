// src/features/onboarding/components/OnboardingNavigation.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/Button';

export default function OnboardingNavigation({
  onBack,
  onNext,
  nextLabel = 'Continue →',
  backLabel = '← Back',
  loading = false,
  disabled = false,
  showBack = true,
  onSaveDraft,
  saveDraftLoading = false,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-8 border-t border-[#292929] ${className}`}
    >
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#A3A3A3] hover:text-[#FAFAFA] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C3ABFA]"
          >
            {backLabel}
          </button>
        ) : (
          <span />
        )}

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saveDraftLoading || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#888888] hover:text-[#D5C5FF] rounded-lg border border-[#292929] hover:border-[#3D3D3D] transition-colors"
          >
            {saveDraftLoading ? 'Saving draft…' : 'Save draft'}
          </button>
        )}
      </div>

      <div className="w-full sm:w-auto flex items-center justify-end gap-3">
        <Button
          onClick={onNext}
          disabled={disabled || loading}
          loading={loading}
          variant="primary"
          size="md"
          className="w-full sm:w-auto min-w-[140px]"
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

OnboardingNavigation.propTypes = {
  onBack: PropTypes.func,
  onNext: PropTypes.func.isRequired,
  nextLabel: PropTypes.node,
  backLabel: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  showBack: PropTypes.bool,
  onSaveDraft: PropTypes.func,
  saveDraftLoading: PropTypes.bool,
  className: PropTypes.string,
};
