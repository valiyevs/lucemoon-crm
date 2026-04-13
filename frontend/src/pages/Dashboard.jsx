import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Badge, Avatar } from '../components/ui'
import { Target, FileText, ShoppingCart, Receipt, TrendingUp, ArrowUpRight, Kanban, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'
import api from '../api'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, quotes: 0, orders: 0, invoices: 0 })
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [leadsRes, quotesRes, ordersRes, invoicesRes] = await Promise.all([
        api.get('/leads'),
        api.get('/quotes'),
        api.get('/orders'),
        api.get('/invoices'),
      ])

      const leads = leadsRes.data || []
      const quotes = quotesRes.data || []
      const orders = ordersRes.data || []
      const invoices = invoicesRes.data || []

      // Calculate real stats
      const activeLeads = leads.filter(l => !['WON', 'LOST'].includes(l.status)).length
      const pendingQuotes = quotes.filter(q => q.status === 'DRAFT' || q.status === 'SENT').length
      const activeOrders = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status)).length
      const paidInvoices = invoices.filter(i => i.status === 'PAID').length
      const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.total || 0), 0)

      setStats({
        leads: activeLeads,
        quotes: pendingQuotes,
        orders: activeOrders,
        invoices: paidInvoices,
        totalRevenue,
        totalLeads: leads.length,
        totalQuotes: quotes.length,
        totalOrders: orders.length,
        totalInvoices: invoices.length,
      })

      // Pipeline data from real leads
      const pipelineData = [
        { stage: 'Yeni', count: leads.filter(l => l.status === 'NEW').length, color: '#3b82f6' },
        { stage: 'Əlaqə', count: leads.filter(l => l.status === 'CONTACTED').length, color: '#f59e0b' },
        { stage: 'Keyfiyyetli', count: leads.filter(l => l.status === 'QUALIFIED').length, color: '#8b5cf6' },
        { stage: 'Təklif', count: leads.filter(l => l.status === 'PROPOSAL').length, color: '#06b6d4' },
        { stage: 'Danışıq', count: leads.filter(l => l.status === 'NEGOTIATION').length, color: '#f97316' },
      ]

      setPipelineData(pipelineData)
      setRecentLeads(leads.slice(0, 5))
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Məlumatları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const [pipelineData, setPipelineData] = useState([
    { stage: 'Yeni', count: 0, color: '#3b82f6' },
    { stage: 'Əlaqə', count: 0, color: '#f59e0b' },
    { stage: 'Keyfiyyetli', count: 0, color: '#8b5cf6' },
    { stage: 'Təklif', count: 0, color: '#06b6d4' },
    { stage: 'Danışıq', count: 0, color: '#f97316' },
  ])

  const revenueData = [
    { name: 'Yan', value: 45000 },
    { name: 'Fev', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 },
    { name: 'May', value: 55000 },
    { name: 'Iyn', value: 67000 },
  ]

  const leadStatusBadge = (status) => {
    const variants = {
      NEW: 'info',
      CONTACTED: 'warning',
      QUALIFIED: 'purple',
      PROPOSAL: 'info',
      NEGOTIATION: 'warning',
      WON: 'success',
      LOST: 'danger',
    }
    const labels = {
      NEW: 'Yeni',
      CONTACTED: 'Əlaqə qurulub',
      QUALIFIED: 'Keyfiyyətli',
      PROPOSAL: 'Təklif verilib',
      NEGOTIATION: 'Danışıqda',
      WON: 'Qazanan',
      LOST: 'İtirilib',
    }
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>
  }

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Xoş gəldiniz!</h1>
        <p className="text-slate-500">Satış fəaliyyətinizi izləyin və idarə edin</p>
      </div>

      {/* Stats Cards - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Aktiv Lead-lər</p>
              <p className="text-3xl font-bold text-slate-800">{stats.leads}</p>
              <p className="text-xs text-slate-500 mt-1">
                Cəmi: {stats.totalLeads || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Gözləyən Təkliflər</p>
              <p className="text-3xl font-bold text-slate-800">{stats.quotes}</p>
              <p className="text-xs text-slate-500 mt-1">
                Cəmi: {stats.totalQuotes || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Aktiv Sifarişlər</p>
              <p className="text-3xl font-bold text-slate-800">{stats.orders}</p>
              <p className="text-xs text-slate-500 mt-1">
                Cəmi: {stats.totalOrders || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Ödənilmiş Fakturalar</p>
              <p className="text-3xl font-bold text-slate-800">{stats.invoices}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span className="font-medium">{(stats.totalRevenue || 0).toLocaleString('az-AZ')} ₼</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Receipt className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue Chart */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Satış Dinamikası</h3>
              <p className="text-sm text-slate-500">Aylıq gəlir trendi</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg font-medium">Ay</button>
              <button className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">Rüb</button>
              <button className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">İl</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value.toLocaleString('az-AZ')} ₼`, 'Gəlir']}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pipeline Funnel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Satış Boru</h3>
          <div className="space-y-3">
            {pipelineData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: item.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.stage}</span>
                    <span className="font-semibold text-slate-800">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(item.count / 15) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Section - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Leads */}
        <Card className="col-span-1 lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Son Lead-lər</h3>
              <p className="text-sm text-slate-500">Ən son əlavə edilən leadlər</p>
            </div>
            <Link to="/pipeline" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Bütün leadlər <ArrowUpRight size={16} />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-500">Hələ lead yoxdur</p>
              <Link to="/pipeline" className="text-blue-600 text-sm mt-2 inline-block hover:underline">İlk lead-i əlavə et</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  to={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={`${lead.user?.firstName} ${lead.user?.lastName}`} size="md" />
                    <div>
                      <p className="font-medium text-slate-800 group-hover:text-blue-600 transition">{lead.title}</p>
                      <p className="text-sm text-slate-500">{lead.account?.name || 'Account yoxdur'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {lead.value && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">{lead.value.toLocaleString('az-AZ')} ₼</p>
                      </div>
                    )}
                    {leadStatusBadge(lead.status)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions & Status */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Sürətli Əməliyyatlar</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/pipeline" className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-150 transition group">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <Kanban className="text-white" size={16} />
                </div>
                <p className="font-medium text-slate-800 text-sm">Pipelini aç</p>
              </Link>

              <Link to="/leads" className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-150 transition group">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <Target className="text-white" size={16} />
                </div>
                <p className="font-medium text-slate-800 text-sm">Yeni Lead</p>
              </Link>

              <Link to="/quotes" className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl hover:from-emerald-100 hover:to-emerald-150 transition group">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <FileText className="text-white" size={16} />
                </div>
                <p className="font-medium text-slate-800 text-sm">Yeni Təklif</p>
              </Link>

              <Link to="/accounts" className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:from-amber-100 hover:to-amber-150 transition group">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <svg className="text-white" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="font-medium text-slate-800 text-sm">Yeni Müştəri</p>
              </Link>
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-500 mb-4">Diqqət tələb edən</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-slate-800">3 teklif vaxtı keçib</p>
                  <p className="text-xs text-slate-500 mt-0.5">Baxıb yeniləyin</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <Clock className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-slate-800">2 sifariş göndərilməyi gözləyir</p>
                  <p className="text-xs text-slate-500 mt-0.5">Çatdırılma statusunu yeniləyin</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium text-slate-800">2 faktura ödənilib</p>
                  <p className="text-xs text-slate-500 mt-0.5">Ödəniş tarixcəsi</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}