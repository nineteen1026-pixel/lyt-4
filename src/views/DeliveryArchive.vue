<template>
  <div class="delivery-archive-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">交付资料归档</h2>
        <p class="page-subtitle">管理照片、视频、相册、快递寄送及客户签收确认</p>
      </div>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon photo">
            <n-icon size="22"><images-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ deliveryArchiveStore.totalPhotos }}</div>
            <div class="stat-label">照片批次</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon video">
            <n-icon size="22"><videocam-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ deliveryArchiveStore.totalVideos }}</div>
            <div class="stat-label">视频文件</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon album">
            <n-icon size="22"><albums-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ deliveryArchiveStore.totalAlbums }}</div>
            <div class="stat-label">相册/产品</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon express">
            <n-icon size="22"><car-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ deliveryArchiveStore.totalShipments }}</div>
            <div class="stat-label">快递记录</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <n-icon size="22"><time-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ deliveryArchiveStore.pendingShipments.length }}</div>
            <div class="stat-label">运输中</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon sign">
            <n-icon size="22"><checkmark-circle-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ deliveryArchiveStore.totalSignOffs }}</div>
            <div class="stat-label">签收记录</div>
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="overview-card">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600;">订单归档进度</span>
          <n-button size="small" text @click="showOrderOverview = !showOrderOverview">
            {{ showOrderOverview ? '收起' : '展开' }}
          </n-button>
        </div>
      </template>
      <div v-show="showOrderOverview">
        <n-data-table
          :columns="orderOverviewColumns"
          :data="orderOverviewData"
          :bordered="false"
          size="small"
          :pagination="{ pageSize: 5 }"
        />
      </div>
    </n-card>

    <n-card class="main-card">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="photos" tab="照片管理">
          <div class="tab-toolbar">
            <n-input
              v-model:value="photoSearchKeyword"
              placeholder="搜索文件名或备注"
              clearable
              style="width: 260px; margin-right: 12px;"
            >
              <template #prefix>
                <n-icon><search-outline /></n-icon>
              </template>
            </n-input>
            <n-select
              v-model:value="photoFilterOrder"
              placeholder="筛选订单"
              clearable
              style="width: 240px; margin-right: 12px;"
              :options="orderOptions"
            />
            <n-button type="primary" @click="showPhotoModal()">
              <template #icon><add-outline /></template>
              新增照片
            </n-button>
          </div>
          <n-data-table
            :columns="photoColumns"
            :data="filteredPhotos"
            :pagination="photoPagination"
            :bordered="false"
            size="medium"
          />
        </n-tab-pane>

        <n-tab-pane name="videos" tab="视频管理">
          <div class="tab-toolbar">
            <n-input
              v-model:value="videoSearchKeyword"
              placeholder="搜索文件名或备注"
              clearable
              style="width: 260px; margin-right: 12px;"
            >
              <template #prefix>
                <n-icon><search-outline /></n-icon>
              </template>
            </n-input>
            <n-select
              v-model:value="videoFilterOrder"
              placeholder="筛选订单"
              clearable
              style="width: 240px; margin-right: 12px;"
              :options="orderOptions"
            />
            <n-button type="primary" @click="showVideoModal()">
              <template #icon><add-outline /></template>
              新增视频
            </n-button>
          </div>
          <n-data-table
            :columns="videoColumns"
            :data="filteredVideos"
            :pagination="videoPagination"
            :bordered="false"
            size="medium"
          />
        </n-tab-pane>

        <n-tab-pane name="albums" tab="相册/产品">
          <div class="tab-toolbar">
            <n-input
              v-model:value="albumSearchKeyword"
              placeholder="搜索相册名称或备注"
              clearable
              style="width: 260px; margin-right: 12px;"
            >
              <template #prefix>
                <n-icon><search-outline /></n-icon>
              </template>
            </n-input>
            <n-select
              v-model:value="albumFilterOrder"
              placeholder="筛选订单"
              clearable
              style="width: 240px; margin-right: 12px;"
              :options="orderOptions"
            />
            <n-button type="primary" @click="showAlbumModal()">
              <template #icon><add-outline /></template>
              新增相册
            </n-button>
          </div>
          <n-data-table
            :columns="albumColumns"
            :data="filteredAlbums"
            :pagination="albumPagination"
            :bordered="false"
            size="medium"
          />
        </n-tab-pane>

        <n-tab-pane name="express" tab="快递寄送">
          <div class="tab-toolbar">
            <n-select
              v-model:value="expressFilterStatus"
              placeholder="筛选状态"
              clearable
              style="width: 180px; margin-right: 12px;"
              :options="expressStatusOptions"
            />
            <n-select
              v-model:value="expressFilterOrder"
              placeholder="筛选订单"
              clearable
              style="width: 240px; margin-right: 12px;"
              :options="orderOptions"
            />
            <n-button type="primary" @click="showExpressModal()">
              <template #icon><add-outline /></template>
              新增快递
            </n-button>
          </div>
          <n-data-table
            :columns="expressColumns"
            :data="filteredExpress"
            :pagination="expressPagination"
            :bordered="false"
            size="medium"
          />
        </n-tab-pane>

        <n-tab-pane name="signoffs" tab="客户签收">
          <div class="tab-toolbar">
            <n-select
              v-model:value="signoffFilterStatus"
              placeholder="筛选状态"
              clearable
              style="width: 180px; margin-right: 12px;"
              :options="signOffStatusOptions"
            />
            <n-select
              v-model:value="signoffFilterOrder"
              placeholder="筛选订单"
              clearable
              style="width: 240px; margin-right: 12px;"
              :options="orderOptions"
            />
            <n-button type="primary" @click="showSignOffModal()">
              <template #icon><add-outline /></template>
              新增签收
            </n-button>
          </div>
          <n-data-table
            :columns="signOffColumns"
            :data="filteredSignOffs"
            :pagination="signOffPagination"
            :bordered="false"
            size="medium"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <n-modal
      v-model:show="photoModalVisible"
      preset="card"
      :title="editingPhoto ? '编辑照片' : '新增照片'"
      style="width: 640px;"
    >
      <n-form
        ref="photoFormRef"
        :model="photoForm"
        :rules="photoRules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="关联订单" path="orderId">
          <n-select v-model:value="photoForm.orderId" :options="orderOptions" filterable />
        </n-form-item>
        <n-form-item label="照片类型" path="type">
          <n-select v-model:value="photoForm.type" :options="photoTypeOptions" />
        </n-form-item>
        <n-form-item label="文件名" path="fileName">
          <n-input v-model:value="photoForm.fileName" placeholder="例如：张先生&李女士_精修50张.zip" />
        </n-form-item>
        <n-form-item label="照片数量" path="photoCount">
          <n-input-number v-model:value="photoForm.photoCount" :min="0" placeholder="照片张数" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="存储链接" path="storageUrl">
          <n-input v-model:value="photoForm.storageUrl" placeholder="网盘链接或存储地址" />
        </n-form-item>
        <n-form-item label="交付日期" path="deliveredDate">
          <n-date-picker v-model:value="photoForm.deliveredDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input v-model:value="photoForm.remark" type="textarea" :rows="2" placeholder="备注说明" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="photoModalVisible = false">取消</n-button>
          <n-button type="primary" @click="savePhoto">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="videoModalVisible"
      preset="card"
      :title="editingVideo ? '编辑视频' : '新增视频'"
      style="width: 640px;"
    >
      <n-form
        ref="videoFormRef"
        :model="videoForm"
        :rules="videoRules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="关联订单" path="orderId">
          <n-select v-model:value="videoForm.orderId" :options="orderOptions" filterable />
        </n-form-item>
        <n-form-item label="视频类型" path="type">
          <n-select v-model:value="videoForm.type" :options="videoTypeOptions" />
        </n-form-item>
        <n-form-item label="文件名" path="fileName">
          <n-input v-model:value="videoForm.fileName" placeholder="例如：张先生&李女士_花絮快剪.mp4" />
        </n-form-item>
        <n-form-item label="时长" path="duration">
          <n-input v-model:value="videoForm.duration" placeholder="例如：00:02:30" />
        </n-form-item>
        <n-form-item label="大小(MB)" path="fileSize">
          <n-input-number v-model:value="videoForm.fileSize" :min="0" placeholder="文件大小MB" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="存储链接" path="storageUrl">
          <n-input v-model:value="videoForm.storageUrl" placeholder="网盘链接或存储地址" />
        </n-form-item>
        <n-form-item label="交付日期" path="deliveredDate">
          <n-date-picker v-model:value="videoForm.deliveredDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input v-model:value="videoForm.remark" type="textarea" :rows="2" placeholder="备注说明" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="videoModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveVideo">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="albumModalVisible"
      preset="card"
      :title="editingAlbum ? '编辑相册' : '新增相册'"
      style="width: 640px;"
    >
      <n-form
        ref="albumFormRef"
        :model="albumForm"
        :rules="albumRules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="关联订单" path="orderId">
          <n-select v-model:value="albumForm.orderId" :options="orderOptions" filterable />
        </n-form-item>
        <n-form-item label="相册名称" path="name">
          <n-input v-model:value="albumForm.name" placeholder="例如：经典皮质相册" />
        </n-form-item>
        <n-form-item label="规格" path="spec">
          <n-input v-model:value="albumForm.spec" placeholder="例如：12寸横版 · 30页" />
        </n-form-item>
        <n-form-item label="照片数量" path="photoCount">
          <n-input-number v-model:value="albumForm.photoCount" :min="0" placeholder="入册张数" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="封面图链接" path="coverPhotoUrl">
          <n-input v-model:value="albumForm.coverPhotoUrl" placeholder="可选" />
        </n-form-item>
        <n-form-item label="设计状态" path="designStatus">
          <n-select v-model:value="albumForm.designStatus" :options="designStatusOptions" />
        </n-form-item>
        <n-form-item label="制作状态" path="printStatus">
          <n-select v-model:value="albumForm.printStatus" :options="printStatusOptions" />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input v-model:value="albumForm.remark" type="textarea" :rows="2" placeholder="备注说明" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="albumModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveAlbum">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="expressModalVisible"
      preset="card"
      :title="editingExpress ? '编辑快递' : '新增快递'"
      style="width: 720px;"
    >
      <n-form
        ref="expressFormRef"
        :model="expressForm"
        :rules="expressRules"
        label-placement="left"
        label-width="90px"
      >
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="关联订单" path="orderId" :grid-span="2">
            <n-select v-model:value="expressForm.orderId" :options="orderOptions" filterable />
          </n-form-item>
          <n-form-item label="快递公司" path="company">
            <n-select v-model:value="expressForm.company" :options="expressCompanyOptions" />
          </n-form-item>
          <n-form-item label="运单号" path="trackingNo">
            <n-input v-model:value="expressForm.trackingNo" placeholder="快递运单号" />
          </n-form-item>
          <n-form-item label="寄件人" path="sender">
            <n-input v-model:value="expressForm.sender" />
          </n-form-item>
          <n-form-item label="寄件电话" path="senderPhone">
            <n-input v-model:value="expressForm.senderPhone" />
          </n-form-item>
          <n-form-item label="寄件地址" path="senderAddress" :grid-span="2">
            <n-input v-model:value="expressForm.senderAddress" />
          </n-form-item>
          <n-form-item label="收件人" path="receiver">
            <n-input v-model:value="expressForm.receiver" />
          </n-form-item>
          <n-form-item label="收件电话" path="receiverPhone">
            <n-input v-model:value="expressForm.receiverPhone" />
          </n-form-item>
          <n-form-item label="收件地址" path="receiverAddress" :grid-span="2">
            <n-input v-model:value="expressForm.receiverAddress" />
          </n-form-item>
          <n-form-item label="物品清单" path="items" :grid-span="2">
            <n-input v-model:value="expressForm.items" type="textarea" :rows="2" placeholder="例如：相册1本、U盘1个" />
          </n-form-item>
          <n-form-item label="重量(kg)" path="weight">
            <n-input-number v-model:value="expressForm.weight" :min="0" :step="0.1" style="width: 100%;" />
          </n-form-item>
          <n-form-item label="运费(元)" path="cost">
            <n-input-number v-model:value="expressForm.cost" :min="0" style="width: 100%;" />
          </n-form-item>
          <n-form-item label="发货状态" path="status">
            <n-select v-model:value="expressForm.status" :options="expressStatusOptions" />
          </n-form-item>
          <n-form-item label="发货日期" path="shippedDate">
            <n-date-picker v-model:value="expressForm.shippedDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
          </n-form-item>
          <n-form-item label="送达日期" path="deliveredDate">
            <n-date-picker v-model:value="expressForm.deliveredDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
          </n-form-item>
          <n-form-item label="备注" path="remark" :grid-span="2">
            <n-input v-model:value="expressForm.remark" type="textarea" :rows="2" />
          </n-form-item>
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="expressModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveExpress">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="signOffModalVisible"
      preset="card"
      :title="editingSignOff ? '编辑签收' : '新增签收'"
      style="width: 640px;"
    >
      <n-form
        ref="signOffFormRef"
        :model="signOffForm"
        :rules="signOffRules"
        label-placement="left"
        label-width="90px"
      >
        <n-form-item label="关联订单" path="orderId">
          <n-select v-model:value="signOffForm.orderId" :options="orderOptions" filterable />
        </n-form-item>
        <n-form-item label="签收类型" path="type">
          <n-select v-model:value="signOffForm.type" :options="signOffTypeOptions" />
        </n-form-item>
        <n-form-item label="签收状态" path="status">
          <n-select v-model:value="signOffForm.status" :options="signOffStatusOptions" />
        </n-form-item>
        <n-form-item label="签收人" path="signerName">
          <n-input v-model:value="signOffForm.signerName" placeholder="客户姓名" />
        </n-form-item>
        <n-form-item label="签收日期" path="signDate">
          <n-date-picker v-model:value="signOffForm.signDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
        </n-form-item>
        <n-form-item label="客户评分" path="rating">
          <n-rate v-model:value="signOffForm.rating" />
        </n-form-item>
        <n-form-item label="客户反馈" path="feedback">
          <n-input v-model:value="signOffForm.feedback" type="textarea" :rows="3" placeholder="客户评价或反馈意见" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="signOffModalVisible = false">取消</n-button>
          <n-button type="primary" @click="saveSignOff">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { createDiscreteApi, NTag, NProgress, NButton, NIcon } from 'naive-ui'
