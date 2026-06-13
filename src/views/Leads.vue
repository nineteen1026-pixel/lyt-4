<template>
  <div class="leads-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">客户线索</h2>
        <p class="page-subtitle">共 {{ leadStore.leadCount }} 条线索，转化率 {{ leadStore.conversionRate }}%</p>
      </div>
      <div class="header-actions">
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索客户姓名/电话/酒店"
          style="width: 260px; margin-right: 12px;"
          clearable
        >
          <template #prefix>
            <n-icon>
              <search-outline />
            </n-icon>
          </template>
        </n-input>
        <n-select
          v-model:value="statusFilter"
          placeholder="状态筛选"
          style="width: 140px; margin-right: 12px;"
          clearable
          :options="statusOptions"
        />
        <n-button type="primary" @click="openAddModal">
          <template #icon>
            <add-outline />
          </template>
          新增线索
        </n-button>
      </div>
    </div>

    <div class="stats-row">
      <n-card class="stat-item">
        <div class="stat-num">{{ leadStore.newLeadsCount }}</div>
        <div class="stat-label">新线索</div>
      </n-card>
      <n-card class="stat-item">
        <div class="stat-num">{{ pendingCount }}</div>
        <div class="stat-label">跟进中</div>
      </n-card>
      <n-card class="stat-item">
        <div class="stat-num">{{ leadStore.convertedLeadsCount }}</div>
        <div class="stat-label">已转化</div>
      </n-card>
      <n-card class="stat-item">
        <div class="stat-num">{{ lostCount }}</div>
        <div class="stat-label">已流失</div>
      </n-card>
    </div>

    <n-card>
      <n-data-table
        :columns="columns"
        :data="filteredLeads"
        :pagination="pagination"
        :bordered="false"
        size="medium"
        striped
      >
        <template #actions="{ row }">
          <n-button text size="small" type="primary" style="margin-right: 8px;" @click="openDetail(row)">
            详情
          </n-button>
          <n-button text size="small" type="success" style="margin-right: 8px;" @click="openFollowUp(row)" v-if="row.status !== 'converted' && row.status !== 'lost'">
            跟进
          </n-button>
          <n-button text size="small" style="margin-right: 8px;" @click="openEditModal(row)">
            编辑
          </n-button>
          <n-button text size="small" type="error" @click="handleDelete(row)">
            删除
          </n-button>
        </template>
      </n-data-table>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑线索' : '新增线索'"
      style="width: 600px;"
      @after-leave="handleModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="客户姓名" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入客户姓名" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="联系电话" path="phone">
            <n-input v-model:value="formData.phone" placeholder="请输入联系电话" @blur="handlePhoneBlur" />
          </n-form-item>
          <n-form-item label="微信号">
            <n-input v-model:value="formData.wechat" placeholder="请输入微信号" />
          </n-form-item>
        </n-grid>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="线索来源" path="source">
            <n-select v-model:value="formData.source" :options="sourceOptions" placeholder="请选择来源" />
          </n-form-item>
          <n-form-item label="线索状态" path="status">
            <n-select v-model:value="formData.status" :options="statusSelectOptions" placeholder="请选择状态" />
          </n-form-item>
        </n-grid>
        <n-form-item v-if="formData.source === 'referral'" label="推荐人" path="referralName">
          <n-input v-model:value="formData.referralName" placeholder="请输入推荐人姓名" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="婚期">
            <n-date-picker
              v-model:value="formData.weddingDate"
              type="date"
              placeholder="请选择婚期"
              style="width: 100%;"
            />
          </n-form-item>
          <n-form-item label="预算(元)">
            <n-input-number
              v-model:value="formData.budget"
              placeholder="请输入预算"
              style="width: 100%;"
              :min="0"
            />
          </n-form-item>
        </n-grid>
        <n-form-item label="婚礼酒店">
          <n-input v-model:value="formData.hotel" placeholder="请输入婚礼酒店" />
        </n-form-item>
        <n-form-item label="意向套餐">
          <n-select v-model:value="formData.packageInterest" :options="packageOptions" placeholder="请选择意向套餐" clearable />
        </n-form-item>
        <n-form-item label="下次跟进">
          <n-date-picker
            v-model:value="formData.nextFollowUp"
            type="date"
            placeholder="请选择下次跟进时间"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="formData.remark"
            type="textarea"
            :rows="3"
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

    <n-modal
      v-model:show="showFollowUpModal"
      preset="card"
      title="添加跟进记录"
      style="width: 520px;"
      @after-leave="handleFollowUpModalClose"
    >
      <n-form
        ref="followUpFormRef"
        :model="followUpForm"
        :rules="followUpRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="跟进方式" path="type">
          <n-select v-model:value="followUpForm.type" :options="followUpTypeOptions" placeholder="请选择跟进方式" />
        </n-form-item>
        <n-form-item label="当前状态" path="status">
          <n-select v-model:value="followUpForm.status" :options="statusSelectOptions" placeholder="请选择当前状态" />
        </n-form-item>
        <n-form-item label="跟进内容" path="content">
          <n-input
            v-model:value="followUpForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
          />
        </n-form-item>
        <n-form-item label="下次跟进">
          <n-date-picker
            v-model:value="followUpForm.nextFollowUp"
            type="date"
            placeholder="请选择下次跟进时间"
            style="width: 100%;"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showFollowUpModal = false">取消</n-button>
          <n-button type="primary" @click="handleFollowUpSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer v-model:show="showDetail" :width="560" :mask-closable="true">
      <n-drawer-content title="线索详情" :native-scrollbar="false">
        <template #header-extra>
          <n-button text size="small" type="primary" @click="handleConvert" v-if="currentLead && currentLead.status !== 'converted' && currentLead.status !== 'lost'">
            转化为客户
          </n-button>
        </template>
        <div v-if="currentLead" class="detail-content">
          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <n-descriptions :column="1" bordered size="small">
              <n-descriptions-item label="客户姓名">{{ currentLead.name }}</n-descriptions-item>
              <n-descriptions-item label="联系电话">{{ currentLead.phone }}</n-descriptions-item>
              <n-descriptions-item label="微信号">{{ currentLead.wechat || '-' }}</n-descriptions-item>
              <n-descriptions-item label="线索来源">
                {{ getSourceLabel(currentLead.source) }}
                <span v-if="currentLead.source === 'referral' && currentLead.referralName" style="margin-left: 8px; color: #666; font-size: 12px;">
                  推荐人：{{ currentLead.referralName }}
                </span>
              </n-descriptions-item>
              <n-descriptions-item label="当前状态">
                <n-tag :type="getStatusType(currentLead.status)" size="small">
                  {{ getStatusLabel(currentLead.status) }}
                </n-tag>
              </n-descriptions-item>
            </n-descriptions>
          </div>

          <div class="detail-section">
            <div class="section-title">需求信息</div>
            <n-descriptions :column="1" bordered size="small">
              <n-descriptions-item label="婚期">{{ formatDate(currentLead.weddingDate) || '-' }}</n-descriptions-item>
              <n-descriptions-item label="婚礼酒店">{{ currentLead.hotel || '-' }}</n-descriptions-item>
              <n-descriptions-item label="预算">{{ currentLead.budget ? '¥' + currentLead.budget.toLocaleString() : '-' }}</n-descriptions-item>
              <n-descriptions-item label="意向套餐">{{ getPackageName(currentLead.packageInterest) }}</n-descriptions-item>
              <n-descriptions-item label="下次跟进">
                <span :class="{ 'overdue': isOverdue(currentLead.nextFollowUp, currentLead.status) }">
                  {{ formatDate(currentLead.nextFollowUp) || '-' }}
                </span>
              </n-descriptions-item>
              <n-descriptions-item label="备注">{{ currentLead.remark || '-' }}</n-descriptions-item>
            </n-descriptions>
          </div>

          <div v-if="currentLead.status === 'converted' && (currentLead.customerId || currentLead.orderId)" class="detail-section">
            <div class="section-title">关联信息</div>
            <n-descriptions :column="1" bordered size="small">
              <n-descriptions-item label="关联客户">
                <n-tag v-if="currentLead.customerId" type="success" size="small">已关联</n-tag>
                <span v-else>-</span>
              </n-descriptions-item>
              <n-descriptions-item label="关联订单">
                <n-tag v-if="currentLead.orderId" type="success" size="small">已创建档期订单</n-tag>
                <span v-else>-</span>
              </n-descriptions-item>
            </n-descriptions>
          </div>

          <div class="detail-section">
            <div class="section-title">
              跟进记录
              <n-button text size="small" type="primary" style="float: right; padding: 0;" @click="openFollowUp(currentLead)" v-if="currentLead.status !== 'converted' && currentLead.status !== 'lost'">
                + 添加跟进
              </n-button>
            </div>
            <div class="timeline" v-if="currentLead.followUpRecords && currentLead.followUpRecords.length > 0">
              <div v-for="record in currentLead.followUpRecords" :key="record.id" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <n-tag size="small" type="info">{{ getFollowUpTypeLabel(record.type) }}</n-tag>
                    <span class="timeline-time">{{ formatDateTime(record.createdAt) }}</span>
                  </div>
                  <div class="timeline-text">{{ record.content }}</div>
                  <div v-if="record.nextFollowUp" class="timeline-next">
                    下次跟进：{{ formatDate(record.nextFollowUp) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-records">
              暂无跟进记录
            </div>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, computed, reactive, h } from 'vue'
import { useMessage, useDialog, NTag } from 'naive-ui'
import { 
  SearchOutline, 
  AddOutline 
} from '@vicons/ionicons5'
import { useLeadStore } from '@/stores/lead'
import { usePackageStore } from '@/stores/package'
import { useCustomerStore } from '@/stores/customer'
import { useOrderStore } from '@/stores/order'
import { 
  LEAD_STATUS, 
  LEAD_SOURCE, 
  FOLLOW_UP_TYPE, 
  formatDate, 
  formatDateTime,
  isOverdue as checkOverdue,
  normalizePhone
} from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const leadStore = useLeadStore()
const packageStore = usePackageStore()
const customerStore = useCustomerStore()
const orderStore = useOrderStore()

const searchKeyword = ref('')
const statusFilter = ref(null)
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)
const showFollowUpModal = ref(false)
const followUpFormRef = ref(null)
const currentLeadId = ref('')
const showDetail = ref(false)

