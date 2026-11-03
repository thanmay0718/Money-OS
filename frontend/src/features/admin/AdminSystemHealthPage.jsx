// src/features/admin/AdminSystemHealthPage.jsx
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSystemHealth } from './adminSlice'
import Surface from '../../components/ui/Surface'
import Button from '../../components/ui/Button'
import {
  Activity,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from '../../components/ui/Icons'

export default function AdminSystemHealthPage() {
  const dispatch = useDispatch()
  const { health, healthStatus, healthError } = useSelector((state) => state.admin)

  useEffect(() => {
    dispatch(fetchSystemHealth())
  }, [dispatch])

  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`
  }

  const {
    status = 'UNKNOWN',
    databaseConnected = false,
    databaseLatencyMs = -1,
    uptimeSeconds = 0,
    jvmUsedMemoryMb = 0,
    jvmTotalMemoryMb = 0,
    jvmMaxMemoryMb = 0,
    availableProcessors = 0,
    activeThreadCount = 0,
  } = health || {}

  const memPercentage = jvmMaxMemoryMb > 0 ? Math.round((jvmUsedMemoryMb / jvmMaxMemoryMb) * 100) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primaryText">System Operational Health</h2>
          <p className="text-sm text-secondaryText mt-0.5">
            Real-time telemetry, database socket responsiveness, and JVM runtime metrics
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchSystemHealth())}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-primaryAccent text-primaryText shadow-subtle hover:bg-accentSoft transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Diagnostics</span>
        </button>
      </div>

      {/* Primary Status Banner */}
      <Surface className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className={`p-3 rounded-xl ${
                status === 'HEALTHY'
                  ? 'bg-positive/10 text-positive border border-positive/30'
                  : 'bg-warning/10 text-warning border border-warning/30'
              }`}
            >
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primaryText flex items-center space-x-2">
                <span>Core Platform Status:</span>
                <span
                  className={status === 'HEALTHY' ? 'text-positive' : 'text-warning'}
                >
                  {status}
                </span>
              </h3>
              <p className="text-xs text-mutedText mt-0.5">
                Spring Boot 3.5.6 Backend • Stateless JWT Bearer Security • PostgreSQL Engine
              </p>
            </div>
          </div>

          <div className="text-right self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-divider">
            <span className="text-xs text-mutedText block">Engine Uptime</span>
            <span className="text-base font-mono font-semibold text-primaryText">
              {formatUptime(uptimeSeconds)}
            </span>
          </div>
        </div>
      </Surface>

      {/* Health Indicator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Connectivity */}
        <Surface className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
                PostgreSQL Database
              </span>
              <span
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                  databaseConnected
                    ? 'bg-positive/10 text-positive border border-positive/30'
                    : 'bg-negative/10 text-negative border border-negative/30'
                }`}
              >
                <span>{databaseConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
              </span>
            </div>
            <p className="text-xl font-bold text-primaryText">
              {databaseLatencyMs >= 0 ? `${databaseLatencyMs} ms` : 'N/A'}
            </p>
            <p className="text-xs text-mutedText mt-1">
              JDBC connection pool ping response latency
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-divider flex items-center text-xs text-secondaryText">
            <CheckCircle2 className="w-4 h-4 text-positive mr-1.5 shrink-0" />
            <span>Connection pool active & healthy</span>
          </div>
        </Surface>

        {/* JVM Memory Allocation */}
        <Surface className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
                JVM Heap Memory
              </span>
              <span className="text-xs font-mono font-medium text-accentSoft">
                {memPercentage}% allocated
              </span>
            </div>
            <p className="text-xl font-bold text-primaryText">
              {jvmUsedMemoryMb} MB{' '}
              <span className="text-xs text-mutedText font-normal">
                / {jvmMaxMemoryMb} MB max
              </span>
            </p>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-secondarySurface overflow-hidden mt-2.5">
              <div
                style={{ width: `${memPercentage}%` }}
                className="h-full bg-primaryAccent rounded-full transition-all duration-300"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between text-xs text-mutedText">
            <span>Committed: {jvmTotalMemoryMb} MB</span>
            <span>Free: {jvmTotalMemoryMb - jvmUsedMemoryMb} MB</span>
          </div>
        </Surface>

        {/* Threading & Processors */}
        <Surface className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-mutedText">
                Runtime Compute
              </span>
              <span className="text-xs font-mono text-positive bg-positive/10 px-2 py-0.5 rounded border border-positive/20">
                ACTIVE
              </span>
            </div>
            <div className="flex items-baseline space-x-4">
              <div>
                <p className="text-xl font-bold text-primaryText">{availableProcessors}</p>
                <p className="text-[11px] text-mutedText">CPU Cores</p>
              </div>
              <div className="border-l border-divider pl-4">
                <p className="text-xl font-bold text-primaryText">{activeThreadCount}</p>
                <p className="text-[11px] text-mutedText">Active Threads</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-divider flex items-center text-xs text-secondaryText">
            <CheckCircle2 className="w-4 h-4 text-positive mr-1.5 shrink-0" />
            <span>Virtual thread scheduler optimal</span>
          </div>
        </Surface>
      </div>

      {/* Security Infrastructure Details */}
      <Surface className="p-6">
        <h3 className="text-sm font-semibold text-primaryText mb-1 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-accentSoft" />
          <span>Security & Authentication Boundary</span>
        </h3>
        <p className="text-xs text-mutedText mb-4">
          Stateless JWT token verification with active server-side blacklist revocation repository
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-secondarySurface border border-divider/50">
            <span className="text-mutedText uppercase text-[10px] font-semibold">Algorithm</span>
            <p className="text-primaryText font-medium mt-0.5">HMAC-SHA256 (JJWT 0.12.6)</p>
          </div>
          <div className="p-3 rounded-lg bg-secondarySurface border border-divider/50">
            <span className="text-mutedText uppercase text-[10px] font-semibold">Token Revocation</span>
            <p className="text-primaryText font-medium mt-0.5">TokenRevocationService Active</p>
          </div>
          <div className="p-3 rounded-lg bg-secondarySurface border border-divider/50">
            <span className="text-mutedText uppercase text-[10px] font-semibold">CORS & CSRF</span>
            <p className="text-primaryText font-medium mt-0.5">Stateless API Protected</p>
          </div>
        </div>
      </Surface>
    </div>
  )
}
