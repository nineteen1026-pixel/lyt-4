<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-layout has-sider style="min-height: 100vh;">
            <n-layout-sider
              :bordered="true"
              :collapsed="collapsed"
              show-trigger
              @collapse="collapsed = true"
              @expand="collapsed = false"
              :width="240"
              :collapsed-width="64"
            >
              <div class="logo-container">
                <div class="logo-icon">
                  <n-icon size="24">
                    <camera-outline />
                  </n-icon>
                </div>
                <span v-if="!collapsed" class="logo-text">婚礼摄影台账</span>
              </div>
              <n-menu
                :value="activeKey"
                :collapsed="collapsed"
                :collapsed-width="64"
                :options="menuOptions"
                @update:value="handleMenuClick"
              />
            </n-layout-sider>
            <n-layout>
              <n-layout-header :bordered="true" style="height: 64px; padding: 0 24px;">
                <div class="header-content">
                  <span class="page-title-text">{{ currentPageTitle }}</span>
                  <div class="header-actions">
                    <n-button text @click="handleExport" style="margin-right: 8px;">
                      <template #icon>
                        <download-outline />
                      </template>
                      数据导出
                    </n-button>
                    <n-button text @click="handleImportClick">
                      <template #icon>
                        <cloud-upload-outline />
                      </template>
                      数据导入
                    </n-button>
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".json"
                      style="display: none;"
                      @change="handleImportFile"
                    />
                  </div>
                </div>
              </n-layout-header>
              <n-layout-content style="padding: 20px; background: #f5f5f5;">
                <router-view />
              </n-layout-content>
            </n-layout>
          </n-layout>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createDiscreteApi, darkTheme } from 'naive-ui'
import {
  BarChartOutline,
  PeopleOutline,
  PersonAddOutline,
  CalendarOutline,
  PricetagsOutline,
  TimeOutline,
  CashOutline,
  CarOutline,
  StatsChartOutline,
  CameraOutline,
  DownloadOutline,
  CloudUploadOutline,
  AlbumsOutline
} from '@vicons/ionicons5'
import { exportAllData, importAllData } from '@/utils/storage'
import { useCustomerStore } from '@/stores/customer'
import { usePackageStore } from '@/stores/package'
import { useOrderStore } from '@/stores/order'
import { useCostStore } from '@/stores/cost'
import { useLeadStore } from '@/stores/lead'
import { useScheduleStore } from '@/stores/schedule'

const { message, dialog } = createDiscreteApi(['message', 'dialog'])

const collapsed = ref(false)
const fileInput = ref(null)
const route = useRoute()
const router = useRouter()

const customerStore = useCustomerStore()
const packageStore = usePackageStore()
const orderStore = useOrderStore()
const costStore = useCostStore()
const leadStore = useLeadStore()
const scheduleStore = useScheduleStore()

const activeKey = computed(() => route.name || 'Dashboard')
const currentPageTitle = computed(() => route.meta.title || '数据概览')

const themeOverrides = {
  common: {
    primaryColor: '#D4A574',
    primaryColorHover: '#C49564',
    primaryColorPressed: '#B48554',
    primaryColorSuppl: '#E4B584'
  }
}

function iconRender(icon) {
  return () => h(icon)
}

const menuOptions = [
  {
    label: '数据概览',
    key: 'Dashboard',
    icon: iconRender(BarChartOutline)
  },
  {
    label: '客户线索',
    key: 'Leads',
    icon: iconRender(PersonAddOutline)
  },
  {
    label: '客户档案',
    key: 'Customers',
    icon: iconRender(PeopleOutline)
  },
  {
    label: '档期项目',
    key: 'Schedule',
    icon: iconRender(CalendarOutline)
  },
  {
    label: '拍摄排班',
    key: 'Dispatch',
    icon: iconRender(AlbumsOutline)
  },
  {
    label: '套餐报价',
    key: 'Packages',
    icon: iconRender(PricetagsOutline)
  },
  {
    label: '拍摄进度',
    key: 'Progress',
    icon: iconRender(TimeOutline)
  },
  {
    label: '尾款提醒',
    key: 'Payments',
    icon: iconRender(CashOutline)
  },
  {
    label: '交通成本',
    key: 'Costs',
    icon: iconRender(CarOutline)
  },
  {
    label: '收入报表',
    key: 'Reports',
    icon: iconRender(StatsChartOutline)
  }
]

function handleMenuClick(key) {
  router.push({ name: key })
}

function handleExport() {
  exportAllData()
  message.success('数据导出成功')
}

function handleImportClick() {
  fileInput.value?.click()
}

function handleImportFile(e) {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      dialog.warning({
        title: '确认导入',
        content: '导入数据将覆盖现有数据，确定要继续吗？',
        positiveText: '确认导入',
        negativeText: '取消',
        onPositiveClick: () => {
          const success = importAllData(event.target.result)
          if (success) {
            reloadAllStores()
            message.success('数据导入成功')
          } else {
            message.error('数据导入失败，请检查文件格式')
          }
        }
      })
    } catch (err) {
      message.error('文件解析失败')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

function reloadAllStores() {
  customerStore.fetchCustomers()
  packageStore.fetchPackages()
  orderStore.fetchOrders()
  costStore.fetchCosts()
  leadStore.fetchLeads()
  scheduleStore.fetchStaff()
  scheduleStore.fetchAssignments()
}

onMounted(() => {
  customerStore.fetchCustomers()
  packageStore.fetchPackages()
  orderStore.fetchOrders()
  costStore.fetchCosts()
  leadStore.fetchLeads()
  scheduleStore.fetchStaff()
  scheduleStore.fetchAssignments()
})
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid #e8e8e8;
  overflow: hidden;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #D4A574, #C49564);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.header-content {
  display: flex;
  height: 100%;
  justify-content: space-between;
  align-items: center;
}

.page-title-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>
