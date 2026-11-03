// src/components/charts/CashFlowChart.jsx
import React from 'react'
import PropTypes from 'prop-types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

// Lavender Dawn semantic colors
const INCOME_COLOR   = '#70D6A3'  // income green
const EXPENSE_COLOR  = '#F07891'  // expense pink

export default function CashFlowChart({ transactions = [], currencyCode = 'INR' }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-[#737373] text-xs">
        <div className="w-10 h-10 rounded-2xl glass-subtle flex items-center justify-center text-[#737373] mb-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <p className="font-medium text-[#A3A3A3]">No cash flow data yet</p>
        <p className="text-[11px] mt-0.5 text-[#737373]">
          Record verified income or expenses to visualize trends.
        </p>
      </div>
    )
  }

  // Aggregate by date
  const dailyMap = {}
  transactions.forEach((tx) => {
    if (!tx.transactionDate) return
    const date = tx.transactionDate.slice(0, 10)
    const amt = Number(tx.amount) || 0
    if (!dailyMap[date]) {
      dailyMap[date] = { date, income: 0, expense: 0, net: 0 }
    }
    if (tx.type === 'INCOME') {
      dailyMap[date].income += amt
      dailyMap[date].net += amt
    } else if (tx.type === 'EXPENSE') {
      dailyMap[date].expense += amt
      dailyMap[date].net -= amt
    }
  })

  const data = Object.values(dailyMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  // Custom tooltip — Lavender Dawn dark surface
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const incomeVal  = payload.find((p) => p.dataKey === 'income')?.value  || 0
      const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0
      const netVal     = incomeVal - expenseVal

      return (
        <div className="rounded-xl p-3 border border-[#292929] shadow-xl backdrop-blur-xl bg-[#181818]/95 text-xs min-w-[150px]">
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
            <div className="flex items-center justify-between text-[#FAFAFA] pt-1 border-t border-[#292929] font-medium">
              <span>Net</span>
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#FAFAFA] tracking-tight">Cash Flow Trend</h3>
          <p className="text-[11px] text-[#737373]">Daily income vs. expense progression</p>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center text-[#A3A3A3]">
            <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: INCOME_COLOR, boxShadow: `0 0 8px ${INCOME_COLOR}99` }} />
            Income
          </span>
          <span className="flex items-center text-[#A3A3A3]">
            <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: EXPENSE_COLOR, boxShadow: `0 0 8px ${EXPENSE_COLOR}99` }} />
            Expense
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGlassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={INCOME_COLOR}  stopOpacity={0.45} />
                <stop offset="95%" stopColor={INCOME_COLOR}  stopOpacity={0.0}  />
              </linearGradient>
              <linearGradient id="expenseGlassGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={EXPENSE_COLOR} stopOpacity={0.45} />
                <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0.0}  />
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
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#737373' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickFormatter={(val) => {
                if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`
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
              fill="url(#incomeGlassGrad)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke={EXPENSE_COLOR}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGlassGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

CashFlowChart.propTypes = {
  transactions: PropTypes.array,
  currencyCode: PropTypes.string,
}
