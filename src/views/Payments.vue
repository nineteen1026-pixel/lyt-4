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
        <template #paidProgress="{ row }">
          <div class="paid-progress">
            <div class="progress-text">
              <span>¥{{ (row.paidAmount || 0).toLocaleString() }}</span>
              <span class="progress-sep">/</span>
              <span>¥{{ (row.depositAmount + row.finalAmount).toLocaleString() }}</span>
            </div>
            <n-progress
              :percentage="Math.min(100, Math.round(((row.paidAmount || 0) / (row.depositAmount + row.finalAmount)) * 100))"
              :type="getProgressType(row.paymentStatus)"
              :show-indicator="false"
              height="6"
              style="margin-top: 4px;"
            />
            <div class="payment-count">
              已分 {{ getPaymentRecordCount(row.id) }} 次收款
            </div>
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
            <n-button
              text
              size="small"
              @click="openRecordModal(row)"
            >
              收款记录
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
        <n-form-item v-if="!isEdit && currentOrder" label="订单信息">
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">客户：</span>
              <span>{{ getCustomerName(currentOrder.customerId) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">已收金额：</span>
              <span class="success-text">¥{{ currentPaidAmount.toLocaleString() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">待收金额：</span>
              <span class="danger-text">¥{{ remainingAmount.toLocaleString() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">收款次数：</span>
              <span>{{ currentRecordCount }} 次</span>
            </div>
          </div>
        </n-form-item>
        <n-form-item label="本次收款" path="payAmount">
          <n-input-number
            v-model:value="formData.payAmount"
            :min="0"
            :max="remainingAmount || undefined"
            placeholder="请输入收款金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
          <div v-if="remainingAmount > 0" class="quick-amount">
            <n-space>
              <n-button size="tiny" type="default" @click="formData.payAmount = Math.round(remainingAmount * 0.3)">
                30%
              </n-button>
              <n-button size="tiny" type="default" @click="formData.payAmount = Math.round(remainingAmount * 0.5)">
                50%
              </n-button>
              <n-button size="tiny" type="default" @click="formData.payAmount = remainingAmount">
                全部结清
              </n-button>
            </n-space>
          </div>
        </n-form-item>
        <n-form-item label="收款方式" path="paymentMethod">
          <n-select
            v-model:value="formData.paymentMethod"
            placeholder="请选择收款方式"
            :options="paymentMethodOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="收款日期" path="payDate">
          <n-date-picker
            v-model:value="formData.payDate"
            type="date"
            placeholder="请选择收款日期"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息（如：定金、尾款、第几期等）"
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
      v-model:show="showRecordModal"
      preset="card"
      :title="`${recordCustomerName} - 收款记录`"
      style="width: 600px;"
    >
      <div v-if="currentRecordOrder" class="record-summary">
        <n-space justify="space-between">
          <div class="summary-item">
            <div class="summary-label">订单总额</div>
            <div class="summary-value warning">
              ¥{{ (currentRecordOrder.depositAmount + currentRecordOrder.finalAmount).toLocaleString() }}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">已收金额</div>
            <div class="summary-value success">
              ¥{{ (currentRecordOrder.paidAmount || 0).toLocaleString() }}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">待收金额</div>
            <div class="summary-value danger">
              ¥{{ (currentRecordOrder.depositAmount + currentRecordOrder.finalAmount - (currentRecordOrder.paidAmount || 0)).toLocaleString() }}
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">收款次数</div>
            <div class="summary-value info">{{ currentRecords.length }} 次</div>
          </div>
        </n-space>
      </div>

      <div class="record-list">
        <div v-if="currentRecords.length === 0" class="empty-record">
          <n-empty description="暂无收款记录" />
        </div>
        <n-timeline v-else>
          <n-timeline-item
            v-for="(record, index) in currentRecords"
            :key="record.id"
            :type="getTimelineType(index, currentRecords.length)"
          >
            <template #title>
              <div class="record-title">
                <span class="record-amount">¥{{ record.amount.toLocaleString() }}</span>
                <n-tag :type="getPaymentMethodType(record.paymentMethod)" size="tiny">
                  {{ getPaymentMethodLabel(record.paymentMethod) }}
                </n-tag>
              </div>
            </template>
            <template #time>
              {{ formatDate(record.payDate) }}
            </template>
            <div class="record-content">
              <div v-if="record.remark" class="record-remark">
                {{ record.remark }}
              </div>
              <div class="record-actions">
                <n-space>
                  <n-button
                    text
                    size="tiny"
                    type="primary"
                    @click="openEditRecordModal(record)"
                  >
                    编辑
                  </n-button>
                  <n-popconfirm
                    @positive-click="handleDeleteRecord(record.id)"
                    positive-text="确认删除"
                    negative-text="取消"
                  >
                    <template #trigger>
                      <n-button text size="tiny" type="error">
                        删除
                      </n-button>
                    </template>
                    确定要删除这条收款记录吗？删除后订单已收金额将自动重新计算。
                  </n-popconfirm>
                </n-space>
              </div>
            </div>
          </n-timeline-item>
        </n-timeline>
      </div>

      <template #footer>
        <div style="text-align: right;">
          <n-button
            v-if="currentRecordOrder && currentRecordOrder.paymentStatus !== 'paid'"
            type="primary"
            style="margin-right: 12px;"
            @click="openPayModalFromRecord"
          >
            继续收款
          </n-button>
          <n-button @click="showRecordModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showEditRecordModal"
      preset="card"
      title="编辑收款记录"
      style="width: 480px;"
      @after-leave="handleEditRecordModalClose"
    >
      <n-form
        ref="editRecordFormRef"
        :model="editRecordFormData"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="收款金额">
          <n-input-number
            v-model:value="editRecordFormData.amount"
            :min="0"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="收款方式">
          <n-select
            v-model:value="editRecordFormData.paymentMethod"
            :options="paymentMethodOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="收款日期">
          <n-date-picker
            v-model:value="editRecordFormData.payDate"
            type="date"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="editRecordFormData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showEditRecordModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditRecordSubmit">确认</n-button>
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
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            提示：已付金额会根据收款记录自动计算，手动修改不会影响收款记录
          </div>
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { usePaymentRecordStore } from '@/stores/paymentRecord'
import { PAYMENT_STATUS, PAYMENT_METHOD, formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const paymentRecordStore = usePaymentRecordStore()

const filterStatus = ref('all')
const showModal = ref(false)
const showRecordModal = ref(false)
const showEditRecordModal = ref(false)
const showEditModal = ref(false)
const isEdit = ref(false)
const currentOrder = ref(null)
const currentRecordOrder = ref(null)
const formRef = ref(null)
const editRecordFormRef = ref(null)
const editFormRef = ref(null)
const editId = ref('')
const editingRecordId = ref('')

const formData = reactive({
  customerId: '',
  payAmount: null,
  payDate: dayjs().valueOf(),
  paymentMethod: 'wechat',
  remark: ''
})

const editRecordFormData = reactive({
  amount: 0,
  payDate: null,
  paymentMethod: 'wechat',
  remark: ''
})

const editFormData = reactive({
  depositAmount: 0,
  finalAmount: 0,
  paidAmount: 0,
  dueDate: null
})

const rules = {
  customerId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  payAmount: [{ required: true, message: '请输入收款金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择收款方式', trigger: 'change' }]
}

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const paymentMethodOptions = Object.entries(PAYMENT_METHOD).map(([key, value]) => ({
  label: value.label,
  value: key
}))

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

const remainingAmount = computed(() => {
  if (!currentOrder.value) return 0
  const total = currentOrder.value.depositAmount + currentOrder.value.finalAmount
  return Math.max(0, total - currentPaidAmount.value)
})

const currentRecordCount = computed(() => {
  if (!formData.customerId) return 0
  return paymentRecordStore.getPaymentRecordsByOrderId(formData.customerId).length
})

const currentRecords = computed(() => {
  if (!currentRecordOrder.value) return []
  return paymentRecordStore.getPaymentRecordsByOrderId(currentRecordOrder.value.id)
})

const recordCustomerName = computed(() => {
  if (!currentRecordOrder.value) return ''
  return getCustomerName(currentRecordOrder.value.customerId)
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
    title: '收款进度',
    key: 'paidProgress',
    width: 200
  },
  { title: '收款状态', key: 'paymentStatus', width: 100 },
  { title: '尾款到期日', key: 'dueDate', width: 140 },
  { title: '操作', key: 'actions', width: 220 }
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

function getPaymentMethodLabel(method) {
  return PAYMENT_METHOD[method]?.label || method
}

function getPaymentMethodType(method) {
  return PAYMENT_METHOD[method]?.color || 'default'
}

function getProgressType(status) {
  if (status === 'paid') return 'success'
  if (status === 'partial') return 'warning'
  return 'error'
}

function getTimelineType(index, total) {
  if (index === total - 1) return 'success'
  if (index === 0) return 'primary'
  return 'default'
}

function getPaymentRecordCount(orderId) {
  return paymentRecordStore.getPaymentRecordsByOrderId(orderId).length
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
    payDate: dayjs().valueOf(),
    paymentMethod: 'wechat',
    remark: ''
  })
  showModal.value = true
}

function openPayModal(row) {
  isEdit.value = false
  currentOrder.value = row
  formData.customerId = row.id
  formData.payAmount = null
  formData.payDate = dayjs().valueOf()
  formData.paymentMethod = 'wechat'
  formData.remark = ''
  showModal.value = true
}

function openRecordModal(row) {
  currentRecordOrder.value = row
  showRecordModal.value = true
}

function openPayModalFromRecord() {
  showRecordModal.value = false
  if (currentRecordOrder.value) {
    openPayModal(currentRecordOrder.value)
  }
}

function openEditRecordModal(record) {
  editingRecordId.value = record.id
  Object.assign(editRecordFormData, {
    amount: record.amount,
    payDate: dayjs(record.payDate).valueOf(),
    paymentMethod: record.paymentMethod,
    remark: record.remark || ''
  })
  showEditRecordModal.value = true
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

function handleEditRecordModalClose() {
  editRecordFormRef.value?.restoreValidation()
  editingRecordId.value = ''
}

function handleEditModalClose() {
  editFormRef.value?.restoreValidation()
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const order = orderStore.getOrderById(formData.customerId)
      if (!order) return

      if (formData.payAmount > remainingAmount.value) {
        message.warning(`收款金额不能超过待收金额 ¥${remainingAmount.value.toLocaleString()}`)
        return
      }

      const newRecord = paymentRecordStore.addPaymentRecord({
        orderId: formData.customerId,
        amount: formData.payAmount,
        payDate: dayjs(formData.payDate).format('YYYY-MM-DD'),
        paymentMethod: formData.paymentMethod,
        remark: formData.remark
      })

      if (newRecord) {
        message.success('收款登记成功')
        showModal.value = false
      } else {
        message.error('收款登记失败')
      }
    }
  })
}

function handleEditRecordSubmit() {
  if (!editingRecordId.value) return

  const result = paymentRecordStore.updatePaymentRecord(editingRecordId.value, {
    amount: editRecordFormData.amount,
    payDate: dayjs(editRecordFormData.payDate).format('YYYY-MM-DD'),
    paymentMethod: editRecordFormData.paymentMethod,
    remark: editRecordFormData.remark
  })

  if (result.success) {
    message.success('更新成功')
    showEditRecordModal.value = false
  } else {
    message.error(result.message)
  }
}

function handleDeleteRecord(recordId) {
  const success = paymentRecordStore.deletePaymentRecord(recordId)
  if (success) {
    message.success('删除成功，已自动重新计算订单金额')
  } else {
    message.error('删除失败')
  }
}

function handleEditSubmit() {
  const total = editFormData.depositAmount + editFormData.finalAmount
  let paymentStatus = 'partial'
  if (editFormData.paidAmount >= total) paymentStatus = 'paid'
  else if (editFormData.paidAmount <= 0) paymentStatus = 'unpaid'

  const result = orderStore.updateOrder(editId.value, {
    depositAmount: editFormData.depositAmount,
    finalAmount: editFormData.finalAmount,
    paidAmount: editFormData.paidAmount,
    dueDate: editFormData.dueDate ? dayjs(editFormData.dueDate).format('YYYY-MM-DD') : '',
    paymentStatus
  })

  if (result.success) {
    paymentRecordStore.recalculateOrderPayment(editId.value)
    message.success('更新成功')
    showEditModal.value = false
  } else {
    message.error(result.message)
  }
}

function checkAndOpenRegisterModal() {
  const orderId = route.query.orderId
  const action = route.query.action
  if (orderId && action === 'register') {
    const order = orderStore.getOrderById(orderId)
    if (order && order.paymentStatus !== 'paid') {
      openPayModal(order)
    }
  }
}

function clearRouteQuery() {
  if (route.query.orderId || route.query.action) {
    router.replace({ path: '/payments', query: {} })
  }
}

watch(
  () => route.query,
  () => {
    checkAndOpenRegisterModal()
  }
)

onMounted(() => {
  checkAndOpenRegisterModal()
})

watch(showModal, (newVal) => {
  if (!newVal) {
    clearRouteQuery()
  }
})
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

.stat-value.info {
  color: #2080f0;
}

.overdue {
  color: #d03050;
}

.paid-progress {
  font-size: 13px;
}

.progress-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.progress-sep {
  color: #999;
}

.payment-count {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.order-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.info-label {
  color: #999;
}

.success-text {
  color: #18a058;
  font-weight: 500;
}

.danger-text {
  color: #d03050;
  font-weight: 500;
}

.quick-amount {
  margin-top: 8px;
}

.record-summary {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
}

.summary-value.warning {
  color: #f0a020;
}

.summary-value.success {
  color: #18a058;
}

.summary-value.danger {
  color: #d03050;
}

.summary-value.info {
  color: #2080f0;
}

.record-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-record {
  padding: 40px 0;
}

.record-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-amount {
  font-size: 16px;
  font-weight: 600;
  color: #18a058;
}

.record-content {
  margin-top: 4px;
}

.record-remark {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.record-actions {
  margin-top: 4px;
}
</style>
