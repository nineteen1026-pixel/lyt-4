<template>
  <div class="dispatch-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">拍摄排班</h2>
        <p class="page-subtitle">人员安排 · 订单联动 · 档期冲突检测</p>
      </div>
      <div class="header-actions">
        <n-radio-group v-model:value="activeTab" size="medium" style="margin-right: 16px;">
          <n-radio-button value="calendar">排班日历</n-radio-button>
          <n-radio-button value="pending">待排订单 ({{ pendingOrders.length }})</n-radio-button>
          <n-radio-button value="staff">人员管理</n-radio-button>
          <n-radio-button value="conflict">冲突检测</n-radio-button>
        </n-radio-group>
        <n-button type="primary" @click="openAssignModal">
          <template #icon><add-outline /></template>
          新增排班
        </n-button>
      </div>
    </div>

    <div v-if="activeTab === 'calendar'" class="stats-row">
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-blue">
          <n-icon size="20"><calendar-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ upcomingAssignmentsCount }}</div>
          <div class="stat-label">即将到来排班</div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-green">
          <n-icon size="20"><people-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ scheduleStore.activeStaffCount }}</div>
          <div class="stat-label">在岗人员</div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-orange">
          <n-icon size="20"><time-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingOrders.length }}</div>
          <div class="stat-label">待排订单</div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-red">
          <n-icon size="20"><alert-circle-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ scheduleStore.conflictCount }}</div>
          <div class="stat-label">档期冲突</div>
        </div>
      </n-card>
    </div>

    <template v-if="activeTab === 'calendar'">
      <n-card>
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
              'has-assignment': day.assignments.length > 0,
              'has-conflict': day.conflicts.length > 0,
              'has-pending-order': day.pendingOrders.length > 0
            }]"
            @click="showDayDetail(day)"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>
            <div v-if="day.orders.length > 0 || day.assignments.length > 0 || day.pendingOrders.length > 0" class="day-content">
              <div
                v-for="order in day.orders.slice(0, 2)"
                :key="order.id"
                :class="['order-chip', `status-${order.status}`]"
              >
                {{ getCustomerName(order.customerId) }}
              </div>
              <div v-if="day.pendingOrders.length > 0" class="pending-indicator">
                <n-tag size="tiny" type="warning" round>{{ day.pendingOrders.length }}单待排</n-tag>
              </div>
              <div v-if="day.assignments.length > 0" class="staff-chips">
                <n-tag
                  v-for="asn in day.assignments.slice(0, 3)"
                  :key="asn.id"
                  size="tiny"
                  :type="getAssignmentStatusType(asn.status)"
                  round
                >
                  {{ getStaffName(asn.staffId) }}
                </n-tag>
              </div>
              <div v-if="day.conflicts.length > 0" class="conflict-indicator">
                <n-tag size="tiny" type="error" round>{{ day.conflicts.length }}个冲突</n-tag>
              </div>
              <div v-if="day.orders.length > 2" class="more-tag">
                还有 {{ day.orders.length - 2 }} 单
              </div>
            </div>
          </div>
        </div>
      </n-card>
    </template>

    <template v-if="activeTab === 'pending'">
      <n-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="section-title">待排班订单</span>
          <n-select
            v-model:value="pendingFilter"
            placeholder="筛选状态"
            :options="pendingFilterOptions"
            style="width: 160px;"
            size="small"
          />
        </div>
        <n-data-table
          :columns="pendingColumns"
          :data="filteredPendingOrders"
          :bordered="false"
          size="medium"
          striped
        >
          <template #status="{ row }">
            <n-tag :type="getOrderStatusType(row.status)" size="small">
              {{ getOrderStatusLabel(row.status) }}
            </n-tag>
          </template>
          <template #staffingStatus="{ row }">
            <div class="staffing-status">
              <n-tag
                :type="getStaffingStatusType(row.id)"
                size="small"
              >
                {{ getStaffingStatusLabel(row.id) }}
              </n-tag>
              <div class="staffing-roles">
                <n-tag
                  v-if="getOrderStaffingStatus(row.id).hasChiefPhotographer"
                  size="tiny"
                  type="success"
                >
                  主摄
                </n-tag>
                <n-tag
                  v-if="getOrderStaffingStatus(row.id).hasAssistant"
                  size="tiny"
                  type="success"
                >
                  助理
                </n-tag>
                <n-tag
                  v-if="getOrderStaffingStatus(row.id).hasMakeup"
                  size="tiny"
                  type="success"
                >
                  化妆
                </n-tag>
                <n-tag
                  v-if="getOrderStaffingStatus(row.id).hasVideographer"
                  size="tiny"
                  type="success"
                >
                  摄像
                </n-tag>
              </div>
            </div>
          </template>
          <template #actions="{ row }">
            <n-button text size="small" type="primary" @click="openBatchAssignModal(row)">
              批量排班
            </n-button>
            <n-button text size="small" @click="openAssignModal(row.id)">
              单个排班
            </n-button>
          </template>
        </n-data-table>
      </n-card>
    </template>

    <template v-if="activeTab === 'staff'">
      <n-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="section-title">团队成员 ({{ scheduleStore.staffCount }}人)</span>
          <n-button size="small" @click="openStaffModal">
            <template #icon><add-outline /></template>
            添加成员
          </n-button>
        </div>
        <n-data-table
          :columns="staffColumns"
          :data="scheduleStore.staff"
          :bordered="false"
          size="medium"
          striped
        >
          <template #role="{ row }">
            <n-tag :type="getStaffRoleType(row.role)" size="small">
              {{ getStaffRoleLabel(row.role) }}
            </n-tag>
          </template>
          <template #active="{ row }">
            <n-tag :type="row.active ? 'success' : 'default'" size="small">
              {{ row.active ? '在岗' : '停用' }}
            </n-tag>
          </template>
          <template #workload="{ row }">
            <div v-if="row.active" class="workload-info">
              <div class="workload-bar">
                <div
                  class="workload-fill"
                  :style="{ width: Math.min(getStaffWorkloadPercent(row.id), 100) + '%' }"
                ></div>
              </div>
              <span class="workload-text">{{ getStaffMonthWorkload(row.id) }}单/月</span>
            </div>
            <span v-else class="text-muted">-</span>
          </template>
          <template #assignmentCount="{ row }">
            <span>{{ scheduleStore.getAssignmentsByStaff(row.id).filter(a => a.status !== 'cancelled').length }} 个</span>
          </template>
          <template #staffActions="{ row }">
            <n-button text size="small" type="primary" style="margin-right: 8px;" @click="openStaffModal(row)">
              编辑
            </n-button>
            <n-button text size="small" type="error" @click="handleDeleteStaff(row)">
              删除
            </n-button>
          </template>
        </n-data-table>
      </n-card>
    </template>

    <template v-if="activeTab === 'conflict'">
      <n-card>
        <div class="conflict-controls">
          <n-date-picker
            v-model:value="conflictDateRange"
            type="daterange"
            clearable
            placeholder="选择检测范围"
            style="width: 320px;"
            @update:value="handleConflictRangeChange"
          />
          <n-button type="primary" @click="runConflictCheck">
            <template #icon><search-outline /></template>
            检测冲突
          </n-button>
        </div>

        <div v-if="conflictResults.length === 0" class="empty-conflict">
          <n-empty description="暂未检测到档期冲突" />
        </div>
        <div v-else class="conflict-list">
          <div
            v-for="(conflict, index) in conflictResults"
            :key="index"
            class="conflict-card"
          >
            <div class="conflict-header">
              <n-tag type="error" size="small">冲突</n-tag>
              <span class="conflict-message">{{ conflict.message }}</span>
            </div>
            <div class="conflict-body">
              <div v-for="asn in conflict.assignments" :key="asn.id" class="conflict-assignment">
                <div class="asn-info">
                  <span class="asn-staff">{{ getStaffName(asn.staffId) }}</span>
                  <n-tag :type="getAssignmentRoleType(asn.role)" size="tiny">
                    {{ getAssignmentRoleLabel(asn.role) }}
                  </n-tag>
                </div>
                <div class="asn-order">
                  订单：{{ getCustomerNameByOrder(asn.orderId) }} · {{ formatDate(asn.date) }}
                </div>
              </div>
            </div>
            <div class="conflict-footer">
              <n-button text size="small" type="primary" @click="openAssignModal(conflict.assignments[0].orderId, conflict)">
                调整排班
              </n-button>
            </div>
          </div>
        </div>
      </n-card>
    </template>

    <n-modal
      v-model:show="showDayDetailModal"
      preset="card"
      :title="`${selectedDayTitle} 档期详情`"
      style="width: 720px;"
    >
      <div v-if="selectedDayOrders.length === 0 && selectedDayAssignments.length === 0 && selectedDayPendingOrders.length === 0" class="empty-day">
        当天暂无排班安排
      </div>
      <div v-else class="day-detail-content">
        <div v-if="selectedDayPendingOrders.length > 0" class="detail-section">
          <div class="detail-section-title">
            <n-icon size="16"><time-outline /></n-icon>
            待排班订单 ({{ selectedDayPendingOrders.length }})
          </div>
          <div v-for="order in selectedDayPendingOrders" :key="order.id" class="detail-pending-item">
            <div class="pending-main">
              <span class="pending-customer">{{ getCustomerName(order.customerId) }}</span>
              <n-tag :type="getOrderStatusType(order.status)" size="small">
                {{ getOrderStatusLabel(order.status) }}
              </n-tag>
            </div>
            <div class="pending-sub">
              {{ getPackageName(order.packageId) }}
            </div>
            <n-button size="small" type="primary" @click="openBatchAssignModal(order)">
              快速排班
            </n-button>
          </div>
        </div>

        <div v-if="selectedDayOrders.length > 0" class="detail-section">
          <div class="detail-section-title">
            <n-icon size="16"><calendar-outline /></n-icon>
            订单 ({{ selectedDayOrders.length }})
          </div>
          <div v-for="order in selectedDayOrders" :key="order.id" class="detail-order-item">
            <div class="order-main">
              <span class="order-customer">{{ getCustomerName(order.customerId) }}</span>
              <n-tag :type="getOrderStatusType(order.status)" size="small">
                {{ getOrderStatusLabel(order.status) }}
              </n-tag>
            </div>
            <div class="order-sub">
              {{ getPackageName(order.packageId) }} · ¥{{ (order.depositAmount + order.finalAmount).toLocaleString() }}
            </div>
          </div>
        </div>
        <div v-if="selectedDayAssignments.length > 0" class="detail-section">
          <div class="detail-section-title">
            <n-icon size="16"><people-outline /></n-icon>
            人员安排 ({{ selectedDayAssignments.length }})
          </div>
          <div v-for="asn in selectedDayAssignments" :key="asn.id" class="detail-assignment-item">
            <div class="asn-main">
              <span class="asn-name">{{ getStaffName(asn.staffId) }}</span>
              <n-tag :type="getAssignmentRoleType(asn.role)" size="tiny">
                {{ getAssignmentRoleLabel(asn.role) }}
              </n-tag>
              <n-tag :type="getAssignmentStatusType(asn.status)" size="tiny">
                {{ getAssignmentStatusLabel(asn.status) }}
              </n-tag>
            </div>
            <div class="asn-order-link">
              订单：{{ getCustomerNameByOrder(asn.orderId) }}
            </div>
            <div class="asn-actions">
              <n-button text size="tiny" @click="openAssignModal(null, null, asn)">编辑</n-button>
              <n-button text size="tiny" type="error" @click="handleDeleteAssignment(asn)">删除</n-button>
            </div>
          </div>
        </div>
        <div v-if="selectedDayConflicts.length > 0" class="detail-section conflict-section">
          <div class="detail-section-title conflict-title">
            <n-icon size="16"><alert-circle-outline /></n-icon>
            冲突警告 ({{ selectedDayConflicts.length }})
          </div>
          <div v-for="conflict in selectedDayConflicts" :key="conflict.message" class="detail-conflict-item">
            <n-tag type="error" size="small">冲突</n-tag>
            <span>{{ conflict.message }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: space-between;">
          <n-button @click="openAssignModal(selectedDayDate)">新增排班</n-button>
          <n-button type="primary" @click="showDayDetailModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showAssignModal"
      preset="card"
      :title="isEditAssignment ? '编辑排班' : '新增排班'"
      style="width: 560px;"
      @after-leave="handleAssignModalClose"
    >
      <n-form
        ref="assignFormRef"
        :model="assignForm"
        :rules="assignRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="拍摄日期" path="date">
          <n-date-picker
            v-model:value="assignForm.date"
            type="date"
            placeholder="请选择拍摄日期"
            style="width: 100%;"
            @update:value="handleDateChange"
          />
        </n-form-item>
        <n-form-item label="关联订单" path="orderId">
          <n-select
            v-model:value="assignForm.orderId"
            placeholder="请选择关联订单"
            :options="orderOptions"
            filterable
            @update:value="handleOrderChange"
          />
        </n-form-item>
        <n-form-item label="指派人员" path="staffId">
          <n-select
            v-model:value="assignForm.staffId"
            placeholder="请选择人员"
            :options="staffOptionsWithAvailable"
            filterable
          />
        </n-form-item>
        <n-form-item label="担任角色" path="role">
          <n-select
            v-model:value="assignForm.role"
            placeholder="请选择角色"
            :options="assignmentRoleOptions"
          />
        </n-form-item>
        <n-form-item label="排班状态" path="status">
          <n-select
            v-model:value="assignForm.status"
            :options="assignmentStatusOptions"
          />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="assignForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </n-form-item>

        <n-alert
          v-if="staffConflictWarning"
          type="warning"
          title="档期冲突"
          style="margin-top: 8px;"
        >
          {{ staffConflictWarning }}
        </n-alert>
        <n-alert
          v-if="orderStatusWarning"
          type="info"
          title="订单状态"
          style="margin-top: 8px;"
        >
          {{ orderStatusWarning }}
        </n-alert>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showAssignModal = false">取消</n-button>
          <n-button type="primary" @click="handleAssignSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showBatchAssignModal"
      preset="card"
      title="批量排班"
      style="width: 640px;"
      @after-leave="handleBatchAssignModalClose"
    >
      <div v-if="batchAssignOrder" class="batch-assign-header">
        <div class="batch-order-info">
          <div class="batch-order-customer">{{ getCustomerName(batchAssignOrder.customerId) }}</div>
          <div class="batch-order-detail">
            {{ getPackageName(batchAssignOrder.packageId) }} · {{ formatDate(batchAssignOrder.shootDate) }}
          </div>
        </div>
        <n-tag :type="getOrderStatusType(batchAssignOrder.status)" size="small">
          {{ getOrderStatusLabel(batchAssignOrder.status) }}
        </n-tag>
      </div>

      <div class="batch-assign-form">
        <div class="batch-role-section" v-for="roleConfig in batchRoleConfigs" :key="roleConfig.role">
          <div class="batch-role-header">
            <span class="batch-role-label">{{ roleConfig.label }}</span>
            <n-switch
              v-model:value="roleConfig.enabled"
              size="small"
              @update:value="handleBatchRoleToggle(roleConfig.role)"
            />
          </div>
          <div v-if="roleConfig.enabled" class="batch-role-content">
            <n-select
              v-model:value="roleConfig.selectedStaff"
              placeholder="选择人员"
              :options="getAvailableStaffForRole(roleConfig.role)"
              filterable
            />
            <n-tag v-if="roleConfig.selectedStaff" size="small" type="info" style="margin-top: 8px;">
              推荐：{{ getRecommendedStaff(roleConfig.role) }}
            </n-tag>
          </div>
        </div>
      </div>

      <n-alert
        v-if="batchConflictWarning"
        type="warning"
        title="存在冲突"
        style="margin-top: 16px;"
      >
        {{ batchConflictWarning }}
      </n-alert>

      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showBatchAssignModal = false">取消</n-button>
          <n-button type="primary" @click="handleBatchAssignSubmit">确认排班</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showStaffModal"
      preset="card"
      :title="isEditStaff ? '编辑成员' : '添加成员'"
      style="width: 480px;"
      @after-leave="handleStaffModalClose"
    >
      <n-form
        ref="staffFormRef"
        :model="staffForm"
        :rules="staffRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="姓名" path="name">
          <n-input v-model:value="staffForm.name" placeholder="请输入姓名" />
        </n-form-item>
        <n-form-item label="角色" path="role">
          <n-select
            v-model:value="staffForm.role"
            placeholder="请选择角色"
            :options="staffRoleOptions"
          />
        </n-form-item>
        <n-form-item label="电话" path="phone">
          <n-input v-model:value="staffForm.phone" placeholder="请输入电话" />
        </n-form-item>
        <n-form-item label="状态" path="active">
          <n-switch v-model:value="staffForm.active" />
          <span style="margin-left: 8px; color: #999;">{{ staffForm.active ? '在岗' : '停用' }}</span>
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="staffForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showStaffModal = false">取消</n-button>
          <n-button type="primary" @click="handleStaffSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import {
  AddOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  CalendarOutline,
  PeopleOutline,
  SearchOutline,
  AlertCircleOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { useScheduleStore } from '@/stores/schedule'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { usePackageStore } from '@/stores/package'
import {
  formatDate,
  ORDER_STATUS,
  STAFF_ROLE,
  ASSIGNMENT_ROLE,
  ASSIGNMENT_STATUS
} from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const scheduleStore = useScheduleStore()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const packageStore = usePackageStore()

const activeTab = ref('calendar')
const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const showDayDetailModal = ref(false)
const selectedDayTitle = ref('')
const selectedDayDate = ref('')
const selectedDayOrders = ref([])
const selectedDayAssignments = ref([])
const selectedDayConflicts = ref([])
const selectedDayPendingOrders = ref([])

const showAssignModal = ref(false)
const isEditAssignment = ref(false)
const editAssignmentId = ref('')
const assignFormRef = ref(null)

const showBatchAssignModal = ref(false)
const batchAssignOrder = ref(null)
const batchRoleConfigs = ref([])

const showStaffModal = ref(false)
const isEditStaff = ref(false)
const editStaffId = ref('')
const staffFormRef = ref(null)

const conflictDateRange = ref(null)
const conflictResults = ref([])

const pendingFilter = ref('all')

const assignForm = reactive({
  date: null,
  orderId: '',
  staffId: '',
  role: '',
  status: 'pending',
  remark: ''
})

const assignRules = {
  date: [{ required: true, message: '请选择拍摄日期', trigger: 'change' }],
  orderId: [{ required: true, message: '请选择关联订单', trigger: 'change' }],
  staffId: [{ required: true, message: '请选择人员', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const staffForm = reactive({
  name: '',
  role: '',
  phone: '',
  active: true,
  remark: ''
})

const staffRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const staffRoleOptions = Object.entries(STAFF_ROLE).map(([value, { label }]) => ({ label, value }))
const assignmentRoleOptions = Object.entries(ASSIGNMENT_ROLE).map(([value, { label }]) => ({ label, value }))
const assignmentStatusOptions = Object.entries(ASSIGNMENT_STATUS).map(([value, { label }]) => ({ label, value }))

const pendingFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '待拍摄', value: 'shooting' }
]

const orderOptions = computed(() =>
  orderStore.orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .map(o => ({
      label: `${formatDate(o.shootDate)} - ${getCustomerName(o.customerId)} (${getOrderStatusLabel(o.status)})`,
      value: o.id
    }))
)

const staffOptions = computed(() =>
  scheduleStore.activeStaff.map(s => ({
    label: `${s.name} (${getStaffRoleLabel(s.role)})`,
    value: s.id
  }))
)

const staffOptionsWithAvailable = computed(() => {
  const dateStr = assignForm.date ? dayjs(assignForm.date).format('YYYY-MM-DD') : ''
  if (!dateStr) return staffOptions.value

  return scheduleStore.activeStaff.map(s => {
    const hasConflict = scheduleStore.checkStaffConflict(s.id, dateStr, assignForm.role)
    return {
      label: `${s.name} (${getStaffRoleLabel(s.role)})${hasConflict ? ' - 已安排' : ' - 空闲'}`,
      value: s.id,
      disabled: hasConflict
    }
  })
})

const staffConflictWarning = computed(() => {
  if (!assignForm.staffId || !assignForm.date) return ''
  const dateStr = assignForm.date ? dayjs(assignForm.date).format('YYYY-MM-DD') : ''
  const hasConflict = scheduleStore.checkStaffConflict(
    assignForm.staffId,
    dateStr,
    assignForm.role,
    isEditAssignment.value ? editAssignmentId.value : null
  )
  if (hasConflict) {
    const staffName = getStaffName(assignForm.staffId)
    return `${staffName} 在 ${dateStr} 已有排班任务，存在档期冲突`
  }
  return ''
})

const orderStatusWarning = computed(() => {
  if (!assignForm.orderId) return ''
  const order = orderStore.getOrderById(assignForm.orderId)
  if (!order) return ''
  if (order.status === 'pending') {
    return '该订单尚待确认，排班可能需要调整'
  }
  if (order.paymentStatus === 'unpaid') {
    return '该订单尚未付款，请注意款项状态'
  }
  return ''
})

const batchConflictWarning = computed(() => {
  if (!batchAssignOrder.value) return ''
  const conflicts = []
  batchRoleConfigs.value.forEach(config => {
    if (config.enabled && config.selectedStaff) {
      const hasConflict = scheduleStore.checkStaffConflict(
        config.selectedStaff,
        batchAssignOrder.value.shootDate,
        config.role
      )
      if (hasConflict) {
        conflicts.push(`${getStaffName(config.selectedStaff)} (${config.label})`)
      }
    }
  })
  if (conflicts.length > 0) {
    return `以下人员存在档期冲突：${conflicts.join('、')}`
  }
  return ''
})

const pendingOrders = computed(() => {
  return orderStore.orders.filter(o => {
    if (o.status === 'completed' || o.status === 'cancelled') return false
    const staffingStatus = scheduleStore.getOrderStaffingStatus(o.id)
    return !staffingStatus.isFullyStaffed
  })
})

const filteredPendingOrders = computed(() => {
  if (pendingFilter.value === 'all') return pendingOrders.value
  return pendingOrders.value.filter(o => o.status === pendingFilter.value)
})

const upcomingAssignmentsCount = computed(() => {
  return scheduleStore.upcomingAssignments.filter(a => a.status !== 'cancelled').length
})

const staffColumns = [
  { title: '姓名', key: 'name', width: 120 },
  { title: '角色', key: 'role', width: 120 },
  { title: '本月工作量', key: 'workload', width: 180 },
  { title: '状态', key: 'active', width: 80 },
  { title: '总排班数', key: 'assignmentCount', width: 100 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } },
  { title: '操作', key: 'staffActions', width: 140 }
]

const pendingColumns = [
  { title: '拍摄日期', key: 'shootDate', width: 120, render: (row) => formatDate(row.shootDate) },
  { title: '客户', key: 'customerId', width: 180, render: (row) => getCustomerName(row.customerId) },
  { title: '套餐', key: 'packageId', render: (row) => getPackageName(row.packageId) },
  { title: '订单状态', key: 'status', width: 100 },
  { title: '排班状态', key: 'staffingStatus', width: 200 },
  { title: '操作', key: 'actions', width: 160 }
]

const calendarDays = computed(() => {
  const days = []
  const firstDay = dayjs(`${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}-01`)
  const startDay = firstDay.subtract(firstDay.day(), 'day')

  for (let i = 0; i < 42; i++) {
    const date = startDay.add(i, 'day')
    const dateStr = date.format('YYYY-MM-DD')
    const orders = orderStore.getOrdersByDate(dateStr)
    const assignments = scheduleStore.getAssignmentsByDate(dateStr)
    const conflicts = scheduleStore.getConflictsForDate(dateStr)
    const pendingOrdersForDate = orders.filter(o => {
      if (o.status === 'completed' || o.status === 'cancelled') return false
      const staffingStatus = scheduleStore.getOrderStaffingStatus(o.id)
      return !staffingStatus.isFullyStaffed
    })

    days.push({
      date: date.toDate(),
      dateStr,
      currentMonth: date.month() + 1 === currentMonth.value,
      isToday: date.isSame(dayjs(), 'day'),
      orders,
      assignments,
      conflicts,
      pendingOrders: pendingOrdersForDate
    })
  }

  return days
})

function getCustomerName(id) {
  const customer = customerStore.getCustomerById(id)
  return customer ? customer.name : '未知客户'
}

function getCustomerNameByOrder(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (!order) return '未知订单'
  return getCustomerName(order.customerId)
}

function getPackageName(id) {
  const pkg = packageStore.getPackageById(id)
  return pkg ? pkg.name : '未知套餐'
}

function getStaffName(id) {
  const staff = scheduleStore.getStaffById(id)
  return staff ? staff.name : '未知人员'
}

function getOrderStatusLabel(status) {
  return ORDER_STATUS[status]?.label || status
}

function getOrderStatusType(status) {
  return ORDER_STATUS[status]?.color || 'default'
}

function getStaffRoleLabel(role) {
  return STAFF_ROLE[role]?.label || role
}

function getStaffRoleType(role) {
  return STAFF_ROLE[role]?.color || 'default'
}

function getAssignmentRoleLabel(role) {
  return ASSIGNMENT_ROLE[role]?.label || role
}

function getAssignmentRoleType(role) {
  return ASSIGNMENT_ROLE[role]?.color || 'default'
}

function getAssignmentStatusLabel(status) {
  return ASSIGNMENT_STATUS[status]?.label || status
}

function getAssignmentStatusType(status) {
  return ASSIGNMENT_STATUS[status]?.color || 'default'
}

function getOrderStaffingStatus(orderId) {
  return scheduleStore.getOrderStaffingStatus(orderId)
}

function getStaffingStatusLabel(orderId) {
  const status = scheduleStore.getOrderStaffingStatus(orderId)
  if (status.isFullyStaffed) return '已排班'
  if (status.total > 0) return '部分排班'
  return '未排班'
}

function getStaffingStatusType(orderId) {
  const status = scheduleStore.getOrderStaffingStatus(orderId)
  if (status.isFullyStaffed) return 'success'
  if (status.total > 0) return 'warning'
  return 'default'
}

function getStaffMonthWorkload(staffId) {
  const startDate = dayjs().startOf('month').format('YYYY-MM-DD')
  const endDate = dayjs().endOf('month').format('YYYY-MM-DD')
  const workload = scheduleStore.getStaffWorkload(staffId, startDate, endDate)
  return workload.pending
}

function getStaffWorkloadPercent(staffId) {
  const count = getStaffMonthWorkload(staffId)
  return Math.min(count * 20, 100)
}

function getAvailableStaffForRole(role) {
  if (!batchAssignOrder.value) return []
  const date = batchAssignOrder.value.shootDate
  const available = scheduleStore.suggestStaffForDate(date, role)
  return available.map(s => ({
    label: `${s.name} (近期${s.workload}单)`,
    value: s.id
  }))
}

function getRecommendedStaff(role) {
  if (!batchAssignOrder.value) return '暂无推荐'
  const date = batchAssignOrder.value.shootDate
  const available = scheduleStore.suggestStaffForDate(date, role)
  if (available.length > 0) {
    return `${available[0].name} (工作量最少)`
  }
  return '暂无空闲人员'
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

function showDayDetail(day) {
  selectedDayTitle.value = dayjs(day.date).format('YYYY年MM月DD日')
  selectedDayDate.value = day.dateStr
  selectedDayOrders.value = day.orders
  selectedDayAssignments.value = day.assignments
  selectedDayConflicts.value = day.conflicts
  selectedDayPendingOrders.value = day.pendingOrders
  showDayDetailModal.value = true
}

function openAssignModal(preOrderId, conflict, existingAssignment) {
  isEditAssignment.value = false
  editAssignmentId.value = ''
  resetAssignForm()

  if (existingAssignment) {
    isEditAssignment.value = true
    editAssignmentId.value = existingAssignment.id
    Object.assign(assignForm, {
      date: existingAssignment.date ? dayjs(existingAssignment.date).valueOf() : null,
      orderId: existingAssignment.orderId,
      staffId: existingAssignment.staffId,
      role: existingAssignment.role,
      status: existingAssignment.status,
      remark: existingAssignment.remark || ''
    })
  } else if (preOrderId) {
    assignForm.orderId = preOrderId
    const order = orderStore.getOrderById(preOrderId)
    if (order) {
      assignForm.date = dayjs(order.shootDate).valueOf()
    }
  } else if (selectedDayDate.value) {
    assignForm.date = dayjs(selectedDayDate.value).valueOf()
  }

  showAssignModal.value = true
}

function resetAssignForm() {
  Object.assign(assignForm, {
    date: null,
    orderId: '',
    staffId: '',
    role: '',
    status: 'pending',
    remark: ''
  })
  assignFormRef.value?.restoreValidation()
}

function handleAssignModalClose() {
  resetAssignForm()
}

function handleDateChange() {
  if (assignForm.staffId) {
    assignForm.staffId = ''
  }
}

function handleOrderChange(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (order && order.shootDate) {
    assignForm.date = dayjs(order.shootDate).valueOf()
  }
}

function handleAssignSubmit() {
  assignFormRef.value?.validate((errors) => {
    if (!errors) {
      const dateStr = assignForm.date ? dayjs(assignForm.date).format('YYYY-MM-DD') : ''
      const data = {
        ...assignForm,
        date: dateStr
      }

      if (isEditAssignment.value) {
        scheduleStore.updateAssignment(editAssignmentId.value, data)
        message.success('排班更新成功')
      } else {
        if (staffConflictWarning.value) {
          dialog.warning({
            title: '档期冲突',
            content: staffConflictWarning.value + '，确定还要继续排班吗？',
            positiveText: '继续排班',
            negativeText: '取消',
            onPositiveClick: () => {
              scheduleStore.addAssignment(data)
              message.success('排班添加成功')
              showAssignModal.value = false
            }
          })
          return
        }
        scheduleStore.addAssignment(data)
        message.success('排班添加成功')
      }
      showAssignModal.value = false
    }
  })
}

function handleDeleteAssignment(asn) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 ${getStaffName(asn.staffId)} 的排班吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      scheduleStore.deleteAssignment(asn.id)
      message.success('删除成功')
    }
  })
}

