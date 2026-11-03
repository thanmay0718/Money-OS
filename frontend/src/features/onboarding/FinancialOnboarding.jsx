// src/features/onboarding/FinancialOnboarding.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadProfile, setStep } from './onboardingSlice';
import OnboardingLayout from './components/OnboardingLayout';
import ProfessionalProfileStep from './ProfessionalProfileStep';
import LivingSituationStep from './LivingSituationStep';
import FinancialResponsibilitiesStep from './FinancialResponsibilitiesStep';
import FinancialGoalsStep from './FinancialGoalsStep';
import FinancialPreferencesStep from './FinancialPreferencesStep';
import ProfileReviewStep from './ProfileReviewStep';

const STEPS = [
  { id: 1, component: ProfessionalProfileStep, label: 'Professional', title: 'Professional Life' },
  { id: 2, component: LivingSituationStep, label: 'Living', title: 'Living & Lifestyle' },
  { id: 3, component: FinancialResponsibilitiesStep, label: 'Responsibilities', title: 'Responsibilities & Commitments' },
  { id: 4, component: FinancialGoalsStep, label: 'Goals', title: 'Goals & Aspirations' },
  { id: 5, component: FinancialPreferencesStep, label: 'Preferences', title: 'Financial Preferences' },
  { id: 6, component: ProfileReviewStep, label: 'Review', title: 'Review & Complete' },
];

export default function FinancialOnboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === '1' || searchParams.get('mode') === 'edit';

  const { step, loading, completed, status } = useSelector((s) => s.onboarding);
  const { sessionRestored } = useSelector((s) => s.auth);

  // Try to load existing profile if not yet loaded
  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadProfile());
    }
  }, [dispatch, status]);

  // If already completed and user is not explicitly editing, redirect to dashboard
  useEffect(() => {
    if (sessionRestored && status === 'succeeded' && completed && !isEditMode) {
      navigate('/', { replace: true });
    }
  }, [sessionRestored, status, completed, isEditMode, navigate]);

  if (!sessionRestored || (loading && status === 'idle')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#181818] border border-[#292929] shadow-xl">
          <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin" />
          <p className="text-[#A3A3A3] text-xs font-mono tracking-wide">
            Calibrating your financial workspace…
          </p>
        </div>
      </div>
    );
  }

  const currentStepConfig = STEPS[step - 1] || STEPS[0];
  const CurrentStep = currentStepConfig.component;

  return (
    <OnboardingLayout
      step={step}
      totalSteps={STEPS.length}
      stepLabels={STEPS.map((s) => s.label)}
      currentSectionTitle={currentStepConfig.title}
      onSelectStep={(targetStep) => dispatch(setStep(targetStep))}
      isEditMode={isEditMode}
      completed={completed}
    >
      <CurrentStep />
    </OnboardingLayout>
  );
}
