import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Badge, Avatar, EmptyState } from '../components/ui'
import { Plus, Search, CheckCircle, Clock, AlertCircle, Trash2, Filter } from 'lucide-react'
import api from '../api'

const statusConfig = {
  PENDING: { label: 'Gözləyir', variant: 'warning', icon: Clock },
  IN_PROGRESS: { label: 'İcra edilir', variant: 'info', icon: AlertCircle },
  COMPLETED: { label: 'Tamamlanıb', variant: 'success', icon: CheckCircle },
  CANCELLED: { label: 'Ləğv edilib', variant: 'default', icon: Clock },
}

const priorityConfig = {
  LOW: { label: 'Aşağı', color: 'text-slate-500' },
  MEDIUM: { label: 'Orta', color: 'text-blue-500' },
  HIGH: { label: 'Yüksək', color: 'text-amber-500' },
  URGENT: { label: 'Təcili', color: 'text-red-500' },
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: '', leadId: '', orderId: ''
  })
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users')
      ])
      setTasks(tasksRes.data || [])
      setUsers(usersRes.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Tapşırıqları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Başlıq daxil edin')
      return
    }
    try {
      setActionLoading(true)
      await api.post('/tasks', {
        ...formData,
        assignedTo: formData.assignedTo || null,
        leadId: formData.leadId || null,
        orderId: formData.orderId || null
      })
      setShowForm(false)
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedTo: '', leadId: '', orderId: '' })
      setError(null)
      fetchData()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Tapşırıq əlavə edilə bilmədi')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setActionLoading(taskId)
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error('Update error:', err)
      alert('Status yenilənə bilmədi')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu tapşırığı silmək istəyirsiniz?')) return
    try {
      setActionLoading(id)
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
      alert('Silinə bilmədi')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || task.status === filterStatus
    const matchesPriority = !filterPriority || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'COMPLETED') return false
    return new Date(task.dueDate) < new Date()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tapşırıqlar</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredTasks.length} tapşırım mövcuddur</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setError(null) }} icon={Plus}>
          Yeni Tapşırıq
        </Button>
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

      {/* New Task Form */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Yeni Tapşırıq</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Başlıq"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Tapşırığın adı"
                required
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioritet</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="LOW">Aşağı</option>
                  <option value="MEDIUM">Orta</option>
                  <option value="HIGH">Yüksək</option>
                  <option value="URGENT">Təcili</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Son tarix"
                type="datetime-local"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Məsul şəxs</label>
                <select
                  value={formData.assignedTo}
                  onChange={e => setFormData({...formData, assignedTo: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="">Seçin</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Input
                label="Təsvir"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Əlavə məlumat..."
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
              <Button type="submit" loading={actionLoading}>Əlavə et</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tapşırıq axtar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500"
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
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border-0 rounded-xl outline-none text-slate-600"
          >
            <option value="">Bütün prioritetlər</option>
            <option value="LOW">Aşağı</option>
            <option value="MEDIUM">Orta</option>
            <option value="HIGH">Yüksək</option>
            <option value="URGENT">Təcili</option>
          </select>
        </div>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 && !loading ? (
        <EmptyState icon={CheckCircle} title="Tapşırıq yoxdur" description="İlk tapşırığınızı əlavə edin" />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const StatusIcon = statusConfig[task.status]?.icon || Clock
            return (
              <Card key={task.id} className="p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
                      disabled={actionLoading === task.id}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <CheckCircle size={14} />}
                    </button>
                    <div>
                      <h3 className={`font-semibold text-slate-800 ${task.status === 'COMPLETED' ? 'line-through opacity-60' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={statusConfig[task.status]?.variant || 'default'}>
                          {statusConfig[task.status]?.label || task.status}
                        </Badge>
                        <span className={`text-sm font-medium ${priorityConfig[task.priority]?.color}`}>
                          {priorityConfig[task.priority]?.label}
                        </span>
                        {task.dueDate && (
                          <span className={`text-sm flex items-center gap-1 ${isOverdue(task) ? 'text-red-500' : 'text-slate-500'}`}>
                            <Clock size={14} />
                            {new Date(task.dueDate).toLocaleDateString('az-AZ')}
                          </span>
                        )}
                        {task.assignedUser && (
                          <span className="text-sm text-slate-500">
                            → {task.assignedUser.firstName} {task.assignedUser.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={actionLoading === task.id}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
