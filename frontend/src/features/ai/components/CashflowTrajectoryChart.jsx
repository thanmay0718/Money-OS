// src/features/ai/components/CashflowTrajectoryChart.jsx
import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { formatINR } from '../../../lib/format'

export default function CashflowTrajectoryChart({
  forecast,
  currencyCode = 'INR',
}) {
  if (!forecast || !forecast.points || forecast.points.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[#737373]">
        No trajectory simulation data available
      </div>
    )
  }

  const chartData = forecast.points.map((pt) => ({
    date: new Date(pt.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    rawDate: pt.date,
    balance: Number(pt.balance),
    scheduledExpenses: Number(pt.scheduledExpenses),
    isUnderBuffer: pt.isUnderBuffer,
  }))

  const minVal = Math.min(
    ...chartData.map((d) => d.balance),
    Number(forecast.projectedEndOfMonthBalance || 0)
  )
  const maxVal = Math.max(
    ...chartData.map((d) => d.balance),
    Number(forecast.currentTotalBalance || 0)
  )
  const yDomain = [
    Math.floor(Math.min(0, minVal * 0.9)),
    Math.ceil(maxVal * 1.08),
  ]

  const isAtRisk = forecast.forecastStatus === 'AT_RISK'
  const strokeColor = isAtRisk ? '#F07891' : '#70D6A3'
  const gradientId = isAtRisk ? 'trajectoryRiskGrad' : 'trajectorySafeGrad'

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isAtRisk
                  ? 'bg-[#F07891] animate-pulse'
                  : forecast.forecastStatus === 'STABLE'
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#70D6A3]'
              }`}
            />
            <h4 className="text-sm font-semibold text-white tracking-wide">
              30-Day Forward Trajectory
            </h4>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                isAtRisk
                  ? 'bg-[#F07891]/10 text-[#F07891] border-[#F07891]/30'
                  : 'bg-[#70D6A3]/10 text-[#70D6A3] border-[#70D6A3]/30'
              }`}
            >
              {forecast.forecastStatus}
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">{forecast.commentary}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl">
            <span className="text-[#737373] block text-[10px] uppercase">
              Daily Burn Rate
            </span>
            <span className="font-bold text-[#F07891]">
              -{formatINR(forecast.burnRateDaily)}
            </span>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl">
            <span className="text-[#737373] block text-[10px] uppercase">
              Safe Daily Spend
            </span>
            <span className="font-bold text-[#70D6A3]">
              +{formatINR(forecast.safeDailySpend)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trajectorySafeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#70D6A3" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#70D6A3" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="trajectoryRiskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F07891" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F07891" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="#525252"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              interval={4}
            />
            <YAxis
              domain={yDomain}
              stroke="#525252"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-[#18181B]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl text-xs font-mono">
                      <p className="text-[#A3A3A3] mb-1 font-sans">{data.date}</p>
                      <p className="font-bold text-white text-sm">
                        Balance: {formatINR(data.balance)}
                      </p>
                      {data.scheduledExpenses > 0 && (
                        <p className="text-[#F07891] mt-1 text-[11px]">
                          Scheduled Outflow: -{formatINR(data.scheduledExpenses)}
                        </p>
                      )}
                      {data.isUnderBuffer && (
                        <p className="text-[#F59E0B] text-[10px] mt-1">
                          ⚠️ Below 15% safety buffer
                        </p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />

            <ReferenceLine
              y={0}
              stroke="rgba(240, 120, 145, 0.4)"
              strokeDasharray="3 3"
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
