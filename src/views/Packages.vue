<template>
  <div class="packages-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">套餐报价</h2>
        <p class="page-subtitle">共 {{ packageStore.packages.length }} 个套餐</p>
      </div>
      <n-button type="primary" @click="openAddModal">
        <template #icon>
          <add-outline />
        </template>
        新增套餐
      </n-button>
    </div>

    <div class="package-grid">
      <n-card v-for="pkg in packageStore.packages" :key="pkg.id" class="package-card">
        <template #header>
          <div class="card-header">
            <span class="package-name">{{ pkg.name }}</span>
            <n-tag :type="pkg.active ? 'success' : 'default'" size="small">
              {{ pkg.active ? '启用中' : '已停用' }}
            </n-tag>
          </div>
        </template>
        <div class="package-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ pkg.price.toLocaleString() }}</span>
        </div>
        <div class="package-meta">
          <div class="meta-item">
            <n-icon size="16" style="margin-right: 4px;"><time-outline /></n-icon>
            <span>{{ pkg.duration }}</span>
          </div>
          <div class="meta-item">
            <n-icon size="16" style="margin-right: 4px;"><image-outline /></n-icon>
            <span>{{ pkg.refinedCount }}张精修</span>
          </div>
        </div>
        <div class="package-content">
          <div class="content-title">套餐包含</div>
          <div class="content-text">
            <p v-for="(line, idx) in pkg.content.split('\n')" :key="idx">{{ line }}</p>
          </div>
        </div>
        <div v-if="pkg.remark" class="package-remark">
          <span class="remark-label">备注：</span>{{ pkg.remark }}
        </div>
        <template #footer>
          <div class="card-footer">
            <n-button text size="small" @click="toggleActive(pkg)">
              {{ pkg.active ? '停用' : '启用' }}
            </n-button>
            <div>
              <n-button text size="small" type="primary" style="margin-right: 8px;" @click="openEditModal(pkg)">
                编辑
              </n-button>
              <n-button text size="small" type="error" @click="handleDelete(pkg)">
                删除
              </n-button>
            </div>
          </div>
        </template>
      </n-card>
    </div>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑套餐' : '新增套餐'"
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
        <n-form-item label="套餐名称" path="name">
          <n-input v-model:value="formData.name" placeholder="请输入套餐名称" />
        </n-form-item>
        <n-form-item label="套餐价格" path="price">
          <n-input-number
            v-model:value="formData.price"
            :min="0"
            placeholder="请输入价格"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="拍摄时长" path="duration">
          <n-input v-model:value="formData.duration" placeholder="如：8小时" />
        </n-form-item>
        <n-form-item label="精修张数" path="refinedCount">
          <n-input-number
            v-model:value="formData.refinedCount"
            :min="0"
            placeholder="请输入精修张数"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="套餐内容" path="content">
          <n-input
            v-model:value="formData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入套餐包含内容，每行一项"
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
import { ref, reactive } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { AddOutline, TimeOutline, ImageOutline } from '@vicons/ionicons5'
import { usePackageStore } from '@/stores/package'

const message = useMessage()
const dialog = useDialog()
const packageStore = usePackageStore()

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref('')
const formRef = ref(null)

const formData = reactive({
  name: '',
  price: null,
  duration: '',
  refinedCount: null,
  content: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入套餐价格', trigger: 'blur' }]
}

function openAddModal() {
  isEdit.value = false
  editId.value = ''
  resetForm()
  showModal.value = true
}

function openEditModal(pkg) {
  isEdit.value = true
  editId.value = pkg.id
  Object.assign(formData, {
    name: pkg.name,
    price: pkg.price,
    duration: pkg.duration || '',
    refinedCount: pkg.refinedCount || 0,
    content: pkg.content || '',
    remark: pkg.remark || ''
  })
  showModal.value = true
}

function resetForm() {
  Object.assign(formData, {
    name: '',
    price: null,
    duration: '',
    refinedCount: null,
    content: '',
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
      if (isEdit.value) {
        packageStore.updatePackage(editId.value, formData)
        message.success('更新成功')
      } else {
        packageStore.addPackage({ ...formData, active: true })
        message.success('添加成功')
      }
      showModal.value = false
    }
  })
}

function toggleActive(pkg) {
  packageStore.updatePackage(pkg.id, { active: !pkg.active })
  message.success(pkg.active ? '已停用' : '已启用')
}

function handleDelete(pkg) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除套餐「${pkg.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      packageStore.deletePackage(pkg.id)
      message.success('删除成功')
    }
  })
}
</script>

<style scoped>
.packages-page {
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

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.package-card {
  transition: box-shadow 0.3s;
}

.package-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.package-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.package-price {
  margin-bottom: 16px;
}

.price-symbol {
  font-size: 18px;
  color: #D4A574;
  vertical-align: top;
}

.price-value {
  font-size: 36px;
  font-weight: 700;
  color: #D4A574;
  line-height: 1;
}

.package-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.package-content {
  margin-bottom: 12px;
}

.content-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.content-text {
  font-size: 13px;
  color: #555;
  line-height: 1.8;
}

.content-text p {
  margin: 0;
}

.package-remark {
  font-size: 12px;
  color: #999;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
}

.remark-label {
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
