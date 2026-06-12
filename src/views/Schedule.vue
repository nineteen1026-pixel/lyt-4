<template>
  <div class="schedule-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">档期项目</h2>
        <p class="page-subtitle">共 {{ orderStore.orders.length }} 个订单</p>
      </div>
      <div class="header-actions">
        <n-radio-group v-model:value="viewMode" size="medium" style="margin-right: 16px;">
          <n-radio-button value="calendar">日历视图</n-radio-button>
          <n-radio-button value="list">列表视图</n-radio-button>
        </n-radio-group>
        <n-button type="primary" @click="openAddModal">
          <template #icon>
            <add-outline />
          </template>
          新增档期
        </n-button>
      </div>
    </div>

    <n-alert
      v-if="mismatchedOrders.length > 0"
      type="warning"
      closable
      style="margin-bottom: 16px;"
    >
      <template #header>婚期与拍摄日不一致提醒</template>
      以下订单的拍摄日期与客户婚期不一致，请核实避免排错档期：
      <div style="margin-top: 6px;">
        <span
          v-for="item in mismatchedOrders"
          :key="item.orderId"
          style="margin-right: 16px; font-size: 13px;"
        >
          <strong>{{ item.customerName }}</strong>：婚期 {{ item.weddingDate }}，拍摄日 {{ item.shootDate }}
        </span>
      </div>
    </n-alert>

    <n-card v-if="viewMode === 'calendar'">
      <div class="calendar-header">
        <n-button text size="small" @click="prevMonth">
          <template #icon><chevron-back-outline /></template>
          上个月
        </n-button>
        <span class="month-title">{{ currentYear }}年{{ currentMonth }}月</span>
        <n-button text size="small" @click="nextMonth">
          下个月
          <template #icon><chevron-forward-outline /></template>
        </n-button>
      </div>
      <div class="calendar-weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday-cell">{{ day }}</div>
      </div>
      <div class="calendar-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="['day-cell', { 
            'other-month': !day.currentMonth,
            'today': day.isToday,
            'has-order': day.orderCount > 0
          }]"
          @click="day.orderCount > 0 && showDayOrders(day.date)"
        >
          <div class="day-number">{{ day.date.getDate() }}</div>
          <div v-if="day.orderCount > 0" class="day-orders">
            <div
              v-for="order in day.orders.slice(0, 2)"
              :key="order.id"
              :class="['order-tag', `status-${order.status}`]"
            >
              {{ getCustomerName(order.customerId) }}
            </div>
            <div v-if="day.orderCount > 2" class="more-tag">
              还有 {{ day.orderCount - 2 }} 单
            </div>
          </div>
        </div>
      </div>
    </n-card>

    <n-card v-else>
      <n-data-table
        :columns="columns"
        :data="sortedOrders"
        :pagination="pagination"
        :bordered="false"
        size="medium"
        striped
      >
        <template #status="{ row }">
          <n-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </n-tag>
        </template>
        <template #paymentStatus="{ row }">
          <n-tag :type="getPaymentType(row.paymentStatus)" size="small">
            {{ getPaymentLabel(row.paymentStatus) }}
          </n-tag>
        </template>
        <template #actions="{ row }">
          <n-button text size="small" type="primary" style="margin-right: 8px;" @click="openEditModal(row)">
            编辑
          </n-button>
          <n-button text size="small" type="error" @click="handleDelete(row)">
            删除
          </n-button>
        </template>
      </n-data-table>
    </n-card>

    <n-modal
      v-model:show="showDayModal"
      preset="card"
      :title="`${selectedDate} 的档期`"
      style="width: 560px;"
    >
      <div v-if="dayOrders.length === 0" class="empty-day">
        当天暂无档期安排
      </div>
      <div v-else class="day-order-list">
        <div v-for="order in dayOrders" :key="order.id" class="day-order-item">
          <div class="order-info">
            <div class="order-customer">{{ getCustomerName(order.customerId) }}</div>
            <div class="order-package">{{ getPackageName(order.packageId) }}</div>
          </div>
          <n-tag :type="getStatusType(order.status)" size="small">
            {{ getStatusLabel(order.status) }}
          </n-tag>
        </div>
      </div>
      <template #footer>
        <div style="text-align: right;">
          <n-button type="primary" @click="showDayModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑档期' : '新增档期'"
      style="width: 560px;"
      @after-leave="handleModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="拍摄日期" path="shootDate">
          <n-date-picker
            v-model:value="formData.shootDate"
            type="date"
            placeholder="请选择拍摄日期"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="客户" path="customerId">
          <n-select
            v-model:value="formData.customerId"
            placeholder="请选择客户"
            :options="customerOptions"
            filterable
          />
        </n-form-item>
        <n-alert
          v-if="formDateMismatch"
          type="warning"
          style="margin-bottom: 12px;"
        >
          该客户婚期为 <strong>{{ formWeddingDate }}</strong>，与所选拍摄日期不一致，请确认是否排错档期
        </n-alert>
        <n-form-item label="套餐" path="packageId">
          <n-select
            v-model:value="formData.packageId"
            placeholder="请选择套餐"
            :options="packageOptions"
            @update:value="handlePackageChange"
          />
        </n-form-item>
        <n-form-item label="订单状态" path="status">
          <n-select
            v-model:value="formData.status"
            :options="statusOptions"
          />
        </n-form-item>
        <n-form-item label="定金金额" path="depositAmount">
          <n-input-number
            v-model:value="formData.depositAmount"
            :min="0"
            placeholder="请输入定金金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="尾款金额" path="finalAmount">
          <n-input-number
            v-model:value="formData.finalAmount"
            :min="0"
            placeholder="请输入尾款金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="已付金额" path="paidAmount">
          <n-input-number
            v-model:value="formData.paidAmount"
            :min="0"
            placeholder="请输入已付金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="尾款到期日" path="dueDate">
          <n-date-picker
            v-model:value="formData.dueDate"
            type="date"
            placeholder="请选择尾款到期日"
            style="width: 100%;"
          />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import {
  AddOutline,
  ChevronBackOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { usePackageStore } from '@/stores/package'
import { formatDate, ORDER_STATUS, PAYMENT_STATUS } from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const packageStore = usePackageStore()

const viewMode = ref('calendar')
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const showModal = ref(false)
const showDayModal = ref(false)
const selectedDate = ref('')
const dayOrders = ref([])
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const formData = reactive({
  shootDate: null,
  customerId: '',
  packageId: '',
  status: 'pending',
  depositAmount: 0,
  finalAmount: 0,
  paidAmount: 0,
  dueDate: null,
  remark: ''
})

const rules = {
  shootDate: [{ required: true, message: '请选择拍摄日期', trigger: 'change' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  packageId: [{ required: true, message: '请选择套餐', trigger: 'change' }]
}

const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '待拍摄', value: 'shooting' },
  { label: '待选片', value: 'selecting' },
  { label: '精修中', value: 'editing' },
  { label: '待交付', value: 'delivering' },
  { label: '已完成', value: 'completed' }
]

const formWeddingDate = computed(() => {
  if (!formData.customerId) return ''
  const customer = customerStore.getCustomerById(formData.customerId)
  return customer?.weddingDate ? formatDate(customer.weddingDate) : ''
})

const formDateMismatch = computed(() => {
  if (!formData.customerId || !formData.shootDate || !formWeddingDate.value) return false
  const customer = customerStore.getCustomerById(formData.customerId)
  if (!customer?.weddingDate) return false
  const selectedShootDate = dayjs(formData.shootDate).format('YYYY-MM-DD')
  return customer.weddingDate !== selectedShootDate
})

const customerOptions = computed(() =>
  customerStore.customers.map(c => ({
    label: c.name,
    value: c.id
  }))
)

const packageOptions = computed(() =>
  packageStore.activePackages.map(p => ({
    label: `${p.name} - ¥${p.price}`,
    value: p.id,
    price: p.price
  }))
)

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const mismatchedOrders = computed(() => {
  return orderStore.orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .map(o => {
      const customer = customerStore.getCustomerById(o.customerId)
      if (!customer || !customer.weddingDate || !o.shootDate) return null
      if (customer.weddingDate !== o.shootDate) {
        return {
          orderId: o.id,
          customerName: customer.name,
          weddingDate: customer.weddingDate,
          shootDate: o.shootDate
        }
      }
      return null
    })
    .filter(Boolean)
})

const sortedOrders = computed(() =>
  [...orderStore.orders].sort((a, b) => new Date(b.shootDate) - new Date(a.shootDate))
)

const columns = [
  {
    title: '拍摄日期',
    key: 'shootDate',
    width: 120,
    render: (row) => formatDate(row.shootDate)
  },
  {
    title: '客户',
    key: 'customerId',
    width: 160,
    render: (row) => getCustomerName(row.customerId)
  },
  {
    title: '套餐',
    key: 'packageId',
    render: (row) => getPackageName(row.packageId)
  },
  { title: '状态', key: 'status', width: 100 },
  {
    title: '订单金额',
    key: 'amount',
    width: 120,
    render: (row) => `¥${(row.depositAmount + row.finalAmount).toLocaleString()}`
  },
  { title: '收款状态', key: 'paymentStatus', width: 100 },
  {
    title: '操作',
    key: 'actions',
    width: 140
  }
]

const calendarDays = computed(() => {
  const days = []
  const firstDay = dayjs(`${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-01`)
  const startDay = firstDay.subtract(firstDay.day(), 'day')
  
  for (let i = 0; i < 42; i++) {
    const date = startDay.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')
    const orders = orderStore.getOrdersByDate(dateStr)
    
    days.push({
      date: date.toDate(),
      currentMonth: date.month() + 1 === currentMonth.value,
      isToday: date.isSame(dayjs(), 'day'),
      orderCount: orders.length,
      orders: orders
    })
  }
  
  return days
})

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

function getPaymentLabel(status) {
  return PAYMENT_STATUS[status]?.label || status
}

function getPaymentType(status) {
  return PAYMENT_STATUS[status]?.color || 'default'
}

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function showDayOrders(date) {
  selectedDate.value = dayjs(date).format('YYYY年MM月DD日')
  dayOrders.value = orderStore.getOrdersByDate(dayjs(date).format('YYYY-MM-DD'))
  showDayModal.value = true
}

function openAddModal() {
  isEdit.value = false
  editId.value = ''
  resetForm()
  showModal.value = true
}

function openEditModal(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(formData, {
    shootDate: row.shootDate ? dayjs(row.shootDate).valueOf() : null,
    customerId: row.customerId,
    packageId: row.packageId,
    status: row.status,
    depositAmount: row.depositAmount || 0,
    finalAmount: row.finalAmount || 0,
    paidAmount: row.paidAmount || 0,
    dueDate: row.dueDate ? dayjs(row.dueDate).valueOf() : null,
    remark: row.remark || ''
  })
  showModal.value = true
}

function resetForm() {
  Object.assign(formData, {
    shootDate: null,
    customerId: '',
    packageId: '',
    status: 'pending',
    depositAmount: 0,
    finalAmount: 0,
    paidAmount: 0,
    dueDate: null,
    remark: ''
  })
  formRef.value?.restoreValidation()
}

function handleModalClose() {
  resetForm()
}

function handlePackageChange(value) {
  const pkg = packageStore.getPackageById(value)
  if (pkg) {
    formData.depositAmount = Math.floor(pkg.price * 0.3)
    formData.finalAmount = pkg.price - formData.depositAmount
  }
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const data = {
        ...formData,
        shootDate: formData.shootDate ? dayjs(formData.shootDate).format('YYYY-MM-DD') : '',
        dueDate: formData.dueDate ? dayjs(formData.dueDate).format('YYYY-MM-DD') : '',
        paymentStatus: calculatePaymentStatus()
      }

      if (isEdit.value) {
        const result = orderStore.updateOrder(editId.value, data)
        if (result.success) {
          message.success('更新成功')
          showModal.value = false
        } else {
          message.error(result.message)
        }
        return
      } else {
        if (orderStore.checkDateConflict(data.shootDate)) {
          dialog.warning({
            title: '日期冲突',
            content: '该日期已有其他档期，确定还要添加吗？',
            positiveText: '继续添加',
            negativeText: '取消',
            onPositiveClick: () => {
              orderStore.addOrder(data)
              message.success('添加成功')
              showModal.value = false
            }
          })
          return
        }
        orderStore.addOrder(data)
        message.success('添加成功')
      }
      showModal.value = false
    }
  })
}

