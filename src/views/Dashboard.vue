<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">数据概览</h2>
        <p class="page-subtitle">{{ today }}，欢迎回来！</p>
      </div>
    </div>

    <div class="stats-grid">
      <n-card class="stat-card total-customers">
        <div class="stat-icon">
          <n-icon size="28"><people-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ customerStore.customerCount }}</div>
          <div class="stat-label">客户总数</div>
        </div>
      </n-card>
      <n-card class="stat-card total-leads">
        <div class="stat-icon">
          <n-icon size="28"><person-add-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ leadStore.leadCount }}</div>
          <div class="stat-label">线索总数</div>
        </div>
      </n-card>
      <n-card class="stat-card total-orders">
        <div class="stat-icon">
          <n-icon size="28"><calendar-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ orderStore.orderCount }}</div>
          <div class="stat-label">订单总数</div>
        </div>
      </n-card>
      <n-card class="stat-card total-revenue">
        <div class="stat-icon">
          <n-icon size="28"><cash-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">¥{{ orderStore.totalRevenue.toLocaleString() }}</div>
          <div class="stat-label">累计收入</div>
        </div>
      </n-card>
      <n-card class="stat-card pending-payments">
        <div class="stat-icon">
          <n-icon size="28"><wallet-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">¥{{ pendingRevenue.toLocaleString() }}</div>
          <div class="stat-label">待收金额</div>
        </div>
      </n-card>
    </div>

    <div class="content-grid">
      <n-card class="upcoming-card">
        <template #header>
          <div class="card-header">
            <span>近期档期</span>
            <n-button text size="small" @click="goToSchedule">查看全部</n-button>
          </div>
        </template>
        <div class="upcoming-list">
          <div
            v-for="order in upcomingOrders"
            :key="order.id"
            class="upcoming-item"
            @click="goToSchedule"
          >
            <div class="date-info">
              <div class="date-day">{{ getDay(order.shootDate) }}</div>
              <div class="date-month">{{ getMonth(order.shootDate) }}月</div>
            </div>
            <div class="order-info">
              <div class="order-customer">{{ getCustomerName(order.customerId) }}</div>
              <div class="order-package">{{ getPackageName(order.packageId) }}</div>
            </div>
            <n-tag :type="getStatusType(order.status)" size="small">
              {{ getStatusLabel(order.status) }}
            </n-tag>
          </div>
          <div v-if="upcomingOrders.length === 0" class="empty-list">
            暂无近期档期
          </div>
        </div>
      </n-card>

      <n-card class="reminder-card">
        <template #header>
          <div class="card-header">
            <span>尾款提醒</span>
            <n-tag type="error" size="small">{{ overdueCount }}笔逾期</n-tag>
          </div>
        </template>
        <div class="reminder-list">
          <div
            v-for="order in overdueOrders"
            :key="order.id"
            class="reminder-item"
            @click="goToPayments"
          >
            <div class="reminder-info">
              <div class="reminder-customer">{{ getCustomerName(order.customerId) }}</div>
              <div class="reminder-date">到期日：{{ formatDate(order.dueDate) }}</div>
            </div>
            <div class="reminder-amount">
              ¥{{ getPendingAmount(order).toLocaleString() }}
            </div>
          </div>
          <div v-if="overdueOrders.length === 0" class="empty-list">
            暂无逾期款项
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="follow-up-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>待跟进线索</span>
          <n-tag type="warning" size="small">{{ leadStore.pendingFollowUps.length }}条待跟进</n-tag>
        </div>
      </template>
      <div class="follow-up-list">
        <div
          v-for="lead in leadStore.pendingFollowUps.slice(0, 5)"
          :key="lead.id"
          class="follow-up-item"
          @click="goToLeads"
        >
          <div class="follow-up-info">
            <div class="follow-up-name">{{ lead.name }}</div>
            <div class="follow-up-source">
              <n-tag size="small">{{ getLeadSourceLabel(lead.source) }}</n-tag>
              <span class="follow-up-date">下次跟进：{{ formatDate(lead.nextFollowUp) }}</span>
            </div>
          </div>
          <n-tag :type="getLeadStatusType(lead.status)" size="small">
            {{ getLeadStatusLabel(lead.status) }}
          </n-tag>
        </div>
        <div v-if="leadStore.pendingFollowUps.length === 0" class="empty-list">
          暂无待跟进线索
        </div>
      </div>
    </n-card>

    <n-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>本月收入趋势</span>
        </div>
      </template>
      <div ref="chartRef" class="chart-container"></div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  PeopleOutline,
  PersonAddOutline,
  CalendarOutline,
  CashOutline,
  WalletOutline
} from '@vicons/ionicons5'
import * as echarts from 'echarts'
import { useCustomerStore } from '@/stores/customer'
import { useOrderStore } from '@/stores/order'
import { usePackageStore } from '@/stores/package'
import { useLeadStore } from '@/stores/lead'
import { ORDER_STATUS, LEAD_STATUS, LEAD_SOURCE, formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const router = useRouter()
const customerStore = useCustomerStore()
const orderStore = useOrderStore()
const packageStore = usePackageStore()
const leadStore = useLeadStore()

const chartRef = ref(null)
let chartInstance = null

const today = computed(() => dayjs().format('YYYY年MM月DD日'))

const pendingRevenue = computed(() => {
  return orderStore.orders.reduce((sum, o) => {
    const total = (o.depositAmount || 0) + (o.finalAmount || 0)
    return sum + (total - (o.paidAmount || 0))
  }, 0)
})

const upcomingOrders = computed(() => {
  return orderStore.orders
    .filter(o => dayjs(o.shootDate).isAfter(dayjs().subtract(1, 'day')))
    .filter(o => o.status !== 'completed')
    .sort((a, b) => dayjs(a.shootDate).valueOf() - dayjs(b.shootDate).valueOf())
    .slice(0, 5)
})

const overdueOrders = computed(() => {
  return orderStore.orders
    .filter(o => {
      const total = (o.depositAmount || 0) + (o.finalAmount || 0)
      if ((o.paidAmount || 0) >= total) return false
      return o.dueDate && dayjs().isAfter(dayjs(o.dueDate), 'day')
    })
    .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf())
    .slice(0, 5)
})

