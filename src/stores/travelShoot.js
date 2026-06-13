import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import { useScheduleStore } from '@/stores/schedule'
import { useCostStore } from '@/stores/cost'
import { TRAVEL_ALLOWANCE_RATE } from '@/utils/format'
import dayjs from 'dayjs'

const EXTRA_COST_TO_COST_TYPE = {
  venue_fee: 'other',
  permit_fee: 'other',
  props: 'equipment',
  food: 'food',
  insurance: 'other',
  local_staff: 'other',
  equipment_extra: 'equipment',
  packing_transport: 'transport',
  miscellaneous: 'other'
}

function syncToCostStore(costStore, type, amount, date, orderId, projectId, linkedId, remark) {
  return costStore.addCost({
    date: date || dayjs().format('YYYY-MM-DD'),
    type,
    amount,
    orderId: orderId || '',
    source: 'travel_shoot',
    travelShootProjectId: projectId,
    travelShootLinkedId: linkedId,
    remark: remark || ''
  })
}

function updateLinkedCost(costStore, linkedId, updates) {
  const linked = costStore.costs.find(c => c.travelShootLinkedId === linkedId)
  if (linked) {
    costStore.updateCost(linked.id, updates)
    return linked.id
  }
  return null
}

function deleteLinkedCost(costStore, linkedId) {
  const linked = costStore.costs.find(c => c.travelShootLinkedId === linkedId)
  if (linked) {
    costStore.deleteCost(linked.id)
  }
}

