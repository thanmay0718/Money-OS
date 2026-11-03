// src/features/pockets/PocketForm.jsx
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createPocket } from './pocketsSlice'
import { GlassSurface, GlassButton, GlassInput } from '../../components/ui/glass'
import { toast } from '../../lib/toast'

export default function PocketForm() {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('loading')
    const pocketName = name.trim()
    try {
      await dispatch(createPocket({ name: pocketName })).unwrap()
      setStatus('succeeded')
      setName('')
      toast.success(`"${pocketName}" pocket created.`, 'Your funds can now be allocated to this pocket.')
    } catch (err) {
      setStatus('failed')
      toast.error("Couldn't create pocket.", err?.message || 'Please try again.')
    }
  }

  return (
    <GlassSurface className="p-6">
      <h2 className="text-base font-semibold text-white tracking-tight mb-1">Create Money Pocket</h2>
      <p className="text-xs text-[#A3A3A3] mb-4">
        Pockets represent distinct allocation pools for organizing your funds (e.g. Daily Spending, Savings, Emergency Reserve).
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
        <GlassInput
          label="Pocket Name"
          placeholder="e.g. Emergency Reserve, Rent, Daily Spending"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          containerClassName="flex-1 w-full"
          required
        />
        <GlassButton
          type="submit"
          variant="primary"
          loading={status === 'loading'}
          className="w-full sm:w-auto h-11"
        >
          Create Pocket
        </GlassButton>
      </form>
    </GlassSurface>
  )
}
