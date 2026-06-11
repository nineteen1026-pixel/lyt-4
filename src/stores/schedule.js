import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import dayjs from 'dayjs'

export const useScheduleStore = defineStore('schedule', () => {
  const staff = ref([])
  const assignments = ref([])

  function fetchStaff() {
    ensureAllInitialized()
    staff.value = getStorage(storageKeys.STAFF) || []
  }

  function fetchAssignments() {
    ensureAllInitialized()
    assignments.value = getStorage(storageKeys.ASSIGNMENTS) || []
  }

  function addStaffMember(member) {
    const newMember = {
      ...member,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    staff.value.push(newMember)
    setStorage(storageKeys.STAFF, staff.value)
    return newMember
  }

  function updateStaffMember(id, data) {
    const index = staff.value.findIndex(s => s.id === id)
    if (index !== -1) {
      staff.value[index] = { ...staff.value[index], ...data }
      setStorage(storageKeys.STAFF, staff.value)
      return staff.value[index]
    }
    return null
  }

  function deleteStaffMember(id) {
    const index = staff.value.findIndex(s => s.id === id)
    if (index !== -1) {
      staff.value.splice(index, 1)
      setStorage(storageKeys.STAFF, staff.value)
      const relatedAssignments = assignments.value.filter(a => a.staffId === id)
      relatedAssignments.forEach(a => deleteAssignment(a.id))
      return true
    }
    return false
  }

  function getStaffById(id) {
    return staff.value.find(s => s.id === id) || null
  }

  function getStaffByRole(role) {
    return staff.value.filter(s => s.role === role && s.active)
  }

  function addAssignment(assignment) {
    const newAssignment = {
      ...assignment,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    assignments.value.push(newAssignment)
    setStorage(storageKeys.ASSIGNMENTS, assignments.value)
    return newAssignment
  }

  function batchAddAssignment(assignmentList) {
    const results = []
    assignmentList.forEach(item => {
      const newAssignment = {
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString()
      }
      assignments.value.push(newAssignment)
      results.push(newAssignment)
    })
    setStorage(storageKeys.ASSIGNMENTS, assignments.value)
    return results
  }

  function updateAssignment(id, data) {
    const index = assignments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      assignments.value[index] = { ...assignments.value[index], ...data }
      setStorage(storageKeys.ASSIGNMENTS, assignments.value)
      return assignments.value[index]
    }
    return null
  }

  function updateAssignmentsByOrder(orderId, data) {
    const orderAssignments = getAssignmentsByOrder(orderId)
    orderAssignments.forEach(asn => {
      const index = assignments.value.findIndex(a => a.id === asn.id)
      if (index !== -1) {
        assignments.value[index] = { ...assignments.value[index], ...data }
      }
    })
    setStorage(storageKeys.ASSIGNMENTS, assignments.value)
    return orderAssignments
  }

  function deleteAssignment(id) {
    const index = assignments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      assignments.value.splice(index, 1)
      setStorage(storageKeys.ASSIGNMENTS, assignments.value)
      return true
    }
    return false
  }

  function deleteAssignmentsByOrder(orderId) {
    const initialLength = assignments.value.length
    assignments.value = assignments.value.filter(a => a.orderId !== orderId)
    if (assignments.value.length !== initialLength) {
      setStorage(storageKeys.ASSIGNMENTS, assignments.value)
      return true
    }
    return false
  }

  function getAssignmentsByOrder(orderId) {
    return assignments.value.filter(a => a.orderId === orderId)
  }

  function getAssignmentsByStaff(staffId) {
    return assignments.value.filter(a => a.staffId === staffId)
  }

  function getAssignmentsByDate(date) {
    return assignments.value.filter(a => a.date === date)
  }

  function getAssignmentsByDateRange(startDate, endDate) {
    return assignments.value.filter(a => {
      const d = dayjs(a.date)
      return d.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             d.isBefore(dayjs(endDate).add(1, 'day'))
    })
  }

  function checkStaffConflict(staffId, date, role, excludeId = null) {
    return assignments.value.some(a =>
      a.staffId === staffId &&
      a.date === date &&
      a.id !== excludeId &&
      a.status !== 'cancelled'
    )
  }

  function checkDateOverloaded(date) {
    const dayAssignments = getAssignmentsByDate(date)
    const staffCount = new Set(dayAssignments.map(a => a.staffId)).size
    return staffCount >= staff.value.filter(s => s.active).length
  }

  function checkOrderFullyStaffed(orderId) {
    const orderAssignments = getAssignmentsByOrder(orderId).filter(a => a.status !== 'cancelled')
    const roles = new Set(orderAssignments.map(a => a.role))
    const requiredRoles = ['chief_photographer']
    return requiredRoles.every(role => roles.has(role))
  }

  function getUnassignedStaffForDate(date, role = null) {
    const dayAssignments = getAssignmentsByDate(date).filter(a => a.status !== 'cancelled')
    const assignedStaffIds = new Set(dayAssignments.map(a => a.staffId))
    return activeStaff.value.filter(s => {
      if (role && s.role !== mapAssignmentRoleToStaffRole(role)) return false
      return !assignedStaffIds.has(s.id)
    })
  }

  function mapAssignmentRoleToStaffRole(assignmentRole) {
    const roleMap = {
      'chief_photographer': 'photographer',
      'photographer': 'photographer',
      'assistant': 'assistant',
      'makeup_artist': 'makeup',
      'videographer': 'videographer'
    }
    return roleMap[assignmentRole] || assignmentRole
  }

  function getStaffWorkload(staffId, startDate, endDate) {
    const staffAssignments = getAssignmentsByStaff(staffId).filter(a => {
      if (a.status === 'cancelled') return false
      const d = dayjs(a.date)
      return d.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             d.isBefore(dayjs(endDate).add(1, 'day'))
    })
    return {
      total: staffAssignments.length,
      completed: staffAssignments.filter(a => a.status === 'completed').length,
      pending: staffAssignments.filter(a => a.status === 'pending' || a.status === 'confirmed').length
    }
  }

  function getStaffMaxWorkload(role) {
    const maxWorkloadMap = {
      photographer: 8,
      assistant: 12,
      makeup: 10,
      videographer: 8
    }
    return maxWorkloadMap[role] || 8
  }

  function getStaffMonthlyWorkloadWithOrders(staffId, year, month, orderStore) {
    const startDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD')
    const staffAssignments = getAssignmentsByStaff(staffId).filter(a => {
      if (a.status === 'cancelled') return false
      const d = dayjs(a.date)
      return d.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             d.isBefore(dayjs(endDate).add(1, 'day'))
    })

    const orders = []
    let totalRevenue = 0
    let paidRevenue = 0

    staffAssignments.forEach(asn => {
      const order = orderStore ? orderStore.getOrderById(asn.orderId) : null
      if (order) {
        const orderTotal = (order.depositAmount || 0) + (order.finalAmount || 0)
        const orderPaid = order.paidAmount || 0
        totalRevenue += orderTotal
        paidRevenue += orderPaid
        orders.push({
          ...order,
          assignmentId: asn.id,
          assignmentRole: asn.role,
          assignmentStatus: asn.status,
          orderTotal,
          orderPaid
        })
      }
    })

    const staff = getStaffById(staffId)
    const maxWorkload = staff ? getStaffMaxWorkload(staff.role) : 8
    const isOverloaded = staffAssignments.length > maxWorkload

    return {
      staffId,
      totalCount: staffAssignments.length,
      completedCount: staffAssignments.filter(a => a.status === 'completed').length,
      pendingCount: staffAssignments.filter(a => a.status === 'pending' || a.status === 'confirmed').length,
      maxWorkload,
      isOverloaded,
      overloadPercent: Math.min(Math.round((staffAssignments.length / maxWorkload) * 100), 200),
      orders,
      totalRevenue,
      paidRevenue,
      unpaidRevenue: totalRevenue - paidRevenue
    }
  }

  function getAllStaffMonthlyWorkload(year, month, orderStore) {
    return activeStaff.value.map(s => ({
      staff: s,
      workload: getStaffMonthlyWorkloadWithOrders(s.id, year, month, orderStore)
    }))
  }

  function getConflictsForDate(date) {
    const dayAssignments = getAssignmentsByDate(date)
    const staffDateMap = {}
    const conflicts = []

    dayAssignments.forEach(a => {
      if (a.status === 'cancelled') return
      const key = a.staffId
      if (!staffDateMap[key]) {
        staffDateMap[key] = []
      }
      staffDateMap[key].push(a)
    })

    Object.entries(staffDateMap).forEach(([staffId, items]) => {
      if (items.length > 1) {
        conflicts.push({
          type: 'staff_overlap',
          staffId,
          staffName: getStaffById(staffId)?.name || '未知人员',
          assignments: items,
          date,
          message: `${getStaffById(staffId)?.name || '未知人员'} 在 ${date} 有 ${items.length} 个排班任务`
        })
      }
    })

    return conflicts
  }

  function getAllConflicts(startDate, endDate) {
    const allConflicts = []
    let current = dayjs(startDate)
    const end = dayjs(endDate)

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD')
      const dayConflicts = getConflictsForDate(dateStr)
      allConflicts.push(...dayConflicts)
      current = current.add(1, 'day')
    }

    return allConflicts
  }

  function getConflictsForStaff(staffId, startDate, endDate) {
    const staffAssignments = getAssignmentsByStaff(staffId).filter(a => {
      if (a.status === 'cancelled') return false
      const d = dayjs(a.date)
      return d.isAfter(dayjs(startDate).subtract(1, 'day')) &&
             d.isBefore(dayjs(endDate).add(1, 'day'))
    })

    const dateMap = {}
    const conflicts = []

    staffAssignments.forEach(a => {
      if (!dateMap[a.date]) dateMap[a.date] = []
      dateMap[a.date].push(a)
    })

    Object.entries(dateMap).forEach(([date, items]) => {
      if (items.length > 1) {
        conflicts.push({
          type: 'staff_date_conflict',
          date,
          assignments: items,
          message: `${getStaffById(staffId)?.name || '未知人员'} 在 ${date} 被安排了 ${items.length} 个任务`
        })
      }
    })

    return conflicts
  }

  function suggestStaffForDate(date, role) {
    const availableStaff = getUnassignedStaffForDate(date, role)
    const staffWithWorkload = availableStaff.map(s => {
      const workload = getStaffWorkload(
        s.id,
        dayjs(date).subtract(7, 'day').format('YYYY-MM-DD'),
        dayjs(date).add(7, 'day').format('YYYY-MM-DD')
      )
      return {
        ...s,
        workload: workload.total
      }
    })

    return staffWithWorkload.sort((a, b) => a.workload - b.workload)
  }

  function getOrderStaffingStatus(orderId) {
    const orderAssignments = getAssignmentsByOrder(orderId).filter(a => a.status !== 'cancelled')
    const roles = new Set(orderAssignments.map(a => a.role))

    return {
      total: orderAssignments.length,
      roles: Array.from(roles),
      hasChiefPhotographer: roles.has('chief_photographer'),
      hasAssistant: roles.has('assistant'),
      hasMakeup: roles.has('makeup_artist'),
      hasVideographer: roles.has('videographer'),
      isFullyStaffed: roles.has('chief_photographer')
    }
  }

  function updateAssignmentStatusByOrderStatus(orderId, orderStatus) {
    const statusMap = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'shooting': 'in_progress',
      'selecting': 'completed',
      'editing': 'completed',
      'delivering': 'completed',
      'completed': 'completed',
      'cancelled': 'cancelled'
    }

    const targetStatus = statusMap[orderStatus]
    if (targetStatus) {
      updateAssignmentsByOrder(orderId, { status: targetStatus })
    }
  }

  const activeStaff = computed(() => staff.value.filter(s => s.active))

  const staffCount = computed(() => staff.value.length)

  const activeStaffCount = computed(() => activeStaff.value.length)

  const assignmentCount = computed(() => assignments.value.length)

  const pendingAssignments = computed(() =>
    assignments.value.filter(a => a.status === 'pending')
  )

  const todayAssignments = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return getAssignmentsByDate(today)
  })

  const upcomingAssignments = computed(() =>
    assignments.value
      .filter(a => dayjs(a.date).isAfter(dayjs().subtract(1, 'day')) && a.status !== 'cancelled')
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  )

  const conflictCount = computed(() => {
    const startDate = dayjs().format('YYYY-MM-DD')
    const endDate = dayjs().add(3, 'month').format('YYYY-MM-DD')
    return getAllConflicts(startDate, endDate).length
  })

  return {
    staff,
    assignments,
    activeStaff,
    staffCount,
    activeStaffCount,
    assignmentCount,
    pendingAssignments,
    todayAssignments,
    upcomingAssignments,
    conflictCount,
    fetchStaff,
    fetchAssignments,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    getStaffById,
    getStaffByRole,
    addAssignment,
    batchAddAssignment,
    updateAssignment,
    updateAssignmentsByOrder,
    deleteAssignment,
    deleteAssignmentsByOrder,
    getAssignmentsByOrder,
    getAssignmentsByStaff,
    getAssignmentsByDate,
    getAssignmentsByDateRange,
    checkStaffConflict,
    checkDateOverloaded,
    checkOrderFullyStaffed,
    getUnassignedStaffForDate,
    getStaffWorkload,
    getStaffMaxWorkload,
    getStaffMonthlyWorkloadWithOrders,
    getAllStaffMonthlyWorkload,
    getConflictsForDate,
    getAllConflicts,
    getConflictsForStaff,
    suggestStaffForDate,
    getOrderStaffingStatus,
    updateAssignmentStatusByOrderStatus
  }
})
