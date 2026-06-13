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
        <span style="font-weight: 600;">线索来源分析</span>
      </template>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 12px;">线索转化对比</div>
          <div ref="sourceConversionChartRef" class="chart-container" style="height: 280px;"></div>
        </div>
        <div>
          <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 12px;">渠道价值分析</div>
          <div ref="sourceValueChartRef" class="chart-container" style="height: 280px;"></div>
        </div>
      </div>
      <n-data-table
        :columns="sourceColumns"
        :data="sourceStats"
        :bordered="false"
        size="small"
      >
        <template #conversionRate="{ row }">
          <span :style="{ color: parseFloat(row.conversionRate) >= 30 ? '#18a058' : parseFloat(row.conversionRate) >= 15 ? '#f0a020' : '#d03050' }">
            {{ row.conversionRate }}%
          </span>
        </template>
        <template #totalRevenue="{ row }">
          ¥{{ row.totalRevenue.toLocaleString() }}
        </template>
        <template #avgOrderValue="{ row }">
          <span style="font-weight: 500;">¥{{ row.avgOrderValue.toLocaleString() }}</span>
        </template>
      </n-data-table>
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
import { useLeadStore } from '@/stores/lead'
import { COST_TYPES, LEAD_SOURCE } from '@/utils/format'
import dayjs from 'dayjs'

const orderStore = useOrderStore()
const packageStore = usePackageStore()
const costStore = useCostStore()
const customerStore = useCustomerStore()
const leadStore = useLeadStore()

const periodType = ref('month')
const revenueChartRef = ref(null)
const packageChartRef = ref(null)
const costChartRef = ref(null)
const sourceConversionChartRef = ref(null)
const sourceValueChartRef = ref(null)

let revenueChart = null
let packageChart = null
let costChart = null
let sourceConversionChart = null
let sourceValueChart = null

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

const sourceColumns = [
  { title: '来源渠道', key: 'label', width: 120 },
  { 
    title: '线索数', 
    key: 'leadCount', 
    width: 90,
    align: 'center'
  },
  { 
    title: '转化数', 
    key: 'convertedCount', 
    width: 90,
    align: 'center'
  },
  { 
    title: '转化率', 
    key: 'conversionRate', 
    width: 100,
    align: 'center'
  },
  { 
    title: '订单数', 
    key: 'orderCount', 
    width: 90,
    align: 'center'
  },
  { 
    title: '总收入', 
    key: 'totalRevenue', 
    width: 140,
    align: 'right'
  },
  { 
    title: '客单价', 
    key: 'avgOrderValue', 
    width: 120,
    align: 'right'
  }
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
        packageName: orderStore.getOrderPackageName(order),
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

const sourceStats = computed(() => {
  const sourceMap = {}

  Object.keys(LEAD_SOURCE).forEach(source => {
    sourceMap[source] = {
      source,
      label: LEAD_SOURCE[source],
      leadCount: 0,
      convertedCount: 0,
      orderCount: 0,
      totalRevenue: 0
    }
  })

  leadStore.leads.forEach(lead => {
    const source = lead.source || 'other'
    if (!sourceMap[source]) {
      sourceMap[source] = {
        source,
        label: LEAD_SOURCE[source] || source,
        leadCount: 0,
        convertedCount: 0,
        orderCount: 0,
        totalRevenue: 0
      }
    }
    sourceMap[source].leadCount++
    if (lead.status === 'converted') {
      sourceMap[source].convertedCount++
    }
  })

  customerStore.customers.forEach(customer => {
    const customerSource = customer.source || 'other'
    const customerOrders = orderStore.orders.filter(o => o.customerId === customer.id)
    
    customerOrders.forEach(order => {
      const source = customerSource
      if (!sourceMap[source]) {
        sourceMap[source] = {
          source,
          label: LEAD_SOURCE[source] || source,
          leadCount: 0,
          convertedCount: 0,
          orderCount: 0,
          totalRevenue: 0
        }
      }
      sourceMap[source].orderCount++
      sourceMap[source].totalRevenue += order.paidAmount || 0
    })
  })

  return Object.values(sourceMap)
    .map(item => ({
      ...item,
      conversionRate: item.leadCount > 0 
        ? ((item.convertedCount / item.leadCount) * 100).toFixed(1) 
        : '0.0',
      avgOrderValue: item.orderCount > 0 
        ? Math.round(item.totalRevenue / item.orderCount) 
        : 0
    }))
    .filter(item => item.leadCount > 0 || item.orderCount > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
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
    const name = orderStore.getOrderPackageName(order)
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

function initSourceConversionChart() {
  if (!sourceConversionChartRef.value) return
  
  if (!sourceConversionChart) {
    sourceConversionChart = echarts.init(sourceConversionChartRef.value)
  }
  
  const data = sourceStats.value
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const item = data[params[0].dataIndex]
        return `${item.label}<br/>
          线索数: ${item.leadCount}<br/>
          转化数: ${item.convertedCount}<br/>
          转化率: ${item.conversionRate}%`
      }
    },
    legend: {
      data: ['线索数', '转化数'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.label),
      axisLabel: {
        rotate: 30,
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '线索数',
        type: 'bar',
        data: data.map(item => item.leadCount),
        itemStyle: { color: '#2080f0' },
        barWidth: '30%'
      },
      {
        name: '转化数',
        type: 'bar',
        data: data.map(item => item.convertedCount),
        itemStyle: { color: '#18a058' },
        barWidth: '30%'
      }
    ]
  }
  
  sourceConversionChart.setOption(option, true)
}

function initSourceValueChart() {
  if (!sourceValueChartRef.value) return
  
  if (!sourceValueChart) {
    sourceValueChart = echarts.init(sourceValueChartRef.value)
  }
  
  const data = sourceStats.value
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: params => {
        const item = data[params[0].dataIndex]
        return `${item.label}<br/>
          订单数: ${item.orderCount}<br/>
          总收入: ¥${item.totalRevenue.toLocaleString()}<br/>
          客单价: ¥${item.avgOrderValue.toLocaleString()}`
      }
    },
    legend: {
      data: ['总收入', '客单价'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.label),
      axisLabel: {
        rotate: 30,
        fontSize: 11
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '总收入(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '客单价(元)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '总收入',
        type: 'bar',
        data: data.map(item => item.totalRevenue),
        itemStyle: { color: '#D4A574' },
        barWidth: '30%',
        yAxisIndex: 0
      },
      {
        name: '客单价',
        type: 'line',
        data: data.map(item => item.avgOrderValue),
        itemStyle: { color: '#722ed1' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        yAxisIndex: 1
      }
    ]
  }
  
  sourceValueChart.setOption(option, true)
}

function handleResize() {
  revenueChart?.resize()
  packageChart?.resize()
  costChart?.resize()
  sourceConversionChart?.resize()
  sourceValueChart?.resize()
}

function initCharts() {
  initRevenueChart()
  initPackageChart()
  initCostChart()
  initSourceConversionChart()
  initSourceValueChart()
}

watch(periodType, () => {
  setTimeout(() => {
    initCharts()
  }, 50)
})

watch(
  () => [orderStore.orders.length, costStore.costs.length, leadStore.leads.length, customerStore.customers.length],
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
  sourceConversionChart?.dispose()
  sourceValueChart?.dispose()
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
