import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Badge, EmptyState, Button, Input, Select } from '../components/ui'
import { FileText, ArrowUpRight, Clock, Plus, Search, X, Package } from 'lucide-react'
import api from '../api'

const statusConfig = {
  DRAFT: { label: 'Qaralama', variant: 'default' },
  SENT: { label: 'Göndərilib', variant: 'info' },
  ACCEPTED: { label: 'Qəbul olunub', variant: 'success' },
  REJECTED: { label: 'Rədd edilib', variant: 'danger' },
}

export default function Quotes() {
  const [quotes, setQuotes] = useState([])
  const [accounts, setAccounts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    accountId: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0, total: 0 }]
  })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [quotesRes, accountsRes, productsRes] = await Promise.all([
        api.get('/quotes'),
        api.get('/accounts'),
        api.get('/products')
      ])
      setQuotes(quotesRes.data || [])
      setAccounts(accountsRes.data || [])
      setProducts(productsRes.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Məlumatları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      productId: productId,
      unitPrice: product?.price || 0,
      total: (product?.price || 0) * newItems[index].quantity
    }
    setFormData({ ...formData, items: newItems })
  }

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      quantity: parseInt(quantity) || 0,
      total: newItems[index].unitPrice * (parseInt(quantity) || 0)
    }
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: 0, total: 0 }]
    })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
    const taxRate = 0.18
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.accountId) {
      setError('Müştəri seçin')
      return
    }
    if (formData.items.some(i => !i.productId)) {
      setError('Məhsul seçin')
      return
    }

    try {
      setSaving(true)
      const { subtotal, taxAmount, total } = calculateTotals()
      await api.post('/quotes', {
        accountId: parseInt(formData.accountId),
        items: formData.items.map(i => ({
          productId: parseInt(i.productId),
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total
        })),
        subtotal,
        taxRate: 0.18,
        taxAmount,
        total,
        status: 'DRAFT'
      })
      setShowForm(false)
      setFormData({ accountId: '', items: [{ productId: '', quantity: 1, unitPrice: 0, total: 0 }] })
      setError(null)
      fetchData()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Təklif yaradıla bilmədi')
    } finally {
      setSaving(false)
    }
  }

  const filteredQuotes = quotes.filter(q =>
    q.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.account?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value) => value ? `${value.toLocaleString('az-AZ')} ₼` : '-'
  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Təkliflər</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredQuotes.length} təklif hazırlanıb</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setError(null) }} icon={Plus}>
          Yeni Təklif
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* New Quote Form */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Yeni Təklif</h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-purple-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Select
                label="Müştəri"
                value={formData.accountId}
                onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                required
              >
                <option value="">Müştəri seçin</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium text-slate-700">Məhsullar</label>
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <select
                    value={item.productId}
                    onChange={e => handleProductSelect(idx, e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  >
                    <option value="">Məhsul seçin</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price} ₼</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(idx, e.target.value)}
                    min="1"
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center"
                    placeholder="Say"
                  />
                  <span className="w-24 text-right font-medium">{item.total || 0} ₼</span>
                  {formData.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                + Məhsul əlavə et
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
              <Button type="submit" loading={saving}>Yaradın</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Search */}
      {!loading && quotes.length > 0 && (
        <Card className="mb-6 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Təklif axtar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>
      )}

      {filteredQuotes.length === 0 && !loading ? (
        <EmptyState icon={FileText} title="Təklif yoxdur" description="İlk təklifinizi yaradın" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Nömrə</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Müştəri</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Məbləğ</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Tarix</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-slate-500">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(quote => (
                  <tr key={quote.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="text-purple-600" size={20} />
                        </div>
                        <span className="font-medium text-slate-800">{quote.quoteNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{quote.account?.name || '-'}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800">{formatCurrency(quote.total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={statusConfig[quote.status]?.variant || 'default'}>
                        {statusConfig[quote.status]?.label || quote.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock size={14} />
                        {new Date(quote.createdAt).toLocaleDateString('az-AZ')}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link to={`/quotes/${quote.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Ətraflı <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Layout>
  )
}
