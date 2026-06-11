<template>
  <div class="customers-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">客户档案</h2>
        <p class="page-subtitle">
          共 {{ customerStore.customers.length }} 位客户
          <span v-if="sourceFilter" class="filter-info">
            （{{ getSourceLabel(sourceFilter) }}：{{ filteredCustomers.length }} 位）
          </span>
        </p>
      </div>
      <div class="header-actions">
        <n-select
          v-model:value="sourceFilter"
          placeholder="线索来源筛选"
          :options="sourceFilterOptions"
          clearable
          style="width: 160px; margin-right: 12px;"
        />
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
        <n-button type="primary" @click="openAddModal">
          <template #icon>
            <add-outline />
          </template>
          新增客户
        </n-button>
      </div>
    </div>

    <n-card>
      <n-data-table
        :columns="columns"
        :data="filteredCustomers"
        :pagination="pagination"
        :bordered="false"
        size="medium"
        striped
      >
        <template #actions="{ row }">
          <n-button text size="small" type="primary" style="margin-right: 8px;" @click="openDetailDrawer(row)">
            详情
          </n-button>
          <n-button text size="small" type="default" style="margin-right: 8px;" @click="openEditModal(row)">
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
      :title="isEdit ? '编辑客户' : '新增客户'"
      style="width: 560px;"
      @after-leave="handleModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="客户姓名" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入客户姓名" />
        </n-form-item>
        <n-form-item label="联系电话" path="phone">
          <n-input v-model:value="formData.phone" placeholder="请输入联系电话" />
        </n-form-item>
        <n-form-item label="微信号" path="wechat">
          <n-input v-model:value="formData.wechat" placeholder="请输入微信号" />
        </n-form-item>
        <n-form-item label="线索来源" path="source">
          <n-select
            v-model:value="formData.source"
            :options="sourceOptions"
            placeholder="请选择线索来源"
          />
        </n-form-item>
        <n-form-item v-if="formData.source === 'referral'" label="推荐人" path="referralName">
          <n-input v-model:value="formData.referralName" placeholder="请输入推荐人姓名" />
        </n-form-item>
        <n-form-item label="婚期" path="weddingDate">
          <n-date-picker
            v-model:value="formData.weddingDate"
            type="date"
            placeholder="请选择婚期"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="婚礼酒店" path="hotel">
          <n-input v-model:value="formData.hotel" placeholder="请输入婚礼酒店" />
        </n-form-item>
        <n-form-item label="备注" path="remark">
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

    <n-drawer
      v-model:show="showDetailDrawer"
      :width="520"
      placement="right"
    >
      <n-drawer-content title="客户详情" :native-scrollbar="false">
        <template #header-extra>
          <n-button text size="small" type="primary" @click="openAddFollowUp">
            <template #icon>
              <add-outline />
            </template>
            添加跟进
          </n-button>
        </template>

        <div v-if="currentCustomer" class="customer-detail">
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <n-descriptions :column="1" bordered size="small">
              <n-descriptions-item label="客户姓名">
                {{ currentCustomer.name }}
              </n-descriptions-item>
              <n-descriptions-item label="联系电话">
                {{ currentCustomer.phone }}
              </n-descriptions-item>
              <n-descriptions-item label="微信号">
                {{ currentCustomer.wechat || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="线索来源">
                <n-tag :type="getSourceTagType(currentCustomer.source)" size="small">
                  {{ getSourceLabel(currentCustomer.source) }}
                </n-tag>
                <span v-if="currentCustomer.source === 'referral' && currentCustomer.referralName" class="referral-name-inline">
                  推荐人：{{ currentCustomer.referralName }}
                </span>
              </n-descriptions-item>
              <n-descriptions-item label="婚期">
                {{ formatDate(currentCustomer.weddingDate) }}
              </n-descriptions-item>
              <n-descriptions-item label="婚礼酒店">
                {{ currentCustomer.hotel || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="备注">
                {{ currentCustomer.remark || '-' }}
              </n-descriptions-item>
              <n-descriptions-item label="创建时间">
                {{ formatDate(currentCustomer.createdAt, 'YYYY-MM-DD HH:mm') }}
              </n-descriptions-item>
            </n-descriptions>
          </div>

          <div class="detail-section">
            <h3 class="section-title">
              完整时间线
              <span class="record-count">({{ currentCustomer.followUpRecords?.length || 0 }} 条记录)</span>
            </h3>
            <div v-if="currentCustomer.followUpRecords && currentCustomer.followUpRecords.length > 0" class="timeline">
              <n-timeline>
                <n-timeline-item
                  v-for="record in sortedRecords(currentCustomer.followUpRecords)"
                  :key="record.id"
                  :type="getTimelineType(record)"
                >
                  <template #title>
                    <div class="timeline-title">
                      <span class="record-type">{{ getRecordTypeLabel(record) }}</span>
                      <n-tag :type="getCategoryTagType(record)" size="tiny" class="category-tag">
                        {{ getRecordCategoryLabel(record) }}
                      </n-tag>
                    </div>
                  </template>
                  <template #time>
                    {{ formatDate(record.createdAt, 'YYYY-MM-DD HH:mm') }}
                  </template>
                  <p class="record-content">{{ record.content }}</p>
                </n-timeline-item>
              </n-timeline>
            </div>
            <n-empty v-else description="暂无记录" />
          </div>
        </div>

        <template #footer>
          <div style="text-align: right;">
            <n-button @click="showDetailDrawer = false">关闭</n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal
      v-model:show="showFollowUpModal"
      preset="card"
      title="添加跟进记录"
      style="width: 480px;"
      @after-leave="handleFollowUpModalClose"
    >
      <n-form
        ref="followUpFormRef"
        :model="followUpFormData"
        :rules="followUpRules"
        label-placement="left"
        label-width="80px"
      >
        <n-form-item label="跟进方式" path="type">
          <n-select
            v-model:value="followUpFormData.type"
            :options="followUpTypeOptions"
            placeholder="请选择跟进方式"
          />
        </n-form-item>
        <n-form-item label="跟进内容" path="content">
          <n-input
            v-model:value="followUpFormData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showFollowUpModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddFollowUp">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, h } from 'vue'
import { useMessage, useDialog, NTag } from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'
import { useCustomerStore, sourceOptions, followUpTypeOptions } from '@/stores/customer'
import { formatDate, ORDER_STATUS } from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const customerStore = useCustomerStore()

const searchKeyword = ref('')
const sourceFilter = ref(null)
const showModal = ref(false)
const showDetailDrawer = ref(false)
const showFollowUpModal = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)
const followUpFormRef = ref(null)
const currentCustomer = ref(null)

const formData = reactive({
  name: '',
  phone: '',
  wechat: '',
  source: '',
  referralName: '',
  weddingDate: null,
  hotel: '',
  remark: ''
})

const followUpFormData = reactive({
  type: '',
  content: ''
})

const rules = {
  name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  source: [{ required: true, message: '请选择线索来源', trigger: 'change' }]
}

const followUpRules = {
  type: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }]
}

