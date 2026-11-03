// src/api/profile.js
import api from './axios';

// Fetch the full financial profile for the authenticated user
export const fetchFinancialProfile = () => api.get('/api/profile/financial');

const optionalNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const optionalText = (value) => {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
};

const PROFESSIONAL_STAGE_MAP = {
  STUDENT: 'STUDENT',
  EARLY_CAREER: 'EMPLOYED',
  MID_CAREER: 'EMPLOYED',
  SENIOR: 'EMPLOYED',
  ENTREPRENEUR: 'BUSINESS_OWNER',
  RETIRED: 'OTHER',
  OTHER: 'OTHER',
  // Compatibility with previously returned backend values:
  JOB_SEEKER: 'JOB_SEEKER',
  EMPLOYED: 'EMPLOYED',
  FREELANCER: 'FREELANCER',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
};

const EMPLOYMENT_TYPE_MAP = {
  SALARIED: 'FULL_TIME',
  SELF_EMPLOYED: 'SELF_EMPLOYED',
  BUSINESS_OWNER: 'SELF_EMPLOYED',
  STUDENT: 'NOT_APPLICABLE',
  UNEMPLOYED: 'OTHER',
  RETIRED: 'NOT_APPLICABLE',
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  OTHER: 'OTHER',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
};

const INCOME_PATTERN_MAP = {
  FIXED_MONTHLY: 'MONTHLY',
  VARIABLE_MONTHLY: 'IRREGULAR',
  IRREGULAR: 'IRREGULAR',
  PASSIVE: 'MULTIPLE_SOURCES',
  MONTHLY: 'MONTHLY',
  WEEKLY: 'WEEKLY',
  DAILY: 'DAILY',
  MULTIPLE_SOURCES: 'MULTIPLE_SOURCES',
  NO_CURRENT_INCOME: 'NO_CURRENT_INCOME',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
};

const LIVING_ARRANGEMENT_MAP = {
  RENTING: 'RENTING',
  OWNED: 'OWN_HOME',
  OWN_WITH_MORTGAGE: 'OWN_HOME',
  OWN_WITHOUT_MORTGAGE: 'OWN_HOME',
  MORTGAGE: 'OWN_HOME',
  LIVING_WITH_FAMILY: 'WITH_FAMILY',
  WITH_FAMILY: 'WITH_FAMILY',
  PG_HOSTEL: 'HOSTEL',
  HOSTEL: 'HOSTEL',
  SHARED_ACCOMMODATION: 'SHARED_ACCOMMODATION',
  OTHER: 'OTHER',
  OWN_HOME: 'OWN_HOME',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
};

const BUDGETING_STYLE_MAP = {
  STRICT: 'STRICT',
  MODERATE: 'BALANCED',
  RELAXED: 'FLEXIBLE',
  GOAL_BASED: 'FLEXIBLE',
  FLEXIBLE: 'FLEXIBLE',
  BALANCED: 'BALANCED',
  CATEGORY_BASED: 'BALANCED',
  ZERO_BASED: 'STRICT',
  SIMPLE: 'FLEXIBLE',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
};

const REVIEW_FREQUENCY_MAP = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'MONTHLY',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
};

const mapEnum = (value, aliases) => {
  if (!value) return null;
  return aliases[value] || null;
};

export const toFinancialProfileRequest = (profile) => ({
  professionalStage: mapEnum(profile.professionalStage, PROFESSIONAL_STAGE_MAP),
  employmentType: mapEnum(profile.employmentType, EMPLOYMENT_TYPE_MAP),
  industry: optionalText(profile.industry),
  incomePattern: mapEnum(profile.incomePattern, INCOME_PATTERN_MAP),
  incomeCurrency: optionalText(profile.incomeCurrency) || optionalText(profile.preferredCurrency) || 'INR',
  estimatedMonthlyIncome: optionalNumber(profile.estimatedMonthlyIncome),
  livingArrangement: mapEnum(profile.livingArrangement, LIVING_ARRANGEMENT_MAP),
  budgetingStyle: mapEnum(profile.budgetingStyle, BUDGETING_STYLE_MAP),
  preferredReviewFrequency: mapEnum(profile.preferredReviewFrequency, REVIEW_FREQUENCY_MAP),
  notificationsEnabled: profile.notificationsEnabled ?? true,
  preferredCurrency: optionalText(profile.preferredCurrency) || 'INR',
  personalizationEnabled: profile.personalizationEnabled ?? true,
});

// Update the entire financial profile (PUT)
export const updateFinancialProfile = (payload) =>
  api.put('/api/profile/financial', toFinancialProfileRequest(payload));

// Update only preference fields (PATCH)
export const patchFinancialPreferences = (payload) =>
  api.patch('/api/profile/financial/preferences', payload);

// Save progress step to backend
export const saveOnboardingStep = (stepEnum) =>
  api.put(`/api/profile/financial/onboarding/step/${stepEnum}`);

// Mark onboarding as completed
export const completeOnboarding = () =>
  api.post('/api/profile/financial/onboarding/complete');
