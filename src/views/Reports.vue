<template>
  <div class="reports-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">收入报表</h2>
        <p class="page-subtitle">多维度统计分析经营数据</p>
      </div>
      <div class="header-actions">
        <n-radio-group v-model:value="periodType" size="medium">
          <n-radio-button value="month">月度</n-radio-button>
          <n-radio-button value="quarter">季度</n-radio-button>
          <n-radio-button value="year">年度</n-radio-button>
        </n-radio-group>
      </div>
    </div>

    <div class="stats-grid">
      <n-card class="stat-card">
        <div class="stat-title">总收入</div>
        <div class="stat-value revenue">¥{{ totalRevenue.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">总成本</div>
        <div class="stat-value cost">¥{{ totalCosts.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">净利润</div>
        <div class="stat-value profit">¥{{ netProfit.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">订单数</div>
        <div class="stat-value orders">{{ orderCount }}</div>
      </n-card>
    </div>

    <div class="chart-grid">
      <n-card>
        <template #header>
          <span style="font-weight: 600;">收入趋势</span>
        </template>
        <div ref="revenueChartRef" class="chart-container"></div>
      </n-card>
      <n-card>
        <template #header>
          <span style="font-weight: 600;">套餐销售排行</span>
        </template>
        <div ref="packageChartRef" class="chart-container"></div>
      </n-card>
    </div>

    <n-card style="margin-top: 20px;">
      <template #header>
        <span style="font-weight: 600;">成本分布</span>
      </template>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div ref="costChartRef" class="chart-container" style="height: 280px;"></div>
        <div class="cost-list">
          <div
            v-for="item in costByTypeList"
            :key="item.type"
            class="cost-item"
          >
            <div class="cost-item-left">
              <span class="cost-dot" :style="{ background: item.color }"></span>
              <span class="cost-type-label">{{ item.label }}</span>
            </div>
            <div class="cost-item-right">
              <span class="cost-amount">¥{{ item.amount.toLocaleString() }}</span>
              <span class="cost-percent">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </n-card>

    <n-card style="margin-top: 20px;">
      <template #header>
        <span style="font-weight: 600;">订单明细</span>
      </template>
      <n-data-table
        :columns="columns"
        :data="orderDetailList"
        :pagination="pagination"
        :bordered="false"
        size="small"
      >
        <template #profit="{ row }">
          <span :style="{ color: row.profit >= 0 ? '#18a058' : '#d03050' }">
            ¥{{ row.profit.toLocaleString() }}
          </span>
        </template>
      </n-data-table>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useOrderStore } from '@/stores/order'
import { usePackageStore } from '@/stores/package'
import { useCostStore } from '@/stores/cost'
import { useCustomerStore } from '@/stores/customer'
import { COST_TYPES } from '@/utils/format'
import dayjs from 'dayjs'

const orderStore = useOrderStore()
const packageStore = usePackageStore()
const costStore = useCostStore()
const customerStore = useCustomerStore()

const periodType = ref('month')
const revenueChartRef = ref(null)
const packageChartRef = ref(null)
const costChartRef = ref(null)

let revenueChart = null
let packageChart = null
let costChart = null

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const columns = [
  { title: '拍摄日期', key: 'shootDate', width: 120 },
  { title: '客户', key: 'customerName', width: 160 },
  { title: '套餐', key: 'packageName' },
  {
    title: '收入',
    key: 'revenue',
    width: 120,
    render: (row) => `¥${row.revenue.toLocaleString()}`
  },
  {
    title: '成本',
    key: 'cost',
    width: 120,
    render: (row) => `¥${row.cost.toLocaleString()}`
  },
  { title: '利润', key: 'profit', width: 120 }
]

const periodOrders = computed(() => {
  const now = dayjs()
  let start, end
  
  switch (periodType.value) {
    case 'month':
      start = now.startOf('month')
      end = now.endOf('month')
      break
    case 'quarter':
      start = now.startOf('quarter')
      end = now.endOf('quarter')
      break
    case 'year':
      start = now.startOf('year')
      end = now.endOf('year')
      break
    default:
      start = now.startOf('month')
      end = now.endOf('month')
  }
  
  return orderStore.orders.filter(o => {
    const date = dayjs(o.shootDate)
    return date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'))
  })
})

const periodCosts = computed(() => {
  const now = dayjs()
  let start, end
  
  switch (periodType.value) {
    case 'month':
      start = now.startOf('month')
      end = now.endOf('month')
      break
    case 'quarter':
      start = now.startOf('quarter')
      end = now.endOf('quarter')
      break
    case 'year':
      start = now.startOf('year')
      end = now.endOf('year')
      break
    default:
      start = now.startOf('month')
      end = now.endOf('month')
  }
  
  return costStore.getCostsByDateRange(
    start.format('YYYY-MM-DD'),
    end.format('YYYY-MM-DD')
  )
})

const totalRevenue = computed(() =>
  periodOrders.value.reduce((sum, o) => sum + (o.paidAmount || 0), 0)
)

const totalCosts = computed(() =>
  periodCosts.value.reduce((sum, c) => sum + (c.amount || 0), 0)
)

const netProfit = computed(() => totalRevenue.value - totalCosts.value)

const orderCount = computed(() => periodOrders.value.length)

const orderDetailList = computed(() => {
  return periodOrders.value
    .sort((a, b) => new Date(b.shootDate) - new Date(a.shootDate))
    .map(order => {
      const costs = costStore.getCostsByOrderId(order.id)
      const totalCost = costs.reduce((sum, c) => sum + (c.amount || 0), 0)
      return {
        ...order,
        customerName: customerStore.getCustomerById(order.customerId)?.name || '未知',
        packageName: packageStore.getPackageById(order.packageId)?.name || '未知',
        revenue: order.paidAmount || 0,
        cost: totalCost,
        profit: (order.paidAmount || 0) - totalCost
      }
    })
})

const costByTypeList = computed(() => {
  const typeMap = {}
  periodCosts.value.forEach(c => {
    if (!typeMap[c.type]) typeMap[c.type] = 0
    typeMap[c.type] += c.amount || 0
  })
  
  const colors = {
    transport: '#2080f0',
    accommodation: '#f0a020',
    food: '#18a058',
    equipment: '#722ed1',
    other: '#8c8c8c'
  }
  
  const total = totalCosts.value || 1
  
  return Object.keys(typeMap).map(type => ({
    type,
    label: COST_TYPES[type]?.label || type,
    amount: typeMap[type],
    percent: ((typeMap[type] / total) * 100).toFixed(1),
    color: colors[type] || '#8c8c8c'
  })).sort((a, b) => b.amount - a.amount)
})

function getRevenueChartData() {
  const now = dayjs()
  let labels = []
  let revenueData = []
  
  switch (periodType.value) {
    case 'month': {
      const daysInMonth = now.daysInMonth()
      labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`)
      revenueData = Array(daysInMonth).fill(0)
      periodOrders.value.forEach(order => {
        const day = parseInt(order.shootDate.split('-')[2]) - 1
        if (day >= 0 && day < daysInMonth) {
          revenueData[day] += order.paidAmount || 0
        }
      })
      break
    }
    case 'quarter': {
      const quarter = now.quarter()
      const months = (quarter - 1) * 3
      labels = ['第1月', '第2月', '第3月']
      revenueData = [0, 0, 0]
      periodOrders.value.forEach(order => {
        const orderMonth = dayjs(order.shootDate).month()
        const idx = orderMonth - months
        if (idx >= 0 && idx < 3) {
          revenueData[idx] += order.paidAmount || 0
        }
      })
      break
    }
    case 'year': {
      labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      revenueData = Array(12).fill(0)
      periodOrders.value.forEach(order => {
        const month = dayjs(order.shootDate).month()
        revenueData[month] += order.paidAmount || 0
      })
      break
    }
  }
  
  return { labels, revenueData }
}

function initRevenueChart() {
  if (!revenueChartRef.value) return
  
  if (!revenueChart) {
    revenueChart = echarts.init(revenueChartRef.value)
  }
  
  const { labels, revenueData } = getRevenueChartData()
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        return `${params[0].axisValue}<br/>收入: ¥${params[0].value.toLocaleString()}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: revenueData,
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
      }
    ]
  }
  
  revenueChart.setOption(option, true)
}

function initPackageChart() {
  if (!packageChartRef.value) return
  
  if (!packageChart) {
    packageChart = echarts.init(packageChartRef.value)
  }
  
  const packageMap = {}
  periodOrders.value.forEach(order => {
    const pkg = packageStore.getPackageById(order.packageId)
    const name = pkg ? pkg.name : '其他'
    if (!packageMap[name]) packageMap[name] = 0
    packageMap[name]++
  })
  
  const data = Object.entries(packageMap)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}单 ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data,
        color: ['#D4A574', '#2080f0', '#18a058', '#722ed1', '#f0a020']
      }
    ]
  }
  
  packageChart.setOption(option, true)
}