import {
  ImagesOutline,
  VideocamOutline,
  AlbumsOutline,
  CarOutline,
  TimeOutline,
  CheckmarkCircleOutline,
  AddOutline,
  SearchOutline,
  CreateOutline,
  TrashOutline,
  EyeOutline
} from '@vicons/ionicons5'
import { useDeliveryArchiveStore, photoTypeOptions, videoTypeOptions, expressStatusOptions, expressCompanyOptions, signOffStatusOptions } from '@/stores/deliveryArchive'
import { useCustomerStore } from '@/stores/customer'
import { useOrderStore } from '@/stores/order'
import { formatDate } from '@/utils/format'

const { message, dialog } = createDiscreteApi(['message', 'dialog'])

const deliveryArchiveStore = useDeliveryArchiveStore()
const customerStore = useCustomerStore()
const orderStore = useOrderStore()

const activeTab = ref('photos')
const showOrderOverview = ref(true)

const photoSearchKeyword = ref('')
const photoFilterOrder = ref(null)
const videoSearchKeyword = ref('')
const videoFilterOrder = ref(null)
const albumSearchKeyword = ref('')
const albumFilterOrder = ref(null)
const expressFilterStatus = ref(null)
const expressFilterOrder = ref(null)
const signoffFilterStatus = ref(null)
const signoffFilterOrder = ref(null)

