// src/store/index.js
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import pocketsReducer from '../features/pockets/pocketsSlice'
import transactionsReducer from '../features/transactions/transactionsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import adminReducer from '../features/admin/adminSlice'
import onboardingReducer from '../features/onboarding/onboardingSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

const appReducer = combineReducers({
  auth: authReducer,
  pockets: pocketsReducer,
  transactions: transactionsReducer,
  categories: categoriesReducer,
  admin: adminReducer,
  onboarding: onboardingReducer,
  dashboard: dashboardReducer,
})

const rootReducer = (state, action) => {
  // Completely purge all state on logout to guarantee absolute data isolation
  if (
    action.type === 'auth/logout/fulfilled' ||
    action.type === 'auth/forceLogout'
  ) {
    state = undefined
  }
  // When a new login occurs, wipe any data slices from a prior session
  if (action.type === 'auth/login/fulfilled') {
    state = {
      auth: state?.auth,
      pockets: undefined,
      transactions: undefined,
      categories: undefined,
      admin: undefined,
      dashboard: undefined,
      onboarding: undefined,
    }
  }
  return appReducer(state, action)
}

const store = configureStore({
  reducer: rootReducer,
})

export default store
