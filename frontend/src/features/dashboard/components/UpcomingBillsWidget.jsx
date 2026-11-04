// src/features/dashboard/components/UpcomingBillsWidget.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  payRecurring,
} from '../../recurring/recurringSlice'
import { fetchCategories } from '../../categories/categoriesSlice'
import { fetchDashboardSummary } from '../dashboardSlice'
import { fetchPockets } from '../../pockets/pocketsSlice'
import { fetchAllTransactions } from '../../transactions/transactionsSlice'
import {
  CalendarDays,
  Plus,
  CheckCircle,
  Clock,
  TriangleAlert,
  Trash2,
  Pencil,
  X,
  CreditCard,
  RefreshCw,
} from '../../../components/ui/Icons'
import { GlassButton } from '../../../components/ui/glass'
import { toast } from '../../../lib/toast'

export default function UpcomingBillsWidget({ currencyCode = 'INR' }) {
  const dispatch = useDispatch()
  const { list: recurringList, status } = useSelector((state) => state.recurring)
  const { list: pockets } = useSelector((state) => state.pockets)
  const { list: categories } = useSelector((state) => state.categories)

  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [payingId, setPayingId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    pocketId: '',
    frequency: 'MONTHLY',
    nextDueDate: new Date().toISOString().substring(0, 10),
    isBill: true,
  })

  useEffect(() => {
    dispatch(fetchRecurring(null))
  }, [dispatch])

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories())
  }, [dispatch, categories.length])

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  const openCreateModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      amount: '',
      categoryId: '',
      pocketId: pockets?.[0]?.id || '',
      frequency: 'MONTHLY',
      nextDueDate: new Date().toISOString().substring(0, 10),
      isBill: true,
    })
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      amount: String(item.amount),
      categoryId: item.categoryId || '',
      pocketId: item.pocketId || '',
      frequency: item.frequency || 'MONTHLY',
      nextDueDate: item.nextDueDate || new Date().toISOString().substring(0, 10),
      isBill: item.isBill,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const amt = Number(formData.amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Invalid amount', 'Enter a positive bill amount.')
      return
    }
    if (!formData.categoryId) {
      toast.warning('Category Required', 'Choose an expense category so this bill can be recorded when paid.')
      return
    }

    try {
      if (editingItem) {
        await dispatch(
          updateRecurring({
            id: editingItem.id,
            data: {
              name: formData.name.trim(),
              amount: amt,
              categoryId: formData.categoryId || undefined,
              pocketId: formData.pocketId || undefined,
              frequency: formData.frequency,
              nextDueDate: formData.nextDueDate,
              isBill: formData.isBill,
            },
          })
        ).unwrap()
        toast.success('Commitment updated')
      } else {
        await dispatch(
          createRecurring({
            name: formData.name.trim(),
            amount: amt,
            categoryId: formData.categoryId || undefined,
            pocketId: formData.pocketId || undefined,
            frequency: formData.frequency,
            startDate: formData.nextDueDate,
            nextDueDate: formData.nextDueDate,
            isBill: formData.isBill,
            type: 'EXPENSE',
          })
        ).unwrap()
        toast.success('Scheduled commitment added')
      }
      setShowModal(false)
      dispatch(fetchRecurring(null))
    } catch (err) {
      toast.error('Operation failed', err || 'Please check the details.')
    }
  }

  const handlePay = async (item) => {
    if (item.type === 'EXPENSE' && !item.categoryId) {
      openEditModal(item)
      toast.warning('Category Required', 'Choose an expense category and save this bill before marking it paid.')
      return
    }

    setPayingId(item.id)
    try {
      await dispatch(payRecurring(item.id)).unwrap()
      dispatch(fetchDashboardSummary())
      dispatch(fetchPockets())
      dispatch(fetchAllTransactions())
      toast.success(
        `Settled "${item.name}"`,
        `Recorded ${formatCurrency(item.amount)} expense and advanced next due date.`
      )
    } catch (err) {
      toast.error('Settlement failed', err || 'Could not settle bill.')
    } finally {
      setPayingId(null)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete recurring bill "${name}"?`)) return
    try {
      await dispatch(deleteRecurring(id)).unwrap()
      toast.success('Commitment removed')
    } catch (err) {
      toast.error('Failed to remove commitment')
    }
  }

  // Filter bills & subscriptions
  const bills = recurringList.filter((r) => r.isBill || r.type === 'EXPENSE')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#FAFAFA] tracking-tight">
              Upcoming Bills &amp; Commitments
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#C3ABFA]/15 text-[#D5C5FF] border border-[#C3ABFA]/25">
              {bills.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-[#737373]">
            Track recurring utility bills, rent, subscriptions &amp; settle them with atomic pocket sync
          </p>
        </div>

        <GlassButton
          size="sm"
          variant="secondary"
          onClick={openCreateModal}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Bill
        </GlassButton>
      </div>

      {bills.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/[0.06] bg-black/20 text-center text-[#737373] text-xs space-y-2">
          <CalendarDays className="w-8 h-8 text-[#A3A3A3] mx-auto opacity-40 mb-1" />
          <p className="font-medium text-[#FAFAFA] text-sm">No scheduled bills or commitments</p>
          <p className="max-w-xs mx-auto text-[#737373]">
            Add regular expenses like Rent, WiFi, Netflix, or Electricity to get automated due reminders.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-all mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule First Bill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {bills.map((bill) => {
            const isOverdue = bill.billStatus === 'OVERDUE'
            const isDueSoon = bill.billStatus === 'DUE_SOON'
            const isPaid = bill.billStatus === 'PAID'
            const isPaying = payingId === bill.id

            const statusBg = isPaid
              ? 'bg-[#70D6A3]/15 text-[#70D6A3] border-[#70D6A3]/30'
              : isOverdue
              ? 'bg-[#F07891]/15 text-[#F07891] border-[#F07891]/30'
              : isDueSoon
              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
              : 'bg-white/[0.06] text-[#A3A3A3] border-white/10'

            const statusText = isPaid
              ? 'Settled Today'
              : isOverdue
              ? `${Math.abs(bill.daysRemaining)}d Overdue`
              : bill.daysRemaining === 0
              ? 'Due Today'
              : `In ${bill.daysRemaining} days`

            return (
              <div
                key={bill.id}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#FAFAFA] truncate block">
                      {bill.name}
                    </span>
                    <span className="text-[10px] text-[#737373] mt-0.5 block">
                      {bill.categoryName || 'Bill'} • {bill.pocketName || 'Main Pocket'}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBg}`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-[#FAFAFA] font-mono">
                    {formatCurrency(bill.amount)}
                  </span>
                  <span className="text-[11px] text-[#737373] capitalize">
                    {bill.frequency?.toLowerCase() || 'Monthly'}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openEditModal(bill)}
                      title="Edit Commitment"
                      className="p-1 rounded-lg text-[#737373] hover:text-white hover:bg-white/[0.08]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(bill.id, bill.name)}
                      title="Delete Commitment"
                      className="p-1 rounded-lg text-[#737373] hover:text-[#F07891] hover:bg-[#F07891]/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isPaid || isPaying}
                    onClick={() => handlePay(bill)}
                    className={`ml-auto px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isPaid
                        ? 'bg-white/[0.04] text-[#737373] cursor-default'
                        : 'bg-[#C3ABFA] text-black hover:bg-[#C3ABFA]/90 shadow-sm'
                    }`}
                  >
                    {isPaying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{isPaid ? 'Settled' : 'Mark as Paid'}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Recurring Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl p-5 border border-white/10 bg-[#161616] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">
                {editingItem ? 'Edit Recurring Bill' : 'Schedule Recurring Bill / Expense'}
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
                  Bill / Commitment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity, House Rent, Netflix"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] placeholder-[#737373] focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                  Expense Category
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#1C1C1C] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                >
                  <option value="">Select a category</option>
                  {Array.isArray(categories) &&
                    categories
                      .filter((category) => category.type === 'EXPENSE')
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                    Amount ({currencyCode})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 3500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#1C1C1C] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#A3A3A3] block mb-1">
                    Paying Pocket
                  </label>
                  <select
                    value={formData.pocketId}
                    onChange={(e) => setFormData({ ...formData, pocketId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#1C1C1C] border border-white/[0.08] rounded-xl text-[#FAFAFA] focus:outline-none focus:border-white/20"
                  >
                    <option value="">Default Pocket</option>
                    {Array.isArray(pockets) &&
                      pockets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
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
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#C3ABFA] text-black hover:bg-[#C3ABFA]/90 transition-all"
                >
                  {editingItem ? 'Update Commitment' : 'Save Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

UpcomingBillsWidget.propTypes = {
  currencyCode: PropTypes.string,
}
