import { getStorage, setStorage, storageKeys } from './storage'
import { initMockData } from '@/data/mockData'

export function ensureAllInitialized() {
  const initialized = getStorage(storageKeys.INITIALIZED)
  if (!initialized) {
    const mockData = initMockData()
    setStorage(storageKeys.CUSTOMERS, mockData.customers)
    setStorage(storageKeys.PACKAGES, mockData.packages)
    setStorage(storageKeys.ORDERS, mockData.orders)
    setStorage(storageKeys.COSTS, mockData.costs)
    setStorage(storageKeys.LEADS, mockData.leads)
    setStorage(storageKeys.INITIALIZED, true)
    return
  }

  const leads = getStorage(storageKeys.LEADS)
  if (!leads || leads.length === 0) {
    const mockData = initMockData()
    setStorage(storageKeys.LEADS, mockData.leads)
  }
}
