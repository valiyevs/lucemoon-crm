import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Button, Badge, Input, Avatar } from '../components/ui'
import { Plus, Search, Filter, ArrowUpRight, MoreHorizontal, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react'
import api from '../api'

const statusConfig = {
  NEW: { label: 'Yeni', variant: 'info', color: '#3b82f6', bgColor: 'bg-blue-50' },
  CONTACTED: { label: 'Əlaqə qurulub', variant: 'warning', color: '#f59e0b', bgColor: 'bg-amber-50' },
  QUALIFIED: { label: 'Keyfiyyətli', variant: 'purple', color: '#8b5cf6', bgColor: 'bg-purple-50' },
  PROPOSAL: { label: 'Təklif verilib', variant: 'info', color: '#06b6d4', bgColor: 'bg-cyan-50' },
  NEGOTIATION: { label: 'Danışıqda', variant: 'warning', color: '#f97316', bgColor: 'bg-orange-50' },
  WON: { label: 'Qazanan', variant: 'success', color: '#10b981', bgColor: 'bg-emerald-50' },
  LOST: { label: 'İtirilib', variant: 'danger', color: '#ef4444', bgColor: 'bg-red-50' },
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'
  const [formData, setFormData] = useState({ title: '', description: '', value: '', source: '', status: 'NEW', accountId: '' })
  const [accounts, setAccounts] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [leadsRes, accountsRes] = await Promise.all([api.get('/leads'), api.get('/accounts')])
      setLeads(leadsRes.data)
      setAccounts(accountsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/leads', { ...formData, value: parseFloat(formData.value) || null })
      setShowForm(false)
      setFormData({ title: '', description: '', value: '', source: '', status: 'NEW', accountId: '' })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.account?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || lead.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value) => {
    return value ? `${value.toLocaleString('az-AZ')} ₼` : '-'
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lead-lər</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredLeads.length} lead tapıldı</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={Plus}>
          Yeni Lead
        </Button>
      </div>

      {/* New Lead Form */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Yeni Lead Əlavə Et</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-4 gap-4">
              <Input label="Başlıq" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Müştəri müraciəti" required />
              <Input label="Qiymət (₼)" type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} placeholder="0.00" />
              <Input label="Mənbə" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="Website, Campaign..." />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none">
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
              <Button type="submit">Əlavə et</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters & View Toggle */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Lead axtar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none text-slate-600"
            >
              <option value="">Bütün statuslar</option>
              {Object.entries(statusConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Cədvəl
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Kart
            </button>
          </div>
        </div>
      </Card>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Lead</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Account</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Qiymət</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Satıcı</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-slate-500">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                          {lead.title[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 group-hover:text-blue-600 transition">{lead.title}</p>
                          {lead.source && <p className="text-xs text-slate-400 mt-0.5">{lead.source}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 text-xs font-bold">{lead.account?.name?.[0] || 'A'}</span>
                        </div>
                        <span className="text-slate-600">{lead.account?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800">{formatCurrency(lead.value)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusConfig[lead.status]?.bgColor}`} style={{ color: statusConfig[lead.status]?.color }}>
                        {statusConfig[lead.status]?.label || lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={`${lead.user?.firstName} ${lead.user?.lastName}`} size="sm" />
                        <span className="text-sm text-slate-600">{lead.user?.firstName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <Link to={`/leads/${lead.id}`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600">
                          <Eye size={18} />
                        </Link>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-amber-600">
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-5">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} hover className="p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {lead.title[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition">{lead.title}</h3>
                    <p className="text-sm text-slate-500">{lead.account?.name || 'No account'}</p>
                  </div>
                </div>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusConfig[lead.status]?.bgColor}`} style={{ color: statusConfig[lead.status]?.color }}>
                  {statusConfig[lead.status]?.label || lead.status}
                </span>
                <span className="text-xl font-bold text-emerald-600">{formatCurrency(lead.value)}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Avatar name={`${lead.user?.firstName} ${lead.user?.lastName}`} size="sm" />
                  <span className="text-sm text-slate-500">{lead.user?.firstName} {lead.user?.lastName?.[0]}.</span>
                </div>
                <Link to={`/leads/${lead.id}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  Bax <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredLeads.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Lead tapılmadı</h3>
          <p className="text-slate-500 mb-4">Axtarış criteria-nı dəyişin və ya yeni lead əlavə edin</p>
          <Button onClick={() => setShowForm(true)} icon={Plus}>Yeni Lead</Button>
        </Card>
      )}
    </Layout>
  )
}