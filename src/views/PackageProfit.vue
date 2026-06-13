<template>
  <div class="package-profit-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">套餐利润分析</h2>
        <p class="page-subtitle">深度分析各套餐的销量、收入、成本与利润贡献</p>
      </div>
      <div class="header-actions">
        <n-radio-group v-model:value="periodType" size="medium">
          <n-radio-button value="all">全部</n-radio-button>
          <n-radio-button value="month">月度</n-radio-button>
          <n-radio-button value="quarter">季度</n-radio-button>
          <n-radio-button value="year">年度</n-radio-button>
        </n-radio-group>
      </div>
    </div>

    <div class="stats-grid">
      <n-card class="stat-card">
        <div class="stat-title">套餐总收入</div>
        <div class="stat-value revenue">¥{{ totalRevenue.toLocaleString() }}</div>
        <div class="stat-sub">共 {{ orderCount }} 笔订单</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">套餐总成本</div>
        <div class="stat-value cost">¥{{ totalCost.toLocaleString() }}</div>
        <div class="stat-sub">{{ packageCount }} 个在售套餐</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">套餐总利润</div>
        <div class="stat-value profit">¥{{ totalProfit.toLocaleString() }}</div>
        <div class="stat-sub">平均利润率 {{ avgProfitMargin }}%</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">平均客单价</div>
        <div class="stat-value avg-price">¥{{ avgOrderValue.toLocaleString() }}</div>
        <div class="stat-sub">最高 ¥{{ highestPackagePrice.toLocaleString() }}</div>
      </n-card>
    </div>

    <div class="chart-grid">
      <n-card>
        <template #header>
          <span style="font-weight: 600;">套餐销量排行</span>
        </template>
        <div ref="salesRankChartRef" class="chart-container"></div>
      </n-card>
      <n-card>
        <template #header>
          <span style="font-weight: 600;">套餐收入对比</span>
        </template>
        <div ref="revenueCompareChartRef" class="chart-container"></div>
      </n-card>
    </div>

    <n-card style="margin-top: 20px;">
      <template #header>
        <span style="font-weight: 600;">套餐成本与利润分析</span>
      </template>
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px;">
        <div ref="profitStackChartRef" class="chart-container" style="height: 320px;"></div>
        <div>
          <div style="font-size: 14px; font-weight: 500; color: #333; margin-bottom: 12px;">利润构成占比</div>
          <div ref="profitPieChartRef" class="chart-container" style="height: 260px;"></div>
        </div>
      </div>
    </n-card>

    <n-card style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-weight: 600;">套餐利润明细表</span>
          <n-radio-group v-model:value="sortBy" size="small">
            <n-radio-button value="sales">按销量</n-radio-button>
            <n-radio-button value="revenue">按收入</n-radio-button>
            <n-radio-button value="profit">按利润</n-radio-button>
            <n-radio-button value="margin">按利润率</n-radio-button>
          </n-radio-group>
        </div>
      </template>
      <n-data-table
        :columns="profitColumns"
        :data="sortedPackageProfitList"
        :bordered="false"
        size="small"
        :pagination="pagination"
      >
        <template #rank="{ row, index }">
          <n-tag :type="getRankTagType(index)" size="small" round>
            {{ index + 1 }}
          </n-tag>
        </template>
        <template #packageInfo="{ row }">
          <div class="package-info-cell">
            <span class="package-name-text">{{ row.name }}</span>
            <n-tag v-if="row.active" type="success" size="tiny" style="margin-left: 8px;">在售</n-tag>
            <n-tag v-else type="default" size="tiny" style="margin-left: 8px;">已停售</n-tag>
          </div>
        </template>
        <template #price="{ row }">
          <span style="font-weight: 500;">¥{{ row.price.toLocaleString() }}</span>
        </template>
        <template #salesCount="{ row }">
          <span style="font-weight: 500; color: #722ed1;">{{ row.salesCount }}</span>
          <span style="font-size: 12px; color: #999; margin-left: 4px;">单</span>
        </template>
        <template #revenue="{ row }">
          <span style="color: #18a058; font-weight: 500;">¥{{ row.revenue.toLocaleString() }}</span>
        </template>
        <template #cost="{ row }">
          <span style="color: #f0a020;">¥{{ row.cost.toLocaleString() }}</span>
        </template>
        <template #profit="{ row }">
          <span :style="{ color: row.profit >= 0 ? '#2080f0' : '#d03050', fontWeight: 600 }">
            ¥{{ row.profit.toLocaleString() }}
          </span>
        </template>
        <template #profitMargin="{ row }">
          <n-progress
            type="line"
            :percentage="Math.min(100, Math.max(0, row.profitMargin))"
            :color="getMarginColor(row.profitMargin)"
            :height="8"
            :show-indicator="false"
            style="width: 100px;"
          />
          <span :style="{ 
            marginLeft: '8px', 
            fontWeight: 500,
            color: getMarginColor(row.profitMargin)
          }">
            {{ row.profitMargin }}%
          </span>
        </template>
        <template #revenueRatio="{ row }">
          <n-progress
            type="line"
            :percentage="row.revenueRatio"
            color="#D4A574"
            :height="6"
            :show-indicator="false"
            style="width: 80px;"
          />
          <span style="font-size: 12px; color: #999; margin-left: 6px;">
            {{ row.revenueRatio.toFixed(1) }}%
          </span>
        </template>
      </n-data-table>
    </n-card>

    <n-card style="margin-top: 20px;">
      <template #header>
        <span style="font-weight: 600;">套餐关联订单明细</span>
      </template>
      <n-data-table
        :columns="orderColumns"
        :data="orderDetailList"
        :bordered="false"
        size="small"
        :pagination="orderPagination"
      >
        <template #package="{ row }">
          <n-tag :color="getPackageTagColor(row.packageId)" size="small">
            {{ row.packageName }}
          </n-tag>
        </template>
        <template #shootDate="{ row }">
          {{ row.shootDate }}
        </template>
        <template #customer="{ row }">
          {{ row.customerName }}
        </template>
        <template #packagePrice="{ row }">
          ¥{{ row.packagePrice.toLocaleString() }}
        </template>
        <template #actualRevenue="{ row }">
          <span style="color: #18a058; font-weight: 500;">
            ¥{{ row.actualRevenue.toLocaleString() }}
          </span>
        </template>
        <template #actualCost="{ row }">
          <span style="color: #f0a020;">
            ¥{{ row.actualCost.toLocaleString() }}
          </span>
        </template>
        <template #orderProfit="{ row }">
          <span :style="{ 
            color: row.orderProfit >= 0 ? '#2080f0' : '#d03050', 
            fontWeight: 500 
          }">
            ¥{{ row.orderProfit.toLocaleString() }}
          </span>
        </template>
        <template #status="{ row }">
          <n-tag :type="getStatusType(row.status)" size="small">
            {{ ORDER_STATUS[row.status]?.label || row.status }}
          </n-tag>
        </template>
      </n-data-table>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, h } from 'vue'