function openBatchAssignModal(order) {
  batchAssignOrder.value = order
  initBatchRoleConfigs()
  showBatchAssignModal.value = true
}

function initBatchRoleConfigs() {
  const existingAssignments = batchAssignOrder.value
    ? scheduleStore.getAssignmentsByOrder(batchAssignOrder.value.id).filter(a => a.status !== 'cancelled')
    : []

  batchRoleConfigs.value = [
    { role: 'chief_photographer', label: '主摄影师', enabled: false, selectedStaff: '' },
    { role: 'assistant', label: '摄影助理', enabled: false, selectedStaff: '' },
    { role: 'makeup_artist', label: '化妆师', enabled: false, selectedStaff: '' },
    { role: 'videographer', label: '摄像师', enabled: false, selectedStaff: '' }
  ]

  existingAssignments.forEach(asn => {
    const config = batchRoleConfigs.value.find(c => c.role === asn.role)
    if (config) {
      config.enabled = true
      config.selectedStaff = asn.staffId
      config.existingId = asn.id
    }
  })
}

function handleBatchRoleToggle(role) {
  const config = batchRoleConfigs.value.find(c => c.role === role)
  if (config && !config.enabled) {
    config.selectedStaff = ''
  }
}

function handleBatchAssignModalClose() {
  batchAssignOrder.value = null
  batchRoleConfigs.value = []
}