const photoPagination = { pageSize: 10 }
const videoPagination = { pageSize: 10 }
const albumPagination = { pageSize: 10 }
const expressPagination = { pageSize: 10 }
const signOffPagination = { pageSize: 10 }

const designStatusOptions = [
  { value: 'pending', label: '待设计' },
  { value: 'designing', label: '设计中' },
  { value: 'reviewing', label: '待确认' },
  { value: 'revising', label: '修改中' },
  { value: 'completed', label: '已确认' }
]

const printStatusOptions = [
  { value: 'pending', label: '待制作' },
  { value: 'printing', label: '制作中' },
  { value: 'qc', label: '质检中' },
  { value: 'completed', label: '已完成' }
]

const signOffTypeOptions = [
  { value: 'photo', label: '照片确认' },
  { value: 'video', label: '视频确认' },
  { value: 'product', label: '产品签收' },
  { value: 'all', label: '全部确认' }
]

const orderOptions = computed(() => {
  return orderStore.orders.map(o => {
    const customer = customerStore.customers.find(c => c.id === o.customerId)
    return {
      label: `${customer?.name || '未知客户'} - ${o.packageName} (${formatDate(o.shootDate)})`,
      value: o.id,
      customerId: o.customerId
    }
  })
})

function getCustomerName(customerId) {
  const customer = customerStore.customers.find(c => c.id === customerId)
  return customer?.name || '-'
}

