// src/api/receipts.js
import api from './axios'

export const receiptsApi = {
  scanReceipt: (payload) => api.post('/api/receipts/scan', payload),
  confirmReceipt: (transactionRequest) => api.post('/api/receipts/confirm', transactionRequest),
}

export default receiptsApi
