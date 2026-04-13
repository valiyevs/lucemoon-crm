import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Button, Badge, Select, Loading } from '../components/ui'
import { ArrowLeft, Truck, Package, FileText } from 'lucide-react'
import api from '../api'

const statusConfig = {
  PENDING: { label: 'Gozleyir', variant: 'warning' },
  CONFIRMED: { label: 'Tesdiqlenib', variant: 'info' },
  PROCESSING: { label: 'Islenilir', variant: 'info' },
  SHIPPED: { label: 'Gonderilib', variant: 'purple' },
  DELIVERED: { label: 'Catdirilib', variant: 'success' },
  CANCELLED: { label: 'Legv edilib', variant: 'danger' },
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchOrder() }, [id])

  const fetchOrder = async () => {
    try {
      setError(null)
      const res = await api.get(`/orders/${id}`)
      setOrder(res.data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Sifariş yüklənə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status) => {
    try {
      setActionLoading(true)
      await api.put(`/orders/${id}`, { status })
      setError(null)
      fetchOrder()
    } catch (err) {
      console.error('Update error:', err)
      setError('Status yenilənə bilmədi')
    } finally {
      setActionLoading(false)
    }
  }

  const createInvoice = async () => {
    try {
      setActionLoading(true)
      await api.post('/invoices', { orderId: order.id })
      setError(null)
      navigate('/invoices')
    } catch (err) {
      console.error('Create invoice error:', err)
      setError('Faktura yaradıla bilmədi')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  )

  if (!order) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-slate-500">Sifariş tapılmadı</p>
        <Button variant="secondary" onClick={() => navigate('/orders')} className="mt-4">Geriyə qayıt</Button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/orders')} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{order.orderNumber}</h1>
              <Badge variant={statusConfig[order.status]?.variant || 'default'} size="lg">
                {statusConfig[order.status]?.label || order.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {order.account?.name} • {new Date(order.createdAt).toLocaleDateString('az-AZ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={order.status} onChange={e => updateStatus(e.target.value)} className="w-40" disabled={actionLoading}>
            <option value="PENDING">Gözləyir</option>
            <option value="CONFIRMED">Təsdiqlənib</option>
            <option value="PROCESSING">İşlənilir</option>
            <option value="SHIPPED">Göndərilib</option>
            <option value="DELIVERED">Çatdırılıb</option>
            <option value="CANCELLED">Ləğv edilib</option>
          </Select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Items */}
        <Card className="col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Mehsullar</h3>
            {order.items?.length > 0 ? (
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Package className="text-amber-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.product?.name}</p>
                        <p className="text-sm text-slate-500">{item.quantity} x {item.unitPrice} ₼</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800">{item.total} ₼</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">Mehsul yoxdur</p>
            )}

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Araliq:</span>
                  <span>{order.subtotal} ₼</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>DV:</span>
                  <span>{order.taxAmount} ₼</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t">
                  <span>Cemi:</span>
                  <span>{order.total} ₼</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Sifaris melumatlari</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Account</p>
                <p className="font-medium text-slate-800">{order.account?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Contact</p>
                <p className="text-slate-700">{order.contact ? `${order.contact.firstName} ${order.contact.lastName}` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Yaradilma</p>
                <p className="text-slate-700">{new Date(order.createdAt).toLocaleString('az-AZ')}</p>
              </div>
            </div>

            {order.invoices?.length === 0 && order.status === 'DELIVERED' && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button variant="primary" className="w-full" onClick={createInvoice}>
                  <FileText className="mr-2" size={18} />
                  Invoice yaradil
                </Button>
              </div>
            )}

            {order.invoices?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-3">Invoice-lar</p>
                <div className="space-y-2">
                  {order.invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-700">{inv.invoiceNumber}</span>
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}