function handleBatchAssignSubmit() {
  if (!batchAssignOrder.value) return

  const selectedConfigs = batchRoleConfigs.value.filter(c => c.enabled && c.selectedStaff)
  if (selectedConfigs.length === 0) {
    message.warning('请至少选择一个人员')
    return
  }

  const hasConflicts = selectedConfigs.some(config =>
    scheduleStore.checkStaffConflict(
      config.selectedStaff,
      batchAssignOrder.value.shootDate,
      config.role,
      config.existingId || null
    )
  )

  const submit = () => {
    selectedConfigs.forEach(config => {
      if (config.existingId) {
        scheduleStore.updateAssignment(config.existingId, {
          staffId: config.selectedStaff,
          role: config.role
        })
      } else {
        scheduleStore.addAssignment({
          orderId: batchAssignOrder.value.id,
          staffId: config.selectedStaff,
          date: batchAssignOrder.value.shootDate,
          role: config.role,
          status: 'confirmed',
          remark: ''
        })
      }
    })
    message.success('批量排班成功')
    showBatchAssignModal.value = false
  }

  if (hasConflicts) {
    dialog.warning({
      title: '档期冲突',
      content: '部分人员存在档期冲突，确定还要继续排班吗？',
      positiveText: '继续排班',
      negativeText: '取消',
      onPositiveClick: submit
    })
  } else {
    submit()
  }
}

