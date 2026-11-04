// src/components/charts/CashFlowChart.jsx
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown } from '../ui/Icons'

const INCOME_COLOR  = '#70D6A3' // emerald/green
const EXPENSE_COLOR = '#F07891' // rose/pink
const NET_COLOR     = '#E2D9F3' // champagne/lavender

export default function CashFlowChart({
  transactions = [],
  currencyCode = 'INR',
  backendTrends = null,
}) {
  const [timeframe, setTimeframe] = useState('30D') // '7D' | '30D' | '6M' | '1Y'
  const [showNetLine, setShowNetLine] = useState(true)

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  // Filter & aggregate data based on selected timeframe
  const chartData = useMemo(() => {
    const now = new Date()
    let daysToInclude = 30
    if (timeframe === '7D') daysToInclude = 7
    if (timeframe === '30D') daysToInclude = 30
    if (timeframe === '6M') daysToInclude = 180
    if (timeframe === '1Y') daysToInclude = 365

    const cutoffDate = new Date(now.getTime() - daysToInclude * 24 * 60 * 60 * 1000)

    // Aggregate by date (or month for 6M/1Y)
    const isLongRange = timeframe === '6M' || timeframe === '1Y'
    const bucketMap = {}

    // Initialize buckets with 0 to ensure continuity
    if (timeframe === '7D' || timeframe === '30D') {
      for (let i = daysToInclude - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateKey = d.toISOString().slice(0, 10)
        bucketMap[dateKey] = {
          date: dateKey,
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          income: 0,
          expense: 0,
          net: 0,
        }
      }
    }

    if (Array.isArray(transactions) && transactions.length > 0) {
      transactions.forEach((tx) => {
        if (!tx.transactionDate) return
        const txDate = new Date(tx.transactionDate)
        if (txDate < cutoffDate) return

        let bucketKey = tx.transactionDate.slice(0, 10)
        let label = `${txDate.getMonth() + 1}/${txDate.getDate()}`

        if (isLongRange) {
          bucketKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`
          label = txDate.toLocaleString('default', { month: 'short' })
        }

        const amt = Number(tx.amount) || 0

        if (!bucketMap[bucketKey]) {
          bucketMap[bucketKey] = { date: bucketKey, label, income: 0, expense: 0, net: 0 }
        }

        if (tx.type === 'INCOME') {
          bucketMap[bucketKey].income += amt
          bucketMap[bucketKey].net += amt
        } else if (tx.type === 'EXPENSE') {
          bucketMap[bucketKey].expense += amt
          bucketMap[bucketKey].net -= amt
        }
      })
    } else if (Array.isArray(backendTrends) && backendTrends.length > 0) {
      backendTrends.forEach((pt) => {
        const ptDate = new Date(pt.date)
        if (ptDate < cutoffDate) return
        const key = pt.date.slice(0, 10)
        bucketMap[key] = {
          date: key,
          label: `${ptDate.getMonth() + 1}/${ptDate.getDate()}`,
          income: Number(pt.income) || 0,
          expense: Number(pt.expense) || 0,
          net: Number(pt.netFlow) || 0,
        }
      })
    }

    return Object.values(bucketMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [transactions, backendTrends, timeframe])

  // Summary figures for the active timeframe
  const totalPeriodIncome = useMemo(
    () => chartData.reduce((acc, pt) => acc + pt.income, 0),
    [chartData]
  )
  const totalPeriodExpense = useMemo(
    () => chartData.reduce((acc, pt) => acc + pt.expense, 0),
    [chartData]
  )
  const netCashFlow = totalPeriodIncome - totalPeriodExpense

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomeVal = payload.find((p) => p.dataKey === 'income')?.value || 0
      const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0
      const netVal = incomeVal - expenseVal

      return (
        <div className="rounded-xl p-3 border border-[#292929] shadow-2xl backdrop-blur-xl bg-[#181818]/95 text-xs min-w-[160px]">
          <p className="text-[11px] font-medium text-[#737373] mb-2 border-b border-[#292929] pb-1">
            {new Date(label).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between" style={{ color: INCOME_COLOR }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: INCOME_COLOR }} />
                Income
              </span>
              <span className="font-semibold">{formatCurrency(incomeVal)}</span>
            </div>
            <div className="flex items-center justify-between" style={{ color: EXPENSE_COLOR }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: EXPENSE_COLOR }} />
                Expense
              </span>
              <span className="font-semibold">{formatCurrency(expenseVal)}</span>
            </div>
            <div className="flex items-center justify-between text-[#FAFAFA] pt-1.5 border-t border-[#292929] font-medium">
              <span>Net Cash Flow</span>
              <span style={{ color: netVal >= 0 ? INCOME_COLOR : EXPENSE_COLOR }}>
                {formatCurrency(netVal)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Title, Period Switchers, and Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">
              Cash Flow Analytics
            </h3>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                netCashFlow >= 0
                  ? 'bg-[#70D6A3]/15 text-[#70D6A3] border border-[#70D6A3]/20'
                  : 'bg-[#F07891]/15 text-[#F07891] border border-[#F07891]/20'
              }`}
            >
              {netCashFlow >= 0 ? (
                <TrendingUp className="w-2.5 h-2.5 mr-1" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 mr-1" />
              )}
              Net {formatCurrency(netCashFlow)}
            </span>
          </div>
          <p className="text-[11px] text-[#737373] mt-0.5">
            Progressive income vs. expense flow over time
          </p>
        </div>

        {/* Timeframe selector pills */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          {['7D', '30D', '6M', '1Y'].map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-white/10 text-white shadow-sm font-semibold'
                  : 'text-[#737373] hover:text-[#FAFAFA]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Toggle */}
      <div className="flex items-center justify-between text-[11px] mb-3 text-[#A3A3A3]">
        <div className="flex items-center gap-4">
          <span className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ background: INCOME_COLOR, boxShadow: `0 0 6px ${INCOME_COLOR}88` }}
            />
            Income ({formatCurrency(totalPeriodIncome)})
          </span>
          <span className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ background: EXPENSE_COLOR, boxShadow: `0 0 6px ${EXPENSE_COLOR}88` }}
            />
            Expense ({formatCurrency(totalPeriodExpense)})
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowNetLine(!showNetLine)}
          className="text-[10px] text-[#737373] hover:text-white transition-colors"
        >
          {showNetLine ? 'Hide Net Line' : 'Show Net Line'}
        </button>
      </div>

      {/* Chart container */}
      <div className="flex-1 min-h-[220px] w-full">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#737373] text-xs">
            <p>No activity recorded in this timeframe.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#737373' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickFormatter={(str) => {
                  const d = new Date(str)
                  return timeframe === '6M' || timeframe === '1Y'
                    ? d.toLocaleString('default', { month: 'short' })
                    : `${d.getMonth() + 1}/${d.getDate()}`
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#737373' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickFormatter={(val) => {
                  if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}k`
                  return `₹${val}`
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                stroke={INCOME_COLOR}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#incomeAreaGrad)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke={EXPENSE_COLOR}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseAreaGrad)"
              />
              {showNetLine && (
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke={NET_COLOR}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

CashFlowChart.propTypes = {
  transactions: PropTypes.array,
  currencyCode: PropTypes.string,
  backendTrends: PropTypes.array,
}
