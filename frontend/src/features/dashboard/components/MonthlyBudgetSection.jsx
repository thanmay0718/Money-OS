// src/features/dashboard/components/MonthlyBudgetSection.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../../budget/budgetSlice'
import {
  Plus,
  Pencil,
  Trash2,
  TriangleAlert,
  SlidersHorizontal,
  Tags,
  Check,
  X,
} from '../../../components/ui/Icons'
import { GlassButton, GlassInput } from '../../../components/ui/glass'
import { toast } from '../../../lib/toast'

export default function MonthlyBudgetSection({ currencyCode = 'INR' }) {
  const dispatch = useDispatch()
  const { list: budgets, status } = useSelector((state) => state.budget)
  const { list: categories } = useSelector((state) => state.categories)

  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [formData, setFormData] = useState({ name: '', categoryId: '', amount: '' })
  const [saving, setSaving] = useState(false)

  const currentMonthStr = new Date().toISOString().substring(0, 7)
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  useEffect(() => {
    dispatch(fetchBudgets(currentMonthStr))
  }, [dispatch, currentMonthStr])

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  const openCreateModal = () => {
    setEditingBudget(null)
    setFormData({ name: '', categoryId: '', amount: '' })
    setShowModal(true)
  }

  const openEditModal = (budget) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name,
      categoryId: budget.categoryId || '',
      amount: String(budget.amount),
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const amt = Number(formData.amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Invalid amount', 'Enter a positive budget amount.')
      return
    }

    setSaving(true)
    try {
      if (editingBudget) {
        await dispatch(
          updateBudget({
            id: editingBudget.id,
            data: {
              name: formData.name.trim() || undefined,
              categoryId: formData.categoryId || undefined,
              amount: amt,
            },
          })
        ).unwrap()
        toast.success('Monthly budget updated', 'Your new spending limit is saved, and this month’s spending totals have been refreshed.')
      } else {
        await dispatch(
          createBudget({
            name: formData.name.trim() || undefined,
            categoryId: formData.categoryId || undefined,
            amount: amt,
            month: currentMonthStr,
          })
        ).unwrap()
        toast.success('Monthly budget created', 'Your spending limit is saved and is now tracking expenses for this month.')
      }
      setShowModal(false)
      dispatch(fetchBudgets(currentMonthStr))
    } catch (err) {
      toast.error('Could not save budget', err || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete budget for "${name}"?`)) return
    try {
      await dispatch(deleteBudget(id)).unwrap()
      toast.success('Monthly budget deleted', `"${name}" was removed from this month’s budget plan.`)
    } catch (err) {
      toast.error('Deletion failed', err || 'Could not delete budget.')
    }
  }

  // Aggregate total planned vs total spent across budgets
  const totalPlanned = budgets.reduce((acc, b) => acc + (Number(b.amount) || 0), 0)
  const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spentAmount) || 0), 0)
  const overallUtilization = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#FAFAFA] tracking-tight">
              Monthly Budget Management
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A3A3A3] border border-white/[0.08]">
              {monthName}
            </span>
          </div>
          <p className="text-xs text-[#737373]">
            Category-wise spending limits, real-time pace tracking &amp; limit guardrails
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            size="sm"
            variant="secondary"
            onClick={openCreateModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Budget
          </GlassButton>
        </div>
      </div>

      {/* Overall Utilization Bar if budgets exist */}
      {budgets.length > 0 && (
        <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737373]">
              Overall Budget Health
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#FAFAFA]">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs text-[#737373]">
                of {formatCurrency(totalPlanned)} planned
              </span>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-1.5 font-medium">
              <span>Utilization Pace</span>
              <span
                className={
                  overallUtilization >= 100
                    ? 'text-[#F07891]'
                    : overallUtilization >= 80
                    ? 'text-[#F59E0B]'
                    : 'text-[#70D6A3]'
                }
              >
                {overallUtilization.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(2, overallUtilization))}%`,
                  backgroundColor:
                    overallUtilization >= 100
                      ? '#F07891'
                      : overallUtilization >= 80
                      ? '#F59E0B'
                      : '#70D6A3',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/[0.06] bg-black/20 text-center text-[#737373] text-xs space-y-2">
          <SlidersHorizontal className="w-8 h-8 text-[#A3A3A3] mx-auto opacity-40 mb-1" />
          <p className="font-medium text-[#FAFAFA] text-sm">No budgets set for this month</p>
          <p className="max-w-xs mx-auto text-[#737373]">
            Define spending limits for Dining, Shopping, or Groceries to keep monthly cash burn under control.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Set First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const pct = Number(b.utilizationPercentage) || 0
            const spent = Number(b.spentAmount) || 0
            const planned = Number(b.amount) || 1
            const remaining = Number(b.remainingAmount) || 0
            const isExceeded = b.status === 'EXCEEDED' || spent > planned
            const isWarning = b.status === 'WARNING' || (pct >= 80 && !isExceeded)

            const stateColor = isExceeded ? '#F07891' : isWarning ? '#F59E0B' : '#70D6A3'

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#FAFAFA] truncate block">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-[#737373] flex items-center gap-1 mt-0.5">
                      <Tags className="w-3 h-3 text-[#A3A3A3]" />
                      {b.categoryName || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      title="Edit Budget"
                      className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-white/[0.08]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.name)}
                      title="Delete Budget"
                      className="p-1 rounded-lg text-[#737373] hover:text-[#F07891] hover:bg-[#F07891]/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#FAFAFA]">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-[#737373] text-[11px]">
                      Limit: {formatCurrency(planned)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(3, pct))}%`,
                        backgroundColor: stateColor,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                  <span
                    className="font-medium"
                    style={{ color: remaining >= 0 ? '#A3A3A3' : '#F07891' }}
                  >
                    {remaining >= 0
                      ? `${formatCurrency(remaining)} remaining`
                      : `${formatCurrency(Math.abs(remaining))} exceeded`}
                  </span>

                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{
                      backgroundColor: `${stateColor}18`,
                      color: stateColor,
                      border: `1px solid ${stateColor}30`,
                    }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal for Create / Edit Budget */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-5 border border-white/10 bg-[#161616] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">
                {editingBudget ? 'Edit Spending Budget' : 'Create Monthly Budget'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#737373] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                  Budget Name (e.g. Dining Out, Food, Transport)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Food & Groceries"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                  Associate Category (Optional)
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#1C1C1C] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                >
                  <option value="">All / Uncategorized</option>
                  {Array.isArray(categories) &&
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                  Monthly Limit Amount ({currencyCode})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 15000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#A3A3A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#C3ABFA] text-black hover:bg-[#C3ABFA]/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBudget ? 'Update Budget' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

MonthlyBudgetSection.propTypes = {
  currencyCode: PropTypes.string,
}
