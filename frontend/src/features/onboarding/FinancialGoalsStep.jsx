// src/features/onboarding/FinancialGoalsStep.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, updateProfile, syncStepToBackend, saveProfile } from './onboardingSlice';
import OnboardingStepHeader from './components/OnboardingStepHeader';
import SelectableCard from './components/SelectableCard';
import CurrencyInput from './components/CurrencyInput';
import DatePickerField from './components/DatePickerField';
import FormSection from './components/FormSection';
import InlineValidationMessage from './components/InlineValidationMessage';
import OnboardingNavigation from './components/OnboardingNavigation';
import { ShieldAlert, Car, Home, GraduationCap, Plane, UsersRound, Palmtree, CreditCard, TrendingUp, ShoppingBag, Target } from '../../components/ui/Icons';

const PRESET_GOALS = [
  { value: 'EMERGENCY_FUND', title: 'Emergency Fund', icon: <ShieldAlert className="w-5 h-5 text-[#F07891]" />, description: 'Build a 3–6 month cushion for peace of mind', defaultAmount: '150000' },
  { value: 'BUY_VEHICLE', title: 'Buy a Vehicle', icon: <Car className="w-5 h-5 text-[#E9BC68]" />, description: 'Save for down payment or purchase of a car or bike', defaultAmount: '200000' },
  { value: 'BUY_HOME', title: 'Buy a Home', icon: <Home className="w-5 h-5 text-[#86B8F5]" />, description: 'Down payment fund for your dream residence', defaultAmount: '1000000' },
  { value: 'EDUCATION', title: 'Education & Upskilling', icon: <GraduationCap className="w-5 h-5 text-[#C3ABFA]" />, description: 'Tuition, certifications, or career transition fund', defaultAmount: '250000' },
  { value: 'TRAVEL', title: 'Travel & Exploration', icon: <Plane className="w-5 h-5 text-[#70D6A3]" />, description: 'Dream vacation, sabbatical, or world trip', defaultAmount: '100000' },
  { value: 'FAMILY_SUPPORT', title: 'Family Milestone', icon: <UsersRound className="w-5 h-5 text-[#C3ABFA]" />, description: 'Wedding, children education, or family milestone', defaultAmount: '300000' },
  { value: 'RETIREMENT', title: 'Retirement Independence', icon: <Palmtree className="w-5 h-5 text-[#70D6A3]" />, description: 'Long-term corpus for financial freedom', defaultAmount: '5000000' },
  { value: 'DEBT_REPAYMENT', title: 'Debt Repayment', icon: <CreditCard className="w-5 h-5 text-[#F07891]" />, description: 'Eliminate high-interest credit cards and loans', defaultAmount: '100000' },
  { value: 'INVESTMENT_GROWTH', title: 'Wealth & Investment', icon: <TrendingUp className="w-5 h-5 text-[#E9BC68]" />, description: 'Grow wealth through market compounding', defaultAmount: '500000' },
  { value: 'MAJOR_PURCHASE', title: 'Major Purchase', icon: <ShoppingBag className="w-5 h-5 text-[#86B8F5]" />, description: 'Gadgets, appliances, home renovation', defaultAmount: '75000' },
];

const PRIORITIES = [
  { value: 'ESSENTIAL', label: 'Essential', color: '#F07891' },
  { value: 'HIGH', label: 'High Priority', color: '#E9BC68' },
  { value: 'MEDIUM', label: 'Medium Priority', color: '#C3ABFA' },
  { value: 'LOW', label: 'Low Priority', color: '#888888' },
];

