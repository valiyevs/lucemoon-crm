import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Badge } from '../components/ui'
import { Plus, Search, Package, Tag, AlertTriangle, TrendingDown } from 'lucide-react'
import api from '../api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ sku: '', name: '', description: '', category: '', unit: 'ədəd', price: '', costPrice: '', stock: 0 })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([api.get('/products'), api.get('/products/categories')])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stock: parseInt(formData.stock)
      })
      setShowForm(false)
      setFormData({ sku: '', name: '', description: '', category: '', unit: 'ədəd', price: '', costPrice: '', stock: 0 })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (value) => `${value.toLocaleString('az-AZ')} ₼`

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Stok yoxdur', variant: 'danger', bg: 'bg-red-50', color: 'text-red-600' }
    if (stock < 10) return { label: 'Az qalib', variant: 'warning', bg: 'bg-amber-50', color: 'text-amber-600' }
    return { label: 'Normal', variant: 'success', bg: 'bg-emerald-50', color: 'text-emerald-600' }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Məhsul Kataloqu</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} məhsul qeydə alınıb</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={Plus}>
          Yeni Məhsul
        </Button>
      </div>

      {/* New Product Form */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Yeni Məhsul Əlavə Et</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-4 gap-4">
              <Input label="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="CABLE-001" required />
              <Input label="Ad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="NYM 3x2.5 mm²" required />
              <Input label="Kateqoriya" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Kablolar" required />
              <Input label="Vahid" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="ədəd, metr" />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <Input label="Satış qiyməti (₼)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" required />
              <Input label="Maya qiyməti (₼)" type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} placeholder="0.00" />
              <Input label="Anbar sayı" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="0" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
              <Button type="submit">Əlavə et</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search & Categories */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Məhsul axtar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Hamısı
            </button>
            {categories.map(c => (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${selectedCategory === c.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {c.name} ({c.count})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Məhsul tapılmadı</h3>
          <p className="text-slate-500 mb-4">Axtarış criteria-nı dəyişin və ya yeni məhsul əlavə edin</p>
          <Button onClick={() => setShowForm(true)} icon={Plus}>Yeni Məhsul</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.stock)
            const profitMargin = product.costPrice ? ((product.price - product.costPrice) / product.price * 100).toFixed(0) : null

            return (
              <Card key={product.id} hover className="p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package className="text-white" size={28} />
                  </div>
                  <Badge variant="warning">{product.category}</Badge>
                </div>

                <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-600 transition mb-1">{product.name}</h3>
                <p className="text-sm text-slate-400 mb-4">SKU: {product.sku}</p>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(product.price)}</p>
                    {profitMargin && (
                      <p className="text-xs text-emerald-600 mt-1">Marja: {profitMargin}%</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{product.stock} {product.unit}</p>
                    {product.costPrice && (
                      <p className="text-xs text-slate-400">Maya: {formatCurrency(product.costPrice)}</p>
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-3 border-t ${stockStatus.bg} px-3 py-2 rounded-lg`}>
                  <span className={`text-sm font-medium ${stockStatus.color}`}>{stockStatus.label}</span>
                  {product.stock < 10 && product.stock > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle size={14} />
                      <span className="text-xs">Az qalib</span>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </Layout>
  )
}