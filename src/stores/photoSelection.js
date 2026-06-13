import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import { PHOTO_SELECTION_STATUS, PRODUCTION_STATUS, PAYMENT_STATUS } from '@/utils/format'
import { useOrderStore } from '@/stores/order'
import { usePackageStore } from '@/stores/package'
import { useCustomerStore } from '@/stores/customer'
import dayjs from 'dayjs'

export const usePhotoSelectionStore = defineStore('photoSelection', () => {
  const selections = ref([])

  function fetchSelections() {
    ensureAllInitialized()
    ensurePhotoSelectionInitialized()
    selections.value = getStorage(storageKeys.PHOTO_SELECTIONS) || []
  }

  function ensurePhotoSelectionInitialized() {
    const existing = getStorage(storageKeys.PHOTO_SELECTIONS)
    if (!existing || existing.length === 0) {
      const mockSelections = generateMockSelections()
      setStorage(storageKeys.PHOTO_SELECTIONS, mockSelections)
    }
  }

  function generateMockSelections() {
    const orders = getStorage(storageKeys.ORDERS) || []
    const packages = getStorage(storageKeys.PACKAGES) || []
    const pkgMap = Object.fromEntries(packages.map(p => [p.id, p]))
    const mockList = []

    const mockData = [
      { orderIdx: 0, refinedExtra: 12, extraAmount: 1200, extraPaid: 1200, selectionStatus: 'confirmed', productionStatus: 'completed', selectionDate: '2026-03-12', remark: '客户很满意，多加了12张精修做相册' },
      { orderIdx: 1, refinedExtra: 0, extraAmount: 0, extraPaid: 0, selectionStatus: 'selecting', productionStatus: 'waiting', selectionDate: '2026-04-28', remark: '客户正在选片中' },
      { orderIdx: 5, refinedExtra: 30, extraAmount: 4500, extraPaid: 2000, selectionStatus: 'selected', productionStatus: 'retouching', selectionDate: '2026-03-05', remark: '加了30张做两本相册，先付了部分加片费' },
      { orderIdx: 6, refinedExtra: 20, extraAmount: 3000, extraPaid: 3000, selectionStatus: 'confirmed', productionStatus: 'designing', selectionDate: '2026-05-05', remark: '五一期间拍的，加急处理' }
    ]

    mockData.forEach((m, idx) => {
      const order = orders[m.orderIdx]
      if (!order) return
      const pkg = pkgMap[order.packageId]
      const baseRefined = pkg?.refinedCount || 50

      mockList.push({
        id: 'ps_' + (idx + 1).toString().padStart(3, '0'),
        orderId: order.id,
        customerId: order.customerId,
        baseRefinedCount: baseRefined,
        refinedExtraCount: m.refinedExtra,
        totalRefinedCount: baseRefined + m.refinedExtra,
        extraPhotoAmount: m.extraAmount,
        extraPaidAmount: m.extraPaid,
        extraPaymentStatus: m.extraAmount === 0 ? 'paid' : (m.extraPaid >= m.extraAmount ? 'paid' : (m.extraPaid > 0 ? 'partial' : 'unpaid')),
        selectionStatus: m.selectionStatus,
        productionStatus: m.productionStatus,
        selectionDate: m.selectionDate,
        remark: m.remark,
        extraPaymentRecords: m.extraPaid > 0 ? [{
          id: 'epr_' + (idx + 1),
          amount: m.extraPaid,
          payDate: m.selectionDate,
          paymentMethod: idx % 2 === 0 ? 'wechat' : 'alipay',
          remark: '选片时支付'
        }] : [],
        createdAt: order.createdAt
      })
    })

    return mockList
  }

  function getSelectionById(id) {
    return selections.value.find(s => s.id === id) || null
  }

  function getSelectionByOrderId(orderId) {
    return selections.value.find(s => s.orderId === orderId) || null
  }

  function getSelectionsByCustomerId(customerId) {
    return selections.value.filter(s => s.customerId === customerId)
  }

  function addSelection(data) {
    const orderStore = useOrderStore()
    const packageStore = usePackageStore()
    const order = orderStore.getOrderById(data.orderId)
    if (!order) return null

    const pkg = packageStore.getPackageById(order.packageId)
    const baseRefined = pkg?.refinedCount || 50
    const refinedExtra = Number(data.refinedExtraCount) || 0
    const extraAmount = Number(data.extraPhotoAmount) || 0
    const extraPaid = Number(data.extraPaidAmount) || 0

    const newSelection = {
      ...data,
      id: generateId(),
      customerId: order.customerId,
      baseRefinedCount: baseRefined,
      totalRefinedCount: baseRefined + refinedExtra,
      refinedExtraCount: refinedExtra,
      extraPhotoAmount: extraAmount,
      extraPaidAmount: extraPaid,
      extraPaymentStatus: extraAmount === 0 ? 'paid' : (extraPaid >= extraAmount ? 'paid' : (extraPaid > 0 ? 'partial' : 'unpaid')),
      selectionStatus: data.selectionStatus || 'selecting',
      productionStatus: data.productionStatus || 'waiting',
      selectionDate: data.selectionDate || dayjs().format('YYYY-MM-DD'),
      extraPaymentRecords: [],
      createdAt: new Date().toISOString()
    }

    if (extraPaid > 0) {
      newSelection.extraPaymentRecords.push({
        id: generateId(),
        amount: extraPaid,
        payDate: data.selectionDate || dayjs().format('YYYY-MM-DD'),
        paymentMethod: data.firstPaymentMethod || 'wechat',
        remark: '选片时支付'
      })
    }

    selections.value.push(newSelection)
    setStorage(storageKeys.PHOTO_SELECTIONS, selections.value)

    if (order.status === 'selecting' && (newSelection.selectionStatus === 'selected' || newSelection.selectionStatus === 'confirmed')) {
      orderStore.updateOrder(order.id, { status: 'editing' })
    }

    return newSelection
  }

  function updateSelection(id, data) {
    const index = selections.value.findIndex(s => s.id === id)
    if (index === -1) return { success: false, message: '选片记录不存在' }

    const old = selections.value[index]
    const updated = { ...old, ...data }

    if (data.refinedExtraCount !== undefined) {
      updated.totalRefinedCount = old.baseRefinedCount + Number(data.refinedExtraCount)
    }
    if (data.extraPhotoAmount !== undefined || data.extraPaidAmount !== undefined) {
      const extraAmount = updated.extraPhotoAmount
      const extraPaid = updated.extraPaidAmount
      if (extraAmount === 0) {
        updated.extraPaymentStatus = 'paid'
      } else if (extraPaid >= extraAmount) {
        updated.extraPaymentStatus = 'paid'
      } else if (extraPaid > 0) {
        updated.extraPaymentStatus = 'partial'
      } else {
        updated.extraPaymentStatus = 'unpaid'
      }
    }

    selections.value[index] = updated
    setStorage(storageKeys.PHOTO_SELECTIONS, selections.value)

    if (data.productionStatus && data.productionStatus === 'completed') {
      const orderStore = useOrderStore()
      const order = orderStore.getOrderById(old.orderId)
      if (order && order.status === 'editing') {
        orderStore.updateOrder(old.orderId, { status: 'delivering' })
      }
    }

    return { success: true, selection: updated }
  }

  function deleteSelection(id) {
    const index = selections.value.findIndex(s => s.id === id)
    if (index === -1) return false
    selections.value.splice(index, 1)
    setStorage(storageKeys.PHOTO_SELECTIONS, selections.value)
    return true
  }

  function addExtraPayment(selectionId, payment) {
    const selection = getSelectionById(selectionId)
    if (!selection) return { success: false, message: '选片记录不存在' }

    const newRecord = {
      ...payment,
      id: generateId(),
      payDate: payment.payDate || dayjs().format('YYYY-MM-DD')
    }

    selection.extraPaymentRecords = selection.extraPaymentRecords || []
    selection.extraPaymentRecords.push(newRecord)
    selection.extraPaidAmount = (selection.extraPaidAmount || 0) + Number(payment.amount)

    if (selection.extraPaidAmount >= selection.extraPhotoAmount) {
      selection.extraPaymentStatus = 'paid'
    } else if (selection.extraPaidAmount > 0) {
      selection.extraPaymentStatus = 'partial'
    }

    setStorage(storageKeys.PHOTO_SELECTIONS, selections.value)
    return { success: true, record: newRecord }
  }

  function updateExtraPayment(selectionId, recordId, data) {
    const selection = getSelectionById(selectionId)
    if (!selection) return { success: false, message: '选片记录不存在' }

    const records = selection.extraPaymentRecords || []
    const idx = records.findIndex(r => r.id === recordId)
    if (idx === -1) return { success: false, message: '付款记录不存在' }

    const oldAmount = records[idx].amount || 0
    records[idx] = { ...records[idx], ...data }
    const newAmount = records[idx].amount || 0

    selection.extraPaidAmount = (selection.extraPaidAmount || 0) - oldAmount + newAmount

    if (selection.extraPaidAmount >= selection.extraPhotoAmount) {
      selection.extraPaymentStatus = 'paid'
    } else if (selection.extraPaidAmount > 0) {
      selection.extraPaymentStatus = 'partial'
    } else {
      selection.extraPaymentStatus = 'unpaid'
    }

    setStorage(storageKeys.PHOTO_SELECTIONS, selections.value)
    return { success: true, record: records[idx] }
  }

  function deleteExtraPayment(selectionId, recordId) {
    const selection = getSelectionById(selectionId)
    if (!selection) return false

    const records = selection.extraPaymentRecords || []
    const idx = records.findIndex(r => r.id === recordId)
    if (idx === -1) return false

    const amount = records[idx].amount || 0
    records.splice(idx, 1)
    selection.extraPaidAmount = Math.max(0, (selection.extraPaidAmount || 0) - amount)

    if (selection.extraPaidAmount >= selection.extraPhotoAmount) {
      selection.extraPaymentStatus = 'paid'
    } else if (selection.extraPaidAmount > 0) {
      selection.extraPaymentStatus = 'partial'
    } else {
      selection.extraPaymentStatus = 'unpaid'
    }

    setStorage(storageKeys.PHOTO_SELECTIONS, selections.value)
    return true
  }

  const totalSelections = computed(() => selections.value.length)

  const totalExtraAmount = computed(() =>
    selections.value.reduce((sum, s) => sum + (s.extraPhotoAmount || 0), 0)
  )

  const totalExtraPaid = computed(() =>
    selections.value.reduce((sum, s) => sum + (s.extraPaidAmount || 0), 0)
  )

  const totalRefinedPhotos = computed(() =>
    selections.value.reduce((sum, s) => sum + (s.totalRefinedCount || 0), 0)
  )

  const pendingProductionCount = computed(() =>
    selections.value.filter(s => s.productionStatus !== 'completed').length
  )

  function getSelectionsByProductionStatus(status) {
    if (!status) return selections.value
    return selections.value.filter(s => s.productionStatus === status)
  }

  function getSelectionsBySelectionStatus(status) {
    if (!status) return selections.value
    return selections.value.filter(s => s.selectionStatus === status)
  }

  function getSelectionCustomerName(selection) {
    if (!selection) return '-'
    const customerStore = useCustomerStore()
    const customer = customerStore.getCustomerById(selection.customerId)
    return customer ? customer.name : '未知客户'
  }

  function getSelectionOrderInfo(selection) {
    if (!selection) return null
    const orderStore = useOrderStore()
    return orderStore.getOrderById(selection.orderId)
  }

  function getSelectionPackageInfo(selection) {
    if (!selection) return null
    const order = getSelectionOrderInfo(selection)
    if (!order) return null
    const packageStore = usePackageStore()
    return packageStore.getPackageById(order.packageId)
  }

  return {
    selections,
    totalSelections,
    totalExtraAmount,
    totalExtraPaid,
    totalRefinedPhotos,
    pendingProductionCount,
    fetchSelections,
    getSelectionById,
    getSelectionByOrderId,
    getSelectionsByCustomerId,
    addSelection,
    updateSelection,
    deleteSelection,
    addExtraPayment,
    updateExtraPayment,
    deleteExtraPayment,
    getSelectionsByProductionStatus,
    getSelectionsBySelectionStatus,
    getSelectionCustomerName,
    getSelectionOrderInfo,
    getSelectionPackageInfo
  }
})
