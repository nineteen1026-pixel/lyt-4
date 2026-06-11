import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import { useScheduleStore } from '@/stores/schedule'
import { TRAVEL_ALLOWANCE_RATE } from '@/utils/format'
import dayjs from 'dayjs'

export const useTravelShootStore = defineStore('travelShoot', () => {
  const projects = ref([])
  const transports = ref([])
  const accommodations = ref([])
  const staffAssignments = ref([])
  const extraCosts = ref([])

  function fetchProjects() {
    ensureAllInitialized()
    projects.value = getStorage(storageKeys.TRAVEL_SHOOT_PROJECTS) || []
  }

  function fetchTransports() {
    ensureAllInitialized()
    transports.value = getStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS) || []
  }

  function fetchAccommodations() {
    ensureAllInitialized()
    accommodations.value = getStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS) || []
  }

  function fetchStaffAssignments() {
    ensureAllInitialized()
    staffAssignments.value = getStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS) || []
  }

  function fetchExtraCosts() {
    ensureAllInitialized()
    extraCosts.value = getStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS) || []
  }

  function fetchAll() {
    fetchProjects()
    fetchTransports()
    fetchAccommodations()
    fetchStaffAssignments()
    fetchExtraCosts()
  }

  function addProject(project) {
    const newProject = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    projects.value.push(newProject)
    setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, projects.value)
    return newProject
  }

  function updateProject(id, data) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = { ...projects.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, projects.value)
      return projects.value[index]
    }
    return null
  }

  function deleteProject(id) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, projects.value)
      deleteTransportsByProject(id)
      deleteAccommodationsByProject(id)
      deleteStaffAssignmentsByProject(id)
      deleteExtraCostsByProject(id)
      return true
    }
    return false
  }

  function getProjectById(id) {
    return projects.value.find(p => p.id === id) || null
  }

  function getProjectsByStatus(status) {
    return projects.value.filter(p => p.status === status)
  }

  function getProjectsByCustomer(customerId) {
    return projects.value.filter(p => p.customerId === customerId)
  }

  function getProjectsByDateRange(startDate, endDate) {
    return projects.value.filter(p => {
      const start = dayjs(p.travelDates?.departDate)
      const end = dayjs(p.travelDates?.returnDate)
      const queryStart = dayjs(startDate)
      const queryEnd = dayjs(endDate)
      return start.isBefore(queryEnd.add(1, 'day')) && end.isAfter(queryStart.subtract(1, 'day'))
    })
  }

  function addTransport(transport) {
    const newTransport = {
      ...transport,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    transports.value.push(newTransport)
    setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, transports.value)
    return newTransport
  }

  function updateTransport(id, data) {
    const index = transports.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transports.value[index] = { ...transports.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, transports.value)
      return transports.value[index]
    }
    return null
  }

  function deleteTransport(id) {
    const index = transports.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transports.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, transports.value)
      return true
    }
    return false
  }

  function deleteTransportsByProject(projectId) {
    const initialLength = transports.value.length
    transports.value = transports.value.filter(t => t.projectId !== projectId)
    if (transports.value.length !== initialLength) {
      setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, transports.value)
      return true
    }
    return false
  }

  function getTransportsByProject(projectId) {
    return transports.value.filter(t => t.projectId === projectId)
  }

  function addAccommodation(accommodation) {
    const newAccommodation = {
      ...accommodation,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    accommodations.value.push(newAccommodation)
    setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, accommodations.value)
    return newAccommodation
  }

  function updateAccommodation(id, data) {
    const index = accommodations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      accommodations.value[index] = { ...accommodations.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, accommodations.value)
      return accommodations.value[index]
    }
    return null
  }

  function deleteAccommodation(id) {
    const index = accommodations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      accommodations.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, accommodations.value)
      return true
    }
    return false
  }

  function deleteAccommodationsByProject(projectId) {
    const initialLength = accommodations.value.length
    accommodations.value = accommodations.value.filter(a => a.projectId !== projectId)
    if (accommodations.value.length !== initialLength) {
      setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, accommodations.value)
      return true
    }
    return false
  }

  function getAccommodationsByProject(projectId) {
    return accommodations.value.filter(a => a.projectId === projectId)
  }

  function addStaffAssignment(assignment) {
    const newAssignment = {
      ...assignment,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    staffAssignments.value.push(newAssignment)
    setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
    return newAssignment
  }

  function batchAddStaffAssignments(assignmentList) {
    const results = []
    assignmentList.forEach(item => {
      const newAssignment = {
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString()
      }
      staffAssignments.value.push(newAssignment)
      results.push(newAssignment)
    })
    setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
    return results
  }

  function updateStaffAssignment(id, data) {
    const index = staffAssignments.value.findIndex(s => s.id === id)
    if (index !== -1) {
      staffAssignments.value[index] = { ...staffAssignments.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
      return staffAssignments.value[index]
    }
    return null
  }

  function deleteStaffAssignment(id) {
    const index = staffAssignments.value.findIndex(s => s.id === id)
    if (index !== -1) {
      staffAssignments.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
      return true
    }
    return false
  }

  function deleteStaffAssignmentsByProject(projectId) {
    const initialLength = staffAssignments.value.length
    staffAssignments.value = staffAssignments.value.filter(s => s.projectId !== projectId)
    if (staffAssignments.value.length !== initialLength) {
      setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
      return true
    }
    return false
  }

  function getStaffAssignmentsByProject(projectId) {
    return staffAssignments.value.filter(s => s.projectId === projectId)
  }

  function getStaffAssignmentsByStaff(staffId) {
    return staffAssignments.value.filter(s => s.staffId === staffId)
  }

  function calculateStaffAllowance(staffRole, travelDays) {
    const rate = TRAVEL_ALLOWANCE_RATE[staffRole] || TRAVEL_ALLOWANCE_RATE.other
    const daily = rate.daily * travelDays
    const meal = rate.meal * travelDays
    const transport = rate.transport * travelDays
    return {
      dailyAllowance: rate.daily,
      mealAllowance: rate.meal,
      transportAllowance: rate.transport,
      daily,
      meal,
      transport,
      total: daily + meal + transport
    }
  }

  function syncToSchedule(projectId, orderStore) {
    const scheduleStore = useScheduleStore()
    const project = getProjectById(projectId)
    if (!project || !project.orderId) return false

    const projectAssignments = getStaffAssignmentsByProject(projectId)
    const existingSchedule = scheduleStore.getAssignmentsByOrder(project.orderId)
    const existingStaffIds = new Set(existingSchedule.map(a => a.staffId))

    projectAssignments.forEach(pa => {
      if (!existingStaffIds.has(pa.staffId)) {
        const shootDates = getShootDateRange(project)
        shootDates.forEach(date => {
          scheduleStore.addAssignment({
            orderId: project.orderId,
            staffId: pa.staffId,
            date,
            role: pa.role,
            status: project.status === 'confirmed' ? 'confirmed' : 'pending',
            remark: `旅拍项目：${project.name}`
          })
        })
      }
    })
    return true
  }

  function getShootDateRange(project) {
    if (!project?.travelDates) return []
    const dates = []
    let current = dayjs(project.travelDates.shootStartDate)
    const end = dayjs(project.travelDates.shootEndDate)
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'))
      current = current.add(1, 'day')
    }
    return dates
  }

  function checkStaffTravelConflict(staffId, projectId) {
    const project = getProjectById(projectId)
    if (!project?.travelDates) return false

    const projectStart = dayjs(project.travelDates.departDate)
    const projectEnd = dayjs(project.travelDates.returnDate)

    const otherAssignments = staffAssignments.value.filter(s =>
      s.staffId === staffId && s.projectId !== projectId
    )

    return otherAssignments.some(sa => {
      const otherProject = getProjectById(sa.projectId)
      if (!otherProject?.travelDates) return false
      const otherStart = dayjs(otherProject.travelDates.departDate)
      const otherEnd = dayjs(otherProject.travelDates.returnDate)
      return projectStart.isBefore(otherEnd.add(1, 'day')) &&
             projectEnd.isAfter(otherStart.subtract(1, 'day'))
    })
  }

  function addExtraCost(cost) {
    const newCost = {
      ...cost,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    extraCosts.value.push(newCost)
    setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)
    return newCost
  }

  function updateExtraCost(id, data) {
    const index = extraCosts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      extraCosts.value[index] = { ...extraCosts.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)
      return extraCosts.value[index]
    }
    return null
  }

  function deleteExtraCost(id) {
    const index = extraCosts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      extraCosts.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)
      return true
    }
    return false
  }

  function deleteExtraCostsByProject(projectId) {
    const initialLength = extraCosts.value.length
    extraCosts.value = extraCosts.value.filter(c => c.projectId !== projectId)
    if (extraCosts.value.length !== initialLength) {
      setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)
      return true
    }
    return false
  }

  function getExtraCostsByProject(projectId) {
    return extraCosts.value.filter(c => c.projectId === projectId)
  }

  function getProjectTotalTransportCost(projectId) {
    return getTransportsByProject(projectId)
      .reduce((sum, t) => sum + (t.totalCost || 0), 0)
  }

  function getProjectTotalAccommodationCost(projectId) {
    return getAccommodationsByProject(projectId)
      .reduce((sum, a) => sum + (a.totalCost || 0), 0)
  }

  function getProjectTotalStaffAllowance(projectId) {
    return getStaffAssignmentsByProject(projectId)
      .reduce((sum, s) => sum + (s.totalAllowance || 0), 0)
  }

  function getProjectTotalExtraCost(projectId) {
    return getExtraCostsByProject(projectId)
      .reduce((sum, c) => sum + (c.amount || 0), 0)
  }

  function getProjectTotalCost(projectId) {
    return getProjectTotalTransportCost(projectId) +
           getProjectTotalAccommodationCost(projectId) +
           getProjectTotalStaffAllowance(projectId) +
           getProjectTotalExtraCost(projectId)
  }

  function getProjectBudgetUtilization(projectId) {
    const project = getProjectById(projectId)
    if (!project) return { transport: 0, accommodation: 0, extra: 0, total: 0 }

    const transportBudget = project.transportBudget || 0
    const accommodationBudget = project.accommodationBudget || 0
    const extraBudget = project.extraCostBudget || 0
    const totalBudget = project.totalBudget || 0

    const transportUsed = getProjectTotalTransportCost(projectId)
    const accommodationUsed = getProjectTotalAccommodationCost(projectId)
    const extraUsed = getProjectTotalExtraCost(projectId)
    const staffUsed = getProjectTotalStaffAllowance(projectId)
    const totalUsed = getProjectTotalCost(projectId)

    return {
      transport: transportBudget > 0 ? Math.round((transportUsed / transportBudget) * 100) : 0,
      transportUsed,
      transportBudget,
      accommodation: accommodationBudget > 0 ? Math.round((accommodationUsed / accommodationBudget) * 100) : 0,
      accommodationUsed,
      accommodationBudget,
      extra: extraBudget > 0 ? Math.round((extraUsed / extraBudget) * 100) : 0,
      extraUsed,
      extraBudget,
      staff: staffUsed,
      total: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0,
      totalUsed,
      totalBudget,
      isOverBudget: totalUsed > totalBudget
    }
  }

  function getProjectRevenue(projectId, orderStore) {
    const project = getProjectById(projectId)
    if (!project) return { total: 0, paid: 0, unpaid: 0 }

    if (project.orderId && orderStore) {
      const order = orderStore.getOrderById(project.orderId)
      if (order) {
        const total = (order.depositAmount || 0) + (order.finalAmount || 0)
        return {
          total,
          paid: order.paidAmount || 0,
          unpaid: Math.max(0, total - (order.paidAmount || 0))
        }
      }
    }

    return {
      total: project.basePackagePrice || 0,
      paid: 0,
      unpaid: project.basePackagePrice || 0
    }
  }

  function getProjectProfit(projectId, orderStore) {
    const project = getProjectById(projectId)
    if (!project) return null

    const revenue = getProjectRevenue(projectId, orderStore)
    const costs = getProjectBudgetUtilization(projectId)
    const grossProfit = revenue.total - costs.totalUsed
    const netProfit = revenue.paid - costs.totalUsed

    return {
      projectId,
      projectName: project.name,
      revenue: revenue.total,
      paidRevenue: revenue.paid,
      unpaidRevenue: revenue.unpaid,
      totalCost: costs.totalUsed,
      transportCost: costs.transportUsed,
      accommodationCost: costs.accommodationUsed,
      staffCost: costs.staff,
      extraCost: costs.extraUsed,
      grossProfit,
      grossProfitRate: revenue.total > 0 ? Math.round((grossProfit / revenue.total) * 100) : 0,
      netProfit,
      netProfitRate: revenue.paid > 0 ? Math.round((netProfit / revenue.paid) * 100) : 0,
      isProfitable: grossProfit > 0,
      budget: costs.totalBudget,
      budgetUtilization: costs.total
    }
  }

  function getTotalProfitStats(orderStore, startDate = null, endDate = null) {
    let targetProjects = projects.value

    if (startDate && endDate) {
      targetProjects = getProjectsByDateRange(startDate, endDate)
    }

    let totalRevenue = 0
    let totalPaidRevenue = 0
    let totalCost = 0
    let totalTransportCost = 0
    let totalAccommodationCost = 0
    let totalStaffCost = 0
    let totalExtraCost = 0
    let profitableCount = 0

    targetProjects.forEach(p => {
      const profit = getProjectProfit(p.id, orderStore)
      if (profit) {
        totalRevenue += profit.revenue
        totalPaidRevenue += profit.paidRevenue
        totalCost += profit.totalCost
        totalTransportCost += profit.transportCost
        totalAccommodationCost += profit.accommodationCost
        totalStaffCost += profit.staffCost
        totalExtraCost += profit.extraCost
        if (profit.isProfitable) profitableCount++
      }
    })

    const grossProfit = totalRevenue - totalCost
    const netProfit = totalPaidRevenue - totalCost

    return {
      projectCount: targetProjects.length,
      profitableCount,
      profitableRate: targetProjects.length > 0 ? Math.round((profitableCount / targetProjects.length) * 100) : 0,
      totalRevenue,
      totalPaidRevenue,
      totalUnpaidRevenue: totalRevenue - totalPaidRevenue,
      totalCost,
      totalTransportCost,
      totalAccommodationCost,
      totalStaffCost,
      totalExtraCost,
      grossProfit,
      grossProfitRate: totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0,
      netProfit,
      netProfitRate: totalPaidRevenue > 0 ? Math.round((netProfit / totalPaidRevenue) * 100) : 0,
      costBreakdown: {
        transport: totalCost > 0 ? Math.round((totalTransportCost / totalCost) * 100) : 0,
        accommodation: totalCost > 0 ? Math.round((totalAccommodationCost / totalCost) * 100) : 0,
        staff: totalCost > 0 ? Math.round((totalStaffCost / totalCost) * 100) : 0,
        extra: totalCost > 0 ? Math.round((totalExtraCost / totalCost) * 100) : 0
      }
    }
  }

  function getDestinationStats(orderStore) {
    const destMap = {}

    projects.value.forEach(p => {
      const destId = p.destination?.id || 'unknown'
      const destName = p.destination?.name || '未知'
      if (!destMap[destId]) {
        destMap[destId] = {
          id: destId,
          name: destName,
          province: p.destination?.province || '',
          count: 0,
          revenue: 0,
          cost: 0,
          profit: 0
        }
      }
      destMap[destId].count++
      const profit = getProjectProfit(p.id, orderStore)
      if (profit) {
        destMap[destId].revenue += profit.revenue
        destMap[destId].cost += profit.totalCost
        destMap[destId].profit += profit.grossProfit
      }
    })

    return Object.values(destMap).sort((a, b) => b.count - a.count)
  }

  const projectCount = computed(() => projects.value.length)

  const activeProjects = computed(() =>
    projects.value.filter(p =>
      p.status === 'planning' ||
      p.status === 'confirmed' ||
      p.status === 'traveling' ||
      p.status === 'shooting' ||
      p.status === 'returning'
    )
  )

  const upcomingProjects = computed(() =>
    projects.value
      .filter(p => {
        const departDate = dayjs(p.travelDates?.departDate)
        return departDate.isAfter(dayjs().subtract(1, 'day')) &&
               p.status !== 'cancelled' &&
               p.status !== 'completed'
      })
      .sort((a, b) => dayjs(a.travelDates?.departDate).valueOf() - dayjs(b.travelDates?.departDate).valueOf())
  )

  const todayProjects = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return projects.value.filter(p => {
      const depart = p.travelDates?.departDate
      const shootStart = p.travelDates?.shootStartDate
      const shootEnd = p.travelDates?.shootEndDate
      const returnDate = p.travelDates?.returnDate
      const dates = [depart, shootStart, shootEnd, returnDate].filter(Boolean)
      return dates.includes(today)
    })
  })

  return {
    projects,
    transports,
    accommodations,
    staffAssignments,
    extraCosts,
    projectCount,
    activeProjects,
    upcomingProjects,
    todayProjects,
    fetchProjects,
    fetchTransports,
    fetchAccommodations,
    fetchStaffAssignments,
    fetchExtraCosts,
    fetchAll,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByStatus,
    getProjectsByCustomer,
    getProjectsByDateRange,
    addTransport,
    updateTransport,
    deleteTransport,
    deleteTransportsByProject,
    getTransportsByProject,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    deleteAccommodationsByProject,
    getAccommodationsByProject,
    addStaffAssignment,
    batchAddStaffAssignments,
    updateStaffAssignment,
    deleteStaffAssignment,
    deleteStaffAssignmentsByProject,
    getStaffAssignmentsByProject,
    getStaffAssignmentsByStaff,
    calculateStaffAllowance,
    syncToSchedule,
    getShootDateRange,
    checkStaffTravelConflict,
    addExtraCost,
    updateExtraCost,
    deleteExtraCost,
    deleteExtraCostsByProject,
    getExtraCostsByProject,
    getProjectTotalTransportCost,
    getProjectTotalAccommodationCost,
    getProjectTotalStaffAllowance,
    getProjectTotalExtraCost,
    getProjectTotalCost,
    getProjectBudgetUtilization,
    getProjectRevenue,
    getProjectProfit,
    getTotalProfitStats,
    getDestinationStats
  }
})
