import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import { useScheduleStore } from '@/stores/schedule'
import { usePaymentRecordStore } from '@/stores/paymentRecord'
import dayjs from 'dayjs'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])

  function fetchOrders() {
    ensureAllInitialized()
    orders.value = getStorage(storageKeys.ORDERS) || []
    try {
      const paymentRecordStore = usePaymentRecordStore()
      paymentRecordStore.fetchPaymentRecords()
    } catch (e) {
      console.warn('加载收款记录失败:', e)
    }
  }

  function addOrder(order) {
    const newOrder = {
      ...order,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    orders.value.push(newOrder)
    setStorage(storageKeys.ORDERS, orders.value)
    return newOrder
  }

  function updateOrder(id, data) {
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      const oldOrder = orders.value[index]
      const oldStatus = oldOrder.status

      if (data.status && data.status === 'editing' && data.status !== oldStatus) {
        const mergedOrder = { ...oldOrder, ...data }
        if (!isFinalPaymentPaid(mergedOrder)) {
          const remaining = getRemainingAmount(mergedOrder)
          return {
            success: false,
            message: `尾款未结清，剩余 ¥${remaining.toLocaleString()}，请先确认收款后再推进到精修环节`
          }
        }
      }

      orders.value[index] = { ...oldOrder, ...data }
      setStorage(storageKeys.ORDERS, orders.value)

      if (data.status && data.status !== oldStatus) {
        try {
          const scheduleStore = useScheduleStore()
          scheduleStore.updateAssignmentStatusByOrderStatus(id, data.status)
        } catch (e) {
          console.warn('同步排班状态失败:', e)
        }
      }

      return {
        success: true,
        order: orders.value[index]
      }
    }
    return {
      success: false,
      message: '订单不存在'
    }
  }

  function deleteOrder(id) {
    const index = orders.value.findIndex(o => o.id === id)
    if (index !== -1) {
      orders.value.splice(index, 1)
      setStorage(storageKeys.ORDERS, orders.value)

      try {
        const scheduleStore = useScheduleStore()
        scheduleStore.deleteAssignmentsByOrder(id)
      } catch (e) {
        console.warn('删除关联排班失败:', e)
      }

      try {
        const paymentRecordStore = usePaymentRecordStore()
        paymentRecordStore.deletePaymentRecordsByOrder(id)
      } catch (e) {
        console.warn('删除关联收款记录失败:', e)
      }

      return true
    }
    return false
  }

  function getOrderById(id) {
    return orders.value.find(o => o.id === id) || null
  }

  function getOrdersByStatus(status) {
    return orders.value.filter(o => o.status === status)
  }

  function getOrdersByDate(date) {
    return orders.value.filter(o => o.shootDate === date)
  }

  function getOrdersByMonth(year, month) {
    return orders.value.filter(o => {
      const d = dayjs(o.shootDate)
      return d.year() === year && d.month() + 1 === month
    })
  }

  function checkDateConflict(date, excludeId = null) {
    return orders.value.some(o => 
      o.shootDate === date && 
      o.id !== excludeId && 
      o.status !== 'completed' &&
      o.status !== 'cancelled'
    )
  }

  function isFinalPaymentPaid(order) {
    if (!order) return false
    const totalAmount = (order.depositAmount || 0) + (order.finalAmount || 0)
    const paidAmount = order.paidAmount || 0
    return paidAmount >= totalAmount || order.paymentStatus === 'paid'
  }

  function getRemainingAmount(order) {
    if (!order) return 0
    const totalAmount = (order.depositAmount || 0) + (order.finalAmount || 0)
    const paidAmount = order.paidAmount || 0
    return Math.max(0, totalAmount - paidAmount)
  }

  const orderCount = computed(() => orders.value.length)

  const pendingOrders = computed(() => 
    orders.value.filter(o => o.status === 'pending')
  )

  const upcomingOrders = computed(() => 
    orders.value
      .filter(o => dayjs(o.shootDate).isAfter(dayjs().subtract(1, 'day')))
      .sort((a, b) => dayjs(a.shootDate).valueOf() - dayjs(b.shootDate).valueOf())
  )

  const overduePayments = computed(() =>
    orders.value.filter(o => {
      if (o.paymentStatus !== 'paid' && o.dueDate && dayjs().isAfter(dayjs(o.dueDate), 'day')) {
        return true
      }
      return false
    })
  )

  const totalRevenue = computed(() =>
    orders.value.reduce((sum, o) => sum + (o.paidAmount || 0), 0)
  )

  const pendingRevenue = computed(() =>
    orders.value.reduce((sum, o) => {
      const total = (o.depositAmount || 0) + (o.finalAmount || 0)
      return sum + (total - (o.paidAmount || 0))
    }, 0)
  )

  function getOrdersByDateRange(startDate, endDate) {
    return orders.value.filter(o => {
      const date = dayjs(o.shootDate)
      return date.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             date.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  return {
    orders,
    orderCount,
    pendingOrders,
    upcomingOrders,
    overduePayments,
    totalRevenue,
    pendingRevenue,
    fetchOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    getOrdersByDate,
    getOrdersByMonth,
    getOrdersByDateRange,
    checkDateConflict,
    isFinalPaymentPaid,
    getRemainingAmount
  }
})
