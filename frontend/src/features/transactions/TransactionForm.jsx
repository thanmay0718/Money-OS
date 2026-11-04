// src/features/transactions/TransactionForm.jsx
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createTransaction, fetchAllTransactions } from './transactionsSlice'
import { fetchCategories } from '../categories/categoriesSlice'
import { fetchPockets } from '../pockets/pocketsSlice'
import { fetchDashboardInsights } from '../dashboard/dashboardSlice'
import {
  GlassSurface,
  GlassButton,
  GlassInput,
  GlassSelect,
  GlassSegmentedControl,
} from '../../components/ui/glass'
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Check,
  Info,
  TriangleAlert,
} from '../../components/ui/Icons'
import GoalContributionSuggestion from './GoalContributionSuggestion'
import { toast } from '../../lib/toast'

export default function TransactionForm() {
  const dispatch = useDispatch()
  const { list: categories, status: catStatus } = useSelector((state) => state.categories)
  const { list: pockets, status: pocketStatus } = useSelector((state) => state.pockets)
  const user = useSelector((state) => state.auth.user)
  const currencyCode = user?.currency || 'INR'

  useEffect(() => {
    if (catStatus === 'idle') dispatch(fetchCategories())
    if (pocketStatus === 'idle') dispatch(fetchPockets())
  }, [dispatch, catStatus, pocketStatus])

  const [type, setType] = useState('EXPENSE') // 'INCOME' | 'EXPENSE' | 'TRANSFER'
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [fromPocketId, setFromPocketId] = useState('')
  const [toPocketId, setToPocketId] = useState('')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  )

  // Smart Goal Contribution state for INCOME
  const [goalContribution, setGoalContribution] = useState(null)

  const [formError, setFormError] = useState(null)
  const [submitStatus, setSubmitStatus] = useState('idle')

  // Filter categories by selected transaction type
  const relevantCategories = categories.filter((c) => c.type === type)

  // Reset fields when type changes to prevent invalid combinations
  const handleTypeChange = (newType) => {
    setType(newType)
    setCategoryId('')
    setFromPocketId('')
    setToPocketId('')
    setGoalContribution(null)
    setFormError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      const err = 'Amount must be greater than zero.'
      setFormError(err)
      toast.warning('Invalid Amount', err)
      return
    }

    if (!description.trim()) {
      const err = 'Please enter a description for this transaction.'
      setFormError(err)
      toast.warning('Description Required', err)
      return
    }

    // Strict validation per backend contract
    const payload = {
      type,
      amount: numAmount.toFixed(2),
      description: description.trim(),
      transactionDate,
    }

    if (type === 'INCOME') {
      if (!toPocketId) {
        const err = 'Income requires a destination pocket to deposit funds.'
        setFormError(err)
        toast.warning('Destination Pocket Required', err)
        return
      }
      if (!categoryId) {
        const err = 'Please select an income category.'
        setFormError(err)
        toast.warning('Category Required', err)
        return
      }
      payload.toPocketId = toPocketId
      payload.categoryId = categoryId

      // Include goal contribution if selected
      if (goalContribution?.goalId && Number(goalContribution?.amount) > 0) {
        const contribAmt = Number(goalContribution.amount)
        if (contribAmt > numAmount) {
          const err = `Goal contribution (${currencyCode} ${contribAmt}) cannot exceed the income amount (${currencyCode} ${numAmount}).`
          setFormError(err)
          toast.warning('Invalid Goal Contribution', err)
          return
        }
        payload.goalId = goalContribution.goalId
        payload.goalContributionAmount = contribAmt.toFixed(2)
        if (goalContribution.note && goalContribution.note.trim()) {
          payload.goalContributionNote = goalContribution.note.trim()
        }
      }
    } else if (type === 'EXPENSE') {
      if (!fromPocketId) {
        const err = 'Expense requires a source pocket to deduct funds from.'
        setFormError(err)
        toast.warning('Source Pocket Required', err)
        return
      }
      if (!categoryId) {
        const err = 'Please select an expense category.'
        setFormError(err)
        toast.warning('Category Required', err)
        return
      }
      payload.fromPocketId = fromPocketId
      payload.categoryId = categoryId
    } else if (type === 'TRANSFER') {
      if (!fromPocketId || !toPocketId) {
        const err = 'Transfer requires both source and destination pockets.'
        setFormError(err)
        toast.warning('Pockets Required', err)
        return
      }
      if (fromPocketId === toPocketId) {
        const err = 'Source and destination pockets must be different.'
        setFormError(err)
        toast.warning('Invalid Transfer', err)
        return
      }
      payload.fromPocketId = fromPocketId
      payload.toPocketId = toPocketId
    }

    setSubmitStatus('loading')
    try {
      await dispatch(createTransaction(payload)).unwrap()
      setSubmitStatus('succeeded')
      toast.success('Transaction added successfully.', `${type.toLowerCase()} of ${currencyCode} ${numAmount.toFixed(2)} recorded.`)

      // Reset input fields
      setAmount('')
      setDescription('')
      setCategoryId('')
      setFromPocketId('')
      setToPocketId('')
      setGoalContribution(null)

      // Refresh pockets, transactions, and dashboard insights atomically
      dispatch(fetchPockets())
      dispatch(fetchAllTransactions())
      dispatch(fetchDashboardInsights())
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : 'Failed to record transaction'
      setFormError(errMsg)
      toast.error("Your transaction couldn't be added.", errMsg)
      setSubmitStatus('failed')
    }
  }

  const typeOptions = [
    {
      value: 'EXPENSE',
      label: 'Expense',
      icon: <TrendingDown className="w-4 h-4 text-[#F07891]" />,
    },
    {
      value: 'INCOME',
      label: 'Income',
      icon: <TrendingUp className="w-4 h-4 text-[#70D6A3]" />,
    },
    {
      value: 'TRANSFER',
      label: 'Transfer',
      icon: <ArrowLeftRight className="w-4 h-4 text-[#86B8F5]" />,
    },
  ]

  return (
    <GlassSurface className="p-6 relative overflow-hidden border-[#292929] bg-[#181818]/90">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#292929]">
        <div>
          <h2 className="text-lg font-semibold text-[#FAFAFA] tracking-tight">Record Transaction</h2>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            Log income, day-to-day spending, or move money between pockets
          </p>
        </div>
        <div className="w-full lg:w-auto overflow-x-auto">
          <GlassSegmentedControl
            options={typeOptions}
            value={type}
            onChange={handleTypeChange}
            size="md"
          />
        </div>
      </div>

      {formError && (
        <div className="mb-4 rounded-xl border border-[#F07891]/30 bg-[#F07891]/[0.08] p-3 text-xs text-[#F07891] flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 text-[#F07891]" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Amount */}
          <GlassInput
            id="txAmount"
            label={`Amount (${currencyCode})`}
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* Description */}
          <GlassInput
            id="txDesc"
            label="Description"
            type="text"
            required
            maxLength={120}
            placeholder={
              type === 'EXPENSE'
                ? 'e.g. Grocery store, Netflix subscription'
                : type === 'INCOME'
                ? 'e.g. Monthly salary, Freelance consulting'
                : 'e.g. Emergency reserve replenishment'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Transaction Date */}
          <GlassInput
            id="txDate"
            label="Date"
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>

        {/* Dynamic Category and Pocket Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {type !== 'TRANSFER' && (
            <GlassSelect
              id="txCat"
              label={`${type === 'INCOME' ? 'Income' : 'Expense'} Category`}
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select a Category</option>
              {relevantCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </GlassSelect>
          )}

          {/* From Pocket (EXPENSE or TRANSFER) */}
          {(type === 'EXPENSE' || type === 'TRANSFER') && (
            <GlassSelect
              id="txFromPocket"
              label={type === 'TRANSFER' ? 'Source Pocket (Move From)' : 'Deduct from Pocket'}
              required
              value={fromPocketId}
              onChange={(e) => setFromPocketId(e.target.value)}
            >
              <option value="">Select Source Pocket</option>
              {pockets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </GlassSelect>
          )}

          {/* To Pocket (INCOME or TRANSFER) */}
          {(type === 'INCOME' || type === 'TRANSFER') && (
            <GlassSelect
              id="txToPocket"
              label={type === 'TRANSFER' ? 'Destination Pocket (Move To)' : 'Deposit into Pocket'}
              required
              value={toPocketId}
              onChange={(e) => setToPocketId(e.target.value)}
            >
              <option value="">Select Destination Pocket</option>
              {pockets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </GlassSelect>
          )}
        </div>

        {/* Transfer Informative Notice */}
        {type === 'TRANSFER' && (
          <div className="p-3 rounded-xl bg-[#222222]/60 border border-[#292929] text-xs text-[#A3A3A3] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#86B8F5] shrink-0" />
            <span>
              <strong className="text-[#FAFAFA]">Pocket reallocation:</strong> Transfers move existing money between pockets. They do not alter your total net income or expenses.
            </span>
          </div>
        )}

        {/* Contextual Smart Goal Contribution for INCOME */}
        {type === 'INCOME' && (
          <div className="pt-2">
            <GoalContributionSuggestion
              incomeAmount={amount}
              currency={currencyCode}
              value={goalContribution}
              onChange={setGoalContribution}
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            loading={submitStatus === 'loading'}
            icon={<Check className="w-4 h-4" />}
          >
            {submitStatus === 'loading'
              ? 'Recording…'
              : type === 'INCOME'
              ? 'Record Income'
              : type === 'EXPENSE'
              ? 'Record Expense'
              : 'Complete Transfer'}
          </GlassButton>
        </div>
      </form>
    </GlassSurface>
  )
}