const sourceFilterOptions = [
  { value: 'referral', label: '朋友介绍' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'douyin', label: '抖音' },
  { value: 'dianping', label: '大众点评' },
  { value: 'official', label: '官网' },
  { value: 'offline', label: '线下活动' },
  { value: 'other', label: '其他' }
]

const filteredCustomers = computed(() => {
  let result = customerStore.customers

  if (sourceFilter.value) {
    result = result.filter(c => c.source === sourceFilter.value)
  }

  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(kw) ||
      c.phone.includes(kw) ||
      (c.wechat && c.wechat.toLowerCase().includes(kw)) ||
      (c.hotel && c.hotel.toLowerCase().includes(kw)) ||
      (c.referralName && c.referralName.toLowerCase().includes(kw))
    )
  }

  return result
})

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const columns = [
  { title: '客户姓名', key: 'name', width: 180 },
  { title: '联系电话', key: 'phone', width: 140 },
  {
    title: '线索来源',
    key: 'source',
    width: 200,
    render: (row) => {
      const children = [
        h(NTag, { type: getSourceTagType(row.source), size: 'small' }, () => getSourceLabel(row.source))
      ]
      if (row.source === 'referral' && row.referralName) {
        children.push(h('span', { class: 'referral-name' }, row.referralName))
      }
      return h('div', null, children)
    }
  },
  {
    title: '婚期',
    key: 'weddingDate',
    width: 120,
    render: (row) => formatDate(row.weddingDate)
  },
  { title: '婚礼酒店', key: 'hotel' },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: (row) => formatDate(row.createdAt, 'YYYY-MM-DD HH:mm')
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

function getSourceLabel(source) {
  const option = sourceOptions.find(o => o.value === source)
  return option ? option.label : '未知'
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

function getRecordTypeLabel(record) {
  if (record.category === 'progress' || record.type === 'status_change') {
    return '进度变更'
  }
  const option = followUpTypeOptions.find(o => o.value === record.type)
  return option ? option.label : '其他'
}

function getTimelineType(record) {
  if (record.category === 'progress' || record.type === 'status_change') {
    const statusTypeMap = {
      pending: 'warning',
      confirmed: 'info',
      shooting: 'primary',
      selecting: 'warning',
      editing: 'info',
      delivering: 'warning',
      completed: 'success'
    }
    return statusTypeMap[record.newStatus] || 'primary'
  }
  const typeMap = {
    phone: 'info',
    wechat: 'success',
    meeting: 'warning',
    other: 'default'
  }
  return typeMap[record.type] || 'default'
}

function getRecordCategoryLabel(record) {
  if (record.category === 'progress' || record.type === 'status_change') {
    return '进度日志'
  }
  return '跟进记录'
}

function getCategoryTagType(record) {
  if (record.category === 'progress' || record.type === 'status_change') {
    return 'primary'
  }
  return 'default'
}

function sortedRecords(records) {
  return [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    phone: row.phone,
    wechat: row.wechat || '',
    source: row.source || '',
    referralName: row.referralName || '',
    weddingDate: row.weddingDate ? dayjs(row.weddingDate).valueOf() : null,
    hotel: row.hotel || '',
    remark: row.remark || ''
  })
  showModal.value = true
}

function openDetailDrawer(row) {
  currentCustomer.value = customerStore.getCustomerById(row.id)
  showDetailDrawer.value = true
}

function openAddFollowUp() {
  followUpFormData.type = ''
  followUpFormData.content = ''
  showFollowUpModal.value = true
}

function resetForm() {
  Object.assign(formData, {
    name: '',
    phone: '',
    wechat: '',
    source: '',
    referralName: '',
    weddingDate: null,
    hotel: '',
    remark: ''
  })
  formRef.value?.restoreValidation()
}

function handleModalClose() {
  resetForm()
}

function handleFollowUpModalClose() {
  followUpFormRef.value?.restoreValidation()
}

function handleSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const data = {
        ...formData,
        weddingDate: formData.weddingDate ? dayjs(formData.weddingDate).format('YYYY-MM-DD') : ''
      }
      
      if (isEdit.value) {
        customerStore.updateCustomer(editId.value, data)
        message.success('更新成功')
      } else {
        customerStore.addCustomer(data)
        message.success('添加成功')
      }
      showModal.value = false
      
      if (currentCustomer.value && currentCustomer.value.id === editId.value) {
        currentCustomer.value = customerStore.getCustomerById(editId.value)
      }
    }
  })
}

function handleAddFollowUp() {
  followUpFormRef.value?.validate((errors) => {
    if (!errors) {
      if (currentCustomer.value) {
        customerStore.addFollowUpRecord(currentCustomer.value.id, {
          type: followUpFormData.type,
          content: followUpFormData.content
        })
        currentCustomer.value = customerStore.getCustomerById(currentCustomer.value.id)
        message.success('添加成功')
        showFollowUpModal.value = false
      }
    }
  })
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除客户「${row.name}」吗？此操作不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      customerStore.deleteCustomer(row.id)
      message.success('删除成功')
    }
  })
}
</script>

<style scoped>
.customers-page {
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

.filter-info {
  color: #18a058;
}

.header-actions {
  display: flex;
  align-items: center;
}

.referral-name {
  margin-left: 6px;
  font-size: 12px;
  color: #999;
}

.referral-name-inline {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}

.customer-detail {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  padding-left: 8px;
  border-left: 3px solid #18a058;
}

.record-count {
  font-size: 12px;
  font-weight: normal;
  color: #999;
  margin-left: 4px;
}

.timeline {
  padding: 8px 0;
}

.record-content {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-type {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.category-tag {
  flex-shrink: 0;
}
</style>
