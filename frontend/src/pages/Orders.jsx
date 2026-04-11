import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Badge, Loading, EmptyState } from '../components/ui'
import { ShoppingCart, ArrowUpRight, Clock, Truck } from 'lucide-react'
import api from '../api'

const statusConfig = {
  PENDING: { label: 'Gozleyir', variant: 'warning' },
  CONFIRMED: { label: 'Tesdiqlenib', variant: 'info' },
  PROCESSING: { label: 'Islenilir', variant: 'info' },
  SHIPPED: { label: 'Gonderilib', variant: 'purple' },
  DELIVERED: { label: 'Catdirilib', variant: 'success' },
  CANCELLED: { label: 'Legv edilib', variant: 'danger' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    try { const res = await api.get('/orders'); setOrders(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return <Layout><Loading /></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sifarişlər</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} aktiv sifaris</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Sifaris yoxdur" description="Təkliflərdən sifarişlər yaradın" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Nomre</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Account</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Mebleg</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Tarix</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-slate-500">Emeliyyat</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="text-emerald-600" size={20} />
                        </div>
                        <span className="font-medium text-slate-800">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{order.account?.name || '-'}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800">{order.total} ₼</span>
                    </td>
                    <td className="py-4 px-4"><Badge variant={statusConfig[order.status]?.variant || 'default'}>{statusConfig[order.status]?.label || order.status}</Badge></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock size={14} />
                        {new Date(order.createdAt).toLocaleDateString('az-AZ')}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Etrafli <ArrowUpRight size={16} />
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