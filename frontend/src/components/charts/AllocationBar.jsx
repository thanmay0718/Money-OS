// src/components/charts/AllocationBar.jsx
import React from 'react'
import PropTypes from 'prop-types'

// Lavender Dawn multi-color pocket palette
const palette = [
  { bg: '#C3ABFA', shadow: 'rgba(195,171,250,0.5)' },  // lavender
  { bg: '#70D6A3', shadow: 'rgba(112,214,163,0.5)' },  // income green
  { bg: '#86B8F5', shadow: 'rgba(134,184,245,0.5)' },  // transfer blue
  { bg: '#A98AF4', shadow: 'rgba(169,138,244,0.5)' },  // mid lavender
  { bg: '#E9BC68', shadow: 'rgba(233,188,104,0.5)' },  // warning amber
  { bg: '#F07891', shadow: 'rgba(240,120,145,0.5)' },  // expense pink
  { bg: '#8E6BE8', shadow: 'rgba(142,107,232,0.5)' },  // deep lavender
]

export default function AllocationBar({ pockets = [], transactions = [], currencyCode = 'INR' }) {
  if (!pockets || pockets.length === 0) {
    return (
      <div className="w-full text-center py-8 text-xs text-[#737373]">
        <p className="font-medium text-[#A3A3A3]">No money pockets created yet</p>
        <p className="text-[11px] mt-0.5 text-[#737373]">
          Create pockets to allocate and track your funds.
        </p>
      </div>
    )
  }

  const pocketBalances = pockets.map((p) => {
    if (p.balance != null && Number(p.balance) > 0) {
      return { ...p, balance: Number(p.balance) }
    }
    let balance = 0
    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0
      if (tx.toPocketId === p.id) balance += amt
      if (tx.fromPocketId === p.id) balance -= amt
    })
    return { ...p, balance }
  })

  const positivePockets = pocketBalances.filter((p) => p.balance > 0)
  const totalPositive = positivePockets.reduce((sum, p) => sum + p.balance, 0)

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val || 0)

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between text-xs text-[#A3A3A3]">
        <span className="font-medium text-[#737373]">Total Liquid Funds</span>
        <span className="font-semibold text-[#FAFAFA] font-mono">
          {formatCurrency(totalPositive)}
        </span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="w-full h-3.5 rounded-full overflow-hidden bg-[#141414] border border-[#292929] p-0.5 flex gap-0.5 shadow-inner">
        {totalPositive > 0 ? (
          positivePockets.map((p, idx) => {
            const perc = (p.balance / totalPositive) * 100
            const color = palette[idx % palette.length]
            return (
              <div
                key={p.id}
                style={{
                  width: `${perc}%`,
                  background: color.bg,
                  boxShadow: `0 0 10px ${color.shadow}`,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 relative cursor-pointer"
                title={`${p.name}: ${formatCurrency(p.balance)} (${perc.toFixed(1)}%)`}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25 rounded-t-full pointer-events-none" />
              </div>
            )
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#737373]">
            No allocated funds in pockets
          </div>
        )}
      </div>

      {/* Pocket chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {pocketBalances.map((p, idx) => {
          const color = palette[idx % palette.length]
          return (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#292929] hover:border-[#404040] transition-all text-xs"
            >
              <div className="flex items-center space-x-2 truncate pr-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ background: color.bg }}
                />
                <span className="font-medium text-[#A3A3A3] truncate" title={p.name}>
                  {p.name}
                </span>
              </div>
              <span className="font-semibold text-[#FAFAFA] shrink-0 font-mono text-[11px]">
                {formatCurrency(p.balance)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

AllocationBar.propTypes = {
  pockets: PropTypes.array.isRequired,
  transactions: PropTypes.array.isRequired,
  currencyCode: PropTypes.string,
}
