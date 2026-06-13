import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage, generateId, storageKeys } from '@/utils/storage'
import { ensureAllInitialized } from '@/utils/init'

export const photoTypeOptions = [
  { value: 'original', label: '原片' },
  { value: 'refined', label: '精修' },
  { value: 'preview', label: '预告' },
  { value: 'print', label: '打印版' }
]

export const videoTypeOptions = [
  { value: 'highlight', label: '花絮快剪' },
  { value: 'full', label: '全程录像' },
  { value: 'micro', label: '爱情微电影' },
  { value: 'prewedding', label: '婚前MV' }
]

export const expressStatusOptions = [
  { value: 'pending', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'in_transit', label: '运输中' },
  { value: 'delivered', label: '已送达' },
  { value: 'returned', label: '已退回' }
]

export const expressCompanyOptions = [
  { value: 'sf', label: '顺丰速运' },
  { value: 'jd', label: '京东物流' },
  { value: 'yt', label: '圆通速递' },
  { value: 'zt', label: '中通快递' },
  { value: 'yd', label: '韵达速递' },
  { value: 'ems', label: 'EMS' },
  { value: 'other', label: '其他' }
]

export const signOffStatusOptions = [
  { value: 'pending', label: '待签收' },
  { value: 'signed', label: '已签收' },
  { value: 'rejected', label: '已拒收' },
  { value: 'confirmed', label: '确认满意' }
]

