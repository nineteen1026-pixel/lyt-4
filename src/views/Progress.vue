<template>
  <div class="progress-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">拍摄进度</h2>
        <p class="page-subtitle">实时跟踪每个订单的制作进度</p>
      </div>
    </div>

    <div class="kanban-board">
      <div
        v-for="step in progressSteps"
        :key="step.key"
        class="kanban-column"
      >
        <div class="column-header">
          <div class="column-title">
            <span class="status-dot" :class="`dot-${step.key}`"></span>
            {{ step.label }}
          </div>
          <n-tag size="small" type="default">{{ getOrdersByStatus(step.key).length }}</n-tag>
        </div>
        <div class="column-content">
          <div
            v-for="order in getOrdersByStatus(step.key)"
            :key="order.id"
            class="order-card"
            :class="{ 'payment-overdue': step.key === 'selecting' && !orderStore.isFinalPaymentPaid(order) }"
            @click="showOrderDetail(order)"
          >
            <div class="card-header">
              <span class="customer-name">{{ getCustomerName(order.customerId) }}</span>
              <n-tag
                v-if="step.key === 'selecting' && !orderStore.isFinalPaymentPaid(order)"
                type="error"
                size="tiny"
                style="margin-left: 8px;"
              >
                尾款未清
              </n-tag>
            </div>
            <div class="card-body">
              <div class="order-info">
                <n-icon size="14" style="margin-right: 4px;"><calendar-outline /></n-icon>
                <span>{{ formatDate(order.shootDate) }}</span>
              </div>
              <div class="order-info">
                <n-icon size="14" style="margin-right: 4px;"><pricetags-outline /></n-icon>
                <span>{{ getPackageName(order.packageId) }}</span>
              </div>
              <div v-if="step.key === 'selecting' && !orderStore.isFinalPaymentPaid(order)" class="order-info payment-warning">
                <n-icon size="14" style="margin-right: 4px;"><alert-circle-outline /></n-icon>
                <span>剩余 ¥{{ orderStore.getRemainingAmount(order).toLocaleString() }}</span>
              </div>
            </div>
            <div class="card-actions" @click.stop>
              <n-button
                v-if="canMovePrev(step.key)"
                text
                size="tiny"
                @click="movePrev(order)"
              >
                <template #icon><chevron-back-outline /></template>
                上一步
              </n-button>
              <n-button
                v-if="canMoveNext(step.key)"
                text
                size="tiny"
                type="primary"
                :disabled="step.key === 'selecting' && !orderStore.isFinalPaymentPaid(order)"
                @click="moveNext(order)"
              >
                下一步
                <template #icon><chevron-forward-outline /></template>
              </n-button>
            </div>
          </div>
          <div v-if="getOrdersByStatus(step.key).length === 0" class="empty-column">
            暂无订单
          </div>
        </div>
      </div>
    </div>

    <n-modal
      v-model:show="showDetail"
      preset="card"
      title="订单详情"
      style="width: 520px;"
    >
      <div v-if="currentOrder" class="detail-content">
        <div class="detail-item">
          <span class="label">客户：</span>
          <span class="value">{{ getCustomerName(currentOrder.customerId) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">套餐：</span>
          <span class="value">{{ getPackageName(currentOrder.packageId) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">拍摄日期：</span>
          <span class="value">{{ formatDate(currentOrder.shootDate) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">当前状态：</span>
          <n-tag :type="getStatusType(currentOrder.status)" size="small">
            {{ getStatusLabel(currentOrder.status) }}
          </n-tag>
        </div>
        <div class="detail-item">
          <span class="label">订单金额：</span>
          <span class="value">¥{{ (currentOrder.depositAmount + currentOrder.finalAmount).toLocaleString() }}</span>
        </div>
        <div class="detail-item">
          <span class="label">已付金额：</span>
          <span class="value">¥{{ (currentOrder.paidAmount || 0).toLocaleString() }}</span>
        </div>
        <div v-if="currentOrder.remark" class="detail-item remark">
          <span class="label">备注：</span>
          <span class="value">{{ currentOrder.remark }}</span>
        </div>
        <div class="progress-steps">
          <div class="steps-label">进度：</div>
          <n-steps :current="getStepIndex(currentOrder.status)" size="small">
            <n-step
              v-for="step in progressSteps"
              :key="step.key"
              :title="step.label"
            />
          </n-steps>
        </div>
      </div>
      <template #footer>
        <div style="text-align: right;">
          <n-button @click="showDetail = false">关闭</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import {
  CalendarOutline,
  PricetagsOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  AlertCircleOutline
} from '@vicons/ionicons5'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { usePackageStore } from '@/stores/package'
import { PROGRESS_STEPS, ORDER_STATUS, formatDate } from '@/utils/format'

const message = useMessage()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const packageStore = usePackageStore()

const showDetail = ref(false)
const currentOrder = ref(null)

const progressSteps = PROGRESS_STEPS

function getOrdersByStatus(status) {
  return orderStore.orders.filter(o => o.status === status)
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

function getStepIndex(status) {
  return progressSteps.findIndex(s => s.key === status)
}

function canMovePrev(status) {
  const index = getStepIndex(status)
  return index > 0
}

function canMoveNext(status) {
  const index = getStepIndex(status)
  return index < progressSteps.length - 1
}

function movePrev(order) {
  const currentIndex = getStepIndex(order.status)
  if (currentIndex > 0) {
    const newStatus = progressSteps[currentIndex - 1].key
    const result = orderStore.updateOrder(order.id, { status: newStatus })
    if (result.success) {
      message.success(`已移至「${progressSteps[currentIndex - 1].label}」`)
    } else {
      message.error(result.message)
    }
  }
}

function moveNext(order) {
  const currentIndex = getStepIndex(order.status)
  if (currentIndex < progressSteps.length - 1) {
    const newStatus = progressSteps[currentIndex + 1].key
    const result = orderStore.updateOrder(order.id, { status: newStatus })
    if (result.success) {
      message.success(`已移至「${progressSteps[currentIndex + 1].label}」`)
    } else {
      message.error(result.message)
    }
  }
}

function showOrderDetail(order) {
  currentOrder.value = order
  showDetail.value = true
}
</script>

<style scoped>
.progress-page {
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

.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 20px;
}

.kanban-column {
  flex: 0 0 240px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 180px);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: white;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}

.column-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot-pending { background: #f0a020; }
.dot-confirmed { background: #2080f0; }
.dot-shooting { background: #18a058; }
.dot-selecting { background: #722ed1; }
.dot-editing { background: #2080f0; }
.dot-delivering { background: #f0a020; }
.dot-completed { background: #52c41a; }

.column-content {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.order-card {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.order-card.payment-overdue {
  border: 2px solid #d03050;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.order-card.payment-overdue:hover {
  box-shadow: 0 4px 12px rgba(208, 48, 80, 0.2);
}

.payment-warning {
  color: #d03050;
  font-weight: 500;
}

.card-header {
  margin-bottom: 8px;
}

.customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.card-body {
  margin-bottom: 10px;
}

.order-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.empty-column {
  text-align: center;
  color: #bbb;
  font-size: 12px;
  padding: 40px 0;
}

.detail-content {
  padding: 8px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-item .label {
  width: 80px;
  color: #999;
  flex-shrink: 0;
}

.detail-item .value {
  color: #333;
  flex: 1;
}

.detail-item.remark .value {
  color: #666;
  line-height: 1.6;
}

.progress-steps {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.steps-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}
</style>
