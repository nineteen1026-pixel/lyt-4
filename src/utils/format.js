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
  other: '其他'
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