export const useDeliveryArchiveStore = defineStore('deliveryArchive', () => {
  const photos = ref([])
  const videos = ref([])
  const albums = ref([])
  const expressShipments = ref([])
  const signOffs = ref([])

  function fetchAll() {
    ensureAllInitialized()
    photos.value = getStorage(storageKeys.DELIVERY_PHOTOS) || []
    videos.value = getStorage(storageKeys.DELIVERY_VIDEOS) || []
    albums.value = getStorage(storageKeys.DELIVERY_ALBUMS) || []
    expressShipments.value = getStorage(storageKeys.DELIVERY_EXPRESS) || []
    signOffs.value = getStorage(storageKeys.DELIVERY_SIGNOFFS) || []
  }

  function addPhoto(photo) {
    const newPhoto = {
      ...photo,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    photos.value.push(newPhoto)
    setStorage(storageKeys.DELIVERY_PHOTOS, photos.value)
    return newPhoto
  }

  function updatePhoto(id, data) {
    const index = photos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      photos.value[index] = { ...photos.value[index], ...data }
      setStorage(storageKeys.DELIVERY_PHOTOS, photos.value)
      return photos.value[index]
    }
    return null
  }

  function deletePhoto(id) {
    const index = photos.value.findIndex(p => p.id === id)
    if (index !== -1) {
      photos.value.splice(index, 1)
      setStorage(storageKeys.DELIVERY_PHOTOS, photos.value)
      return true
    }
    return false
  }

  function addVideo(video) {
    const newVideo = {
      ...video,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    videos.value.push(newVideo)
    setStorage(storageKeys.DELIVERY_VIDEOS, videos.value)
    return newVideo
  }

  function updateVideo(id, data) {
    const index = videos.value.findIndex(v => v.id === id)
    if (index !== -1) {
      videos.value[index] = { ...videos.value[index], ...data }
      setStorage(storageKeys.DELIVERY_VIDEOS, videos.value)
      return videos.value[index]
    }
    return null
  }

  function deleteVideo(id) {
    const index = videos.value.findIndex(v => v.id === id)
    if (index !== -1) {
      videos.value.splice(index, 1)
      setStorage(storageKeys.DELIVERY_VIDEOS, videos.value)
      return true
    }
    return false
  }

  function addAlbum(album) {
    const newAlbum = {
      ...album,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    albums.value.push(newAlbum)
    setStorage(storageKeys.DELIVERY_ALBUMS, albums.value)
    return newAlbum
  }

  function updateAlbum(id, data) {
    const index = albums.value.findIndex(a => a.id === id)
    if (index !== -1) {
      albums.value[index] = { ...albums.value[index], ...data }
      setStorage(storageKeys.DELIVERY_ALBUMS, albums.value)
      return albums.value[index]
    }
    return null
  }

  function deleteAlbum(id) {
    const index = albums.value.findIndex(a => a.id === id)
    if (index !== -1) {
      albums.value.splice(index, 1)
      setStorage(storageKeys.DELIVERY_ALBUMS, albums.value)
      return true
    }
    return false
  }

  function addExpressShipment(shipment) {
    const newShipment = {
      ...shipment,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    expressShipments.value.push(newShipment)
    setStorage(storageKeys.DELIVERY_EXPRESS, expressShipments.value)
    return newShipment
  }

  function updateExpressShipment(id, data) {
    const index = expressShipments.value.findIndex(s => s.id === id)
    if (index !== -1) {
      expressShipments.value[index] = { ...expressShipments.value[index], ...data }
      setStorage(storageKeys.DELIVERY_EXPRESS, expressShipments.value)
      return expressShipments.value[index]
    }
    return null
  }

  function deleteExpressShipment(id) {
    const index = expressShipments.value.findIndex(s => s.id === id)
    if (index !== -1) {
      expressShipments.value.splice(index, 1)
      setStorage(storageKeys.DELIVERY_EXPRESS, expressShipments.value)
      return true
    }
    return false
  }

  function addSignOff(signOff) {
    const newSignOff = {
      ...signOff,
      id: generateId(),
      createdAt: new Date().toISOString()
    }
    signOffs.value.push(newSignOff)
    setStorage(storageKeys.DELIVERY_SIGNOFFS, signOffs.value)
    return newSignOff
  }

  function updateSignOff(id, data) {
    const index = signOffs.value.findIndex(s => s.id === id)
    if (index !== -1) {
      signOffs.value[index] = { ...signOffs.value[index], ...data }
      setStorage(storageKeys.DELIVERY_SIGNOFFS, signOffs.value)
      return signOffs.value[index]
    }
    return null
  }

  function deleteSignOff(id) {
    const index = signOffs.value.findIndex(s => s.id === id)
    if (index !== -1) {
      signOffs.value.splice(index, 1)
      setStorage(storageKeys.DELIVERY_SIGNOFFS, signOffs.value)
      return true
    }
    return false
  }

  const totalPhotos = computed(() => photos.value.length)
  const totalVideos = computed(() => videos.value.length)
  const totalAlbums = computed(() => albums.value.length)
  const totalShipments = computed(() => expressShipments.value.length)
  const totalSignOffs = computed(() => signOffs.value.length)

  const pendingShipments = computed(() =>
    expressShipments.value.filter(s => s.status === 'pending' || s.status === 'shipped' || s.status === 'in_transit')
  )

  const pendingSignOffs = computed(() =>
    signOffs.value.filter(s => s.status === 'pending')
  )

  function getPhotosByOrder(orderId) {
    return photos.value.filter(p => p.orderId === orderId)
  }

  function getVideosByOrder(orderId) {
    return videos.value.filter(v => v.orderId === orderId)
  }

  function getAlbumsByOrder(orderId) {
    return albums.value.filter(a => a.orderId === orderId)
  }

  function getExpressShipmentsByOrder(orderId) {
    return expressShipments.value.filter(s => s.orderId === orderId)
  }

  function getSignOffsByOrder(orderId) {
    return signOffs.value.filter(s => s.orderId === orderId)
  }

  function searchPhotos(keyword) {
    if (!keyword) return photos.value
    const kw = keyword.toLowerCase()
    return photos.value.filter(p =>
      (p.fileName && p.fileName.toLowerCase().includes(kw)) ||
      (p.remark && p.remark.toLowerCase().includes(kw))
    )
  }

  function searchAlbums(keyword) {
    if (!keyword) return albums.value
    const kw = keyword.toLowerCase()
    return albums.value.filter(a =>
      (a.name && a.name.toLowerCase().includes(kw)) ||
      (a.remark && a.remark.toLowerCase().includes(kw))
    )
  }

  return {
    photos,
    videos,
    albums,
    expressShipments,
    signOffs,
    totalPhotos,
    totalVideos,
    totalAlbums,
    totalShipments,
    totalSignOffs,
    pendingShipments,
    pendingSignOffs,
    fetchAll,
    addPhoto,
    updatePhoto,
    deletePhoto,
    addVideo,
    updateVideo,
    deleteVideo,
    addAlbum,
    updateAlbum,
    deleteAlbum,
    addExpressShipment,
    updateExpressShipment,
    deleteExpressShipment,
    addSignOff,
    updateSignOff,
    deleteSignOff,
    getPhotosByOrder,
    getVideosByOrder,
    getAlbumsByOrder,
    getExpressShipmentsByOrder,
    getSignOffsByOrder,
    searchPhotos,
    searchAlbums
  }
})