import * as echarts from 'echarts'
import { useOrderStore } from '@/stores/order'
import { usePackageStore } from '@/stores/package'
import { useCostStore } from '@/stores/cost'
import { useCustomerStore } from '@/stores/customer'
import { ORDER_STATUS } from '@/utils/format'
import dayjs from 'dayjs'

const orderStore = useOrderStore()
const packageStore = usePackageStore()
const costStore = useCostStore()
const customerStore = useCustomerStore()

const periodType = ref('all')
const sortBy = ref('profit')

const salesRankChartRef = ref(null)
const revenueCompareChartRef = ref(null)
const profitStackChartRef = ref(null)
const profitPieChartRef = ref(null)

let salesRankChart = null
let revenueCompareChart = null
let profitStackChart = null
let profitPieChart = null

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const orderPagination = {
  pageSize: 10,
  showSizePicker: false
}

const profitColumns = [
  { title: '排名', key: 'rank', width: 70, align: 'center' },
  { title: '套餐', key: 'packageInfo', width: 180 },
  { title: '套餐价格', key: 'price', width: 110, align: 'right' },
  { title: '销量', key: 'salesCount', width: 90, align: 'center' },
  { title: '收入贡献', key: 'revenueRatio', width: 150 },
  { title: '总收入', key: 'revenue', width: 130, align: 'right' },
  { title: '总成本', key: 'cost', width: 130, align: 'right' },
  { title: '总利润', key: 'profit', width: 130, align: 'right' },
  { title: '利润率', key: 'profitMargin', width: 180 }
]

