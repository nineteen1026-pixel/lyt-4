<template>
  <div class="retouch-board-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">精修交付看板</h2>
        <p class="page-subtitle">跟踪修图批次、客户反馈、返工次数和交付日期</p>
      </div>
      <n-button type="primary" @click="handleAddBatch">
        <template #icon><add-outline /></template>
        新建批次
      </n-button>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <n-icon size="22"><images-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ retouchStore.totalBatches }}</div>
            <div class="stat-label">总批次</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon progress">
            <n-icon size="22"><color-filter-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ retouchStore.inProgressBatches.length }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon overdue">
            <n-icon size="22"><time-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ retouchStore.overdueBatches.length }}</div>
            <div class="stat-label">已逾期</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon urgent">
            <n-icon size="22"><flash-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ retouchStore.highPriorityBatches.length }}</div>
            <div class="stat-label">特急件</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon rework">
            <n-icon size="22"><refresh-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ retouchStore.totalReworkCount }}</div>
            <div class="stat-label">总返工次数</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon avg">
            <n-icon size="22"><bar-chart-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ retouchStore.avgReworkPerBatch }}</div>
            <div class="stat-label">平均返工/批</div>
          </div>
        </div>
      </n-card>
    </div>

    <div class="kanban-board">
      <div
        v-for="step in retouchSteps"
        :key="step.key"
        class="kanban-column"
      >
        <div class="column-header">
          <div class="column-title">
            <span class="status-dot" :class="`dot-${step.key}`"></span>
            {{ step.label }}
          </div>
          <n-tag size="small" type="default">{{ getBatchesByStatus(step.key).length }}</n-tag>
        </div>
        <div class="column-content">
          <div
            v-for="batch in getBatchesByStatus(step.key)"
            :key="batch.id"
            class="batch-card"
            :class="{
              'overdue': isOverdue(batch),
              'priority-urgent': batch.priority === 'urgent',
              'priority-super': batch.priority === 'super_urgent'
            }"
            @click="showBatchDetail(batch)"
          >
            <div class="card-header">
              <span class="customer-name">{{ getCustomerName(batch.orderId) }}</span>
              <n-tag
                v-if="batch.priority !== 'normal'"
                :type="getPriorityType(batch.priority)"
                size="tiny"
              >
                {{ getPriorityLabel(batch.priority) }}
              </n-tag>
            </div>
            <div class="card-body">
              <div class="batch-info">
                <n-icon size="13" style="margin-right: 4px;"><images-outline /></n-icon>
                <span>{{ batch.batchName }} · {{ batch.photoCount }}张</span>
              </div>
              <div class="batch-info">
                <n-icon size="13" style="margin-right: 4px;"><person-outline /></n-icon>
                <span>{{ batch.assignedRetoucher || '待分配' }}</span>
              </div>
              <div class="batch-info">
                <n-icon size="13" style="margin-right: 4px;"><calendar-outline /></n-icon>
                <span :class="{ 'overdue-text': isOverdue(batch) }">
                  {{ isOverdue(batch) ? '已逾期' : '截止' }} {{ formatDate(batch.dueDate) }}
                </span>
              </div>
              <div v-if="batch.reworkCount > 0" class="batch-info rework-info">
                <n-icon size="13" style="margin-right: 4px;"><refresh-outline /></n-icon>
                <span>返工 {{ batch.reworkCount }} 次</span>
              </div>
            </div>
            <div class="card-progress">
              <div class="progress-label">
                <span>精修进度</span>
                <span>{{ batch.retouchedCount }}/{{ batch.photoCount }}</span>
              </div>
              <n-progress
                type="line"
                :percentage="Math.round((batch.retouchedCount / batch.photoCount) * 100)"
                :show-indicator="false"
                :color="getProgressColor(batch)"
                height="4"
              />
            </div>
            <div class="card-actions" @click.stop>
              <n-button
                v-if="canMovePrev(step.key)"
                text
                size="tiny"
                @click="movePrev(batch)"
              >
                <template #icon><chevron-back-outline /></template>
                上一步
              </n-button>
              <n-button
                v-if="canMoveNext(step.key)"
                text
                size="tiny"
                type="primary"
                @click="moveNext(batch)"
              >
                下一步
                <template #icon><chevron-forward-outline /></template>
              </n-button>
            </div>
          </div>
          <div v-if="getBatchesByStatus(step.key).length === 0" class="empty-column">
            暂无批次
          </div>
        </div>
      </div>
    </div>

    <n-modal
      v-model:show="showDetail"
      preset="card"
      title="批次详情"
      style="width: 640px;"
    >
      <div v-if="currentBatch" class="detail-content">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">客户：</span>
              <span class="value">{{ getCustomerName(currentBatch.orderId) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">批次：</span>
              <span class="value">{{ currentBatch.batchName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">照片数量：</span>
              <span class="value">{{ currentBatch.photoCount }} 张</span>
            </div>
            <div class="detail-item">
              <span class="label">精修进度：</span>
              <span class="value">{{ currentBatch.retouchedCount }}/{{ currentBatch.photoCount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">修图师：</span>
              <span class="value">{{ currentBatch.assignedRetoucher || '待分配' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">优先级：</span>
              <n-tag :type="getPriorityType(currentBatch.priority)" size="small">
                {{ getPriorityLabel(currentBatch.priority) }}
              </n-tag>
            </div>
            <div class="detail-item">
              <span class="label">送修日期：</span>
              <span class="value">{{ formatDate(currentBatch.sendDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">截止日期：</span>
              <span class="value" :class="{ 'overdue-text': isOverdue(currentBatch) }">
                {{ formatDate(currentBatch.dueDate) }}
                <span v-if="isOverdue(currentBatch)" style="color: #d03050;">（已逾期）</span>
              </span>
            </div>
            <div class="detail-item">
              <span class="label">交付日期：</span>
              <span class="value">{{ currentBatch.deliveryDate ? formatDate(currentBatch.deliveryDate) : '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">返工次数：</span>
              <span class="value rework-count">{{ currentBatch.reworkCount }} 次</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">
            客户反馈
            <n-button size="tiny" type="primary" style="margin-left: auto;" @click="handleAddFeedback">
              <template #icon><add-outline /></template>
              添加反馈
            </n-button>
          </div>
          <div v-if="batchFeedbacks.length === 0" class="empty-feedback">
            暂无反馈记录
          </div>
          <div v-else class="feedback-list">
            <div
              v-for="feedback in batchFeedbacks"
              :key="feedback.id"
              class="feedback-item"
              :class="{ 'resolved': feedback.status === 'resolved' }"
            >
              <div class="feedback-header">
                <n-tag :type="feedback.status === 'resolved' ? 'success' : 'warning'" size="tiny">
                  {{ feedback.status === 'resolved' ? '已解决' : '待处理' }}
                </n-tag>
                <span class="feedback-type">{{ getFeedbackTypeLabel(feedback.type) }}</span>
                <span class="feedback-time">{{ formatDateTime(feedback.createdAt) }}</span>
              </div>
              <div class="feedback-content">{{ feedback.content }}</div>
              <div class="feedback-photos">
                涉及照片：第 {{ feedback.photoIndices?.join('、') || '-' }} 张
              </div>
              <div v-if="feedback.status === 'pending'" class="feedback-actions" @click.stop>
                <n-button size="tiny" type="primary" @click="resolveFeedback(feedback.id)">
                  标记已解决
                </n-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentBatch.remark" class="detail-section">
          <div class="section-title">备注</div>
          <div class="remark-text">{{ currentBatch.remark }}</div>
        </div>

        <div class="detail-section">
          <n-steps :current="getStepIndex(currentBatch.status)" size="small">
            <n-step
              v-for="step in retouchSteps"
              :key="step.key"
              :title="step.label"
            />
          </n-steps>
        </div>
      </div>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 8px;" @click="showDetail = false">关闭</n-button>
          <n-button type="primary" @click="handleEditBatch">编辑</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showForm"
      preset="card"
      :title="isEdit ? '编辑批次' : '新建批次'"
      style="width: 520px;"
      @mask-click="showForm = false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="关联订单" path="orderId">
          <n-select
            v-model:value="formData.orderId"
            :options="orderOptions"
            placeholder="请选择订单"
          />
        </n-form-item>
        <n-form-item label="批次名称" path="batchName">
          <n-input v-model:value="formData.batchName" placeholder="如：1批、2批" />
        </n-form-item>
        <n-form-item label="照片数量" path="photoCount">
          <n-input-number v-model:value="formData.photoCount" :min="1" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="修图师" path="assignedRetoucher">
          <n-select
            v-model:value="formData.assignedRetoucher"
            :options="retoucherOptions"
            placeholder="请选择修图师"
            clearable
          />
        </n-form-item>
        <n-form-item label="优先级" path="priority">
          <n-select v-model:value="formData.priority" :options="priorityOptions" />
        </n-form-item>
        <n-form-item label="送修日期" path="sendDate">
          <n-date-picker v-model:value="formData.sendDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="截止日期" path="dueDate">
          <n-date-picker v-model:value="formData.dueDate" type="date" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="formData.status" :options="statusOptions" />
        </n-form-item>
        <n-form-item label="已修数量" path="retouchedCount">
          <n-input-number v-model:value="formData.retouchedCount" :min="0" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input v-model:value="formData.remark" type="textarea" :rows="3" placeholder="选填" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 8px;" @click="showForm = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确认</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showFeedbackForm"
      preset="card"
      title="添加客户反馈"
      style="width: 480px;"
    >
      <n-form
        ref="feedbackFormRef"
        :model="feedbackFormData"
        :rules="feedbackFormRules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="反馈类型" path="type">
          <n-select v-model:value="feedbackFormData.type" :options="feedbackTypeOptions" />
        </n-form-item>
        <n-form-item label="反馈内容" path="content">
          <n-input v-model:value="feedbackFormData.content" type="textarea" :rows="3" placeholder="请描述客户反馈的具体内容" />
        </n-form-item>
        <n-form-item label="涉及照片" path="photoIndices">
          <n-input
            v-model:value="photoIndicesText"
            placeholder="如：3、5、12（用顿号或逗号分隔）"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 8px;" @click="showFeedbackForm = false">取消</n-button>
          <n-button type="primary" @click="handleSubmitFeedback">提交</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import {
  AddOutline,
  ImagesOutline,
  ColorFilterOutline,
  TimeOutline,
  FlashOutline,
  RefreshOutline,
  BarChartOutline,
  PersonOutline,
  CalendarOutline,
  ChevronBackOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'
import { useRetouchStore } from '@/stores/retouch'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import {
  RETOUCH_STEPS,
  RETOUCH_STATUS,
  RETOUCH_PRIORITY,
  FEEDBACK_TYPE,
  formatDate,
  formatDateTime,
  isOverdue as checkOverdue
} from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const retouchStore = useRetouchStore()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()

const retouchSteps = RETOUCH_STEPS

const showDetail = ref(false)
const currentBatch = ref(null)
const showForm = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const showFeedbackForm = ref(false)
const feedbackFormRef = ref(null)
const photoIndicesText = ref('')

const formData = ref({
  orderId: null,
  batchName: '',
  photoCount: 50,
  assignedRetoucher: null,
  priority: 'normal',
  sendDate: null,
  dueDate: null,
  status: 'waiting',
  retouchedCount: 0,
  remark: ''
})

const feedbackFormData = ref({
  type: 'other',
  content: '',
  photoIndices: []
})

const formRules = {
  orderId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  batchName: [{ required: true, message: '请输入批次名称', trigger: 'blur' }],
  photoCount: [{ required: true, message: '请输入照片数量', trigger: 'blur' }],
  sendDate: [{ required: true, message: '请选择送修日期', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择截止日期', trigger: 'change' }]
}

const feedbackFormRules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入反馈内容', trigger: 'blur' }]
}

const orderOptions = computed(() => {
  return orderStore.orders.map(o => ({
    label: `${getCustomerName(o.id)} - ${formatDate(o.shootDate)}`,
    value: o.id
  }))
})

const retoucherOptions = [
  { label: '张修图', value: '张修图' },
  { label: '李后期', value: '李后期' },
  { label: '王美编', value: '王美编' },
  { label: '陈设计', value: '陈设计' }
]

const priorityOptions = computed(() => {
  return Object.entries(RETOUCH_PRIORITY).map(([key, val]) => ({
    label: val.label,
    value: key
  }))
})

const statusOptions = computed(() => {
  return Object.entries(RETOUCH_STATUS).map(([key, val]) => ({
    label: val.label,
    value: key
  }))
})

const feedbackTypeOptions = computed(() => {
  return Object.entries(FEEDBACK_TYPE).map(([key, val]) => ({
    label: val,
    value: key
  }))
})

const batchFeedbacks = computed(() => {
  if (!currentBatch.value) return []
  return retouchStore.getFeedbacksByBatchId(currentBatch.value.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

function getBatchesByStatus(status) {
  return retouchStore.batches.filter(b => b.status === status)
    .sort((a, b) => {
      if (a.priority === 'super_urgent' && b.priority !== 'super_urgent') return -1
      if (a.priority !== 'super_urgent' && b.priority === 'super_urgent') return 1
      if (a.priority === 'urgent' && b.priority === 'normal') return -1
      if (a.priority === 'normal' && b.priority === 'urgent') return 1
      return dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()
    })
}

function getCustomerName(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (!order) return '未知客户'
  const customer = customerStore.getCustomerById(order.customerId)
  return customer ? customer.name : '未知客户'
}

function getPriorityLabel(priority) {
  return RETOUCH_PRIORITY[priority]?.label || priority
}

function getPriorityType(priority) {
  return RETOUCH_PRIORITY[priority]?.color || 'default'
}

function getFeedbackTypeLabel(type) {
  return FEEDBACK_TYPE[type] || type
}

function getStepIndex(status) {
  return retouchSteps.findIndex(s => s.key === status)
}

function canMovePrev(status) {
  const index = getStepIndex(status)
  return index > 0
}

function canMoveNext(status) {
  const index = getStepIndex(status)
  return index < retouchSteps.length - 1
}

function isOverdue(batch) {
  if (['delivered', 'approved'].includes(batch.status)) return false
  return checkOverdue(batch.dueDate)
}

function getProgressColor(batch) {
  if (batch.status === 'delivered' || batch.status === 'approved') return '#18a058'
  if (isOverdue(batch)) return '#d03050'
  if (batch.priority === 'super_urgent') return '#f0a020'
  return '#2080f0'
}

function movePrev(batch) {
  const result = retouchStore.moveBatchStatus(batch.id, 'prev')
  if (result.success) {
    message.success(result.message)
  } else {
    message.error(result.message)
  }
}

function moveNext(batch) {
  const result = retouchStore.moveBatchStatus(batch.id, 'next')
  if (result.success) {
    message.success(result.message)
  } else {
    message.error(result.message)
  }
}

function showBatchDetail(batch) {
  currentBatch.value = batch
  showDetail.value = true
}

function handleAddBatch() {
  isEdit.value = false
  formData.value = {
    orderId: null,
    batchName: '',
    photoCount: 50,
    assignedRetoucher: null,
    priority: 'normal',
    sendDate: dayjs().valueOf(),
    dueDate: dayjs().add(7, 'day').valueOf(),
    status: 'waiting',
    retouchedCount: 0,
    remark: ''
  }
  showForm.value = true
}

function handleEditBatch() {
  isEdit.value = true
  const batch = currentBatch.value
  formData.value = {
    orderId: batch.orderId,
    batchName: batch.batchName,
    photoCount: batch.photoCount,
    assignedRetoucher: batch.assignedRetoucher,
    priority: batch.priority,
    sendDate: dayjs(batch.sendDate).valueOf(),
    dueDate: dayjs(batch.dueDate).valueOf(),
    status: batch.status,
    retouchedCount: batch.retouchedCount,
    remark: batch.remark || ''
  }
  showDetail.value = false
  showForm.value = true
}

function handleSubmit() {
  formRef.value?.validate(errors => {
    if (!errors) {
      const data = {
        ...formData.value,
        sendDate: dayjs(formData.value.sendDate).format('YYYY-MM-DD'),
        dueDate: dayjs(formData.value.dueDate).format('YYYY-MM-DD')
      }
      if (isEdit.value) {
        retouchStore.updateBatch(currentBatch.value.id, data)
        message.success('批次更新成功')
      } else {
        retouchStore.addBatch(data)
        message.success('批次创建成功')
      }
      showForm.value = false
    }
  })
}

function handleAddFeedback() {
  feedbackFormData.value = {
    type: 'other',
    content: '',
    photoIndices: []
  }
  photoIndicesText.value = ''
  showFeedbackForm.value = true
}

function handleSubmitFeedback() {
  feedbackFormRef.value?.validate(errors => {
    if (!errors) {
      const indices = photoIndicesText.value
        .split(/[,，、]/)
        .map(s => parseInt(s.trim()))
        .filter(n => !isNaN(n) && n > 0)

      retouchStore.addFeedback({
        batchId: currentBatch.value.id,
        type: feedbackFormData.value.type,
        content: feedbackFormData.value.content,
        photoIndices: indices
      })
      message.success('反馈已添加')
      showFeedbackForm.value = false
    }
  })
}

function resolveFeedback(feedbackId) {
  retouchStore.updateFeedback(feedbackId, { status: 'resolved' })
  message.success('已标记为已解决')
}

onMounted(() => {
  retouchStore.fetchBatches()
  orderStore.fetchOrders()
  customerStore.fetchCustomers()
})
</script>

<style scoped>
.retouch-board-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-card :deep(.n-card__content) {
  padding: 16px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.progress {
  background: linear-gradient(135deg, #2080f0 0%, #18a058 100%);
}

.stat-icon.overdue {
  background: linear-gradient(135deg, #f0a020 0%, #d03050 100%);
}

.stat-icon.urgent {
  background: linear-gradient(135deg, #f0a020 0%, #e98b20 100%);
}

.stat-icon.rework {
  background: linear-gradient(135deg, #d03050 0%, #de576d 100%);
}

.stat-icon.avg {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.kanban-board {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 20px;
}

.kanban-column {
  flex: 0 0 260px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 320px);
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

.dot-waiting { background: #999; }
.dot-assigned { background: #2080f0; }
.dot-reviewing { background: #f0a020; }
.dot-feedback { background: #d03050; }
.dot-rework { background: #e98b20; }
.dot-approved { background: #36ad6a; }
.dot-delivered { background: #18a058; }

.column-content {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.batch-card {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border-left: 3px solid transparent;
}

.batch-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.batch-card.overdue {
  border-left-color: #d03050;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.batch-card.priority-urgent {
  border-left-color: #f0a020;
}

.batch-card.priority-super {
  border-left-color: #d03050;
  background: linear-gradient(135deg, #fff7e6 0%, #ffffff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.card-body {
  margin-bottom: 10px;
}

.batch-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.batch-info.rework-info {
  color: #d03050;
  font-weight: 500;
}

.overdue-text {
  color: #d03050;
  font-weight: 500;
}

.card-progress {
  margin-bottom: 10px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #999;
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

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  font-size: 13px;
}

.detail-item .label {
  color: #999;
  flex-shrink: 0;
}

.detail-item .value {
  color: #333;
  flex: 1;
}

.rework-count {
  color: #d03050;
  font-weight: 500;
}

.empty-feedback {
  text-align: center;
  color: #bbb;
  font-size: 12px;
  padding: 30px 0;
  background: #f9f9f9;
  border-radius: 6px;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-item {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid #f0a020;
}

.feedback-item.resolved {
  border-left-color: #18a058;
  opacity: 0.7;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.feedback-type {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.feedback-time {
  font-size: 11px;
  color: #999;
  margin-left: auto;
}

.feedback-content {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 6px;
}

.feedback-photos {
  font-size: 12px;
  color: #999;
}

.feedback-actions {
  margin-top: 8px;
  text-align: right;
}

.remark-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
}

@media (max-width: 1400px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