function calculatePaymentStatus() {
  const total = formData.depositAmount + formData.finalAmount
  if (formData.paidAmount >= total) return 'paid'
  if (formData.paidAmount > 0) return 'partial'
  return 'unpaid'
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除该档期吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      orderStore.deleteOrder(row.id)
      message.success('删除成功')
    }
  })
}

onMounted(() => {
  customerStore.fetchCustomers()
  packageStore.fetchPackages()
  orderStore.fetchOrders()
})
</script>

<style scoped>
.schedule-page {
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

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-cell {
  text-align: center;
  font-size: 13px;
  color: #999;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  min-height: 90px;
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.day-cell:hover {
  border-color: #D4A574;
  background: #fdfaf7;
}

.day-cell.other-month {
  background: #fafafa;
  color: #ccc;
}

.day-cell.other-month .day-number {
  color: #ccc;
}

.day-cell.today {
  border-color: #D4A574;
  background: #fff8f0;
}

.day-cell.today .day-number {
  color: #D4A574;
  font-weight: 600;
}

.day-cell.has-order {
  background: #fdfaf7;
}

.day-number {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.order-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.status-pending {
  background: #f0a020;
}

.status-confirmed {
  background: #2080f0;
}

.status-shooting {
  background: #18a058;
}

.status-selecting {
  background: #722ed1;
}

.status-editing {
  background: #2080f0;
}

.status-delivering {
  background: #f0a020;
}

.status-completed {
  background: #52c41a;
}

.more-tag {
  font-size: 11px;
  color: #999;
}

.empty-day {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.day-order-list {
  max-height: 300px;
  overflow-y: auto;
}

.day-order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 8px;
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
</style>