const orderColumns = [
  { title: '拍摄日期', key: 'shootDate', width: 110 },
  { title: '客户', key: 'customer', width: 170 },
  { title: '套餐', key: 'package', width: 130 },
  { title: '套餐定价', key: 'packagePrice', width: 110, align: 'right' },
  { title: '实收金额', key: 'actualRevenue', width: 120, align: 'right' },
  { title: '实际成本', key: 'actualCost', width: 110, align: 'right' },
  { title: '订单利润', key: 'orderProfit', width: 120, align: 'right' },
  { title: '订单状态', key: 'status', width: 100 }
]

const packageColors = {
  pkg_001: { type: 'info' },
  pkg_002: { type: 'success' },
  pkg_003: { type: 'warning' },
  pkg_004: { type: 'error' }
}

function getPackageTagColor(packageId) {
  const colorMap = {
    pkg_001: '#2080f0',
    pkg_002: '#18a058',
    pkg_003: '#f0a020',
    pkg_004: '#d03050'
  }
  return colorMap[packageId] || '#8c8c8c'
}

function getRankTagType(index) {
  if (index === 0) return 'warning'
  if (index === 1) return 'info'
  if (index === 2) return 'success'
  return 'default'
}

function getMarginColor(margin) {
  if (margin >= 60) return '#18a058'
  if (margin >= 40) return '#2080f0'
  if (margin >= 20) return '#f0a020'
  return '#d03050'
}

function getStatusType(status) {
  const typeMap = {
    completed: 'success',
    delivering: 'info',
    shooting: 'warning',
    selecting: 'warning',
    editing: 'warning',
    confirmed: 'primary',
    pending: 'default',
    cancelled: 'error'
  }
  return typeMap[status] || 'default'
}

const periodOrders = computed(() => {
  if (periodType.value === 'all') {
    return orderStore.orders
  }
  
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
      return orderStore.orders
  }
  
  return orderStore.orders.filter(o => {
    const date = dayjs(o.shootDate)
    return date.isAfter(start.subtract(1, 'day')) && date.isBefore(end.add(1, 'day'))
  })
})

const periodCosts = computed(() => {
  const orderIds = new Set(periodOrders.value.map(o => o.id))
  return costStore.costs.filter(c => orderIds.has(c.orderId))
})

const packageProfitList = computed(() => {
  const packages = packageStore.packages
  const result = []
  
  packages.forEach(pkg => {
    const pkgOrders = periodOrders.value.filter(o => o.packageId === pkg.id)
    const salesCount = pkgOrders.length
    
    const revenue = pkgOrders.reduce((sum, o) => sum + (o.paidAmount || 0), 0)
    
    const orderIds = pkgOrders.map(o => o.id)
    const cost = costStore.costs
      .filter(c => orderIds.includes(c.orderId))
      .reduce((sum, c) => sum + (c.amount || 0), 0)
    
    const profit = revenue - cost
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
    
    result.push({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      active: pkg.active,
      salesCount,
      revenue,
      cost,
      profit,
      profitMargin,
      revenueRatio: 0
    })
  })
  
  const totalRevenue = result.reduce((sum, r) => sum + r.revenue, 0)
  if (totalRevenue > 0) {
    result.forEach(r => {
      r.revenueRatio = Math.round((r.revenue / totalRevenue) * 1000) / 10
    })
  }
  
  return result
})

