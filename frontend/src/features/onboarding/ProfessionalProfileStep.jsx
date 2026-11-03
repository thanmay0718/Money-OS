// src/features/onboarding/ProfessionalProfileStep.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, updateProfile, syncStepToBackend, saveProfile } from './onboardingSlice';
import OnboardingStepHeader from './components/OnboardingStepHeader';
import SelectableCard from './components/SelectableCard';
import SearchableSelect from './components/SearchableSelect';
import CurrencyInput from './components/CurrencyInput';
import CustomOptionInput from './components/CustomOptionInput';
import FormSection from './components/FormSection';
import InlineValidationMessage from './components/InlineValidationMessage';
import OnboardingNavigation from './components/OnboardingNavigation';
import { GraduationCap, Rocket, Briefcase, Award, Hammer, Palmtree, Sparkles, CalendarDays, BarChart3, Shuffle, Banknote, Hourglass } from '../../components/ui/Icons';

const CAREER_STAGES = [
  { value: 'STUDENT', title: 'Student', icon: <GraduationCap className="w-5 h-5 text-[#C3ABFA]" />, description: 'Pursuing studies, preparing for the future' },
  { value: 'EARLY_CAREER', title: 'Early Career', icon: <Rocket className="w-5 h-5 text-[#86B8F5]" />, description: '0–3 years of professional experience' },
  { value: 'MID_CAREER', title: 'Mid Career', icon: <Briefcase className="w-5 h-5 text-[#70D6A3]" />, description: '4–10 years of growing expertise & income' },
  { value: 'SENIOR', title: 'Senior Professional', icon: <Award className="w-5 h-5 text-[#E9BC68]" />, description: '10+ years of leadership or mastery' },
  { value: 'ENTREPRENEUR', title: 'Entrepreneur', icon: <Hammer className="w-5 h-5 text-[#C3ABFA]" />, description: 'Running or scaling your own business' },
  { value: 'RETIRED', title: 'Retired', icon: <Palmtree className="w-5 h-5 text-[#70D6A3]" />, description: 'Post-career life and wealth preservation' },
  { value: 'OTHER', title: 'Other', icon: <Sparkles className="w-5 h-5 text-[#D5C5FF]" />, description: 'Alternative or evolving career path' },
];

const EMPLOYMENT_OPTIONS = [
  { value: 'SALARIED', label: 'Salaried Employee', description: 'Full-time or regular employer payroll' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed / Freelancer', description: 'Independent consultant or freelancer' },
  { value: 'BUSINESS_OWNER', label: 'Business Owner', description: 'Founder, director, or partner' },
  { value: 'STUDENT', label: 'Student', description: 'Enrolled in academic institution' },
  { value: 'UNEMPLOYED', label: 'Unemployed / Job Seeker', description: 'Actively searching or in transition' },
  { value: 'RETIRED', label: 'Retired', description: 'Not currently actively employed' },
  { value: 'OTHER', label: 'Other', description: 'Custom employment status' },
];

const INDUSTRIES = [
  { value: 'Technology & Software', label: 'Technology & Software' },
  { value: 'Banking & Financial Services', label: 'Banking & Financial Services' },
  { value: 'Healthcare & Pharmaceuticals', label: 'Healthcare & Pharmaceuticals' },
  { value: 'Education & Academia', label: 'Education & Academia' },
  { value: 'Consulting & Professional Services', label: 'Consulting & Professional Services' },
  { value: 'Design, Media & Entertainment', label: 'Design, Media & Entertainment' },
  { value: 'E-commerce & Retail', label: 'E-commerce & Retail' },
  { value: 'Manufacturing & Engineering', label: 'Manufacturing & Engineering' },
  { value: 'Real Estate & Construction', label: 'Real Estate & Construction' },
  { value: 'Government & Public Sector', label: 'Government & Public Sector' },
  { value: 'Non-Profit & Social Enterprise', label: 'Non-Profit & Social Enterprise' },
  { value: 'Hospitality & Tourism', label: 'Hospitality & Tourism' },
];

const INCOME_PATTERNS = [
  { value: 'FIXED_MONTHLY', title: 'Fixed Monthly', icon: <CalendarDays className="w-5 h-5 text-[#70D6A3]" />, description: 'Predictable income arriving on a fixed date' },
  { value: 'VARIABLE_MONTHLY', title: 'Variable Monthly', icon: <BarChart3 className="w-5 h-5 text-[#86B8F5]" />, description: 'Base pay plus bonus, commission, or tips' },
  { value: 'IRREGULAR', title: 'Irregular / Project-Based', icon: <Shuffle className="w-5 h-5 text-[#E9BC68]" />, description: 'Milestone-based, seasonal, or gig income' },
  { value: 'PASSIVE', title: 'Passive Income', icon: <Banknote className="w-5 h-5 text-[#C3ABFA]" />, description: 'Dividends, investments, or rental yield' },
  { value: 'NO_CURRENT_INCOME', title: 'No Current Income', icon: <Hourglass className="w-5 h-5 text-[#737373]" />, description: 'Currently studying, taking time off, or transitioning' },
  { value: 'OTHER', title: 'Other Pattern', icon: <Sparkles className="w-5 h-5 text-[#D5C5FF]" />, description: 'Alternative income stream' },
];

const PAY_SCHEDULES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'TWICE_A_MONTH', label: 'Twice a Month' },
  { value: 'EVERY_TWO_WEEKS', label: 'Every Two Weeks' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'IRREGULAR', label: 'Irregular' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
];

