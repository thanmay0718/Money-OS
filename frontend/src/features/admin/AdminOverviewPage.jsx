// src/features/admin/AdminOverviewPage.jsx
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchAdminOverview } from './adminSlice'
import Surface from '../../components/ui/Surface'
import Button from '../../components/ui/Button'
import {
  UsersRound,
  ArrowLeftRight,
  Wallet,
  Activity,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
} from '../../components/ui/Icons'

export default function AdminOverviewPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { overview, overviewStatus, overviewError } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchAdminOverview())
  }, [dispatch])

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(val) || 0)

  if (overviewStatus === 'loading' && !overview) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondarySurface rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondarySurface rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (overviewStatus === 'failed' && !overview) {
    return (
      <Surface className="p-8 text-center max-w-xl mx-auto my-12">
        <div className="text-negative mb-2 font-medium">Failed to load platform overview</div>
        <p className="text-xs text-mutedText mb-4">{overviewError}</p>
        <Button onClick={() => dispatch(fetchAdminOverview())}>Try Again</Button>
      </Surface>
    )
  }

  const {
    totalUsers = 0,
    activeUsers = 0,
    deactivatedUsers = 0,
    totalTransactions = 0,
    totalVolume = 0,
    incomeVolume = 0,
    expenseVolume = 0,
    transferVolume = 0,
    incomeCount = 0,
    expenseCount = 0,
    transferCount = 0,
    recentUsers = [],
    recentTransactions = [],
    recentAuditLogs = [],
    systemStatus = 'HEALTHY',
  } = overview || {}

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primaryText">Executive Overview</h2>
          <p className="text-sm text-secondaryText mt-0.5">
            Real-time platform activity, user adoption, and financial throughput
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => dispatch(fetchAdminOverview())}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondarySurface text-secondaryText hover:text-primaryText border border-divider transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
          <Button onClick={() => navigate('/admin/analytics')} className="text-xs py-1.5">
            Full Analytics &rarr;
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Users */}
        <Surface className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
              Total Users
            </span>
            <div className="p-2 rounded-lg bg-primaryAccent/10 text-primaryAccent">
              <UsersRound className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-primaryText tracking-tight">
              {totalUsers.toLocaleString()}
            </span>
            <div className="flex items-center space-x-2 mt-1.5 text-xs text-mutedText">
              <span className="text-positive font-medium">{activeUsers} active</span>
              <span>•</span>
              <span className="text-negative/80">{deactivatedUsers} suspended</span>
            </div>
          </div>
        </Surface>

        {/* Total Transactions */}
        <Surface className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
              Platform Transactions
            </span>
            <div className="p-2 rounded-lg bg-accentSoft/10 text-accentSoft">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-primaryText tracking-tight">
              {totalTransactions.toLocaleString()}
            </span>
            <div className="flex items-center space-x-1.5 mt-1.5 text-xs text-mutedText">
              <span>{incomeCount} in</span>
              <span>•</span>
              <span>{expenseCount} out</span>
              <span>•</span>
              <span>{transferCount} xfer</span>
            </div>
          </div>
        </Surface>

        {/* Gross Platform Volume */}
        <Surface className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
              Gross Volume
            </span>
            <div className="p-2 rounded-lg bg-positive/10 text-positive">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold text-primaryText tracking-tight">
              {formatCurrency(totalVolume)}
            </span>
            <p className="text-xs text-mutedText mt-1.5 truncate">
              {formatCurrency(incomeVolume)} in • {formatCurrency(expenseVolume)} out
            </p>
          </div>
        </Surface>

        {/* System Health Status */}
        <Surface className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
              Operational State
            </span>
            <div className="p-2 rounded-lg bg-positive/10 text-positive">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-positive tracking-tight flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-positive inline-block animate-pulse" />
              <span>{systemStatus}</span>
            </span>
            <p className="text-xs text-mutedText mt-1.5">
              PostgreSQL connected • Auth active
            </p>
          </div>
        </Surface>
      </div>

      {/* Financial Throughput Summary (Income vs Expense vs Transfer Breakdown) */}
      <Surface className="p-6">
        <h3 className="text-base font-semibold text-primaryText mb-1">
          Financial Throughput Semantics
        </h3>
        <p className="text-xs text-mutedText mb-5">
          Breakdown of liquid movements across all users. Transfers reallocate pocket balances without affecting platform net deposits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-secondarySurface border border-divider/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-secondaryText">Total Deposits (Income)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-positive/10 text-positive font-semibold">
                + Deposits
              </span>
            </div>
            <p className="text-2xl font-bold text-positive mt-1">
              {formatCurrency(incomeVolume)}
            </p>
            <p className="text-[11px] text-mutedText mt-1">
              {incomeCount} verified credit entries
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondarySurface border border-divider/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-secondaryText">Total Debits (Expenses)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-negative/10 text-negative font-semibold">
                - Outflows
              </span>
            </div>
            <p className="text-2xl font-bold text-negative mt-1">
              {formatCurrency(expenseVolume)}
            </p>
            <p className="text-[11px] text-mutedText mt-1">
              {expenseCount} verified debit entries
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondarySurface border border-divider/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-secondaryText">Inter-Pocket Transfers</span>
              <span className="text-xs px-2 py-0.5 rounded bg-accentSoft/10 text-accentSoft font-semibold">
                Internal Movement
              </span>
            </div>
            <p className="text-2xl font-bold text-accentSubtle mt-1">
              {formatCurrency(transferVolume)}
            </p>
            <p className="text-[11px] text-mutedText mt-1">
              {transferCount} atomic reallocation transactions
            </p>
          </div>
        </div>
      </Surface>

      {/* Dual Column: Recent Platform Transactions & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Surface className="p-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
            <h3 className="text-sm font-semibold text-primaryText">Recent Platform Activity</h3>
            <span className="text-xs text-mutedText">{recentTransactions.length} entries</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <ul className="divide-y divide-divider">
                {recentTransactions.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between px-5 py-3 text-xs">
                    <div>
                      <p className="font-medium text-primaryText text-sm">
                        {tx.description || 'Untitled Transaction'}
                      </p>
                      <p className="text-mutedText text-[11px] mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                        {tx.categoryName ? ` • ${tx.categoryName}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-semibold ${
                          tx.type === 'INCOME'
                            ? 'text-positive'
                            : tx.type === 'EXPENSE'
                            ? 'text-negative'
                            : 'text-accentSubtle'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      <p className="text-[10px] text-mutedText uppercase tracking-wider">
                        {tx.type}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-8 text-center text-xs text-mutedText">No transactions recorded yet.</p>
            )}
          </div>
        </Surface>

        {/* Recent Registered Users */}
        <Surface className="p-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
            <h3 className="text-sm font-semibold text-primaryText">Recent User Registrations</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs text-primaryAccent hover:underline font-medium"
            >
              View all users &rarr;
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentUsers.length > 0 ? (
              <ul className="divide-y divide-divider">
                {recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between px-5 py-3 text-xs">
                    <div>
                      <p className="font-medium text-primaryText text-sm">{u.fullName}</p>
                      <p className="text-mutedText text-[11px] mt-0.5">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-primaryAccent/20 text-accentSoft border border-primaryAccent/30'
                            : 'bg-secondarySurface text-secondaryText border border-divider'
                        }`}
                      >
                        {u.role}
                      </span>
                      <p className="text-[10px] text-mutedText mt-0.5">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-8 text-center text-xs text-mutedText">No users registered yet.</p>
            )}
          </div>
        </Surface>
      </div>

      {/* Recent Audit Trail Preview */}
      <Surface className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-accentSoft" />
            <h3 className="text-sm font-semibold text-primaryText">Security & Administrative Trail</h3>
          </div>
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="text-xs text-primaryAccent hover:underline font-medium"
          >
            Full Audit Log &rarr;
          </button>
        </div>

        {recentAuditLogs.length > 0 ? (
          <div className="space-y-2">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondarySurface text-xs border border-divider/50"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface text-secondaryText border border-divider">
                    {log.eventType}
                  </span>
                  <span className="text-primaryText font-medium">{log.details}</span>
                </div>
                <div className="text-right text-mutedText text-[11px] shrink-0 ml-4">
                  <span>{log.actorEmail}</span> •{' '}
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-mutedText text-center py-4">No audit events recorded yet.</p>
        )}
      </Surface>
    </div>
  )
}
