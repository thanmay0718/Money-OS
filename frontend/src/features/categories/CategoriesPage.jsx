// src/features/categories/CategoriesPage.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  GlassSurface,
  GlassButton,
  GlassInput,
  GlassSelect,
  GlassBadge,
  GlassSegmentedControl,
} from '../../components/ui/glass'
import { Tags, TrendingUp, TrendingDown, Plus } from '../../components/ui/Icons'
import { toast } from '../../lib/toast'
import { fetchCategories, createCategory } from './categoriesSlice'

export default function CategoriesPage() {
  const dispatch = useDispatch()
  const { list: categories, status, error } = useSelector((state) => state.categories)

  const [activeTab, setActiveTab] = useState('ALL') // 'ALL' | 'INCOME' | 'EXPENSE'
  const [name, setName] = useState('')
  const [type, setType] = useState('EXPENSE')
  const [createStatus, setCreateStatus] = useState('idle')

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setCreateStatus('loading')
    const catName = name.trim()
    try {
      await dispatch(createCategory({ name: catName, type })).unwrap()
      setName('')
      setCreateStatus('succeeded')
      toast.success(`Category "${catName}" created.`, `Added to ${type.toLowerCase()} categories.`)
    } catch (err) {
      setCreateStatus('failed')
      toast.error("Couldn't create category.", err?.message || 'Please try again.')
    }
  }

  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'ALL') return true
    return c.type === activeTab
  })

  const tabOptions = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'EXPENSE', label: 'Expense Categories' },
    { value: 'INCOME', label: 'Income Categories' },
  ]

  const typeOptions = [
    { value: 'EXPENSE', label: 'Expense Category' },
    { value: 'INCOME', label: 'Income Category' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Categories</h1>
        <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
          Organize your income streams and expense tracking
        </p>
      </div>

      {/* Category Creation Form */}
      <GlassSurface className="p-6">
        <h2 className="text-base font-semibold text-white tracking-tight mb-1">Create Category</h2>
        <p className="text-xs text-[#A3A3A3] mb-4">
          Add custom classifications for income sources and expense classifications.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <GlassInput
            id="catName"
            label="Name"
            required
            maxLength={80}
            placeholder="e.g. Groceries, Dividends, Rent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <GlassSelect
            id="catType"
            label="Category Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={typeOptions}
          />

          <div>
            <GlassButton
              type="submit"
              variant="primary"
              loading={createStatus === 'loading'}
              className="w-full h-11"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Category
            </GlassButton>
          </div>
        </form>
      </GlassSurface>

      {/* Categories List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <GlassSegmentedControl
            options={tabOptions}
            value={activeTab}
            onChange={setActiveTab}
            size="md"
          />
          <span className="text-xs text-[#A3A3A3] font-medium">
            {filteredCategories.length} Categories
          </span>
        </div>

        <GlassSurface className="p-0 overflow-hidden">
          {status === 'loading' && (!categories || categories.length === 0) && (
            <div className="p-8 text-center text-[#A3A3A3] text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-[#C3ABFA] border-t-transparent animate-spin mx-auto mb-2" />
              <p>Loading categories…</p>
            </div>
          )}

          {status === 'failed' && (
            <p className="p-6 text-center text-[#F07891] text-sm">Failed to load: {error}</p>
          )}

          {status !== 'loading' && filteredCategories.length > 0 ? (
            <ul className="divide-y divide-[#292929]">
              {filteredCategories.map((c) => {
                const isExpense = c.type === 'EXPENSE'
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          isExpense
                            ? 'bg-[#F07891]/15 border-[#F07891]/30 text-[#F07891]'
                            : 'bg-[#70D6A3]/15 border-[#70D6A3]/30 text-[#70D6A3]'
                        }`}
                      >
                        {isExpense ? (
                          <TrendingDown className="w-4 h-4 text-[#F07891]" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-[#70D6A3]" />
                        )}
                      </div>
                      <span className="font-semibold text-sm text-[#FAFAFA]">{c.name}</span>
                    </div>

                    <GlassBadge variant={isExpense ? 'negative' : 'positive'} size="sm">
                      {c.type}
                    </GlassBadge>
                  </li>
                )
              })}
            </ul>
          ) : status !== 'loading' ? (
            <div className="p-8 text-center text-[#A3A3A3]">
              <Tags className="w-8 h-8 mx-auto mb-2 text-[#737373]" />
              <p className="text-sm font-medium text-[#FAFAFA]">No categories found</p>
              <p className="text-xs text-[#737373] mt-1">
                Add a category using the form above to organize your records.
              </p>
            </div>
          ) : null}
        </GlassSurface>
      </section>
    </div>
  )
}