export default function ProfessionalProfileStep() {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.onboarding.profile);
  const savingDraft = useSelector((s) => s.onboarding.savingDraft);

  const [stage, setStage] = useState(profile.professionalStage || '');
  const [stageCustom, setStageCustom] = useState(profile.professionalStageCustom || '');
  const [employment, setEmployment] = useState(profile.employmentType || '');
  const [employmentCustom, setEmploymentCustom] = useState(profile.employmentTypeCustom || '');
  const [industry, setIndustry] = useState(profile.industry || '');
  const [incomePattern, setIncomePattern] = useState(profile.incomePattern || '');
  const [incomePatternCustom, setIncomePatternCustom] = useState(profile.incomePatternCustom || '');
  const [paySchedule, setPaySchedule] = useState(profile.paySchedule || '');
  const [payScheduleNotes, setPayScheduleNotes] = useState(profile.payScheduleNotes || '');
  const [monthlyIncome, setMonthlyIncome] = useState(profile.estimatedMonthlyIncome || '');
  const [incomeRangeMin, setIncomeRangeMin] = useState(profile.incomeRangeMin || '');
  const [incomeRangeMax, setIncomeRangeMax] = useState(profile.incomeRangeMax || '');
  const [isRangeMode, setIsRangeMode] = useState(Boolean(profile.incomeRangeMin || profile.incomeRangeMax));
  const [errors, setErrors] = useState({});

  // Dynamic adaptation: if student is chosen, streamline employment
  const handleStageSelect = (val) => {
    setStage(val);
    if (errors.stage) setErrors((prev) => ({ ...prev, stage: undefined }));

    if (val === 'STUDENT' && !employment) {
      setEmployment('STUDENT');
    } else if (val === 'RETIRED' && !employment) {
      setEmployment('RETIRED');
    } else if (val === 'ENTREPRENEUR' && !employment) {
      setEmployment('BUSINESS_OWNER');
    }
  };

  const validate = () => {
    const errs = {};
    if (!stage) {
      errs.stage = 'Please select your career stage.';
    }
    if (stage === 'OTHER' && !stageCustom.trim()) {
      errs.stageCustom = 'Please specify your career stage.';
    }
    if (!incomePattern) {
      errs.incomePattern = 'Please select your income pattern.';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    dispatch(
      updateProfile({
        professionalStage: stage,
        professionalStageCustom: stage === 'OTHER' ? stageCustom : '',
        employmentType: employment,
        employmentTypeCustom: employment === 'OTHER' ? employmentCustom : '',
        industry,
        incomePattern,
        incomePatternCustom: incomePattern === 'OTHER' ? incomePatternCustom : '',
        paySchedule: incomePattern !== 'NO_CURRENT_INCOME' ? paySchedule : 'NOT_APPLICABLE',
        payScheduleNotes: paySchedule === 'IRREGULAR' ? payScheduleNotes : '',
        estimatedMonthlyIncome: isRangeMode ? incomeRangeMin || monthlyIncome : monthlyIncome,
        incomeRangeMin: isRangeMode ? incomeRangeMin : '',
        incomeRangeMax: isRangeMode ? incomeRangeMax : '',
      })
    );

    dispatch(syncStepToBackend(2));
    dispatch(setStep(2));
  };

  const handleSaveDraft = () => {
    dispatch(
      saveProfile({
        ...profile,
        professionalStage: stage,
        employmentType: employment,
        industry,
        incomePattern,
        estimatedMonthlyIncome: isRangeMode ? incomeRangeMin || monthlyIncome : monthlyIncome,
      })
    );
  };

  const isVariableIncome = incomePattern === 'VARIABLE_MONTHLY' || incomePattern === 'IRREGULAR';
  const showPaySchedule = incomePattern && incomePattern !== 'NO_CURRENT_INCOME';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OnboardingStepHeader
        stepNumber={1}
        totalSteps={6}
        category="Professional Life"
        title="Tell us about your professional journey"
        subtitle="This allows MoneyOS to customize cash flow forecasts, emergency fund sizing, and milestone planning."
      />

      {/* Career Stage */}
      <FormSection
        title="Career Stage"
        description="Choose the phase that best describes where you currently stand."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CAREER_STAGES.map((s) => (
            <SelectableCard
              key={s.value}
              selected={stage === s.value}
              onClick={() => handleStageSelect(s.value)}
              title={s.title}
              icon={s.icon}
              description={s.description}
            />
          ))}
        </div>

        {stage === 'OTHER' && (
          <CustomOptionInput
            label="Custom Career Stage"
            value={stageCustom}
            onChange={(val) => {
              setStageCustom(val);
              if (errors.stageCustom) setErrors((e) => ({ ...e, stageCustom: undefined }));
            }}
            placeholder="e.g. Sabbatical, Career Switcher, Freelance Consultant…"
            error={errors.stageCustom}
          />
        )}

        {errors.stage && <InlineValidationMessage message={errors.stage} className="mt-2" />}
      </FormSection>

      {/* Employment Type & Industry (Two columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#242424]">
        <div>
          <SearchableSelect
            label="Employment Type"
            placeholder="Select employment type…"
            options={EMPLOYMENT_OPTIONS}
            value={employment}
            onChange={(val) => {
              setEmployment(val);
              if (errors.employment) setErrors((e) => ({ ...e, employment: undefined }));
            }}
            helperText="Optional"
          />
          {employment === 'OTHER' && (
            <CustomOptionInput
              label="Custom Employment Status"
              value={employmentCustom}
              onChange={setEmploymentCustom}
              placeholder="e.g. Co-op, Fellowship, Seasonal…"
            />
          )}
        </div>

        <div>
          <SearchableSelect
            label="Industry / Field"
            placeholder="Select industry…"
            options={INDUSTRIES}
            value={industry}
            onChange={setIndustry}
            allowCustom
            searchPlaceholder="Search or type custom industry…"
            helperText="Optional"
          />
        </div>
      </div>

      {/* Income Pattern */}
      <FormSection
        title="Income Pattern"
        description="How does your income typically arrive?"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INCOME_PATTERNS.map((p) => (
            <SelectableCard
              key={p.value}
              selected={incomePattern === p.value}
              onClick={() => {
                setIncomePattern(p.value);
                if (errors.incomePattern) setErrors((e) => ({ ...e, incomePattern: undefined }));
              }}
              title={p.title}
              icon={p.icon}
              description={p.description}
            />
          ))}
        </div>

        {incomePattern === 'OTHER' && (
          <CustomOptionInput
            label="Custom Income Pattern"
            value={incomePatternCustom}
            onChange={setIncomePatternCustom}
            placeholder="Describe your income structure…"
          />
        )}

        {errors.incomePattern && <InlineValidationMessage message={errors.incomePattern} className="mt-2" />}
      </FormSection>

      {/* Pay Schedule (Conditional) */}
      {showPaySchedule && (
        <div className="p-4 rounded-xl bg-[#141414] border border-[#242424] space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D5C5FF]">
                Pay Schedule
              </h4>
              <p className="text-xs text-[#737373]">
                Helps calculate monthly cash flow pacing and budget resets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PAY_SCHEDULES.map((ps) => (
              <button
                key={ps.value}
                type="button"
                onClick={() => setPaySchedule(ps.value)}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                  paySchedule === ps.value
                    ? 'border-[#C3ABFA] bg-[#C3ABFA]/15 text-[#FAFAFA]'
                    : 'border-[#292929] bg-[#181818] text-[#888888] hover:text-[#FAFAFA] hover:border-[#3D3D3D]'
                }`}
              >
                {ps.label}
              </button>
            ))}
          </div>

          {paySchedule === 'IRREGULAR' && (
            <input
              type="text"
              value={payScheduleNotes}
              onChange={(e) => setPayScheduleNotes(e.target.value)}
              placeholder="e.g. Paid per quarterly deliverable or milestone…"
              className="w-full px-3 py-2 text-xs bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-[#FAFAFA] placeholder-[#666666] focus:outline-none focus:border-[#C3ABFA]"
            />
          )}
        </div>
      )}

      {/* Income Details */}
      <FormSection
        title="Estimated Take-Home Income"
        description="Your approximate monthly net income after taxes. You can skip this or provide a range."
      >
        <div className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#242424] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A3A3A3]">
              Monthly take-home amount ({profile.preferredCurrency || 'INR'})
            </span>

            {isVariableIncome && (
              <button
                type="button"
                onClick={() => setIsRangeMode(!isRangeMode)}
                className="text-xs text-[#C3ABFA] hover:text-[#D5C5FF] font-medium transition-colors"
              >
                {isRangeMode ? 'Switch to single amount' : 'Enter approximate range (Min – Max)'}
              </button>
            )}
          </div>

          {isRangeMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyInput
                label="Minimum / Base Monthly"
                placeholder="40,000"
                currency={profile.preferredCurrency || 'INR'}
                value={incomeRangeMin}
                onChange={setIncomeRangeMin}
                helperText="Typical lower month"
              />
              <CurrencyInput
                label="Maximum / High Month"
                placeholder="80,000"
                currency={profile.preferredCurrency || 'INR'}
                value={incomeRangeMax}
                onChange={setIncomeRangeMax}
                helperText="Typical peak month"
              />
            </div>
          ) : (
            <div className="max-w-md">
              <CurrencyInput
                label="Approximate Monthly Take-Home"
                placeholder="65,000"
                currency={profile.preferredCurrency || 'INR'}
                value={monthlyIncome}
                onChange={setMonthlyIncome}
                helperText="Optional. Leave blank to skip. Never treated as zero."
              />
            </div>
          )}

          <p className="text-[11px] text-[#666666] leading-relaxed">
            🔒 MoneyOS never shares your income data. Unanswered figures remain unrecorded and are never assumed to be zero.
          </p>
        </div>
      </FormSection>

      {/* Navigation */}
      <OnboardingNavigation
        showBack={false}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        saveDraftLoading={savingDraft}
      />
    </div>
  );
}