function getOrderInfo(orderId) {
  const order = orderStore.orders.find(o => o.id === orderId)
  if (!order) return { label: '-', customer: '-' }
  const customer = customerStore.customers.find(c => c.id === order.customerId)
  return {
    label: `${customer?.name || '-'} - ${order.packageName}`,
    customer: customer?.name || '-'
  }
}

function getLabel(options, value) {
  const opt = options.find(o => o.value === value)
  return opt?.label || value || '-'
}

function getStatusTagType(status, options) {
  const typeMap = {
    pending: 'warning',
    shipped: 'info',
    in_transit: 'primary',
    delivered: 'success',
    returned: 'error',
    signed: 'success',
    rejected: 'error',
    confirmed: 'success',
    completed: 'success',
    designing: 'primary',
    reviewing: 'warning',
    revising: 'warning',
    printing: 'primary',
    qc: 'info'
  }
  return typeMap[status] || 'default'
}

function renderRating(rating) {
  if (!rating) return '-'
  return h('div', { style: { color: '#f0a020' } }, '★'.repeat(rating) + '☆'.repeat(5 - rating))
}

const orderOverviewColumns = [
  { title: '客户订单', key: 'orderLabel', width: 260, render: (row) => row.orderLabel },
  { title: '拍摄日期', key: 'shootDate', width: 110, render: (row) => formatDate(row.shootDate) },
  {
    title: '照片', key: 'photoStatus', width: 100,
    render: (row) => h(NTag, { type: row.photoCount > 0 ? 'success' : 'default', size: 'small' }, { default: () => `${row.photoCount}份` })
  },
  {
    title: '视频', key: 'videoStatus', width: 100,
    render: (row) => h(NTag, { type: row.videoCount > 0 ? 'success' : 'default', size: 'small' }, { default: () => `${row.videoCount}个` })
  },
  {
    title: '相册', key: 'albumStatus', width: 100,
    render: (row) => h(NTag, { type: row.albumCount > 0 ? 'success' : 'default', size: 'small' }, { default: () => `${row.albumCount}本` })
  },
  {
    title: '快递', key: 'expressStatus', width: 100,
    render: (row) => {
      const pendingExpress = row.expressList.filter(e => e.status === 'pending' || e.status === 'shipped' || e.status === 'in_transit').length
      const hasDelivered = row.expressList.some(e => e.status === 'delivered')
      let type = 'default'
      if (pendingExpress > 0) type = 'warning'
      else if (hasDelivered) type = 'success'
      return h(NTag, { type, size: 'small' }, { default: () => row.expressCount > 0 ? `${row.expressCount}单` : '未发货' })
    }
  },
  {
    title: '签收', key: 'signStatus', width: 110,
    render: (row) => {
      const confirmed = row.signOffList.some(s => s.status === 'confirmed' || s.status === 'signed')
      return h(NTag, { type: confirmed ? 'success' : (row.signCount > 0 ? 'warning' : 'default'), size: 'small' },
        { default: () => confirmed ? '已确认' : (row.signCount > 0 ? '待确认' : '未签收') }
      )
    }
  },
  {
    title: '归档进度', key: 'progress', width: 150,
    render: (row) => {
      const steps = ['照片', '视频', '相册', '发货', '签收']
      const completed = [
        row.photoCount > 0,
        row.videoCount > 0,
        row.albumCount > 0,
        row.expressList.some(e => e.status === 'delivered'),
        row.signOffList.some(s => s.status === 'confirmed' || s.status === 'signed')
      ].filter(Boolean).length
      const percent = Math.round((completed / steps.length) * 100)
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
        h(NProgress, { type: 'line', percentage: percent, showIndicator: false, style: { flex: 1, minWidth: '70px' } }),
        h('span', { style: { fontSize: '12px', color: '#8c8c8c', whiteSpace: 'nowrap' } }, `${percent}%`)
      ])
    }
  }
]