export default function FinancialGoalsStep() {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.onboarding.profile);
  const savingDraft = useSelector((s) => s.onboarding.savingDraft);

  // Selected goal identifiers
  const [selectedGoalKeys, setSelectedGoalKeys] = useState(profile.goals || []);

  // Detailed configured goals list
  const [goalsList, setGoalsList] = useState(() => {
    if (profile.goalsList && profile.goalsList.length > 0) {
      return profile.goalsList;
    }
    // Initialize from selected goals if present
    return (profile.goals || []).map((key) => {
      const preset = PRESET_GOALS.find((p) => p.value === key);
      return {
        id: key,
        key,
        title: preset ? preset.title : key,
        targetAmount: preset ? preset.defaultAmount : '',
        targetDate: '',
        priority: 'HIGH',
        category: key,
        isCustom: false,
      };
    });
  });

  // Custom goal builder
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalAmount, setCustomGoalAmount] = useState('');
  const [customGoalDate, setCustomGoalDate] = useState('');
  const [customGoalPriority, setCustomGoalPriority] = useState('HIGH');
  const [customGoalDescription, setCustomGoalDescription] = useState('');

  const [errors, setErrors] = useState({});

  // Toggle a preset goal
  const handleTogglePresetGoal = (preset) => {
    const isSelected = selectedGoalKeys.includes(preset.value);

    if (isSelected) {
      setSelectedGoalKeys((prev) => prev.filter((k) => k !== preset.value));
      setGoalsList((prev) => prev.filter((g) => g.key !== preset.value));
    } else {
      setSelectedGoalKeys((prev) => [...prev, preset.value]);
      const newGoal = {
        id: preset.value,
        key: preset.value,
        title: preset.title,
        targetAmount: preset.defaultAmount || '',
        targetDate: '',
        priority: 'HIGH',
        category: preset.value,
        isCustom: false,
      };
      setGoalsList((prev) => [...prev, newGoal]);
    }
    if (errors.goals) setErrors((e) => ({ ...e, goals: undefined }));
  };

  // Add custom goal
  const handleAddCustomGoal = () => {
    if (!customGoalName.trim()) return;

    const id = `custom_${Date.now()}`;
    const newGoal = {
      id,
      key: id,
      title: customGoalName.trim(),
      targetAmount: customGoalAmount.trim() || '',
      targetDate: customGoalDate || '',
      priority: customGoalPriority,
      category: 'CUSTOM',
      description: customGoalDescription.trim(),
      isCustom: true,
    };

    setGoalsList((prev) => [...prev, newGoal]);
    setSelectedGoalKeys((prev) => [...prev, id]);

    // Reset modal inputs
    setCustomGoalName('');
    setCustomGoalAmount('');
    setCustomGoalDate('');
    setCustomGoalDescription('');
    setShowCustomModal(false);
    if (errors.goals) setErrors((e) => ({ ...e, goals: undefined }));
  };

  // Update specific goal field
  const updateGoalItem = (id, field, value) => {
    setGoalsList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  // Remove goal
  const handleRemoveGoal = (id, key) => {
    setGoalsList((prev) => prev.filter((g) => g.id !== id));
    setSelectedGoalKeys((prev) => prev.filter((k) => k !== (key || id)));
  };

  // Calculate monthly pacing preview
  const calculatePacing = (targetAmount, targetDate) => {
    if (!targetAmount || !targetDate) return null;
    const amount = Number(targetAmount);
    if (isNaN(amount) || amount <= 0) return null;

    const today = new Date();
    const target = new Date(targetDate + 'T00:00:00');
    if (isNaN(target.getTime()) || target <= today) return null;

    const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    const validMonths = Math.max(1, months);
    const monthlyNeeded = Math.round(amount / validMonths);

    return {
      monthlyNeeded,
      months: validMonths,
    };
  };

  const validate = () => {
    const errs = {};
    if (goalsList.length === 0) {
      errs.goals = 'Please select or create at least one financial goal to get started.';
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
        goals: selectedGoalKeys,
        goalsList: goalsList,
      })
    );

    dispatch(syncStepToBackend(5));
    dispatch(setStep(5));
  };

  const handleSaveDraft = () => {
    dispatch(
      saveProfile({
        ...profile,
        goals: selectedGoalKeys,
        goalsList: goalsList,
      })
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OnboardingStepHeader
        stepNumber={4}
        totalSteps={6}
        category="Goals & Aspirations"
        title="What are you building towards?"
        subtitle="MoneyOS sets up smart pockets and savings trajectories based on your targets. Select all that resonate."
      />

      {/* Preset Goal Cards Grid */}
      <FormSection
        title="Select Your Focus Goals"
        description="Pick one or more goals to begin. You can configure target dates and amounts below."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PRESET_GOALS.map((preset) => {
            const isSelected = selectedGoalKeys.includes(preset.value);
            return (
              <SelectableCard
                key={preset.value}
                type="checkbox"
                selected={isSelected}
                onClick={() => handleTogglePresetGoal(preset)}
                title={preset.title}
                icon={preset.icon}
                description={preset.description}
              />
            );
          })}

          {/* Create Custom Goal Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowCustomModal(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowCustomModal(true);
              }
            }}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#3A3A3A] hover:border-[#C3ABFA] bg-[#141414] hover:bg-[#1C1C1C] text-[#D5C5FF] cursor-pointer transition-all duration-150 text-center min-h-[96px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C3ABFA]"
          >
            <div className="w-8 h-8 rounded-full bg-[#202020] flex items-center justify-center text-sm mb-1.5 text-[#C3ABFA]">
              +
            </div>
            <span className="text-xs font-semibold">Create Custom Goal</span>
            <span className="text-[11px] text-[#737373]">Define your own milestone</span>
          </div>
        </div>

        {errors.goals && <InlineValidationMessage message={errors.goals} className="mt-2" />}
      </FormSection>

      {/* Modal / Card for Custom Goal Creation */}
      {showCustomModal && (
        <div className="p-5 rounded-2xl bg-[#141414] border border-[#C3ABFA]/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
            <h4 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-2">
              <span className="text-base">🎯</span>
              Create Custom Financial Goal
            </h4>
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="p-1 rounded-lg text-[#737373] hover:text-[#FAFAFA] transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1.5">
                Goal Title <span className="text-[#F07891]">*</span>
              </label>
              <input
                type="text"
                value={customGoalName}
                onChange={(e) => setCustomGoalName(e.target.value)}
                placeholder="e.g. Master's Degree in Berlin, Sabbatical Year…"
                className="w-full px-3.5 py-2.5 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-sm text-[#FAFAFA] placeholder-[#555555] focus:outline-none focus:border-[#C3ABFA]"
              />
            </div>

            <div>
              <CurrencyInput
                label="Target Amount"
                placeholder="250,000"
                currency={profile.preferredCurrency || 'INR'}
                value={customGoalAmount}
                onChange={setCustomGoalAmount}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <DatePickerField
                label="Target Date"
                value={customGoalDate}
                onChange={setCustomGoalDate}
                minDate={todayStr}
                placeholder="Choose target date (optional)"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#E5E5E5] block mb-1.5">Priority</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setCustomGoalPriority(p.value)}
                    className={`py-2 text-[11px] font-medium rounded-lg border text-center transition-all ${
                      customGoalPriority === p.value
                        ? 'border-[#C3ABFA] bg-[#C3ABFA]/15 text-[#FAFAFA]'
                        : 'border-[#292929] bg-[#181818] text-[#888888] hover:text-[#FAFAFA]'
                    }`}
                  >
                    {p.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#242424]">
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="px-4 py-2 text-xs font-medium text-[#A3A3A3] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddCustomGoal}
              disabled={!customGoalName.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#C3ABFA] text-[#101010] hover:bg-[#D5C5FF] disabled:opacity-40 transition-colors"
            >
              Add Goal
            </button>
          </div>
        </div>
      )}

      {/* Goal Configuration List */}
      {goalsList.length > 0 && (
        <FormSection
          title="Configure Your Goals"
          description="Adjust amounts, target dates, and priority levels for each of your selected goals."
        >
          <div className="space-y-4">
            {goalsList.map((g) => {
              const pacing = calculatePacing(g.targetAmount, g.targetDate);

              return (
                <div
                  key={g.id}
                  className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#292929] space-y-4 hover:border-[#383838] transition-colors"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{g.isCustom ? '🎯' : '✨'}</span>
                      <span className="text-sm font-semibold text-[#FAFAFA]">{g.title}</span>
                      {g.isCustom && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#202020] text-[#D5C5FF] border border-[#333333]">
                          Custom
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(g.id, g.key)}
                      className="text-[#737373] hover:text-[#F07891] p-1 text-xs transition-colors flex items-center gap-1"
                      title="Remove goal"
                    >
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-current" strokeWidth={2}>
                        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                      </svg>
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CurrencyInput
                      label="Target Amount"
                      placeholder="150,000"
                      currency={profile.preferredCurrency || 'INR'}
                      value={g.targetAmount}
                      onChange={(val) => updateGoalItem(g.id, 'targetAmount', val)}
                    />

                    <DatePickerField
                      label="Target Date"
                      value={g.targetDate}
                      onChange={(val) => updateGoalItem(g.id, 'targetDate', val)}
                      minDate={todayStr}
                      placeholder="No Target Date"
                    />

                    <div>
                      <label className="text-xs font-medium text-[#E5E5E5] block mb-1.5">Priority</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => updateGoalItem(g.id, 'priority', p.value)}
                            className={`py-2 px-1 text-[11px] font-medium rounded-lg border text-center transition-all ${
                              g.priority === p.value
                                ? 'border-[#C3ABFA] bg-[#C3ABFA]/15 text-[#FAFAFA]'
                                : 'border-[#292929] bg-[#181818] text-[#888888] hover:text-[#FAFAFA]'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Pacing preview */}
                  {pacing && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#C3ABFA]/10 border border-[#C3ABFA]/25 text-xs text-[#D5C5FF] animate-in fade-in duration-150">
                      <span className="text-sm">💡</span>
                      <span>
                        Pacing estimate: Saving approx{' '}
                        <strong className="text-white font-mono">
                          ₹{pacing.monthlyNeeded.toLocaleString('en-IN')}/month
                        </strong>{' '}
                        for {pacing.months} months achieves this target on schedule.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FormSection>
      )}

      {/* Navigation */}
      <OnboardingNavigation
        onBack={() => dispatch(setStep(3))}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        saveDraftLoading={savingDraft}
      />
    </div>
  );
}
