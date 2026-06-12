import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import dayjs from 'dayjs'

export const communicationTypeOptions = [
  { value: 'phone', label: '电话沟通', icon: 'call-outline' },
  { value: 'wechat', label: '微信沟通', icon: 'chatbox-outline' },
  { value: 'meeting', label: '面谈沟通', icon: 'people-circle-outline' },
  { value: 'video', label: '视频会议', icon: 'videocam-outline' },
  { value: 'sms', label: '短信沟通', icon: 'chatbubble-outline' },
  { value: 'email', label: '邮件沟通', icon: 'mail-outline' },
  { value: 'other', label: '其他方式', icon: 'ellipsis-horizontal-outline' }
]

export const followUpNodeOptions = [
  { value: 'initial_contact', label: '初次接触', color: '#18a058' },
  { value: 'demand_confirm', label: '需求确认', color: '#2080f0' },
  { value: 'quotation', label: '方案报价', color: '#f0a020' },
  { value: 'negotiation', label: '商务谈判', color: '#722ed1' },
  { value: 'site_visit', label: '探店看样', color: '#13c2c2' },
  { value: 'contract_sign', label: '签订合同', color: '#52c41a' },
  { value: 'deposit_paid', label: '支付定金', color: '#faad14' },
  { value: 'pre_wedding', label: '婚前沟通', color: '#eb2f96' },
  { value: 'shoot_day', label: '拍摄当天', color: '#f5222d' },
  { value: 'select_photos', label: '选片阶段', color: '#2f54eb' },
  { value: 'retouch_feedback', label: '精修反馈', color: '#fa8c16' },
  { value: 'delivery', label: '成品交付', color: '#a0d911' },
  { value: 'after_sales', label: '售后回访', color: '#597ef7' },
  { value: 'referral', label: '转介绍', color: '#ff4d4f' }
]

export const noteCategoryOptions = [
  { value: 'demand', label: '客户需求', color: '#18a058' },
  { value: 'preference', label: '风格偏好', color: '#2080f0' },
  { value: 'budget', label: '预算信息', color: '#f0a020' },
  { value: 'constraint', label: '约束条件', color: '#d03050' },
  { value: 'important', label: '重要事项', color: '#722ed1' },
  { value: 'family', label: '家庭信息', color: '#13c2c2' },
  { value: 'other', label: '其他备注', color: '#8c8c8c' }
]

export const transferStatusOptions = [
  { value: 'pending', label: '待处理', color: '#f0a020', type: 'warning' },
  { value: 'processing', label: '处理中', color: '#2080f0', type: 'info' },
  { value: 'completed', label: '已完成', color: '#18a058', type: 'success' },
  { value: 'cancelled', label: '已取消', color: '#d03050', type: 'error' }
]

export const priorityOptions = [
  { value: 'high', label: '高优先级', color: '#f5222d' },
  { value: 'medium', label: '中优先级', color: '#faad14' },
  { value: 'low', label: '低优先级', color: '#52c41a' }
]

function getNodeColor(node) {
  const found = followUpNodeOptions.find(o => o.value === node)
  return found ? found.color : '#8c8c8c'
}

function getNoteCategoryColor(category) {
  const found = noteCategoryOptions.find(o => o.value === category)
  return found ? found.color : '#8c8c8c'
}

