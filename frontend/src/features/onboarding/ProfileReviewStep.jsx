// src/features/onboarding/ProfileReviewStep.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setStep, completeOnboarding, saveProfile } from './onboardingSlice';
import OnboardingStepHeader from './components/OnboardingStepHeader';
import OnboardingReviewSection from './components/OnboardingReviewSection';
import InlineValidationMessage from './components/InlineValidationMessage';
import Button from '../../components/ui/Button';
import { toast } from '../../lib/toast';

const LABEL_MAPS = {
  professionalStage: {
    STUDENT: 'Student',
    EARLY_CAREER: 'Early Career (0–3 yrs)',
    MID_CAREER: 'Mid Career (4–10 yrs)',
    SENIOR: 'Senior Professional (10+ yrs)',
    ENTREPRENEUR: 'Entrepreneur / Business Owner',
    RETIRED: 'Retired',
    OTHER: 'Other Career Stage',
  },
  employmentType: {
    SALARIED: 'Salaried Employee',
    SELF_EMPLOYED: 'Self-Employed / Freelancer',
    BUSINESS_OWNER: 'Business Owner',
    STUDENT: 'Student',
    UNEMPLOYED: 'Unemployed / Job Seeker',
    RETIRED: 'Retired',
    OTHER: 'Other Employment',
  },
  incomePattern: {
    FIXED_MONTHLY: 'Fixed Monthly Income',
    VARIABLE_MONTHLY: 'Variable Monthly Income',
    IRREGULAR: 'Irregular / Project-Based',
    PASSIVE: 'Passive Income',
    NO_CURRENT_INCOME: 'No Current Income',
    OTHER: 'Other Income Pattern',
  },
  paySchedule: {
    MONTHLY: 'Monthly',
    TWICE_A_MONTH: 'Twice a Month',
    EVERY_TWO_WEEKS: 'Every Two Weeks',
    WEEKLY: 'Weekly',
    IRREGULAR: 'Irregular Schedule',
    NOT_APPLICABLE: 'Not Applicable',
  },
  livingArrangement: {
    WITH_FAMILY: 'Living with Parents / Family',
    RENTING: 'Renting',
    OWN_WITH_MORTGAGE: 'Own Home with Mortgage',
    OWN_WITHOUT_MORTGAGE: 'Own Home without Mortgage',
    SHARED_ACCOMMODATION: 'Shared Accommodation',
    HOSTEL: 'Hostel / Student Housing',
    OTHER: 'Other Living Arrangement',
  },
  emergencySavingsStatus: {
    NOT_STARTED: 'Not Started',
    LESS_THAN_1_MONTH: 'Less than 1 Month',
    '1_TO_3_MONTHS': '1 to 3 Months',
    '3_TO_6_MONTHS': '3 to 6 Months',
    MORE_THAN_6_MONTHS: 'More than 6 Months',
    PREFER_NOT_TO_SAY: 'Private / Not Disclosed',
  },
  budgetingStyle: {
    FLEXIBLE: 'Flexible Budget',
    CATEGORY_BASED: 'Category-Based Budget',
    ZERO_BASED: 'Zero-Based Budget',
    SIMPLE: 'Simple Income vs. Expenses',
    NOT_SURE_YET: 'Guided / Not Sure Yet',
  },
  preferredReviewFrequency: {
    DAILY: 'Daily Check-in',
    WEEKLY: 'Weekly Review',
    MONTHLY: 'Monthly Retrospective',
  },
  financialComfort: {
    BEGINNER: 'Beginner',
    COMFORTABLE: 'Comfortable',
    EXPERIENCED: 'Experienced Investor',
    GUIDED: 'Prefer Guided Walkthroughs',
  },
};

