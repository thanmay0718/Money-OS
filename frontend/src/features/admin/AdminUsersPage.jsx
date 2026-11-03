// src/features/admin/AdminUsersPage.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminUsers, updateUserRole, updateUserStatus, clearActionError } from './adminSlice'
import Surface from '../../components/ui/Surface'
import Button from '../../components/ui/Button'
import {
  UsersRound,
  Search,
  UserRoundCog,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from '../../components/ui/Icons'
import { toast } from '../../lib/toast'

export default function AdminUsersPage() {
  const dispatch = useDispatch()
  const { usersPage, usersStatus, usersError, actionError } = useSelector((state) => state.admin)
  const currentUser = useSelector((state) => state.auth.user)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(0)

  // Confirmation modal state
  const [modal, setModal] = useState(null) // { type: 'ROLE' | 'STATUS', user: {...}, targetValue: ... }

  useEffect(() => {
    dispatch(fetchAdminUsers({ query: searchQuery, role: roleFilter, page: currentPage, size: 12 }))
  }, [dispatch, searchQuery, roleFilter, currentPage])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(0)
    dispatch(fetchAdminUsers({ query: searchQuery, role: roleFilter, page: 0, size: 12 }))
  }

  const handleConfirmAction = async () => {
    if (!modal) return
    dispatch(clearActionError())

    try {
      if (modal.type === 'ROLE') {
        await dispatch(updateUserRole({ id: modal.user.id, role: modal.targetValue })).unwrap()
        toast.success('Role Updated', `User role changed to ${modal.targetValue}.`)
      } else if (modal.type === 'STATUS') {
        await dispatch(updateUserStatus({ id: modal.user.id, active: modal.targetValue })).unwrap()
        toast.success('Status Updated', `User account ${modal.targetValue ? 'activated' : 'suspended'}.`)
      }
    } catch (err) {
      toast.error('Action Failed', err || 'Unable to update user.')
    }
    setModal(null)
  }

  const users = Array.isArray(usersPage)
    ? usersPage
    : Array.isArray(usersPage?.content)
    ? usersPage.content
    : []

  const totalPages = typeof usersPage?.totalPages === 'number' ? usersPage.totalPages : 1
  const totalElements = typeof usersPage?.totalElements === 'number' ? usersPage.totalElements : users.length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primaryText">User Management</h2>
          <p className="text-sm text-secondaryText mt-0.5">
            Directory of registered accounts, permission governance, and access controls
          </p>
        </div>

        <button
          onClick={() =>
            dispatch(fetchAdminUsers({ query: searchQuery, role: roleFilter, page: currentPage, size: 12 }))
          }
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondarySurface text-secondaryText hover:text-primaryText border border-divider transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-negative/30 bg-negative/10 p-4 text-xs text-negative flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => dispatch(clearActionError())}
            className="text-negative font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Surface className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by full name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondarySurface border border-divider text-xs text-primaryText placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primaryAccent"
            />
            <Search className="w-4 h-4 text-mutedText absolute left-3 top-1/2 transform -translate-y-1/2" />
          </form>

          {/* Role Filter Tabs */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            {['ALL', 'ADMIN', 'USER'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r)
                  setCurrentPage(0)
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  roleFilter === r
                    ? 'bg-primaryAccent text-primaryText shadow-subtle'
                    : 'bg-secondarySurface text-secondaryText hover:text-primaryText'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>
      </Surface>

      {/* Users Data Table */}
      <Surface className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-divider bg-secondarySurface/50 text-mutedText uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Currency</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {usersStatus === 'loading' ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-mutedText">
                    Loading user directory from database…
                  </td>
                </tr>
              ) : usersStatus === 'failed' ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="text-negative font-medium mb-1">Failed to load user directory</div>
                    <p className="text-xs text-mutedText mb-3">{usersError || 'Please verify database connection.'}</p>
                    <button
                      onClick={() =>
                        dispatch(fetchAdminUsers({ query: searchQuery, role: roleFilter, page: currentPage, size: 12 }))
                      }
                      className="px-3 py-1.5 rounded bg-primaryAccent text-primaryText text-xs font-semibold hover:bg-accentSoft transition-colors"
                    >
                      Retry Query
                    </button>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => {
                  const isCurrent = currentUser?.email?.toLowerCase() === u.email?.toLowerCase()
                  const isDeactivated = Boolean(u.deletedAt)
                  const isAdmin = u.role === 'ADMIN'

                  return (
                    <tr key={u.id} className="hover:bg-secondarySurface/30 transition-colors">
                      {/* Identity */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primaryAccent/20 border border-primaryAccent/30 flex items-center justify-center font-bold text-accentSoft text-xs shrink-0">
                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-primaryText flex items-center space-x-1.5">
                              <span>{u.fullName}</span>
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-accentSoft/20 text-accentSubtle font-medium">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-mutedText text-[11px]">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAdmin
                              ? 'bg-primaryAccent/20 text-accentSoft border border-primaryAccent/30'
                              : 'bg-secondarySurface text-secondaryText border border-divider'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            !isDeactivated
                              ? 'bg-positive/10 text-positive border border-positive/30'
                              : 'bg-negative/10 text-negative border border-negative/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              !isDeactivated ? 'bg-positive' : 'bg-negative'
                            }`}
                          />
                          <span>{!isDeactivated ? 'Active' : 'Suspended'}</span>
                        </span>
                      </td>

                      {/* Base Currency */}
                      <td className="py-3.5 px-4 font-mono text-secondaryText">
                        {u.currency || 'INR'}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-mutedText">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {/* Role Toggle */}
                          <button
                            disabled={isCurrent}
                            onClick={() =>
                              setModal({
                                type: 'ROLE',
                                user: u,
                                targetValue: isAdmin ? 'USER' : 'ADMIN',
                              })
                            }
                            className="px-2.5 py-1 rounded bg-secondarySurface text-secondaryText hover:text-primaryText hover:border-accentSoft border border-divider text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              isCurrent
                                ? 'Cannot modify your own administrator role'
                                : `Change role to ${isAdmin ? 'USER' : 'ADMIN'}`
                            }
                          >
                            {isAdmin ? 'Demote to User' : 'Promote to Admin'}
                          </button>

                          {/* Status Toggle */}
                          <button
                            disabled={isCurrent}
                            onClick={() =>
                              setModal({
                                type: 'STATUS',
                                user: u,
                                targetValue: isDeactivated, // if deactivated, target is active (true)
                              })
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${
                              isDeactivated
                                ? 'bg-positive/10 text-positive hover:bg-positive/20 border-positive/30'
                                : 'bg-negative/10 text-negative hover:bg-negative/20 border-negative/30'
                            }`}
                            title={
                              isCurrent
                                ? 'Cannot suspend your own administrator account'
                                : isDeactivated
                                ? 'Reactivate account'
                                : 'Suspend account'
                            }
                          >
                            {isDeactivated ? 'Reactivate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-mutedText">
                    No accounts found matching the criteria.
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
              Showing {users.length} of {totalElements} users (Page {currentPage + 1} of {totalPages})
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

      {/* Confirmation Dialog Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Surface className="w-full max-w-md p-6 border border-divider shadow-xl">
            <h3 className="text-lg font-semibold text-primaryText mb-2">
              {modal.type === 'ROLE'
                ? `Confirm Role Change`
                : `Confirm Account ${modal.targetValue ? 'Reactivation' : 'Suspension'}`}
            </h3>
            <p className="text-xs text-secondaryText mb-5 leading-relaxed">
              {modal.type === 'ROLE' ? (
                <>
                  Are you sure you want to change the role of{' '}
                  <strong className="text-primaryText">{modal.user.fullName}</strong> ({modal.user.email}) to{' '}
                  <strong className="text-accentSoft">{modal.targetValue}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to {modal.targetValue ? 'reactivate' : 'suspend'} the account of{' '}
                  <strong className="text-primaryText">{modal.user.fullName}</strong> ({modal.user.email})?
                  {!modal.targetValue && ' Suspended users will be immediately denied authentication.'}
                </>
              )}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-secondarySurface text-secondaryText hover:text-primaryText border border-divider"
              >
                Cancel
              </button>
              <Button
                onClick={handleConfirmAction}
                className={
                  modal.type === 'STATUS' && !modal.targetValue
                    ? 'bg-negative hover:bg-negative/80 text-primaryText text-xs'
                    : 'text-xs'
                }
              >
                Confirm Action
              </Button>
            </div>
          </Surface>
        </div>
      )}
    </div>
  )
}
