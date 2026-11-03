// src/features/onboarding/FinancialPreferencesStep.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, updateProfile, syncStepToBackend, saveProfile } from './onboardingSlice';
import OnboardingStepHeader from './components/OnboardingStepHeader';
import SelectableCard from './components/SelectableCard';
import FormSection from './components/FormSection';
import InlineValidationMessage from './components/InlineValidationMessage';
import OnboardingNavigation from './components/OnboardingNavigation';
import {
  Waves,
  BarChart3,
  Target,
  Scale,
  CircleHelp,
  Sprout,
  TrendingUp,
  Award,
  Compass,
  Banknote,
  ArrowLeftRight,
  Wallet,
  CalendarDays,
  Bell,
} from '../../components/ui/Icons';

const BUDGETING_STYLES = [
  {
    value: 'FLEXIBLE',
    title: 'Flexible Budget',
    icon: <Waves className="w-5 h-5 text-[#86B8F5]" />,
    description: 'Loose targets with breathing room; prioritize saving while spending comfortably.',
  },
  {
    value: 'CATEGORY_BASED',
    title: 'Category-Based Budget',
    icon: <BarChart3 className="w-5 h-5 text-[#C3ABFA]" />,
    description: 'Target allocations across categories (e.g. 50% Needs, 30% Wants, 20% Savings).',
  },
  {
    value: 'ZERO_BASED',
    title: 'Zero-Based Budget',
    icon: <Target className="w-5 h-5 text-[#F07891]" />,
    description: 'Every rupee gets assigned a clear job before the month starts.',
  },
  {
    value: 'SIMPLE',
    title: 'Simple Income vs. Expenses',
    icon: <Scale className="w-5 h-5 text-[#70D6A3]" />,
    description: 'Keep things effortless: ensure total outflow remains strictly below total inflow.',
  },
  {
    value: 'NOT_SURE_YET',
    title: 'Not Sure Yet',
    icon: <CircleHelp className="w-5 h-5 text-[#737373]" />,
    description: 'Let MoneyOS recommend a suitable framework after observing your spending habits.',
  },
];

const TRACKING_FEATURES = [
  { value: 'TRACK_INCOME', label: 'Track Income Streams', icon: <Banknote className="w-4 h-4 text-[#70D6A3]" /> },
  { value: 'TRACK_EXPENSES', label: 'Track Day-to-Day Expenses', icon: <ArrowLeftRight className="w-4 h-4 text-[#F07891]" /> },
  { value: 'TRACK_TRANSFERS', label: 'Track Account Transfers', icon: <ArrowLeftRight className="w-4 h-4 text-[#86B8F5]" /> },
  { value: 'TRACK_POCKETS', label: 'Track Money Pockets', icon: <Wallet className="w-4 h-4 text-[#C3ABFA]" /> },
  { value: 'TRACK_GOALS', label: 'Track Savings Goals', icon: <Target className="w-4 h-4 text-[#D5C5FF]" /> },
  { value: 'REVIEW_MONTHLY', label: 'Review Monthly Spending', icon: <CalendarDays className="w-4 h-4 text-[#E9BC68]" /> },
  { value: 'MONITOR_BILLS', label: 'Monitor Recurring Payments', icon: <Bell className="w-4 h-4 text-[#F07891]" /> },
];

const COMFORT_LEVELS = [
  { value: 'BEGINNER', title: 'Beginner', icon: <Sprout className="w-5 h-5 text-[#70D6A3]" />, description: 'Keep concepts straightforward and guidance clear' },
  { value: 'COMFORTABLE', title: 'Comfortable', icon: <TrendingUp className="w-5 h-5 text-[#86B8F5]" />, description: 'Experienced with tracking, budgeting, and recurring bills' },
  { value: 'EXPERIENCED', title: 'Experienced', icon: <Award className="w-5 h-5 text-[#E9BC68]" />, description: 'Active investor managing multi-stream cash flow' },
  { value: 'GUIDED', title: 'Prefer Guided Guidance', icon: <Compass className="w-5 h-5 text-[#C3ABFA]" />, description: 'Walk me through optimal steps and recommendations' },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'AED', symbol: 'AED', label: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
];

const REVIEW_FREQUENCIES = [
  { value: 'DAILY', label: 'Daily Pulse', desc: 'Brief check-in on transactions' },
  { value: 'WEEKLY', label: 'Weekly Summary', desc: 'Weekend review of progress' },
  { value: 'MONTHLY', label: 'Monthly Deep Dive', desc: 'Comprehensive month-end review' },
];