const orderOverviewData = computed(() => {
  return orderStore.orders.map(order => {
    const customer = customerStore.customers.find(c => c.id === order.customerId)
    const photos = deliveryArchiveStore.getPhotosByOrder(order.id)
    const videos = deliveryArchiveStore.getVideosByOrder(order.id)
    const albums = deliveryArchiveStore.getAlbumsByOrder(order.id)
    const expressList = deliveryArchiveStore.getExpressShipmentsByOrder(order.id)
    const signOffList = deliveryArchiveStore.getSignOffsByOrder(order.id)

    return {
      id: order.id,
      orderLabel: `${customer?.name || '-'} - ${order.packageName}`,
      customerName: customer?.name || '-',
      shootDate: order.shootDate,
      photoCount: photos.length,
      videoCount: videos.length,
      albumCount: albums.length,
      expressCount: expressList.length,
      signCount: signOffList.length,
      photos,
      videos,
      albums,
      expressList,
      signOffList
    }
  }).sort((a, b) => {
    const progressA = [a.photoCount > 0, a.videoCount > 0, a.albumCount > 0].filter(Boolean).length
    const progressB = [b.photoCount > 0, b.videoCount > 0, b.albumCount > 0].filter(Boolean).length
    return progressA - progressB
  })
})

const photoColumns = [
  { title: '客户订单', key: 'orderInfo', width: 220, render: (row) => getOrderInfo(row.orderId).label },
  { title: '照片类型', key: 'type', width: 100, render: (row) => getLabel(photoTypeOptions, row.type) },
  { title: '文件名', key: 'fileName', ellipsis: { tooltip: true } },
  { title: '数量', key: 'photoCount', width: 90, align: 'right' },
  { title: '交付日期', key: 'deliveredDate', width: 120, render: (row) => formatDate(row.deliveredDate) },
  { title: '备注', key: 'remark', width: 160, ellipsis: { tooltip: true } },
  {
    title: '操作', key: 'actions', width: 160, fixed: 'right',
    render: (row) => h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(NButton, { size: 'small', quaternary: true, onClick: () => viewStorage(row.storageUrl) }, { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => showPhotoModal(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => deletePhoto(row) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
    ])
  }
]

const videoColumns = [
  { title: '客户订单', key: 'orderInfo', width: 220, render: (row) => getOrderInfo(row.orderId).label },
  { title: '视频类型', key: 'type', width: 110, render: (row) => getLabel(videoTypeOptions, row.type) },
  { title: '文件名', key: 'fileName', ellipsis: { tooltip: true } },
  { title: '时长', key: 'duration', width: 100 },
  { title: '大小(MB)', key: 'fileSize', width: 100, align: 'right' },
  { title: '交付日期', key: 'deliveredDate', width: 120, render: (row) => formatDate(row.deliveredDate) },
  { title: '备注', key: 'remark', width: 140, ellipsis: { tooltip: true } },
  {
    title: '操作', key: 'actions', width: 160, fixed: 'right',
    render: (row) => h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(NButton, { size: 'small', quaternary: true, onClick: () => viewStorage(row.storageUrl) }, { icon: () => h(NIcon, null, { default: () => h(EyeOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => showVideoModal(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => deleteVideo(row) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
    ])
  }
]

const albumColumns = [
  { title: '客户订单', key: 'orderInfo', width: 220, render: (row) => getOrderInfo(row.orderId).label },
  { title: '相册名称', key: 'name', width: 180 },
  { title: '规格', key: 'spec', width: 160 },
  { title: '入册数', key: 'photoCount', width: 90, align: 'right' },
  { title: '设计状态', key: 'designStatus', width: 100, render: (row) => h(NTag, { type: getStatusTagType(row.designStatus, designStatusOptions), size: 'small' }, { default: () => getLabel(designStatusOptions, row.designStatus) }) },
  { title: '制作状态', key: 'printStatus', width: 100, render: (row) => h(NTag, { type: getStatusTagType(row.printStatus, printStatusOptions), size: 'small' }, { default: () => getLabel(printStatusOptions, row.printStatus) }) },
  { title: '备注', key: 'remark', width: 140, ellipsis: { tooltip: true } },
  {
    title: '操作', key: 'actions', width: 110, fixed: 'right',
    render: (row) => h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(NButton, { size: 'small', quaternary: true, onClick: () => showAlbumModal(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => deleteAlbum(row) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
    ])
  }
]

const expressColumns = [
  { title: '客户订单', key: 'orderInfo', width: 220, render: (row) => getOrderInfo(row.orderId).label },
  { title: '快递公司', key: 'company', width: 100, render: (row) => getLabel(expressCompanyOptions, row.company) },
  { title: '运单号', key: 'trackingNo', width: 180, render: (row) => row.trackingNo || '-' },
  { title: '收件人', key: 'receiver', width: 100 },
  { title: '物品', key: 'items', width: 160, ellipsis: { tooltip: true } },
  { title: '运费', key: 'cost', width: 90, align: 'right', render: (row) => row.cost != null ? '¥' + row.cost : '-' },
  { title: '状态', key: 'status', width: 100, render: (row) => h(NTag, { type: getStatusTagType(row.status, expressStatusOptions), size: 'small' }, { default: () => getLabel(expressStatusOptions, row.status) }) },
  { title: '发货日期', key: 'shippedDate', width: 110, render: (row) => formatDate(row.shippedDate) },
  {
    title: '操作', key: 'actions', width: 110, fixed: 'right',
    render: (row) => h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(NButton, { size: 'small', quaternary: true, onClick: () => showExpressModal(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => deleteExpress(row) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
    ])
  }
]

const signOffColumns = [
  { title: '客户订单', key: 'orderInfo', width: 220, render: (row) => getOrderInfo(row.orderId).label },
  { title: '签收类型', key: 'type', width: 110, render: (row) => getLabel(signOffTypeOptions, row.type) },
  { title: '状态', key: 'status', width: 100, render: (row) => h(NTag, { type: getStatusTagType(row.status, signOffStatusOptions), size: 'small' }, { default: () => getLabel(signOffStatusOptions, row.status) }) },
  { title: '签收人', key: 'signerName', width: 110, render: (row) => row.signerName || '-' },
  { title: '签收日期', key: 'signDate', width: 120, render: (row) => formatDate(row.signDate) },
  { title: '评分', key: 'rating', width: 120, render: (row) => renderRating(row.rating) },
  { title: '客户反馈', key: 'feedback', ellipsis: { tooltip: true } },
  {
    title: '操作', key: 'actions', width: 110, fixed: 'right',
    render: (row) => h('div', { style: { display: 'flex', gap: '8px' } }, [
      h(NButton, { size: 'small', quaternary: true, onClick: () => showSignOffModal(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }) }),
      h(NButton, { size: 'small', quaternary: true, onClick: () => deleteSignOff(row) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }) })
    ])
  }
]

const filteredPhotos = computed(() => {
  let list = deliveryArchiveStore.photos
  if (photoFilterOrder.value) {
    list = list.filter(p => p.orderId === photoFilterOrder.value)
  }
  if (photoSearchKeyword.value) {
    const kw = photoSearchKeyword.value.toLowerCase()
    list = list.filter(p =>
      (p.fileName && p.fileName.toLowerCase().includes(kw)) ||
      (p.remark && p.remark.toLowerCase().includes(kw))
    )
  }
  return [...list].reverse()
})

const filteredVideos = computed(() => {
  let list = deliveryArchiveStore.videos
  if (videoFilterOrder.value) {
    list = list.filter(v => v.orderId === videoFilterOrder.value)
  }
  if (videoSearchKeyword.value) {
    const kw = videoSearchKeyword.value.toLowerCase()
    list = list.filter(v =>
      (v.fileName && v.fileName.toLowerCase().includes(kw)) ||
      (v.remark && v.remark.toLowerCase().includes(kw))
    )
  }
  return [...list].reverse()
})

const filteredAlbums = computed(() => {
  let list = deliveryArchiveStore.albums
  if (albumFilterOrder.value) {
    list = list.filter(a => a.orderId === albumFilterOrder.value)
  }
  if (albumSearchKeyword.value) {
    const kw = albumSearchKeyword.value.toLowerCase()
    list = list.filter(a =>
      (a.name && a.name.toLowerCase().includes(kw)) ||
      (a.remark && a.remark.toLowerCase().includes(kw))
    )
  }
  return [...list].reverse()
})

const filteredExpress = computed(() => {
  let list = deliveryArchiveStore.expressShipments
  if (expressFilterStatus.value) {
    list = list.filter(s => s.status === expressFilterStatus.value)
  }
  if (expressFilterOrder.value) {
    list = list.filter(s => s.orderId === expressFilterOrder.value)
  }
  return [...list].reverse()
})

const filteredSignOffs = computed(() => {
  let list = deliveryArchiveStore.signOffs
  if (signoffFilterStatus.value) {
    list = list.filter(s => s.status === signoffFilterStatus.value)
  }
  if (signoffFilterOrder.value) {
    list = list.filter(s => s.orderId === signoffFilterOrder.value)
  }
  return [...list].reverse()
})

const photoModalVisible = ref(false)
const videoModalVisible = ref(false)
const albumModalVisible = ref(false)
const expressModalVisible = ref(false)
const signOffModalVisible = ref(false)

const photoFormRef = ref(null)
const videoFormRef = ref(null)
const albumFormRef = ref(null)
const expressFormRef = ref(null)
const signOffFormRef = ref(null)

const editingPhoto = ref(null)
const editingVideo = ref(null)
const editingAlbum = ref(null)
const editingExpress = ref(null)
const editingSignOff = ref(null)

const defaultPhotoForm = () => ({
  orderId: null,
  customerId: null,
  type: 'refined',
  fileName: '',
  photoCount: 0,
  storageUrl: '',
  deliveredDate: null,
  remark: ''
})

const defaultVideoForm = () => ({
  orderId: null,
  customerId: null,
  type: 'highlight',
  fileName: '',
  duration: '',
  fileSize: 0,
  storageUrl: '',
  deliveredDate: null,
  remark: ''
})

const defaultAlbumForm = () => ({
  orderId: null,
  customerId: null,
  name: '',
  spec: '',
  photoCount: 0,
  coverPhotoUrl: null,
  designStatus: 'pending',
  printStatus: 'pending',
  remark: ''
})

const defaultExpressForm = () => ({
  orderId: null,
  customerId: null,
  company: 'sf',
  trackingNo: '',
  sender: '婚礼摄影工作室',
  senderPhone: '',
  senderAddress: '',
  receiver: '',
  receiverPhone: '',
  receiverAddress: '',
  items: '',
  weight: 0,
  cost: null,
  status: 'pending',
  shippedDate: null,
  deliveredDate: null,
  remark: ''
})

const defaultSignOffForm = () => ({
  orderId: null,
  customerId: null,
  type: 'product',
  status: 'pending',
  signerName: null,
  signDate: null,
  feedback: null,
  rating: null
})

const photoForm = ref(defaultPhotoForm())
const videoForm = ref(defaultVideoForm())
const albumForm = ref(defaultAlbumForm())
const expressForm = ref(defaultExpressForm())
const signOffForm = ref(defaultSignOffForm())

const photoRules = {
  orderId: { required: true, type: 'string', message: '请选择关联订单', trigger: ['blur', 'change'] },
  type: { required: true, type: 'string', message: '请选择照片类型', trigger: ['blur', 'change'] },
  fileName: { required: true, type: 'string', message: '请输入文件名', trigger: 'blur' }
}

const videoRules = {
  orderId: { required: true, type: 'string', message: '请选择关联订单', trigger: ['blur', 'change'] },
  type: { required: true, type: 'string', message: '请选择视频类型', trigger: ['blur', 'change'] },
  fileName: { required: true, type: 'string', message: '请输入文件名', trigger: 'blur' }
}

const albumRules = {
  orderId: { required: true, type: 'string', message: '请选择关联订单', trigger: ['blur', 'change'] },
  name: { required: true, type: 'string', message: '请输入相册名称', trigger: 'blur' },
  designStatus: { required: true, type: 'string', message: '请选择设计状态', trigger: ['blur', 'change'] },
  printStatus: { required: true, type: 'string', message: '请选择制作状态', trigger: ['blur', 'change'] }
}

const expressRules = {
  orderId: { required: true, type: 'string', message: '请选择关联订单', trigger: ['blur', 'change'] },
  company: { required: true, type: 'string', message: '请选择快递公司', trigger: ['blur', 'change'] },
  receiver: { required: true, type: 'string', message: '请输入收件人', trigger: 'blur' },
  receiverPhone: { required: true, type: 'string', message: '请输入收件电话', trigger: 'blur' },
  receiverAddress: { required: true, type: 'string', message: '请输入收件地址', trigger: 'blur' },
  status: { required: true, type: 'string', message: '请选择发货状态', trigger: ['blur', 'change'] }
}

const signOffRules = {
  orderId: { required: true, type: 'string', message: '请选择关联订单', trigger: ['blur', 'change'] },
  type: { required: true, type: 'string', message: '请选择签收类型', trigger: ['blur', 'change'] },
  status: { required: true, type: 'string', message: '请选择签收状态', trigger: ['blur', 'change'] }
}

function getCustomerIdByOrder(orderId) {
  const order = orderStore.orders.find(o => o.id === orderId)
  return order?.customerId || null
}

function showPhotoModal(row = null) {
  editingPhoto.value = row
  if (row) {
    photoForm.value = { ...row }
  } else {
    photoForm.value = defaultPhotoForm()
  }
  photoModalVisible.value = true
}

async function savePhoto() {
  try {
    await photoFormRef.value?.validate()
    const data = { ...photoForm.value, customerId: getCustomerIdByOrder(photoForm.value.orderId) }
    if (editingPhoto.value) {
      deliveryArchiveStore.updatePhoto(editingPhoto.value.id, data)
      message.success('照片记录更新成功')
    } else {
      deliveryArchiveStore.addPhoto(data)
      message.success('照片记录添加成功')
    }
    photoModalVisible.value = false
  } catch (e) {
    console.warn('表单校验未通过')
  }
}

function deletePhoto(row) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条照片记录吗？此操作不可撤销。',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      deliveryArchiveStore.deletePhoto(row.id)
      message.success('删除成功')
    }
  })
}

