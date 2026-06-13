import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据概览', icon: 'bar-chart' }
  },
  {
    path: '/leads',
    name: 'Leads',
    component: () => import('@/views/Leads.vue'),
    meta: { title: '客户线索', icon: 'people' }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/Customers.vue'),
    meta: { title: '客户档案', icon: 'people' }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/Schedule.vue'),
    meta: { title: '档期项目', icon: 'calendar' }
  },
  {
    path: '/dispatch',
    name: 'Dispatch',
    component: () => import('@/views/Dispatch.vue'),
    meta: { title: '拍摄排班', icon: 'calendar' }
  },
  {
    path: '/packages',
    name: 'Packages',
    component: () => import('@/views/Packages.vue'),
    meta: { title: '套餐报价', icon: 'pricetags' }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/Progress.vue'),
    meta: { title: '拍摄进度', icon: 'time' }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/Payments.vue'),
    meta: { title: '尾款提醒', icon: 'cash' }
  },
  {
    path: '/costs',
    name: 'Costs',
    component: () => import('@/views/Costs.vue'),
    meta: { title: '交通成本', icon: 'car' }
  },
  {
    path: '/travel-shoot',
    name: 'TravelShoot',
    component: () => import('@/views/TravelShoot.vue'),
    meta: { title: '异地旅拍', icon: 'airplane' }
  },
  {
    path: '/photo-selections',
    name: 'PhotoSelections',
    component: () => import('@/views/PhotoSelections.vue'),
    meta: { title: '客户选片记录', icon: 'images' }
  },
  {
    path: '/retouch',
    name: 'RetouchBoard',
    component: () => import('@/views/RetouchBoard.vue'),
    meta: { title: '精修交付', icon: 'images' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue'),
    meta: { title: '收入报表', icon: 'stats' }
  },
  {
    path: '/communications',
    name: 'Communications',
    component: () => import('@/views/Communications.vue'),
    meta: { title: '沟通记录', icon: 'chatbubbles' }
  },
  {
    path: '/package-profit',
    name: 'PackageProfit',
    component: () => import('@/views/PackageProfit.vue'),
    meta: { title: '套餐利润分析', icon: 'analytics' }
  },
  {
    path: '/team',
    name: 'TeamManagement',
    component: () => import('@/views/TeamManagement.vue'),
    meta: { title: '团队成员管理', icon: 'people' }
  },
  {
    path: '/delivery-archive',
    name: 'DeliveryArchive',
    component: () => import('@/views/DeliveryArchive.vue'),
    meta: { title: '交付资料归档', icon: 'archive' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || ''} - 婚礼摄影接单台账`
  next()
})

export default router
