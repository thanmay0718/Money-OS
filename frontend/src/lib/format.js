/**
 * Currency & Number Formatter for Money OS
 * Standardized on Indian digit grouping (en-IN) with fallback support
 */
export const formatINR = (amount, decimals = 0) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount)
}

export const formatPercent = (val) => {
  const prefix = val >= 0 ? '+' : ''
  return `${prefix}${val.toFixed(1)}%`
}
