import { getStorage, setStorage, storageKeys } from './storage'
import { initMockData } from '@/data/mockData'

const DEFAULT_SOURCES = ['xiaohongshu', 'dianping', 'douyin', 'official', 'offline', 'other']

function ensureCustomerSourceFields() {
  const customers = getStorage(storageKeys.CUSTOMERS)
  if (!customers || customers.length === 0) return

  const mockById = Object.fromEntries(
    initMockData().customers.map(c => [c.id, c])
  )
  let changed = false
  let sourceIdx = 0

  const updated = customers.map(customer => {
    const mock = mockById[customer.id]
    const patch = {}

    if (!customer.source) {
      if (customer.remark && (customer.remark.includes('介绍') || customer.remark.includes('老客户'))) {
        patch.source = 'referral'
        if (customer.referralName == null) {
          patch.referralName = mock?.referralName || '老客户推荐'
        }
      } else {
        patch.source = mock?.source || DEFAULT_SOURCES[sourceIdx % DEFAULT_SOURCES.length]
        sourceIdx++
      }
      changed = true
    }
    if (customer.referralName == null) {
      patch.referralName = mock?.referralName || ''
      changed = true
    }
    if (!customer.followUpRecords || !Array.isArray(customer.followUpRecords)) {
      if (mock?.followUpRecords?.length) {
        patch.followUpRecords = mock.followUpRecords.map(r => ({
          ...r,
          category: r.category || (r.type === 'status_change' ? 'progress' : 'follow_up')
        }))
      } else {
        patch.followUpRecords = [{
          id: 'fur_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          type: 'other',
          category: 'follow_up',
          content: '客户档案建立',
          status: 'converted',
          createdAt: customer.createdAt || new Date().toISOString()
        }]
      }
      changed = true
    } else {
      const updatedRecords = customer.followUpRecords.map(r => {
        if (!r.category) {
          changed = true
          return {
            ...r,
            category: r.type === 'status_change' ? 'progress' : 'follow_up'
          }
        }
        return r
      })
      if (changed) {
        patch.followUpRecords = updatedRecords
      }
    }

    return Object.keys(patch).length ? { ...customer, ...patch } : customer
  })

  if (changed) {
    setStorage(storageKeys.CUSTOMERS, updated)
  }
}

function ensureLeadFields() {
  const leads = getStorage(storageKeys.LEADS)
  if (!leads || leads.length === 0) return

  const mockById = Object.fromEntries(
    initMockData().leads.map(l => [l.id, l])
  )
  let changed = false

  const updated = leads.map(lead => {
    const mock = mockById[lead.id]
    const patch = {}

    if (lead.referralName == null) {
      patch.referralName = mock?.referralName || ''
      changed = true
    }
    if (!lead.followUpRecords || !Array.isArray(lead.followUpRecords)) {
      patch.followUpRecords = (mock?.followUpRecords || []).map(r => ({
        ...r,
        category: r.category || (r.type === 'status_change' ? 'progress' : 'follow_up')
      }))
      changed = true
    } else {
      const updatedRecords = lead.followUpRecords.map(r => {
        if (!r.category) {
          changed = true
          return {
            ...r,
            category: r.type === 'status_change' ? 'progress' : 'follow_up'
          }
        }
        return r
      })
      if (changed) {
        patch.followUpRecords = updatedRecords
      }
    }

    return Object.keys(patch).length ? { ...lead, ...patch } : lead
  })

  if (changed) {
    setStorage(storageKeys.LEADS, updated)
  }
}

export function ensureAllInitialized() {
  const initialized = getStorage(storageKeys.INITIALIZED)
  if (!initialized) {
    const mockData = initMockData()
    setStorage(storageKeys.CUSTOMERS, mockData.customers)
    setStorage(storageKeys.PACKAGES, mockData.packages)
    setStorage(storageKeys.ORDERS, mockData.orders)
    setStorage(storageKeys.COSTS, mockData.costs)
    setStorage(storageKeys.LEADS, mockData.leads)
    setStorage(storageKeys.STAFF, mockData.staff)
    setStorage(storageKeys.ASSIGNMENTS, mockData.assignments)
    setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, mockData.travelShootProjects)
    setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, mockData.travelShootTransports)
    setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, mockData.travelShootAccommodations)
    setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, mockData.travelShootStaffAssignments)
    setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, mockData.travelShootExtraCosts)
    setStorage(storageKeys.PAYMENT_RECORDS, mockData.paymentRecords)
    setStorage(storageKeys.INITIALIZED, true)
    return
  }

  const customers = getStorage(storageKeys.CUSTOMERS)
  if (!customers || customers.length === 0) {
    const mockData = initMockData()
    setStorage(storageKeys.CUSTOMERS, mockData.customers)
  }

  const leads = getStorage(storageKeys.LEADS)
  if (!leads || leads.length === 0) {
    const mockData = initMockData()
    setStorage(storageKeys.LEADS, mockData.leads)
  }

  const staffData = getStorage(storageKeys.STAFF)
  if (!staffData || staffData.length === 0) {
    const mockData = initMockData()
    setStorage(storageKeys.STAFF, mockData.staff)
    setStorage(storageKeys.ASSIGNMENTS, mockData.assignments)
  }

  const travelShootProjects = getStorage(storageKeys.TRAVEL_SHOOT_PROJECTS)
  if (!travelShootProjects || travelShootProjects.length === 0) {
    const mockData = initMockData()
    setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, mockData.travelShootProjects)
    setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, mockData.travelShootTransports)
    setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, mockData.travelShootAccommodations)
    setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, mockData.travelShootStaffAssignments)
    setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, mockData.travelShootExtraCosts)
  }

  const paymentRecords = getStorage(storageKeys.PAYMENT_RECORDS)
  if (!paymentRecords || paymentRecords.length === 0) {
    const mockData = initMockData()
    setStorage(storageKeys.PAYMENT_RECORDS, mockData.paymentRecords)
  }

  ensureCustomerSourceFields()
  ensureLeadFields()
}