const formData = reactive({
  name: '',
  phone: '',
  wechat: '',
  source: 'other',
  referralName: '',
  status: 'new',
  weddingDate: null,
  hotel: '',
  budget: null,
  packageInterest: null,
  nextFollowUp: null,
  remark: ''
})

const followUpForm = reactive({
  type: 'wechat',
  status: 'contacting',
  content: '',
  nextFollowUp: null
})

const rules = {
  name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  source: [{ required: true, message: '请选择线索来源', trigger: 'change' }],
  status: [{ required: true, message: '请选择线索状态', trigger: 'change' }]
}

const followUpRules = {
  type: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  status: [{ required: true, message: '请选择当前状态', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }]
}

const statusOptions = Object.entries(LEAD_STATUS).map(([key, val]) => ({
  label: val.label,
  value: key
}))

const statusSelectOptions = Object.entries(LEAD_STATUS).map(([key, val]) => ({
  label: val.label,
  value: key
}))

const sourceOptions = Object.entries(LEAD_SOURCE).map(([key, val]) => ({
  label: val,
  value: key
}))

const followUpTypeOptions = Object.entries(FOLLOW_UP_TYPE).map(([key, val]) => ({
  label: val,
  value: key
}))

const packageOptions = computed(() => {
  return packageStore.packages
    .filter(p => p.active)
    .map(p => ({ label: p.name, value: p.id }))
})

