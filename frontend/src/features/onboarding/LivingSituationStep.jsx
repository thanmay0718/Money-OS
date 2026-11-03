// src/features/onboarding/LivingSituationStep.jsx
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
import { Home, Key, Building2, House, Handshake, BedDouble, Package, User, Heart, Baby, UsersRound } from '../../components/ui/Icons';

const LIVING_ARRANGEMENTS = [
  { value: 'WITH_FAMILY', title: 'Living with Parents / Family', icon: <UsersRound className="w-5 h-5 text-[#C3ABFA]" />, description: 'Shared family household with lower individual overhead' },
  { value: 'RENTING', title: 'Renting', icon: <Key className="w-5 h-5 text-[#86B8F5]" />, description: 'Leased apartment or house with monthly rental commitment' },
  { value: 'OWN_WITH_MORTGAGE', title: 'Own Home with Mortgage', icon: <Building2 className="w-5 h-5 text-[#E9BC68]" />, description: 'Homeowner with active home loan repayments' },
  { value: 'OWN_WITHOUT_MORTGAGE', title: 'Own Home without Mortgage', icon: <House className="w-5 h-5 text-[#70D6A3]" />, description: 'Fully paid homeowner with no loan commitments' },
  { value: 'SHARED_ACCOMMODATION', title: 'Shared Accommodation', icon: <Handshake className="w-5 h-5 text-[#C3ABFA]" />, description: 'Co-living or sharing with flatmates' },
  { value: 'HOSTEL', title: 'Hostel / Student Housing', icon: <BedDouble className="w-5 h-5 text-[#86B8F5]" />, description: 'Campus dorm or paying guest accommodation' },
  { value: 'OTHER', title: 'Other Arrangement', icon: <Package className="w-5 h-5 text-[#D5C5FF]" />, description: 'Unique or mobile living situation' },
];

const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Other', label: 'Other Country' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi NCR', 'Goa', 'Gujarat',
  'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'West Bengal'
].map((s) => ({ value: s, label: s }));

const TOP_CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune',
  'Kolkata', 'Ahmedabad', 'Gurugram', 'Noida', 'Jaipur', 'Chandigarh',
  'Kochi', 'Dubai', 'London', 'New York', 'San Francisco', 'Toronto'
].map((c) => ({ value: c, label: c }));

const HOUSEHOLD_DEPENDENTS_OPTIONS = [
  { value: 'MYSELF', label: 'Only Myself', icon: <User className="w-5 h-5 text-[#C3ABFA]" />, description: 'Solely supporting my own expenses' },
  { value: 'SPOUSE', label: 'Partner / Spouse', icon: <Heart className="w-5 h-5 text-[#F07891]" />, description: 'Shared household with partner' },
  { value: 'CHILDREN', label: 'Children', icon: <Baby className="w-5 h-5 text-[#86B8F5]" />, description: 'Financially caring for children' },
  { value: 'PARENTS', label: 'Parents / Family', icon: <UsersRound className="w-5 h-5 text-[#E9BC68]" />, description: 'Supporting elderly parents or family members' },
  { value: 'OTHER_DEPENDENTS', label: 'Other Dependents', icon: <Handshake className="w-5 h-5 text-[#70D6A3]" />, description: 'Other relatives or dependents' },
];

