import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Select, Loading, EmptyState, Badge, Avatar } from '../components/ui'
import { Plus, Search, Users, Phone, Mail, Briefcase } from 'lucide-react'
import api from '../api'

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', position: '', isPrimary: false, accountId: '' })

  useEffect(() => { fetchContacts(); fetchAccounts() }, [])

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts')
      setContacts(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchAccounts = async () => {
    try { const res = await api.get('/accounts'); setAccounts(res.data) }
    catch (err) { console.error(err) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/contacts', formData)
      setShowForm(false)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', position: '', isPrimary: false, accountId: '' })
      fetchContacts()
    } catch (err) { console.error(err) }
  }

  const filteredContacts = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Layout><Loading /></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kontaktlar</h1>
          <p className="text-slate-500 text-sm mt-1">{contacts.length} şəxs qeydə alınıb</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} icon={Plus}>
          {showForm ? 'Bagla' : '+ Yeni Kontakt'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Yeni Kontakt</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Ad" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                <Input label="Soyad" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                <Input label="Vezife" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input label="Telefon" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <Select label="Account" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})}>
                  <option value="">Secin</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
                <Button type="submit">Yadda saxla</Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <div className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Kontakt axtar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Card>

      {filteredContacts.length === 0 ? (
        <EmptyState icon={Users} title="Kontakt yoxdur" description="İlk kontaktınızı əlavə edin" action={<Button onClick={() => setShowForm(true)} icon={Plus}>Yeni Kontakt</Button>} />
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {filteredContacts.map(contact => (
            <Card key={contact.id} hover>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={`${contact.firstName} ${contact.lastName}`} size="lg" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{contact.firstName} {contact.lastName}</h3>
                    <p className="text-sm text-slate-500">{contact.position || 'Vezife yoxdur'}</p>
                    {contact.isPrimary && <Badge variant="success" size="sm" className="mt-1">Esas kontakt</Badge>}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {contact.email && <div className="flex items-center gap-2 text-slate-600"><Mail size={14} className="text-slate-400" /> {contact.email}</div>}
                  {contact.phone && <div className="flex items-center gap-2 text-slate-600"><Phone size={14} className="text-slate-400" /> {contact.phone}</div>}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">{contact.account?.name}</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Etrafli</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}