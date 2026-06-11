import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'
import dayjs from 'dayjs'

export const useLeadStore = defineStore('lead', () => {
  const leads = ref([])

  function fetchLeads() {
    ensureAllInitialized()
    leads.value = getStorage(storageKeys.LEADS) || []
  }

  function addLead(lead) {
    const newLead = {
      ...lead,
      id: generateId(),
      followUpRecords: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    leads.value.push(newLead)
    setStorage(storageKeys.LEADS, leads.value)
    return newLead
  }

  function updateLead(id, data) {
    const index = leads.value.findIndex(l => l.id === id)
    if (index !== -1) {
      leads.value[index] = { 
        ...leads.value[index], 
        ...data,
        updatedAt: new Date().toISOString()
      }
      setStorage(storageKeys.LEADS, leads.value)
      return leads.value[index]
    }
    return null
  }

  function deleteLead(id) {
    const index = leads.value.findIndex(l => l.id === id)
    if (index !== -1) {
      leads.value.splice(index, 1)
      setStorage(storageKeys.LEADS, leads.value)
      return true
    }
    return false
  }

  function getLeadById(id) {
    return leads.value.find(l => l.id === id) || null
  }

  function addFollowUpRecord(leadId, record) {
    const lead = getLeadById(leadId)
    if (!lead) return null

    const newRecord = {
      ...record,
      id: generateId(),
      createdAt: new Date().toISOString()
    }

    const followUpRecords = lead.followUpRecords || []
    followUpRecords.unshift(newRecord)

    const updateData = {
      followUpRecords,
      status: record.status || lead.status
    }
    if (record.nextFollowUp) {
      updateData.nextFollowUp = record.nextFollowUp
    }

    return updateLead(leadId, updateData)
  }

  function searchLeads(keyword) {
    if (!keyword) return leads.value
    const kw = keyword.toLowerCase()
    return leads.value.filter(l =>
      l.name.toLowerCase().includes(kw) ||
      l.phone.includes(kw) ||
      (l.wechat && l.wechat.toLowerCase().includes(kw)) ||
      (l.hotel && l.hotel.toLowerCase().includes(kw))
    )
  }

  function getLeadsByStatus(status) {
    return leads.value.filter(l => l.status === status)
  }

  const leadCount = computed(() => leads.value.length)

  const pendingFollowUps = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return leads.value
      .filter(l => {
        if (l.status === 'converted' || l.status === 'lost') return false
        if (!l.nextFollowUp) return false
        return dayjs(l.nextFollowUp).isBefore(dayjs().add(3, 'day')) || 
               dayjs(l.nextFollowUp).isSame(dayjs(), 'day')
      })
      .sort((a, b) => dayjs(a.nextFollowUp).valueOf() - dayjs(b.nextFollowUp).valueOf())
  })

  const newLeadsCount = computed(() => 
    leads.value.filter(l => l.status === 'new').length
  )

  const convertedLeadsCount = computed(() => 
    leads.value.filter(l => l.status === 'converted').length
  )

  const conversionRate = computed(() => {
    const total = leads.value.filter(l => l.status !== 'new').length
    if (total === 0) return 0
    return Math.round((convertedLeadsCount.value / total) * 100)
  })

  function markAsConverted(leadId, customerId) {
    return updateLead(leadId, {
      status: 'converted',
      customerId
    })
  }

  return {
    leads,
    leadCount,
    pendingFollowUps,
    newLeadsCount,
    convertedLeadsCount,
    conversionRate,
    fetchLeads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById,
    addFollowUpRecord,
    searchLeads,
    getLeadsByStatus,
    markAsConverted
  }
})