const sortedPackageProfitList = computed(() => {
  const list = [...packageProfitList.value]
  switch (sortBy.value) {
    case 'sales':
      return list.sort((a, b) => b.salesCount - a.salesCount)
    case 'revenue':
      return list.sort((a, b) => b.revenue - a.revenue)
    case 'profit':
      return list.sort((a, b) => b.profit - a.profit)
    case 'margin':
      return list.sort((a, b) => b.profitMargin - a.profitMargin)
    default:
      return list
  }
})

const orderDetailList = computed(() => {
  return periodOrders.value
    .sort((a, b) => new Date(b.shootDate) - new Date(a.shootDate))
    .map(order => {
      const customer = customerStore.getCustomerById(order.customerId)
      const orderCosts = costStore.getCostsByOrderId(order.id)
      const actualCost = orderCosts.reduce((sum, c) => sum + (c.amount || 0), 0)
      
      return {
        id: order.id,
        shootDate: order.shootDate,
        customerId: order.customerId,
        customerName: customer?.name || '未知客户',
        packageId: order.packageId,
        packageName: orderStore.getOrderPackageName(order),
        packagePrice: orderStore.getOrderPackagePrice(order),
        actualRevenue: order.paidAmount || 0,
        actualCost,
        orderProfit: (order.paidAmount || 0) - actualCost,
        status: order.status
      }
    })
})

const totalRevenue = computed(() =>
  packageProfitList.value.reduce((sum, p) => sum + p.revenue, 0)
)

const totalCost = computed(() =>
  packageProfitList.value.reduce((sum, p) => sum + p.cost, 0)
)

const totalProfit = computed(() => totalRevenue.value - totalCost.value)

const orderCount = computed(() => periodOrders.value.length)

const packageCount = computed(() => packageStore.packages.filter(p => p.active).length)

const avgProfitMargin = computed(() => {
  if (totalRevenue.value === 0) return '0.0'
  return ((totalProfit.value / totalRevenue.value) * 100).toFixed(1)
})

const avgOrderValue = computed(() => {
  if (orderCount.value === 0) return 0
  return Math.round(totalRevenue.value / orderCount.value)
})

const highestPackagePrice = computed(() => {
  const prices = packageStore.packages.map(p => p.price)
  return prices.length > 0 ? Math.max(...prices) : 0
})

