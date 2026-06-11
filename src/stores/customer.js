import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'

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

  const customerCount = computed(() => customers.value.length)

  function searchCustomers(keyword) {
    if (!keyword) return customers.value
    const kw = keyword.toLowerCase()
    return customers.value.filter(c => 
      c.name.toLowerCase().includes(kw) ||
      c.phone.includes(kw) ||
      c.wechat.toLowerCase().includes(kw) ||
      (c.hotel && c.hotel.toLowerCase().includes(kw))
    )
  }

  return {
    customers,
    customerCount,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    searchCustomers
  }
})
