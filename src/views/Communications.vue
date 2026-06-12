<template>
  <div class="communications-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">客户沟通记录</h2>
        <p class="page-subtitle">
          跟进节点：{{ communicationStore.followUpCount }} 条 · 
          备注沉淀：{{ communicationStore.noteCount }} 条 · 
          待处理转单：{{ communicationStore.pendingTransferCount }} 条
        </p>
      </div>
    </div>

    <div class="stat-cards">
      <n-card class="stat-card" size="small">
        <div class="stat-card-content">
          <div class="stat-icon" style="background: #e6f4ff; color: #1677ff;">
            <n-icon size="24"><chatbubbles-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ communicationStore.followUpCount }}</div>
            <div class="stat-label">跟进节点</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" size="small">
        <div class="stat-card-content">
          <div class="stat-icon" style="background: #f6ffed; color: #52c41a;">
            <n-icon size="24"><document-text-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ communicationStore.noteCount }}</div>
            <div class="stat-label">备注沉淀</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" size="small">
        <div class="stat-card-content">
          <div class="stat-icon" style="background: #fffbe6; color: #faad14;">
            <n-icon size="24"><git-compare-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ communicationStore.pendingTransferCount }}</div>
            <div class="stat-label">待处理转单</div>
          </div>
        </div>
      </n-card>
      <n-card class="stat-card" size="small">
        <div class="stat-card-content">
          <div class="stat-icon" style="background: #fff1f0; color: #f5222d;">
            <n-icon size="24"><today-outline /></n-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ communicationStore.todayCommunicationCount }}</div>
            <div class="stat-label">今日沟通</div>
          </div>
        </div>
      </n-card>
    </div>

    <n-card class="main-card">
      <div class="filter-bar">
        <div class="filter-left">
          <n-select
            v-model:value="filterCustomerId"
            placeholder="选择客户"
            :options="customerOptions"
            clearable
            style="width: 200px; margin-right: 12px;"
          />
          <n-input
            v-model:value="filterKeyword"
            placeholder="搜索标题/内容/摘要"
            style="width: 280px;"
            clearable
          >
            <template #prefix>
              <n-icon><search-outline /></n-icon>
            </template>
          </n-input>
        </div>
        <div class="filter-right">
          <n-button type="primary" @click="handleAddFollowUp" v-if="activeTab === 'follow_up'">
            <template #icon><add-outline /></template>
            新增跟进
          </n-button>
          <n-button type="primary" @click="handleAddNote" v-else-if="activeTab === 'note'">
            <template #icon><add-outline /></template>
            新增备注
          </n-button>
          <n-button type="primary" @click="handleAddTransfer" v-else>
            <template #icon><add-outline /></template>
            发起转单
          </n-button>
        </div>
      </div>

      <n-tabs v-model:value="activeTab" type="line" size="large" class="comm-tabs">
        <n-tab-pane name="follow_up" tab="跟进节点">
          <template #tab>
            <div class="tab-label">
              <n-icon><chatbubbles-outline /></n-icon>
              <span>跟进节点</span>
              <n-tag size="small" type="success" round style="margin-left: 6px;">
                {{ followUpList.length }}
              </n-tag>
            </div>
          </template>

          <div v-if="followUpList.length === 0" class="empty-state">
            <n-empty description="暂无跟进记录，点击右上角新增跟进">
              <n-button type="primary" size="small" @click="handleAddFollowUp">新增跟进</n-button>
            </n-empty>
          </div>

          <n-timeline v-else :type="'line'" class="follow-timeline">
            <n-timeline-item
              v-for="item in followUpList"
              :key="item.id"
              :color="getNodeColor(item.nodeType)"
            >
              <template #header>
                <div class="timeline-header">
                  <div class="timeline-header-left">
                    <n-tag :color="getNodeColor(item.nodeType)" size="medium" round>
                      {{ getNodeLabel(item.nodeType) }}
                    </n-tag>
                    <span class="timeline-title">{{ item.title }}</span>
                    <n-tag v-if="item.priority === 'high'" type="error" size="small" round>高优先</n-tag>
                    <n-tag v-else-if="item.priority === 'medium'" type="warning" size="small" round>中优先</n-tag>
                  </div>
                  <div class="timeline-actions">
                    <n-button text size="small" type="primary" @click="handleEditFollowUp(item)">编辑</n-button>
                    <n-button text size="small" type="error" @click="handleDelete(item)">删除</n-button>
                  </div>
                </div>
              </template>
              <template #time>
                <div class="timeline-time">
                  <span>{{ formatDateTime(item.communicationTime) }}</span>
                  <span v-if="item.nextFollowUpTime" class="next-followup">
                    · 下次跟进：{{ formatDate(item.nextFollowUpTime) }}
                  </span>
                </div>
              </template>

              <div class="timeline-content">
                <div class="timeline-meta">
                  <n-tag size="small" :bordered="false" style="background: #f0f0f0; color: #666;">
                    {{ getTypeLabel(item.type) }}
                  </n-tag>
                  <span class="meta-text">客户：{{ getCustomerName(item.customerId) }}</span>
                  <span class="meta-text">操作人：{{ item.operator || '-' }}</span>
                </div>
                <n-collapse v-if="item.content">
                  <n-collapse-item title="查看详情" :name="item.id">
                    <div class="detail-content">{{ item.content }}</div>
                  </n-collapse-item>
                </n-collapse>
                <div v-if="item.summary" class="timeline-summary">
                  <span class="summary-label">摘要：</span>
                  <span>{{ item.summary }}</span>
                </div>
              </div>
            </n-timeline-item>
          </n-timeline>
        </n-tab-pane>

        <n-tab-pane name="note" tab="备注沉淀">
          <template #tab>
            <div class="tab-label">
              <n-icon><document-text-outline /></n-icon>
              <span>备注沉淀</span>
              <n-tag size="small" type="info" round style="margin-left: 6px;">
                {{ noteList.length }}
              </n-tag>
            </div>
          </template>

          <div class="note-category-filter">
            <n-space>
              <n-tag
                v-for="opt in noteCategoryOptions"
                :key="opt.value"
                :bordered="filterNoteCategory === opt.value"
                :color="filterNoteCategory === opt.value ? opt.color : '#f5f5f5'"
                :style="{ 
                  color: filterNoteCategory === opt.value ? '#fff' : opt.color,
                  cursor: 'pointer',
                  padding: '4px 12px'
                }"
                round
                @click="filterNoteCategory = filterNoteCategory === opt.value ? '' : opt.value"
              >
                {{ opt.label }}
                <span style="margin-left: 4px; opacity: 0.8;">
                  ({{ getNoteCountByCategory(opt.value) }})
                </span>
              </n-tag>
            </n-space>
          </div>

          <div v-if="noteListFiltered.length === 0" class="empty-state">
            <n-empty description="暂无备注记录，点击右上角新增备注">
              <n-button type="primary" size="small" @click="handleAddNote">新增备注</n-button>
            </n-empty>
          </div>

          <div v-else class="note-grid">
            <n-card
              v-for="item in noteListFiltered"
              :key="item.id"
              class="note-card"
              size="small"
              hoverable
            >
              <template #header>
                <div class="note-card-header">
                  <div class="note-title-wrap">
                    <n-tag :color="getNoteCategoryColor(item.noteCategory)" size="small" round>
                      {{ getNoteCategoryLabel(item.noteCategory) }}
                    </n-tag>
                    <span class="note-title">{{ item.title }}</span>
                  </div>
                  <n-dropdown
                    :options="noteActionOptions"
                    @select="(val) => handleNoteAction(val, item)"
                    trigger="click"
                  >
                    <n-button text size="small"><n-icon><ellipsis-horizontal /></n-icon></n-button>
                  </n-dropdown>
                </div>
              </template>

              <div class="note-body">{{ item.content }}</div>

              <div class="note-footer">
                <div class="note-meta">
                  <span>客户：{{ getCustomerName(item.customerId) }}</span>
                  <span>· {{ formatDateTime(item.updatedAt) }}</span>
                </div>
                <div class="note-operator">
                  <n-icon size="14"><person-circle-outline /></n-icon>
                  <span>{{ item.operator || '-' }}</span>
                </div>
              </div>
            </n-card>
          </div>
        </n-tab-pane>

        <n-tab-pane name="transfer" tab="转单追踪">
          <template #tab>
            <div class="tab-label">
              <n-icon><git-compare-outline /></n-icon>
              <span>转单追踪</span>
              <n-tag size="small" type="warning" round style="margin-left: 6px;">
                {{ transferList.length }}
              </n-tag>
            </div>
          </template>

          <div class="transfer-status-filter">
            <n-space>
              <n-tag
                v-for="opt in transferStatusOptions"
                :key="opt.value"
                :bordered="filterTransferStatus === opt.value"
                :color="filterTransferStatus === opt.value ? opt.color : '#f5f5f5'"
                :style="{ 
                  color: filterTransferStatus === opt.value ? '#fff' : opt.color,
                  cursor: 'pointer',
                  padding: '4px 12px'
                }"
                round
                @click="filterTransferStatus = filterTransferStatus === opt.value ? '' : opt.value"
              >
                {{ opt.label }}
                <span style="margin-left: 4px; opacity: 0.8;">
                  ({{ getTransferCountByStatus(opt.value) }})
                </span>
              </n-tag>
            </n-space>
          </div>

          <n-data-table
            :columns="transferColumns"
            :data="transferListFiltered"
            :bordered="false"
            size="medium"
            striped
            style="margin-top: 16px;"
          >
            <template #status="{ row }">
              <n-tag :type="getTransferTagType(row.transferStatus)" round>
                {{ getTransferStatusLabel(row.transferStatus) }}
              </n-tag>
            </template>
            <template #priority="{ row }">
              <n-tag v-if="row.priority === 'high'" type="error" size="small" round>高</n-tag>
              <n-tag v-else-if="row.priority === 'medium'" type="warning" size="small" round>中</n-tag>
              <n-tag v-else type="success" size="small" round>低</n-tag>
            </template>
            <template #actions="{ row }">
              <n-button text size="small" type="primary" style="margin-right: 8px;" @click="handleViewTransferDetail(row)">
                详情
              </n-button>
              <n-button
                v-if="row.transferStatus === 'pending' || row.transferStatus === 'processing'"
                text
                size="small"
                type="info"
                style="margin-right: 8px;"
                @click="handleUpdateTransferStatus(row)"
              >
                更新状态
              </n-button>
              <n-button text size="small" type="error" @click="handleDelete(row)">
                删除
              </n-button>
            </template>
          </n-data-table>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <n-modal
      v-model:show="showFollowUpModal"
      preset="card"
      :title="isEditFollowUp ? '编辑跟进记录' : '新增跟进记录'"
      style="width: 620px;"
      @after-leave="resetFollowUpForm"
    >
      <n-form
        ref="followUpFormRef"
        :model="followUpForm"
        :rules="followUpRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="关联客户" path="customerId">
          <n-select
            v-model:value="followUpForm.customerId"
            :options="customerOptions"
            placeholder="请选择客户"
            filterable
          />
        </n-form-item>
        <n-form-item label="跟进节点" path="nodeType">
          <n-select
            v-model:value="followUpForm.nodeType"
            placeholder="请选择跟进节点"
          >
            <n-option
              v-for="opt in followUpNodeOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            >
              <div style="display: flex; align-items: center;">
                <span
                  :style="{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: opt.color,
                    marginRight: '8px'
                  }"
                />
                <span>{{ opt.label }}</span>
              </div>
            </n-option>
          </n-select>
        </n-form-item>
        <n-form-item label="沟通方式" path="type">
          <n-select
            v-model:value="followUpForm.type"
            :options="communicationTypeOptions"
            placeholder="请选择沟通方式"
          />
        </n-form-item>
        <n-form-item label="优先级" path="priority">
          <n-select
            v-model:value="followUpForm.priority"
            placeholder="请选择优先级"
          >
            <n-option
              v-for="opt in priorityOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            >
              <div style="display: flex; align-items: center;">
                <span
                  :style="{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: opt.color,
                    marginRight: '8px'
                  }"
                />
                <span>{{ opt.label }}</span>
              </div>
            </n-option>
          </n-select>
        </n-form-item>
        <n-form-item label="沟通时间" path="communicationTime">
          <n-date-picker
            v-model:value="followUpForm.communicationTime"
            type="datetime"
            placeholder="请选择沟通时间"
            style="width: 100%;"
          />
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input v-model:value="followUpForm.title" placeholder="请输入跟进标题" />
        </n-form-item>
        <n-form-item label="摘要" path="summary">
          <n-input v-model:value="followUpForm.summary" placeholder="简短摘要，便于快速浏览" />
        </n-form-item>
        <n-form-item label="详细内容" path="content">
          <n-input
            v-model:value="followUpForm.content"
            type="textarea"
            :rows="4"
            placeholder="详细记录沟通内容..."
          />
        </n-form-item>
        <n-form-item label="下次跟进" path="nextFollowUpTime">
          <n-date-picker
            v-model:value="followUpForm.nextFollowUpTime"
            type="datetime"
            placeholder="选择下次跟进时间（可选）"
            style="width: 100%;"
            clearable
          />
        </n-form-item>
        <n-form-item label="操作人" path="operator">
          <n-input v-model:value="followUpForm.operator" placeholder="请输入操作人姓名" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showFollowUpModal = false">取消</n-button>
          <n-button type="primary" @click="submitFollowUpForm">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showNoteModal"
      preset="card"
      :title="isEditNote ? '编辑备注' : '新增备注'"
      style="width: 560px;"
      @after-leave="resetNoteForm"
    >
      <n-form
        ref="noteFormRef"
        :model="noteForm"
        :rules="noteRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="关联客户" path="customerId">
          <n-select
            v-model:value="noteForm.customerId"
            :options="customerOptions"
            placeholder="请选择客户"
            filterable
          />
        </n-form-item>
        <n-form-item label="备注分类" path="noteCategory">
          <n-select
            v-model:value="noteForm.noteCategory"
            placeholder="请选择备注分类"
          >
            <n-option
              v-for="opt in noteCategoryOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            >
              <div style="display: flex; align-items: center;">
                <span
                  :style="{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: opt.color,
                    marginRight: '8px'
                  }"
                />
                <span>{{ opt.label }}</span>
              </div>
            </n-option>
          </n-select>
        </n-form-item>
        <n-form-item label="标题" path="title">
          <n-input v-model:value="noteForm.title" placeholder="请输入备注标题" />
        </n-form-item>
        <n-form-item label="备注内容" path="content">
          <n-input
            v-model:value="noteForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入备注详细内容..."
          />
        </n-form-item>
        <n-form-item label="记录人" path="operator">
          <n-input v-model:value="noteForm.operator" placeholder="请输入记录人姓名" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showNoteModal = false">取消</n-button>
          <n-button type="primary" @click="submitNoteForm">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showTransferModal"
      preset="card"
      :title="isEditTransfer ? '编辑转单' : '发起转单'"
      style="width: 600px;"
      @after-leave="resetTransferForm"
    >
      <n-form
        ref="transferFormRef"
        :model="transferForm"
        :rules="transferRules"
        label-placement="left"
        label-width="100px"
      >
        <n-form-item label="关联客户" path="customerId">
          <n-select
            v-model:value="transferForm.customerId"
            :options="customerOptions"
            placeholder="请选择客户"
            filterable
          />
        </n-form-item>
        <n-form-item label="转出人" path="transferFrom">
          <n-input v-model:value="transferForm.transferFrom" placeholder="请输入转出人姓名/部门" />
        </n-form-item>
        <n-form-item label="接收人" path="transferTo">
          <n-input v-model:value="transferForm.transferTo" placeholder="请输入接收人姓名/部门" />
        </n-form-item>
        <n-form-item label="转单原因" path="transferReason">
          <n-input
            v-model:value="transferForm.transferReason"
            type="textarea"
            :rows="3"
            placeholder="请说明转单原因..."
          />
        </n-form-item>
        <n-form-item label="处理说明" path="handlerNote">
          <n-input
            v-model:value="transferForm.handlerNote"
            type="textarea"
            :rows="2"
            placeholder="处理注意事项、特殊要求等（可选）"
          />
        </n-form-item>
        <n-form-item label="优先级" path="priority">
          <n-select
            v-model:value="transferForm.priority"
            placeholder="请选择优先级"
          >
            <n-option
              v-for="opt in priorityOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            >
              <div style="display: flex; align-items: center;">
                <span
                  :style="{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: opt.color,
                    marginRight: '8px'
                  }"
                />
                <span>{{ opt.label }}</span>
              </div>
            </n-option>
          </n-select>
        </n-form-item>
        <n-form-item label="操作人" path="operator">
          <n-input v-model:value="transferForm.operator" placeholder="请输入操作人姓名" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showTransferModal = false">取消</n-button>
          <n-button type="primary" @click="submitTransferForm">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="showTransferStatusModal"
      preset="card"
      title="更新转单状态"
      style="width: 480px;"
    >
      <n-form label-placement="left" label-width="100px">
        <n-form-item label="当前状态">
          <n-tag :type="getTransferTagType(currentTransfer?.transferStatus)" round>
            {{ getTransferStatusLabel(currentTransfer?.transferStatus) }}
          </n-tag>
        </n-form-item>
        <n-form-item label="目标状态">
          <n-select
            v-model:value="targetTransferStatus"
            :options="transferStatusActionOptions"
            placeholder="请选择目标状态"
          />
        </n-form-item>
        <n-form-item label="处理备注">
          <n-input
            v-model:value="transferHandlerNote"
            type="textarea"
            :rows="3"
            placeholder="请输入处理说明..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="text-align: right;">
          <n-button style="margin-right: 12px;" @click="showTransferStatusModal = false">取消</n-button>
          <n-button type="primary" @click="confirmUpdateTransferStatus">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer
      v-model:show="showTransferDetailDrawer"
      :width="520"
      placement="right"
    >
      <n-drawer-content title="转单详情" :native-scrollbar="false">
        <div v-if="currentTransfer" class="transfer-detail">
          <n-descriptions :column="1" bordered size="small">
            <n-descriptions-item label="关联客户">
              {{ getCustomerName(currentTransfer.customerId) }}
            </n-descriptions-item>
            <n-descriptions-item label="转出人">
              {{ currentTransfer.transferFrom }}
            </n-descriptions-item>
            <n-descriptions-item label="接收人">
              {{ currentTransfer.transferTo }}
            </n-descriptions-item>
            <n-descriptions-item label="当前状态">
              <n-tag :type="getTransferTagType(currentTransfer.transferStatus)" round>
                {{ getTransferStatusLabel(currentTransfer.transferStatus) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="优先级">
              <n-tag v-if="currentTransfer.priority === 'high'" type="error" round>高优先级</n-tag>
              <n-tag v-else-if="currentTransfer.priority === 'medium'" type="warning" round>中优先级</n-tag>
              <n-tag v-else type="success" round>低优先级</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="操作人">
              {{ currentTransfer.operator || '-' }}
            </n-descriptions-item>
            <n-descriptions-item label="发起时间">
              {{ formatDateTime(currentTransfer.createdAt) }}
            </n-descriptions-item>
            <n-descriptions-item label="转单原因">
              {{ currentTransfer.transferReason }}
            </n-descriptions-item>
            <n-descriptions-item v-if="currentTransfer.handlerNote" label="处理说明">
              {{ currentTransfer.handlerNote }}
            </n-descriptions-item>
          </n-descriptions>

          <div v-if="currentTransfer.statusLogs?.length" class="status-timeline">
            <h4 class="section-title">状态流转记录</h4>
            <n-timeline>
              <n-timeline-item
                v-for="(log, idx) in currentTransfer.statusLogs"
                :key="log.id"
                :type="idx === currentTransfer.statusLogs.length - 1 ? 'success' : 'default'"
              >
                <template #header>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <n-tag :type="getTransferTagType(log.fromStatus)" size="small">
                      {{ getTransferStatusLabel(log.fromStatus) }}
                    </n-tag>
                    <n-icon><arrow-forward-outline /></n-icon>
                    <n-tag :type="getTransferTagType(log.toStatus)" size="small">
                      {{ getTransferStatusLabel(log.toStatus) }}
                    </n-tag>
                  </div>
                </template>
                <template #time>{{ formatDateTime(log.operatedAt) }}</template>
                <div v-if="log.handlerNote" style="color: #666; margin-top: 4px;">
                  {{ log.handlerNote }}
                </div>
              </n-timeline-item>
            </n-timeline>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { create, useMessage, useDialog } from 'naive-ui'
import dayjs from 'dayjs'
import {
  ChatbubblesOutline,
  DocumentTextOutline,
  GitCompareOutline,
  TodayOutline,
  SearchOutline,
  AddOutline,
  EllipsisHorizontal,
  PersonCircleOutline,
  ArrowForwardOutline
} from '@vicons/ionicons5'
import { useCommunicationStore, communicationTypeOptions, followUpNodeOptions, noteCategoryOptions, transferStatusOptions, priorityOptions } from '@/stores/communication'
import { useCustomerStore } from '@/stores/customer'

const message = useMessage()
const dialog = useDialog()

const communicationStore = useCommunicationStore()
const customerStore = useCustomerStore()

const activeTab = ref('follow_up')

const filterCustomerId = ref('')
const filterKeyword = ref('')
const filterNoteCategory = ref('')
const filterTransferStatus = ref('')

const customerOptions = computed(() => 
  customerStore.customers.map(c => ({ label: c.name, value: c.id }))
)

const followUpList = computed(() => 
  communicationStore.getFilteredCommunications({
    category: 'follow_up',
    customerId: filterCustomerId.value || undefined,
    keyword: filterKeyword.value || undefined
  })
)

const noteList = computed(() =>
  communicationStore.getFilteredCommunications({
    category: 'note',
    customerId: filterCustomerId.value || undefined,
    keyword: filterKeyword.value || undefined
  })
)

const noteListFiltered = computed(() =>
  filterNoteCategory.value
    ? noteList.value.filter(n => n.noteCategory === filterNoteCategory.value)
    : noteList.value
)

const transferList = computed(() =>
  communicationStore.getFilteredCommunications({
    category: 'transfer',
    customerId: filterCustomerId.value || undefined,
    keyword: filterKeyword.value || undefined
  })
)

const transferListFiltered = computed(() =>
  filterTransferStatus.value
    ? transferList.value.filter(t => t.transferStatus === filterTransferStatus.value)
    : transferList.value
)

const transferColumns = [
  { title: '客户', key: 'customerId', render: (row) => getCustomerName(row.customerId) },
  { title: '转出 → 接收', key: 'transfer', render: (row) => `${row.transferFrom} → ${row.transferTo}` },
  { title: '转单原因', key: 'transferReason', ellipsis: { tooltip: true } },
  { title: '优先级', key: 'priority', width: 90 },
  { title: '状态', key: 'status', width: 110 },
  { title: '发起时间', key: 'createdAt', width: 170, render: (row) => formatDateTime(row.createdAt) },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

const noteActionOptions = [
  { label: '编辑', key: 'edit', icon: () => h('span', '✏️') },
  { label: '删除', key: 'delete', icon: () => h('span', '🗑️'), props: { style: 'color: #f5222d' } }
]

function getNoteCountByCategory(category) {
  return noteList.value.filter(n => n.noteCategory === category).length
}

function getTransferCountByStatus(status) {
  return transferList.value.filter(t => t.transferStatus === status).length
}

function getCustomerName(customerId) {
  const customer = customerStore.getCustomerById(customerId)
  return customer ? customer.name : '未知客户'
}

function getNodeLabel(node) {
  return followUpNodeOptions.find(o => o.value === node)?.label || node
}
function getNodeColor(node) {
  return followUpNodeOptions.find(o => o.value === node)?.color || '#8c8c8c'
}
function getTypeLabel(type) {
  return communicationTypeOptions.find(o => o.value === type)?.label || type
}
function getNoteCategoryLabel(cat) {
  return noteCategoryOptions.find(o => o.value === cat)?.label || cat
}
function getNoteCategoryColor(cat) {
  return noteCategoryOptions.find(o => o.value === cat)?.color || '#8c8c8c'
}
function getTransferStatusLabel(status) {
  return transferStatusOptions.find(o => o.value === status)?.label || status
}
function getTransferTagType(status) {
  return transferStatusOptions.find(o => o.value === status)?.type || 'default'
}

const transferStatusActionOptions = computed(() => {
  const current = currentTransfer.value?.transferStatus
  if (current === 'pending') {
    return transferStatusOptions.filter(o => ['processing', 'cancelled'].includes(o.value))
  }
  if (current === 'processing') {
    return transferStatusOptions.filter(o => ['completed', 'cancelled'].includes(o.value))
  }
  return transferStatusOptions
})

function formatDateTime(iso) {
  if (!iso) return '-'
  return dayjs(iso).format('YYYY-MM-DD HH:mm')
}
function formatDate(iso) {
  if (!iso) return '-'
  return dayjs(iso).format('YYYY-MM-DD')
}

const showFollowUpModal = ref(false)
const isEditFollowUp = ref(false)
const editingFollowUpId = ref('')
const followUpFormRef = ref(null)
const followUpForm = ref({
  customerId: '',
  nodeType: 'initial_contact',
  type: 'wechat',
  priority: 'medium',
  communicationTime: Date.now(),
  title: '',
  summary: '',
  content: '',
  nextFollowUpTime: null,
  operator: ''
})
const followUpRules = {
  customerId: { required: true, message: '请选择客户', trigger: 'change' },
  nodeType: { required: true, message: '请选择跟进节点', trigger: 'change' },
  type: { required: true, message: '请选择沟通方式', trigger: 'change' },
  communicationTime: { required: true, message: '请选择沟通时间', trigger: 'change' },
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  content: { required: true, message: '请输入详细内容', trigger: 'blur' }
}

function handleAddFollowUp() {
  isEditFollowUp.value = false
  editingFollowUpId.value = ''
  showFollowUpModal.value = true
}
function handleEditFollowUp(item) {
  isEditFollowUp.value = true
  editingFollowUpId.value = item.id
  followUpForm.value = {
    customerId: item.customerId,
    nodeType: item.nodeType,
    type: item.type,
    priority: item.priority || 'medium',
    communicationTime: item.communicationTime ? dayjs(item.communicationTime).valueOf() : Date.now(),
    title: item.title || '',
    summary: item.summary || '',
    content: item.content || '',
    nextFollowUpTime: item.nextFollowUpTime ? dayjs(item.nextFollowUpTime).valueOf() : null,
    operator: item.operator || ''
  }
  showFollowUpModal.value = true
}
function resetFollowUpForm() {
  followUpForm.value = {
    customerId: '',
    nodeType: 'initial_contact',
    type: 'wechat',
    priority: 'medium',
    communicationTime: Date.now(),
    title: '',
    summary: '',
    content: '',
    nextFollowUpTime: null,
    operator: ''
  }
  isEditFollowUp.value = false
  editingFollowUpId.value = ''
}
async function submitFollowUpForm() {
  try {
    await followUpFormRef.value?.validate()
    const data = {
      ...followUpForm.value,
      communicationTime: followUpForm.value.communicationTime
        ? dayjs(followUpForm.value.communicationTime).toISOString()
        : new Date().toISOString(),
      nextFollowUpTime: followUpForm.value.nextFollowUpTime
        ? dayjs(followUpForm.value.nextFollowUpTime).toISOString()
        : null
    }
    if (isEditFollowUp.value) {
      communicationStore.updateCommunication(editingFollowUpId.value, data)
      message.success('跟进记录更新成功')
    } else {
      communicationStore.addFollowUpRecord(data)
      message.success('跟进记录添加成功')
    }
    showFollowUpModal.value = false
  } catch (e) {
    message.error('请完善表单信息')
  }
}

const showNoteModal = ref(false)
const isEditNote = ref(false)
const editingNoteId = ref('')
const noteFormRef = ref(null)
const noteForm = ref({
  customerId: '',
  noteCategory: 'demand',
  title: '',
  content: '',
  operator: ''
})
const noteRules = {
  customerId: { required: true, message: '请选择客户', trigger: 'change' },
  noteCategory: { required: true, message: '请选择备注分类', trigger: 'change' },
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  content: { required: true, message: '请输入备注内容', trigger: 'blur' }
}

function handleAddNote() {
  isEditNote.value = false
  editingNoteId.value = ''
  showNoteModal.value = true
}
function handleEditNote(item) {
  isEditNote.value = true
  editingNoteId.value = item.id
  noteForm.value = {
    customerId: item.customerId,
    noteCategory: item.noteCategory,
    title: item.title || '',
    content: item.content || '',
    operator: item.operator || ''
  }
  showNoteModal.value = true
}
function resetNoteForm() {
  noteForm.value = {
    customerId: '',
    noteCategory: 'demand',
    title: '',
    content: '',
    operator: ''
  }
  isEditNote.value = false
  editingNoteId.value = ''
}
async function submitNoteForm() {
  try {
    await noteFormRef.value?.validate()
    if (isEditNote.value) {
      communicationStore.updateCommunication(editingNoteId.value, noteForm.value)
      message.success('备注更新成功')
    } else {
      communicationStore.addNoteRecord(noteForm.value)
      message.success('备注添加成功')
    }
    showNoteModal.value = false
  } catch (e) {
    message.error('请完善表单信息')
  }
}
function handleNoteAction(val, item) {
  if (val === 'edit') handleEditNote(item)
  if (val === 'delete') handleDelete(item)
}

const showTransferModal = ref(false)
const isEditTransfer = ref(false)
const editingTransferId = ref('')
const transferFormRef = ref(null)
const transferForm = ref({
  customerId: '',
  transferFrom: '',
  transferTo: '',
  transferReason: '',
  handlerNote: '',
  priority: 'medium',
  operator: ''
})
const transferRules = {
  customerId: { required: true, message: '请选择客户', trigger: 'change' },
  transferFrom: { required: true, message: '请输入转出人', trigger: 'blur' },
  transferTo: { required: true, message: '请输入接收人', trigger: 'blur' },
  transferReason: { required: true, message: '请输入转单原因', trigger: 'blur' }
}

function handleAddTransfer() {
  isEditTransfer.value = false
  editingTransferId.value = ''
  showTransferModal.value = true
}
function resetTransferForm() {
  transferForm.value = {
    customerId: '',
    transferFrom: '',
    transferTo: '',
    transferReason: '',
    handlerNote: '',
    priority: 'medium',
    operator: ''
  }
  isEditTransfer.value = false
  editingTransferId.value = ''
}
async function submitTransferForm() {
  try {
    await transferFormRef.value?.validate()
    if (isEditTransfer.value) {
      communicationStore.updateCommunication(editingTransferId.value, transferForm.value)
      message.success('转单更新成功')
    } else {
      communicationStore.addTransferRecord(transferForm.value)
      message.success('转单发起成功')
    }
    showTransferModal.value = false
  } catch (e) {
    message.error('请完善表单信息')
  }
}

const showTransferStatusModal = ref(false)
const showTransferDetailDrawer = ref(false)
const currentTransfer = ref(null)
const targetTransferStatus = ref('')
const transferHandlerNote = ref('')

function handleViewTransferDetail(row) {
  currentTransfer.value = row
  showTransferDetailDrawer.value = true
}
function handleUpdateTransferStatus(row) {
  currentTransfer.value = row
  targetTransferStatus.value = ''
  transferHandlerNote.value = ''
  showTransferStatusModal.value = true
}
function confirmUpdateTransferStatus() {
  if (!targetTransferStatus.value) {
    message.warning('请选择目标状态')
    return
  }
  communicationStore.updateTransferStatus(
    currentTransfer.value.id,
    targetTransferStatus.value,
    transferHandlerNote.value
  )
  message.success('转单状态已更新')
  showTransferStatusModal.value = false
}

function handleDelete(item) {
  dialog.warning({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条记录吗？',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      if (communicationStore.deleteCommunication(item.id)) {
        message.success('删除成功')
      }
    }
  })
}

onMounted(() => {
  communicationStore.fetchCommunications()
  customerStore.fetchCustomers()
})
</script>

<style scoped>
.communications-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1f1f1f;
}

