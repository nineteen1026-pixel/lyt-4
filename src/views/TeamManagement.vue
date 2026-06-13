<template>
  <div class="team-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">团队成员管理</h2>
        <p class="page-subtitle">排班管理 · 订单分配 · 工作量统计</p>
      </div>
      <div class="header-actions">
        <n-radio-group v-model:value="activeTab" size="medium" style="margin-right: 16px;">
          <n-radio-button value="schedule">排班管理</n-radio-button>
          <n-radio-button value="assign">订单分配</n-radio-button>
          <n-radio-button value="stats">工作量统计</n-radio-button>
        </n-radio-group>
        <n-button type="primary" @click="openScheduleModal">
          <template #icon><add-outline /></template>
          新增排班
        </n-button>
      </div>
    </div>

    <div class="stats-row">
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-blue">
          <n-icon size="20"><people-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ scheduleStore.activeStaffCount }}</div>
          <div class="stat-label">在岗人员</div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-green">
          <n-icon size="20"><calendar-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ todayScheduleCount }}</div>
          <div class="stat-label">今日排班</div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-orange">
          <n-icon size="20"><time-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ unassignedOrderCount }}</div>
          <div class="stat-label">待分配订单</div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-icon stat-icon-red">
          <n-icon size="20"><alert-circle-outline /></n-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ overloadedStaffCount }}</div>
          <div class="stat-label">超负荷人员</div>
        </div>
      </n-card>
    </div>

    <template v-if="activeTab === 'schedule'">
      <n-card style="margin-bottom: 20px;">
        <div class="schedule-controls">
          <div class="schedule-date-nav">
            <n-button text size="small" @click="prevWeek">
              <template #icon><chevron-back-outline /></template>
              上一周
            </n-button>
            <span class="week-title">{{ weekRangeLabel }}</span>
            <n-button text size="small" @click="nextWeek">
              下一周
              <template #icon><chevron-forward-outline /></template>
            </n-button>
            <n-button size="tiny" style="margin-left: 8px;" @click="goCurrentWeek">本周</n-button>
          </div>
          <div class="schedule-filters">
            <n-select
              v-model:value="scheduleRoleFilter"
              placeholder="角色筛选"
              :options="[{ label: '全部角色', value: 'all' }, ...staffRoleOptions]"
              style="width: 140px;"
              size="small"
            />
          </div>
        </div>

        <div class="schedule-grid">
          <div class="schedule-header-row">
            <div class="schedule-header-cell staff-cell">人员</div>
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              :class="['schedule-header-cell', { 'is-today': day.isToday, 'is-weekend': day.isWeekend }]"
            >
              <div class="header-weekday">{{ day.weekday }}</div>
              <div class="header-date">{{ day.dateLabel }}</div>
            </div>
          </div>

          <div
            v-for="staff in filteredStaff"
            :key="staff.id"
            class="schedule-row"
          >
            <div class="schedule-cell staff-cell">
              <div class="staff-info">
                <span class="staff-name">{{ staff.name }}</span>
                <n-tag :type="getStaffRoleType(staff.role)" size="tiny">
                  {{ getStaffRoleLabel(staff.role) }}
                </n-tag>
              </div>
            </div>
            <div
              v-for="day in weekDays"
              :key="day.dateStr"
              :class="['schedule-cell', { 'is-today': day.isToday, 'is-weekend': day.isWeekend }]"
              @click="openScheduleModal(staff.id, day.dateStr)"
            >
              <div v-if="getStaffDayAssignments(staff.id, day.dateStr).length > 0" class="cell-assignments">
                <div
                  v-for="asn in getStaffDayAssignments(staff.id, day.dateStr)"
                  :key="asn.id"
                  :class="['cell-assignment-chip', `chip-status-${asn.status}`]"
                  @click.stop="editAssignment(asn)"
                >
                  <span class="chip-role">{{ getAssignmentRoleLabel(asn.role) }}</span>
                  <span class="chip-customer">{{ getCustomerByOrder(asn.orderId) }}</span>
                </div>
              </div>
              <div v-else class="cell-empty">
                <n-icon size="14" color="#ddd"><add-outline /></n-icon>
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <n-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="section-title">排班记录 ({{ filteredAssignments.length }})</span>
          <n-select
            v-model:value="assignmentStatusFilter"
            placeholder="状态筛选"
            :options="[{ label: '全部状态', value: 'all' }, ...assignmentStatusFilterOptions]"
            style="width: 140px;"
            size="small"
          />
        </div>
        <n-data-table
          :columns="assignmentColumns"
          :data="filteredAssignments"
          :bordered="false"
          size="medium"
          striped
        >
          <template #role="{ row }">
            <n-tag :type="getAssignmentRoleType(row.role)" size="small">
              {{ getAssignmentRoleLabel(row.role) }}
            </n-tag>
          </template>
          <template #status="{ row }">
            <n-tag :type="getAssignmentStatusType(row.status)" size="small">
              {{ getAssignmentStatusLabel(row.status) }}
            </n-tag>
          </template>
          <template #staffName="{ row }">
            {{ getStaffName(row.staffId) }}
          </template>
          <template #customerName="{ row }">
            {{ getCustomerByOrder(row.orderId) }}
          </template>
          <template #actions="{ row }">
            <n-button text size="small" type="primary" style="margin-right: 8px;" @click="editAssignment(row)">编辑</n-button>
            <n-button text size="small" type="error" @click="handleDeleteAssignment(row)">删除</n-button>
          </template>
        </n-data-table>
      </n-card>
    </template>

    <template v-if="activeTab === 'assign'">
      <n-card style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="section-title">待分配订单</span>
          <n-select
            v-model:value="assignOrderFilter"
            placeholder="订单筛选"
            :options="assignFilterOptions"
            style="width: 160px;"
            size="small"
          />
        </div>
        <div v-if="filteredUnassignedOrders.length === 0" class="empty-state">
          <n-empty description="暂无待分配订单" />
        </div>
        <div v-else class="order-assign-grid">
          <div
            v-for="order in filteredUnassignedOrders"
            :key="order.id"
            class="order-assign-card"
          >
            <div class="order-assign-header">
              <div class="order-assign-customer">{{ getCustomerName(order.customerId) }}</div>
              <n-tag :type="getOrderStatusType(order.status)" size="small">
                {{ getOrderStatusLabel(order.status) }}
              </n-tag>
            </div>
            <div class="order-assign-body">
              <div class="order-assign-info">
                <span class="info-label">拍摄日期</span>
                <span class="info-value">{{ formatDate(order.shootDate) }}</span>
              </div>
              <div class="order-assign-info">
                <span class="info-label">套餐</span>
                <span class="info-value">{{ orderStore.getOrderPackageName(order) }}</span>
              </div>
              <div class="order-assign-info">
                <span class="info-label">金额</span>
                <span class="info-value">¥{{ ((order.depositAmount || 0) + (order.finalAmount || 0)).toLocaleString() }}</span>
              </div>
              <div class="order-assign-roles">
                <div
                  v-for="roleConfig in getRoleConfigs(order.id)"
                  :key="roleConfig.role"
                  :class="['role-assign-item', { 'role-assigned': roleConfig.assigned }]"
                >
                  <span class="role-label">{{ roleConfig.label }}</span>
                  <span class="role-staff">{{ roleConfig.assigned ? roleConfig.staffName : '未分配' }}</span>
                </div>
              </div>
            </div>
            <div class="order-assign-footer">
              <n-button size="small" type="primary" @click="openQuickAssignModal(order)">快速分配</n-button>
              <n-button size="small" @click="openScheduleModal(null, order.shootDate, order.id)">手动排班</n-button>
            </div>
          </div>
        </div>
      </n-card>

      <n-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="section-title">已分配订单</span>
        </div>
        <n-data-table
          :columns="assignedOrderColumns"
          :data="assignedOrders"
          :bordered="false"
          size="medium"
          striped
        >
          <template #status="{ row }">
            <n-tag :type="getOrderStatusType(row.status)" size="small">
              {{ getOrderStatusLabel(row.status) }}
            </n-tag>
          </template>
          <template #staffing="{ row }">
            <div class="staffing-tags">
              <n-tag
                v-for="asn in getOrderAssignments(row.id)"
                :key="asn.id"
                :type="getAssignmentRoleType(asn.role)"
                size="tiny"
                round
              >
                {{ getStaffName(asn.staffId) }}({{ getAssignmentRoleLabel(asn.role) }})
              </n-tag>
              <n-tag v-if="getOrderAssignments(row.id).length === 0" size="tiny" type="default" round>未排班</n-tag>
            </div>
          </template>
          <template #assignActions="{ row }">
            <n-button text size="small" type="primary" @click="openQuickAssignModal(row)">调整</n-button>
          </template>
        </n-data-table>
      </n-card>
    </template>

    <template v-if="activeTab === 'stats'">
      <n-card style="margin-bottom: 20px;">
        <div class="stats-controls">
          <div class="stats-period">
            <span class="section-title">工作量统计</span>
            <n-radio-group v-model:value="statsPeriod" size="small" style="margin-left: 16px;">
              <n-radio-button value="week">本周</n-radio-button>
              <n-radio-button value="month">本月</n-radio-button>
              <n-radio-button value="quarter">本季度</n-radio-button>
            </n-radio-group>
          </div>
          <n-select
            v-model:value="statsRoleFilter"
            placeholder="角色筛选"
            :options="[{ label: '全部角色', value: 'all' }, ...staffRoleOptions]"
            style="width: 140px;"
            size="small"
          />
        </div>

        <div class="workload-chart-grid">
          <div
            v-for="item in workloadStats"
            :key="item.staff.id"
            :class="['workload-stat-card', { 'stat-overloaded': item.isOverloaded }]"
          >
            <div class="stat-card-top">
              <div class="stat-card-info">
                <span class="stat-card-name">{{ item.staff.name }}</span>
                <n-tag :type="getStaffRoleType(item.staff.role)" size="tiny">
                  {{ getStaffRoleLabel(item.staff.role) }}
                </n-tag>
                <n-tag v-if="item.isOverloaded" type="warning" size="tiny" round>超负荷</n-tag>
              </div>
              <div class="stat-card-count">
                <span class="count-num">{{ item.totalAssignments }}</span>
                <span class="count-max">单/{{ item.maxWorkload }}单</span>
              </div>
            </div>
            <div class="stat-card-progress">
              <div class="progress-bar-bg">
                <div
                  :class="['progress-bar-fill', { 'fill-overload': item.isOverloaded }]"
                  :style="{ width: Math.min(item.workloadPercent, 100) + '%' }"
                ></div>
              </div>
              <span class="progress-percent">{{ item.workloadPercent }}%</span>
            </div>
            <div class="stat-card-details">
              <div class="detail-item">
                <span class="detail-label">已完成</span>
                <span class="detail-value detail-completed">{{ item.completedCount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">进行中</span>
                <span class="detail-value detail-pending">{{ item.inProgressCount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">待执行</span>
                <span class="detail-value detail-waiting">{{ item.pendingCount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">关联收入</span>
                <span class="detail-value detail-revenue">¥{{ item.totalRevenue.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </n-card>

      <n-card>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span class="section-title">人员工作量排行</span>
        </div>
        <n-data-table
          :columns="rankingColumns"
          :data="rankingData"
          :bordered="false"
          size="medium"
          striped
        >
          <template #rank="{ row, index }">
            <div :class="['rank-badge', { 'rank-top': index < 3 }]">
              {{ index + 1 }}
            </div>
          </template>
          <template #role="{ row }">
            <n-tag :type="getStaffRoleType(row.role)" size="small">
              {{ getStaffRoleLabel(row.role) }}
            </n-tag>
          </template>
          <template #workloadBar="{ row }">
            <div class="ranking-workload-bar">
              <div class="bar-bg">
                <div
                  :class="['bar-fill', { 'bar-overload': row.isOverloaded }]"
                  :style="{ width: Math.min(row.workloadPercent, 100) + '%' }"
                ></div>
              </div>
              <span class="bar-text">{{ row.totalAssignments }}单</span>
            </div>
          </template>
          <template #status="{ row }">
            <n-tag :type="row.isOverloaded ? 'warning' : 'success'" size="small">
              {{ row.isOverloaded ? '超负荷' : '正常' }}
            </n-tag>
          </template>
        </n-data-table>
      </n-card>
    </template>

    <n-modal
      v-model:show="showScheduleModal"
      preset="card"
      :title="isEditSchedule ? '编辑排班' : '新增排班'"
      style="width: 560px;"
      @after-leave="handleScheduleModalClose"
    >
      <n-form
        ref="scheduleFormRef"
        :model="scheduleForm"
        :rules="scheduleRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="拍摄日期" path="date">
          <n-date-picker
            v-model:value="scheduleForm.date"
            type="date"
            placeholder="请选择拍摄日期"
            style="width: 100%;"
            @update:value="handleScheduleDateChange"
          />
        </n-form-item>
        <n-form-item label="关联订单" path="orderId">
          <n-select
            v-model:value="scheduleForm.orderId"
            placeholder="请选择关联订单"
            :options="orderOptions"
            filterable
            @update:value="handleScheduleOrderChange"
          />
        </n-form-item>
        <n-form-item label="指派人员" path="staffId">
          <n-select
            v-model:value="scheduleForm.staffId"
            placeholder="请选择人员"
            :options="staffOptionsWithAvailability"
            filterable
          />
        </n-form-item>
        <n-form-item label="担任角色" path="role">
          <n-select
            v-model:value="scheduleForm.role"
            placeholder="请选择角色"
            :options="assignmentRoleOptions"
          />
        </n-form-item>
        <n-form-item label="排班状态" path="status">
          <n-select
            v-model:value="scheduleForm.status"
            :options="assignmentStatusOptions"
          />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="scheduleForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </n-form-item>

        <n-alert
          v-if="scheduleConflictWarning"
          type="warning"
          title="档期冲突"
          style="margin-top: 8px;"
        >
          {{ scheduleConflictWarning }}
        </n-alert>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showScheduleModal = false">取消</n-button>
          <n-button type="primary" @click="handleScheduleSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showQuickAssignModal"
      preset="card"
      title="快速分配人员"
      style="width: 640px;"
      @after-leave="handleQuickAssignModalClose"
    >
      <div v-if="quickAssignOrder" class="quick-assign-header">
        <div class="quick-assign-info">
          <div class="quick-assign-customer">{{ getCustomerName(quickAssignOrder.customerId) }}</div>
          <div class="quick-assign-detail">
            {{ orderStore.getOrderPackageName(quickAssignOrder) }} · {{ formatDate(quickAssignOrder.shootDate) }} · ¥{{ ((quickAssignOrder.depositAmount || 0) + (quickAssignOrder.finalAmount || 0)).toLocaleString() }}
          </div>
        </div>
        <n-tag :type="getOrderStatusType(quickAssignOrder.status)" size="small">
          {{ getOrderStatusLabel(quickAssignOrder.status) }}
        </n-tag>
      </div>

      <div class="quick-assign-form">
        <div class="quick-role-section" v-for="roleConfig in quickRoleConfigs" :key="roleConfig.role">
          <div class="quick-role-header">
            <span class="quick-role-label">{{ roleConfig.label }}</span>
            <n-switch
              v-model:value="roleConfig.enabled"
              size="small"
              @update:value="handleQuickRoleToggle(roleConfig.role)"
            />
          </div>
          <div v-if="roleConfig.enabled" class="quick-role-content">
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
        v-if="quickConflictWarning"
        type="warning"
        title="存在冲突"
        style="margin-top: 16px;"
      >
        {{ quickConflictWarning }}
      </n-alert>

      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showQuickAssignModal = false">取消</n-button>
          <n-button type="primary" @click="handleQuickAssignSubmit">确认分配</n-button>
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
  AlertCircleOutline,
  TimeOutline
} from '@vicons/ionicons5'
import { useScheduleStore } from '@/stores/schedule'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { usePackageStore } from '@/stores/package'
import { useTravelShootStore } from '@/stores/travelShoot'
import {
  formatDate,
  ORDER_STATUS,
  STAFF_ROLE,
  ASSIGNMENT_ROLE,
  ASSIGNMENT_STATUS,
  PAYMENT_STATUS
} from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const scheduleStore = useScheduleStore()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const packageStore = usePackageStore()
const travelShootStore = useTravelShootStore()

const activeTab = ref('schedule')
const scheduleRoleFilter = ref('all')
const assignmentStatusFilter = ref('all')
const assignOrderFilter = ref('all')
const statsPeriod = ref('month')
const statsRoleFilter = ref('all')

function getMonday(d) {
  const day = d.day()
  const diff = day === 0 ? -6 : 1 - day
  return d.add(diff, 'day').startOf('day')
}

function normalizeAndValidateAssignmentDate(rawDate, orderId, context = '排班') {
  const warnings = []
  if (rawDate == null || rawDate === '' || rawDate === undefined) {
    return { dateStr: '', valid: false, warnings: ['未选择日期'] }
  }

  const d = dayjs(rawDate)
  if (!d.isValid()) {
    return { dateStr: '', valid: false, warnings: ['日期格式无效'] }
  }

  const dateStr = d.format('YYYY-MM-DD')
  const roundTrip = dayjs(dateStr).format('YYYY-MM-DD')
  if (roundTrip !== dateStr) {
    warnings.push(`[${context}] 日期往返映射不一致：原始格式=${dateStr}，解析后=${roundTrip}`)
    console.warn(...warnings)
  }

  const weekdayIdx = d.day()
  if (weekdayIdx !== 0 && weekdayIdx !== 1 && weekdayIdx !== 2 &&
      weekdayIdx !== 3 && weekdayIdx !== 4 && weekdayIdx !== 5 && weekdayIdx !== 6) {
    warnings.push(`[${context}] 星期值异常：${weekdayIdx}`)
  }

  if (orderId) {
    const order = orderStore.getOrderById(orderId)
    if (order && order.shootDate) {
      if (dateStr !== order.shootDate) {
        warnings.push(`排班日期 ${dateStr} 与订单拍摄日期 ${order.shootDate} 不一致`)
      }
    }
  }

  return { dateStr, valid: true, warnings }
}

function validateQuickAssignDate(order, context = '快速分配') {
  if (!order || !order.shootDate) {
    return { dateStr: '', valid: false, warnings: ['订单拍摄日期缺失'] }
  }
  return normalizeAndValidateAssignmentDate(order.shootDate, order.id, context)
}

const weekStart = ref(getMonday(dayjs()))

const showScheduleModal = ref(false)
const isEditSchedule = ref(false)
const editScheduleId = ref('')
const scheduleFormRef = ref(null)

const showQuickAssignModal = ref(false)
const quickAssignOrder = ref(null)
const quickRoleConfigs = ref([])

const scheduleForm = reactive({
  date: null,
  orderId: '',
  staffId: '',
  role: '',
  status: 'pending',
  remark: ''
})

const scheduleRules = {
  date: [{ required: true, message: '请选择拍摄日期', trigger: 'change' }],
  orderId: [{ required: true, message: '请选择关联订单', trigger: 'change' }],
  staffId: [{ required: true, message: '请选择人员', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const staffRoleOptions = Object.entries(STAFF_ROLE).map(([value, { label }]) => ({ label, value }))
const assignmentRoleOptions = Object.entries(ASSIGNMENT_ROLE).map(([value, { label }]) => ({ label, value }))
const assignmentStatusOptions = Object.entries(ASSIGNMENT_STATUS).map(([value, { label }]) => ({ label, value }))
const assignmentStatusFilterOptions = Object.entries(ASSIGNMENT_STATUS).map(([value, { label }]) => ({ label, value }))

const assignFilterOptions = [
  { label: '全部', value: 'all' },
  { label: '未排班', value: 'unassigned' },
  { label: '部分排班', value: 'partial' },
  { label: '已排班', value: 'assigned' }
]

const weekDays = computed(() => {
  const days = []
  const weekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const dayOfWeekMap = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 }
  for (let i = 0; i < 7; i++) {
    const d = weekStart.value.add(i, 'day')
    const dateStr = d.format('YYYY-MM-DD')
    const jsDay = d.day()
    const expectedIndex = dayOfWeekMap[jsDay]
    if (expectedIndex !== i) {
      console.warn(`[排班日期校验] 日期${dateStr}的星期(${weekdayLabels[expectedIndex]})与列位置(${weekdayLabels[i]})不匹配`)
    }
    days.push({
      dateStr,
      dateLabel: d.format('MM/DD'),
      weekday: weekdayLabels[i],
      isToday: d.isSame(dayjs(), 'day'),
      isWeekend: jsDay === 0 || jsDay === 6
    })
  }
  return days
})

const weekRangeLabel = computed(() => {
  const start = weekStart.value.format('YYYY年MM月DD日')
  const end = weekStart.value.add(6, 'day').format('MM月DD日')
  return `${start} - ${end}`
})

const filteredStaff = computed(() => {
  if (scheduleRoleFilter.value === 'all') return scheduleStore.activeStaff
  return scheduleStore.activeStaff.filter(s => s.role === scheduleRoleFilter.value)
})

const filteredAssignments = computed(() => {
  let list = scheduleStore.assignments
  if (assignmentStatusFilter.value !== 'all') {
    list = list.filter(a => a.status === assignmentStatusFilter.value)
  }
  return list.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
})

const todayScheduleCount = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return scheduleStore.getAssignmentsByDate(today).filter(a => a.status !== 'cancelled').length
})

const unassignedOrderCount = computed(() => {
  return orderStore.orders.filter(o => {
    if (o.status === 'completed' || o.status === 'cancelled') return false
    const staffing = scheduleStore.getOrderStaffingStatus(o.id)
    return !staffing.isFullyStaffed
  }).length
})

const overloadedStaffCount = computed(() => {
  return scheduleStore.getAllStaffMonthlyWorkload(dayjs().year(), dayjs().month() + 1, orderStore)
    .filter(item => item.workload.isOverloaded).length
})

const orderOptions = computed(() =>
  orderStore.orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .map(o => ({
      label: `${formatDate(o.shootDate)} - ${getCustomerName(o.customerId)} (${getOrderStatusLabel(o.status)})`,
      value: o.id
    }))
)

const staffOptionsWithAvailability = computed(() => {
  const dateStr = scheduleForm.date ? dayjs(scheduleForm.date).format('YYYY-MM-DD') : ''
  if (!dateStr) {
    return scheduleStore.activeStaff.map(s => ({
      label: `${s.name} (${getStaffRoleLabel(s.role)})`,
      value: s.id
    }))
  }
  return scheduleStore.activeStaff.map(s => {
    const hasConflict = scheduleStore.checkStaffConflict(s.id, dateStr, scheduleForm.role)
    return {
      label: `${s.name} (${getStaffRoleLabel(s.role)})${hasConflict ? ' - 已安排' : ' - 空闲'}`,
      value: s.id,
      disabled: hasConflict
    }
  })
})

const scheduleConflictWarning = computed(() => {
  if (!scheduleForm.staffId || !scheduleForm.date) return ''
  const dateStr = dayjs(scheduleForm.date).format('YYYY-MM-DD')
  const hasConflict = scheduleStore.checkStaffConflict(
    scheduleForm.staffId,
    dateStr,
    scheduleForm.role,
    isEditSchedule.value ? editScheduleId.value : null
  )
  if (hasConflict) {
    const staffName = getStaffName(scheduleForm.staffId)
    return `${staffName} 在 ${dateStr} 已有排班任务，存在档期冲突`
  }
  return ''
})

const quickConflictWarning = computed(() => {
  if (!quickAssignOrder.value) return ''
  const conflicts = []
  const staffUsedMap = {}
  quickRoleConfigs.value.forEach(config => {
    if (config.enabled && config.selectedStaff) {
      if (staffUsedMap[config.selectedStaff]) {
        conflicts.push(`${getStaffName(config.selectedStaff)} 被分配了多个角色`)
      }
      staffUsedMap[config.selectedStaff] = true
      const hasConflict = scheduleStore.checkStaffConflict(
        config.selectedStaff,
        quickAssignOrder.value.shootDate,
        config.role,
        config.existingId || null
      )
      if (hasConflict) {
        conflicts.push(`${getStaffName(config.selectedStaff)} (${config.label}) 已有排班`)
      }
    }
  })
  if (conflicts.length > 0) {
    return `以下冲突需注意：${conflicts.join('；')}`
  }
  return ''
})

const filteredUnassignedOrders = computed(() => {
  const orders = orderStore.orders.filter(o => {
    if (o.status === 'completed' || o.status === 'cancelled') return false
    const staffing = scheduleStore.getOrderStaffingStatus(o.id)
    if (assignOrderFilter.value === 'unassigned') return staffing.total === 0
    if (assignOrderFilter.value === 'partial') return staffing.total > 0 && !staffing.isFullyStaffed
    if (assignOrderFilter.value === 'assigned') return staffing.isFullyStaffed
    return !staffing.isFullyStaffed
  })
  return orders.sort((a, b) => dayjs(a.shootDate).valueOf() - dayjs(b.shootDate).valueOf())
})

const assignedOrders = computed(() => {
  return orderStore.orders
    .filter(o => {
      if (o.status === 'completed' || o.status === 'cancelled') return false
      const staffing = scheduleStore.getOrderStaffingStatus(o.id)
      return staffing.total > 0
    })
    .sort((a, b) => dayjs(a.shootDate).valueOf() - dayjs(b.shootDate).valueOf())
})

function getStatsDateRange() {
  const now = dayjs()
  if (statsPeriod.value === 'week') {
    const monday = getMonday(now)
    return {
      start: monday.format('YYYY-MM-DD'),
      end: monday.add(6, 'day').format('YYYY-MM-DD')
    }
  } else if (statsPeriod.value === 'month') {
    return {
      start: now.startOf('month').format('YYYY-MM-DD'),
      end: now.endOf('month').format('YYYY-MM-DD')
    }
  } else {
    return {
      start: now.startOf('quarter').format('YYYY-MM-DD'),
      end: now.endOf('quarter').format('YYYY-MM-DD')
    }
  }
}

const workloadStats = computed(() => {
  const { start, end } = getStatsDateRange()
  let staffList = scheduleStore.activeStaff
  if (statsRoleFilter.value !== 'all') {
    staffList = staffList.filter(s => s.role === statsRoleFilter.value)
  }

  return staffList.map(s => {
    const workload = scheduleStore.getStaffWorkload(s.id, start, end)
    const maxWorkload = scheduleStore.getStaffMaxWorkload(s.role)
    const workloadPercent = Math.min(Math.round((workload.total / maxWorkload) * 100), 200)

    let totalRevenue = 0
    const staffAssignments = scheduleStore.getAssignmentsByStaff(s.id).filter(a => {
      if (a.status === 'cancelled') return false
      const d = dayjs(a.date)
      return d.isAfter(dayjs(start).subtract(1, 'day')) && d.isBefore(dayjs(end).add(1, 'day'))
    })
    const orderIds = new Set(staffAssignments.map(a => a.orderId))
    orderIds.forEach(oid => {
      const order = orderStore.getOrderById(oid)
      if (order) {
        totalRevenue += (order.depositAmount || 0) + (order.finalAmount || 0)
      }
    })

    return {
      staff: s,
      totalAssignments: workload.total,
      completedCount: workload.completed,
      inProgressCount: staffAssignments.filter(a => a.status === 'in_progress').length,
      pendingCount: workload.pending,
      maxWorkload,
      workloadPercent,
      isOverloaded: workload.total > maxWorkload,
      totalRevenue
    }
  })
})

const rankingData = computed(() => {
  return [...workloadStats.value]
    .sort((a, b) => b.totalAssignments - a.totalAssignments)
    .map(item => ({
      name: item.staff.name,
      role: item.staff.role,
      totalAssignments: item.totalAssignments,
      completedCount: item.completedCount,
      pendingCount: item.pendingCount,
      workloadPercent: item.workloadPercent,
      isOverloaded: item.isOverloaded,
      totalRevenue: item.totalRevenue
    }))
})

const assignmentColumns = [
  { title: '日期', key: 'date', width: 110, render: (row) => formatDate(row.date) },
  { title: '人员', key: 'staffName', width: 100 },
  { title: '角色', key: 'role', width: 100 },
  { title: '客户', key: 'customerName', width: 140 },
  { title: '状态', key: 'status', width: 90 },
  { title: '备注', key: 'remark', ellipsis: { tooltip: true } },
  { title: '操作', key: 'actions', width: 120 }
]

const assignedOrderColumns = [
  { title: '拍摄日期', key: 'shootDate', width: 110, render: (row) => formatDate(row.shootDate) },
  { title: '客户', key: 'customerId', width: 140, render: (row) => getCustomerName(row.customerId) },
  { title: '套餐', key: 'packageId', render: (row) => orderStore.getOrderPackageName(row) },
  { title: '订单状态', key: 'status', width: 100 },
  { title: '人员安排', key: 'staffing', width: 280 },
  { title: '操作', key: 'assignActions', width: 80 }
]

const rankingColumns = [
  { title: '排名', key: 'rank', width: 60 },
  { title: '姓名', key: 'name', width: 100 },
  { title: '角色', key: 'role', width: 100 },
  { title: '工作量', key: 'workloadBar', width: 200 },
  { title: '已完成', key: 'completedCount', width: 80 },
  { title: '待执行', key: 'pendingCount', width: 80 },
  { title: '关联收入', key: 'totalRevenue', width: 120, render: (row) => `¥${row.totalRevenue.toLocaleString()}` },
  { title: '状态', key: 'status', width: 80 }
]

function getCustomerName(id) {
  const customer = customerStore.getCustomerById(id)
  return customer ? customer.name : '未知客户'
}

function getPackageName(id) {
  const pkg = packageStore.getPackageById(id)
  return pkg ? pkg.name : '未知套餐'
}

function getStaffName(id) {
  const staff = scheduleStore.getStaffById(id)
  return staff ? staff.name : '未知人员'
}

function getCustomerByOrder(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (!order) return '未知'
  return getCustomerName(order.customerId)
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

function getStaffDayAssignments(staffId, dateStr) {
  return scheduleStore.getAssignmentsByDate(dateStr).filter(a => a.staffId === staffId && a.status !== 'cancelled')
}

function getOrderAssignments(orderId) {
  return scheduleStore.getAssignmentsByOrder(orderId).filter(a => a.status !== 'cancelled')
}

function getRoleConfigs(orderId) {
  const assignments = getOrderAssignments(orderId)
  return [
    { role: 'chief_photographer', label: '主摄影师', assigned: assignments.some(a => a.role === 'chief_photographer'), staffName: assignments.find(a => a.role === 'chief_photographer') ? getStaffName(assignments.find(a => a.role === 'chief_photographer').staffId) : '' },
    { role: 'assistant', label: '摄影助理', assigned: assignments.some(a => a.role === 'assistant'), staffName: assignments.find(a => a.role === 'assistant') ? getStaffName(assignments.find(a => a.role === 'assistant').staffId) : '' },
    { role: 'makeup_artist', label: '化妆师', assigned: assignments.some(a => a.role === 'makeup_artist'), staffName: assignments.find(a => a.role === 'makeup_artist') ? getStaffName(assignments.find(a => a.role === 'makeup_artist').staffId) : '' },
    { role: 'videographer', label: '摄像师', assigned: assignments.some(a => a.role === 'videographer'), staffName: assignments.find(a => a.role === 'videographer') ? getStaffName(assignments.find(a => a.role === 'videographer').staffId) : '' }
  ]
}

function prevWeek() {
  weekStart.value = weekStart.value.subtract(7, 'day')
}

function nextWeek() {
  weekStart.value = weekStart.value.add(7, 'day')
}

function goCurrentWeek() {
  weekStart.value = getMonday(dayjs())
}

function openScheduleModal(preStaffId, preDate, preOrderId) {
  isEditSchedule.value = false
  editScheduleId.value = ''
  resetScheduleForm()

  if (preStaffId) scheduleForm.staffId = preStaffId
  if (preDate) scheduleForm.date = dayjs(preDate).valueOf()
  if (preOrderId) {
    scheduleForm.orderId = preOrderId
    const order = orderStore.getOrderById(preOrderId)
    if (order && !preDate) {
      scheduleForm.date = dayjs(order.shootDate).valueOf()
    }
  }

  showScheduleModal.value = true
}

function resetScheduleForm() {
  Object.assign(scheduleForm, {
    date: null,
    orderId: '',
    staffId: '',
    role: '',
    status: 'pending',
    remark: ''
  })
  scheduleFormRef.value?.restoreValidation()
}

function handleScheduleModalClose() {
  resetScheduleForm()
}

function handleScheduleDateChange() {
  if (scheduleForm.staffId) {
    scheduleForm.staffId = ''
  }
}

function handleScheduleOrderChange(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (order && order.shootDate) {
    scheduleForm.date = dayjs(order.shootDate).valueOf()
  }
}

function editAssignment(asn) {
  isEditSchedule.value = true
  editScheduleId.value = asn.id
  Object.assign(scheduleForm, {
    date: asn.date ? dayjs(asn.date).valueOf() : null,
    orderId: asn.orderId,
    staffId: asn.staffId,
    role: asn.role,
    status: asn.status,
    remark: asn.remark || ''
  })
  showScheduleModal.value = true
}

function handleScheduleSubmit() {
  scheduleFormRef.value?.validate((errors) => {
    if (!errors) {
      const context = isEditSchedule.value ? '编辑排班' : '新增排班'
      const dateCheck = normalizeAndValidateAssignmentDate(scheduleForm.date, scheduleForm.orderId, context)
      if (!dateCheck.valid) {
        message.error(dateCheck.warnings.join('；'))
        return
      }
      const dateStr = dateCheck.dateStr

      const data = {
        ...scheduleForm,
        date: dateStr
      }

      const nonConflictWarnings = dateCheck.warnings.filter(
        w => !scheduleConflictWarning.value || !w.includes('已有排班')
      )
      const hasDateWarnings = nonConflictWarnings.length > 0
      const hasConflict = !!scheduleConflictWarning.value

      const finalizeUpdate = () => {
        scheduleStore.updateAssignment(editScheduleId.value, data)
        message.success('排班更新成功')
        showScheduleModal.value = false
      }

      const finalizeAdd = () => {
        scheduleStore.addAssignment(data)
        message.success('排班添加成功')
        showScheduleModal.value = false
      }

      if (isEditSchedule.value) {
        if (hasDateWarnings) {
          dialog.warning({
            title: '日期校验提示',
            content: nonConflictWarnings.join('；\n'),
            positiveText: '仍要更新',
            negativeText: '取消',
            onPositiveClick: finalizeUpdate
          })
        } else {
          finalizeUpdate()
        }
      } else {
        const combined = []
        if (hasConflict) combined.push(scheduleConflictWarning.value)
        if (hasDateWarnings) combined.push(...nonConflictWarnings)

        if (combined.length > 0) {
          dialog.warning({
            title: hasConflict ? '档期冲突' : '日期校验提示',
            content: combined.join('；\n') + '，确定还要继续排班吗？',
            positiveText: '继续排班',
            negativeText: '取消',
            onPositiveClick: finalizeAdd
          })
        } else {
          finalizeAdd()
        }
      }
    }
  })
}

function handleDeleteAssignment(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除 ${getStaffName(row.staffId)} 的排班吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      scheduleStore.deleteAssignment(row.id)
      message.success('删除成功')
    }
  })
}

function openQuickAssignModal(order) {
  quickAssignOrder.value = order
  initQuickRoleConfigs()
  showQuickAssignModal.value = true
}

function initQuickRoleConfigs() {
  const existingAssignments = quickAssignOrder.value
    ? scheduleStore.getAssignmentsByOrder(quickAssignOrder.value.id).filter(a => a.status !== 'cancelled')
    : []

  quickRoleConfigs.value = [
    { role: 'chief_photographer', label: '主摄影师', enabled: false, selectedStaff: '' },
    { role: 'assistant', label: '摄影助理', enabled: false, selectedStaff: '' },
    { role: 'makeup_artist', label: '化妆师', enabled: false, selectedStaff: '' },
    { role: 'videographer', label: '摄像师', enabled: false, selectedStaff: '' }
  ]

  existingAssignments.forEach(asn => {
    const config = quickRoleConfigs.value.find(c => c.role === asn.role)
    if (config) {
      config.enabled = true
      config.selectedStaff = asn.staffId
      config.existingId = asn.id
    }
  })
}

function handleQuickRoleToggle(role) {
  const config = quickRoleConfigs.value.find(c => c.role === role)
  if (config && !config.enabled) {
    config.selectedStaff = ''
  }
}

function handleQuickAssignModalClose() {
  quickAssignOrder.value = null
  quickRoleConfigs.value = []
}

function getAvailableStaffForRole(role) {
  if (!quickAssignOrder.value) return []
  const date = quickAssignOrder.value.shootDate
  const available = scheduleStore.suggestStaffForDate(date, role)
  return available.map(s => ({
    label: `${s.name} (近期${s.workload}单)`,
    value: s.id
  }))
}

function getRecommendedStaff(role) {
  if (!quickAssignOrder.value) return '暂无推荐'
  const date = quickAssignOrder.value.shootDate
  const available = scheduleStore.suggestStaffForDate(date, role)
  if (available.length > 0) {
    return `${available[0].name} (工作量最少)`
  }
  return '暂无空闲人员'
}

function handleQuickAssignSubmit() {
  if (!quickAssignOrder.value) return

  const dateCheck = validateQuickAssignDate(quickAssignOrder.value, '快速分配')
  if (!dateCheck.valid) {
    message.error(dateCheck.warnings.join('；'))
    return
  }
  const dateStr = dateCheck.dateStr

  const selectedConfigs = quickRoleConfigs.value.filter(c => c.enabled && c.selectedStaff)
  if (selectedConfigs.length === 0) {
    message.warning('请至少选择一个人员')
    return
  }

  const hasConflicts = selectedConfigs.some(config =>
    scheduleStore.checkStaffConflict(
      config.selectedStaff,
      dateStr,
      config.role,
      config.existingId || null
    )
  )

  const submit = () => {
    selectedConfigs.forEach(config => {
      if (config.existingId) {
        scheduleStore.updateAssignment(config.existingId, {
          orderId: quickAssignOrder.value.id,
          staffId: config.selectedStaff,
          date: dateStr,
          role: config.role,
          status: 'confirmed'
        })
      } else {
        scheduleStore.addAssignment({
          orderId: quickAssignOrder.value.id,
          staffId: config.selectedStaff,
          date: dateStr,
          role: config.role,
          status: 'confirmed',
          remark: ''
        })
      }
    })

    const order = orderStore.getOrderById(quickAssignOrder.value.id)
    if (order && (order.status === 'pending' || order.status === 'confirmed')) {
      const shootDay = dayjs(dateStr)
      const today = dayjs().startOf('day')
      let newStatus = order.status
      if (shootDay.isBefore(today, 'day') || shootDay.isSame(today, 'day')) {
        newStatus = 'shooting'
      } else if (order.status === 'pending') {
        newStatus = 'confirmed'
      }
      if (newStatus !== order.status) {
        orderStore.updateOrder(order.id, { status: newStatus })
      }
    }

    message.success('人员分配成功')
    showQuickAssignModal.value = false
  }

  const dialogWarnings = []
  if (dateCheck.warnings.length > 0) dialogWarnings.push(...dateCheck.warnings)
  if (hasConflicts) dialogWarnings.push(quickConflictWarning.value || '部分人员存在档期冲突')

  if (dialogWarnings.length > 0) {
    dialog.warning({
      title: hasConflicts ? '档期冲突' : '日期校验提示',
      content: dialogWarnings.join('；\n') + (hasConflicts ? '，确定还要继续排班吗？' : ''),
      positiveText: '继续排班',
      negativeText: '取消',
      onPositiveClick: submit
    })
  } else {
    submit()
  }
}

onMounted(() => {
  scheduleStore.fetchStaff()
  scheduleStore.fetchAssignments()
  orderStore.fetchOrders()
  customerStore.fetchCustomers()
  packageStore.fetchPackages()
  travelShootStore.fetchAll()
})
</script>

<style scoped>
.team-page {
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

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.schedule-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.schedule-date-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.week-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 240px;
  text-align: center;
}

.schedule-filters {
  display: flex;
  gap: 8px;
}

.schedule-grid {
  overflow-x: auto;
}

.schedule-header-row {
  display: flex;
  border-bottom: 2px solid #e8e8e8;
  min-width: 100%;
}

.schedule-header-cell {
  min-width: 140px;
  padding: 10px 8px;
  text-align: center;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.schedule-header-cell.staff-cell {
  min-width: 120px;
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
  text-align: left;
  font-weight: 600;
}

.schedule-header-cell.is-today {
  background: #fff8f0;
  color: #D4A574;
  font-weight: 600;
}

.schedule-header-cell.is-weekend {
  background: #fafafa;
}

.header-weekday {
  font-size: 12px;
  color: #999;
}

.header-date {
  font-size: 14px;
  font-weight: 600;
}

.schedule-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  min-width: 100%;
}

.schedule-row:hover {
  background: #fdfaf7;
}

.schedule-cell {
  min-width: 140px;
  padding: 8px;
  border-right: 1px solid #f5f5f5;
  min-height: 70px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.schedule-cell:hover {
  background: #fdf5ed;
}

.schedule-cell.staff-cell {
  min-width: 120px;
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 1;
  cursor: default;
  display: flex;
  align-items: center;
  border-right: 1px solid #e8e8e8;
}

.schedule-row:hover .schedule-cell.staff-cell {
  background: #fdfaf7;
}

.schedule-cell.is-today {
  background: #fff8f0;
}

.schedule-cell.is-weekend {
  background: #fafafa;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.staff-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.cell-assignments {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-assignment-chip {
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.cell-assignment-chip:hover {
  opacity: 0.85;
}

.chip-status-pending { background: #fff7e6; border: 1px solid #ffe58f; color: #d48806; }
.chip-status-confirmed { background: #e6f7ff; border: 1px solid #91d5ff; color: #096dd9; }
.chip-status-in_progress { background: #f0fff0; border: 1px solid #b7eb8f; color: #389e0d; }
.chip-status-completed { background: #f6ffed; border: 1px solid #d9f7be; color: #52c41a; }
.chip-status-cancelled { background: #fff1f0; border: 1px solid #ffa39e; color: #cf1322; }

.chip-role {
  font-weight: 500;
  margin-right: 2px;
}

.chip-customer {
  color: inherit;
  opacity: 0.8;
}

.cell-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0;
  transition: opacity 0.15s;
}

.schedule-cell:hover .cell-empty {
  opacity: 1;
}

.order-assign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.order-assign-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.order-assign-card:hover {
  border-color: #D4A574;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.12);
}

.order-assign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-assign-customer {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.order-assign-body {
  margin-bottom: 12px;
}

.order-assign-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.info-label {
  color: #999;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.order-assign-roles {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.role-assign-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.role-label {
  color: #666;
}

.role-staff {
  font-weight: 500;
}

.role-assigned .role-staff {
  color: #18a058;
}

.role-assign-item:not(.role-assigned) .role-staff {
  color: #e88080;
}

.order-assign-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.staffing-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.empty-state {
  padding: 40px 0;
}

.quick-assign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.quick-assign-customer {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.quick-assign-detail {
  font-size: 13px;
  color: #999;
}

.quick-assign-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-role-section {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.quick-role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.quick-role-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.quick-role-content {
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}

.stats-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-period {
  display: flex;
  align-items: center;
}

.workload-chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.workload-stat-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  background: #fff;
}

.workload-stat-card:hover {
  border-color: #D4A574;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.12);
}

.workload-stat-card.stat-overloaded {
  background: linear-gradient(135deg, #fffbe6 0%, #fff5d6 100%);
  border-color: #ffe58f;
}

.workload-stat-card.stat-overloaded:hover {
  border-color: #f0a020;
  box-shadow: 0 2px 8px rgba(240, 160, 32, 0.2);
}

.stat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-card-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.stat-card-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.stat-card-count {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.count-num {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.stat-overloaded .count-num {
  color: #f0a020;
}

.count-max {
  font-size: 13px;
  color: #999;
}

.stat-card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4A574, #C49564);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar-fill.fill-overload {
  background: linear-gradient(90deg, #f0a020, #e88010);
}

.progress-percent {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.stat-overloaded .progress-percent {
  color: #f0a020;
}

.stat-card-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
}

.stat-overloaded .detail-item {
  background: rgba(240, 160, 32, 0.06);
}

.detail-label {
  color: #999;
}

.detail-value {
  font-weight: 600;
}

.detail-completed { color: #18a058; }
.detail-pending { color: #2080f0; }
.detail-waiting { color: #f0a020; }
.detail-revenue { color: #D4A574; }

.ranking-workload-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ranking-workload-bar .bar-bg {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ranking-workload-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4A574, #C49564);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ranking-workload-bar .bar-fill.bar-overload {
  background: linear-gradient(90deg, #f0a020, #e88010);
}

.ranking-workload-bar .bar-text {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  min-width: 36px;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  background: #f5f5f5;
}

.rank-badge.rank-top {
  color: #fff;
  background: linear-gradient(135deg, #D4A574, #C49564);
}
</style>
