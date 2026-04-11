import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Badge, Loading, EmptyState, Avatar } from '../components/ui'
import { FileText, ArrowUpRight, Clock } from 'lucide-react'
import api from '../api'

const statusConfig = {
  DRAFT: { label: 'Qaralama', variant: 'default' },
  SENT: { label: 'Gonderilib', variant: 'info' },
  ACCEPTED: { label: 'Qebul olunub', variant: 'success' },
  REJECTED: { label: 'Redd edilib', variant: 'danger' },
}

export default function Quotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchQuotes() }, [])

  const fetchQuotes = async () => {
    try { const res = await api.get('/quotes'); setQuotes(res.data) }
    catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return <Layout><Loading /></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Təkliflər</h1>
          <p className="text-slate-500 text-sm mt-1">{quotes.length} teklif hazirlanib</p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <EmptyState icon={FileText} title="Teklif yoxdur" description="İlk təklifinizi yaradın" />
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
                {quotes.map(quote => (
                  <tr key={quote.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
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
                      <span className="font-bold text-slate-800">{quote.total} ₼</span>
                    </td>
                    <td className="py-4 px-4"><Badge variant={statusConfig[quote.status]?.variant || 'default'}>{statusConfig[quote.status]?.label || quote.status}</Badge></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <Clock size={14} />
                        {new Date(quote.createdAt).toLocaleDateString('az-AZ')}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link to={`/quotes/${quote.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
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