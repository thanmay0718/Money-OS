// src/features/dashboard/components/NetWorthTrackerWidget.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchNetWorth,
  addNetWorthItem,
  deleteNetWorthItem,
} from '../../networth/netWorthSlice'
import {
  Landmark,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Gem,
  Car,
  X,
  PieChart,
} from '../../../components/ui/Icons'
import { GlassButton } from '../../../components/ui/glass'
import { toast } from '../../../lib/toast'

export default function NetWorthTrackerWidget({ currencyCode = 'INR' }) {
  const dispatch = useDispatch()
  const { summary, status } = useSelector((state) => state.networth)

  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'ASSETS' | 'LIABILITIES'
  const [formData, setFormData] = useState({
    name: '',
    type: 'ASSET',
    category: 'INVESTMENT',
    amount: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchNetWorth())
  }, [dispatch])

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  const totalAssets = Number(summary?.totalAssets) || 0
  const totalLiabilities = Number(summary?.totalLiabilities) || 0
  const netWorth = Number(summary?.netWorth) || 0
  const items = summary?.items || []

  const handleSave = async (e) => {
    e.preventDefault()
    const amt = Number(formData.amount)
    if (!Number.isFinite(amt) || amt < 0) {
      toast.error('Invalid amount', 'Amount cannot be negative.')
      return
    }

    setSaving(true)
    try {
      await dispatch(
        addNetWorthItem({
          name: formData.name.trim(),
          type: formData.type,
          category: formData.category,
          amount: amt,
        })
      ).unwrap()
      toast.success(`${formData.type === 'ASSET' ? 'Asset' : 'Liability'} added`)
      setShowModal(false)
      setFormData({ name: '', type: 'ASSET', category: 'INVESTMENT', amount: '' })
      dispatch(fetchNetWorth())
    } catch (err) {
      toast.error('Failed to add item', err || 'Please check input.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await dispatch(deleteNetWorthItem(id)).unwrap()
      dispatch(fetchNetWorth())
      toast.success('Item deleted')
    } catch (err) {
      toast.error('Deletion failed')
    }
  }

  const filteredItems = items.filter((item) => {
    if (activeTab === 'ASSETS') return item.type === 'ASSET'
    if (activeTab === 'LIABILITIES') return item.type === 'LIABILITY'
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#FAFAFA] tracking-tight">
              Net Worth &amp; Balance Sheet
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A3A3A3] border border-white/[0.08]">
              Assets − Liabilities
            </span>
          </div>
          <p className="text-xs text-[#737373]">
            Holistic wealth valuation across liquid pockets, investment holdings &amp; credit liabilities
          </p>
        </div>

        <GlassButton
          size="sm"
          variant="secondary"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Asset / Liability
        </GlassButton>
      </div>

      {/* KPI Trio: Net Worth, Total Assets, Total Liabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Worth Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(195, 171, 250, 0.1)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737373] flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#C3ABFA]" />
              Total Net Worth
            </span>
            <span className="w-2 h-2 rounded-full bg-[#C3ABFA]" />
          </div>
          <p
            className="text-2xl sm:text-3xl font-bold tracking-tight font-mono"
            style={{ color: netWorth >= 0 ? '#FAFAFA' : '#F07891' }}
          >
            {formatCurrency(netWorth)}
          </p>
          <span className="text-[11px] text-[#737373] border-t border-white/[0.04] pt-1.5 block">
            Consolidated financial net worth
          </span>
        </div>

        {/* Total Assets Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(112, 214, 163, 0.08)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737373] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#70D6A3]" />
              Total Assets
            </span>
            <span className="w-2 h-2 rounded-full bg-[#70D6A3]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-[#70D6A3]">
            {formatCurrency(totalAssets)}
          </p>
          <span className="text-[11px] text-[#737373] border-t border-white/[0.04] pt-1.5 block">
            Pockets ({formatCurrency(summary?.liquidPocketsBalance)}) + Holdings
          </span>
        </div>

        {/* Total Liabilities Card */}
        <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between space-y-2 relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: 'rgba(240, 120, 145, 0.08)' }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737373] flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#F07891]" />
              Total Liabilities
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F07891]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight font-mono text-[#F07891]">
            {formatCurrency(totalLiabilities)}
          </p>
          <span className="text-[11px] text-[#737373] border-t border-white/[0.04] pt-1.5 block">
            Loans, cards &amp; debt obligations
          </span>
        </div>
      </div>

      {/* Items List & Category Breakdown */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4">
        {/* Subtabs */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.06] text-xs">
            {['ALL', 'ASSETS', 'LIABILITIES'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white/10 text-white shadow-sm font-semibold'
                    : 'text-[#737373] hover:text-[#FAFAFA]'
                }`}
              >
                {tab === 'ALL' ? 'All Holdings' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#737373]">
            {filteredItems.length} custom recorded entries
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-6 text-center text-[#737373] text-xs space-y-2">
            <p>No custom asset or liability records added yet.</p>
            <p className="text-[11px] text-[#555]">
              Active pockets ({formatCurrency(summary?.liquidPocketsBalance)}) are tracked automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isAsset = item.type === 'ASSET'
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-white/[0.06] bg-black/20 flex items-center justify-between group hover:border-white/10 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAsset ? 'bg-[#70D6A3]' : 'bg-[#F07891]'
                        }`}
                      />
                      <span className="text-xs font-semibold text-[#FAFAFA] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#737373] ml-3.5 block capitalize">
                      {item.category?.toLowerCase() || (isAsset ? 'Asset' : 'Liability')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isAsset ? 'text-[#70D6A3]' : 'text-[#F07891]'
                      }`}
                    >
                      {formatCurrency(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#737373] hover:text-[#F07891] rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-5 border border-white/10 bg-[#161616] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">
                Add Asset or Liability
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
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'ASSET', category: 'INVESTMENT' })}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      formData.type === 'ASSET'
                        ? 'bg-[#70D6A3]/15 text-[#70D6A3] border-[#70D6A3]/30 shadow-sm'
                        : 'border-white/[0.08] text-[#737373] hover:text-white'
                    }`}
                  >
                    Asset (Wealth)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'LIABILITY', category: 'PERSONAL_LOAN' })}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      formData.type === 'LIABILITY'
                        ? 'bg-[#F07891]/15 text-[#F07891] border-[#F07891]/30 shadow-sm'
                        : 'border-white/[0.08] text-[#737373] hover:text-white'
                    }`}
                  >
                    Liability (Debt)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.type === 'ASSET'
                      ? 'e.g. Mutual Funds, Gold, Apartment'
                      : 'e.g. Education Loan, Credit Card Dues'
                  }
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#A3A3A3] block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#1C1C1C] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                  >
                    {formData.type === 'ASSET' ? (
                      <>
                        <option value="INVESTMENT">Investment / Stocks</option>
                        <option value="PROPERTY">Real Estate</option>
                        <option value="VEHICLE">Vehicle</option>
                        <option value="CRYPTO">Crypto</option>
                        <option value="CASH">Cash / Gold</option>
                        <option value="OTHER">Other Asset</option>
                      </>
                    ) : (
                      <>
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="STUDENT_LOAN">Student Loan</option>
                        <option value="CREDIT_CARD">Credit Card Debt</option>
                        <option value="MORTGAGE">Home Mortgage</option>
                        <option value="CAR_LOAN">Auto Loan</option>
                        <option value="OTHER">Other Debt</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                    Value ({currencyCode})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 100000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                  />
                </div>
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
                  {saving ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

NetWorthTrackerWidget.propTypes = {
  currencyCode: PropTypes.string,
}