const pendingCount = computed(() => 
  leadStore.leads.filter(l => 
    l.status === 'contacting' || 
    l.status === 'quoted' || 
    l.status === 'negotiating'
  ).length
)

const lostCount = computed(() => 
  leadStore.leads.filter(l => l.status === 'lost').length
)

const filteredLeads = computed(() => {
  let result = leadStore.leads
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(l =>
      l.name.toLowerCase().includes(kw) ||
      l.phone.includes(kw) ||
      (l.wechat && l.wechat.toLowerCase().includes(kw)) ||
      (l.hotel && l.hotel.toLowerCase().includes(kw))
    )
  }
  if (statusFilter.value) {
    result = result.filter(l => l.status === statusFilter.value)
  }
  return result
})

const currentLead = computed(() => {
  return leadStore.getLeadById(currentLeadId.value)
})

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const columns = [
  { title: '客户姓名', key: 'name', width: 180 },
  { title: '联系电话', key: 'phone', width: 140 },
  {
    title: '来源',
    key: 'source',
    width: 140,
    render: (row) => {
      const children = [
        h(NTag, { type: getSourceTagType(row.source), size: 'small' }, () => getSourceLabel(row.source))
      ]
      if (row.source === 'referral' && row.referralName) {
        children.push(h('span', { style: 'margin-left: 6px; font-size: 12px; color: #999;' }, row.referralName))
      }
      return h('div', null, children)
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { type: getStatusType(row.status), size: 'small' }, () => getStatusLabel(row.status))
  },
  { title: '婚期', key: 'weddingDate', width: 120, render: (row) => formatDate(row.weddingDate) },
  { title: '预算', key: 'budget', width: 120, render: (row) => row.budget ? '¥' + row.budget.toLocaleString() : '-' },
  {
    title: '下次跟进',
    key: 'nextFollowUp',
    width: 120,
    render: (row) => {
      const date = formatDate(row.nextFollowUp) || '-'
      if (isOverdue(row.nextFollowUp, row.status)) {
        return h('span', { class: 'overdue' }, date)
      }
      return date
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm')
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right'
  }
]

function getStatusLabel(status) {
  return LEAD_STATUS[status]?.label || status
}

function getStatusType(status) {
  return LEAD_STATUS[status]?.color || 'default'
}

function getSourceLabel(source) {
  return LEAD_SOURCE[source] || source
}

function getSourceTagType(source) {
  const typeMap = {
    xiaohongshu: 'error',
    dianping: 'success',
    douyin: 'info',
    official: 'warning',
    referral: 'primary',
    offline: 'warning',
    other: 'default'
  }
  return typeMap[source] || 'default'
}

function getFollowUpTypeLabel(type) {
  return FOLLOW_UP_TYPE[type] || type
}

function getPackageName(packageId) {
  if (!packageId) return '-'
  const pkg = packageStore.getPackageById(packageId)
  return pkg ? pkg.name : '-'
}

function isOverdue(date, status) {
  if (!date || status === 'converted' || status === 'lost') return false
  return checkOverdue(date)
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
    name: row.name,
    phone: normalizePhone(row.phone),
    wechat: row.wechat || '',
    source: row.source,
    referralName: row.referralName || '',
    status: row.status,
    weddingDate: row.weddingDate ? dayjs(row.weddingDate).valueOf() : null,
    hotel: row.hotel || '',
    budget: row.budget || null,
    packageInterest: row.packageInterest || null,
    nextFollowUp: row.nextFollowUp ? dayjs(row.nextFollowUp).valueOf() : null,
    remark: row.remark || ''
  })
  showModal.value = true
}

