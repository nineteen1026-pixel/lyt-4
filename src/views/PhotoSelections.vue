<template>
  <div class="photo-selections-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">客户选片记录</h2>
        <p class="page-subtitle">
          选片记录：<span class="highlight">{{ photoSelectionStore.totalSelections }}</span> 条
          ，待制作：<span class="highlight-warning">{{ photoSelectionStore.pendingProductionCount }}</span> 单
        </p>
      </div>
      <n-button type="primary" @click="openAddModal">
        <template #icon>
          <add-outline />
        </template>
        新建选片记录
      </n-button>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card">
        <div class="stat-title">总精修张数</div>
        <div class="stat-value primary">{{ photoSelectionStore.totalRefinedPhotos }} 张</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">加片总金额</div>
        <div class="stat-value warning">¥{{ photoSelectionStore.totalExtraAmount.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">加片已收款</div>
        <div class="stat-value success">¥{{ photoSelectionStore.totalExtraPaid.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">加片待收款</div>
        <div class="stat-value danger">¥{{ (photoSelectionStore.totalExtraAmount - photoSelectionStore.totalExtraPaid).toLocaleString() }}</div>
      </n-card>
    </div>

    <n-card style="margin-top: 20px;">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span style="font-weight: 600;">选片记录列表</span>
            <n-input
              v-model:value="searchKeyword"
              placeholder="搜索客户名称/套餐"
              clearable
              size="small"
              style="width: 200px;"
            >
              <template #prefix>
                <n-icon><search-outline /></n-icon>
              </template>
            </n-input>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <n-radio-group v-model:value="filterSelectionStatus" size="small">
              <n-radio-button value="all">选片状态</n-radio-button>
              <n-radio-button value="pending">待选片</n-radio-button>
              <n-radio-button value="selecting">选片中</n-radio-button>
              <n-radio-button value="selected">已选片</n-radio-button>
              <n-radio-button value="confirmed">已确认</n-radio-button>
            </n-radio-group>
            <n-radio-group v-model:value="filterProductionStatus" size="small">
              <n-radio-button value="all">制作进度</n-radio-button>
              <n-radio-button value="waiting">待制作</n-radio-button>
              <n-radio-button value="retouching">精修中</n-radio-button>
              <n-radio-button value="designing">设计中</n-radio-button>
              <n-radio-button value="producing">制作中</n-radio-button>
              <n-radio-button value="completed">已完成</n-radio-button>
            </n-radio-group>
          </div>
        </div>
      </template>
      <n-data-table
        :columns="columns"
        :data="filteredSelections"
        :pagination="pagination"
        :bordered="false"
        size="medium"
      >
        <template #customer="{ row }">
          <div class="cell-primary">{{ getCustomerName(row.customerId) }}</div>
        </template>
        <template #package="{ row }">
          <div>{{ getOrderPackageName(row.orderId) }}</div>
        </template>
        <template #refinedInfo="{ row }">
          <div>
            <div class="refined-total">{{ row.totalRefinedCount }} 张</div>
            <div class="refined-detail" v-if="row.refinedExtraCount > 0">
              套餐 {{ row.baseRefinedCount }} + 加片 <span class="text-warning">{{ row.refinedExtraCount }}</span>
            </div>
            <div class="refined-detail" v-else>
              套餐 {{ row.baseRefinedCount }}
            </div>
          </div>
        </template>
        <template #extraPayment="{ row }">
          <div v-if="row.extraPhotoAmount > 0">
            <div class="payment-progress">
              <div class="progress-text">
                <span>¥{{ (row.extraPaidAmount || 0).toLocaleString() }}</span>
                <span class="progress-sep">/</span>
                <span>¥{{ row.extraPhotoAmount.toLocaleString() }}</span>
              </div>
              <n-progress
                :percentage="Math.min(100, Math.round(((row.extraPaidAmount || 0) / row.extraPhotoAmount) * 100))"
                :type="getPaymentProgressType(row.extraPaymentStatus)"
                :show-indicator="false"
                height="6"
                style="margin-top: 4px;"
              />
            </div>
            <n-tag :type="getPaymentType(row.extraPaymentStatus)" size="tiny" style="margin-top: 4px;">
              {{ getPaymentLabel(row.extraPaymentStatus) }}
            </n-tag>
          </div>
          <div v-else class="no-extra">
            <n-tag size="tiny" type="default">无加片</n-tag>
          </div>
        </template>
        <template #selectionStatus="{ row }">
          <n-tag :type="getSelectionStatusType(row.selectionStatus)" size="small">
            {{ getSelectionStatusLabel(row.selectionStatus) }}
          </n-tag>
        </template>
        <template #productionStatus="{ row }">
          <n-tag :type="getProductionStatusType(row.productionStatus)" size="small">
            {{ getProductionStatusLabel(row.productionStatus) }}
          </n-tag>
        </template>
        <template #productionSteps="{ row }">
          <n-steps :current="getProductionStepIndex(row.productionStatus)" size="small" vertical>
            <n-step
              v-for="step in PRODUCTION_STEPS"
              :key="step.key"
              :title="step.label"
              :description="step.description"
            />
          </n-steps>
        </template>
        <template #actions="{ row }">
          <n-space>
            <n-button
              text
              size="small"
              type="primary"
              @click="openEditModal(row)"
            >
              编辑
            </n-button>
            <n-button
              text
              size="small"
              @click="openPaymentModal(row)"
              v-if="row.extraPhotoAmount > 0 && row.extraPaymentStatus !== 'paid'"
            >
              登记加片款
            </n-button>
            <n-button
              text
              size="small"
              @click="openPaymentRecordsModal(row)"
              v-if="row.extraPhotoAmount > 0"
            >
              加片款记录
            </n-button>
            <n-popconfirm
              @positive-click="handleDelete(row.id)"
              positive-text="确认删除"
              negative-text="取消"
            >
              <template #trigger>
                <n-button text size="small" type="error">
                  删除
                </n-button>
              </template>
              确定要删除这条选片记录吗？
            </n-popconfirm>
          </n-space>
        </template>
      </n-data-table>
    </n-card>

    <n-modal
      v-model:show="showFormModal"
      preset="card"
      :title="isEdit ? '编辑选片记录' : '新建选片记录'"
      style="width: 640px;"
      @after-leave="handleFormModalClose"
    >
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="关联订单" path="orderId">
          <n-select
            v-model:value="formData.orderId"
            placeholder="请选择订单"
            :options="orderOptions"
            :disabled="isEdit"
            @update:value="handleOrderChange"
          />
        </n-form-item>
        <n-form-item v-if="currentOrder" label="订单信息">
          <div class="order-info">
            <n-space justify="space-between" style="width: 100%;">
              <div class="info-item">
                <div class="info-label">客户</div>
                <div class="info-value">{{ getCustomerName(currentOrder.customerId) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">套餐</div>
                <div class="info-value">{{ getOrderPackageName(currentOrder.id) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">套餐精修</div>
                <div class="info-value primary">{{ currentPackageRefined }} 张</div>
              </div>
              <div class="info-item">
                <div class="info-label">拍摄日期</div>
                <div class="info-value">{{ formatDate(currentOrder.shootDate) }}</div>
              </div>
            </n-space>
          </div>
        </n-form-item>
        <n-form-item label="选片日期" path="selectionDate">
          <n-date-picker
            v-model:value="formData.selectionDate"
            type="date"
            placeholder="请选择选片日期"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="加片张数" path="refinedExtraCount">
          <n-input-number
            v-model:value="formData.refinedExtraCount"
            :min="0"
            placeholder="请输入加片张数"
            style="width: 100%;"
            @update:value="calculateExtraAmount"
          />
          <div class="form-tip">合计精修：<strong>{{ totalRefinedPreview }}</strong> 张（套餐 {{ currentPackageRefined }} + 加片 {{ formData.refinedExtraCount || 0 }}）</div>
        </n-form-item>
        <n-form-item label="加片单价 (元/张)" path="extraUnitPrice" v-if="!isEdit">
          <n-input-number
            v-model:value="formData.extraUnitPrice"
            :min="0"
            :default-value="100"
            placeholder="请输入加片单价"
            style="width: 100%;"
            @update:value="calculateExtraAmount"
          />
        </n-form-item>
        <n-form-item label="加片金额">
          <n-input-number
            v-model:value="formData.extraPhotoAmount"
            :min="0"
            placeholder="请输入加片金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
          <div class="form-tip" v-if="formData.refinedExtraCount > 0 && formData.extraUnitPrice">
            自动计算：{{ formData.refinedExtraCount }} 张 × ¥{{ formData.extraUnitPrice }} = ¥{{ (formData.refinedExtraCount * formData.extraUnitPrice).toLocaleString() }}
          </div>
        </n-form-item>
        <n-form-item v-if="!isEdit && formData.extraPhotoAmount > 0" label="首付加片款">
          <n-input-number
            v-model:value="formData.extraPaidAmount"
            :min="0"
            :max="formData.extraPhotoAmount"
            placeholder="请输入首付金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
          <div class="quick-amount" v-if="formData.extraPhotoAmount > 0">
            <n-space>
              <n-button size="tiny" type="default" @click="formData.extraPaidAmount = 0">暂不付</n-button>
              <n-button size="tiny" type="default" @click="formData.extraPaidAmount = Math.round(formData.extraPhotoAmount * 0.5)">付50%</n-button>
              <n-button size="tiny" type="default" @click="formData.extraPaidAmount = formData.extraPhotoAmount">全额付</n-button>
            </n-space>
          </div>
        </n-form-item>
        <n-form-item v-if="!isEdit && formData.extraPaidAmount > 0" label="收款方式">
          <n-select
            v-model:value="formData.firstPaymentMethod"
            :options="paymentMethodOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="选片状态" path="selectionStatus">
          <n-select
            v-model:value="formData.selectionStatus"
            :options="selectionStatusOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="制作进度" path="productionStatus">
          <n-select
            v-model:value="formData.productionStatus"
            :options="productionStatusOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="备注">
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
          <n-button style="margin-right: 12px;" @click="showFormModal = false">取消</n-button>
          <n-button type="primary" @click="handleFormSubmit">确认</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showPaymentModal"
      preset="card"
      title="登记加片款"
      style="width: 480px;"
      @after-leave="handlePaymentModalClose"
    >
      <div v-if="currentSelection" class="payment-summary">
        <n-space justify="space-between">
          <div class="summary-item">
            <div class="summary-label">加片总额</div>
            <div class="summary-value warning">¥{{ currentSelection.extraPhotoAmount.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">已收款</div>
            <div class="summary-value success">¥{{ (currentSelection.extraPaidAmount || 0).toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">待收款</div>
            <div class="summary-value danger">¥{{ remainingExtraAmount.toLocaleString() }}</div>
          </div>
        </n-space>
      </div>
      <n-form
        ref="paymentFormRef"
        :model="paymentFormData"
        :rules="paymentRules"
        label-placement="left"
        label-width="100px"
        style="margin-top: 16px;"
      >
        <n-form-item label="收款金额" path="amount">
          <n-input-number
            v-model:value="paymentFormData.amount"
            :min="0"
            :max="remainingExtraAmount"
            placeholder="请输入收款金额"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
          <div class="quick-amount" v-if="remainingExtraAmount > 0">
            <n-space>
              <n-button size="tiny" type="default" @click="paymentFormData.amount = Math.round(remainingExtraAmount * 0.5)">付50%</n-button>
              <n-button size="tiny" type="default" @click="paymentFormData.amount = remainingExtraAmount">全部结清</n-button>
            </n-space>
          </div>
        </n-form-item>
        <n-form-item label="收款方式" path="paymentMethod">
          <n-select
            v-model:value="paymentFormData.paymentMethod"
            :options="paymentMethodOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="收款日期" path="payDate">
          <n-date-picker
            v-model:value="paymentFormData.payDate"
            type="date"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="paymentFormData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showPaymentModal = false">取消</n-button>
          <n-button type="primary" @click="handlePaymentSubmit">确认</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showPaymentRecordsModal"
      preset="card"
      :title="`${currentRecordCustomerName} - 加片款记录`"
      style="width: 600px;"
    >
      <div v-if="currentRecordSelection" class="record-summary">
        <n-space justify="space-between">
          <div class="summary-item">
            <div class="summary-label">加片总额</div>
            <div class="summary-value warning">¥{{ currentRecordSelection.extraPhotoAmount.toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">已收款</div>
            <div class="summary-value success">¥{{ (currentRecordSelection.extraPaidAmount || 0).toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">待收款</div>
            <div class="summary-value danger">¥{{ (currentRecordSelection.extraPhotoAmount - (currentRecordSelection.extraPaidAmount || 0)).toLocaleString() }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">收款次数</div>
            <div class="summary-value info">{{ currentExtraPaymentRecords.length }} 次</div>
          </div>
        </n-space>
      </div>

      <div class="record-list">
        <div v-if="currentExtraPaymentRecords.length === 0" class="empty-record">
          <n-empty description="暂无加片款记录" />
        </div>
        <n-timeline v-else>
          <n-timeline-item
            v-for="(record, index) in currentExtraPaymentRecords"
            :key="record.id"
            :type="getTimelineType(index, currentExtraPaymentRecords.length)"
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
                    @click="openEditPaymentRecordModal(record)"
                  >
                    编辑
                  </n-button>
                  <n-popconfirm
                    @positive-click="handleDeletePaymentRecord(record.id)"
                    positive-text="确认删除"
                    negative-text="取消"
                  >
                    <template #trigger>
                      <n-button text size="tiny" type="error">
                        删除
                      </n-button>
                    </template>
                    确定要删除这条加片款记录吗？
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
            v-if="currentRecordSelection && currentRecordSelection.extraPaymentStatus !== 'paid'"
            type="primary"
            style="margin-right: 12px;"
            @click="openPaymentFromRecord"
          >
            继续收款
          </n-button>
          <n-button @click="showPaymentRecordsModal = false">关闭</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showEditPaymentModal"
      preset="card"
      title="编辑加片款记录"
      style="width: 480px;"
      @after-leave="handleEditPaymentModalClose"
    >
      <n-form
        ref="editPaymentFormRef"
        :model="editPaymentFormData"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="收款金额">
          <n-input-number
            v-model:value="editPaymentFormData.amount"
            :min="0"
            style="width: 100%;"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
        <n-form-item label="收款方式">
          <n-select
            v-model:value="editPaymentFormData.paymentMethod"
            :options="paymentMethodOptions"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="收款日期">
          <n-date-picker
            v-model:value="editPaymentFormData.payDate"
            type="date"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="备注">
          <n-input
            v-model:value="editPaymentFormData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showEditPaymentModal = false">取消</n-button>
          <n-button type="primary" @click="handleEditPaymentSubmit">确认</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { AddOutline, SearchOutline } from '@vicons/ionicons5'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { usePackageStore } from '@/stores/package'
import { usePhotoSelectionStore } from '@/stores/photoSelection'
import {
  PHOTO_SELECTION_STATUS,
  PHOTO_SELECTION_STEPS,
  PRODUCTION_STATUS,
  PRODUCTION_STEPS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  formatDate
} from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const packageStore = usePackageStore()
const photoSelectionStore = usePhotoSelectionStore()

const searchKeyword = ref('')
const filterSelectionStatus = ref('all')
const filterProductionStatus = ref('all')

const showFormModal = ref(false)
const showPaymentModal = ref(false)
const showPaymentRecordsModal = ref(false)
const showEditPaymentModal = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const currentOrder = ref(null)
const currentSelection = ref(null)
const currentRecordSelection = ref(null)
const editingPaymentRecordId = ref('')

const formRef = ref(null)
const paymentFormRef = ref(null)
const editPaymentFormRef = ref(null)

const formData = reactive({
  orderId: '',
  selectionDate: dayjs().valueOf(),
  refinedExtraCount: 0,
  extraUnitPrice: 100,
  extraPhotoAmount: 0,
  extraPaidAmount: 0,
  firstPaymentMethod: 'wechat',
  selectionStatus: 'selecting',
  productionStatus: 'waiting',
  remark: ''
})

const paymentFormData = reactive({
  amount: null,
  paymentMethod: 'wechat',
  payDate: dayjs().valueOf(),
  remark: ''
})

const editPaymentFormData = reactive({
  amount: 0,
  paymentMethod: 'wechat',
  payDate: null,
  remark: ''
})

const rules = {
  orderId: [{ required: true, message: '请选择订单', trigger: 'change' }],
  selectionDate: [{ required: true, message: '请选择选片日期', trigger: 'change' }],
  selectionStatus: [{ required: true, message: '请选择选片状态', trigger: 'change' }],
  productionStatus: [{ required: true, message: '请选择制作进度', trigger: 'change' }]
}

const paymentRules = {
  amount: [{ required: true, message: '请输入收款金额', trigger: 'blur' }],
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

const selectionStatusOptions = Object.entries(PHOTO_SELECTION_STATUS).map(([key, value]) => ({
  label: value.label,
  value: key
}))

const productionStatusOptions = Object.entries(PRODUCTION_STATUS).map(([key, value]) => ({
  label: value.label,
  value: key
}))

const currentPackageRefined = computed(() => {
  if (!currentOrder.value) return 0
  const pkg = packageStore.getPackageById(currentOrder.value.packageId)
  return pkg?.refinedCount || 50
})

const totalRefinedPreview = computed(() => {
  return currentPackageRefined.value + (formData.refinedExtraCount || 0)
})

const remainingExtraAmount = computed(() => {
  if (!currentSelection.value) return 0
  return Math.max(0, currentSelection.value.extraPhotoAmount - (currentSelection.value.extraPaidAmount || 0))
})

const currentExtraPaymentRecords = computed(() => {
  if (!currentRecordSelection.value) return []
  return [...(currentRecordSelection.value.extraPaymentRecords || [])].sort(
    (a, b) => new Date(b.payDate) - new Date(a.payDate)
  )
})

const currentRecordCustomerName = computed(() => {
  if (!currentRecordSelection.value) return ''
  return getCustomerName(currentRecordSelection.value.customerId)
})

const orderOptions = computed(() =>
  orderStore.orders.map(o => ({
    label: `${getCustomerName(o.customerId)} - ${getOrderPackageName(o.id)} (${formatDate(o.shootDate)})`,
    value: o.id
  }))
)

const filteredSelections = computed(() => {
  let list = [...photoSelectionStore.selections]
  if (filterSelectionStatus.value !== 'all') {
    list = list.filter(s => s.selectionStatus === filterSelectionStatus.value)
  }
  if (filterProductionStatus.value !== 'all') {
    list = list.filter(s => s.productionStatus === filterProductionStatus.value)
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(s => {
      const customerName = getCustomerName(s.customerId).toLowerCase()
      const pkgName = getOrderPackageName(s.orderId).toLowerCase()
      return customerName.includes(kw) || pkgName.includes(kw)
    })
  }
  return list.sort((a, b) => new Date(b.selectionDate) - new Date(a.selectionDate))
})

const columns = [
  { title: '客户', key: 'customer', width: 180 },
  { title: '套餐', key: 'package', width: 140 },
  { title: '精修信息', key: 'refinedInfo', width: 160 },
  { title: '加片款', key: 'extraPayment', width: 180 },
  { title: '选片状态', key: 'selectionStatus', width: 100 },
  { title: '制作进度', key: 'productionStatus', width: 100 },
  { title: '选片日期', key: 'selectionDate', width: 120, render: (row) => formatDate(row.selectionDate) },
  { title: '操作', key: 'actions', width: 300, fixed: 'right' }
]

function getCustomerName(id) {
  const customer = customerStore.getCustomerById(id)
  return customer ? customer.name : '未知客户'
}

function getOrderPackageName(orderId) {
  const order = orderStore.getOrderById(orderId)
  if (!order) return '-'
  return order.packageName || orderStore.getOrderPackageName(order)
}

function getSelectionStatusLabel(status) {
  return PHOTO_SELECTION_STATUS[status]?.label || status
}

function getSelectionStatusType(status) {
  return PHOTO_SELECTION_STATUS[status]?.color || 'default'
}

function getProductionStatusLabel(status) {
  return PRODUCTION_STATUS[status]?.label || status
}

function getProductionStatusType(status) {
  return PRODUCTION_STATUS[status]?.color || 'default'
}

function getProductionStepIndex(status) {
  const idx = PRODUCTION_STEPS.findIndex(s => s.key === status)
  return idx >= 0 ? idx + 1 : 0
}

function getPaymentLabel(status) {
  return PAYMENT_STATUS[status]?.label || status
}

function getPaymentType(status) {
  return PAYMENT_STATUS[status]?.color || 'default'
}

function getPaymentProgressType(status) {
  if (status === 'paid') return 'success'
  if (status === 'partial') return 'warning'
  return 'error'
}

function getPaymentMethodLabel(method) {
  return PAYMENT_METHOD[method]?.label || method
}

function getPaymentMethodType(method) {
  return PAYMENT_METHOD[method]?.color || 'default'
}

function getTimelineType(index, total) {
  if (index === 0) return 'success'
  if (index === total - 1) return 'primary'
  return 'default'
}

function calculateExtraAmount() {
  if (formData.refinedExtraCount > 0 && formData.extraUnitPrice) {
    formData.extraPhotoAmount = formData.refinedExtraCount * formData.extraUnitPrice
  }
}

function openAddModal() {
  isEdit.value = false
  editingId.value = ''
  currentOrder.value = null
  Object.assign(formData, {
    orderId: '',
    selectionDate: dayjs().valueOf(),
    refinedExtraCount: 0,
    extraUnitPrice: 100,
    extraPhotoAmount: 0,
    extraPaidAmount: 0,
    firstPaymentMethod: 'wechat',
    selectionStatus: 'selecting',
    productionStatus: 'waiting',
    remark: ''
  })
  showFormModal.value = true
}

function openEditModal(row) {
  isEdit.value = true
  editingId.value = row.id
  currentOrder.value = orderStore.getOrderById(row.orderId)
  Object.assign(formData, {
    orderId: row.orderId,
    selectionDate: dayjs(row.selectionDate).valueOf(),
    refinedExtraCount: row.refinedExtraCount,
    extraUnitPrice: row.refinedExtraCount > 0 ? Math.round(row.extraPhotoAmount / row.refinedExtraCount) : 100,
    extraPhotoAmount: row.extraPhotoAmount,
    extraPaidAmount: row.extraPaidAmount,
    firstPaymentMethod: 'wechat',
    selectionStatus: row.selectionStatus,
    productionStatus: row.productionStatus,
    remark: row.remark || ''
  })
  showFormModal.value = true
}

function handleOrderChange(id) {
  currentOrder.value = orderStore.getOrderById(id)
}

function handleFormModalClose() {
  formRef.value?.restoreValidation()
}

function handleFormSubmit() {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const data = {
        orderId: formData.orderId,
        selectionDate: dayjs(formData.selectionDate).format('YYYY-MM-DD'),
        refinedExtraCount: Number(formData.refinedExtraCount) || 0,
        extraPhotoAmount: Number(formData.extraPhotoAmount) || 0,
        extraPaidAmount: isEdit.value ? Number(formData.extraPaidAmount) || 0 : Number(formData.extraPaidAmount) || 0,
        selectionStatus: formData.selectionStatus,
        productionStatus: formData.productionStatus,
        remark: formData.remark,
        firstPaymentMethod: formData.firstPaymentMethod
      }

      let result
      if (isEdit.value) {
        result = photoSelectionStore.updateSelection(editingId.value, data)
        if (result.success) {
          message.success('更新成功')
          showFormModal.value = false
        } else {
          message.error(result.message || '更新失败')
        }
      } else {
        const existing = photoSelectionStore.getSelectionByOrderId(formData.orderId)
        if (existing) {
          message.warning('该订单已存在选片记录，请直接编辑')
          return
        }
        result = photoSelectionStore.addSelection(data)
        if (result) {
          message.success('创建成功')
          showFormModal.value = false
        } else {
          message.error('创建失败')
        }
      }
    }
  })
}

function openPaymentModal(row) {
  currentSelection.value = row
  Object.assign(paymentFormData, {
    amount: null,
    paymentMethod: 'wechat',
    payDate: dayjs().valueOf(),
    remark: ''
  })
  showPaymentModal.value = true
}

function handlePaymentModalClose() {
  paymentFormRef.value?.restoreValidation()
}

function handlePaymentSubmit() {
  paymentFormRef.value?.validate((errors) => {
    if (!errors) {
      if (!currentSelection.value) return
      if (paymentFormData.amount > remainingExtraAmount.value) {
        message.warning(`收款金额不能超过待收款 ¥${remainingExtraAmount.value.toLocaleString()}`)
        return
      }
      const result = photoSelectionStore.addExtraPayment(currentSelection.value.id, {
        amount: paymentFormData.amount,
        payDate: dayjs(paymentFormData.payDate).format('YYYY-MM-DD'),
        paymentMethod: paymentFormData.paymentMethod,
        remark: paymentFormData.remark
      })
      if (result.success) {
        message.success('收款登记成功')
        showPaymentModal.value = false
      } else {
        message.error(result.message || '收款登记失败')
      }
    }
  })
}

function openPaymentRecordsModal(row) {
  currentRecordSelection.value = row
  showPaymentRecordsModal.value = true
}

function openPaymentFromRecord() {
  showPaymentRecordsModal.value = false
  if (currentRecordSelection.value) {
    openPaymentModal(currentRecordSelection.value)
  }
}

function openEditPaymentRecordModal(record) {
  editingPaymentRecordId.value = record.id
  Object.assign(editPaymentFormData, {
    amount: record.amount,
    payDate: dayjs(record.payDate).valueOf(),
    paymentMethod: record.paymentMethod,
    remark: record.remark || ''
  })
  showEditPaymentModal.value = true
}

function handleEditPaymentModalClose() {
  editPaymentFormRef.value?.restoreValidation()
  editingPaymentRecordId.value = ''
}

function handleEditPaymentSubmit() {
  if (!editingPaymentRecordId.value || !currentRecordSelection.value) return
  const result = photoSelectionStore.updateExtraPayment(
    currentRecordSelection.value.id,
    editingPaymentRecordId.value,
    {
      amount: editPaymentFormData.amount,
      payDate: dayjs(editPaymentFormData.payDate).format('YYYY-MM-DD'),
      paymentMethod: editPaymentFormData.paymentMethod,
      remark: editPaymentFormData.remark
    }
  )
  if (result.success) {
    message.success('更新成功')
    showEditPaymentModal.value = false
  } else {
    message.error(result.message || '更新失败')
  }
}

function handleDeletePaymentRecord(recordId) {
  if (!currentRecordSelection.value) return
  const success = photoSelectionStore.deleteExtraPayment(currentRecordSelection.value.id, recordId)
  if (success) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
}

function handleDelete(id) {
  const success = photoSelectionStore.deleteSelection(id)
  if (success) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
}

onMounted(() => {
  photoSelectionStore.fetchSelections()
})
</script>

<style scoped>
.photo-selections-page {
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
  color: #2080f0;
  font-weight: 600;
}

.page-subtitle .highlight-warning {
  color: #f0a020;
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

.stat-value.primary {
  color: #2080f0;
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

.cell-primary {
  font-weight: 500;
  color: #333;
}

.refined-total {
  font-size: 16px;
  font-weight: 600;
  color: #2080f0;
}

.refined-detail {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.text-warning {
  color: #f0a020;
}

.payment-progress {
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

.no-extra {
  font-size: 12px;
}

.order-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
}

.info-item {
  text-align: center;
  min-width: 80px;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}

.info-value.primary {
  color: #2080f0;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.quick-amount {
  margin-top: 8px;
}

.payment-summary {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
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

.record-summary {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
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
