import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import { useOrderStore } from '@/stores/order'
import dayjs from 'dayjs'

export const usePaymentRecordStore = defineStore('paymentRecord', () => {
  const paymentRecords = ref([])

  function fetchPaymentRecords() {
    ensureAllInitialized()
    paymentRecords.value = getStorage(storageKeys.PAYMENT_RECORDS) || []
  }

  function getPaymentRecordsByOrderId(orderId) {
    return paymentRecords.value
      .filter(r => r.orderId === orderId)
      .sort((a, b) => new Date(a.payDate) - new Date(b.payDate))
  }

  function getPaymentRecordById(id) {
    return paymentRecords.value.find(r => r.id === id) || null
  }

  function calculatePaidAmount(orderId) {
    const records = getPaymentRecordsByOrderId(orderId)
    return records.reduce((sum, r) => sum + (r.amount || 0), 0)
  }

  function calculatePaymentStatus(orderId) {
    const orderStore = useOrderStore()
    const order = orderStore.getOrderById(orderId)
    if (!order) return 'unpaid'

    const totalAmount = (order.depositAmount || 0) + (order.finalAmount || 0)
    const paidAmount = calculatePaidAmount(orderId)

    if (paidAmount >= totalAmount) return 'paid'
    if (paidAmount > 0) return 'partial'
    return 'unpaid'
  }

  function recalculateOrderPayment(orderId) {
    const orderStore = useOrderStore()
    const paidAmount = calculatePaidAmount(orderId)
    const paymentStatus = calculatePaymentStatus(orderId)

    return orderStore.updateOrder(orderId, {
      paidAmount,
      paymentStatus
    })
  }

  function addPaymentRecord(record) {
    const newRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    paymentRecords.value.push(newRecord)
    setStorage(storageKeys.PAYMENT_RECORDS, paymentRecords.value)

    recalculateOrderPayment(record.orderId)
    return newRecord
  }

  function updatePaymentRecord(id, data) {
    const index = paymentRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const oldRecord = paymentRecords.value[index]
      paymentRecords.value[index] = { ...oldRecord, ...data }
      setStorage(storageKeys.PAYMENT_RECORDS, paymentRecords.value)

      recalculateOrderPayment(oldRecord.orderId)
      return {
        success: true,
        record: paymentRecords.value[index]
      }
    }
    return {
      success: false,
      message: '收款记录不存在'
    }
  }

  function deletePaymentRecord(id) {
    const index = paymentRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = paymentRecords.value[index]
      paymentRecords.value.splice(index, 1)
      setStorage(storageKeys.PAYMENT_RECORDS, paymentRecords.value)

      recalculateOrderPayment(record.orderId)
      return true
    }
    return false
  }

  function deletePaymentRecordsByOrder(orderId) {
    const records = getPaymentRecordsByOrderId(orderId)
    records.forEach(r => {
      const index = paymentRecords.value.findIndex(pr => pr.id === r.id)
      if (index !== -1) {
        paymentRecords.value.splice(index, 1)
      }
    })
    setStorage(storageKeys.PAYMENT_RECORDS, paymentRecords.value)
    return true
  }

  function migrateExistingPayments() {
    const orderStore = useOrderStore()
    const orders = orderStore.orders

    orders.forEach(order => {
      const existingRecords = getPaymentRecordsByOrderId(order.id)
      if (existingRecords.length === 0 && order.paidAmount > 0) {
        addPaymentRecord({
          orderId: order.id,
          amount: order.paidAmount,
          payDate: dayjs(order.createdAt).format('YYYY-MM-DD'),
          paymentMethod: 'other',
          remark: '历史收款数据迁移'
        })
      }
    })
  }

  const totalPaymentAmount = computed(() =>
    paymentRecords.value.reduce((sum, r) => sum + (r.amount || 0), 0)
  )

  const paymentRecordCount = computed(() => paymentRecords.value.length)

  function getPaymentRecordsByDateRange(startDate, endDate) {
    return paymentRecords.value.filter(r => {
      const date = dayjs(r.payDate)
      return date.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             date.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  return {
    paymentRecords,
    totalPaymentAmount,
    paymentRecordCount,
    fetchPaymentRecords,
    getPaymentRecordsByOrderId,
    getPaymentRecordById,
    calculatePaidAmount,
    calculatePaymentStatus,
    addPaymentRecord,
    updatePaymentRecord,
    deletePaymentRecord,
    deletePaymentRecordsByOrder,
    migrateExistingPayments,
    getPaymentRecordsByDateRange
  }
})