export default function ProfileReviewStep() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error, completed, savingDraft, saveSuccessMessage } = useSelector(
    (s) => s.onboarding
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fmt = (key, val) => LABEL_MAPS[key]?.[val] || val || null;

  const handleEdit = (stepNumber) => {
    dispatch(setStep(stepNumber));
  };

  const handleSaveDraft = async () => {
    try {
      await dispatch(saveProfile(profile)).unwrap();
      toast.success('Draft Saved', 'Your financial profile progress has been saved.');
    } catch (err) {
      toast.error('Save Failed', 'Unable to save profile draft.');
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await dispatch(completeOnboarding()).unwrap();
      toast.success('Financial Profile Saved', 'Your MoneyOS personalized dashboard is now configured.');
      navigate('/', { replace: true });
    } catch (err) {
      const errMsg =
        typeof err === 'string'
          ? err
          : 'Failed to complete profile setup. Please review your connection and try again.';
      setSubmitError(errMsg);
      toast.error("Couldn't Save Profile", errMsg);
      setSubmitting(false);
    }
  };

  // Build review sections, omitting empty/unanswered values
  const professionalItems = [
    { label: 'Career Stage', value: profile.professionalStageCustom || fmt('professionalStage', profile.professionalStage) },
    { label: 'Employment Status', value: profile.employmentTypeCustom || fmt('employmentType', profile.employmentType) },
    { label: 'Industry', value: profile.industry || null },
    { label: 'Income Pattern', value: profile.incomePatternCustom || fmt('incomePattern', profile.incomePattern) },
    { label: 'Pay Schedule', value: fmt('paySchedule', profile.paySchedule) },
    { label: 'Pay Schedule Notes', value: profile.payScheduleNotes || null },
    {
      label: 'Monthly Take-Home',
      value: profile.estimatedMonthlyIncome ? Number(profile.estimatedMonthlyIncome) : null,
      type: 'currency',
    },
    {
      label: 'Typical Income Range',
      value:
        profile.incomeRangeMin && profile.incomeRangeMax
          ? `₹${Number(profile.incomeRangeMin).toLocaleString('en-IN')} – ₹${Number(profile.incomeRangeMax).toLocaleString('en-IN')}`
          : null,
    },
  ];

  const livingItems = [
    { label: 'Living Arrangement', value: profile.livingArrangementCustom || fmt('livingArrangement', profile.livingArrangement) },
    {
      label: 'Monthly Rent / EMI Commitment',
      value: profile.monthlyRentOrEmi ? Number(profile.monthlyRentOrEmi) : null,
      type: 'currency',
    },
    {
      label: 'Location',
      value: [profile.locationCity, profile.locationState, profile.locationCountry].filter(Boolean).join(', ') || null,
    },
    {
      label: 'Household Dependents',
      value:
        profile.householdDependents?.length > 0
          ? profile.householdDependents.map((d) =>
              d === 'MYSELF'
                ? 'Only Myself'
                : d === 'SPOUSE'
                ? 'Spouse'
                : d === 'CHILDREN'
                ? 'Children'
                : d === 'PARENTS'
                ? 'Parents'
                : profile.householdDependentsCustom || 'Other Dependents'
            )
          : null,
      type: 'chips',
    },
    {
      label: 'Estimated Groceries & Dining',
      value: profile.lifestyleSpending?.groceries ? Number(profile.lifestyleSpending.groceries) : null,
      type: 'currency',
    },
    {
      label: 'Estimated Transportation',
      value: profile.lifestyleSpending?.transport ? Number(profile.lifestyleSpending.transport) : null,
      type: 'currency',
    },
    {
      label: 'Estimated Utilities',
      value: profile.lifestyleSpending?.utilities ? Number(profile.lifestyleSpending.utilities) : null,
      type: 'currency',
    },
  ];

  const responsibilitiesItems = [
    {
      label: 'Financial Obligations',
      value:
        profile.responsibilities?.length > 0
          ? profile.responsibilities.map((r) =>
              r === 'NO_OBLIGATIONS'
                ? 'No Current Debt Obligations'
                : r.replace(/_/g, ' ')
            )
          : null,
      type: 'chips',
    },
    {
      label: 'Custom Obligations',
      value:
        profile.customObligations?.length > 0
          ? profile.customObligations.map(
              (co) => `${co.title}${co.monthlyAmount ? ` (₹${Number(co.monthlyAmount).toLocaleString('en-IN')}/mo)` : ''}`
            )
          : null,
      type: 'chips',
    },
    {
      label: 'Total Monthly Debt Payments',
      value: profile.totalMonthlyEmi ? Number(profile.totalMonthlyEmi) : null,
      type: 'currency',
    },
    {
      label: 'Emergency Fund Runway',
      value: fmt('emergencySavingsStatus', profile.emergencySavingsStatus),
    },
    {
      label: 'Existing Financial Accounts',
      value:
        profile.financialArrangements?.length > 0
          ? profile.financialArrangements.map((a) => a.replace(/_/g, ' '))
          : null,
      type: 'chips',
    },
  ];

  const goalsItems = [
    {
      label: 'Active Financial Goals',
      value:
        profile.goalsList?.length > 0
          ? profile.goalsList.map(
              (g) =>
                `${g.title}${
                  g.targetAmount ? ` (₹${Number(g.targetAmount).toLocaleString('en-IN')})` : ''
                }${g.targetDate ? ` • By ${g.targetDate}` : ''}`
            )
          : profile.goals?.length > 0
          ? profile.goals.map((g) => g.replace(/_/g, ' '))
          : null,
      type: 'chips',
    },
  ];

  const preferencesItems = [
    { label: 'Budgeting Style', value: fmt('budgetingStyle', profile.budgetingStyle) },
    { label: 'Preferred Currency', value: profile.preferredCurrency || 'INR' },
    { label: 'Review Cadence', value: fmt('preferredReviewFrequency', profile.preferredReviewFrequency) },
    { label: 'Comfort Level', value: fmt('financialComfort', profile.financialComfort) },
    {
      label: 'Active Tracking Features',
      value:
        profile.trackingPreferences?.length > 0
          ? profile.trackingPreferences.map((t) => t.replace(/TRACK_/, '').replace(/_/g, ' '))
          : null,
      type: 'chips',
    },
    { label: 'Notifications & Alerts', value: profile.notificationsEnabled },
    { label: 'AI Personalization', value: profile.personalizationEnabled },
    { label: 'Special Instructions / Notes', value: profile.customPreferencesNotes || null },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OnboardingStepHeader
        stepNumber={6}
        totalSteps={6}
        category="Review & Complete"
        title="Review your financial profile"
        subtitle="Verify the details below. You can jump directly to any section to make edits before completing setup."
      />

      {/* Review Sections */}
      <div className="space-y-4">
        <OnboardingReviewSection
          title="1. Professional Profile"
          stepNumber={1}
          onEdit={handleEdit}
          items={professionalItems}
          currency={profile.preferredCurrency || 'INR'}
        />

        <OnboardingReviewSection
          title="2. Living & Lifestyle"
          stepNumber={2}
          onEdit={handleEdit}
          items={livingItems}
          currency={profile.preferredCurrency || 'INR'}
        />

        <OnboardingReviewSection
          title="3. Financial Responsibilities"
          stepNumber={3}
          onEdit={handleEdit}
          items={responsibilitiesItems}
          currency={profile.preferredCurrency || 'INR'}
        />

        <OnboardingReviewSection
          title="4. Goals & Aspirations"
          stepNumber={4}
          onEdit={handleEdit}
          items={goalsItems}
          currency={profile.preferredCurrency || 'INR'}
        />

        <OnboardingReviewSection
          title="5. Preferences & Settings"
          stepNumber={5}
          onEdit={handleEdit}
          items={preferencesItems}
          currency={profile.preferredCurrency || 'INR'}
        />
      </div>

      {/* Personalization explanation note */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#C3ABFA]/15 flex items-center justify-center flex-shrink-0 text-[#C3ABFA] text-base">
          ✨
        </div>
        <div className="text-xs text-[#A3A3A3] leading-relaxed">
          <strong className="text-[#FAFAFA] font-medium block mb-0.5">
            Personalizing your MoneyOS experience
          </strong>
          Your financial health score, budget allocations, and cash runway projections will automatically calibrate to these parameters. You can modify these settings anytime in your Profile & Settings.
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-[#70D6A3]/10 border border-[#70D6A3]/30 rounded-xl text-[#70D6A3] text-xs font-medium flex items-center gap-2">
          <span>✓</span>
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {(submitError || error) && (
        <InlineValidationMessage message={submitError || error} />
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#292929]">
        <button
          type="button"
          onClick={() => dispatch(setStep(5))}
          disabled={loading || submitting}
          className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
        >
          ← Back to Preferences
        </button>

        <div className="w-full sm:w-auto flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={savingDraft || loading || submitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#292929] hover:border-[#3D3D3D] text-xs font-medium text-[#D5C5FF] hover:bg-[#1E1E1E] transition-all disabled:opacity-50"
          >
            {savingDraft ? 'Saving Draft…' : 'Save Draft'}
          </button>

          <Button
            onClick={handleComplete}
            disabled={submitting || loading}
            loading={submitting || loading}
            variant="primary"
            size="md"
            className="w-full sm:w-auto min-w-[170px]"
          >
            {completed ? 'Save Changes' : '🎉 Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
