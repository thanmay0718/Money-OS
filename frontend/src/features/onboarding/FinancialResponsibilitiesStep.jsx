// src/features/onboarding/FinancialResponsibilitiesStep.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, updateProfile, syncStepToBackend, saveProfile } from './onboardingSlice';
import OnboardingStepHeader from './components/OnboardingStepHeader';
import SelectableCard from './components/SelectableCard';
import CurrencyInput from './components/CurrencyInput';
import FormSection from './components/FormSection';
import InlineValidationMessage from './components/InlineValidationMessage';
import OnboardingNavigation from './components/OnboardingNavigation';
import { Home, GraduationCap, Car, CreditCard, Landmark, UsersRound, Shield, Hospital, CircleCheck, Sprout, Medal, Gem, Lock } from '../../components/ui/Icons';

const OBLIGATION_OPTIONS = [
  { value: 'HOME_LOAN_RENT', title: 'Rent or Home Loan', icon: <Home className="w-5 h-5 text-[#86B8F5]" />, description: 'Monthly housing debt or lease installment' },
  { value: 'EDUCATION_LOAN', title: 'Education Loan', icon: <GraduationCap className="w-5 h-5 text-[#C3ABFA]" />, description: 'Student or higher education loan repayments' },
  { value: 'VEHICLE_LOAN', title: 'Vehicle Loan', icon: <Car className="w-5 h-5 text-[#E9BC68]" />, description: 'Car, bike, or transport financing' },
  { value: 'PERSONAL_LOAN', title: 'Personal Loan', icon: <CreditCard className="w-5 h-5 text-[#F07891]" />, description: 'Unsecured personal loan payments' },
  { value: 'CREDIT_CARD_DEBT', title: 'Credit Card Payments', icon: <Landmark className="w-5 h-5 text-[#C3ABFA]" />, description: 'Revolving card balances or monthly payments' },
  { value: 'FAMILY_SUPPORT', title: 'Family Support', icon: <UsersRound className="w-5 h-5 text-[#70D6A3]" />, description: 'Regular financial remittances to family' },
  { value: 'INSURANCE_PREMIUMS', title: 'Insurance Premiums', icon: <Shield className="w-5 h-5 text-[#86B8F5]" />, description: 'Term life, health, or vehicle coverage' },
  { value: 'MEDICAL_EXPENSES', title: 'Medical Expenses', icon: <Hospital className="w-5 h-5 text-[#F07891]" />, description: 'Ongoing treatments or healthcare support' },
  { value: 'NO_OBLIGATIONS', title: 'No Current Obligations', icon: <CircleCheck className="w-5 h-5 text-[#70D6A3]" />, description: 'I have no active loans, EMIs, or recurring debt commitments' },
];

const EMERGENCY_SAVINGS_OPTIONS = [
  { value: 'NOT_STARTED', title: 'Not Started', icon: <Sprout className="w-5 h-5 text-[#70D6A3]" />, description: 'Starting fresh; ready to build my first cushion' },
  { value: 'LESS_THAN_1_MONTH', title: 'Less than 1 Month', icon: <Medal className="w-5 h-5 text-[#CD7F32]" />, description: 'A modest buffer for minor unexpected bills' },
  { value: '1_TO_3_MONTHS', title: '1 to 3 Months', icon: <Medal className="w-5 h-5 text-[#A3A3A3]" />, description: 'Covers essential expenses for up to 90 days' },
  { value: '3_TO_6_MONTHS', title: '3 to 6 Months', icon: <Medal className="w-5 h-5 text-[#E9BC68]" />, description: 'Standard recommended financial safety runway' },
  { value: 'MORE_THAN_6_MONTHS', title: 'More than 6 Months', icon: <Gem className="w-5 h-5 text-[#C3ABFA]" />, description: 'Substantial multi-month cash cushion' },
  { value: 'PREFER_NOT_TO_SAY', title: 'Prefer Not to Say', icon: <Lock className="w-5 h-5 text-[#737373]" />, description: 'Keep this private for now' },
];

