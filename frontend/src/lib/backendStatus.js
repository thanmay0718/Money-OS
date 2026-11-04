export const BACKEND_UNAVAILABLE_EVENT = 'moneyos:backend-unavailable'
export const BACKEND_AVAILABLE_EVENT = 'moneyos:backend-available'

export const announceBackendStatus = (status) => {
  if (typeof window === 'undefined') return

  const unavailable = status === null || status >= 500
  const eventName = unavailable ? BACKEND_UNAVAILABLE_EVENT : BACKEND_AVAILABLE_EVENT
  window.dispatchEvent(new CustomEvent(eventName, { detail: { status } }))
}