function openStaffModal(row) {
  if (row) {
    isEditStaff.value = true
    editStaffId.value = row.id
    Object.assign(staffForm, {
      name: row.name,
      role: row.role,
      phone: row.phone || '',
      active: row.active,
      remark: row.remark || ''
    })
  } else {
    isEditStaff.value = false
    editStaffId.value = ''
    resetStaffForm()
  }
  showStaffModal.value = true
}

function resetStaffForm() {
  Object.assign(staffForm, {
    name: '',
    role: '',
    phone: '',
    active: true,
    remark: ''
  })
  staffFormRef.value?.restoreValidation()
}

function handleStaffModalClose() {
  resetStaffForm()
}

function handleStaffSubmit() {
  staffFormRef.value?.validate((errors) => {
    if (!errors) {
      const data = { ...staffForm }
      if (isEditStaff.value) {
        scheduleStore.updateStaffMember(editStaffId.value, data)
        message.success('成员更新成功')
      } else {
        scheduleStore.addStaffMember(data)
        message.success('成员添加成功')
      }
      showStaffModal.value = false
    }
  })
}

function handleDeleteStaff(row) {
  const assignmentCount = scheduleStore.getAssignmentsByStaff(row.id).filter(a => a.status !== 'cancelled').length
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 ${row.name} 吗？${assignmentCount > 0 ? `该成员有 ${assignmentCount} 个关联排班也会被删除。` : ''}`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      scheduleStore.deleteStaffMember(row.id)
      message.success('删除成功')
    }
  })
}

function handleConflictRangeChange() {}

function runConflictCheck() {
  let startDate, endDate
  if (conflictDateRange.value && conflictDateRange.value.length === 2) {
    startDate = dayjs(conflictDateRange.value[0]).format('YYYY-MM-DD')
    endDate = dayjs(conflictDateRange.value[1]).format('YYYY-MM-DD')
  } else {
    startDate = dayjs().format('YYYY-MM-DD')
    endDate = dayjs().add(3, 'month').format('YYYY-MM-DD')
  }

  conflictResults.value = scheduleStore.getAllConflicts(startDate, endDate)

  if (conflictResults.value.length === 0) {
    message.success('未发现档期冲突')
  } else {
    message.warning(`检测到 ${conflictResults.value.length} 个档期冲突`)
  }
}

onMounted(() => {
  scheduleStore.fetchStaff()
  scheduleStore.fetchAssignments()
  orderStore.fetchOrders()
  customerStore.fetchCustomers()
  packageStore.fetchPackages()
})
</script>

<style scoped>
.dispatch-page {
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 16px;
}

.stat-card :deep(.n-card__content) {
  padding: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon-blue { background: linear-gradient(135deg, #2080f0, #1860c0); }
.stat-icon-green { background: linear-gradient(135deg, #18a058, #108040); }
.stat-icon-orange { background: linear-gradient(135deg, #f0a020, #d08000); }
.stat-icon-red { background: linear-gradient(135deg, #e88080, #c05050); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
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
  min-height: 110px;
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

.day-cell.has-conflict {
  border-color: #e88080;
  background: #fff5f5;
}

.day-cell.has-pending-order {
  border-color: #f0a020;
}

.day-number {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.day-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-chip {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.pending-indicator {
  margin-top: 2px;
}

.staff-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 2px;
}

.conflict-indicator {
  margin-top: 4px;
}

.more-tag {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.status-pending { background: #f0a020; }
.status-confirmed { background: #2080f0; }
.status-shooting { background: #18a058; }
.status-selecting { background: #722ed1; }
.status-editing { background: #2080f0; }
.status-delivering { background: #f0a020; }
.status-completed { background: #52c41a; }

.empty-day {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-section-title.conflict-title {
  color: #e88080;
}

.detail-order-item {
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 8px;
}

.order-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.order-customer {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-sub {
  font-size: 12px;
  color: #999;
}

.detail-pending-item {
  padding: 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.pending-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.pending-customer {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.pending-sub {
  font-size: 12px;
  color: #999;
}

.detail-assignment-item {
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.asn-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.asn-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.asn-order-link {
  font-size: 12px;
  color: #999;
  flex: 1;
}

.asn-actions {
  display: flex;
  gap: 4px;
}

.detail-conflict-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff5f5;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #e88080;
}

.conflict-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
}

.empty-conflict {
  padding: 40px 0;
}

.conflict-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conflict-card {
  padding: 16px;
  background: #fff5f5;
  border: 1px solid #ffd6d6;
  border-radius: 8px;
}

.conflict-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.conflict-message {
  font-size: 14px;
  font-weight: 500;
  color: #e88080;
}

.conflict-body {
  padding-left: 12px;
}

.conflict-assignment {
  padding: 8px 0;
  border-bottom: 1px solid #ffe0e0;
}

.conflict-assignment:last-child {
  border-bottom: none;
}

.asn-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.asn-staff {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.asn-order {
  font-size: 12px;
  color: #999;
}

.conflict-footer {
  margin-top: 12px;
  text-align: right;
}

.day-detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.staffing-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.staffing-roles {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.workload-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workload-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}

.workload-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4A574, #C49564);
  border-radius: 3px;
  transition: width 0.3s;
}

.workload-text {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.text-muted {
  color: #999;
}

.batch-assign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.batch-order-customer {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.batch-order-detail {
  font-size: 13px;
  color: #999;
}

.batch-assign-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.batch-role-section {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.batch-role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.batch-role-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.batch-role-content {
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}
</style>
