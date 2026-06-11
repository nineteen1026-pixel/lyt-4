import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import { RETOUCH_STEPS } from '@/utils/format'
import dayjs from 'dayjs'

export const useRetouchStore = defineStore('retouch', () => {
  const batches = ref([])
  const feedbacks = ref([])

  function fetchBatches() {
    ensureAllInitialized()
    ensureRetouchInitialized()
    batches.value = getStorage(storageKeys.RETOUCH_BATCHES) || []
    feedbacks.value = getStorage(storageKeys.RETOUCH_FEEDBACKS) || []
  }

  function ensureRetouchInitialized() {
    const existing = getStorage(storageKeys.RETOUCH_BATCHES)
    if (!existing || existing.length === 0) {
      const mockBatches = generateMockBatches()
      const mockFeedbacks = generateMockFeedbacks(mockBatches)
      setStorage(storageKeys.RETOUCH_BATCHES, mockBatches)
      setStorage(storageKeys.RETOUCH_FEEDBACKS, mockFeedbacks)
    }
  }

  function generateMockBatches() {
    const orders = getStorage(storageKeys.ORDERS) || []
    const editingOrders = orders.filter(o => ['editing', 'delivering', 'completed'].includes(o.status))
    const batches = []
    const statuses = RETOUCH_STEPS.map(s => s.key)
    const priorities = ['normal', 'normal', 'normal', 'urgent', 'super_urgent']
    const retouchers = ['张修图', '李后期', '王美编', '陈设计']

    editingOrders.forEach((order, idx) => {
      const batchCount = Math.floor(Math.random() * 2) + 1
      for (let i = 0; i < batchCount; i++) {
        const statusIdx = Math.floor(Math.random() * statuses.length)
        const status = statuses[statusIdx]
        const assignedRetoucher = status !== 'waiting' ? retouchers[Math.floor(Math.random() * retouchers.length)] : null
        const photoCount = [30, 50, 60, 80, 100][Math.floor(Math.random() * 5)]
        const priority = priorities[Math.floor(Math.random() * priorities.length)]
        const baseDate = dayjs(order.shootDate)
        const sendDate = baseDate.add(3 + Math.floor(Math.random() * 7), 'day')
        let dueDate = sendDate.add(5 + Math.floor(Math.random() * 10), 'day')
        let deliveryDate = null
        if (status === 'delivered') {
          deliveryDate = dueDate.subtract(Math.floor(Math.random() * 3), 'day').format('YYYY-MM-DD')
        }
        const reworkCount = status === 'rework' || statusIdx >= 4 ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2)

        batches.push({
          id: generateId(),
          orderId: order.id,
          batchName: `${i + 1}批`,
          photoCount,
          retouchedCount: status === 'delivered' || status === 'approved' ? photoCount : Math.floor(photoCount * (0.3 + Math.random() * 0.6)),
          status,
          priority,
          assignedRetoucher,
          sendDate: sendDate.format('YYYY-MM-DD'),
          dueDate: dueDate.format('YYYY-MM-DD'),
          deliveryDate,
          reworkCount,
          remark: '',
          createdAt: new Date().toISOString()
        })
      }
    })

    return batches
  }

  function generateMockFeedbacks(batches) {
    const feedbacks = []
    const feedbackTypes = ['color', 'skin', 'body', 'background', 'composition', 'detail', 'other']
    const feedbackContents = {
      color: ['整体色调偏冷，希望调暖一些', '天空颜色不够蓝，需要加深', '肤色偏黄，需要调整白平衡'],
      skin: ['脸部皮肤需要更细腻一些', '需要增加磨皮效果', '肤色不均匀，需要修复'],
      body: ['手臂线条可以再瘦一点', '脸型需要微调', '身材比例需要优化'],
      background: ['背景杂物需要清理', '天空需要替换', '背景虚化不够明显'],
      composition: ['构图需要居中调整', '需要裁剪去掉多余部分', '水平线需要校正'],
      detail: ['头发丝需要精细处理', '服装细节需要修复', '饰品反光需要消除'],
      other: ['整体感觉还可以再调整', '希望和参考图风格一致', '部分照片需要单独处理']
    }

    batches.filter(b => b.reworkCount > 0).forEach(batch => {
      const feedbackCount = Math.min(batch.reworkCount + 1, 3)
      for (let i = 0; i < feedbackCount; i++) {
        const type = feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)]
        const content = feedbackContents[type][Math.floor(Math.random() * feedbackContents[type].length)]
        feedbacks.push({
          id: generateId(),
          batchId: batch.id,
          type,
          content,
          photoIndices: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => Math.floor(Math.random() * batch.photoCount) + 1),
          status: i < feedbackCount - 1 ? 'resolved' : 'pending',
          createdAt: dayjs(batch.sendDate).add(2 + i * 2, 'day').toISOString(),
          resolvedAt: i < feedbackCount - 1 ? dayjs(batch.sendDate).add(3 + i * 2, 'day').toISOString() : null
        })
      }
    })

    return feedbacks
  }

  function addBatch(batch) {
    const newBatch = {
      ...batch,
      id: generateId(),
      reworkCount: 0,
      retouchedCount: 0,
      createdAt: new Date().toISOString()
    }
    batches.value.push(newBatch)
    setStorage(storageKeys.RETOUCH_BATCHES, batches.value)
    return newBatch
  }

  function updateBatch(id, data) {
    const index = batches.value.findIndex(b => b.id === id)
    if (index !== -1) {
      batches.value[index] = { ...batches.value[index], ...data }
      setStorage(storageKeys.RETOUCH_BATCHES, batches.value)
      return batches.value[index]
    }
    return null
  }

  function deleteBatch(id) {
    const index = batches.value.findIndex(b => b.id === id)
    if (index !== -1) {
      batches.value.splice(index, 1)
      setStorage(storageKeys.RETOUCH_BATCHES, batches.value)
      const relatedFeedbacks = feedbacks.value.filter(f => f.batchId !== id)
      feedbacks.value = relatedFeedbacks
      setStorage(storageKeys.RETOUCH_FEEDBACKS, relatedFeedbacks)
      return true
    }
    return false
  }

  function getBatchById(id) {
    return batches.value.find(b => b.id === id) || null
  }

  function getBatchesByOrderId(orderId) {
    return batches.value.filter(b => b.orderId === orderId)
  }

  function getBatchesByStatus(status) {
    return batches.value.filter(b => b.status === status)
  }

  function getBatchesByRetoucher(retoucher) {
    return batches.value.filter(b => b.assignedRetoucher === retoucher)
  }

  function addFeedback(feedback) {
    const newFeedback = {
      ...feedback,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    }
    feedbacks.value.push(newFeedback)
    setStorage(storageKeys.RETOUCH_FEEDBACKS, feedbacks.value)

    const batch = getBatchById(feedback.batchId)
    if (batch) {
      updateBatch(feedback.batchId, {
        status: 'feedback',
        reworkCount: batch.reworkCount + 1
      })
    }

    return newFeedback
  }

  function updateFeedback(id, data) {
    const index = feedbacks.value.findIndex(f => f.id === id)
    if (index !== -1) {
      if (data.status === 'resolved' && !feedbacks.value[index].resolvedAt) {
        data.resolvedAt = new Date().toISOString()
      }
      feedbacks.value[index] = { ...feedbacks.value[index], ...data }
      setStorage(storageKeys.RETOUCH_FEEDBACKS, feedbacks.value)

      const batchId = feedbacks.value[index].batchId
      const pendingFeedbacks = feedbacks.value.filter(f => f.batchId === batchId && f.status === 'pending')
      if (pendingFeedbacks.length === 0 && data.status === 'resolved') {
        const batch = getBatchById(batchId)
        if (batch && batch.status === 'feedback') {
          updateBatch(batchId, { status: 'rework' })
        }
      }

      return feedbacks.value[index]
    }
    return null
  }

  function getFeedbacksByBatchId(batchId) {
    return feedbacks.value.filter(f => f.batchId === batchId)
  }

  function moveBatchStatus(batchId, direction) {
    const batch = getBatchById(batchId)
    if (!batch) return { success: false, message: '批次不存在' }

    const currentIdx = RETOUCH_STEPS.findIndex(s => s.key === batch.status)
    if (direction === 'next' && currentIdx < RETOUCH_STEPS.length - 1) {
      const newStatus = RETOUCH_STEPS[currentIdx + 1].key
      let data = { status: newStatus }
      if (newStatus === 'delivered') {
        data.deliveryDate = dayjs().format('YYYY-MM-DD')
      }
      updateBatch(batchId, data)
      return { success: true, message: `已移至「${RETOUCH_STEPS[currentIdx + 1].label}」` }
    }
    if (direction === 'prev' && currentIdx > 0) {
      const newStatus = RETOUCH_STEPS[currentIdx - 1].key
      let data = { status: newStatus }
      if (newStatus !== 'delivered') {
        data.deliveryDate = null
      }
      updateBatch(batchId, data)
      return { success: true, message: `已移至「${RETOUCH_STEPS[currentIdx - 1].label}」` }
    }
    return { success: false, message: '无法移动' }
  }

  const totalBatches = computed(() => batches.value.length)

  const inProgressBatches = computed(() =>
    batches.value.filter(b => ['assigned', 'reviewing', 'feedback', 'rework'].includes(b.status))
  )

  const overdueBatches = computed(() =>
    batches.value.filter(b => {
      if (['delivered'].includes(b.status)) return false
      if (!b.dueDate) return false
      return dayjs().isAfter(dayjs(b.dueDate), 'day')
    })
  )

  const highPriorityBatches = computed(() =>
    batches.value.filter(b => b.priority === 'super_urgent' && !['delivered'].includes(b.status))
  )

  const totalReworkCount = computed(() =>
    batches.value.reduce((sum, b) => sum + (b.reworkCount || 0), 0)
  )

  const avgReworkPerBatch = computed(() => {
    if (batches.value.length === 0) return 0
    return (totalReworkCount.value / batches.value.length).toFixed(2)
  })

  const retoucherWorkload = computed(() => {
    const workload = {}
    batches.value.forEach(b => {
      if (b.assignedRetoucher && !['delivered', 'waiting'].includes(b.status)) {
        if (!workload[b.assignedRetoucher]) {
          workload[b.assignedRetoucher] = { photos: 0, batches: 0 }
        }
        workload[b.assignedRetoucher].photos += b.photoCount
        workload[b.assignedRetoucher].batches += 1
      }
    })
    return workload
  })

  const monthlyDeliveryStats = computed(() => {
    const stats = {}
    batches.value.filter(b => b.deliveryDate).forEach(b => {
      const month = dayjs(b.deliveryDate).format('YYYY-MM')
      if (!stats[month]) {
        stats[month] = { batches: 0, photos: 0 }
      }
      stats[month].batches += 1
      stats[month].photos += b.photoCount
    })
    return stats
  })

  return {
    batches,
    feedbacks,
    totalBatches,
    inProgressBatches,
    overdueBatches,
    highPriorityBatches,
    totalReworkCount,
    avgReworkPerBatch,
    retoucherWorkload,
    monthlyDeliveryStats,
    fetchBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    getBatchById,
    getBatchesByOrderId,
    getBatchesByStatus,
    getBatchesByRetoucher,
    addFeedback,
    updateFeedback,
    getFeedbacksByBatchId,
    moveBatchStatus
  }
})
