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
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/Reports.vue'),
    meta: { title: '收入报表', icon: 'stats' }
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
