import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Badge, Avatar } from '../components/ui'
import { Plus, Search, Building2, Phone, Mail, MapPin, ChevronRight, Users, MoreHorizontal } from 'lucide-react'
import api from '../api'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ name: '', type: 'Company', industry: '', phone: '', email: '', address: '', city: '' })

  useEffect(() => { fetchAccounts() }, [])

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts')
      setAccounts(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/accounts', formData)
      setShowForm(false)
      setFormData({ name: '', type: 'Company', industry: '', phone: '', email: '', address: '', city: '' })
      fetchAccounts()
    } catch (err) { console.error(err) }
  }

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Müştərilər</h1>
          <p className="text-slate-500 text-sm mt-1">{accounts.length} şirkət qeydə alınıb</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={Plus}>
          Yeni Müştəri
        </Button>
      </div>

      {/* New Account Form */}
      {showForm && (
        <Card className="mb-6 p-6 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Yeni Müştəri Əlavə Et</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-4 gap-4">
              <Input label="Şirkət adı" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Şirkət adı" required />
              <Input label="Tip" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="Company, Individual" />
              <Input label="Industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="Elektrik, Tikinti..." />
              <Input label="Şəhər" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Bakı, Gəncə..." />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input label="Telefon" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+994 XX XXX XX XX" />
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="info@company.az" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
              <Button type="submit">Əlavə et</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Müştəri axtar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>
      </Card>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Müştəri tapılmadı</h3>
          <p className="text-slate-500 mb-4">Axtarış criteria-nı dəyişin və ya yeni müştəri əlavə edin</p>
          <Button onClick={() => setShowForm(true)} icon={Plus}>Yeni Müştəri</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {filteredAccounts.map(account => (
            <Card key={account.id} hover className="p-6 group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {account.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg group-hover:text-emerald-600 transition">{account.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info" size="sm">{account.type}</Badge>
                      {account.industry && <span className="text-sm text-slate-400">• {account.industry}</span>}
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {account.phone && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-blue-600" />
                    </div>
                    <span className="text-sm">{account.phone}</span>
                  </div>
                )}
                {account.email && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Mail size={16} className="text-purple-600" />
                    </div>
                    <span className="text-sm">{account.email}</span>
                  </div>
                )}
                {account.city && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                      <MapPin size={16} className="text-amber-600" />
                    </div>
                    <span className="text-sm">{account.city}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Users size={16} />
                  <span>{account._count?.contacts || 0} kontakt</span>
                </div>
                <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Etrafli <ChevronRight size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}