function showVideoModal(row = null) {
  editingVideo.value = row
  if (row) {
    videoForm.value = { ...row }
  } else {
    videoForm.value = defaultVideoForm()
  }
  videoModalVisible.value = true
}

async function saveVideo() {
  try {
    await videoFormRef.value?.validate()
    const data = { ...videoForm.value, customerId: getCustomerIdByOrder(videoForm.value.orderId) }
    if (editingVideo.value) {
      deliveryArchiveStore.updateVideo(editingVideo.value.id, data)
      message.success('视频记录更新成功')
    } else {
      deliveryArchiveStore.addVideo(data)
      message.success('视频记录添加成功')
    }
    videoModalVisible.value = false
  } catch (e) {
    console.warn('表单校验未通过')
  }
}

function deleteVideo(row) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条视频记录吗？此操作不可撤销。',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      deliveryArchiveStore.deleteVideo(row.id)
      message.success('删除成功')
    }
  })
}

function showAlbumModal(row = null) {
  editingAlbum.value = row
  if (row) {
    albumForm.value = { ...row }
  } else {
    albumForm.value = defaultAlbumForm()
  }
  albumModalVisible.value = true
}

async function saveAlbum() {
  try {
    await albumFormRef.value?.validate()
    const data = { ...albumForm.value, customerId: getCustomerIdByOrder(albumForm.value.orderId) }
    if (editingAlbum.value) {
      deliveryArchiveStore.updateAlbum(editingAlbum.value.id, data)
      message.success('相册记录更新成功')
    } else {
      deliveryArchiveStore.addAlbum(data)
      message.success('相册记录添加成功')
    }
    albumModalVisible.value = false
  } catch (e) {
    console.warn('表单校验未通过')
  }
}

