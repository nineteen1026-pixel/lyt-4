<template>
  <div class="costs-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">交通成本</h2>
        <p class="page-subtitle">
          本月支出：<span class="highlight">¥{{ monthCosts.toLocaleString() }}</span>
        </p>
      </div>
      <n-button type="primary" @click="openAddModal">
        <template #icon>
          <add-outline />
        </template>
        新增成本
      </n-button>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card">
        <div class="stat-title">总支出</div>
        <div class="stat-value">¥{{ costStore.totalCosts.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">交通费用</div>
        <div class="stat-value info">¥{{ typeCosts.transport?.toLocaleString() || 0 }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">住宿费用</div>
        <div class="stat-value warning">¥{{ typeCosts.accommodation?.toLocaleString() || 0 }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">其他费用</div>
        <div class="stat-value">¥{{ otherCosts.toLocaleString() }}</div>
      </n-card>
    </div>

    <n-card style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">成本记录</span>
          <n-select
            v-model:value="filterType"
            placeholder="筛选类型"
            :options="typeOptions"
            style="width: 140px;"
            clearable
          />
        </div>
      </template>
      <n-data-table
        :columns="columns"
        :data="filteredCosts"
        :pagination="pagination"
        :bordered="false"
        size="medium"
      >
        <template #type="{ row }">
          <n-tag :type="getCostType(row.type)" size="small">
            {{ getCostLabel(row.type) }}
          </n-tag>
        </template>
        <template #orderId="{ row }">
          <span v-if="row.orderId">{{ getOrderCustomer(row.orderId) }}</span>
          <span v-else style="color: #999;">-</span>
        </template>
        <template #actions="{ row }">
          <n-space>
            <n-button text size="small" type="primary" @click="openEditModal(row)">编辑</n-button>
            <n-button text size="small" type="error" @click="handleDelete(row)">删除</n-button>
          </n-space>
        </template>
      </n-data-table>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑成本' : '新增成本'"
      style="width: 480px;"
      @after-leave="handleModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="日期" path="date">
          <n-date-picker
            v-model:value="formData.date"
            type="date"
            placeholder="请选择日期"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="关联订单" path="orderId">
          <n-select
            v-model:value="formData.orderId"
            placeholder="选择关联的订单（可选）"
            :options="orderOptions"
            clearable
            filterable
          />
        </n-form-item>
        <n-form-item label="类型" path="type">
          <n-select
            v-model:value="formData.type"
            :options="typeSelectOptions"
            placeholder="请选择成本类型"
          />
        </n-form-item>
        <n-form-item label="金额" path="amount">
          <n-input-number
            v-model:value="formData.amount"
            :min="0"
            placeholder="请输入金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useCostStore } from '@/stores/cost'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { COST_TYPES } from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const costStore = useCostStore()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()

const filterType = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)

const formData = reactive({
  date: dayjs().valueOf(),
  orderId: '',
  type: 'transport',
  amount: null,
  remark: ''
})

const rules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const typeOptions = [
  { label: '交通', value: 'transport' },
  { label: '住宿', value: 'accommodation' },
  { label: '餐饮', value: 'food' },
  { label: '器材', value: 'equipment' },
  { label: '其他', value: 'other' }
]

const typeSelectOptions = typeOptions

const columns = [
  {
    title: '日期',
    key: 'date',
    width: 120,
    render: (row) => formatDate(row.date)
  },
  {
    title: '关联订单',
    key: 'orderId',
    width: 160
  },
  { title: '类型', key: 'type', width: 100 },
  {
    title: '金额',
    key: 'amount',
    width: 120,
    render: (row) => `¥${row.amount.toLocaleString()}`
  },
  { title: '备注', key: 'remark' },
  { title: '操作', key: 'actions', width: 140 }
]

const filteredCosts = computed(() => {
  let costs = [...costStore.costs]
  if (filterType.value) {
    costs = costs.filter(c => c.type === filterType.value)
  }
  return costs.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const typeCosts = computed(() => costStore.costsByType)

const otherCosts = computed(() => {
  const transport = typeCosts.value.transport || 0
  const accommodation = typeCosts.value.accommodation || 0
  return costStore.totalCosts - transport - accommodation
})

const monthCosts = computed(() => {
  const now = dayjs()
  const startOfMonth = now.startOf('month')
  return costStore.getTotalCostsByPeriod(
    startOfMonth.format('YYYY-MM-DD'),
    now.format('YYYY-MM-DD')
  )
})

const orderOptions = computed(() =>
  orderStore.orders.map(o => ({
    label: `${getCustomerName(o.customerId)} - ${formatDate(o.shootDate)}`,
    value: o.id
  }))
)

function getCustomerName(id) {
  const customer = customerStore.getCustomerById(id)
  return customer ? customer.name : '未知客户'
}

function getOrderCustomer(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (!order) return '-'
  return getCustomerName(order.customerId)
}

function getCostLabel(type) {
  return COST_TYPES[type]?.label || type
}

function getCostType(type) {
  return COST_TYPES[type]?.color || 'default'
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function openAddModal() {
  isEdit.value = false
  editId.value = ''
  Object.assign(formData, {
    date: dayjs().valueOf(),
    orderId: '',
    type: 'transport',
    amount: null,
    remark: ''
  })
  showModal.value = true
}

function openEditModal(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(formData, {
    date: dayjs(row.date).valueOf(),
    orderId: row.orderId || '',
    type: row.type,
    amount: row.amount,
    remark: row.remark || ''
  })
  showModal.value = true
}

function handleModalClose() {
  formRef.value?.restoreValidation()
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const data = {
        ...formData,
        date: dayjs(formData.date).format('YYYY-MM-DD')
      }

      if (isEdit.value) {
        costStore.updateCost(editId.value, data)
        message.success('更新成功')
      } else {
        costStore.addCost(data)
        message.success('添加成功')
      }
      showModal.value = false
    }
  })
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除这条成本记录吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      costStore.deleteCost(row.id)
      message.success('删除成功')
    }
  })
}
</script>

<style scoped>
.costs-page {
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

.page-subtitle .highlight {
  color: #d03050;
  font-weight: 600;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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
  font-size: 26px;
  font-weight: 700;
  color: #333;
}

.stat-value.info {
  color: #2080f0;
}

.stat-value.warning {
  color: #f0a020;
}
</style>
