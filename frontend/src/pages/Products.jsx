import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Button, Input, Badge, Pagination, Alert } from '../components/ui'
import { SkeletonGrid } from '../components/Skeleton'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useDebounce } from '../hooks/useDebounce'
import { Plus, Search, Package, Tag, AlertTriangle, TrendingDown } from 'lucide-react'
import api from '../api'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ sku: '', name: '', description: '', category: '', unit: 'ədəd', price: '', costPrice: '', stock: 0 })
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const debouncedSearch = useDebounce(searchTerm)

  useEffect(() => { fetchData() }, [page, debouncedSearch, selectedCategory])

  const fetchData = async () => {
    try {
      setError(null)
      const params = new URLSearchParams({ page, limit: 20 })
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (selectedCategory) params.append('category', selectedCategory)
      const [productsRes, categoriesRes] = await Promise.all([api.get(`/products?${params}`), api.get('/products/categories')])
      setProducts(productsRes.data.data || [])
      setTotalPages(productsRes.data.pagination?.totalPages || 1)
      setCategories(categoriesRes.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Məlumatları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.sku.trim() || !formData.name.trim() || !formData.category.trim() || !formData.price) {
      setError('SKU, Ad, Kateqoriya və Qiymət daxil edin')
      return
    }
    try {
      await api.post('/products', {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stock: parseInt(formData.stock) || 0
      })
      setShowForm(false)
      setFormData({ sku: '', name: '', description: '', category: '', unit: 'ədəd', price: '', costPrice: '', stock: 0 })
      setError(null)
      fetchData()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Məhsul əlavə edilə bilmədi')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      setDeletingId(confirmDelete)
      await api.delete(`/products/${confirmDelete}`)
      setConfirmDelete(null)
      fetchData()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Silinə bilmədi: ' + (err.message || 'Xəta baş verdi'))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products

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
        <Button onClick={() => { setShowForm(!showForm); setError(null) }} icon={Plus}>
          Yeni Məhsul
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Məhsulu sil"
        message="Bu məhsulu silmək istəyirsiniz? Bu əməliyyat geri alına bilməz."
        loading={!!deletingId}
      />

      {/* New Product Form */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Yeni Məhsul Əlavə Et</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input label="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="CABLE-001" required />
              <Input label="Ad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="NYM 3x2.5 mm²" required />
              <Input label="Kateqoriya" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Kablolar" required />
              <Input label="Vahid" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="ədəd, metr" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
      {loading ? (
        <SkeletonGrid count={8} />
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Məhsul tapılmadı</h3>
          <p className="text-slate-500 mb-4">Axtarış criteria-nı dəyişin və ya yeni məhsul əlavə edin</p>
          <Button onClick={() => setShowForm(true)} icon={Plus}>Yeni Məhsul</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.stock)
            const profitMargin = product.costPrice ? ((product.price - product.costPrice) / product.price * 100).toFixed(0) : null

            return (
              <Card key={product.id} hover className="p-5 group relative cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(product.id) }}
                  disabled={deletingId === product.id}
                  className="absolute top-3 right-3 p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-50 opacity-0 group-hover:opacity-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

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

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </Layout>
  )
}