function deleteLinkedCostsByProject(costStore, projectId) {
  const linked = costStore.costs.filter(c => c.travelShootProjectId === projectId)
  linked.forEach(c => costStore.deleteCost(c.id))
}

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
    try {
      const costStore = useCostStore()
      costStore.fetchCosts()
      syncAllCostsToCostStore()
    } catch (e) {
      console.warn('补录旅拍成本到成本台账失败:', e)
    }
  }

  function addProject(project) {
    const costBudget = (project.transportBudget || 0) + (project.accommodationBudget || 0) + (project.extraCostBudget || 0) + (project.staffBudget || 0)
    const newProject = {
      ...project,
      totalBudget: costBudget,
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
      const existing = projects.value[index]
      const costBudget = ((data.transportBudget !== undefined ? data.transportBudget : existing.transportBudget) || 0) +
        ((data.accommodationBudget !== undefined ? data.accommodationBudget : existing.accommodationBudget) || 0) +
        ((data.extraCostBudget !== undefined ? data.extraCostBudget : existing.extraCostBudget) || 0) +
        ((data.staffBudget !== undefined ? data.staffBudget : existing.staffBudget) || 0)
      projects.value[index] = { ...projects.value[index], ...data, totalBudget: costBudget }
      setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, projects.value)
      return projects.value[index]
    }
    return null
  }

  function updateProjectsDateByOrder(orderId, oldShootDate, newShootDate) {
    const orderProjects = projects.value.filter(p => p.orderId === orderId)
    const dayDiff = dayjs(newShootDate).diff(dayjs(oldShootDate), 'day')
    
    orderProjects.forEach(project => {
      const index = projects.value.findIndex(p => p.id === project.id)
      if (index !== -1 && project.travelDates) {
        const newTravelDates = { ...project.travelDates }
        if (project.travelDates.departDate) {
          newTravelDates.departDate = dayjs(project.travelDates.departDate).add(dayDiff, 'day').format('YYYY-MM-DD')
        }
        if (project.travelDates.shootStartDate) {
          newTravelDates.shootStartDate = dayjs(project.travelDates.shootStartDate).add(dayDiff, 'day').format('YYYY-MM-DD')
        }
        if (project.travelDates.shootEndDate) {
          newTravelDates.shootEndDate = dayjs(project.travelDates.shootEndDate).add(dayDiff, 'day').format('YYYY-MM-DD')
        }
        if (project.travelDates.returnDate) {
          newTravelDates.returnDate = dayjs(project.travelDates.returnDate).add(dayDiff, 'day').format('YYYY-MM-DD')
        }
        projects.value[index] = { ...projects.value[index], travelDates: newTravelDates }
      }
    })
    
    if (orderProjects.length > 0) {
      setStorage(storageKeys.TRAVEL_SHOOT_PROJECTS, projects.value)
    }
    
    return orderProjects
  }

  function deleteProject(id) {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const costStore = useCostStore()
      deleteLinkedCostsByProject(costStore, id)
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

  function getProjectsByStaffDate(staffId, date) {
    const d = dayjs(date)
    return projects.value.filter(p => {
      if (p.status === 'cancelled' || p.status === 'completed') return false
      const start = dayjs(p.travelDates?.departDate)
      const end = dayjs(p.travelDates?.returnDate)
      if (!d.isAfter(end) && !d.isBefore(start)) {
        return staffAssignments.value.some(sa =>
          sa.staffId === staffId && sa.projectId === p.id
        )
      }
      return false
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

    const costStore = useCostStore()
    const project = getProjectById(transport.projectId)
    syncToCostStore(
      costStore, 'transport', transport.totalCost || 0,
      transport.departDateTime ? dayjs(transport.departDateTime).format('YYYY-MM-DD') : '',
      project?.orderId || '', transport.projectId, newTransport.id,
      `旅拍交通：${transport.departFrom || ''}→${transport.arriveTo || ''}${transport.isRoundTrip ? '(往返)' : ''}`
    )

    return newTransport
  }

  function updateTransport(id, data) {
    const index = transports.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transports.value[index] = { ...transports.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, transports.value)

      const costStore = useCostStore()
      const project = getProjectById(transports.value[index].projectId)
      updateLinkedCost(costStore, id, {
        amount: data.totalCost !== undefined ? data.totalCost : (transports.value[index].totalCost || 0),
        date: data.departDateTime ? dayjs(data.departDateTime).format('YYYY-MM-DD') : undefined,
        orderId: project?.orderId || '',
        remark: `旅拍交通：${data.departFrom || transports.value[index].departFrom || ''}→${data.arriveTo || transports.value[index].arriveTo || ''}${(data.isRoundTrip !== undefined ? data.isRoundTrip : transports.value[index].isRoundTrip) ? '(往返)' : ''}`
      })

      return transports.value[index]
    }
    return null
  }

  function deleteTransport(id) {
    const index = transports.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const costStore = useCostStore()
      deleteLinkedCost(costStore, id)
      transports.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_TRANSPORTS, transports.value)
      return true
    }
    return false
  }

  function deleteTransportsByProject(projectId) {
    const costStore = useCostStore()
    const projectTransports = transports.value.filter(t => t.projectId === projectId)
    projectTransports.forEach(t => deleteLinkedCost(costStore, t.id))

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

    const costStore = useCostStore()
    const project = getProjectById(accommodation.projectId)
    syncToCostStore(
      costStore, 'accommodation', accommodation.totalCost || 0,
      accommodation.checkIn || '',
      project?.orderId || '', accommodation.projectId, newAccommodation.id,
      `旅拍住宿：${accommodation.hotelName || ''} ${accommodation.roomCount || 0}间${accommodation.nights || 0}晚`
    )

    return newAccommodation
  }

  function updateAccommodation(id, data) {
    const index = accommodations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      accommodations.value[index] = { ...accommodations.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, accommodations.value)

      const costStore = useCostStore()
      const project = getProjectById(accommodations.value[index].projectId)
      updateLinkedCost(costStore, id, {
        amount: data.totalCost !== undefined ? data.totalCost : (accommodations.value[index].totalCost || 0),
        date: data.checkIn || accommodations.value[index].checkIn || undefined,
        orderId: project?.orderId || '',
        remark: `旅拍住宿：${data.hotelName || accommodations.value[index].hotelName || ''} ${(data.roomCount !== undefined ? data.roomCount : accommodations.value[index].roomCount || 0)}间${(data.nights !== undefined ? data.nights : accommodations.value[index].nights || 0)}晚`
      })

      return accommodations.value[index]
    }
    return null
  }

  function deleteAccommodation(id) {
    const index = accommodations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      const costStore = useCostStore()
      deleteLinkedCost(costStore, id)
      accommodations.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_ACCOMMODATIONS, accommodations.value)
      return true
    }
    return false
  }

  function deleteAccommodationsByProject(projectId) {
    const costStore = useCostStore()
    const projectAccommodations = accommodations.value.filter(a => a.projectId === projectId)
    projectAccommodations.forEach(a => deleteLinkedCost(costStore, a.id))

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

    const costStore = useCostStore()
    const project = getProjectById(assignment.projectId)
    if (assignment.totalAllowance > 0) {
      syncToCostStore(
        costStore, 'other', assignment.totalAllowance || 0,
        project?.travelDates?.departDate || '',
        project?.orderId || '', assignment.projectId, newAssignment.id,
        `旅拍人员补贴：${assignment.totalAllowance || 0}元`
      )
    }

    return newAssignment
  }

  function batchAddStaffAssignments(assignmentList) {
    const results = []
    const costStore = useCostStore()
    assignmentList.forEach(item => {
      const newAssignment = {
        ...item,
        id: generateId(),
        createdAt: new Date().toISOString()
      }
      staffAssignments.value.push(newAssignment)
      results.push(newAssignment)

      const project = getProjectById(item.projectId)
      if (item.totalAllowance > 0) {
        syncToCostStore(
          costStore, 'other', item.totalAllowance || 0,
          project?.travelDates?.departDate || '',
          project?.orderId || '', item.projectId, newAssignment.id,
          `旅拍人员补贴：${item.totalAllowance || 0}元`
        )
      }
    })
    setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
    return results
  }

  function updateStaffAssignment(id, data) {
    const index = staffAssignments.value.findIndex(s => s.id === id)
    if (index !== -1) {
      staffAssignments.value[index] = { ...staffAssignments.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)

      const costStore = useCostStore()
      const project = getProjectById(staffAssignments.value[index].projectId)
      if (data.totalAllowance !== undefined) {
        updateLinkedCost(costStore, id, {
          amount: data.totalAllowance,
          date: project?.travelDates?.departDate || undefined,
          orderId: project?.orderId || '',
          remark: `旅拍人员补贴：${data.totalAllowance}元`
        })
      }

      return staffAssignments.value[index]
    }
    return null
  }

  function deleteStaffAssignment(id) {
    const index = staffAssignments.value.findIndex(s => s.id === id)
    if (index !== -1) {
      const costStore = useCostStore()
      deleteLinkedCost(costStore, id)
      staffAssignments.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_STAFF_ASSIGNMENTS, staffAssignments.value)
      return true
    }
    return false
  }

  function deleteStaffAssignmentsByProject(projectId) {
    const costStore = useCostStore()
    const projectStaff = staffAssignments.value.filter(s => s.projectId === projectId)
    projectStaff.forEach(s => deleteLinkedCost(costStore, s.id))

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
    if (!project?.travelDates) return { travelConflict: false, scheduleConflict: false, conflictDetails: [] }

    const projectStart = dayjs(project.travelDates.departDate)
    const projectEnd = dayjs(project.travelDates.returnDate)
    const details = []

    const otherAssignments = staffAssignments.value.filter(s =>
      s.staffId === staffId && s.projectId !== projectId
    )

    const travelConflict = otherAssignments.some(sa => {
      const otherProject = getProjectById(sa.projectId)
      if (!otherProject?.travelDates) return false
      const otherStart = dayjs(otherProject.travelDates.departDate)
      const otherEnd = dayjs(otherProject.travelDates.returnDate)
      const hasOverlap = projectStart.isBefore(otherEnd.add(1, 'day')) &&
             projectEnd.isAfter(otherStart.subtract(1, 'day'))
      if (hasOverlap) {
        details.push({ type: 'travel', project: otherProject.name, start: otherStart.format('YYYY-MM-DD'), end: otherEnd.format('YYYY-MM-DD') })
      }
      return hasOverlap
    })

    const scheduleStore = useScheduleStore()
    let scheduleConflict = false
    let current = projectStart
    while (current.isBefore(projectEnd) || current.isSame(projectEnd, 'day')) {
      const dateStr = current.format('YYYY-MM-DD')
      const hasScheduleConflict = scheduleStore.checkStaffConflict(staffId, dateStr)
      if (hasScheduleConflict) {
        scheduleConflict = true
        const dayAssignments = scheduleStore.getAssignmentsByDate(dateStr).filter(a => a.staffId === staffId)
        dayAssignments.forEach(a => {
          details.push({ type: 'schedule', date: dateStr, orderId: a.orderId })
        })
      }
      current = current.add(1, 'day')
    }

    return {
      travelConflict,
      scheduleConflict,
      hasConflict: travelConflict || scheduleConflict,
      conflictDetails: details
    }
  }

  function checkScheduleStaffTravelConflict(staffId, date) {
    const d = dayjs(date)
    return projects.value.filter(p => {
      if (p.status === 'cancelled' || p.status === 'completed') return false
      const start = dayjs(p.travelDates?.departDate)
      const end = dayjs(p.travelDates?.returnDate)
      if (!d.isAfter(end) && !d.isBefore(start)) {
        return staffAssignments.value.some(sa =>
          sa.staffId === staffId && sa.projectId === p.id
        )
      }
      return false
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

    const costStore = useCostStore()
    const project = getProjectById(cost.projectId)
    const costType = EXTRA_COST_TO_COST_TYPE[cost.category] || 'other'
    syncToCostStore(
      costStore, costType, cost.amount || 0,
      cost.date || '',
      project?.orderId || '', cost.projectId, newCost.id,
      `旅拍额外：${cost.name || ''}`
    )

    return newCost
  }

  function updateExtraCost(id, data) {
    const index = extraCosts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      extraCosts.value[index] = { ...extraCosts.value[index], ...data }
      setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)

      const costStore = useCostStore()
      const project = getProjectById(extraCosts.value[index].projectId)
      const category = data.category || extraCosts.value[index].category
      const costType = EXTRA_COST_TO_COST_TYPE[category] || 'other'
      updateLinkedCost(costStore, id, {
        type: costType,
        amount: data.amount !== undefined ? data.amount : (extraCosts.value[index].amount || 0),
        date: data.date || extraCosts.value[index].date || undefined,
        orderId: project?.orderId || '',
        remark: `旅拍额外：${data.name || extraCosts.value[index].name || ''}`
      })

      return extraCosts.value[index]
    }
    return null
  }

  function deleteExtraCost(id) {
    const index = extraCosts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      const costStore = useCostStore()
      deleteLinkedCost(costStore, id)
      extraCosts.value.splice(index, 1)
      setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)
      return true
    }
    return false
  }

  function deleteExtraCostsByProject(projectId) {
    const costStore = useCostStore()
    const projectCosts = extraCosts.value.filter(c => c.projectId === projectId)
    projectCosts.forEach(c => deleteLinkedCost(costStore, c.id))

    const initialLength = extraCosts.value.length
    extraCosts.value = extraCosts.value.filter(c => c.projectId !== projectId)
    if (extraCosts.value.length !== initialLength) {
      setStorage(storageKeys.TRAVEL_SHOOT_EXTRA_COSTS, extraCosts.value)
      return true
    }
    return false
  }

  function syncAllCostsToCostStore() {
    const costStore = useCostStore()
    const existingLinkedIds = new Set(
      costStore.costs
        .filter(c => c.travelShootLinkedId)
        .map(c => c.travelShootLinkedId)
    )

    transports.value.forEach(t => {
      if (existingLinkedIds.has(t.id)) return
      const project = getProjectById(t.projectId)
      syncToCostStore(
        costStore, 'transport', t.totalCost || 0,
        t.departDateTime ? dayjs(t.departDateTime).format('YYYY-MM-DD') : '',
        project?.orderId || '', t.projectId, t.id,
        `旅拍交通：${t.departFrom || ''}→${t.arriveTo || ''}${t.isRoundTrip ? '(往返)' : ''}`
      )
    })

    accommodations.value.forEach(a => {
      if (existingLinkedIds.has(a.id)) return
      const project = getProjectById(a.projectId)
      syncToCostStore(
        costStore, 'accommodation', a.totalCost || 0,
        a.checkIn || '',
        project?.orderId || '', a.projectId, a.id,
        `旅拍住宿：${a.hotelName || ''} ${a.roomCount || 0}间${a.nights || 0}晚`
      )
    })

    staffAssignments.value.forEach(s => {
      if (existingLinkedIds.has(s.id)) return
      const project = getProjectById(s.projectId)
      if (s.totalAllowance > 0) {
        syncToCostStore(
          costStore, 'other', s.totalAllowance || 0,
          project?.travelDates?.departDate || '',
          project?.orderId || '', s.projectId, s.id,
          `旅拍人员补贴：${s.totalAllowance || 0}元`
        )
      }
    })

    extraCosts.value.forEach(c => {
      if (existingLinkedIds.has(c.id)) return
      const project = getProjectById(c.projectId)
      const costType = EXTRA_COST_TO_COST_TYPE[c.category] || 'other'
      syncToCostStore(
        costStore, costType, c.amount || 0,
        c.date || '',
        project?.orderId || '', c.projectId, c.id,
        `旅拍额外：${c.name || ''}`
      )
    })
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
    if (!project) return { transport: 0, accommodation: 0, extra: 0, staff: 0, total: 0 }

    const transportBudget = project.transportBudget || 0
    const accommodationBudget = project.accommodationBudget || 0
    const extraBudget = project.extraCostBudget || 0
    const staffBudget = project.staffBudget || 0
    const totalBudget = transportBudget + accommodationBudget + extraBudget + staffBudget

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
      staff: staffBudget > 0 ? Math.round((staffUsed / staffBudget) * 100) : 0,
      staffUsed,
      staffBudget,
      total: totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0,
      totalUsed,
      totalBudget,
      isOverBudget: totalUsed > totalBudget && totalBudget > 0
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
      staffCost: costs.staffUsed,
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
    updateProjectsDateByOrder,
    deleteProject,
    getProjectById,
    getProjectsByStatus,
    getProjectsByCustomer,
    getProjectsByDateRange,
    getProjectsByStaffDate,
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
    syncAllCostsToCostStore,
    checkStaffTravelConflict,
    checkScheduleStaffTravelConflict,
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
