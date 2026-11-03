// src/features/goals/GoalContributionModal.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { addGoalContribution } from '../../api/goals'
import { fetchAllTransactions } from '../transactions/transactionsSlice'
import {
  GlassModal,
  GlassButton,
  GlassInput,
  GlassSelect,
  GlassProgressIndicator,
} from '../../components/ui/glass'
import { toast } from '../../lib/toast'

export default function GoalContributionModal({ goal, pockets = [], onClose, onSuccess }) {
  const dispatch = useDispatch()
  const transactions = useSelector((state) => state.transactions.list)

  const [pocketId, setPocketId] = useState(pockets.length > 0 ? pockets[0].id : '')
  const [amount, setAmount] = useState('')
  const [contributionDate, setContributionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const currencyCode = goal.currency || 'INR'

  // Ensure transactions are loaded for accurate derived pocket balance calculation
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      dispatch(fetchAllTransactions())
    }
  }, [dispatch, transactions])

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(val || 0)
  }

  // Calculate reliable available balance for any pocket using server value or transaction history
  const getPocketAvailableBalance = (pocket) => {
    if (!pocket) return 0
    if (pocket.balance != null && Number(pocket.balance) > 0) {
      return Number(pocket.balance)
    }
    if (transactions && transactions.length > 0) {
      let balance = 0
      for (const tx of transactions) {
        const amt = Number(tx.amount) || 0
        if (tx.toPocketId === pocket.id) {
          balance += amt
        }
        if (tx.fromPocketId === pocket.id) {
          balance -= amt
        }
      }
      return balance
    }
    return Number(pocket.balance) || 0
  }

  const selectedPocket = pockets.find((p) => p.id === pocketId)
  const availableBalance = getPocketAvailableBalance(selectedPocket)

  const numAmount = parseFloat(amount) || 0
  const previouslySaved = Number(goal.savedAmount) || 0
  const targetAmount = Number(goal.targetAmount) || 0
  const savedAfter = previouslySaved + numAmount
  const remainingAfter = Math.max(0, targetAmount - savedAfter)
  const progressAfter = targetAmount > 0 ? Math.min(100, (savedAfter / targetAmount) * 100) : 0

  const hasInsufficientFunds = selectedPocket && numAmount > availableBalance
  const isInvalidAmount = numAmount <= 0 || isNaN(numAmount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!pocketId) {
      setError('Please select a source money pocket.')
      return
    }
    if (isInvalidAmount) {
      setError('Please enter a contribution amount greater than zero.')
      return
    }
    if (hasInsufficientFunds) {
      setError(`Insufficient funds in "${selectedPocket?.name}". Available: ${formatCurrency(availableBalance)}`)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        pocketId,
        amount: numAmount,
        contributionDate: contributionDate || null,
        note: note.trim() || null,
      }
      const response = await addGoalContribution(goal.id, payload)
      toast.success('Contribution added successfully.', `Allocated to "${goal.title}".`)
      if (onSuccess) {
        onSuccess(response.data)
      }
      onClose()
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to process contribution'
      setError(message)
      toast.error("Couldn't add contribution.", message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassModal
      isOpen={true}
      onClose={onClose}
      title="Add Money to Goal"
      subtitle={`Allocate money from your available pockets toward "${goal.title}".`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {error && (
          <div role="alert" className="p-3 bg-[#F07891]/10 border border-[#F07891]/30 rounded-xl text-[#F07891] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Pocket */}
          <div>
            <GlassSelect
              label="Source Money Pocket"
              required
              value={pocketId}
              onChange={(e) => {
                setPocketId(e.target.value)
                setError(null)
              }}
              helperText={
                selectedPocket
                  ? `Available in this pocket: ${formatCurrency(availableBalance)}`
                  : undefined
              }
            >
              {pockets.map((p) => {
                const bal = getPocketAvailableBalance(p)
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(bal)})
                  </option>
                )
              })}
            </GlassSelect>
          </div>

          {/* Amount */}
          <GlassInput
            label={`Contribution Amount (${currencyCode})`}
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError(null)
            }}
          />

          {/* Date */}
          <GlassInput
            label="Contribution Date"
            type="date"
            value={contributionDate}
            onChange={(e) => setContributionDate(e.target.value)}
          />

          {/* Note */}
          <GlassInput
            label="Note (optional)"
            type="text"
            maxLength={150}
            placeholder="e.g. Monthly savings transfer"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Live Progress Preview */}
          {numAmount > 0 && !hasInsufficientFunds && (
            <div className="p-3.5 rounded-2xl glass-subtle border border-[#C3ABFA]/30 space-y-2 text-xs">
              <span className="font-semibold text-[#FAFAFA]">Progress Impact:</span>
              <GlassProgressIndicator
                value={savedAfter}
                max={targetAmount}
                showLabel
                label="New Goal Progress"
                variant="gradient"
                size="md"
              />
              <div className="flex justify-between text-[11px] text-[#A3A3A3] pt-1">
                <span>New Balance: <strong className="text-white font-mono">{formatCurrency(savedAfter)}</strong></span>
                <span>Remaining: <strong className="text-[#C3ABFA] font-mono">{formatCurrency(remainingAfter)}</strong></span>
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-[#292929]">
            <GlassButton type="button" variant="ghost" onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={hasInsufficientFunds || isInvalidAmount}
            >
              Confirm Contribution
            </GlassButton>
          </div>
        </form>
      </div>
    </GlassModal>
  )
}

GoalContributionModal.propTypes = {
  goal: PropTypes.object.isRequired,
  pockets: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
}
