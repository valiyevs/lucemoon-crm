import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Badge, EmptyState } from '../components/ui'
import { Receipt, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react'
import api from '../api'

const statusConfig = {
  DRAFT: { label: 'Qaralama', variant: 'default', icon: Clock },
  SENT: { label: 'Göndərilib', variant: 'info', icon: Clock },
  PAID: { label: 'Ödənilib', variant: 'success', icon: CheckCircle },
  OVERDUE: { label: 'Gecikmiş', variant: 'danger', icon: AlertCircle },
  CANCELLED: { label: 'Ləğv edilib', variant: 'danger', icon: AlertCircle },
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchInvoices() }, [])

  const fetchInvoices = async () => {
    try {
      setError(null)
      const res = await api.get('/invoices')
      setInvoices(res.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Məlumatları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.order?.account?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value) => value ? `${value.toLocaleString('az-AZ')} ₼` : '-'

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fakturalar</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredInvoices.length} faktura qeydə alınıb</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Search */}
      {!loading && invoices.length > 0 && (
        <Card className="mb-6 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Faktura axtar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>
      )}

      {filteredInvoices.length === 0 && !loading ? (
        <EmptyState icon={Receipt} title="Faktura yoxdur" description="Sifarişlərdən faktura yaradın" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Nömrə</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Sifariş</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Müştəri</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Məbləğ</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                          <Receipt className="text-rose-600" size={20} />
                        </div>
                        <span className="font-medium text-slate-800">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{invoice.order?.orderNumber || '-'}</td>
                    <td className="py-4 px-4 text-slate-600">{invoice.order?.account?.name || '-'}</td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800">{formatCurrency(invoice.total)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={statusConfig[invoice.status]?.variant || 'default'}>
                        {statusConfig[invoice.status]?.label || invoice.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock size={14} />
                        {new Date(invoice.issueDate).toLocaleDateString('az-AZ')}
                      </div>
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