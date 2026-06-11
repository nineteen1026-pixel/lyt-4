import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import dayjs from 'dayjs'

export const useCostStore = defineStore('cost', () => {
  const costs = ref([])

  function fetchCosts() {
    ensureAllInitialized()
    costs.value = getStorage(storageKeys.COSTS) || []
  }

  function addCost(cost) {
    const newCost = {
      ...cost,
      id: generateId()
    }
    costs.value.push(newCost)
    setStorage(storageKeys.COSTS, costs.value)
    return newCost
  }

  function updateCost(id, data) {
    const index = costs.value.findIndex(c => c.id === id)
    if (index !== -1) {
      costs.value[index] = { ...costs.value[index], ...data }
      setStorage(storageKeys.COSTS, costs.value)
      return costs.value[index]
    }
    return null
  }

  function deleteCost(id) {
    const index = costs.value.findIndex(c => c.id === id)
    if (index !== -1) {
      costs.value.splice(index, 1)
      setStorage(storageKeys.COSTS, costs.value)
      return true
    }
    return false
  }

  function getCostsByOrderId(orderId) {
    return costs.value.filter(c => c.orderId === orderId)
  }

  function getCostsByDateRange(startDate, endDate) {
    return costs.value.filter(c => {
      const date = dayjs(c.date)
      return date.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             date.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  const totalCosts = computed(() =>
    costs.value.reduce((sum, c) => sum + (c.amount || 0), 0)
  )

  function getTotalCostsByPeriod(startDate, endDate) {
    return getCostsByDateRange(startDate, endDate)
      .reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  const costsByType = computed(() => {
    const result = {}
    costs.value.forEach(c => {
      if (!result[c.type]) result[c.type] = 0
      result[c.type] += c.amount || 0
    })
    return result
  })

  return {
    costs,
    totalCosts,
    costsByType,
    fetchCosts,
    addCost,
    updateCost,
    deleteCost,
    getCostsByOrderId,
    getCostsByDateRange,
    getTotalCostsByPeriod
  }
})