export default function LivingSituationStep() {
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.onboarding.profile);
  const savingDraft = useSelector((s) => s.onboarding.savingDraft);

  const [arrangement, setArrangement] = useState(profile.livingArrangement || '');
  const [arrangementCustom, setArrangementCustom] = useState(profile.livingArrangementCustom || '');
  const [rentOrEmi, setRentOrEmi] = useState(profile.monthlyRentOrEmi || '');

  // Location
  const [country, setCountry] = useState(profile.locationCountry || 'India');
  const [stateName, setStateName] = useState(profile.locationState || '');
  const [cityName, setCityName] = useState(profile.locationCity || '');

  // Household dependents
  const [dependents, setDependents] = useState(profile.householdDependents || []);
  const [dependentsCustom, setDependentsCustom] = useState(profile.householdDependentsCustom || '');

  // Lifestyle spending (progressive disclosure)
  const [lifestyle, setLifestyle] = useState({
    housing: profile.lifestyleSpending?.housing || '',
    groceries: profile.lifestyleSpending?.groceries || '',
    transport: profile.lifestyleSpending?.transport || '',
    utilities: profile.lifestyleSpending?.utilities || '',
    entertainment: profile.lifestyleSpending?.entertainment || '',
    other: profile.lifestyleSpending?.other || '',
  });

  const [errors, setErrors] = useState({});

  const toggleDependent = (val) => {
    if (val === 'MYSELF') {
      setDependents(['MYSELF']);
    } else {
      const next = dependents.filter((d) => d !== 'MYSELF');
      if (next.includes(val)) {
        setDependents(next.filter((d) => d !== val));
      } else {
        setDependents([...next, val]);
      }
    }
  };

  const handleArrangementSelect = (val) => {
    setArrangement(val);
    if (errors.arrangement) setErrors((e) => ({ ...e, arrangement: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!arrangement) {
      errs.arrangement = 'Please select your living arrangement.';
    }
    if (arrangement === 'OTHER' && !arrangementCustom.trim()) {
      errs.arrangementCustom = 'Please specify your living arrangement.';
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
        livingArrangement: arrangement,
        livingArrangementCustom: arrangement === 'OTHER' ? arrangementCustom : '',
        monthlyRentOrEmi: rentOrEmi,
        locationCountry: country,
        locationState: stateName,
        locationCity: cityName,
        householdDependents: dependents,
        householdDependentsCustom: dependents.includes('OTHER_DEPENDENTS') ? dependentsCustom : '',
        lifestyleSpending: lifestyle,
      })
    );

    dispatch(syncStepToBackend(3));
    dispatch(setStep(3));
  };

  const handleSaveDraft = () => {
    dispatch(
      saveProfile({
        ...profile,
        livingArrangement: arrangement,
      })
    );
  };

  const showHousingAmountField =
    arrangement === 'RENTING' ||
    arrangement === 'OWN_WITH_MORTGAGE' ||
    arrangement === 'SHARED_ACCOMMODATION' ||
    arrangement === 'HOSTEL';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <OnboardingStepHeader
        stepNumber={2}
        totalSteps={6}
        category="Living & Lifestyle"
        title="Living arrangements and lifestyle"
        subtitle="Understanding where you reside and your household footprint helps calibrate benchmark living costs."
      />

      {/* Living Arrangement */}
      <FormSection
        title="Living Arrangement"
        description="Select the option that best reflects your current residence."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {LIVING_ARRANGEMENTS.map((arr) => (
            <SelectableCard
              key={arr.value}
              selected={arrangement === arr.value}
              onClick={() => handleArrangementSelect(arr.value)}
              title={arr.title}
              icon={arr.icon}
              description={arr.description}
            />
          ))}
        </div>

        {arrangement === 'OTHER' && (
          <CustomOptionInput
            label="Custom Living Arrangement"
            value={arrangementCustom}
            onChange={(val) => {
              setArrangementCustom(val);
              if (errors.arrangementCustom) setErrors((e) => ({ ...e, arrangementCustom: undefined }));
            }}
            placeholder="e.g. Nomadic, Company provided quarters…"
            error={errors.arrangementCustom}
          />
        )}

        {errors.arrangement && <InlineValidationMessage message={errors.arrangement} className="mt-2" />}
      </FormSection>

      {/* Conditional Housing Cost */}
      {showHousingAmountField && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#242424] space-y-2 animate-in fade-in duration-200">
          <div className="max-w-md">
            <CurrencyInput
              label={
                arrangement === 'OWN_WITH_MORTGAGE'
                  ? 'Monthly Mortgage / Home Loan EMI'
                  : arrangement === 'RENTING'
                  ? 'Monthly Rent'
                  : 'Monthly Housing Commitment'
              }
              placeholder={arrangement === 'OWN_WITH_MORTGAGE' ? '35,000' : '18,000'}
              currency={profile.preferredCurrency || 'INR'}
              value={rentOrEmi}
              onChange={setRentOrEmi}
              helperText="Optional. Helps MoneyOS calculate your fixed commitments."
            />
          </div>
        </div>
      )}

      {/* Regional Location (Country, State, City) */}
      <FormSection
        title="Location"
        description="Regional context helps estimate cost-of-living adjustments. No street address is requested."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SearchableSelect
            label="Country"
            options={COUNTRIES}
            value={country}
            onChange={(c) => {
              setCountry(c);
              if (c !== 'India') setStateName('');
            }}
            placeholder="Select country…"
            helperText="Optional"
          />

          {country === 'India' ? (
            <SearchableSelect
              label="State"
              options={INDIAN_STATES}
              value={stateName}
              onChange={setStateName}
              allowCustom
              placeholder="Select state…"
              helperText="Optional"
            />
          ) : (
            <div>
              <label className="text-xs font-medium text-[#E5E5E5] flex items-center justify-between mb-1.5 tracking-wide">
                <span>State / Province / Region</span>
                <span className="text-[11px] text-[#737373]">Optional</span>
              </label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="e.g. California, Ontario…"
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#292929] rounded-xl text-sm text-[#FAFAFA] placeholder-[#555555] focus:outline-none focus:border-[#C3ABFA]"
              />
            </div>
          )}

          <SearchableSelect
            label="City"
            options={TOP_CITIES}
            value={cityName}
            onChange={setCityName}
            allowCustom
            searchPlaceholder="Search or type city…"
            placeholder="Select or type city…"
            helperText="Optional"
          />
        </div>
      </FormSection>

      {/* Household Responsibilities */}
      <FormSection
        title="Household Responsibilities"
        description="Who do you financially support? Select all that apply."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {HOUSEHOLD_DEPENDENTS_OPTIONS.map((dep) => (
            <SelectableCard
              key={dep.value}
              type="checkbox"
              selected={dependents.includes(dep.value)}
              onClick={() => toggleDependent(dep.value)}
              title={dep.label}
              icon={dep.icon}
              description={dep.description}
            />
          ))}
        </div>

        {dependents.includes('OTHER_DEPENDENTS') && (
          <CustomOptionInput
            label="Other Dependents Details"
            value={dependentsCustom}
            onChange={setDependentsCustom}
            placeholder="e.g. Sibling studying in university, extended relative…"
          />
        )}
      </FormSection>

      {/* Progressive Disclosure: Optional Lifestyle Spending Estimates */}
      <FormSection
        title="Monthly Lifestyle Spending Estimates"
        description="Rough estimates to initialize your initial spending categories. You can skip this and track exact expenses later."
        collapsible
        defaultOpen={false}
        badge="Optional Breakdown"
      >
        <div className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#242424] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <CurrencyInput
            label="Groceries & Dining"
            placeholder="12,000"
            currency={profile.preferredCurrency || 'INR'}
            value={lifestyle.groceries}
            onChange={(val) => setLifestyle((l) => ({ ...l, groceries: val }))}
          />
          <CurrencyInput
            label="Transportation & Fuel"
            placeholder="5,000"
            currency={profile.preferredCurrency || 'INR'}
            value={lifestyle.transport}
            onChange={(val) => setLifestyle((l) => ({ ...l, transport: val }))}
          />
          <CurrencyInput
            label="Utilities & Bills"
            placeholder="4,000"
            currency={profile.preferredCurrency || 'INR'}
            value={lifestyle.utilities}
            onChange={(val) => setLifestyle((l) => ({ ...l, utilities: val }))}
          />
          <CurrencyInput
            label="Shopping & Leisure"
            placeholder="8,000"
            currency={profile.preferredCurrency || 'INR'}
            value={lifestyle.entertainment}
            onChange={(val) => setLifestyle((l) => ({ ...l, entertainment: val }))}
          />
          <CurrencyInput
            label="Housing Maintenance"
            placeholder="3,000"
            currency={profile.preferredCurrency || 'INR'}
            value={lifestyle.housing}
            onChange={(val) => setLifestyle((l) => ({ ...l, housing: val }))}
          />
          <CurrencyInput
            label="Other Recurring Spending"
            placeholder="4,000"
            currency={profile.preferredCurrency || 'INR'}
            value={lifestyle.other}
            onChange={(val) => setLifestyle((l) => ({ ...l, other: val }))}
          />
        </div>
      </FormSection>

      {/* Navigation */}
      <OnboardingNavigation
        onBack={() => dispatch(setStep(1))}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        saveDraftLoading={savingDraft}
      />
    </div>
  );
}
