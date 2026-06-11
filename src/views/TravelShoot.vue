<template>
  <div class="travel-shoot-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">异地旅拍项目</h2>
        <p class="page-subtitle">
          进行中项目：<span class="highlight">{{ travelShootStore.activeProjects.length }}</span> 个
          &nbsp;|&nbsp;
          总毛利润：<span class="highlight-success">¥{{ overallStats.grossProfit.toLocaleString() }}</span>
        </p>
      </div>
      <n-button type="primary" @click="openProjectModal">
        <template #icon><AddOutline /></template>新建旅拍项目
      </n-button>
    </div>

    <div class="stats-cards">
      <n-card class="stat-card">
        <div class="stat-title">项目总数</div>
        <div class="stat-value">{{ travelShootStore.projectCount }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">总营收</div>
        <div class="stat-value info">¥{{ overallStats.totalRevenue.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">总成本</div>
        <div class="stat-value warning">¥{{ overallStats.totalCost.toLocaleString() }}</div>
      </n-card>
      <n-card class="stat-card">
        <div class="stat-title">总毛利润</div>
        <div class="stat-value" :class="overallStats.grossProfit >= 0 ? 'success' : 'error'">
          ¥{{ overallStats.grossProfit.toLocaleString() }}
          <span class="stat-rate">({{ overallStats.grossProfitRate }}%)</span>
        </div>
      </n-card>
    </div>

    <n-card style="margin-top: 20px;">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;">旅拍项目列表</span>
          <div style="display:flex;gap:12px;">
            <n-select v-model:value="filterStatus" placeholder="状态筛选" :options="statusOptions" style="width:140px;" clearable />
            <n-select v-model:value="filterDestination" placeholder="目的地筛选" :options="destinationOptions" style="width:140px;" clearable filterable />
          </div>
        </div>
      </template>
      <n-data-table :columns="projectColumns" :data="filteredProjects" :pagination="{pageSize:8,showSizePicker:false}" :bordered="false" size="medium">
        <template #status="{ row }"><n-tag :type="getTravelShootStatus(row.status)?.color" size="small">{{ getTravelShootStatus(row.status)?.label }}</n-tag></template>
        <template #destination="{ row }"><div><div style="font-weight:500;">{{ row.destination?.name }}</div><div style="font-size:12px;color:#999;">{{ row.destination?.province }}</div></div></template>
        <template #travelDates="{ row }"><div style="font-size:13px;"><div>出发：{{ row.travelDates?.departDate }}</div><div>返程：{{ row.travelDates?.returnDate }}</div></div></template>
        <template #budget="{ row }"><div><n-progress type="line" :percentage="Math.min(getBudgetUtil(row.id).total, 100)" :indicator-placement="'inside'" :status="getBudgetUtil(row.id).isOverBudget ? 'error' : (getBudgetUtil(row.id).total > 85 ? 'warning' : 'success')" style="width:100px;" /><div style="font-size:12px;margin-top:4px;color:#666;">¥{{ getBudgetUtil(row.id).totalUsed.toLocaleString() }} / ¥{{ getBudgetUtil(row.id).totalBudget.toLocaleString() }}</div></div></template>
        <template #profit="{ row }"><div><div :style="{color:getProfit(row.id).grossProfit>=0?'#18a058':'#d03050',fontWeight:600}">{{ getProfit(row.id).grossProfit>=0?'+':'' }}¥{{ getProfit(row.id).grossProfit.toLocaleString() }}</div><div style="font-size:12px;color:#999;">利润率：{{ getProfit(row.id).grossProfitRate }}%</div></div></template>
        <template #actions="{ row }"><n-space><n-button text size="small" type="primary" @click="viewProjectDetail(row)">详情</n-button><n-button text size="small" @click="openProjectModal(row)">编辑</n-button><n-button text size="small" type="error" @click="handleDeleteProject(row)">删除</n-button></n-space></template>
      </n-data-table>
    </n-card>

    <n-card v-if="selectedProject" style="margin-top:20px;">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:600;font-size:16px;">项目详情：{{ selectedProject.name }}</span>
          <n-button text @click="selectedProject = null">关闭详情</n-button>
        </div>
      </template>
      <n-tabs type="line" animated>
        <n-tab-pane name="overview" tab="📊 项目概览与利润">
          <div class="detail-section">
            <div class="detail-grid">
              <div class="detail-item"><span class="detail-label">客户</span><span class="detail-value">{{ getCustomerName(selectedProject.customerId) }}</span></div>
              <div class="detail-item"><span class="detail-label">拍摄天数</span><span class="detail-value">{{ selectedProject.shootDays }} 天</span></div>
              <div class="detail-item"><span class="detail-label">参与人员</span><span class="detail-value">{{ selectedProject.totalStaffCount }} 人</span></div>
              <div class="detail-item"><span class="detail-label">关联订单</span><span class="detail-value">{{ selectedProject.orderId || '未关联' }}</span></div>
            </div>
            <div class="profit-section">
              <h4 class="section-title">💰 财务概览</h4>
              <div class="finance-grid">
                <div class="finance-card revenue"><div class="finance-label">套餐收入</div><div class="finance-amount">¥{{ profitDetail.revenue.toLocaleString() }}</div><div class="finance-sub">已收：¥{{ profitDetail.paidRevenue.toLocaleString() }} / 待收：¥{{ profitDetail.unpaidRevenue.toLocaleString() }}</div></div>
                <div class="finance-card cost"><div class="finance-label">项目总成本</div><div class="finance-amount">¥{{ profitDetail.totalCost.toLocaleString() }}</div><div class="cost-breakdown-mini"><span>交通 ¥{{ profitDetail.transportCost.toLocaleString() }}</span><span>住宿 ¥{{ profitDetail.accommodationCost.toLocaleString() }}</span><span>人员 ¥{{ profitDetail.staffCost.toLocaleString() }}</span><span>其他 ¥{{ profitDetail.extraCost.toLocaleString() }}</span></div></div>
                <div class="finance-card" :class="profitDetail.grossProfit >= 0 ? 'profit' : 'loss'"><div class="finance-label">毛利润</div><div class="finance-amount">{{ profitDetail.grossProfit >= 0 ? '+' : '' }}¥{{ profitDetail.grossProfit.toLocaleString() }}</div><div class="finance-sub">利润率：{{ profitDetail.grossProfitRate }}%</div></div>
              </div>
              <h4 class="section-title" style="margin-top:24px;">📈 预算使用情况</h4>
              <div class="budget-bars">
                <div class="budget-bar-item"><div class="budget-bar-label"><span>交通</span><span>¥{{ budgetUtil.transportUsed.toLocaleString() }} / ¥{{ budgetUtil.transportBudget.toLocaleString() }}</span></div><n-progress type="line" :percentage="Math.min(budgetUtil.transport, 100)" :status="budgetUtil.transport > 100 ? 'error' : 'info'" /></div>
                <div class="budget-bar-item"><div class="budget-bar-label"><span>住宿</span><span>¥{{ budgetUtil.accommodationUsed.toLocaleString() }} / ¥{{ budgetUtil.accommodationBudget.toLocaleString() }}</span></div><n-progress type="line" :percentage="Math.min(budgetUtil.accommodation, 100)" :status="budgetUtil.accommodation > 100 ? 'error' : 'warning'" /></div>
                <div class="budget-bar-item"><div class="budget-bar-label"><span>人员补贴</span><span>¥{{ budgetUtil.staff.toLocaleString() }}</span></div><n-progress type="line" :percentage="50" status="default" /></div>
                <div class="budget-bar-item"><div class="budget-bar-label"><span>额外成本</span><span>¥{{ budgetUtil.extraUsed.toLocaleString() }} / ¥{{ budgetUtil.extraBudget.toLocaleString() }}</span></div><n-progress type="line" :percentage="Math.min(budgetUtil.extra, 100)" :status="budgetUtil.extra > 100 ? 'error' : 'default'" /></div>
                <div class="budget-bar-item"><div class="budget-bar-label"><span style="font-weight:600;">总预算</span><span style="font-weight:600;">¥{{ budgetUtil.totalUsed.toLocaleString() }} / ¥{{ budgetUtil.totalBudget.toLocaleString() }}</span></div><n-progress type="line" :percentage="Math.min(budgetUtil.total, 100)" :status="budgetUtil.isOverBudget ? 'error' : 'success'" /></div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="transport" :tab="'✈️ 交通住宿 (' + projectTransports.length + '+' + projectAccommodations.length + ')'">
          <div class="detail-section">
            <div class="section-header"><h4 class="section-title">🚗 交通安排</h4><n-button size="small" type="primary" @click="openTransportModal"><template #icon><AddOutline /></template>添加交通</n-button></div>
            <n-data-table v-if="projectTransports.length>0" :columns="transportColumns" :data="projectTransports" :bordered="false" size="small">
              <template #type="{ row }"><n-tag :type="getTransportType(row.type)?.color" size="small">{{ getTransportType(row.type)?.label }}</n-tag></template>
              <template #route="{ row }"><div><div style="font-size:13px;">{{ row.departFrom }} → {{ row.arriveTo }}</div><div style="font-size:11px;color:#999;">{{ row.flightNo || row.line || row.carType || '' }}</div></div></template>
              <template #time="{ row }"><div style="font-size:12px;"><div>{{ row.departDateTime }}</div><div v-if="row.arriveDateTime" style="color:#999;">{{ row.arriveDateTime }}</div></div></template>
              <template #bookingStatus="{ row }"><n-tag :type="row.bookingStatus==='confirmed'?'success':'warning'" size="small">{{ row.bookingStatus==='confirmed'?'已订':'待订' }}</n-tag></template>
              <template #actions="{ row }"><n-space><n-button text size="tiny" @click="openTransportModal(row)">编辑</n-button><n-button text size="tiny" type="error" @click="handleDeleteTransport(row)">删除</n-button></n-space></template>
            </n-data-table>
            <n-empty v-else description="暂无交通安排" />

            <div class="section-header" style="margin-top:24px;"><h4 class="section-title">🏨 住宿安排</h4><n-button size="small" type="primary" @click="openAccommodationModal"><template #icon><AddOutline /></template>添加住宿</n-button></div>
            <n-data-table v-if="projectAccommodations.length>0" :columns="accommodationColumns" :data="projectAccommodations" :bordered="false" size="small">
              <template #type="{ row }"><n-tag :type="getAccommodationType(row.type)?.color" size="small">{{ getAccommodationType(row.type)?.label }}</n-tag></template>
              <template #hotelInfo="{ row }"><div><div style="font-weight:500;">{{ row.hotelName }}</div><div style="font-size:12px;color:#999;">{{ row.address }}</div></div></template>
              <template #stayInfo="{ row }"><div style="font-size:12px;"><div>{{ row.checkIn }} → {{ row.checkOut }}</div><div style="color:#999;">{{ row.roomCount }}间 × {{ row.nights }}晚</div></div></template>
              <template #bookingStatus="{ row }"><n-tag :type="row.bookingStatus==='confirmed'?'success':'warning'" size="small">{{ row.bookingStatus==='confirmed'?'已订':'待订' }}</n-tag></template>
              <template #actions="{ row }"><n-space><n-button text size="tiny" @click="openAccommodationModal(row)">编辑</n-button><n-button text size="tiny" type="error" @click="handleDeleteAccommodation(row)">删除</n-button></n-space></template>
            </n-data-table>
            <n-empty v-else description="暂无住宿安排" />
          </div>
        </n-tab-pane>

        <n-tab-pane name="staff" :tab="'👥 人员排班 (' + projectStaffAssignments.length + ')'">
          <div class="detail-section">
            <div class="section-header">
              <h4 class="section-title">👤 出行人员与排班</h4>
              <div style="display:flex;gap:8px;">
                <n-button size="small" @click="handleSyncToSchedule"><template #icon><SyncOutline /></template>同步到拍摄排班</n-button>
                <n-button size="small" type="primary" @click="openStaffModal"><template #icon><AddOutline /></template>添加人员</n-button>
              </div>
            </div>
            <div v-if="travelDaysCount>0" class="allowance-info"><n-alert type="info" show-icon>行程天数：{{ travelDaysCount }} 天 | 人员补贴总计：<strong>¥{{ staffAllowanceTotal.toLocaleString() }}</strong></n-alert></div>
            <n-data-table v-if="projectStaffAssignments.length>0" :columns="staffColumns" :data="projectStaffAssignments" :bordered="false" size="small">
              <template #staffInfo="{ row }"><div><div style="font-weight:500;">{{ getStaffName(row.staffId) }}</div><div style="font-size:12px;color:#999;">{{ getStaffPhone(row.staffId) }}</div></div></template>
              <template #role="{ row }"><n-tag :type="getAssignmentRole(row.role)?.color" size="small">{{ getAssignmentRole(row.role)?.label }}</n-tag></template>
              <template #allowance="{ row }"><div style="font-size:12px;"><div>出差：¥{{ row.dailyAllowance }}/天 × {{ row.travelDays }}天 = ¥{{ (row.dailyAllowance*row.travelDays).toLocaleString() }}</div><div style="color:#666;">餐饮：¥{{ row.mealAllowance*row.travelDays }} | 市内：¥{{ row.transportAllowance*row.travelDays }}</div></div></template>
              <template #totalAllowance="{ row }"><span style="font-weight:600;color:#2080f0;">¥{{ row.totalAllowance.toLocaleString() }}</span></template>
              <template #conflict="{ row }"><n-tag v-if="hasConflict(row.staffId)" type="error" size="small">行程冲突</n-tag><span v-else style="color:#18a058;">✓ 无冲突</span></template>
              <template #actions="{ row }"><n-space><n-button text size="tiny" @click="openStaffModal(row)">编辑</n-button><n-button text size="tiny" type="error" @click="handleDeleteStaff(row)">删除</n-button></n-space></template>
            </n-data-table>
            <n-empty v-else description="暂无人员安排" />
          </div>
        </n-tab-pane>

        <n-tab-pane name="extraCost" :tab="'💸 额外成本 (' + projectExtraCosts.length + ')'">
          <div class="detail-section">
            <div class="section-header"><h4 class="section-title">📋 额外成本明细</h4><n-button size="small" type="primary" @click="openExtraCostModal"><template #icon><AddOutline /></template>添加成本</n-button></div>
            <n-data-table v-if="projectExtraCosts.length>0" :columns="extraCostColumns" :data="projectExtraCosts" :bordered="false" size="small">
              <template #category="{ row }"><n-tag :type="getExtraCostCategory(row.category)?.color" size="small">{{ getExtraCostCategory(row.category)?.label }}</n-tag></template>
              <template #paymentStatus="{ row }"><n-tag :type="row.paymentStatus==='paid'?'success':'warning'" size="small">{{ row.paymentStatus==='paid'?'已支付':'待支付' }}</n-tag></template>
              <template #actions="{ row }"><n-space><n-button text size="tiny" @click="openExtraCostModal(row)">编辑</n-button><n-button text size="tiny" type="error" @click="handleDeleteExtraCost(row)">删除</n-button></n-space></template>
            </n-data-table>
            <n-empty v-else description="暂无额外成本记录" />
            <div v-if="projectExtraCosts.length>0" style="margin-top:16px;">
              <div class="category-summary">
                <div v-for="(value, key) in extraCostByCategory" :key="key" class="category-item"><n-tag :type="getExtraCostCategory(key)?.color">{{ getExtraCostCategory(key)?.label }}</n-tag><span style="margin-left:8px;font-weight:500;">¥{{ value.toLocaleString() }}</span></div>
                <div class="category-item total"><span style="font-weight:600;">合计</span><span style="font-weight:600;color:#d03050;">¥{{ extraCostTotal.toLocaleString() }}</span></div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <n-modal v-model:show="showProjectModal" preset="card" :title="isProjectEdit?'编辑旅拍项目':'新建旅拍项目'" style="width:640px;" @after-leave="resetProjectForm">
      <n-form ref="projectFormRef" :model="projectForm" :rules="projectRules" label-placement="left" label-width="100px">
        <n-form-item label="项目名称" path="name"><n-input v-model:value="projectForm.name" placeholder="请输入项目名称" /></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="关联订单" path="orderId"><n-select v-model:value="projectForm.orderId" placeholder="选择关联订单" :options="orderSelectOptions" filterable clearable @update:value="handleOrderSelect" /></n-form-item>
          <n-form-item label="关联客户" path="customerId"><n-select v-model:value="projectForm.customerId" placeholder="选择客户" :options="customerSelectOptions" filterable clearable /></n-form-item>
        </n-grid>
        <n-form-item label="目的地" path="destination.id"><n-select v-model:value="selectedDestId" placeholder="选择目的地" :options="destinationSelectOptions" filterable @update:value="handleDestinationSelect" /></n-form-item>
        <n-form-item label="详细地址" path="destination.detailAddress"><n-input v-model:value="projectForm.destination.detailAddress" placeholder="请输入详细拍摄地址" /></n-form-item>
        <n-form-item label="行程时间"><n-date-picker v-model:value="travelDateRange" type="daterange" style="width:100%;" @update:value="handleTravelDateChange" /></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="拍摄开始" path="travelDates.shootStartDate"><n-date-picker v-model:value="projectForm.travelDates.shootStartDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" /></n-form-item>
          <n-form-item label="拍摄结束" path="travelDates.shootEndDate"><n-date-picker v-model:value="projectForm.travelDates.shootEndDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" /></n-form-item>
        </n-grid>
        <n-grid :cols="3" :x-gap="12">
          <n-form-item label="套餐价格" path="basePackagePrice"><n-input-number v-model:value="projectForm.basePackagePrice" :min="0" placeholder="套餐价" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
          <n-form-item label="拍摄天数" path="shootDays"><n-input-number v-model:value="projectForm.shootDays" :min="1" placeholder="天数" style="width:100%;" /></n-form-item>
          <n-form-item label="人员数" path="totalStaffCount"><n-input-number v-model:value="projectForm.totalStaffCount" :min="1" placeholder="人员" style="width:100%;" /></n-form-item>
        </n-grid>
        <n-grid :cols="3" :x-gap="12">
          <n-form-item label="交通预算" path="transportBudget"><n-input-number v-model:value="projectForm.transportBudget" :min="0" placeholder="交通" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
          <n-form-item label="住宿预算" path="accommodationBudget"><n-input-number v-model:value="projectForm.accommodationBudget" :min="0" placeholder="住宿" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
          <n-form-item label="额外预算" path="extraCostBudget"><n-input-number v-model:value="projectForm.extraCostBudget" :min="0" placeholder="其他" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
        </n-grid>
        <n-form-item label="项目状态" path="status"><n-select v-model:value="projectForm.status" :options="statusSelectOptions" /></n-form-item>
        <n-form-item label="备注" path="remark"><n-input v-model:value="projectForm.remark" type="textarea" :rows="2" placeholder="请输入项目备注" /></n-form-item>
      </n-form>
      <template #footer><div style="text-align:right;"><n-button style="margin-right:12px;" @click="showProjectModal=false">取消</n-button><n-button type="primary" @click="handleProjectSubmit">确定</n-button></div></template>
    </n-modal>

    <n-modal v-model:show="showTransportModal" preset="card" :title="isTransportEdit?'编辑交通':'添加交通'" style="width:560px;" @after-leave="resetTransportForm">
      <n-form ref="transportFormRef" :model="transportForm" :rules="transportRules" label-placement="left" label-width="100px">
        <n-form-item label="交通类型" path="type"><n-select v-model:value="transportForm.type" :options="transportTypeOptions" /></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="出发地" path="departFrom"><n-input v-model:value="transportForm.departFrom" placeholder="出发城市/机场" /></n-form-item>
          <n-form-item label="到达地" path="arriveTo"><n-input v-model:value="transportForm.arriveTo" placeholder="到达城市/机场" /></n-form-item>
        </n-grid>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="班次/车牌" path="flightNo"><n-input v-model:value="transportForm.flightNo" :placeholder="transportPlaceholder" /></n-form-item>
          <n-form-item label="公司品牌" path="airline"><n-input v-model:value="transportForm.airline" :placeholder="transportCompanyPlaceholder" /></n-form-item>
        </n-grid>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="出发时间" path="departDateTime"><n-date-picker v-model:value="transportForm.departDateTime" type="datetime" style="width:100%;" /></n-form-item>
          <n-form-item label="到达时间" path="arriveDateTime"><n-date-picker v-model:value="transportForm.arriveDateTime" type="datetime" style="width:100%;" /></n-form-item>
        </n-grid>
        <n-grid :cols="3" :x-gap="12">
          <n-form-item label="人数" path="passengerCount"><n-input-number v-model:value="transportForm.passengerCount" :min="1" style="width:100%;" @update:value="calcTransportTotal" /></n-form-item>
          <n-form-item label="单价(每人)" path="costPerPerson"><n-input-number v-model:value="transportForm.costPerPerson" :min="0" style="width:100%;" @update:value="calcTransportTotal"><template #prefix>¥</template></n-input-number></n-form-item>
          <n-form-item label="总费用" path="totalCost"><n-input-number v-model:value="transportForm.totalCost" :min="0" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
        </n-grid>
        <n-form-item label="往返"><n-switch v-model:value="transportForm.isRoundTrip" /><span style="margin-left:8px;font-size:13px;color:#999;">是否为往返交通</span></n-form-item>
        <n-form-item label="预订状态" path="bookingStatus"><n-select v-model:value="transportForm.bookingStatus" :options="[{label:'待预订',value:'pending'},{label:'已预订',value:'confirmed'}]" /></n-form-item>
        <n-form-item label="备注" path="remark"><n-input v-model:value="transportForm.remark" type="textarea" :rows="2" placeholder="备注信息" /></n-form-item>
      </n-form>
      <template #footer><div style="text-align:right;"><n-button style="margin-right:12px;" @click="showTransportModal=false">取消</n-button><n-button type="primary" @click="handleTransportSubmit">确定</n-button></div></template>
    </n-modal>

    <n-modal v-model:show="showAccommodationModal" preset="card" :title="isAccommodationEdit?'编辑住宿':'添加住宿'" style="width:560px;" @after-leave="resetAccommodationForm">
      <n-form ref="accommodationFormRef" :model="accommodationForm" :rules="accommodationRules" label-placement="left" label-width="100px">
        <n-form-item label="住宿类型" path="type"><n-select v-model:value="accommodationForm.type" :options="accommodationTypeOptions" /></n-form-item>
        <n-form-item label="酒店名称" path="hotelName"><n-input v-model:value="accommodationForm.hotelName" placeholder="请输入酒店/民宿名称" /></n-form-item>
        <n-form-item label="详细地址" path="address"><n-input v-model:value="accommodationForm.address" placeholder="请输入详细地址" /></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="入住日期" path="checkIn"><n-date-picker v-model:value="accommodationForm.checkIn" type="date" value-format="YYYY-MM-DD" style="width:100%;" @update:value="calcAccommodationTotal" /></n-form-item>
          <n-form-item label="离店日期" path="checkOut"><n-date-picker v-model:value="accommodationForm.checkOut" type="date" value-format="YYYY-MM-DD" style="width:100%;" @update:value="calcAccommodationTotal" /></n-form-item>
        </n-grid>
        <n-grid :cols="3" :x-gap="12">
          <n-form-item label="房间数" path="roomCount"><n-input-number v-model:value="accommodationForm.roomCount" :min="1" style="width:100%;" @update:value="calcAccommodationTotal" /></n-form-item>
          <n-form-item label="间夜单价" path="costPerRoomPerNight"><n-input-number v-model:value="accommodationForm.costPerRoomPerNight" :min="0" style="width:100%;" @update:value="calcAccommodationTotal"><template #prefix>¥</template></n-input-number></n-form-item>
          <n-form-item label="总费用" path="totalCost"><n-input-number v-model:value="accommodationForm.totalCost" :min="0" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
        </n-grid>
        <n-form-item v-if="accommodationForm.nights" label="共 {{ accommodationForm.nights }} 晚"></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="联系人" path="contactName"><n-input v-model:value="accommodationForm.contactName" placeholder="联系人姓名" /></n-form-item>
          <n-form-item label="联系电话" path="contactPhone"><n-input v-model:value="accommodationForm.contactPhone" placeholder="联系电话" /></n-form-item>
        </n-grid>
        <n-form-item label="预订状态" path="bookingStatus"><n-select v-model:value="accommodationForm.bookingStatus" :options="[{label:'待预订',value:'pending'},{label:'已预订',value:'confirmed'}]" /></n-form-item>
        <n-form-item label="备注" path="remark"><n-input v-model:value="accommodationForm.remark" type="textarea" :rows="2" placeholder="备注信息" /></n-form-item>
      </n-form>
      <template #footer><div style="text-align:right;"><n-button style="margin-right:12px;" @click="showAccommodationModal=false">取消</n-button><n-button type="primary" @click="handleAccommodationSubmit">确定</n-button></div></template>
    </n-modal>

    <n-modal v-model:show="showStaffModal" preset="card" :title="isStaffEdit?'编辑人员':'添加出行人员'" style="width:560px;" @after-leave="resetStaffForm">
      <n-form ref="staffFormRef" :model="staffForm" :rules="staffRules" label-placement="left" label-width="100px">
        <n-form-item label="选择人员" path="staffId"><n-select v-model:value="staffForm.staffId" placeholder="选择出行人员" :options="staffSelectOptions" filterable @update:value="handleStaffSelect" /></n-form-item>
        <n-form-item label="担任角色" path="role"><n-select v-model:value="staffForm.role" :options="assignmentRoleOptions" /></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="出行天数" path="travelDays"><n-input-number v-model:value="staffForm.travelDays" :min="1" style="width:100%;" @update:value="calcStaffAllowance" /></n-form-item>
          <n-form-item label="是否出差"><n-switch v-model:value="staffForm.isTraveling" /></n-form-item>
        </n-grid>
        <n-divider style="margin:8px 0;">补贴标准</n-divider>
        <n-grid :cols="3" :x-gap="12">
          <n-form-item label="出差补贴" path="dailyAllowance"><n-input-number v-model:value="staffForm.dailyAllowance" :min="0" style="width:100%;" @update:value="calcStaffAllowance"><template #prefix>¥</template><template #suffix>/天</template></n-input-number></n-form-item>
          <n-form-item label="餐饮补贴" path="mealAllowance"><n-input-number v-model:value="staffForm.mealAllowance" :min="0" style="width:100%;" @update:value="calcStaffAllowance"><template #prefix>¥</template><template #suffix>/天</template></n-input-number></n-form-item>
          <n-form-item label="交通补贴" path="transportAllowance"><n-input-number v-model:value="staffForm.transportAllowance" :min="0" style="width:100%;" @update:value="calcStaffAllowance"><template #prefix>¥</template><template #suffix>/天</template></n-input-number></n-form-item>
        </n-grid>
        <n-alert type="info" style="margin-bottom:16px;">预计总补贴：<strong>¥{{ staffForm.totalAllowance.toLocaleString() }}</strong></n-alert>
        <n-form-item label="需要住宿"><n-switch v-model:value="staffForm.requiresAccommodation" /></n-form-item>
        <n-form-item label="备注" path="remark"><n-input v-model:value="staffForm.remark" type="textarea" :rows="2" placeholder="备注信息" /></n-form-item>
      </n-form>
      <template #footer><div style="text-align:right;"><n-button style="margin-right:12px;" @click="showStaffModal=false">取消</n-button><n-button type="primary" @click="handleStaffSubmit">确定</n-button></div></template>
    </n-modal>

    <n-modal v-model:show="showExtraCostModal" preset="card" :title="isExtraCostEdit?'编辑成本':'添加额外成本'" style="width:520px;" @after-leave="resetExtraCostForm">
      <n-form ref="extraCostFormRef" :model="extraCostForm" :rules="extraCostRules" label-placement="left" label-width="100px">
        <n-form-item label="费用类别" path="category"><n-select v-model:value="extraCostForm.category" :options="extraCostCategoryOptions" /></n-form-item>
        <n-form-item label="费用名称" path="name"><n-input v-model:value="extraCostForm.name" placeholder="请输入费用名称" /></n-form-item>
        <n-grid :cols="2" :x-gap="16">
          <n-form-item label="发生日期" path="date"><n-date-picker v-model:value="extraCostForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%;" /></n-form-item>
          <n-form-item label="金额" path="amount"><n-input-number v-model:value="extraCostForm.amount" :min="0" style="width:100%;"><template #prefix>¥</template></n-input-number></n-form-item>
        </n-grid>
        <n-form-item label="支付状态" path="paymentStatus"><n-select v-model:value="extraCostForm.paymentStatus" :options="[{label:'待支付',value:'pending'},{label:'已支付',value:'paid'}]" /></n-form-item>
        <n-form-item label="备注" path="remark"><n-input v-model:value="extraCostForm.remark" type="textarea" :rows="2" placeholder="备注信息" /></n-form-item>
      </n-form>
      <template #footer><div style="text-align:right;"><n-button style="margin-right:12px;" @click="showExtraCostModal=false">取消</n-button><n-button type="primary" @click="handleExtraCostSubmit">确定</n-button></div></template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { AddOutline, SyncOutline } from '@vicons/ionicons5'
import { useTravelShootStore } from '@/stores/travelShoot'
import { useOrderStore } from '@/stores/order'
import { useCustomerStore } from '@/stores/customer'
import { useScheduleStore } from '@/stores/schedule'
import {
  TRAVEL_SHOOT_STATUS, TRANSPORT_TYPE, ACCOMMODATION_TYPE, EXTRA_COST_CATEGORY,
  POPULAR_DESTINATIONS, ASSIGNMENT_ROLE, TRAVEL_ALLOWANCE_RATE
} from '@/utils/format'
import dayjs from 'dayjs'

const message = useMessage()
const dialog = useDialog()
const travelShootStore = useTravelShootStore()
const orderStore = useOrderStore()
const customerStore = useCustomerStore()
const scheduleStore = useScheduleStore()

const filterStatus = ref('')
const filterDestination = ref('')
const selectedProject = ref(null)
const showProjectModal = ref(false)
const showTransportModal = ref(false)
const showAccommodationModal = ref(false)
const showStaffModal = ref(false)
const showExtraCostModal = ref(false)
const isProjectEdit = ref(false)
const isTransportEdit = ref(false)
const isAccommodationEdit = ref(false)
const isStaffEdit = ref(false)
const isExtraCostEdit = ref(false)
const projectFormRef = ref(null)
const transportFormRef = ref(null)
const accommodationFormRef = ref(null)
const staffFormRef = ref(null)
const extraCostFormRef = ref(null)
const editProjectId = ref('')
const editTransportId = ref('')
const editAccommodationId = ref('')
const editStaffId = ref('')
const editExtraCostId = ref('')
const selectedDestId = ref('')
const travelDateRange = ref(null)

const projectForm = reactive({
  name: '', orderId: '', customerId: '',
  destination: { id: '', name: '', province: '', detailAddress: '' },
  travelDates: { departDate: '', shootStartDate: '', shootEndDate: '', returnDate: '' },
  shootDays: 2, basePackageId: '', basePackagePrice: 0, totalStaffCount: 4,
  transportBudget: 0, accommodationBudget: 0, extraCostBudget: 0, totalBudget: 0,
  status: 'planning', remark: ''
})
const transportForm = reactive({
  type: 'flight', airline: '', flightNo: '', departFrom: '', arriveTo: '',
  departDateTime: null, arriveDateTime: null, passengerCount: 1, costPerPerson: 0,
  totalCost: 0, isRoundTrip: false, bookingStatus: 'pending', remark: ''
})
const accommodationForm = reactive({
  type: 'hotel_4star', hotelName: '', address: '', checkIn: '', checkOut: '',
  roomCount: 1, nights: 0, costPerRoomPerNight: 0, totalCost: 0,
  bookingStatus: 'pending', contactName: '', contactPhone: '', remark: ''
})
const staffForm = reactive({
  staffId: '', role: 'chief_photographer', travelDays: 2, dailyAllowance: 300,
  mealAllowance: 80, transportAllowance: 50, totalAllowance: 0,
  isTraveling: true, requiresAccommodation: true, remark: ''
})
const extraCostForm = reactive({
  category: 'venue_fee', name: '', date: dayjs().format('YYYY-MM-DD'),
  amount: 0, paymentStatus: 'pending', remark: ''
})

const projectRules = { name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }], 'destination.id': [{ required: true, message: '请选择目的地', trigger: 'change' }] }
const transportRules = { type: [{ required: true, message: '请选择交通类型', trigger: 'change' }], departFrom: [{ required: true, message: '请输入出发地', trigger: 'blur' }], arriveTo: [{ required: true, message: '请输入到达地', trigger: 'blur' }], totalCost: [{ required: true, message: '请输入总费用', trigger: 'blur' }] }
const accommodationRules = { type: [{ required: true, message: '请选择住宿类型', trigger: 'change' }], hotelName: [{ required: true, message: '请输入酒店名称', trigger: 'blur' }], checkIn: [{ required: true, message: '请选择入住日期', trigger: 'change' }], checkOut: [{ required: true, message: '请选择离店日期', trigger: 'change' }], totalCost: [{ required: true, message: '请输入总费用', trigger: 'blur' }] }
const staffRules = { staffId: [{ required: true, message: '请选择人员', trigger: 'change' }], role: [{ required: true, message: '请选择角色', trigger: 'change' }] }
const extraCostRules = { category: [{ required: true, message: '请选择费用类别', trigger: 'change' }], name: [{ required: true, message: '请输入费用名称', trigger: 'blur' }], amount: [{ required: true, message: '请输入金额', trigger: 'blur' }] }

const statusOptions = Object.entries(TRAVEL_SHOOT_STATUS).map(([key, val]) => ({ label: val.label, value: key }))
const statusSelectOptions = statusOptions
const destinationOptions = POPULAR_DESTINATIONS.map(d => ({ label: `${d.name} (${d.province})`, value: d.id }))
const destinationSelectOptions = POPULAR_DESTINATIONS.map(d => ({ label: `${d.name} - ${d.province}`, value: d.id }))
const transportTypeOptions = Object.entries(TRANSPORT_TYPE).map(([key, val]) => ({ label: val.label, value: key }))
const accommodationTypeOptions = Object.entries(ACCOMMODATION_TYPE).map(([key, val]) => ({ label: val.label, value: key }))
const extraCostCategoryOptions = Object.entries(EXTRA_COST_CATEGORY).map(([key, val]) => ({ label: val.label, value: key }))
const assignmentRoleOptions = Object.entries(ASSIGNMENT_ROLE).map(([key, val]) => ({ label: val.label, value: key }))

const orderSelectOptions = computed(() => orderStore.orders.map(o => ({
  label: `${getCustomerName(o.customerId)} - ${dayjs(o.shootDate).format('YYYY-MM-DD')} (¥${((o.depositAmount||0)+(o.finalAmount||0)).toLocaleString()})`,
  value: o.id
})))
const customerSelectOptions = computed(() => customerStore.customers.map(c => ({ label: c.name, value: c.id })))
const staffSelectOptions = computed(() => scheduleStore.activeStaff.map(s => ({
  label: `${s.name} - ${getStaffRoleLabel(s.role)}`, value: s.id
})))

const transportPlaceholder = computed(() => {
  const map = { flight: '航班号', high_speed_rail: '车次', train: '车次', car_rental: '车牌号', taxi: '-', bus: '班次', other: '-' }
  return map[transportForm.type] || '请输入'
})
const transportCompanyPlaceholder = computed(() => {
  const map = { flight: '航空公司', high_speed_rail: '铁路局', train: '铁路局', car_rental: '租车公司', taxi: '出租车公司', bus: '客运公司', other: '服务商' }
  return map[transportForm.type] || '请输入'
})

const filteredProjects = computed(() => {
  let projects = [...travelShootStore.projects]
  if (filterStatus.value) projects = projects.filter(p => p.status === filterStatus.value)
  if (filterDestination.value) projects = projects.filter(p => p.destination?.id === filterDestination.value)
  return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const overallStats = computed(() => travelShootStore.getTotalProfitStats(orderStore))

const projectColumns = [
  { title: '项目名称', key: 'name', width: 200, ellipsis: { tooltip: true } },
  { title: '状态', key: 'status', width: 100 },
  { title: '目的地', key: 'destination', width: 120 },
  { title: '行程时间', key: 'travelDates', width: 160 },
  { title: '预算使用', key: 'budget', width: 180 },
  { title: '利润', key: 'profit', width: 130 },
  { title: '操作', key: 'actions', width: 200, fixed: 'right' }
]

const projectTransports = computed(() => selectedProject.value ? travelShootStore.getTransportsByProject(selectedProject.value.id) : [])
const projectAccommodations = computed(() => selectedProject.value ? travelShootStore.getAccommodationsByProject(selectedProject.value.id) : [])
const projectStaffAssignments = computed(() => selectedProject.value ? travelShootStore.getStaffAssignmentsByProject(selectedProject.value.id) : [])
const projectExtraCosts = computed(() => selectedProject.value ? travelShootStore.getExtraCostsByProject(selectedProject.value.id) : [])

const transportColumns = [
  { title: '类型', key: 'type', width: 80 }, { title: '行程', key: 'route', width: 180 },
  { title: '时间', key: 'time', width: 160 }, { title: '人数', key: 'passengerCount', width: 70 },
  { title: '费用', key: 'totalCost', width: 100, render: row => `¥${row.totalCost.toLocaleString()}` },
  { title: '状态', key: 'bookingStatus', width: 70 }, { title: '操作', key: 'actions', width: 120 }
]
const accommodationColumns = [
  { title: '类型', key: 'type', width: 100 }, { title: '酒店信息', key: 'hotelInfo', width: 220 },
  { title: '入住信息', key: 'stayInfo', width: 180 },
  { title: '总费用', key: 'totalCost', width: 100, render: row => `¥${row.totalCost.toLocaleString()}` },
  { title: '状态', key: 'bookingStatus', width: 70 }, { title: '操作', key: 'actions', width: 120 }
]
const staffColumns = [
  { title: '人员', key: 'staffInfo', width: 140 }, { title: '角色', key: 'role', width: 100 },
  { title: '补贴明细', key: 'allowance', width: 220 },
  { title: '总补贴', key: 'totalAllowance', width: 100 },
  { title: '冲突检测', key: 'conflict', width: 90 }, { title: '操作', key: 'actions', width: 120 }
]
const extraCostColumns = [
  { title: '类别', key: 'category', width: 100 }, { title: '名称', key: 'name', width: 180 },
  { title: '日期', key: 'date', width: 100 },
  { title: '金额', key: 'amount', width: 100, render: row => `¥${row.amount.toLocaleString()}` },
  { title: '支付', key: 'paymentStatus', width: 80 },
  { title: '备注', key: 'remark', width: 150, ellipsis: { tooltip: true } },
  { title: '操作', key: 'actions', width: 120 }
]

const profitDetail = computed(() => selectedProject.value ? travelShootStore.getProjectProfit(selectedProject.value.id, orderStore) : {
  revenue: 0, paidRevenue: 0, unpaidRevenue: 0, totalCost: 0,
  transportCost: 0, accommodationCost: 0, staffCost: 0, extraCost: 0,
  grossProfit: 0, grossProfitRate: 0
})
const budgetUtil = computed(() => selectedProject.value ? travelShootStore.getProjectBudgetUtilization(selectedProject.value.id) : {
  transport: 0, transportUsed: 0, transportBudget: 0,
  accommodation: 0, accommodationUsed: 0, accommodationBudget: 0,
  extra: 0, extraUsed: 0, extraBudget: 0,
  staff: 0, total: 0, totalUsed: 0, totalBudget: 0, isOverBudget: false
})
const travelDaysCount = computed(() => {
  if (!selectedProject.value?.travelDates) return 0
  const depart = selectedProject.value.travelDates.departDate
  const returnDate = selectedProject.value.travelDates.returnDate
  if (!depart || !returnDate) return 0
  return dayjs(returnDate).diff(dayjs(depart), 'day') + 1
})
const staffAllowanceTotal = computed(() => projectStaffAssignments.value.reduce((sum, s) => sum + (s.totalAllowance || 0), 0))
const extraCostByCategory = computed(() => {
  const result = {}
  projectExtraCosts.value.forEach(c => { if (!result[c.category]) result[c.category] = 0; result[c.category] += c.amount || 0 })
  return result
})
const extraCostTotal = computed(() => projectExtraCosts.value.reduce((sum, c) => sum + (c.amount || 0), 0))

function getBudgetUtil(projectId) { return travelShootStore.getProjectBudgetUtilization(projectId) }
function getProfit(projectId) { return travelShootStore.getProjectProfit(projectId, orderStore) || { grossProfit: 0, grossProfitRate: 0 } }
function getCustomerName(id) { return customerStore.getCustomerById(id)?.name || '-' }
function getStaffName(id) { return scheduleStore.getStaffById(id)?.name || '-' }
function getStaffPhone(id) { return scheduleStore.getStaffById(id)?.phone || '-' }
function getStaffRoleLabel(role) {
  const labels = { photographer: '摄影师', assistant: '助理', makeup: '化妆师', videographer: '摄像师' }
  return labels[role] || role
}
function getTravelShootStatus(status) { return TRAVEL_SHOOT_STATUS[status] || { label: status, color: 'default' } }
function getTransportType(type) { return TRANSPORT_TYPE[type] || { label: type, color: 'default' } }
function getAccommodationType(type) { return ACCOMMODATION_TYPE[type] || { label: type, color: 'default' } }
function getExtraCostCategory(category) { return EXTRA_COST_CATEGORY[category] || { label: category, color: 'default' } }
function getAssignmentRole(role) { return ASSIGNMENT_ROLE[role] || { label: role, color: 'default' } }
function hasConflict(staffId) {
  if (!selectedProject.value) return false
  return travelShootStore.checkStaffTravelConflict(staffId, selectedProject.value.id)
}

function viewProjectDetail(project) { selectedProject.value = project }

function openProjectModal(row = null) {
  isProjectEdit.value = !!row
  if (row) {
    editProjectId.value = row.id
    Object.assign(projectForm, JSON.parse(JSON.stringify(row)))
    selectedDestId.value = row.destination?.id || ''
    if (row.travelDates?.departDate && row.travelDates?.returnDate) {
      travelDateRange.value = [dayjs(row.travelDates.departDate).valueOf(), dayjs(row.travelDates.returnDate).valueOf()]
    }
  } else {
    editProjectId.value = ''
    resetProjectForm()
  }
  showProjectModal.value = true
}
function resetProjectForm() {
  Object.assign(projectForm, {
    name: '', orderId: '', customerId: '',
    destination: { id: '', name: '', province: '', detailAddress: '' },
    travelDates: { departDate: '', shootStartDate: '', shootEndDate: '', returnDate: '' },
    shootDays: 2, basePackageId: '', basePackagePrice: 0, totalStaffCount: 4,
    transportBudget: 0, accommodationBudget: 0, extraCostBudget: 0, totalBudget: 0,
    status: 'planning', remark: ''
  })
  selectedDestId.value = ''
  travelDateRange.value = null
  projectFormRef.value?.restoreValidation()
}
function handleOrderSelect(orderId) {
  if (!orderId) return
  const order = orderStore.getOrderById(orderId)
  if (order) {
    projectForm.customerId = order.customerId
    projectForm.basePackagePrice = (order.depositAmount || 0) + (order.finalAmount || 0)
    if (order.shootDate) {
      projectForm.travelDates.shootStartDate = order.shootDate
      projectForm.travelDates.shootEndDate = order.shootDate
    }
  }
}
function handleDestinationSelect(destId) {
  const dest = POPULAR_DESTINATIONS.find(d => d.id === destId)
  if (dest) {
    projectForm.destination.id = dest.id
    projectForm.destination.name = dest.name
    projectForm.destination.province = dest.province
  }
}
function handleTravelDateChange(range) {
  if (!range || range.length !== 2) return
  projectForm.travelDates.departDate = dayjs(range[0]).format('YYYY-MM-DD')
  projectForm.travelDates.returnDate = dayjs(range[1]).format('YYYY-MM-DD')
}
function handleProjectSubmit() {
  projectFormRef.value?.validate(errors => {
    if (!errors) {
      projectForm.totalBudget = (projectForm.basePackagePrice || 0) + (projectForm.transportBudget || 0) + (projectForm.accommodationBudget || 0) + (projectForm.extraCostBudget || 0)
      const data = JSON.parse(JSON.stringify(projectForm))
      if (isProjectEdit.value) {
        travelShootStore.updateProject(editProjectId.value, data)
        message.success('项目更新成功')
      } else {
        travelShootStore.addProject(data)
        message.success('项目创建成功')
      }
      showProjectModal.value = false
      if (selectedProject.value?.id === editProjectId.value) {
        selectedProject.value = travelShootStore.getProjectById(editProjectId.value)
      }
    }
  })
}
function handleDeleteProject(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除项目「${row.name}」吗？关联的交通、住宿、人员和成本数据将一并删除。`,
    positiveText: '删除', negativeText: '取消',
    onPositiveClick: () => {
      travelShootStore.deleteProject(row.id)
      if (selectedProject.value?.id === row.id) selectedProject.value = null
      message.success('删除成功')
    }
  })
}

function openTransportModal(row = null) {
  isTransportEdit.value = !!row
  if (row) {
    editTransportId.value = row.id
    Object.assign(transportForm, JSON.parse(JSON.stringify(row)))
    if (row.departDateTime) transportForm.departDateTime = dayjs(row.departDateTime).valueOf()
    if (row.arriveDateTime) transportForm.arriveDateTime = dayjs(row.arriveDateTime).valueOf()
  } else {
    editTransportId.value = ''
    resetTransportForm()
  }
  showTransportModal.value = true
}
function resetTransportForm() {
  Object.assign(transportForm, {
    type: 'flight', airline: '', flightNo: '', departFrom: '', arriveTo: '',
    departDateTime: null, arriveDateTime: null, passengerCount: 1, costPerPerson: 0,
    totalCost: 0, isRoundTrip: false, bookingStatus: 'pending', remark: ''
  })
  transportFormRef.value?.restoreValidation()
}
function handleTransportTypeChange() { /* placeholder for future logic */ }
function calcTransportTotal() {
  transportForm.totalCost = (transportForm.passengerCount || 0) * (transportForm.costPerPerson || 0)
}
function handleTransportSubmit() {
  transportFormRef.value?.validate(errors => {
    if (!errors) {
      const data = JSON.parse(JSON.stringify(transportForm))
      data.projectId = selectedProject.value.id
      if (data.departDateTime) data.departDateTime = dayjs(data.departDateTime).format('YYYY-MM-DD HH:mm')
      if (data.arriveDateTime) data.arriveDateTime = dayjs(data.arriveDateTime).format('YYYY-MM-DD HH:mm')
      if (isTransportEdit.value) {
        travelShootStore.updateTransport(editTransportId.value, data)
        message.success('更新成功')
      } else {
        travelShootStore.addTransport(data)
        message.success('添加成功')
      }
      showTransportModal.value = false
    }
  })
}
function handleDeleteTransport(row) {
  dialog.warning({
    title: '确认删除', content: '确定要删除这条交通记录吗？',
    positiveText: '删除', negativeText: '取消',
    onPositiveClick: () => { travelShootStore.deleteTransport(row.id); message.success('删除成功') }
  })
}

function openAccommodationModal(row = null) {
  isAccommodationEdit.value = !!row
  if (row) {
    editAccommodationId.value = row.id
    Object.assign(accommodationForm, JSON.parse(JSON.stringify(row)))
  } else {
    editAccommodationId.value = ''
    resetAccommodationForm()
  }
  showAccommodationModal.value = true
}
function resetAccommodationForm() {
  Object.assign(accommodationForm, {
    type: 'hotel_4star', hotelName: '', address: '', checkIn: '', checkOut: '',
    roomCount: 1, nights: 0, costPerRoomPerNight: 0, totalCost: 0,
    bookingStatus: 'pending', contactName: '', contactPhone: '', remark: ''
  })
  accommodationFormRef.value?.restoreValidation()
}
function calcAccommodationTotal() {
  if (accommodationForm.checkIn && accommodationForm.checkOut) {
    accommodationForm.nights = dayjs(accommodationForm.checkOut).diff(dayjs(accommodationForm.checkIn), 'day')
    accommodationForm.totalCost = (accommodationForm.roomCount || 0) * (accommodationForm.nights || 0) * (accommodationForm.costPerRoomPerNight || 0)
  }
}
function handleAccommodationSubmit() {
  accommodationFormRef.value?.validate(errors => {
    if (!errors) {
      const data = JSON.parse(JSON.stringify(accommodationForm))
      data.projectId = selectedProject.value.id
      if (isAccommodationEdit.value) {
        travelShootStore.updateAccommodation(editAccommodationId.value, data)
        message.success('更新成功')
      } else {
        travelShootStore.addAccommodation(data)
        message.success('添加成功')
      }
      showAccommodationModal.value = false
    }
  })
}
function handleDeleteAccommodation(row) {
  dialog.warning({
    title: '确认删除', content: '确定要删除这条住宿记录吗？',
    positiveText: '删除', negativeText: '取消',
    onPositiveClick: () => { travelShootStore.deleteAccommodation(row.id); message.success('删除成功') }
  })
}

function openStaffModal(row = null) {
  isStaffEdit.value = !!row
  if (row) {
    editStaffId.value = row.id
    Object.assign(staffForm, JSON.parse(JSON.stringify(row)))
  } else {
    editStaffId.value = ''
    resetStaffForm()
    if (travelDaysCount.value > 0) staffForm.travelDays = travelDaysCount.value
  }
  showStaffModal.value = true
}
function resetStaffForm() {
  Object.assign(staffForm, {
    staffId: '', role: 'chief_photographer', travelDays: 2, dailyAllowance: 300,
    mealAllowance: 80, transportAllowance: 50, totalAllowance: 0,
    isTraveling: true, requiresAccommodation: true, remark: ''
  })
  staffFormRef.value?.restoreValidation()
}
function handleStaffSelect(staffId) {
  const staff = scheduleStore.getStaffById(staffId)
  if (!staff) return
  const rate = TRAVEL_ALLOWANCE_RATE[staff.role] || TRAVEL_ALLOWANCE_RATE.other
  staffForm.dailyAllowance = rate.daily
  staffForm.mealAllowance = rate.meal
  staffForm.transportAllowance = rate.transport
  calcStaffAllowance()
}
function calcStaffAllowance() {
  const days = staffForm.travelDays || 0
  staffForm.totalAllowance = days * ((staffForm.dailyAllowance || 0) + (staffForm.mealAllowance || 0) + (staffForm.transportAllowance || 0))
}
function handleStaffSubmit() {
  staffFormRef.value?.validate(errors => {
    if (!errors) {
      const data = JSON.parse(JSON.stringify(staffForm))
      data.projectId = selectedProject.value.id
      if (hasConflict(data.staffId) && (!isStaffEdit.value || data.staffId !== (staffForm.staffId))) {
        dialog.warning({
          title: '行程冲突', content: '该人员在此行程时间段内已被安排其他旅拍任务，是否继续添加？',
          positiveText: '继续', negativeText: '取消',
          onPositiveClick: () => { submitStaffAssignment(data) }
        })
      } else {
        submitStaffAssignment(data)
      }
    }
  })
}
function submitStaffAssignment(data) {
  if (isStaffEdit.value) {
    travelShootStore.updateStaffAssignment(editStaffId.value, data)
    message.success('更新成功')
  } else {
    travelShootStore.addStaffAssignment(data)
    message.success('添加成功')
  }
  showStaffModal.value = false
}
function handleDeleteStaff(row) {
  dialog.warning({
    title: '确认删除', content: '确定要删除该人员的出行安排吗？',
    positiveText: '删除', negativeText: '取消',
    onPositiveClick: () => { travelShootStore.deleteStaffAssignment(row.id); message.success('删除成功') }
  })
}
function handleSyncToSchedule() {
  if (!selectedProject.value?.orderId) {
    message.warning('该项目未关联订单，无法同步到拍摄排班')
    return
  }
  const result = travelShootStore.syncToSchedule(selectedProject.value.id, orderStore)
  if (result) message.success('同步成功')
  else message.error('同步失败')
}

function openExtraCostModal(row = null) {
  isExtraCostEdit.value = !!row
  if (row) {
    editExtraCostId.value = row.id
    Object.assign(extraCostForm, JSON.parse(JSON.stringify(row)))
  } else {
    editExtraCostId.value = ''
    resetExtraCostForm()
  }
  showExtraCostModal.value = true
}
function resetExtraCostForm() {
  Object.assign(extraCostForm, {
    category: 'venue_fee', name: '', date: dayjs().format('YYYY-MM-DD'),
    amount: 0, paymentStatus: 'pending', remark: ''
  })
  extraCostFormRef.value?.restoreValidation()
}
function handleExtraCostSubmit() {
  extraCostFormRef.value?.validate(errors => {
    if (!errors) {
      const data = JSON.parse(JSON.stringify(extraCostForm))
      data.projectId = selectedProject.value.id
      if (isExtraCostEdit.value) {
        travelShootStore.updateExtraCost(editExtraCostId.value, data)
        message.success('更新成功')
      } else {
        travelShootStore.addExtraCost(data)
        message.success('添加成功')
      }
      showExtraCostModal.value = false
    }
  })
}
function handleDeleteExtraCost(row) {
  dialog.warning({
    title: '确认删除', content: '确定要删除这条成本记录吗？',
    positiveText: '删除', negativeText: '取消',
    onPositiveClick: () => { travelShootStore.deleteExtraCost(row.id); message.success('删除成功') }
  })
}

onMounted(() => {
  travelShootStore.fetchAll()
  customerStore.fetchCustomers()
  orderStore.fetchOrders()
  scheduleStore.fetchStaff()
  scheduleStore.fetchAssignments()
})
</script>

<style scoped>
.travel-shoot-page { min-height: 100%; }
.page-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px; }
.page-title { font-size:22px; font-weight:600; color:#333; margin:0; }
.page-subtitle { font-size:13px; color:#999; margin:6px 0 0 0; }
.page-subtitle .highlight { color:#d03050; font-weight:600; }
.page-subtitle .highlight-success { color:#18a058; font-weight:600; }
.stats-cards { display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; }
.stat-card { text-align:center; }
.stat-title { font-size:13px; color:#999; margin-bottom:8px; }
.stat-value { font-size:26px; font-weight:700; color:#333; }
.stat-value.info { color:#2080f0; }
.stat-value.warning { color:#f0a020; }
.stat-value.success { color:#18a058; }
.stat-value.error { color:#d03050; }
.stat-rate { font-size:12px; color:#999; margin-top:6px; }
.stat-rate.over { color:#d03050; font-weight:600; }

.filter-bar { display:flex; gap:12px; margin:20px 0; align-items:center; flex-wrap:wrap; }
.filter-bar .filter-label { font-size:13px; color:#666; }
.filter-bar .spacer { flex:1; }

.table-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.table-title { font-size:15px; font-weight:600; color:#333; }

.detail-section { padding: 4px 0; }
.detail-section + .detail-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0; }
.section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.section-title { font-size:15px; font-weight:600; color:#333; margin:0; display:flex; align-items:center; gap:6px; }
.section-title .icon { color:#D4A574; }

.detail-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:14px 24px; }
.detail-item { display:flex; flex-direction:column; gap:4px; }
.detail-label { font-size:12px; color:#999; }
.detail-value { font-size:14px; color:#333; font-weight:500; }
.detail-value.muted { color:#999; font-weight:400; }

.profit-section { padding:16px; background: linear-gradient(135deg, #fef9f3 0%, #fdf5e9 100%); border-radius:8px; }

.finance-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-bottom:20px; }
.finance-card { padding:16px; border-radius:8px; background:#fff; border:1px solid #eee; }
.finance-card.revenue { background: linear-gradient(135deg, #e8f3ff 0%, #d4e8ff 100%); border-color:#b8d4ff; }
.finance-card.cost { background: linear-gradient(135deg, #fff5e8 0%, #ffeacc 100%); border-color:#ffd9a8; }
.finance-card.profit { background: linear-gradient(135deg, #e8fff0 0%, #d4ffe0 100%); border-color:#a8e8c0; }
.finance-card.loss { background: linear-gradient(135deg, #ffe8ec 0%, #ffd4dc 100%); border-color:#ffa8b8; }
.finance-label { font-size:12px; color:#666; margin-bottom:6px; }
.finance-amount { font-size:22px; font-weight:700; color:#333; }
.finance-sub { font-size:11px; color:#999; margin-top:4px; }
.cost-breakdown-mini { margin-top:10px; padding-top:10px; border-top:1px dashed rgba(0,0,0,0.08); }
.cost-breakdown-mini .bd-item { display:flex; justify-content:space-between; font-size:12px; color:#666; padding:2px 0; }

.budget-bars { display:flex; flex-direction:column; gap:14px; }
.budget-bar-item { display:grid; grid-template-columns:100px 1fr 100px; gap:12px; align-items:center; }
.budget-bar-label { font-size:13px; color:#666; }
.budget-bar-value { font-size:12px; text-align:right; color:#666; }
.budget-bar-value.over { color:#d03050; font-weight:600; }

.allowance-info { padding:8px 12px; background:#f5f9ff; border-radius:4px; font-size:12px; color:#2080f0; margin-top:4px; }
.conflict-tag { font-size:11px; }

.category-summary { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:14px; padding:12px; background:#fafafa; border-radius:6px; }
.category-item { display:flex; justify-content:space-between; padding:6px 10px; background:#fff; border-radius:4px; font-size:12px; }
.category-item .cat-label { color:#666; }
.category-item .cat-value { font-weight:600; color:#333; }
.category-item.total { background: linear-gradient(135deg, #fff5e8, #ffedd0); grid-column: span 3; }
.category-item.total .cat-label, .category-item.total .cat-value { font-size:13px; color:#D4A574; font-weight:700; }

@media (max-width: 768px) {
  .stats-cards { grid-template-columns:repeat(2, 1fr); }
  .detail-grid { grid-template-columns:repeat(2, 1fr); }
  .finance-grid { grid-template-columns:repeat(2, 1fr); }
  .category-summary { grid-template-columns:repeat(2, 1fr); }
  .budget-bar-item { grid-template-columns:80px 1fr 80px; }
}
</style>