function initCostChart() {
  if (!costChartRef.value) return
  
  if (!costChart) {
    costChart = echarts.init(costChartRef.value)
  }
  
  const data = costByTypeList.value.map(item => ({
    name: item.label,
    value: item.amount
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        data
      }
    ]
  }
  
  costChart.setOption(option, true)
}

function handleResize() {
  revenueChart?.resize()
  packageChart?.resize()
  costChart?.resize()
}

function initCharts() {
  initRevenueChart()
  initPackageChart()
  initCostChart()
}

watch(periodType, () => {
  setTimeout(() => {
    initCharts()
  }, 50)
})

watch(
  () => [orderStore.orders.length, costStore.costs.length],
  () => {
    initCharts()
  },
  { deep: true }
)

onMounted(() => {
  setTimeout(() => {
    initCharts()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
  packageChart?.dispose()
  costChart?.dispose()
})
</script>

<style scoped>
.reports-page {
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

.header-actions {
  display: flex;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-value.revenue {
  color: #18a058;
}

.stat-value.cost {
  color: #f0a020;
}

.stat-value.profit {
  color: #2080f0;
}

.stat-value.orders {
  color: #722ed1;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.cost-list {
  padding: 20px 0;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cost-item:last-child {
  border-bottom: none;
}

.cost-item-left {
  display: flex;
  align-items: center;
}

.cost-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.cost-type-label {
  font-size: 14px;
  color: #333;
}

.cost-item-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cost-amount {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.cost-percent {
  font-size: 12px;
  color: #999;
  width: 50px;
  text-align: right;
}
</style>
