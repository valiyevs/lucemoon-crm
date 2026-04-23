import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Badge } from '../components/ui'
import { TrendingUp, DollarSign, ShoppingCart, FileText, Target, Users, BarChart3, PieChart } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell
} from 'recharts'
import api from '../api'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState('month') // 'week', 'month', 'quarter', 'year'

  useEffect(() => { fetchData() }, [dateRange])

  const fetchData = async () => {
    try {
      setError(null)
      const [dashboardRes, revenueRes, categoryRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue-monthly'),
        api.get('/dashboard/sales-by-category')
      ])

      const d = dashboardRes.data
      const overview = d.overview || {}

      // Pipeline by status
      const statusLabels = { NEW: 'Yeni', CONTACTED: 'Əlaqə', QUALIFIED: 'Keyfiyyətli', PROPOSAL: 'Təklif', NEGOTIATION: 'Danışıq', WON: 'Qazanan', LOST: 'İtirilib' }
      const statusColors = { NEW: '#3b82f6', CONTACTED: '#f59e0b', QUALIFIED: '#8b5cf6', PROPOSAL: '#06b6d4', NEGOTIATION: '#f97316', WON: '#10b981', LOST: '#ef4444' }
      const pipelineData = (d.pipeline || []).map(p => ({
        status: statusLabels[p.status] || p.status,
        count: p.count,
        color: statusColors[p.status] || '#94a3b8'
      }))

      // Top salespeople from dashboard
      const topSalespeople = (d.topSalesmen || []).map(s => ({
        name: s.name,
        deals: s.count,
        revenue: 0
      }))

      setStats({
        totalLeads: overview.totalLeads || 0,
        newLeads: overview.activeLeads || 0,
        wonLeads: overview.wonLeads || 0,
        lostLeads: overview.lostLeads || 0,
        conversionRate: overview.conversionRate || 0,
        activeQuotes: overview.pendingQuotes || 0,
        acceptedQuotes: 0,
        totalQuoteValue: 0,
        pendingOrders: overview.activeOrders || 0,
        completedOrders: 0,
        totalOrderValue: 0,
        paidInvoices: overview.paidInvoices || 0,
        overdueInvoices: 0,
        totalRevenue: overview.totalRevenue || 0,
        pendingRevenue: 0,
        pipelineData,
        monthlyRevenue: revenueRes.data || [],
        orderStatusData: [],
        salesByCategory: (categoryRes.data || []).map(c => ({ category: c.category, value: c.total })),
        topSalespeople,
        totalUsers: 0
      })
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Məlumatları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hesabatlar</h1>
          <p className="text-slate-500 text-sm mt-1">Satış analitikası və statistika</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          {['week', 'month', 'quarter', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                dateRange === range ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range === 'week' ? 'Həftə' : range === 'month' ? 'Ay' : range === 'quarter' ? 'Rüb' : 'İl'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Toplam Gəlir</p>
              <p className="text-2xl font-bold text-slate-800">{(stats?.totalRevenue || 0).toLocaleString('az-AZ')} ₼</p>
              <p className="text-xs text-emerald-600 mt-1">+12% son ay</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Satış Pipelini</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.newLeads || 0}</p>
              <p className="text-xs text-blue-600 mt-1">Yeni lead</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Aktiv Sifarişlər</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.pendingOrders || 0}</p>
              <p className="text-xs text-amber-600 mt-1"> Gözləyir</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-amber-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Təkliflər</p>
              <p className="text-2xl font-bold text-slate-800">{stats?.activeQuotes || 0}</p>
              <p className="text-xs text-purple-600 mt-1">Aktiv</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue Trend */}
        <Card className="col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Gəlir Trendı</h3>
            <div className="flex items-center gap-1 text-emerald-600 text-sm">
              <TrendingUp size={16} />
              <span>+18%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString('az-AZ')} ₼`, 'Gəlir']} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Sifarişlərin Vəziyyəti</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={stats?.orderStatusData || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats?.orderStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {stats?.orderStatusData?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Pipeline */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Lead Pipeline</h3>
          <div className="space-y-3">
            {stats?.pipelineData?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: item.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.status}</span>
                    <span className="font-semibold text-slate-800">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.count / 10) * 100}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Salespeople */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Top Satıcılar</h3>
          <div className="space-y-4">
            {stats?.topSalespeople?.map((person, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-800">{person.name}</span>
                    <span className="text-sm text-emerald-600 font-semibold">{person.revenue.toLocaleString('az-AZ')} ₼</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>{person.deals} sövdələşmə</span>
                    <span>{((person.revenue / stats?.totalRevenue) * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sales by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Satış Kategoriyası</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.salesByCategory || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v/1000}k`} />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                <Tooltip formatter={(value) => [`${value.toLocaleString('az-AZ')} ₼`, 'Satış']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Lead Çevrilmə</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="64" cy="64" r="56" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray={`${stats?.conversionRate * 3.52} 352`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{stats?.conversionRate}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Qazanan</span>
              <span className="font-semibold text-emerald-600">{stats?.wonLeads || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">İtirilib</span>
              <span className="font-semibold text-red-500">{stats?.lostLeads || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cəmi lead</span>
              <span className="font-semibold text-slate-800">{stats?.totalLeads || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Invoice Statusu</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ödənilmiş</p>
                  <p className="text-lg font-bold text-slate-800">{stats?.paidInvoices || 0}</p>
                </div>
              </div>
              <span className="text-xl font-bold text-emerald-600">{(stats?.totalRevenue || 0).toLocaleString('az-AZ')} ₼</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gecikmiş</p>
                  <p className="text-lg font-bold text-slate-800">{stats?.overdueInvoices || 0}</p>
                </div>
              </div>
              <span className="text-xl font-bold text-amber-600">{stats?.pendingRevenue?.toLocaleString('az-AZ') || 0} ₼</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Sistem İstifadəçiləri</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Users className="text-white" size={40} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-slate-500">Qeydiyyatdan keçmiş istifadəçi</p>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
