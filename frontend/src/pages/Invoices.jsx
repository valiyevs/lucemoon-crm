import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Badge, Loading, EmptyState } from '../components/ui'
import { Receipt, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../api'

const statusConfig = {
  DRAFT: { label: 'Qaralama', variant: 'default', icon: Clock },
  SENT: { label: 'Gonderilib', variant: 'info', icon: Clock },
  PAID: { label: 'Odenilib', variant: 'success', icon: CheckCircle },
  OVERDUE: { label: 'Gec olub', variant: 'danger', icon: AlertCircle },
  CANCELLED: { label: 'Legv edilib', variant: 'danger', icon: AlertCircle },
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchInvoices() }, [])

  const fetchInvoices = async () => {
    try { const res = await api.get('/invoices'); setInvoices(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/invoices/${id}`, { status })
      fetchInvoices()
    } catch (err) { console.error(err) }
  }

  if (loading) return <Layout><Loading /></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fakturalar</h1>
          <p className="text-slate-500 text-sm mt-1">{invoices.length} faktura qeyde alinib</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="Faktura yoxdur" description="Sifarislerden faktura yaradın" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Nomre</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Sifaris</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Account</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Mebleg</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Tarix</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => {
                  const StatusIcon = statusConfig[invoice.status]?.icon || Clock
                  return (
                    <tr key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
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
                        <span className="font-bold text-slate-800">{invoice.total} ₼</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusConfig[invoice.status]?.variant || 'default'}>
                            {statusConfig[invoice.status]?.label || invoice.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <Clock size={14} />
                          {new Date(invoice.issueDate).toLocaleDateString('az-AZ')}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </Layout>
  )
}