function handlePhoneBlur() {
  if (formData.phone) {
    formData.phone = normalizePhone(formData.phone)
  }
}

function resetForm() {
  Object.assign(formData, {
    name: '',
    phone: '',
    wechat: '',
    source: 'other',
    referralName: '',
    status: 'new',
    weddingDate: null,
    hotel: '',
    budget: null,
    packageInterest: null,
    nextFollowUp: null,
    remark: ''
  })
  formRef.value?.restoreValidation()
}

function handleModalClose() {
  resetForm()
}

function doSubmit(data) {
  if (isEdit.value) {
    leadStore.updateLead(editId.value, data)
    message.success('更新成功')
  } else {
    leadStore.addLead(data)
    message.success('添加成功')
  }
  showModal.value = false
}

function showCustomerMergeDialog(existingCustomer, data) {
  dialog.warning({
    title: '手机号已存在',
    content: () => h('div', { style: 'line-height: 1.8;' }, [
      h('div', null, `该手机号已存在客户档案中：`),
      h('div', { style: 'margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;' }, [
        h('div', null, `客户姓名：${existingCustomer.name}`),
        h('div', { style: 'margin-top: 4px;' }, `联系电话：${existingCustomer.phone}`),
        existingCustomer.wechat ? h('div', { style: 'margin-top: 4px;' }, `微信号：${existingCustomer.wechat}`) : null,
        existingCustomer.weddingDate ? h('div', { style: 'margin-top: 4px;' }, `婚期：${existingCustomer.weddingDate}`) : null
      ]),
      h('div', { style: 'margin-top: 12px; color: #666;' }, '是否将新录入的线索信息合并到该客户档案中？')
    ]),
    positiveText: '合并到客户',
    negativeText: '取消',
    onPositiveClick: () => {
      customerStore.mergeCustomerWithLead(existingCustomer.id, data)
      message.success('已合并到客户档案')
      showModal.value = false
    }
  })
}

