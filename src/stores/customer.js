import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'

export const sourceOptions = [
  { value: 'referral', label: '朋友介绍' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'douyin', label: '抖音' },
  { value: 'dianping', label: '大众点评' },
  { value: 'official', label: '官网' },
  { value: 'offline', label: '线下活动' },
  { value: 'other', label: '其他' }
]

export const followUpTypeOptions = [
  { value: 'phone', label: '电话' },
  { value: 'wechat', label: '微信' },
  { value: 'meeting', label: '面谈' },
  { value: 'other', label: '其他' }
]

export const progressTypeOptions = [
  { value: 'status_change', label: '进度变更' }
]

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])

  function fetchCustomers() {
    ensureAllInitialized()
    customers.value = getStorage(storageKeys.CUSTOMERS) || []
  }

  function addCustomer(customer) {
    const newCustomer = {
      ...customer,
      id: generateId(),
      followUpRecords: customer.followUpRecords || [],
      createdAt: new Date().toISOString()
    }
    customers.value.push(newCustomer)
    setStorage(storageKeys.CUSTOMERS, customers.value)
    return newCustomer
  }

  function updateCustomer(id, data) {
    const index = customers.value.findIndex(c => c.id === id)
    if (index !== -1) {
      customers.value[index] = { ...customers.value[index], ...data }
      setStorage(storageKeys.CUSTOMERS, customers.value)
      return customers.value[index]
    }
    return null
  }

  function deleteCustomer(id) {
    const index = customers.value.findIndex(c => c.id === id)
    if (index !== -1) {
      customers.value.splice(index, 1)
      setStorage(storageKeys.CUSTOMERS, customers.value)
      return true
    }
    return false
  }

  function getCustomerById(id) {
    return customers.value.find(c => c.id === id) || null
  }

  function addFollowUpRecord(customerId, record) {
    const customer = getCustomerById(customerId)
    if (!customer) return null

    const newRecord = {
      ...record,
      id: generateId(),
      category: 'follow_up',
      createdAt: new Date().toISOString()
    }

    const followUpRecords = customer.followUpRecords || []
    followUpRecords.unshift(newRecord)

    return updateCustomer(customerId, { followUpRecords })
  }

  function addProgressLog(customerId, log) {
    const customer = getCustomerById(customerId)
    if (!customer) return null

    const newLog = {
      ...log,
      id: generateId(),
      type: 'status_change',
      category: 'progress',
      createdAt: new Date().toISOString()
    }

    const followUpRecords = customer.followUpRecords || []
    followUpRecords.unshift(newLog)

    return updateCustomer(customerId, { followUpRecords })
  }

  const customerCount = computed(() => customers.value.length)

  const referralCustomerCount = computed(() => 
    customers.value.filter(c => c.source === 'referral').length
  )

  function searchCustomers(keyword) {
    if (!keyword) return customers.value
    const kw = keyword.toLowerCase()
    return customers.value.filter(c => 
      c.name.toLowerCase().includes(kw) ||
      c.phone.includes(kw) ||
      (c.wechat && c.wechat.toLowerCase().includes(kw)) ||
      (c.hotel && c.hotel.toLowerCase().includes(kw))
    )
  }

  function getCustomersBySource(source) {
    if (!source) return customers.value
    return customers.value.filter(c => c.source === source)
  }

  function findCustomerByPhone(phone) {
    if (!phone) return null
    return customers.value.find(c => c.phone === phone) || null
  }

  function mergeCustomerWithLead(targetId, leadData) {
    const target = getCustomerById(targetId)
    if (!target) return null

    const mergedData = { ...target }

    if (leadData.wechat && !target.wechat) mergedData.wechat = leadData.wechat
    if (leadData.weddingDate && !target.weddingDate) mergedData.weddingDate = leadData.weddingDate
    if (leadData.hotel && !target.hotel) mergedData.hotel = leadData.hotel
    if (leadData.remark) {
      mergedData.remark = target.remark 
        ? target.remark + '\n\n[线索合并补充] ' + leadData.remark 
        : leadData.remark
    }

    if (leadData.followUpRecords && leadData.followUpRecords.length > 0) {
      const existingRecords = target.followUpRecords || []
      mergedData.followUpRecords = [...existingRecords, ...leadData.followUpRecords]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    return updateCustomer(targetId, mergedData)
  }

  return {
    customers,
    customerCount,
    referralCustomerCount,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    addFollowUpRecord,
    addProgressLog,
    searchCustomers,
    getCustomersBySource,
    findCustomerByPhone,
    mergeCustomerWithLead
  }
})