export default function FinancialPreferencesStep() {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.onboarding.profile);
  const savingDraft = useSelector((s) => s.onboarding.savingDraft);

  const [budgeting, setBudgeting] = useState(profile.budgetingStyle || '');
  const [currency, setCurrency] = useState(profile.preferredCurrency || 'INR');
  const [reviewFreq, setReviewFreq] = useState(profile.preferredReviewFrequency || 'MONTHLY');
  const [comfort, setComfort] = useState(profile.financialComfort || 'COMFORTABLE');

  // Feature tracking
  const [tracking, setTracking] = useState(
    profile.trackingPreferences || ['TRACK_INCOME', 'TRACK_EXPENSES', 'TRACK_GOALS', 'REVIEW_MONTHLY']
  );

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile.notificationsEnabled !== undefined ? profile.notificationsEnabled : true
  );
  const [notifications, setNotifications] = useState(
    profile.notificationPreferences || {
      budgetReminders: true,
      goalMilestones: true,
      upcomingBills: true,
      weeklySummaries: true,
      monthlyReviews: true,
    }
  );

  // Personalization
  const [personalization, setPersonalization] = useState(
    profile.personalizationEnabled !== undefined ? profile.personalizationEnabled : true
  );

  // Custom text note
  const [notes, setNotes] = useState(profile.customPreferencesNotes || '');
  const [errors, setErrors] = useState({});

  const toggleTracking = (val) => {
    setTracking((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  const toggleNotificationItem = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const validate = () => {
    const errs = {};
    if (!budgeting) {
      errs.budgeting = 'Please select your preferred budgeting style.';
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
        budgetingStyle: budgeting,
        preferredCurrency: currency,
        preferredReviewFrequency: reviewFreq,
        financialComfort: comfort,
        trackingPreferences: tracking,
        notificationsEnabled,
        notificationPreferences: notifications,
        personalizationEnabled: personalization,
        customPreferencesNotes: notes.slice(0, 300),
      })
    );

    dispatch(syncStepToBackend(6));
    dispatch(setStep(6));
  };

  const handleSaveDraft = () => {
    dispatch(
      saveProfile({
        ...profile,
        budgetingStyle: budgeting,
        preferredCurrency: currency,
        preferredReviewFrequency: reviewFreq,
        notificationsEnabled,
        personalizationEnabled: personalization,
      })
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OnboardingStepHeader
        stepNumber={5}
        totalSteps={6}
        category="Preferences & Settings"
        title="Customize how MoneyOS works for you"
        subtitle="Tailor your budgeting philosophy, notifications, active features, and reporting cadence."
      />

      {/* Budgeting Style */}
      <FormSection
        title="Budgeting Philosophy"
        description="Choose the methodology that aligns with your lifestyle and financial discipline."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {BUDGETING_STYLES.map((b) => (
            <SelectableCard
              key={b.value}
              selected={budgeting === b.value}
              onClick={() => {
                setBudgeting(b.value);
                if (errors.budgeting) setErrors((e) => ({ ...e, budgeting: undefined }));
              }}
              title={b.title}
              icon={b.icon}
              description={b.description}
            />
          ))}
        </div>

        {errors.budgeting && <InlineValidationMessage message={errors.budgeting} className="mt-2" />}
      </FormSection>

      {/* Tracking Preferences */}
      <FormSection
        title="MoneyOS Features to Activate"
        description="Select the capabilities you want highlighted on your main dashboard."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {TRACKING_FEATURES.map((feat) => {
            const isSelected = tracking.includes(feat.value);
            return (
              <button
                key={feat.value}
                type="button"
                onClick={() => toggleTracking(feat.value)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all text-left ${
                  isSelected
                    ? 'border-[#C3ABFA] bg-[#C3ABFA]/15 text-[#FAFAFA]'
                    : 'border-[#292929] bg-[#181818] text-[#888888] hover:text-[#FAFAFA] hover:border-[#3D3D3D]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-[#C3ABFA] border-[#C3ABFA]' : 'border-[#444444] bg-[#141414]'
                  }`}
                >
                  {isSelected && (
                    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 stroke-[#101010]" strokeWidth={2.2}>
                      <path d="M2 5l2.2 2.2L8 2.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span>{feat.icon}</span>
                <span className="truncate">{feat.label}</span>
              </button>
            );
          })}
        </div>
      </FormSection>

      {/* Currency & Review Cadence (Two Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#242424]">
        {/* Preferred Currency */}
        <div>
          <label className="text-xs font-medium text-[#E5E5E5] block mb-2 tracking-wide">
            Preferred Currency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-mono transition-all ${
                  currency === c.code
                    ? 'border-[#C3ABFA] bg-[#C3ABFA]/15 text-[#FAFAFA] font-bold shadow-[0_0_12px_rgba(195,171,250,0.2)]'
                    : 'border-[#292929] bg-[#181818] text-[#888888] hover:text-[#FAFAFA] hover:border-[#3D3D3D]'
                }`}
              >
                <span>{c.symbol}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Review Frequency */}
        <div>
          <label className="text-xs font-medium text-[#E5E5E5] block mb-2 tracking-wide">
            Financial Review Cadence
          </label>
          <div className="grid grid-cols-3 gap-2">
            {REVIEW_FREQUENCIES.map((rf) => (
              <button
                key={rf.value}
                type="button"
                onClick={() => setReviewFreq(rf.value)}
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                  reviewFreq === rf.value
                    ? 'border-[#C3ABFA] bg-[#C3ABFA]/15 text-[#FAFAFA]'
                    : 'border-[#292929] bg-[#181818] text-[#888888] hover:text-[#FAFAFA] hover:border-[#3D3D3D]'
                }`}
              >
                <div className="text-xs font-semibold">{rf.label}</div>
                <div className="text-[10px] text-[#737373] mt-0.5">{rf.desc.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Comfort Level */}
      <FormSection
        title="Financial Comfort Level"
        description="Helps us tune educational tooltips, financial jargon, and guided walkthroughs."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {COMFORT_LEVELS.map((cl) => (
            <SelectableCard
              key={cl.value}
              selected={comfort === cl.value}
              onClick={() => setComfort(cl.value)}
              title={cl.title}
              icon={cl.icon}
              description={cl.description}
            />
          ))}
        </div>
      </FormSection>

      {/* Notifications & Insights Toggles */}
      <FormSection
        title="Notifications & Insights"
        description="Choose what alerts you want to receive. We never send spam."
      >
        <div className="space-y-3">
          {/* Master Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#262626] rounded-xl">
            <div>
              <div className="text-xs font-medium text-[#FAFAFA] flex items-center gap-2">
                <span>🔔</span> Enable In-App Notifications & Alerts
              </div>
              <div className="text-[11px] text-[#737373] mt-0.5">
                Turn on alerts for budgets, upcoming bills, and milestones.
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C3ABFA] ${
                notificationsEnabled ? 'bg-[#C3ABFA]' : 'bg-[#262626]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Granular notification items */}
          {notificationsEnabled && (
            <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-[#C3ABFA]/30 ml-2 animate-in fade-in duration-150">
              {[
                { key: 'budgetReminders', label: 'Budget spending limit warnings', desc: 'When categories cross 80% and 100%' },
                { key: 'goalMilestones', label: 'Goal progress milestones', desc: 'Celebrations at 25%, 50%, and completion' },
                { key: 'upcomingBills', label: 'Upcoming recurring bill reminders', desc: 'Alerts 3 days before payment due dates' },
                { key: 'weeklySummaries', label: 'Weekly cash flow summaries', desc: 'Brief highlight of weekend and week spending' },
                { key: 'monthlyReviews', label: 'Monthly financial retrospective', desc: 'End-of-month breakdown and budget calibration' },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818] border border-[#242424]"
                >
                  <div className="pr-3">
                    <div className="text-xs font-medium text-[#E5E5E5]">{label}</div>
                    <div className="text-[10px] text-[#737373]">{desc}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications[key]}
                    onClick={() => toggleNotificationItem(key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                      notifications[key] ? 'bg-[#C3ABFA]' : 'bg-[#262626]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white transform transition-transform ${
                        notifications[key] ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* AI Personalization Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#262626] rounded-xl">
            <div>
              <div className="text-xs font-medium text-[#FAFAFA] flex items-center gap-2">
                <span>✨</span> Personalized AI Financial Recommendations
              </div>
              <div className="text-[11px] text-[#737373] mt-0.5">
                Allows MoneyOS to analyze spending trends and offer proactive savings suggestions.
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={personalization}
              onClick={() => setPersonalization(!personalization)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C3ABFA] ${
                personalization ? 'bg-[#C3ABFA]' : 'bg-[#262626]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                  personalization ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </FormSection>

      {/* Custom Preferences Text Field */}
      <FormSection
        title="Anything else you'd like MoneyOS to help you with?"
        description="Share any specific financial targets, constraints, or preferences for your setup."
      >
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 300))}
            placeholder="e.g. Planning a move abroad next year, want to focus on high-yield debt elimination first…"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#FAFAFA] placeholder-[#555555] focus:outline-none focus:border-[#C3ABFA] transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-[#737373]">
            <span>🔒 Please do not enter bank account numbers, passwords, or personal credentials.</span>
            <span>{notes.length}/300</span>
          </div>
        </div>
      </FormSection>

      {/* Navigation */}
      <OnboardingNavigation
        onBack={() => dispatch(setStep(4))}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        saveDraftLoading={savingDraft}
        nextLabel="Review & Complete →"
      />
    </div>
  );
}
