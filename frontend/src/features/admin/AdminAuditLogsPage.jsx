// src/features/admin/AdminAuditLogsPage.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminAuditLogs } from './adminSlice'
import Surface from '../../components/ui/Surface'
import {
  ClipboardList,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from '../../components/ui/Icons'

export default function AdminAuditLogsPage() {
  const dispatch = useDispatch()
  const { auditLogsPage, auditLogsStatus, auditLogsError } = useSelector((state) => state.admin)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    dispatch(fetchAdminAuditLogs({ page: currentPage, size: 20 }))
  }, [dispatch, currentPage])

  const logs = auditLogsPage?.content || []
  const totalPages = auditLogsPage?.totalPages || 0
  const totalElements = auditLogsPage?.totalElements || 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primaryText">Audit Logs & Security Trail</h2>
          <p className="text-sm text-secondaryText mt-0.5">
            Immutable system audit logs recording administrative access, role elevations, and state modifications
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchAdminAuditLogs({ page: currentPage, size: 20 }))}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondarySurface text-secondaryText hover:text-primaryText border border-divider transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <Surface className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-divider bg-secondarySurface/50 text-mutedText uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-5">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider font-sans">
              {auditLogsStatus === 'loading' ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-mutedText">
                    Loading security audit logs…
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-secondarySurface/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-5 text-mutedText font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    {/* Event Type */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-secondarySurface text-accentSoft border border-divider">
                        {log.eventType}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 font-medium text-primaryText whitespace-nowrap">
                      {log.actorEmail}
                    </td>

                    {/* Target Resource */}
                    <td className="py-3 px-4 text-secondaryText whitespace-nowrap">
                      {log.targetResource || '—'}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-5 text-secondaryText max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-mutedText">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-divider bg-secondarySurface/30 text-xs text-mutedText">
            <span>
              Showing {logs.length} of {totalElements} audit entries (Page {currentPage + 1} of {totalPages})
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                className="p-1 rounded bg-secondarySurface border border-divider disabled:opacity-40 hover:text-primaryText"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1 rounded bg-secondarySurface border border-divider disabled:opacity-40 hover:text-primaryText"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Surface>
    </div>
  )
}
