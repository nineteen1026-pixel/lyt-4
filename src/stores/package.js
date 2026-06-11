import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'

export const usePackageStore = defineStore('package', () => {
  const packages = ref([])

  function fetchPackages() {
    ensureAllInitialized()
    packages.value = getStorage(storageKeys.PACKAGES) || []
  }

  function addPackage(pkg) {
    const newPackage = {
      ...pkg,
      id: generateId(),
      active: true,
      createdAt: new Date().toISOString()
    }
    packages.value.push(newPackage)
    setStorage(storageKeys.PACKAGES, packages.value)
    return newPackage
  }

  function updatePackage(id, data) {
    const index = packages.value.findIndex(p => p.id === id)
    if (index !== -1) {
      packages.value[index] = { ...packages.value[index], ...data }
      setStorage(storageKeys.PACKAGES, packages.value)
      return packages.value[index]
    }
    return null
  }

  function deletePackage(id) {
    const index = packages.value.findIndex(p => p.id === id)
    if (index !== -1) {
      packages.value.splice(index, 1)
      setStorage(storageKeys.PACKAGES, packages.value)
      return true
    }
    return false
  }

  function getPackageById(id) {
    return packages.value.find(p => p.id === id) || null
  }

  const activePackages = computed(() => 
    packages.value.filter(p => p.active)
  )

  const packageCount = computed(() => packages.value.length)

  return {
    packages,
    activePackages,
    packageCount,
    fetchPackages,
    addPackage,
    updatePackage,
    deletePackage,
    getPackageById
  }
})