.page-subtitle {
  color: #8c8c8c;
  font-size: 13px;
  margin: 0;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f1f1f;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-top: 2px;
}

.main-card {
  padding: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-left, .filter-right {
  display: flex;
  align-items: center;
}

.comm-tabs {
  padding: 0 20px 20px 20px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.empty-state {
  padding: 60px 0;
}

.follow-timeline {
  padding: 8px 0 16px 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 12px;
}

.timeline-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.timeline-title {
  font-weight: 600;
  font-size: 15px;
  color: #1f1f1f;
}

.timeline-time {
  font-size: 12px;
  color: #8c8c8c;
}

.next-followup {
  color: #1677ff;
  margin-left: 8px;
}

.timeline-content {
  padding: 8px 12px 8px 0;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.meta-text {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #444;
  padding: 8px 0;
  font-size: 13px;
}

.timeline-summary {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fffbe6;
  border-radius: 6px;
  font-size: 13px;
  color: #614700;
  line-height: 1.6;
}

.summary-label {
  font-weight: 600;
}

.note-category-filter, .transfer-status-filter {
  padding: 16px 4px 8px 4px;
}

.note-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 8px 0 16px 0;
}

.note-card {
  transition: all 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.note-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.note-title {
  font-weight: 600;
  font-size: 14px;
  color: #1f1f1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-body {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #444;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 88px;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.note-meta {
  font-size: 12px;
  color: #8c8c8c;
}

.note-operator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 24px 0 12px 0;
  padding-left: 8px;
  border-left: 3px solid #D4A574;
}

.status-timeline {
  margin-top: 20px;
}

.transfer-detail .n-descriptions {
  margin-top: 8px;
}

@media (max-width: 1200px) {
  .note-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .note-grid {
    grid-template-columns: 1fr;
  }
  .stat-cards {
    grid-template-columns: 1fr;
  }
  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
