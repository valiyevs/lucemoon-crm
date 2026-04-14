import { supabase } from '../lib/supabase'

// Field mapping: API field name -> Supabase field name
const fieldMap = {
  // User
  firstName: 'first_name',
  lastName: 'last_name',
  isActive: 'is_active',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Lead
  userId: 'user_id',
  accountId: 'account_id',
  // Quote
  quoteNumber: 'quote_number',
  contactId: 'contact_id',
  leadId: 'lead_id',
  taxRate: 'tax_rate',
  taxAmount: 'tax_amount',
  validUntil: 'valid_until',
  // Order
  orderNumber: 'order_number',
  shippingAddress: 'shipping_address',
  // Invoice
  invoiceNumber: 'invoice_number',
  issueDate: 'issue_date',
  dueDate: 'due_date',
  // Task
  assignedTo: 'assigned_to',
  createdBy: 'created_by',
  completedAt: 'completed_at',
  // Common
  costPrice: 'cost_price',
  isActive: 'is_active',
  quoteId: 'quote_id',
  orderId: 'order_id',
  productId: 'product_id',
}

// Reverse field mapping: Supabase -> API
const reverseFieldMap = {}
for (const [key, value] of Object.entries(fieldMap)) {
  reverseFieldMap[value] = key
}

// Convert API field names to Supabase field names
function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = fieldMap[key] || key
    result[newKey] = value
  }
  return result
}

// Convert Supabase field names to API field names (recursive)
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const newKey = reverseFieldMap[key] || key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[newKey] = toCamelCase(value)
    } else if (Array.isArray(value)) {
      result[newKey] = value.map(item => typeof item === 'object' ? toCamelCase(item) : item)
    } else {
      result[newKey] = value
    }
  }
  return result
}

// Table relations for select
const tableRelations = {
  leads: '*, user:users(*), account:accounts(*)',
  accounts: '*',
  contacts: '*, account:accounts(*)',
  quotes: '*, user:users(*), account:accounts(*), contact:contacts(*), lead:leads(*), items:quote_items(*, product:products(*))',
  orders: '*, user:users(*), account:accounts(*), contact:contacts(*), quote:quotes(*), items:order_items(*, product:products(*))',
  invoices: '*, order:orders(*)',
  tasks: '*, assignedUser:users(*), creator:users(*)',
  products: '*',
  users: '*',
  quote_items: '*, product:products(*)',
  order_items: '*, product:products(*)',
  audit_logs: '*, user:users(*)'
}

// Get select string for table
function getSelect(table) {
  return tableRelations[table] || '*'
}

// API wrapper matching axios interface
const api = {
  async get(endpoint) {
    const path = endpoint.replace('/api/', '')
    const table = path

    const { data, error } = await supabase
      .from(table)
      .select(getSelect(table))

    if (error) throw error
    return { data: toCamelCase(data) }
  },

  async post(endpoint, body) {
    const table = endpoint.replace('/api/', '')
    const dataToInsert = toSnakeCase(body)

    const { data, error } = await supabase
      .from(table)
      .insert(dataToInsert)
      .select()
      .single()

    if (error) throw error
    return { data: toCamelCase(data) }
  },

  async put(endpoint, body) {
    const parts = endpoint.split('/')
    const id = parts.pop()
    const table = parts.pop()

    const { data, error } = await supabase
      .from(table)
      .update(toSnakeCase(body))
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data: toCamelCase(data) }
  },

  async delete(endpoint) {
    const parts = endpoint.split('/')
    const id = parts.pop()
    const table = parts.pop()

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
    return { data: null }
  }
}

export default api
