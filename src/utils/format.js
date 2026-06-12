import dayjs from 'dayjs'

export function formatMoney(amount, symbol = '¥') {
  if (amount === null || amount === undefined) return symbol + '0.00'
  return symbol + Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export const ORDER_STATUS = {
  pending: { label: '待确认', color: 'warning' },
  confirmed: { label: '已确认', color: 'info' },
  shooting: { label: '待拍摄', color: 'primary' },
  selecting: { label: '待选片', color: 'warning' },
  editing: { label: '精修中', color: 'info' },
  delivering: { label: '待交付', color: 'warning' },
  completed: { label: '已完成', color: 'success' }
}

export const PROGRESS_STEPS = [
  { key: 'pending', label: '待确认', description: '订单待确认' },
  { key: 'confirmed', label: '已确认', description: '档期已锁定' },
  { key: 'shooting', label: '待拍摄', description: '等待拍摄日' },
  { key: 'selecting', label: '待选片', description: '拍摄完成待选片' },
  { key: 'editing', label: '精修中', description: '后期精修处理' },
  { key: 'delivering', label: '待交付', description: '成品待交付' },
  { key: 'completed', label: '已完成', description: '订单已完成' }
]

export const PAYMENT_STATUS = {
  unpaid: { label: '未付款', color: 'error' },
  partial: { label: '部分付款', color: 'warning' },
  paid: { label: '已付清', color: 'success' }
}

export const COST_TYPES = {
  transport: { label: '交通', color: 'info' },
  accommodation: { label: '住宿', color: 'warning' },
  food: { label: '餐饮', color: 'success' },
  equipment: { label: '器材', color: 'primary' },
  other: { label: '其他', color: 'default' }
}

export const LEAD_STATUS = {
  new: { label: '新线索', color: 'info' },
  contacting: { label: '跟进中', color: 'warning' },
  quoted: { label: '已报价', color: 'primary' },
  negotiating: { label: '协商中', color: 'warning' },
  converted: { label: '已转化', color: 'success' },
  lost: { label: '已流失', color: 'error' }
}

export const LEAD_SOURCE = {
  referral: '朋友介绍',
  xiaohongshu: '小红书',
  douyin: '抖音',
  dianping: '大众点评',
  official: '官网',
  offline: '线下活动',
  other: '其他'
}

export const FOLLOW_UP_TYPE = {
  wechat: '微信',
  phone: '电话',
  meeting: '面谈',
  video: '视频',
  status_change: '进度变更',
  other: '其他'
}

export const RECORD_CATEGORY = {
  follow_up: '跟进记录',
  progress: '进度日志'
}

export const STAFF_ROLE = {
  photographer: { label: '摄影师', color: 'primary' },
  assistant: { label: '摄影助理', color: 'default' },
  makeup: { label: '化妆师', color: 'warning' },
  videographer: { label: '摄像师', color: 'info' }
}

export const ASSIGNMENT_ROLE = {
  chief_photographer: { label: '主摄影师', color: 'primary' },
  photographer: { label: '摄影师', color: 'info' },
  assistant: { label: '助理', color: 'default' },
  makeup_artist: { label: '化妆师', color: 'warning' },
  videographer: { label: '摄像师', color: 'info' }
}

export const ASSIGNMENT_STATUS = {
  pending: { label: '待确认', color: 'warning' },
  confirmed: { label: '已确认', color: 'info' },
  in_progress: { label: '进行中', color: 'primary' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'error' }
}

export function getDaysBetween(date1, date2) {
  return dayjs(date2).diff(dayjs(date1), 'day')
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return dayjs().isAfter(dayjs(dueDate), 'day')
}

export const RETOUCH_STATUS = {
  waiting: { label: '待分配', color: 'default' },
  assigned: { label: '精修中', color: 'primary' },
  reviewing: { label: '待审核', color: 'warning' },
  feedback: { label: '客户反馈', color: 'error' },
  rework: { label: '返工中', color: 'warning' },
  approved: { label: '已验收', color: 'success' },
  delivered: { label: '已交付', color: 'success' }
}

export const RETOUCH_STEPS = [
  { key: 'waiting', label: '待分配', description: '待分配给修图师' },
  { key: 'assigned', label: '精修中', description: '修图师正在精修' },
  { key: 'reviewing', label: '待审核', description: '内部质量审核' },
  { key: 'feedback', label: '客户反馈', description: '等待客户反馈意见' },
  { key: 'rework', label: '返工中', description: '根据反馈进行修改' },
  { key: 'approved', label: '已验收', description: '客户已验收通过' },
  { key: 'delivered', label: '已交付', description: '原片已交付客户' }
]

export const RETOUCH_PRIORITY = {
  normal: { label: '普通', color: 'default' },
  urgent: { label: '加急', color: 'warning' },
  super_urgent: { label: '特急', color: 'error' }
}

export const FEEDBACK_TYPE = {
  color: '色调调整',
  skin: '皮肤美化',
  body: '体型修饰',
  background: '背景处理',
  composition: '构图调整',
  detail: '细节修复',
  other: '其他问题'
}

export const TRAVEL_SHOOT_STATUS = {
  planning: { label: '筹备中', color: 'warning' },
  confirmed: { label: '已确认', color: 'info' },
  traveling: { label: '出行中', color: 'primary' },
  shooting: { label: '拍摄中', color: 'primary' },
  returning: { label: '返程中', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'error' }
}

export const TRAVEL_SHOOT_STEPS = [
  { key: 'planning', label: '筹备中', description: '行程规划与确认' },
  { key: 'confirmed', label: '已确认', description: '行程已最终确认' },
  { key: 'traveling', label: '出行中', description: '前往拍摄地' },
  { key: 'shooting', label: '拍摄中', description: '正式拍摄阶段' },
  { key: 'returning', label: '返程中', description: '拍摄完成返程' },
  { key: 'completed', label: '已完成', description: '旅拍全部完成' }
]

export const TRANSPORT_TYPE = {
  flight: { label: '飞机', color: 'primary', icon: 'airplane' },
  high_speed_rail: { label: '高铁', color: 'info', icon: 'train' },
  train: { label: '火车', color: 'default', icon: 'train' },
  car_rental: { label: '租车', color: 'warning', icon: 'car' },
  taxi: { label: '打车', color: 'success', icon: 'car' },
  bus: { label: '大巴', color: 'default', icon: 'bus' },
  other: { label: '其他', color: 'default', icon: 'navigate' }
}

export const ACCOMMODATION_TYPE = {
  hotel_5star: { label: '五星级酒店', color: 'primary' },
  hotel_4star: { label: '四星级酒店', color: 'info' },
  hotel_boutique: { label: '精品民宿', color: 'warning' },
  hotel_standard: { label: '普通酒店', color: 'default' },
  apartment: { label: '公寓', color: 'success' },
  other: { label: '其他', color: 'default' }
}

export const EXTRA_COST_CATEGORY = {
  venue_fee: { label: '场地费', color: 'primary' },
  permit_fee: { label: '拍摄许可', color: 'info' },
  props: { label: '道具采购', color: 'warning' },
  food: { label: '餐饮', color: 'success' },
  insurance: { label: '保险', color: 'default' },
  local_staff: { label: '当地人员', color: 'info' },
  equipment_extra: { label: '额外器材', color: 'warning' },
  packing_transport: { label: '器材托运', color: 'primary' },
  miscellaneous: { label: '杂项', color: 'default' }
}

export const POPULAR_DESTINATIONS = [
  { id: 'sanya', name: '三亚', province: '海南', distance: '远途', baseCostLevel: 3 },
  { id: 'dali', name: '大理', province: '云南', distance: '远途', baseCostLevel: 2 },
  { id: 'lijiang', name: '丽江', province: '云南', distance: '远途', baseCostLevel: 2 },
  { id: 'xiamen', name: '厦门', province: '福建', distance: '中程', baseCostLevel: 2 },
  { id: 'qingdao', name: '青岛', province: '山东', distance: '中程', baseCostLevel: 1 },
  { id: 'hangzhou', name: '杭州', province: '浙江', distance: '近程', baseCostLevel: 1 },
  { id: 'suzhou', name: '苏州', province: '江苏', distance: '近程', baseCostLevel: 1 },
  { id: 'chengdu', name: '成都', province: '四川', distance: '远途', baseCostLevel: 2 },
  { id: 'guilin', name: '桂林', province: '广西', distance: '远途', baseCostLevel: 2 },
  { id: 'shanghai', name: '上海', province: '上海', distance: '近程', baseCostLevel: 2 },
  { id: 'beijing', name: '北京', province: '北京', distance: '中程', baseCostLevel: 3 },
  { id: 'chongqing', name: '重庆', province: '重庆', distance: '远途', baseCostLevel: 2 }
]

export const TRAVEL_ALLOWANCE_RATE = {
  photographer: { daily: 300, meal: 80, transport: 50 },
  makeup: { daily: 300, meal: 80, transport: 50 },
  assistant: { daily: 200, meal: 60, transport: 40 },
  videographer: { daily: 300, meal: 80, transport: 50 },
  other: { daily: 200, meal: 60, transport: 40 }
}

export const COMMUNICATION_CHANNEL = {
  wechat: { label: '微信', color: 'success' },
  phone: { label: '电话', color: 'info' },
  meeting: { label: '面谈', color: 'warning' },
  video: { label: '视频', color: 'primary' },
  email: { label: '邮件', color: 'default' },
  other: { label: '其他', color: 'default' }
}

export const FOLLOW_UP_NODE = {
  initial_contact: { label: '初次接触', color: 'info' },
  requirement_confirm: { label: '需求确认', color: 'primary' },
  quotation_sent: { label: '已报价', color: 'warning' },
  negotiation: { label: '协商中', color: 'warning' },
  contract_signed: { label: '签单确认', color: 'success' },
  deposit_paid: { label: '定金已收', color: 'success' },
  lost: { label: '已流失', color: 'error' },
  other: { label: '其他', color: 'default' }
}

export const TRANSFER_STATUS = {
  pending: { label: '待转单', color: 'warning' },
  transferred: { label: '已转单', color: 'success' },
  cancelled: { label: '已取消', color: 'error' }
}

export const NOTE_CATEGORY = {
  general: { label: '通用备注', color: 'default' },
  preference: { label: '客户偏好', color: 'info' },
  requirement: { label: '特殊需求', color: 'warning' },
  complaint: { label: '投诉反馈', color: 'error' },
  internal: { label: '内部备注', color: 'primary' }
}

export const PAYMENT_METHOD = {
  wechat: { label: '微信', color: 'success' },
  alipay: { label: '支付宝', color: 'info' },
  bank: { label: '银行转账', color: 'primary' },
  cash: { label: '现金', color: 'warning' },
  other: { label: '其他', color: 'default' }
}
