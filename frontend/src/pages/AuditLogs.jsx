import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Badge, EmptyState } from '../components/ui'
import { Search, Activity, Filter } from 'lucide-react'
import api from '../api'

const actionConfig = {
  CREATE: { label: 'Yaradılıb', variant: 'success' },
  UPDATE: { label: 'Yenilənib', variant: 'info' },
  DELETE: { label: 'Silinib', variant: 'danger' },
}

const entityConfig = {
  Lead: { label: 'Lead', color: 'bg-blue-100 text-blue-700' },
  Quote: { label: 'Təklif', color: 'bg-purple-100 text-purple-700' },
  Order: { label: 'Sifariş', color: 'bg-emerald-100 text-emerald-700' },
  Invoice: { label: 'Faktura', color: 'bg-amber-100 text-amber-700' },
  Account: { label: 'Müştəri', color: 'bg-cyan-100 text-cyan-700' },
  Contact: { label: 'Kontakt', color: 'bg-pink-100 text-pink-700' },
  Product: { label: 'Məhsul', color: 'bg-orange-100 text-orange-700' },
  User: { label: 'İstifadəçi', color: 'bg-slate-100 text-slate-700' },
  Task: { label: 'Tapşırıq', color: 'bg-violet-100 text-violet-700' },
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterEntity, setFilterEntity] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => { fetchLogs() }, [])

  const fetchLogs = async () => {
    try {
      setError(null)
      const res = await api.get('/audit-logs')
      setLogs(res.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Audit logları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEntity = !filterEntity || log.entityType === filterEntity
    const matchesAction = !filterAction || log.action === filterAction
    return matchesSearch && matchesEntity && matchesAction
  })

  const formatChanges = (changes) => {
    if (!changes) return null
    try {
      const parsed = JSON.parse(changes)
      return Object.entries(parsed).map(([key, value]) => {
        if (value.old !== undefined && value.new !== undefined) {
          return `${key}: ${value.old} → ${value.new}`
        }
        return `${key}: ${value}`
      }).join(', ')
    } catch {
      return changes
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Log</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredLogs.length} qeyd mövcuddur</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="İstifadəçi axtar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterEntity}
              onChange={e => setFilterEntity(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none text-slate-600"
            >
              <option value="">Bütün entity-lər</option>
              {Object.entries(entityConfig).map(([value, config]) => (
                <option key={value} value={value}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none text-slate-600"
            >
              <option value="">Bütün əməliyyatlar</option>
              <option value="CREATE">Yaradılıb</option>
              <option value="UPDATE">Yenilənib</option>
              <option value="DELETE">Silinib</option>
            </select>
          </div>
        </Card>
      )}

      {/* Logs List */}
      {filteredLogs.length === 0 && !loading ? (
        <EmptyState icon={Activity} title="Log yoxdur" description="Sistem fəaliyyətləri burada görünəcək" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Vaxt</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">İstifadəçi</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Əməliyyat</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Entity</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-slate-500">Dəyişikliklər</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Activity size={14} />
                        {new Date(log.createdAt).toLocaleString('az-AZ')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-slate-800">
                        {log.user?.firstName} {log.user?.lastName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={actionConfig[log.action]?.variant || 'default'}>
                        {actionConfig[log.action]?.label || log.action}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${entityConfig[log.entityType]?.color || 'bg-slate-100 text-slate-700'}`}>
                        {entityConfig[log.entityType]?.label || log.entityType}
                      </span>
                      <span className="text-sm text-slate-500 ml-2">#{log.entityId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600">{formatChanges(log.changes) || '-'}</span>
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
