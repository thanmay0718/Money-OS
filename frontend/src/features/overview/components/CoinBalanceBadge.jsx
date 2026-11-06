// src/features/overview/components/CoinBalanceBadge.jsx
import React from 'react'
import { Coins, Sparkles } from 'lucide-react'

export const CoinBalanceBadge = ({ totalCoins = 0, loading = false, error = false, onClick }) => {
  if (loading) {
    return (
      <div className="h-8 w-24 rounded-full bg-white/5 animate-pulse" />
    )
  }

  if (error) {
    return (
      <div
        title="Coin balance is temporarily unavailable. Refresh the overview to try again."
        className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[11px] font-medium text-amber-200/75"
      >
        <Coins className="h-3 w-3 text-amber-300/70" />
        Coins unavailable
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title="Coins earned from consistent financial tracking — Click to open Rewards Store"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border border-amber-500/20 text-amber-300 text-xs font-medium shadow-sm backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:scale-[1.02] cursor-pointer"
    >
      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 text-amber-300">
        <Coins className="w-3 h-3 text-amber-400" />
      </div>
      <span className="font-semibold tracking-wide text-amber-200">
        {totalCoins.toLocaleString()}
      </span>
      <span className="text-amber-400/70 text-[11px] font-normal">Coins</span>
      <Sparkles className="w-2.5 h-2.5 text-amber-400/60 ml-0.5" />
    </button>
  )
}

export default CoinBalanceBadge
