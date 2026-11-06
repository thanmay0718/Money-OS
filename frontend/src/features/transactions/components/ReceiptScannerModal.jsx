// src/features/transactions/components/ReceiptScannerModal.jsx
import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  GlassModal,
  GlassButton,
  GlassInput,
  GlassSelect,
} from '../../../components/ui/glass'
import {
  Sparkles,
  Upload,
  ImagePlus,
  CheckCircle,
  TriangleAlert,
  CalendarDays,
  Tags,
  Wallet,
  ReceiptIcon,
  ArrowRight,
  RefreshCw,
  X,
} from '../../../components/ui/Icons'
import { receiptsApi } from '../../../api/receipts'
import { fetchPockets } from '../../pockets/pocketsSlice'
import { fetchCategories } from '../../categories/categoriesSlice'
import { fetchAllTransactions } from '../transactionsSlice'
import { toast } from '../../../lib/toast'
import { formatINR } from '../../../lib/format'

export default function ReceiptScannerModal({
  isOpen,
  onClose,
  onSuccess,
  initialFile = null,
}) {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  const { list: pockets } = useSelector((state) => state.pockets)
  const { list: categories } = useSelector((state) => state.categories)

  const [selectedFile, setSelectedFile] = useState(initialFile)
  const [imagePreview, setImagePreview] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scanError, setScanError] = useState(null)

  // Extracted/editable fields
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [tax, setTax] = useState('')
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedPocketId, setSelectedPocketId] = useState('')

  useEffect(() => {
    dispatch(fetchPockets())
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    if (initialFile) {
      handleFileProcess(initialFile)
    }
  }, [initialFile])

  const handleFileProcess = (file) => {
    setSelectedFile(file)
    setScanError(null)

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      performScan(file.name, reader.result, file.type)
    }
    reader.readAsDataURL(file)
  }

  const handleSampleReceipt = (sampleName, sampleText) => {
    setImagePreview(null)
    setSelectedFile({ name: sampleName })
    performScan(sampleName, null, 'text/plain', sampleText)
  }

  const performScan = async (fileName, base64Data, mimeType, rawText = null) => {
    setIsScanning(true)
    setScanError(null)
    try {
      const response = await receiptsApi.scanReceipt({
        fileName,
        imageBase64: base64Data,
        mimeType,
        rawText,
      })

      const data = response.data
      setScanResult(data)
      setMerchant(data.merchantName || 'Store Merchant')
      setAmount(data.amount ? data.amount.toString() : '0.00')
      setTax(data.taxAmount ? data.taxAmount.toString() : '0.00')
      if (data.transactionDate) {
        setTransactionDate(data.transactionDate)
      }

      // Auto-assign category
      if (data.suggestedCategoryId) {
        setSelectedCategoryId(data.suggestedCategoryId)
      } else if (categories && categories.length > 0) {
        const found = categories.find(
          (c) =>
            c.name.toLowerCase().includes('food') ||
            c.name.toLowerCase().includes('dining') ||
            c.name.toLowerCase().includes('general')
        )
        setSelectedCategoryId(found ? found.id : categories[0].id)
      }

      // Auto-assign pocket
      if (data.suggestedPocketId) {
        setSelectedPocketId(data.suggestedPocketId)
      } else if (pockets && pockets.length > 0) {
        setSelectedPocketId(pockets[0].id)
      }
    } catch (err) {
      setScanError(
        err.response?.data?.message || err.message || 'Failed to scan receipt'
      )
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        type: 'EXPENSE',
        amount: parseFloat(amount),
        description: `${merchant} (Receipt OCR)`,
        categoryId: selectedCategoryId || null,
        fromPocketId: selectedPocketId || null,
        toPocketId: null,
        transactionDate: transactionDate,
      }

      await receiptsApi.confirmReceipt(payload)

      toast.success(
        `Recorded expense of ${formatINR(amount)} from ${merchant}! Earned +25 Coins!`
      )

      dispatch(fetchAllTransactions())
      dispatch(fetchPockets())

      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to record receipt transaction'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Receipt Scanner (Phase 4)"
    >
      <div className="space-y-6">
        {/* Top Scanner Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#C3ABFA]/15 via-white/[0.03] to-[#70D6A3]/15 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#C3ABFA]" />
            <span className="text-xs font-medium text-white">
              AI Vision & Automatic Ledger Parsing
            </span>
          </div>
          {scanResult && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#70D6A3]/15 text-[#70D6A3] border border-[#70D6A3]/30 font-bold">
              {Math.round(scanResult.confidence * 100)}% Confidence
            </span>
          )}
        </div>

        {/* Upload or Drop Zone */}
        {!selectedFile && !scanResult && (
          <div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-[#C3ABFA]/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0])
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#C3ABFA]" />
              </div>
              <p className="text-sm font-semibold text-white">
                Upload or Drop Receipt Image
              </p>
              <p className="text-xs text-[#737373] mt-1">
                PNG, JPG, WEBP, or PDF up to 10MB
              </p>
            </div>

            {/* Quick Demo Previews */}
            <div className="mt-4">
              <span className="text-[11px] font-mono text-[#737373] block mb-2 uppercase">
                Or Try Sample Receipt:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSampleReceipt('starbucks_coffee.jpg')
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs text-left text-white transition-all flex items-center gap-1.5"
                >
                  <span>☕ Starbucks</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSampleReceipt('walmart_supercenter.jpg')
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs text-left text-white transition-all flex items-center gap-1.5"
                >
                  <span>🛒 Walmart</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleReceipt('uber_ride.jpg')}
                  className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs text-left text-white transition-all flex items-center gap-1.5"
                >
                  <span>🚗 Uber Trip</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSampleReceipt('amazon_order.jpg')
                  }
                  className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-xs text-left text-white transition-all flex items-center gap-1.5"
                >
                  <span>📦 Amazon</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Animation State */}
        {isScanning && (
          <div className="p-8 text-center rounded-2xl border border-white/10 bg-white/[0.02] relative overflow-hidden">
            {/* Animated Laser Beam */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C3ABFA] to-transparent animate-pulse" />
            <RefreshCw className="w-8 h-8 text-[#C3ABFA] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">
              Parsing Receipt Fields with AI OCR…
            </p>
            <p className="text-xs text-[#737373] mt-1">
              Extracting vendor, subtotal, tax breakdown, and category mapping
            </p>
          </div>
        )}

        {/* Extracted Form & Review */}
        {scanResult && !isScanning && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Image / Items Preview */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#A3A3A3]">
                      Extracted Receipt Summary
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setScanResult(null)
                        setSelectedFile(null)
                        setImagePreview(null)
                      }}
                      className="text-xs text-[#C3ABFA] hover:underline"
                    >
                      Scan Another
                    </button>
                  </div>

                  {imagePreview ? (
                    <div className="max-h-40 overflow-hidden rounded-lg border border-white/10 mb-3">
                      <img
                        src={imagePreview}
                        alt="Receipt Preview"
                        className="w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="space-y-1.5">
                    {scanResult.detectedItems &&
                      scanResult.detectedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs font-mono text-[#D4D4D8] bg-white/[0.02] px-2 py-1 rounded-md"
                        >
                          <span className="text-[#C3ABFA]">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {scanResult.taxAmount && (
                  <div className="mt-3 pt-2 border-t border-white/[0.06] text-xs font-mono text-[#737373] flex justify-between">
                    <span>Detected Tax/GST:</span>
                    <span className="text-white">
                      {formatINR(scanResult.taxAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Editable Transaction Form */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Merchant / Store Name
                  </label>
                  <GlassInput
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                      Total Amount (₹)
                    </label>
                    <GlassInput
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                      Date
                    </label>
                    <GlassInput
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Category (Auto-Detected)
                  </label>
                  <GlassSelect
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    {categories &&
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </GlassSelect>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Paid From Pocket
                  </label>
                  <GlassSelect
                    value={selectedPocketId}
                    onChange={(e) => setSelectedPocketId(e.target.value)}
                  >
                    {pockets &&
                      pockets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatINR(p.balance)})
                        </option>
                      ))}
                  </GlassSelect>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <GlassButton type="button" variant="ghost" onClick={onClose}>
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recording…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#70D6A3]" />
                    <span>Confirm & Record Transaction</span>
                  </>
                )}
              </GlassButton>
            </div>
          </form>
        )}
      </div>
    </GlassModal>
  )
}

ReceiptScannerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialFile: PropTypes.object,
}