function deleteAlbum(row) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条相册记录吗？此操作不可撤销。',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      deliveryArchiveStore.deleteAlbum(row.id)
      message.success('删除成功')
    }
  })
}

function showExpressModal(row = null) {
  editingExpress.value = row
  if (row) {
    expressForm.value = { ...row }
  } else {
    expressForm.value = defaultExpressForm()
  }
  expressModalVisible.value = true
}

async function saveExpress() {
  try {
    await expressFormRef.value?.validate()
    const data = { ...expressForm.value, customerId: getCustomerIdByOrder(expressForm.value.orderId) }
    if (editingExpress.value) {
      deliveryArchiveStore.updateExpressShipment(editingExpress.value.id, data)
      message.success('快递记录更新成功')
    } else {
      deliveryArchiveStore.addExpressShipment(data)
      message.success('快递记录添加成功')
    }
    expressModalVisible.value = false
  } catch (e) {
    console.warn('表单校验未通过')
  }
}

function deleteExpress(row) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条快递记录吗？此操作不可撤销。',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      deliveryArchiveStore.deleteExpressShipment(row.id)
      message.success('删除成功')
    }
  })
}

function showSignOffModal(row = null) {
  editingSignOff.value = row
  if (row) {
    signOffForm.value = { ...row }
  } else {
    signOffForm.value = defaultSignOffForm()
  }
  signOffModalVisible.value = true
}