function showLeadMergeDialog(existingLead, data, isEditSelf = false) {
  dialog.warning({
    title: '手机号已存在',
    content: () => h('div', { style: 'line-height: 1.8;' }, [
      h('div', null, isEditSelf ? `该手机号已存在以下线索档案中：` : `该手机号已存在线索档案中：`),
      h('div', { style: 'margin-top: 8px; padding: 12px; background: #f5f5f5; border-radius: 6px;' }, [
        h('div', null, `客户姓名：${existingLead.name}`),
        h('div', { style: 'margin-top: 4px;' }, `联系电话：${existingLead.phone}`),
        existingLead.wechat ? h('div', { style: 'margin-top: 4px;' }, `微信号：${existingLead.wechat}`) : null,
        h('div', { style: 'margin-top: 4px;' }, `当前状态：${getStatusLabel(existingLead.status)}`),
        existingLead.weddingDate ? h('div', { style: 'margin-top: 4px;' }, `婚期：${existingLead.weddingDate}`) : null
      ]),
      h('div', { style: 'margin-top: 12px; color: #666;' }, 
        isEditSelf ? '您正在编辑的线索手机号与另一条线索重复，是否合并两条线索？' 
                   : '是否将新录入的线索信息合并到已有线索中？')
    ]),
    positiveText: '合并线索',
    negativeText: '取消',
    onPositiveClick: () => {
      leadStore.mergeLeads(existingLead.id, data)
      if (isEditSelf) {
        leadStore.deleteLead(editId.value)
      }
      message.success('线索已合并')
      showModal.value = false
    }
  })
}

function checkDuplicatePhone(data, excludeLeadId = null) {
  const normalizedPhone = normalizePhone(data.phone)
  if (!normalizedPhone) return null

  const existingCustomer = customerStore.findCustomerByPhone(normalizedPhone)
  if (existingCustomer) {
    return { type: 'customer', record: existingCustomer }
  }

  const existingLead = leadStore.findLeadByPhone(normalizedPhone, excludeLeadId)
  if (existingLead) {
    return { type: 'lead', record: existingLead }
  }

  return null
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const data = {
        ...formData,
        phone: normalizePhone(formData.phone),
        weddingDate: formData.weddingDate ? dayjs(formData.weddingDate).format('YYYY-MM-DD') : '',
        nextFollowUp: formData.nextFollowUp ? dayjs(formData.nextFollowUp).format('YYYY-MM-DD') : ''
      }

      const excludeLeadId = isEdit.value ? editId.value : null
      const duplicate = checkDuplicatePhone(data, excludeLeadId)

      if (duplicate) {
        if (duplicate.type === 'customer') {
          showCustomerMergeDialog(duplicate.record, data)
        } else if (duplicate.type === 'lead') {
          showLeadMergeDialog(duplicate.record, data, isEdit.value)
        }
        return
      }

      doSubmit(data)
    }
  })
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除线索「${row.name}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      leadStore.deleteLead(row.id)
      message.success('删除成功')
    }
  })
}

function openFollowUp(row) {
  currentLeadId.value = row.id
  Object.assign(followUpForm, {
    type: 'wechat',
    status: row.status,
    content: '',
    nextFollowUp: null
  })
  showDetail.value = false
  showFollowUpModal.value = true
}