const overdueCount = computed(() => overdueOrders.value.length)

function getDay(date) {
  return dayjs(date).format('DD')
}

function getMonth(date) {
  return dayjs(date).format('M')
}

function getCustomerName(id) {
  const customer = customerStore.getCustomerById(id)
  return customer ? customer.name : '未知客户'
}

function getPackageName(id) {
  const pkg = packageStore.getPackageById(id)
  return pkg ? pkg.name : '未知套餐'
}

function getStatusLabel(status) {
  return ORDER_STATUS[status]?.label || status
}

function getStatusType(status) {
  return ORDER_STATUS[status]?.color || 'default'
}

function getPendingAmount(order) {
  const total = (order.depositAmount || 0) + (order.finalAmount || 0)
  return total - (order.paidAmount || 0)
}

function goToSchedule() {
  router.push('/schedule')
}

function goToPayments() {
  router.push('/payments')
}

function goToLeads() {
  router.push('/leads')
}

function getLeadStatusLabel(status) {
  return LEAD_STATUS[status]?.label || status
}

function getLeadStatusType(status) {
  return LEAD_STATUS[status]?.color || 'default'
}

function getLeadSourceLabel(source) {
  return LEAD_SOURCE[source] || source
}

function initChart() {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const daysInMonth = dayjs().daysInMonth()
  const currentMonth = dayjs().format('YYYY-MM')
  
  const dailyRevenue = Array(daysInMonth).fill(0)
  const dailyOrders = Array(daysInMonth).fill(0)
  
  orderStore.orders.forEach(order => {
    if (order.shootDate && order.shootDate.startsWith(currentMonth)) {
      const day = parseInt(order.shootDate.split('-')[2]) - 1
      dailyRevenue[day] += order.paidAmount || 0
      dailyOrders[day] += 1
    }
  })
  
  const xAxisData = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['收入', '订单数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false
    },
    yAxis: [
      {
        type: 'value',
        name: '收入(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: dailyRevenue,
        itemStyle: {
          color: '#D4A574'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(212, 165, 116, 0.3)' },
              { offset: 1, color: 'rgba(212, 165, 116, 0.05)' }
            ]
          }
        }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: dailyOrders,
        itemStyle: {
          color: '#2080f0'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

function handleResize() {
  chartInstance?.resize()
}

watch(
  () => orderStore.orders.length,
  () => {
    initChart()
  }
)

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #999;
  margin: 6px 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 8px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.total-customers .stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.total-orders .stat-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.total-revenue .stat-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.pending-payments .stat-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.total-leads .stat-icon {
  background: linear-gradient(135deg, #fa709a, #fee140);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.upcoming-list,
.reminder-list {
  max-height: 320px;
  overflow-y: auto;
}

.upcoming-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.upcoming-item:hover {
  background: #fafafa;
}

.upcoming-item:last-child {
  border-bottom: none;
}

.date-info {
  width: 50px;
  text-align: center;
  margin-right: 16px;
}

.date-day {
  font-size: 24px;
  font-weight: 700;
  color: #D4A574;
  line-height: 1;
}

.date-month {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.order-info {
  flex: 1;
}

.order-customer {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.order-package {
  font-size: 12px;
  color: #999;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.reminder-item:hover {
  background: #fafafa;
}

.reminder-item:last-child {
  border-bottom: none;
}

.reminder-customer {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.reminder-date {
  font-size: 12px;
  color: #d03050;
}

.reminder-amount {
  font-size: 18px;
  font-weight: 600;
  color: #d03050;
}

.empty-list {
  text-align: center;
  padding: 40px 0;
  color: #ccc;
  font-size: 13px;
}

.follow-up-list {
  max-height: 280px;
  overflow-y: auto;
}

.follow-up-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.follow-up-item:hover {
  background: #fafafa;
}

.follow-up-item:last-child {
  border-bottom: none;
}

.follow-up-info {
  flex: 1;
}

.follow-up-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
}

.follow-up-source {
  display: flex;
  align-items: center;
  gap: 8px;
}

.follow-up-date {
  font-size: 12px;
  color: #999;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