const ARRANGEMENT_TAGS = [
  { value: 'SAVINGS_ACCOUNT', label: 'Savings Accounts' },
  { value: 'MUTUAL_FUNDS', label: 'Mutual Funds & Equity' },
  { value: 'FIXED_DEPOSITS', label: 'Fixed & Recurring Deposits' },
  { value: 'HEALTH_INSURANCE', label: 'Health Insurance' },
  { value: 'LIFE_INSURANCE', label: 'Term Life Insurance' },
  { value: 'RETIREMENT_FUNDS', label: 'EPF / PPF / NPS' },
  { value: 'GOLD_METALS', label: 'Gold & Precious Metals' },
  { value: 'CRYPTO_ALTERNATIVES', label: 'Crypto & Alternatives' },
];

export default function FinancialResponsibilitiesStep() {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.onboarding.profile);
  const savingDraft = useSelector((s) => s.onboarding.savingDraft);

  const [selectedObligations, setSelectedObligations] = useState(profile.responsibilities || []);
  const [totalEmi, setTotalEmi] = useState(profile.totalMonthlyEmi || '');
  const [customObligations, setCustomObligations] = useState(profile.customObligations || []);
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const [emergencySavings, setEmergencySavings] = useState(profile.emergencySavingsStatus || '');
  const [arrangements, setArrangements] = useState(profile.financialArrangements || []);
  const [errors, setErrors] = useState({});

  const toggleObligation = (val) => {
    if (val === 'NO_OBLIGATIONS') {
      setSelectedObligations(['NO_OBLIGATIONS']);
      setCustomObligations([]);
      setTotalEmi('');
    } else {
      setSelectedObligations((prev) => {
        const withoutNone = prev.filter((o) => o !== 'NO_OBLIGATIONS');
        return withoutNone.includes(val)
          ? withoutNone.filter((o) => o !== val)
          : [...withoutNone, val];
      });
    }
    if (errors.obligations) setErrors((e) => ({ ...e, obligations: undefined }));
  };

  const handleAddCustomObligation = () => {
    if (!customName.trim()) return;
    const newObligation = {
      id: Date.now().toString(),
      title: customName.trim(),
      monthlyAmount: customAmount.trim(),
    };
    setCustomObligations((prev) => [...prev, newObligation]);
    setCustomName('');
    setCustomAmount('');
  };

  const handleRemoveCustomObligation = (id) => {
    setCustomObligations((prev) => prev.filter((o) => o.id !== id));
  };

  const toggleArrangement = (val) => {
    setArrangements((prev) =>
      prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]
    );
  };

  const validate = () => {
    const errs = {};
    if (selectedObligations.length === 0 && customObligations.length === 0) {
      errs.obligations = 'Please select at least one obligation (or choose "No Current Obligations").';
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
        responsibilities: selectedObligations,
        totalMonthlyEmi: totalEmi,
        customObligations,
        emergencySavingsStatus: emergencySavings,
        financialArrangements: arrangements,
      })
    );

    dispatch(syncStepToBackend(4));
    dispatch(setStep(4));
  };

  const handleSaveDraft = () => {
    dispatch(
      saveProfile({
        ...profile,
        responsibilities: selectedObligations,
        totalMonthlyEmi: totalEmi,
      })
    );
  };

  const hasObligations =
    !selectedObligations.includes('NO_OBLIGATIONS') &&
    (selectedObligations.length > 0 || customObligations.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OnboardingStepHeader
        stepNumber={3}
        totalSteps={6}
        category="Responsibilities"
        title="Financial commitments & safety net"
        subtitle="Identifying recurring commitments ensures we safeguard your cash flow and keep debt under control."
      />

      {/* Financial Obligations */}
      <FormSection
        title="Recurring Commitments & Debt Obligations"
        description="Select all that apply to you. Selecting 'No Current Obligations' clears other options."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {OBLIGATION_OPTIONS.map((ob) => (
            <SelectableCard
              key={ob.value}
              type="checkbox"
              selected={selectedObligations.includes(ob.value)}
              onClick={() => toggleObligation(ob.value)}
              title={ob.title}
              icon={ob.icon}
              description={ob.description}
            />
          ))}
        </div>

        {errors.obligations && <InlineValidationMessage message={errors.obligations} className="mt-2" />}

        {/* Custom Obligations Section */}
        {!selectedObligations.includes('NO_OBLIGATIONS') && (
          <div className="mt-4 p-4 rounded-xl bg-[#141414] border border-[#242424] space-y-3">
            <h4 className="text-xs font-semibold text-[#D5C5FF] uppercase tracking-wider">
              Add Custom Obligation (Optional)
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Obligation name (e.g. Equipment Lease, Peer loan…)"
                className="flex-1 px-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg text-xs text-[#FAFAFA] placeholder-[#666666] focus:outline-none focus:border-[#C3ABFA]"
              />
              <div className="w-full sm:w-44">
                <CurrencyInput
                  placeholder="Monthly amount"
                  currency={profile.preferredCurrency || 'INR'}
                  value={customAmount}
                  onChange={setCustomAmount}
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomObligation}
                disabled={!customName.trim()}
                className="px-3.5 py-2 rounded-lg bg-[#242424] hover:bg-[#303030] border border-[#333333] text-xs font-medium text-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                + Add
              </button>
            </div>

            {/* List of custom obligations added */}
            {customObligations.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {customObligations.map((co) => (
                  <div
                    key={co.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-xs"
                  >
                    <span className="font-medium text-[#FAFAFA]">{co.title}</span>
                    <div className="flex items-center gap-3">
                      {co.monthlyAmount && (
                        <span className="font-mono text-[#D5C5FF]">
                          ₹{Number(co.monthlyAmount).toLocaleString('en-IN')}/mo
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomObligation(co.id)}
                        className="text-[#737373] hover:text-[#F07891] p-1 transition-colors"
                        title="Remove"
                      >
                        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 stroke-current" strokeWidth={2}>
                          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Total Monthly EMI estimate */}
        {hasObligations && (
          <div className="mt-4 p-4 rounded-xl bg-[#141414] border border-[#242424] max-w-md animate-in fade-in duration-150">
            <CurrencyInput
              label="Total Monthly Debt / EMI Outflow"
              placeholder="15,000"
              currency={profile.preferredCurrency || 'INR'}
              value={totalEmi}
              onChange={setTotalEmi}
              helperText="Optional cumulative estimate of all monthly debt payments."
            />
          </div>
        )}
      </FormSection>

      {/* Emergency Savings Runway */}
      <FormSection
        title="Emergency Savings Buffer"
        description="Do you currently have liquid savings set aside for unforeseen emergencies?"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {EMERGENCY_SAVINGS_OPTIONS.map((es) => (
            <SelectableCard
              key={es.value}
              selected={emergencySavings === es.value}
              onClick={() => setEmergencySavings(es.value)}
              title={es.title}
              icon={es.icon}
              description={es.description}
            />
          ))}
        </div>
      </FormSection>

      {/* Existing Financial Arrangements */}
      <FormSection
        title="Existing Financial Assets & Accounts"
        description="What financial instruments do you actively hold? No account numbers or balances are required."
        collapsible
        defaultOpen={true}
        badge="Optional"
      >
        <div className="flex flex-wrap gap-2">
          {ARRANGEMENT_TAGS.map((tag) => {
            const isSelected = arrangements.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleArrangement(tag.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#C3ABFA]/15 border-[#C3ABFA] text-[#FAFAFA] ring-1 ring-[#C3ABFA]/40'
                    : 'bg-[#181818] border-[#292929] text-[#888888] hover:text-[#FAFAFA] hover:border-[#3D3D3D]'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {tag.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#666666] mt-2">
          🔒 MoneyOS will never ask for account credentials, card PINs, or banking login passwords.
        </p>
      </FormSection>

      {/* Navigation */}
      <OnboardingNavigation
        onBack={() => dispatch(setStep(2))}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        saveDraftLoading={savingDraft}
      />
    </div>
  );
}
