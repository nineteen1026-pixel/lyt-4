const STORAGE_PREFIX = 'wedding_ledger_'

export const storageKeys = {
  CUSTOMERS: 'customers',
  PACKAGES: 'packages',
  ORDERS: 'orders',
  COSTS: 'costs',
  LEADS: 'leads',
  STAFF: 'staff',
  ASSIGNMENTS: 'assignments',
  RETOUCH_BATCHES: 'retouch_batches',
  RETOUCH_FEEDBACKS: 'retouch_feedbacks',
  TRAVEL_SHOOT_PROJECTS: 'travel_shoot_projects',
  TRAVEL_SHOOT_TRANSPORTS: 'travel_shoot_transports',
  TRAVEL_SHOOT_ACCOMMODATIONS: 'travel_shoot_accommodations',
  TRAVEL_SHOOT_STAFF_ASSIGNMENTS: 'travel_shoot_staff_assignments',
  TRAVEL_SHOOT_EXTRA_COSTS: 'travel_shoot_extra_costs',
  PAYMENT_RECORDS: 'payment_records',
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
    leads: getStorage(storageKeys.LEADS) || [],
    staff: getStorage(storageKeys.STAFF) || [],
    assignments: getStorage(storageKeys.ASSIGNMENTS) || [],
    retouchBatches: getStorage(storageKeys.RETOUCH_BATCHES) || [],
    retouchFeedbacks: getStorage(storageKeys.RETOUCH_FEEDBACKS) || [],
    travelShootProjects: getStorage(storageKeys.TRAVEL_SHOOT_PROJECTS) || [],
    travelShootTransports: getStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS) || [],
    travelShootAccommodations: getStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS) || [],
    travelShootStaffAssignments: getStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS) || [],
    travelShootExtraCosts: getStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS) || [],
    paymentRecords: getStorage(storageKeys.PAYMENT_RECORDS) || [],
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
    if (data.leads) setStorage(storageKeys.LEADS, data.leads)
    if (data.staff) setStorage(storageKeys.STAFF, data.staff)
    if (data.assignments) setStorage(storageKeys.ASSIGNMENTS, data.assignments)
    if (data.retouchBatches) setStorage(storageKeys.RETOUCH_BATCHES, data.retouchBatches)
    if (data.retouchFeedbacks) setStorage(storageKeys.RETOUCH_FEEDBACKS, data.retouchFeedbacks)
    if (data.travelShootProjects) setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, data.travelShootProjects)
    if (data.travelShootTransports) setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, data.travelShootTransports)
    if (data.travelShootAccommodations) setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, data.travelShootAccommodations)
    if (data.travelShootStaffAssignments) setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, data.travelShootStaffAssignments)
    if (data.travelShootExtraCosts) setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, data.travelShootExtraCosts)
    if (data.paymentRecords) setStorage(storageKeys.PAYMENT_RECORDS, data.paymentRecords)
    
    return true
  } catch (e) {
    console.error('Import error:', e)
    return false
  }
}
