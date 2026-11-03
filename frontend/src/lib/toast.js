// src/lib/toast.js — Sileo Toast Notification System with Lavender Dawn Styling
import { sileo } from 'sileo'

/**
 * Standardized, human-friendly application toast interface powered by Sileo.
 * Adheres strictly to Lavender Dawn aesthetics and Apple-inspired UX.
 * Throttles duplicate rapid toasts and sanitizes sensitive data or raw stack traces.
 */
let lastToastTime = 0
let lastToastMessage = ''

const shouldThrottleDuplicate = (msg) => {
  const now = Date.now()
  if (msg === lastToastMessage && now - lastToastTime < 1500) {
    return true
  }
  lastToastTime = now
  lastToastMessage = msg
  return false
}

// Clean error message to avoid backend stack traces reaching end users
const sanitizeErrorMessage = (rawError, fallback = "We couldn't complete this action. Please try again.") => {
  if (!rawError) return fallback
  if (typeof rawError === 'string') {
    if (rawError.includes('Exception') || rawError.includes('at ') || rawError.length > 200) {
      return fallback
    }
    return rawError
  }
  const apiMsg = rawError.response?.data?.message || rawError.response?.data?.error || rawError.message
  if (apiMsg && typeof apiMsg === 'string' && !apiMsg.includes('Exception') && apiMsg.length <= 200) {
    return apiMsg
  }
  return fallback
}

export const toast = {
  /**
   * Success Notification
   * Use for completed operations (e.g., transaction created, profile saved).
   */
  success: (title, description) => {
    const key = String(title || '') + String(description || '')
    if (shouldThrottleDuplicate(key)) return null
    return sileo.success({
      title: title || 'Changes saved successfully.',
      description: description ? String(description) : undefined,
      duration: 4000,
    })
  },

  /**
   * Error Notification
   * Use when an operation fails (e.g., API failure, invalid submission).
   */
  error: (title, description) => {
    const cleanDesc = description ? sanitizeErrorMessage(description) : undefined
    const key = String(title || '') + String(cleanDesc || '')
    if (shouldThrottleDuplicate(key)) return null
    return sileo.error({
      title: title || "We couldn't save your changes. Please try again.",
      description: cleanDesc,
      duration: 5500, // Longer duration for users to read error details
    })
  },

  /**
   * Warning Notification
   * Use for important conditions requiring attention (e.g., validation warnings, insufficient balance).
   */
  warning: (title, description) => {
    const key = String(title || '') + String(description || '')
    if (shouldThrottleDuplicate(key)) return null
    return sileo.warning({
      title: title || 'Please review your input.',
      description: description ? String(description) : undefined,
      duration: 4500,
    })
  },

  /**
   * Information Notification
   * Use for helpful updates and notices (e.g., unsaved changes, background status).
   */
  info: (title, description) => {
    const key = String(title || '') + String(description || '')
    if (shouldThrottleDuplicate(key)) return null
    return sileo.info({
      title: title || 'Notice',
      description: description ? String(description) : undefined,
      duration: 4000,
    })
  },

  /**
   * Promise / Loading Async Operations
   * Automatically reflects loading -> success or error state.
   */
  promise: (promise, { loading, success, error }) => {
    return sileo.promise(promise, {
      loading: typeof loading === 'string' ? { title: loading } : loading,
      success: typeof success === 'string' ? { title: success } : success,
      error: (err) => {
        const errorDesc = sanitizeErrorMessage(err)
        if (typeof error === 'function') {
          return error(err)
        }
        return {
          title: error?.title || "We couldn't complete your request.",
          description: error?.description || errorDesc,
        }
      },
    })
  },

  dismiss: (id) => sileo.dismiss(id),
  clear: () => sileo.clear(),
  raw: sileo,
}

// Aliases matching requirement 5 naming conventions
export const notifySuccess = (msg, desc) => toast.success(msg, desc)
export const notifyError = (msg, desc) => toast.error(msg, desc)
export const notifyWarning = (msg, desc) => toast.warning(msg, desc)
export const notifyInfo = (msg, desc) => toast.info(msg, desc)

export default toast
