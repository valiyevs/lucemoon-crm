import api from '../api'

// Parse CSV string to array of objects
export function parseCSV(csvString) {
  const lines = csvString.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue

    const row = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx] || ''
    })
    data.push(row)
  }

  return data
}

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

// Import Accounts from CSV data
export async function importAccounts(csvData) {
  const results = { success: 0, errors: [] }

  for (const row of csvData) {
    try {
      if (!row.name) {
        results.errors.push({ row: csvData.indexOf(row) + 2, error: 'Name is required' })
        continue
      }

      await api.post('/accounts', {
        name: row.name,
        type: row.type || 'Company',
        industry: row.industry || '',
        phone: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        city: row.city || ''
      })
      results.success++
    } catch (err) {
      results.errors.push({ row: csvData.indexOf(row) + 2, error: err.message || 'Failed to import' })
    }
  }

  return results
}

// Import Contacts from CSV data
export async function importContacts(csvData) {
  const results = { success: 0, errors: [] }

  // First get accounts to map names to IDs
  const accountsRes = await api.get('/accounts')
  const accounts = accountsRes.data || []
  const accountMap = {}
  accounts.forEach(a => { accountMap[a.name.toLowerCase()] = a.id })

  for (const row of csvData) {
    try {
      if (!row.firstName || !row.lastName) {
        results.errors.push({ row: csvData.indexOf(row) + 2, error: 'First name and Last name are required' })
        continue
      }

      await api.post('/contacts', {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email || '',
        phone: row.phone || '',
        position: row.position || '',
        accountId: row.account ? accountMap[row.account.toLowerCase()] || null : null
      })
      results.success++
    } catch (err) {
      results.errors.push({ row: csvData.indexOf(row) + 2, error: err.message || 'Failed to import' })
    }
  }

  return results
}

// Import Products from CSV data
export async function importProducts(csvData) {
  const results = { success: 0, errors: [] }

  for (const row of csvData) {
    try {
      if (!row.sku || !row.name || !row.price) {
        results.errors.push({ row: csvData.indexOf(row) + 2, error: 'SKU, Name and Price are required' })
        continue
      }

      await api.post('/products', {
        sku: row.sku,
        name: row.name,
        description: row.description || '',
        category: row.category || '',
        unit: row.unit || 'ədəd',
        price: parseFloat(row.price) || 0,
        costPrice: row.costPrice ? parseFloat(row.costPrice) : null,
        stock: parseInt(row.stock) || 0
      })
      results.success++
    } catch (err) {
      results.errors.push({ row: csvData.indexOf(row) + 2, error: err.message || 'Failed to import' })
    }
  }

  return results
}

// Import Leads from CSV data
export async function importLeads(csvData) {
  const results = { success: 0, errors: [] }

  // Get accounts and users
  const [accountsRes, usersRes] = await Promise.all([api.get('/accounts'), api.get('/users')])
  const accounts = accountsRes.data || []
  const users = usersRes.data || []
  const accountMap = {}
  accounts.forEach(a => { accountMap[a.name.toLowerCase()] = a.id })
  const userMap = {}
  users.forEach(u => { userMap[`${u.firstName} ${u.lastName}`.toLowerCase()] = u.id })

  for (const row of csvData) {
    try {
      if (!row.title) {
        results.errors.push({ row: csvData.indexOf(row) + 2, error: 'Title is required' })
        continue
      }

      await api.post('/leads', {
        title: row.title,
        description: row.description || '',
        value: row.value ? parseFloat(row.value) : null,
        source: row.source || '',
        status: row.status || 'NEW',
        accountId: row.account ? accountMap[row.account.toLowerCase()] || null : null
      })
      results.success++
    } catch (err) {
      results.errors.push({ row: csvData.indexOf(row) + 2, error: err.message || 'Failed to import' })
    }
  }

  return results
}

// Read CSV file and return parsed data
export function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target.result
        const data = parseCSV(csv)
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file)
  })
}
