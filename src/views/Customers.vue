<template>
  <div class="customers-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">客户档案</h2>
        <p class="page-subtitle">共 {{ customerStore.customers.length }} 位客户</p>
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
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑客户' : '新增客户'"
      style="width: 520px;"
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
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'
import { useCustomerStore } from '@/stores/customer'
import { formatDate } from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const customerStore = useCustomerStore()

const searchKeyword = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)

const formData = reactive({
  name: '',
  phone: '',
  wechat: '',
  weddingDate: null,
  hotel: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const filteredCustomers = computed(() => {
  if (!searchKeyword.value) return customerStore.customers
  const kw = searchKeyword.value.toLowerCase()
  return customerStore.customers.filter(c =>
    c.name.toLowerCase().includes(kw) ||
    c.phone.includes(kw) ||
    (c.wechat && c.wechat.toLowerCase().includes(kw)) ||
    (c.hotel && c.hotel.toLowerCase().includes(kw))
  )
})

const pagination = {
  pageSize: 10,
  showSizePicker: false
}

const columns = [
  { title: '客户姓名', key: 'name', width: 180 },
  { title: '联系电话', key: 'phone', width: 140 },
  { title: '微信号', key: 'wechat', width: 160 },
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
    width: 140
  }
]

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
    weddingDate: row.weddingDate ? dayjs(row.weddingDate).valueOf() : null,
    hotel: row.hotel || '',
    remark: row.remark || ''
  })
  showModal.value = true
}

function resetForm() {
  Object.assign(formData, {
    name: '',
    phone: '',
    wechat: '',
    weddingDate: null,
    hotel: '',
    remark: ''
  })
  formRef.value?.restoreValidation()
}

function handleModalClose() {
  resetForm()
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

.header-actions {
  display: flex;
  align-items: center;
}
</style>
