import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Button, Badge, Select, Loading, Avatar } from '../components/ui'
import { ArrowLeft, Save, FileText, Package, Check } from 'lucide-react'
import api from '../api'

const statusConfig = {
  DRAFT: { label: 'Qaralama', variant: 'default' },
  SENT: { label: 'Gonderilib', variant: 'info' },
  ACCEPTED: { label: 'Qebul olunub', variant: 'success' },
  REJECTED: { label: 'Redd edilib', variant: 'danger' },
}

export default function QuoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchQuote() }, [id])

  const fetchQuote = async () => {
    try { const res = await api.get(`/quotes/${id}`); setQuote(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const updateStatus = async (status) => {
    try {
      await api.put(`/quotes/${id}`, { status })
      fetchQuote()
    } catch (err) { console.error(err) }
  }

  if (loading) return <Layout><Loading /></Layout>
  if (!quote) return <Layout><p>Teklif tapilmadi</p></Layout>

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/quotes')} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{quote.quoteNumber}</h1>
              <Badge variant={statusConfig[quote.status]?.variant || 'default'} size="lg">
                {statusConfig[quote.status]?.label || quote.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {quote.account?.name} • {new Date(quote.createdAt).toLocaleDateString('az-AZ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {quote.status === 'DRAFT' && (
            <Button variant="primary" onClick={() => updateStatus('SENT')}>Gonder</Button>
          )}
          {quote.status === 'SENT' && (
            <>
              <Button variant="danger" onClick={() => updateStatus('REJECTED')}>Redd et</Button>
              <Button variant="success" onClick={() => updateStatus('ACCEPTED')}>Qebul et</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Items */}
        <Card className="col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Mehsullar</h3>
            {quote.items?.length > 0 ? (
              <div className="space-y-3">
                {quote.items.map(item => (
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
                  <span>{quote.subtotal} ₼</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>DV ({quote.taxRate * 100}%):</span>
                  <span>{quote.taxAmount} ₼</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-800 pt-2 border-t">
                  <span>Cemi:</span>
                  <span>{quote.total} ₼</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Melumatlar</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Account</p>
                <p className="font-medium text-slate-800">{quote.account?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Satisci</p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar name={`${quote.user?.firstName} ${quote.user?.lastName}`} size="sm" />
                  <span className="text-slate-700">{quote.user?.firstName} {quote.user?.lastName}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Yaradilma tarixi</p>
                <p className="text-slate-700">{new Date(quote.createdAt).toLocaleString('az-AZ')}</p>
              </div>
            </div>

            {quote.status === 'ACCEPTED' && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button variant="success" className="w-full">
                  <Check className="mr-2" size={18} />
                  Sifaris yaradildi
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}