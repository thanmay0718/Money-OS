// src/features/overview/components/RewardsStoreModal.jsx
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  GlassModal,
  GlassButton,
} from '../../../components/ui/glass'
import {
  Coins,
  Sparkles,
  CheckCircle,
  Award,
  Download,
  Palette,
  Shield,
  RefreshCw,
} from '../../../components/ui/Icons'
import { overviewApi } from '../../../api/overview'
import { fetchGamificationOverview } from '../overviewSlice'
import { toast } from '../../../lib/toast'

export default function RewardsStoreModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const { gamification } = useSelector((state) => state.overview)
  const currentCoins = gamification?.coins?.totalCoins || 0

  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(false)
  const [redeemingCode, setRedeemingCode] = useState(null)

  const loadRewards = async () => {
    setLoading(true)
    try {
      const res = await overviewApi.getRewards()
      setRewards(res.data || [])
    } catch (err) {
      console.warn('Failed to load rewards', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadRewards()
    }
  }, [isOpen])

  const handleRedeem = async (reward) => {
    if (currentCoins < reward.costCoins) {
      toast.error(`Insufficient coins. You need ${reward.costCoins} coins to unlock this reward.`)
      return
    }

    setRedeemingCode(reward.code)
    try {
      await overviewApi.redeemReward(reward.code)
      toast.success(`Unlocked "${reward.title}"!`)
      dispatch(fetchGamificationOverview())
      await loadRewards()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to redeem reward'
      toast.error(msg)
    } finally {
      setRedeemingCode(null)
    }
  }

  const getRewardIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#C3ABFA]" />
      case 'Award':
        return <Award className="w-5 h-5 text-amber-400" />
      case 'Download':
        return <Download className="w-5 h-5 text-[#70D6A3]" />
      case 'Shield':
        return <Shield className="w-5 h-5 text-emerald-400" />
      default:
        return <Palette className="w-5 h-5 text-[#86B8F5]" />
    }
  }

  if (!isOpen) return null

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Rewards & Coin Marketplace (Phase 4)"
    >
      <div className="space-y-6">
        {/* Top Balance Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs text-amber-300/80 block font-medium">
                Your Available Balance
              </span>
              <span className="text-xl font-bold font-mono text-amber-200">
                {currentCoins.toLocaleString()} Coins
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-semibold">
            Habit Rewards Store
          </span>
        </div>

        {/* Catalog List */}
        {loading ? (
          <div className="p-10 text-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#C3ABFA] mx-auto mb-2" />
            <p className="text-xs text-[#737373]">Loading available rewards…</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((r) => {
              const isAffordable = currentCoins >= r.costCoins
              const isBusy = redeemingCode === r.code

              return (
                <div
                  key={r.code}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    r.unlocked
                      ? 'border-[#70D6A3]/30 bg-[#70D6A3]/5'
                      : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                        {getRewardIcon(r.icon)}
                      </div>
                      {r.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#70D6A3]/15 text-[#70D6A3] border border-[#70D6A3]/30 font-bold uppercase">
                          <CheckCircle className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                          {r.costCoins} Coins
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white">
                      {r.title}
                    </h4>
                    <p className="text-xs text-[#A3A3A3] mt-1 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    {r.unlocked ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-1.5 rounded-xl bg-white/[0.05] text-xs font-medium text-[#70D6A3] cursor-default"
                      >
                        Active in your account
                      </button>
                    ) : (
                      <GlassButton
                        type="button"
                        variant={isAffordable ? 'primary' : 'ghost'}
                        disabled={!isAffordable || isBusy}
                        onClick={() => handleRedeem(r)}
                        className="w-full text-xs"
                      >
                        {isBusy ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : isAffordable ? (
                          `Redeem for ${r.costCoins} Coins`
                        ) : (
                          `Need ${r.costCoins - currentCoins} more coins`
                        )}
                      </GlassButton>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Close
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  )
}

RewardsStoreModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
