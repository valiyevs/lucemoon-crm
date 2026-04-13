import api from '../api'

// Convert data to CSV format
export function convertToCSV(data, headers) {
  const headerRow = headers.map(h => h.label).join(',')
  const rows = data.map(item => {
    return headers.map(h => {
      let value = item[h.key]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') {
        value = JSON.stringify(value).replace(/"/g, '""')
      } else {
        value = String(value).replace(/"/g, '""')
      }
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`
      }
      return value
    }).join(',')
  })
  return [headerRow, ...rows].join('\n')
}

// Download CSV file
export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// Export Leads to CSV
export async function exportLeads() {
  try {
    const res = await api.get('/leads')
    const leads = res.data || []

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Başlıq' },
      { key: 'description', label: 'Təsvir' },
      { key: 'value', label: 'Qiymət' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Mənbə' },
      { key: 'accountName', label: 'Account' },
      { key: 'userName', label: 'Satıcı' },
      { key: 'createdAt', label: 'Yaradılma' },
    ]

    const data = leads.map(lead => ({
      ...lead,
      accountName: lead.account?.name || '',
      userName: lead.user ? `${lead.user.firstName} ${lead.user.lastName}` : '',
      createdAt: new Date(lead.createdAt).toLocaleDateString('az-AZ')
    }))

    const csv = convertToCSV(data, headers)
    downloadCSV(csv, 'leads')
    return { success: true }
  } catch (err) {
    console.error('Export leads error:', err)
    throw err
  }
}

// Export Accounts to CSV
export async function exportAccounts() {
  try {
    const res = await api.get('/accounts')
    const accounts = res.data || []

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Ad' },
      { key: 'type', label: 'Tip' },
      { key: 'industry', label: 'Industriya' },
      { key: 'phone', label: 'Telefon' },
      { key: 'email', label: 'Email' },
      { key: 'city', label: 'Şəhər' },
      { key: 'createdAt', label: 'Yaradılma' },
    ]

    const data = accounts.map(acc => ({
      ...acc,
      createdAt: new Date(acc.createdAt).toLocaleDateString('az-AZ')
    }))

    const csv = convertToCSV(data, headers)
    downloadCSV(csv, 'accounts')
    return { success: true }
  } catch (err) {
    console.error('Export accounts error:', err)
    throw err
  }
}

// Export Orders to CSV
export async function exportOrders() {
  try {
    const res = await api.get('/orders')
    const orders = res.data || []

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'orderNumber', label: 'Sifariş №' },
      { key: 'accountName', label: 'Müştəri' },
      { key: 'subtotal', label: 'Aralıq' },
      { key: 'taxAmount', label: 'DV' },
      { key: 'total', label: 'Cəmi' },
      { key: 'status', label: 'Status' },
      { key: 'userName', label: 'Satıcı' },
      { key: 'createdAt', label: 'Yaradılma' },
    ]

    const data = orders.map(order => ({
      ...order,
      accountName: order.account?.name || '',
      userName: order.user ? `${order.user.firstName} ${order.user.lastName}` : '',
      createdAt: new Date(order.createdAt).toLocaleDateString('az-AZ')
    }))

    const csv = convertToCSV(data, headers)
    downloadCSV(csv, 'orders')
    return { success: true }
  } catch (err) {
    console.error('Export orders error:', err)
    throw err
  }
}

// Export Invoices to CSV
export async function exportInvoices() {
  try {
    const res = await api.get('/invoices')
    const invoices = res.data || []

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'invoiceNumber', label: 'Faktura №' },
      { key: 'orderNumber', label: 'Sifariş №' },
      { key: 'accountName', label: 'Müştəri' },
      { key: 'total', label: 'Məbləğ' },
      { key: 'status', label: 'Status' },
      { key: 'issueDate', label: 'Tarix' },
      { key: 'dueDate', label: 'Son Tarix' },
    ]

    const data = invoices.map(inv => ({
      ...inv,
      orderNumber: inv.order?.orderNumber || '',
      accountName: inv.order?.account?.name || '',
      issueDate: new Date(inv.issueDate).toLocaleDateString('az-AZ'),
      dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('az-AZ') : ''
    }))

    const csv = convertToCSV(data, headers)
    downloadCSV(csv, 'invoices')
    return { success: true }
  } catch (err) {
    console.error('Export invoices error:', err)
    throw err
  }
}

// Export Quotes to CSV
export async function exportQuotes() {
  try {
    const res = await api.get('/quotes')
    const quotes = res.data || []

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'quoteNumber', label: 'Təklif №' },
      { key: 'accountName', label: 'Müştəri' },
      { key: 'subtotal', label: 'Aralıq' },
      { key: 'taxAmount', label: 'DV' },
      { key: 'total', label: 'Cəmi' },
      { key: 'status', label: 'Status' },
      { key: 'validUntil', label: 'Bitmə tarixi' },
      { key: 'createdAt', label: 'Yaradılma' },
    ]

    const data = quotes.map(quote => ({
      ...quote,
      accountName: quote.account?.name || '',
      validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('az-AZ') : '',
      createdAt: new Date(quote.createdAt).toLocaleDateString('az-AZ')
    }))

    const csv = convertToCSV(data, headers)
    downloadCSV(csv, 'quotes')
    return { success: true }
  } catch (err) {
    console.error('Export quotes error:', err)
    throw err
  }
}

// Export Contacts to CSV
export async function exportContacts() {
  try {
    const res = await api.get('/contacts')
    const contacts = res.data || []

    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'firstName', label: 'Ad' },
      { key: 'lastName', label: 'Soyad' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefon' },
      { key: 'position', label: 'Vəzifə' },
      { key: 'accountName', label: 'Account' },
      { key: 'createdAt', label: 'Yaradılma' },
    ]

    const data = contacts.map(contact => ({
      ...contact,
      accountName: contact.account?.name || '',
      createdAt: new Date(contact.createdAt).toLocaleDateString('az-AZ')
    }))

    const csv = convertToCSV(data, headers)
    downloadCSV(csv, 'contacts')
    return { success: true }
  } catch (err) {
    console.error('Export contacts error:', err)
    throw err
  }
}
