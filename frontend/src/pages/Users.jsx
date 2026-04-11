import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Loading, Badge, Avatar, Modal } from '../components/ui'
import { Plus, Search, Shield, UserCog, Trash2 } from 'lucide-react'
import api from '../api'

const roleConfig = {
  ADMIN: { label: 'Administrator', variant: 'danger', icon: Shield },
  MANAGER: { label: 'Menecer', variant: 'warning', icon: UserCog },
  SALESMAN: { label: 'Satıcı', variant: 'info', icon: UserCog },
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'SALESMAN' })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', formData)
      setShowForm(false)
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'SALESMAN' })
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  const toggleStatus = async (id, isActive) => {
    try {
      const user = users.find(u => u.id === id)
      await api.put(`/users/${id}`, { isActive: !isActive })
      fetchUsers()
    } catch (err) { console.error(err) }
  }

  if (loading) return <Layout><Loading /></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">İstifadəçilər</h1>
          <p className="text-slate-500 text-sm mt-1">Sistem istifadəçilərini idarə edin</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus}>Yeni İstifadəçi</Button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {Object.entries(roleConfig).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length
          return (
            <Card key={role}>
              <div className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  role === 'ADMIN' ? 'bg-red-100 text-red-600' :
                  role === 'MANAGER' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <config.icon size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{count}</p>
                  <p className="text-sm text-slate-500">{config.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Users Table */}
      <Card>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 text-sm font-medium text-slate-500">İstifadəçi</th>
                <th className="text-left py-3 text-sm font-medium text-slate-500">Rol</th>
                <th className="text-left py-3 text-sm font-medium text-slate-500">Status</th>
                <th className="text-right py-3 text-sm font-medium text-slate-500">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const RoleIcon = roleConfig[user.role]?.icon || UserCog
                return (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${user.firstName} ${user.lastName}`} size="md" />
                        <div>
                          <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <Badge variant={roleConfig[user.role]?.variant || 'default'}>
                        {roleConfig[user.role]?.label || user.role}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <span className={`text-sm font-medium ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {user.isActive ? 'Aktiv' : 'Deaktiv'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        variant={user.isActive ? 'danger' : 'success'}
                        size="sm"
                        onClick={() => toggleStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? 'Deaktiv et' : 'Aktiv et'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Yeni İstifadəçi</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ad" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Soyad" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <Input label="Şifrə" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              <Select label="Rol" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="SALESMAN">Satıcı</option>
                <option value="MANAGER">Menecer</option>
                <option value="ADMIN">Administrator</option>
              </Select>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
                <Button type="submit">Əlavə et</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}