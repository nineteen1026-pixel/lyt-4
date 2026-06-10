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

export function getDaysBetween(date1, date2) {
  return dayjs(date2).diff(dayjs(date1), 'day')
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  return dayjs().isAfter(dayjs(dueDate), 'day')
}