function handleFollowUpModalClose() {
  followUpFormRef.value?.restoreValidation()
}

function handleFollowUpSubmit() {
  followUpFormRef.value?.validate((errors) => {
    if (!errors) {
      const record = {
        ...followUpForm,
        nextFollowUp: followUpForm.nextFollowUp ? dayjs(followUpForm.nextFollowUp).format('YYYY-MM-DD') : null
      }
      leadStore.addFollowUpRecord(currentLeadId.value, record)
      message.success('跟进记录已添加')
      showFollowUpModal.value = false
    }
  })
}

function openDetail(row) {
  currentLeadId.value = row.id
  showDetail.value = true
}

function handleConvert() {
  const lead = currentLead.value
  if (!lead) return

  const pkg = lead.packageInterest ? packageStore.getPackageById(lead.packageInterest) : null
  const hasPackage = !!pkg
  const hasWeddingDate = !!lead.weddingDate

  let content = `确定要将「${lead.name}」转化为正式客户吗？`
  if (hasPackage || hasWeddingDate) {
    content += '<br/><br/>转化时将自动创建：'
    if (hasPackage && hasWeddingDate) {
      content += `<br/>• 客户档案<br/>• 档期订单（${pkg.name}，${lead.weddingDate}）`
    } else if (hasWeddingDate) {
      content += `<br/>• 客户档案<br/>• 档期订单（${lead.weddingDate}）`
    } else {
      content += `<br/>• 客户档案<br/>• 档期订单（${pkg.name}）`
    }
  }

  dialog.warning({
    title: '确认转化',
    content: () => h('div', { innerHTML: content }),
    positiveText: '确认转化',
    negativeText: '取消',
    onPositiveClick: () => {
      const customer = customerStore.addCustomer({
        name: lead.name,
        phone: lead.phone,
        wechat: lead.wechat,
        weddingDate: lead.weddingDate,
        hotel: lead.hotel,
        source: lead.source || 'other',
        referralName: lead.referralName || '',
        followUpRecords: (lead.followUpRecords || []).map(r => ({ ...r })),
        remark: lead.remark
      })

      let orderId = null
      if (hasPackage || hasWeddingDate) {
        const packagePrice = pkg ? pkg.price : (lead.budget || 0)
        const depositAmount = Math.round(packagePrice * 0.3)
        const finalAmount = packagePrice - depositAmount
        
        const order = orderStore.addOrder({
          customerId: customer.id,
          packageId: lead.packageInterest || null,
          shootDate: lead.weddingDate || '',
          status: 'pending',
          depositAmount: depositAmount,
          finalAmount: finalAmount,
          paidAmount: 0,
          paymentStatus: 'unpaid',
          dueDate: lead.weddingDate ? dayjs(lead.weddingDate).subtract(7, 'day').format('YYYY-MM-DD') : '',
          remark: `由线索转化而来，原线索备注：${lead.remark || ''}`
        })
        orderId = order.id
      }

      leadStore.updateLead(lead.id, {
        status: 'converted',
        customerId: customer.id,
        orderId: orderId
      })

      let successMsg = '转化成功，已添加到客户档案'
      if (orderId) {
        successMsg += '，并已创建档期订单'
      }
      message.success(successMsg)
      showDetail.value = false
    }
  })
}
</script>

<style scoped>
.leads-page {
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

.stat-item {
  text-align: center;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #D4A574;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.overdue {
  color: #d03050;
  font-weight: 500;
}

.detail-content {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.timeline {
  padding-left: 8px;
}

.timeline-item {
  display: flex;
  padding-bottom: 20px;
  position: relative;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #D4A574;
  margin-top: 6px;
  margin-right: 12px;
  flex-shrink: 0;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 18px;
  bottom: 0;
  width: 2px;
  background: #e8e8e8;
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.timeline-time {
  font-size: 12px;
  color: #999;
}

.timeline-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.timeline-next {
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}

.empty-records {
  text-align: center;
  padding: 30px 0;
  color: #ccc;
  font-size: 13px;
}
</style>
