export const LEAD_STATUSES = {
  NEW: { label: 'Yeni', variant: 'NEW', color: 'bg-blue-500' },
  CONTACTED: { label: 'Əlaqə qurulub', variant: 'CONTACTED', color: 'bg-amber-500' },
  QUALIFIED: { label: 'Keyfiyyətli', variant: 'QUALIFIED', color: 'bg-purple-500' },
  PROPOSAL: { label: 'Təklif verilib', variant: 'PROPOSAL', color: 'bg-cyan-500' },
  NEGOTIATION: { label: 'Danışıqda', variant: 'NEGOTIATION', color: 'bg-orange-500' },
  WON: { label: 'Qazanan', variant: 'WON', color: 'bg-emerald-500' },
  LOST: { label: 'İtirilib', variant: 'LOST', color: 'bg-red-500' },
}

export const QUOTE_STATUSES = {
  DRAFT: { label: 'Qaralama', variant: 'DRAFT', color: 'bg-slate-500' },
  SENT: { label: 'Göndərilib', variant: 'SENT', color: 'bg-blue-500' },
  ACCEPTED: { label: 'Qəbul edilib', variant: 'WON', color: 'bg-emerald-500' },
  REJECTED: { label: 'Rədd edilib', variant: 'LOST', color: 'bg-red-500' },
}

export const ORDER_STATUSES = {
  PENDING: { label: 'Gözləyir', variant: 'PENDING', color: 'bg-amber-500' },
  CONFIRMED: { label: 'Təsdiqlənib', variant: 'CONFIRMED', color: 'bg-blue-500' },
  PROCESSING: { label: 'Hazırlanır', variant: 'PROCESSING', color: 'bg-purple-500' },
  SHIPPED: { label: 'Göndərilib', variant: 'SHIPPED', color: 'bg-cyan-500' },
  DELIVERED: { label: 'Çatdırılıb', variant: 'DELIVERED', color: 'bg-emerald-500' },
  CANCELLED: { label: 'Ləğv edilib', variant: 'CANCELLED', color: 'bg-red-500' },
}

export const INVOICE_STATUSES = {
  DRAFT: { label: 'Qaralama', variant: 'DRAFT', color: 'bg-slate-500' },
  SENT: { label: 'Göndərilib', variant: 'SENT', color: 'bg-blue-500' },
  PAID: { label: 'Ödənilib', variant: 'PAID', color: 'bg-emerald-500' },
  OVERDUE: { label: 'Gecikib', variant: 'OVERDUE', color: 'bg-red-500' },
  CANCELLED: { label: 'Ləğv edilib', variant: 'CANCELLED', color: 'bg-red-500' },
}

export const TASK_STATUSES = {
  PENDING: { label: 'Gözləyir', variant: 'PENDING' },
  IN_PROGRESS: { label: 'Davam edir', variant: 'PROCESSING' },
  COMPLETED: { label: 'Tamamlanıb', variant: 'DELIVERED' },
  CANCELLED: { label: 'Ləğv edilib', variant: 'CANCELLED' },
}

export const TASK_PRIORITIES = {
  LOW: { label: 'Aşağı', variant: 'info' },
  MEDIUM: { label: 'Orta', variant: 'warning' },
  HIGH: { label: 'Yüksək', variant: 'danger' },
  URGENT: { label: 'Təcili', variant: 'danger' },
}
