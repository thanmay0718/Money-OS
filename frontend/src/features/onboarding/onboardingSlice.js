// src/features/onboarding/onboardingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/profile';
import { createGoal } from '../../api/goals';

const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof error.message === 'string') return error.message;
  return 'Unable to save your financial profile.';
};

// Map step index (1-6) to backend enum string
const STEP_ENUM_MAP = {
  1: 'STEP1_PROFESSIONAL',
  2: 'STEP2_LIVING',
  3: 'STEP3_RESPONSIBILITIES',
  4: 'STEP4_GOALS',
  5: 'STEP5_PREFERENCES',
  6: 'STEP6_REVIEW',
};

// Safe load in-flight draft from localStorage if present
const savedProgress = (() => {
  try {
    const raw = localStorage.getItem('onboardingProgress');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
})();

export const defaultProfile = {
  // Step 1: Professional Life
  professionalStage: null,
  professionalStageCustom: '',
  employmentType: null,
  employmentTypeCustom: '',
  industry: '',
  incomePattern: null,
  incomePatternCustom: '',
  paySchedule: '',
  payScheduleNotes: '',
  estimatedMonthlyIncome: '',
  incomeRangeMin: '',
  incomeRangeMax: '',
  incomeCurrency: 'INR',

  // Step 2: Living & Lifestyle
  livingArrangement: null,
  livingArrangementCustom: '',
  monthlyRentOrEmi: '',
  locationCountry: 'India',
  locationState: '',
  locationCity: '',
  householdDependents: [],
  householdDependentsCustom: '',
  lifestyleSpending: {
    housing: '',
    groceries: '',
    transport: '',
    utilities: '',
    entertainment: '',
    other: '',
  },

  // Step 3: Financial Responsibilities
  responsibilities: [],
  totalMonthlyEmi: '',
  customObligations: [], // [{ id, title, monthlyAmount }]
  emergencySavingsStatus: '',
  financialArrangements: [],

  // Step 4: Goals & Aspirations
  goals: [],
  goalsList: [], // [{ id, title, targetAmount, savedAmount, targetDate, priority, category }]
  primaryGoalHorizon: '',

  // Step 5: Financial Preferences
  budgetingStyle: null,
  trackingPreferences: [
    'TRACK_INCOME',
    'TRACK_EXPENSES',
    'TRACK_SAVINGS_GOALS',
    'REVIEW_MONTHLY',
  ],
  notificationsEnabled: true,
  notificationPreferences: {
    budgetReminders: true,
    goalMilestones: true,
    upcomingBills: true,
    weeklySummaries: true,
    monthlyReviews: true,
  },
  financialComfort: 'COMFORTABLE',
  preferredCurrency: 'INR',
  preferredReviewFrequency: 'MONTHLY',
  personalizationEnabled: true,
  customPreferencesNotes: '',
};

const initialState = {
  step: savedProgress?.step || 1,
  completed: false, // authoritatively loaded from backend
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  profile: savedProgress?.profile ? { ...defaultProfile, ...savedProgress.profile } : defaultProfile,
  loading: false,
  savingDraft: false,
  error: null,
  saveSuccessMessage: null,
};

export const loadProfile = createAsyncThunk('onboarding/loadProfile', async (_, { rejectWithValue }) => {
  try {
    const resp = await api.fetchFinancialProfile();
    return resp.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const saveProfile = createAsyncThunk('onboarding/saveProfile', async (payload, { rejectWithValue }) => {
  try {
    const resp = await api.updateFinancialProfile(payload);
    return resp.data;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const syncStepToBackend = createAsyncThunk('onboarding/syncStep', async (stepNumber) => {
  const enumName = STEP_ENUM_MAP[stepNumber];
  if (!enumName) return null;
  try {
    const resp = await api.saveOnboardingStep(enumName);
    return resp.data;
  } catch (_) {
    // Non-fatal if step synchronization fails
    return null;
  }
});

export const completeOnboarding = createAsyncThunk(
  'onboarding/completeOnboarding',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState().onboarding;
      const profile = state.profile;

      // 1. Update backend financial profile with all supported fields
      await api.updateFinancialProfile(profile);

      // 2. Persist configured financial goals to backend /api/goals
      if (Array.isArray(profile.goalsList) && profile.goalsList.length > 0) {
        for (const goal of profile.goalsList) {
          if (goal.title && Number(goal.targetAmount) > 0) {
            try {
              await createGoal({
                title: goal.title,
                targetAmount: Number(goal.targetAmount),
                savedAmount: Number(goal.savedAmount) || 0,
                currency: profile.preferredCurrency || 'INR',
                targetDate: goal.targetDate || null,
              });
            } catch (goalErr) {
              console.warn('Could not persist onboarding goal:', goal.title, goalErr);
            }
          }
        }
      }

      // 3. Mark onboarding as complete on backend
      const resp = await api.completeOnboarding();
      return resp.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
      state.error = null;
      if (!state.completed) {
        try {
          localStorage.setItem('onboardingProgress', JSON.stringify({ step: state.step, profile: state.profile }));
        } catch (_) {}
      }
    },
    updateProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload };
      if (!state.completed) {
        try {
          localStorage.setItem('onboardingProgress', JSON.stringify({ step: state.step, profile: state.profile }));
        } catch (_) {}
      }
    },
    clearError(state) {
      state.error = null;
      state.saveSuccessMessage = null;
    },
    resetOnboarding(state) {
      Object.assign(state, initialState);
      try {
        localStorage.removeItem('onboardingProgress');
      } catch (_) {}
    },
  },
  extraReducers: (builder) => {
    builder
      // Reset on logout / login
      .addCase('auth/logout/fulfilled', () => {
        try { localStorage.removeItem('onboardingProgress'); } catch (_) {}
        return { ...initialState };
      })
      .addCase('auth/forceLogout', () => {
        try { localStorage.removeItem('onboardingProgress'); } catch (_) {}
        return { ...initialState };
      })
      .addCase('auth/login/fulfilled', () => {
        try { localStorage.removeItem('onboardingProgress'); } catch (_) {}
        return { ...initialState };
      })

      // Load Profile
      .addCase(loadProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(loadProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.status = 'succeeded';
        if (a.payload) {
          s.profile = { ...s.profile, ...a.payload };
          if (typeof a.payload.onboardingCompleted === 'boolean') {
            s.completed = a.payload.onboardingCompleted;
            if (a.payload.onboardingCompleted) {
              try { localStorage.removeItem('onboardingProgress'); } catch (_) {}
            }
          }
        }
      })
      .addCase(loadProfile.rejected, (s, a) => {
        s.loading = false;
        s.status = 'failed';
        s.error = a.payload;
      })

      // Save Profile Draft
      .addCase(saveProfile.pending, (s) => {
        s.savingDraft = true;
        s.error = null;
        s.saveSuccessMessage = null;
      })
      .addCase(saveProfile.fulfilled, (s, a) => {
        s.savingDraft = false;
        s.saveSuccessMessage = 'Profile draft saved successfully';
        if (a.payload) {
          s.profile = { ...s.profile, ...a.payload };
          if (typeof a.payload.onboardingCompleted === 'boolean') {
            s.completed = a.payload.onboardingCompleted;
          }
        }
      })
      .addCase(saveProfile.rejected, (s, a) => {
        s.savingDraft = false;
        s.error = a.payload;
      })

      // Complete Onboarding
      .addCase(completeOnboarding.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (s, a) => {
        s.loading = false;
        s.completed = true;
        if (a.payload && typeof a.payload.onboardingCompleted === 'boolean') {
          s.completed = a.payload.onboardingCompleted;
        }
        try { localStorage.removeItem('onboardingProgress'); } catch (_) {}
      })
      .addCase(completeOnboarding.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  },
});

export const { setStep, updateProfile, clearError, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
