// src/components/charts/ExpenseBreakdownDonut.jsx
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Film,
  Hospital,
  GraduationCap,
  Zap,
  Tags,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from '../ui/Icons'

const CATEGORY_CONFIG = {
  'Food & Dining': { color: '#F59E0B', icon: Utensils },
  'Food': { color: '#F59E0B', icon: Utensils },
  'Dining': { color: '#F59E0B', icon: Utensils },
  'Groceries': { color: '#F59E0B', icon: Utensils },
  'Shopping': { color: '#EC4899', icon: ShoppingBag },
  'Transportation': { color: '#3B82F6', icon: Car },
  'Transport': { color: '#3B82F6', icon: Car },
  'Housing': { color: '#8B5CF6', icon: Home },
  'Rent': { color: '#8B5CF6', icon: Home },
  'Entertainment': { color: '#10B981', icon: Film },
  'Healthcare': { color: '#EF4444', icon: Hospital },
  'Health': { color: '#EF4444', icon: Hospital },
  'Education': { color: '#06B6D4', icon: GraduationCap },
  'Utilities': { color: '#6366F1', icon: Zap },
  'Bills': { color: '#6366F1', icon: Zap },
  'Other': { color: '#78716C', icon: Tags },
}

const DEFAULT_PALETTE = [
  '#F59E0B',
  '#EC4899',
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#6366F1',
  '#06B6D4',
  '#EF4444',
  '#A855F7',
  '#78716C',
]

export default function ExpenseBreakdownDonut({
  categories = [],
  currencyCode = 'INR',
  totalExpenses = 0,
  onSelectCategory,
  selectedCategory = null,
}) {
  const [activeIndex, setActiveIndex] = useState(null)

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(val || 0)

  if (!categories || categories.length === 0 || totalExpenses <= 0) {
    return (
      <div className="w-full h-full min-h-[260px] flex flex-col items-center justify-center p-6 text-center text-[#737373]">
        <div className="w-12 h-12 rounded-2xl glass-subtle flex items-center justify-center text-[#A3A3A3] mb-3">
          <Tags className="w-6 h-6" />
        </div>
        <p className="font-medium text-[#FAFAFA] text-sm">No expense records this period</p>
        <p className="text-xs text-[#737373] mt-1 max-w-[240px]">
          Record an expense transaction to view category insights and spending distribution.
        </p>
      </div>
    )
  }

  const chartData = categories.map((cat, idx) => {
    const config = CATEGORY_CONFIG[cat.categoryName] || {}
    const color = config.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length]
    return {
      name: cat.categoryName,
      value: Number(cat.amount) || 0,
      percentage: Number(cat.percentage) || 0,
      color,
      changePercent: cat.changePercent,
    }
  })

  const topCategories = categories.slice(0, 5)

  const activeItem = activeIndex != null ? chartData[activeIndex] : null

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-xl p-3 border border-[#292929] shadow-xl backdrop-blur-xl bg-[#181818]/95 text-xs min-w-[140px]">
          <p className="text-[11px] font-medium text-[#A3A3A3] mb-1">{data.name}</p>
          <p className="text-sm font-semibold text-[#FAFAFA]">{formatCurrency(data.value)}</p>
          <p className="text-[11px] text-[#A3A3A3] mt-0.5">
            {data.percentage.toFixed(1)}% of total spent
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Donut Chart with center summary */}
      <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
        <div className="w-[200px] h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={3}
                stroke="#121212"
                strokeWidth={2}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(entry) => {
                  if (onSelectCategory) {
                    onSelectCategory(entry.name)
                  }
                }}
                cursor="pointer"
              >
                {chartData.map((entry, index) => {
                  const isSelected = selectedCategory && selectedCategory === entry.name
                  const isHovered = activeIndex === index
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={
                        selectedCategory
                          ? isSelected
                            ? 1
                            : 0.35
                          : isHovered || activeIndex == null
                          ? 1
                          : 0.6
                      }
                      style={{
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        outline: isSelected ? `2px solid ${entry.color}` : 'none',
                      }}
                    />
                  )
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] tracking-wider uppercase font-semibold text-[#737373]">
              {activeItem ? activeItem.name : 'Total Spent'}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#FAFAFA] tracking-tight mt-0.5">
              {formatCurrency(activeItem ? activeItem.value : totalExpenses)}
            </span>
            <span className="text-[10px] text-[#A3A3A3]">
              {activeItem
                ? `${activeItem.percentage.toFixed(1)}%`
                : `${categories.length} categories`}
            </span>
          </div>
        </div>
      </div>

      {/* Top Categories List with Progress and Metric Details */}
      <div className="lg:col-span-7 flex flex-col space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#A3A3A3] pb-1 border-b border-white/[0.06]">
          <span>Top Expense Categories</span>
          <span className="text-[11px] text-[#737373]">Share &amp; Trend</span>
        </div>

        {topCategories.map((cat, idx) => {
          const config = CATEGORY_CONFIG[cat.categoryName] || {}
          const IconComp = config.icon || Tags
          const color = config.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length]
          const isSelected = selectedCategory === cat.categoryName
          const change = cat.changePercent != null ? Number(cat.changePercent) : null
          const isUnusual = change != null && change > 30

          return (
            <button
              key={cat.categoryName || idx}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.categoryName)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-white/[0.08] border border-white/20 shadow-sm'
                  : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${color}18`,
                    color: color,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#FAFAFA] truncate group-hover:text-white">
                      {cat.categoryName}
                    </span>
                    {isUnusual && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F07891]/20 text-[#F07891] border border-[#F07891]/30">
                        High Spend
                      </span>
                    )}
                  </div>
                  {/* Visual micro-bar */}
                  <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/[0.06] mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(4, cat.percentage))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-[#FAFAFA]">
                  {formatCurrency(cat.amount)}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-[#A3A3A3] mt-0.5">
                  <span>{Number(cat.percentage).toFixed(1)}%</span>
                  {change != null && (
                    <span
                      className={`inline-flex items-center font-medium ${
                        change > 0 ? 'text-[#F07891]' : 'text-[#70D6A3]'
                      }`}
                    >
                      {change > 0 ? (
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                      )}
                      {Math.abs(change).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {categories.length > 5 && (
          <p className="text-[11px] text-[#737373] text-center pt-1">
            + {categories.length - 5} more categories in complete report
          </p>
        )}
      </div>
    </div>
  )
}

ExpenseBreakdownDonut.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryName: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      percentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      changePercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  currencyCode: PropTypes.string,
  totalExpenses: PropTypes.number,
  onSelectCategory: PropTypes.func,
  selectedCategory: PropTypes.string,
}