function initSalesRankChart() {
  if (!salesRankChartRef.value) return
  if (!salesRankChart) {
    salesRankChart = echarts.init(salesRankChartRef.value)
  }
  
  const data = [...packageProfitList.value]
    .sort((a, b) => b.salesCount - a.salesCount)
    .filter(p => p.salesCount > 0)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const item = data[params[0].dataIndex]
        return `${item.name}<br/>销量: ${item.salesCount}单<br/>收入: ¥${item.revenue.toLocaleString()}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '订单数(单)'
    },
    yAxis: {
      type: 'category',
      data: data.map(p => p.name),
      inverse: true,
      axisLabel: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: data.map(p => p.salesCount),
        barWidth: 24,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#D4A574' },
              { offset: 1, color: '#E4B584' }
            ]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c} 单',
          fontSize: 12,
          fontWeight: 500
        }
      }
    ]
  }
  
  salesRankChart.setOption(option, true)
}

function initRevenueCompareChart() {
  if (!revenueCompareChartRef.value) return
  if (!revenueCompareChart) {
    revenueCompareChart = echarts.init(revenueCompareChartRef.value)
  }
  
  const data = [...packageProfitList.value]
    .sort((a, b) => b.revenue - a.revenue)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const idx = params[0].dataIndex
        const item = data[idx]
        return `${item.name}<br/>
          套餐定价: ¥${item.price.toLocaleString()}<br/>
          订单收入: ¥${item.revenue.toLocaleString()}<br/>
          销量: ${item.salesCount}单<br/>
          平均实收: ¥${item.salesCount > 0 ? Math.round(item.revenue / item.salesCount).toLocaleString() : 0}`
      }
    },
    legend: {
      data: ['套餐定价', '实际收入'],
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
      data: data.map(p => p.name),
      axisLabel: {
        fontSize: 11,
        rotate: 15
      }
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        name: '套餐定价',
        type: 'bar',
        data: data.map(p => p.salesCount * p.price),
        itemStyle: { color: '#2080f0' },
        barWidth: '28%',
        barGap: '20%'
      },
      {
        name: '实际收入',
        type: 'bar',
        data: data.map(p => p.revenue),
        itemStyle: { color: '#18a058' },
        barWidth: '28%'
      }
    ]
  }
  
  revenueCompareChart.setOption(option, true)
}

function initProfitStackChart() {
  if (!profitStackChartRef.value) return
  if (!profitStackChart) {
    profitStackChart = echarts.init(profitStackChartRef.value)
  }
  
  const data = [...packageProfitList.value].sort((a, b) => b.profit - a.profit)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: params => {
        const idx = params[0].dataIndex
        const item = data[idx]
        const margin = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(1) : 0
        return `${item.name}<br/>
          总收入: ¥${item.revenue.toLocaleString()}<br/>
          总成本: ¥${item.cost.toLocaleString()}<br/>
          总利润: ¥${item.profit.toLocaleString()}<br/>
          利润率: ${margin}%`
      }
    },
    legend: {
      data: ['成本', '利润'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(p => p.name),
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        name: '成本',
        type: 'bar',
        stack: 'total',
        data: data.map(p => p.cost),
        itemStyle: { color: '#f0a020' },
        barWidth: 36
      },
      {
        name: '利润',
        type: 'bar',
        stack: 'total',
        data: data.map(p => p.profit),
        itemStyle: { 
          color: params => {
            const value = params.value
            return value >= 0 ? '#2080f0' : '#d03050'
          }
        },
        barWidth: 36,
        label: {
          show: true,
          position: 'top',
          formatter: params => {
            const item = data[params.dataIndex]
            return `${item.profitMargin}%`
          },
          fontSize: 11,
          fontWeight: 500
        }
      }
    ]
  }
  
  profitStackChart.setOption(option, true)
}

function initProfitPieChart() {
  if (!profitPieChartRef.value) return
  if (!profitPieChart) {
    profitPieChart = echarts.init(profitPieChartRef.value)
  }
  
  const data = packageProfitList.value
    .filter(p => p.profit > 0)
    .map(p => ({
      name: p.name,
      value: p.profit
    }))
    .sort((a, b) => b.value - a.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11
        },
        labelLine: {
          length: 10,
          length2: 8
        },
        data,
        color: ['#D4A574', '#2080f0', '#18a058', '#722ed1', '#f0a020', '#d03050']
      }
    ]
  }
  
  profitPieChart.setOption(option, true)
}

function handleResize() {
  salesRankChart?.resize()
  revenueCompareChart?.resize()
  profitStackChart?.resize()
  profitPieChart?.resize()
}

function initCharts() {
  initSalesRankChart()
  initRevenueCompareChart()
  initProfitStackChart()
  initProfitPieChart()
}

watch(periodType, () => {
  setTimeout(() => {
    initCharts()
  }, 50)
})

watch(
  () => [orderStore.orders.length, costStore.costs.length, packageStore.packages.length, customerStore.customers.length],
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
  salesRankChart?.dispose()
  revenueCompareChart?.dispose()
  profitStackChart?.dispose()
  profitPieChart?.dispose()
})
</script>

<style scoped>
.package-profit-page {
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
  text-align: left;
}

.stat-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-sub {
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
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

.stat-value.avg-price {
  color: '#722ed1';
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

.package-info-cell {
  display: flex;
  align-items: center;
}

.package-name-text {
  font-weight: 500;
  color: #333;
}
</style>
