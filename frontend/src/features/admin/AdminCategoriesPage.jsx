// src/features/admin/AdminCategoriesPage.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminCategories } from './adminSlice'
import Surface from '../../components/ui/Surface'
import { Tags, Search, RefreshCw } from '../../components/ui/Icons'

export default function AdminCategoriesPage() {
  const dispatch = useDispatch()
  const { categories, categoriesStatus, categoriesError } = useSelector((state) => state.admin)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  useEffect(() => {
    dispatch(fetchAdminCategories())
  }, [dispatch])

  const filteredCategories = categories.filter((c) => {
    if (typeFilter !== 'ALL' && c.type !== typeFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.ownerEmail?.toLowerCase().includes(q) ||
      c.ownerName?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primaryText">Category Directory</h2>
          <p className="text-sm text-secondaryText mt-0.5">
            System-wide classification taxonomies governing personal income streams and expense categories
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchAdminCategories())}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondarySurface text-secondaryText hover:text-primaryText border border-divider transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Taxonomies</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Surface className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by category name or owner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondarySurface border border-divider text-xs text-primaryText placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primaryAccent"
            />
            <Search className="w-4 h-4 text-mutedText absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            {['ALL', 'INCOME', 'EXPENSE'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  typeFilter === t
                    ? 'bg-primaryAccent text-primaryText shadow-subtle'
                    : 'bg-secondarySurface text-secondaryText hover:text-primaryText'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </Surface>

      {/* Categories Table */}
      <Surface className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-divider bg-secondarySurface/50 text-mutedText uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Category Name</th>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4">Owner Profile</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {categoriesStatus === 'loading' ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-mutedText">
                    Loading categories from database…
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-secondarySurface/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded bg-primaryAccent/10 text-primaryAccent">
                          <Tags className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-primaryText text-sm">{cat.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          cat.type === 'INCOME'
                            ? 'bg-positive/10 text-positive border border-positive/30'
                            : 'bg-negative/10 text-negative border border-negative/30'
                        }`}
                      >
                        {cat.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-primaryText">{cat.ownerName || 'System'}</p>
                        <p className="text-[11px] text-mutedText">{cat.ownerEmail}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-positive/10 text-positive border border-positive/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                        <span>Active</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right text-mutedText">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-mutedText">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Surface>
    </div>
  )
}
