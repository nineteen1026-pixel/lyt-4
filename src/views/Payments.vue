<template>
  <div class="payments-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">尾款提醒</h2>
        <p class="page-subtitle">
          待收尾款：<span class="highlight">¥{{ pendingAmount.toLocaleString() }}</span>
          ，共 {{ overdueOrders.length }} 笔逾期
        </p>
      </div>
      <n-button type="primary" @click="openAddModal">
        <template #icon>
          <add-outline />
        </template>
        登记收款
      </n-button>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card">
        <div class="stat-title">总订单金额</div>
        <div class="stat-value warning">¥{{ totalAmount.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">已收金额</div>
        <div class="stat-value success">¥{{ orderStore.totalRevenue.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">待收金额</div>
        <div class="stat-value danger">¥{{ pendingAmount.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">逾期未付</div>
        <div class="stat-value error">{{ overdueOrders.length }} 笔</div>
      </n-card>
    </div>

    <n-card style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">订单款项列表</span>
          <n-radio-group v-model:value="filterStatus" size="small">
            <n-radio-button value="all">全部</n-radio-button>
            <n-radio-button value="unpaid">未付款</n-radio-button>
            <n-radio-button value="partial">部分付款</n-radio-button>
            <n-radio-button value="paid">已付清</n-radio-button>
          </n-radio-group>
        </div>
      </template>
      <n-data-table
        :columns="columns"
        :data="filteredOrders"
        :pagination="pagination"
        :bordered="false"
        size="medium"
      >
        <template #paymentStatus="{ row }">
          <n-tag :type="getPaymentType(row.paymentStatus)" size="small">
            {{ getPaymentLabel(row.paymentStatus) }}
          </n-tag>
        </template>
        <template #dueDate="{ row }">
          <div :class="{ 'overdue': isOverdue(row) }">
            {{ formatDate(row.dueDate) }}
            <n-tag v-if="isOverdue(row)" type="error" size="tiny" style="margin-left: 6px;">
              已逾期
            </n-tag>
          </div>
        </template>
        <template #actions="{ row }">
          <n-space>
            <n-button
              text
              size="small"
              type="primary"
              @click="openPayModal(row)"
              v-if="row.paymentStatus !== 'paid'"
            >
              登记收款
            </n-button>
            <n-button text size="small" @click="openEditModal(row)">编辑</n-button>
          </n-space>
        </template>
      </n-data-table>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑款项' : '登记收款'"
      style="width: 480px;"
      @after-leave="handleModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="选择订单" path="customerId" v-if="!isEdit">
          <n-select
            v-model:value="formData.customerId"
            placeholder="请选择订单"
            :options="orderOptions"
            @update:value="handleOrderChange"
          />
        </n-form-item>
        <n-form-item v-else label="订单金额">
          <span>¥{{ (currentOrder?.depositAmount + currentOrder?.finalAmount).toLocaleString() }}</span>
        </n-form-item>
        <n-form-item v-if="!isEdit" label="已付金额">
          <span>¥{{ currentPaidAmount.toLocaleString() }}</span>
        </n-form-item>
        <n-form-item label="本次收款" path="payAmount">
          <n-input-number
            v-model:value="formData.payAmount"
            :min="0"
            placeholder="请输入收款金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="收款日期" path="payDate">
          <n-date-picker
            v-model:value="formData.payDate"
            type="date"
            placeholder="请选择收款日期"
            style="width: 100%;"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确认</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showEditModal"
      preset="card"
      title="编辑款项"
      style="width: 520px;"
      @after-leave="handleEditModalClose"
    >
      <n-form
        ref="editFormRef"
        :model="editFormData"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="定金金额">
          <n-input-number
            v-model:value="editFormData.depositAmount"
            :min="0"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="尾款金额">
          <n-input-number
            v-model:value="editFormData.finalAmount"
            :min="0"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="已付金额">
          <n-input-number
            v-model:value="editFormData.paidAmount"
            :min="0"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="尾款到期日">
          <n-date-picker
            v-model:value="editFormData.dueDate"
            type="date"
            style="width: 100%;"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { PAYMENT_STATUS, formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()

const filterStatus = ref('all')
const showModal = ref(false)
const showEditModal = ref(false)
const isEdit = ref(false)
const currentOrder = ref(null)
const formRef = ref(null)
const editFormRef = ref(null)
const editId = ref('')

const formData = reactive({
  customerId: '',
  payAmount: null,
  payDate: dayjs().valueOf()
})

const editFormData = reactive({
  depositAmount: 0,
  finalAmount: 0,
  paidAmount: 0,
  dueDate: null
})

const rules = {
  customerId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  payAmount: [{ required: true, message: '请输入收款金额', trigger: 'blur' }]
}

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const filteredOrders = computed(() => {
  let orders = [...orderStore.orders]
  if (filterStatus.value !== 'all') {
    orders = orders.filter(o => o.paymentStatus === filterStatus.value)
  }
  return orders.sort((a, b) => {
    if (isOverdue(a) && !isOverdue(b)) return -1
    if (!isOverdue(a) && isOverdue(b)) return 1
    return new Date(b.shootDate) - new Date(a.shootDate)
  })
})

const totalAmount = computed(() =>
  orderStore.orders.reduce((sum, o) => sum + (o.depositAmount || 0) + (o.finalAmount || 0), 0)
)

const pendingAmount = computed(() =>
  orderStore.orders.reduce((sum, o) => {
    const total = (o.depositAmount || 0) + (o.finalAmount || 0)
    return sum + (total - (o.paidAmount || 0))
  }, 0)
)

const overdueOrders = computed(() =>
  orderStore.orders.filter(o => {
    const total = (o.depositAmount || 0) + (o.finalAmount || 0)
    if (o.paidAmount >= total) return false
    return o.dueDate && dayjs().isAfter(dayjs(o.dueDate), 'day')
  })
)

const orderOptions = computed(() =>
  orderStore.orders
    .filter(o => o.paymentStatus !== 'paid')
    .map(o => ({
      label: `${getCustomerName(o.customerId)} - ¥${(o.depositAmount + o.finalAmount).toLocaleString()}`,
      value: o.id
    }))
)

const currentPaidAmount = computed(() => {
  if (!formData.customerId) return 0
  const order = orderStore.getOrderById(formData.customerId)
  return order ? order.paidAmount || 0 : 0
})

const columns = [
  {
    title: '客户',
    key: 'customerId',
    width: 160,
    render: (row) => getCustomerName(row.customerId)
  },
  {
    title: '套餐',
    key: 'packageId',
    render: () => '-'
  },
  {
    title: '订单金额',
    key: 'amount',
    width: 120,
    render: (row) => `¥${(row.depositAmount + row.finalAmount).toLocaleString()}`
  },
  {
    title: '已付金额',
    key: 'paidAmount',
    width: 120,
    render: (row) => `¥${(row.paidAmount || 0).toLocaleString()}`
  },
  {
    title: '待收金额',
    key: 'pending',
    width: 120,
    render: (row) => {
      const total = row.depositAmount + row.finalAmount
      const pending = total - (row.paidAmount || 0)
      return `<span style="color: ${pending > 0 ? '#d03050' : '#18a058'}">¥${pending.toLocaleString()}</span>`
    }
  },
  { title: '收款状态', key: 'paymentStatus', width: 100 },
  { title: '尾款到期日', key: 'dueDate', width: 140 },
  { title: '操作', key: 'actions', width: 160 }
]

function getCustomerName(id) {
  const customer = customerStore.getCustomerById(id)
  return customer ? customer.name : '未知客户'
}

function getPaymentLabel(status) {
  return PAYMENT_STATUS[status]?.label || status
}

function getPaymentType(status) {
  return PAYMENT_STATUS[status]?.color || 'default'
}

function isOverdue(row) {
  const total = row.depositAmount + row.finalAmount
  if (row.paidAmount >= total) return false
  return row.dueDate && dayjs().isAfter(dayjs(row.dueDate), 'day')
}

function openAddModal() {
  isEdit.value = false
  currentOrder.value = null
  Object.assign(formData, {
    customerId: '',
    payAmount: null,
    payDate: dayjs().valueOf()
  })
  showModal.value = true
}

function openPayModal(row) {
  isEdit.value = false
  currentOrder.value = row
  formData.customerId = row.id
  formData.payAmount = null
  formData.payDate = dayjs().valueOf()
  showModal.value = true
}

function openEditModal(row) {
  editId.value = row.id
  Object.assign(editFormData, {
    depositAmount: row.depositAmount || 0,
    finalAmount: row.finalAmount || 0,
    paidAmount: row.paidAmount || 0,
    dueDate: row.dueDate ? dayjs(row.dueDate).valueOf() : null
  })
  showEditModal.value = true
}

function handleOrderChange(id) {
  currentOrder.value = orderStore.getOrderById(id)
}

function handleModalClose() {
  formRef.value?.restoreValidation()
}

function handleEditModalClose() {
  editFormRef.value?.restoreValidation()
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const order = orderStore.getOrderById(formData.customerId)
      if (!order) return

      const newPaidAmount = (order.paidAmount || 0) + (formData.payAmount || 0)
      const totalAmount = order.depositAmount + order.finalAmount
      let paymentStatus = 'partial'
      if (newPaidAmount >= totalAmount) paymentStatus = 'paid'
      else if (newPaidAmount <= 0) paymentStatus = 'unpaid'

      orderStore.updateOrder(formData.customerId, {
        paidAmount: newPaidAmount,
        paymentStatus
      })
      message.success('收款登记成功')
      showModal.value = false
    }
  })
}

function handleEditSubmit() {
  const total = editFormData.depositAmount + editFormData.finalAmount
  let paymentStatus = 'partial'
  if (editFormData.paidAmount >= total) paymentStatus = 'paid'
  else if (editFormData.paidAmount <= 0) paymentStatus = 'unpaid'

  orderStore.updateOrder(editId.value, {
    depositAmount: editFormData.depositAmount,
    finalAmount: editFormData.finalAmount,
    paidAmount: editFormData.paidAmount,
    dueDate: editFormData.dueDate ? dayjs(editFormData.dueDate).format('YYYY-MM-DD') : '',
    paymentStatus
  })
  message.success('更新成功')
  showEditModal.value = false
}
</script>

<style scoped>
.payments-page {
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
}

.stat-value.warning {
  color: #f0a020;
}

.stat-value.success {
  color: #18a058;
}

.stat-value.danger {
  color: #d03050;
}

.stat-value.error {
  color: #d03050;
}

.overdue {
  color: #d03050;
}
</style>
