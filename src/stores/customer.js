import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'

export const sourceOptions = [
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'dianping', label: '大众点评' },
  { value: 'douyin', label: '抖音' },
  { value: 'official', label: '官网' },
  { value: 'referral', label: '转介绍' },
  { value: 'other', label: '其他' }
]

export const followUpTypeOptions = [
  { value: 'phone', label: '电话' },
  { value: 'wechat', label: '微信' },
  { value: 'meeting', label: '面谈' },
  { value: 'other', label: '其他' }
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
      createdAt: new Date().toISOString()
    }

    const followUpRecords = customer.followUpRecords || []
    followUpRecords.unshift(newRecord)

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
    searchCustomers,
    getCustomersBySource
  }
})
