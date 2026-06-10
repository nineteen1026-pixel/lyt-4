const STORAGE_PREFIX = 'wedding_ledger_'

export const storageKeys = {
  CUSTOMERS: 'customers',
  PACKAGES: 'packages',
  ORDERS: 'orders',
  COSTS: 'costs',
  INITIALIZED: 'initialized'
}

export function getStorage(key) {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('Storage read error:', e)
    return null
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('Storage write error:', e)
    return false
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
    return true
  } catch (e) {
    console.error('Storage remove error:', e)
    return false
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function exportAllData() {
  const data = {
    customers: getStorage(storageKeys.CUSTOMERS) || [],
    packages: getStorage(storageKeys.PACKAGES) || [],
    orders: getStorage(storageKeys.ORDERS) || [],
    costs: getStorage(storageKeys.COSTS) || [],
    exportAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `婚礼摄影台账数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function importAllData(jsonData) {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
    
    if (data.customers) setStorage(storageKeys.CUSTOMERS, data.customers)
    if (data.packages) setStorage(storageKeys.PACKAGES, data.packages)
    if (data.orders) setStorage(storageKeys.ORDERS, data.orders)
    if (data.costs) setStorage(storageKeys.COSTS, data.costs)
    
    return true
  } catch (e) {
    console.error('Import error:', e)
    return false
  }
}