async function saveSignOff() {
  try {
    await signOffFormRef.value?.validate()
    const data = { ...signOffForm.value, customerId: getCustomerIdByOrder(signOffForm.value.orderId) }
    if (editingSignOff.value) {
      deliveryArchiveStore.updateSignOff(editingSignOff.value.id, data)
      message.success('签收记录更新成功')
    } else {
      deliveryArchiveStore.addSignOff(data)
      message.success('签收记录添加成功')
    }
    signOffModalVisible.value = false
  } catch (e) {
    console.warn('表单校验未通过')
  }
}

function deleteSignOff(row) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条签收记录吗？此操作不可撤销。',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      deliveryArchiveStore.deleteSignOff(row.id)
      message.success('删除成功')
    }
  })
}

function viewStorage(url) {
  if (url) {
    window.open(url, '_blank')
  } else {
    message.info('暂无存储链接')
  }
}

onMounted(() => {
  customerStore.fetchCustomers()
  orderStore.fetchOrders()
  deliveryArchiveStore.fetchAll()
})
</script>

<style scoped>
.delivery-archive-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 14px;
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

.stat-icon.photo {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-icon.video {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-icon.album {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-icon.express {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: #2c7a4e;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fa709a, #fee140);
  color: #b85c00;
}

.stat-icon.sign {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #5b8a88;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.main-card {
  border-radius: 12px;
}

.overview-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