export const useCommunicationStore = defineStore('communication', () => {
  const communications = ref([])

  function fetchCommunications() {
    ensureAllInitialized()
    communications.value = getStorage(storageKeys.COMMUNICATIONS) || []
  }

  function addCommunication(communication) {
    const newCommunication = {
      ...communication,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    communications.value.unshift(newCommunication)
    setStorage(storageKeys.COMMUNICATIONS, communications.value)
    return newCommunication
  }

  function updateCommunication(id, data) {
    const index = communications.value.findIndex(c => c.id === id)
    if (index !== -1) {
      communications.value[index] = {
        ...communications.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      setStorage(storageKeys.COMMUNICATIONS, communications.value)
      return communications.value[index]
    }
    return null
  }

  function deleteCommunication(id) {
    const index = communications.value.findIndex(c => c.id === id)
    if (index !== -1) {
      communications.value.splice(index, 1)
      setStorage(storageKeys.COMMUNICATIONS, communications.value)
      return true
    }
    return false
  }

  function getCommunicationById(id) {
    return communications.value.find(c => c.id === id) || null
  }

  function getCommunicationsByCustomer(customerId) {
    return communications.value.filter(c => c.customerId === customerId)
  }

  function getCommunicationsByType(type) {
    return communications.value.filter(c => c.type === type)
  }

  function getFollowUpsByCustomer(customerId) {
    return communications.value
      .filter(c => c.customerId === customerId && c.category === 'follow_up')
      .sort((a, b) => dayjs(b.communicationTime).valueOf() - dayjs(a.communicationTime).valueOf())
  }

  function getNotesByCustomer(customerId) {
    return communications.value
      .filter(c => c.customerId === customerId && c.category === 'note')
      .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf())
  }

  function getTransfersByCustomer(customerId) {
    return communications.value
      .filter(c => c.customerId === customerId && c.category === 'transfer')
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
  }

  function addFollowUpRecord(followUp) {
    return addCommunication({
      ...followUp,
      category: 'follow_up'
    })
  }

  function addNoteRecord(note) {
    return addCommunication({
      ...note,
      category: 'note'
    })
  }

  function addTransferRecord(transfer) {
    return addCommunication({
      ...transfer,
      category: 'transfer',
      transferStatus: transfer.transferStatus || 'pending'
    })
  }

  function updateTransferStatus(transferId, status, handlerNote = '') {
    const transfer = getCommunicationById(transferId)
    if (!transfer || transfer.category !== 'transfer') return null

    const statusLogs = transfer.statusLogs || []
    statusLogs.push({
      id: generateId(),
      fromStatus: transfer.transferStatus,
      toStatus: status,
      handlerNote,
      operatedAt: new Date().toISOString()
    })

    return updateCommunication(transferId, {
      transferStatus: status,
      statusLogs,
      handlerNote: handlerNote || transfer.handlerNote
    })
  }

  function searchCommunications(keyword) {
    if (!keyword) return communications.value
    const kw = keyword.toLowerCase()
    return communications.value.filter(c =>
      (c.content && c.content.toLowerCase().includes(kw)) ||
      (c.title && c.title.toLowerCase().includes(kw)) ||
      (c.summary && c.summary.toLowerCase().includes(kw)) ||
      (c.operator && c.operator.toLowerCase().includes(kw))
    )
  }

  function getFilteredCommunications({ customerId, category, type, nodeType, noteCategory, transferStatus, startDate, endDate, keyword } = {}) {
    let result = communications.value

    if (customerId) {
      result = result.filter(c => c.customerId === customerId)
    }
    if (category) {
      result = result.filter(c => c.category === category)
    }
    if (type) {
      result = result.filter(c => c.type === type)
    }
    if (nodeType) {
      result = result.filter(c => c.nodeType === nodeType)
    }
    if (noteCategory) {
      result = result.filter(c => c.noteCategory === noteCategory)
    }
    if (transferStatus) {
      result = result.filter(c => c.transferStatus === transferStatus)
    }
    if (startDate) {
      const startTs = dayjs(startDate).startOf('day').valueOf()
      result = result.filter(c => dayjs(c.communicationTime || c.createdAt).valueOf() >= startTs)
    }
    if (endDate) {
      const endTs = dayjs(endDate).endOf('day').valueOf()
      result = result.filter(c => dayjs(c.communicationTime || c.createdAt).valueOf() <= endTs)
    }
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(c =>
        (c.content && c.content.toLowerCase().includes(kw)) ||
        (c.title && c.title.toLowerCase().includes(kw)) ||
        (c.summary && c.summary.toLowerCase().includes(kw))
      )
    }

    return result.sort((a, b) => {
      const aTime = dayjs(a.communicationTime || a.createdAt).valueOf()
      const bTime = dayjs(b.communicationTime || b.createdAt).valueOf()
      return bTime - aTime
    })
  }

  const followUpCount = computed(() =>
    communications.value.filter(c => c.category === 'follow_up').length
  )

  const noteCount = computed(() =>
    communications.value.filter(c => c.category === 'note').length
  )

  const pendingTransferCount = computed(() =>
    communications.value.filter(c => c.category === 'transfer' && c.transferStatus === 'pending').length
  )

  const todayCommunicationCount = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return communications.value.filter(c => {
      const time = c.communicationTime || c.createdAt
      return dayjs(time).format('YYYY-MM-DD') === today
    }).length
  })

  const upcomingFollowUps = computed(() => {
    const now = dayjs()
    return communications.value
      .filter(c => {
        if (c.category !== 'follow_up') return false
        if (!c.nextFollowUpTime) return false
        const nextTs = dayjs(c.nextFollowUpTime)
        return nextTs.isAfter(now) && nextTs.isBefore(now.add(7, 'day'))
      })
      .sort((a, b) => dayjs(a.nextFollowUpTime).valueOf() - dayjs(b.nextFollowUpTime).valueOf())
  })

  function getStatisticsByDateRange(startDate, endDate) {
    const startTs = dayjs(startDate).startOf('day').valueOf()
    const endTs = dayjs(endDate).endOf('day').valueOf()

    const inRange = communications.value.filter(c => {
      const time = dayjs(c.communicationTime || c.createdAt).valueOf()
      return time >= startTs && time <= endTs
    })

    return {
      total: inRange.length,
      followUps: inRange.filter(c => c.category === 'follow_up').length,
      notes: inRange.filter(c => c.category === 'note').length,
      transfers: inRange.filter(c => c.category === 'transfer').length,
      byType: communicationTypeOptions.map(opt => ({
        ...opt,
        count: inRange.filter(c => c.type === opt.value).length
      })),
      byNode: followUpNodeOptions.map(opt => ({
        ...opt,
        count: inRange.filter(c => c.nodeType === opt.value).length
      }))
    }
  }

  return {
    communications,
    followUpCount,
    noteCount,
    pendingTransferCount,
    todayCommunicationCount,
    upcomingFollowUps,
    fetchCommunications,
    addCommunication,
    updateCommunication,
    deleteCommunication,
    getCommunicationById,
    getCommunicationsByCustomer,
    getCommunicationsByType,
    getFollowUpsByCustomer,
    getNotesByCustomer,
    getTransfersByCustomer,
    addFollowUpRecord,
    addNoteRecord,
    addTransferRecord,
    updateTransferStatus,
    searchCommunications,
    getFilteredCommunications,
    getStatisticsByDateRange,
    getNodeColor,
    getNoteCategoryColor
  }
})
