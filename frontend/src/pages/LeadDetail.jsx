import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Button, Badge, Input, Select, Loading, Avatar } from '../components/ui'
import { ArrowLeft, Save, Briefcase, User } from 'lucide-react'
import api from '../api'

const statusConfig = {
  NEW: { label: 'Yeni', variant: 'info' },
  CONTACTED: { label: 'Əlaqə qurulub', variant: 'warning' },
  QUALIFIED: { label: 'Keyfiyyətli', variant: 'purple' },
  PROPOSAL: { label: 'Təklif verilib', variant: 'info' },
  NEGOTIATION: { label: 'Danışıqda', variant: 'warning' },
  WON: { label: 'Qazanılıb', variant: 'success' },
  LOST: { label: 'İtirilib', variant: 'danger' },
}

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchLead() }, [id])

  const fetchLead = async () => {
    try {
      setError(null)
      const res = await api.get(`/leads/${id}`)
      setLead(res.data)
      setFormData({
        title: res.data.title,
        description: res.data.description || '',
        value: res.data.value || '',
        source: res.data.source || '',
        status: res.data.status,
      })
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Lead yüklənə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await api.put(`/leads/${id}`, formData)
      setEditing(false)
      setError(null)
      fetchLead()
    } catch (err) {
      console.error('Update error:', err)
      setError('Yenilənə bilmədi')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><Loading /></Layout>
  if (!lead) return <Layout><p>Lead tapılmadı</p></Layout>

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/leads')} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{lead.title}</h1>
              <Badge variant={statusConfig[lead.status]?.variant || 'default'} size="lg">
                {statusConfig[lead.status]?.label || lead.status}
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              {lead.account?.name || 'No account'} • {new Date(lead.createdAt).toLocaleDateString('az-AZ')}
            </p>
          </div>
        </div>
        <Button variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing(!editing)}>
          {editing ? 'Ləğv et' : 'Redaktə Et'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Məlumatlar</h3>

            {editing ? (
              <div className="space-y-4">
                <Input label="Basliq" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Qiymet (₼)" type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                  <Input label="Menbe" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
                </div>
                <Select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {Object.entries(statusConfig).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
                <Input label="Tesvir" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <Button onClick={handleUpdate} loading={saving} icon={Save}>Yadda saxla</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Qiymet</p>
                    <p className="text-xl font-bold text-slate-800">{lead.value ? `${lead.value} ₼` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Menbe</p>
                    <p className="font-medium text-slate-800">{lead.source || '-'}</p>
                  </div>
                </div>
                {lead.description && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Tesvir</p>
                    <p className="text-slate-700">{lead.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned To */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-slate-500 mb-4">Məsul Satıcı</h3>
              <div className="flex items-center gap-3">
                <Avatar name={`${lead.user?.firstName} ${lead.user?.lastName}`} size="lg" />
                <div>
                  <p className="font-medium text-slate-800">{lead.user?.firstName} {lead.user?.lastName}</p>
                  <p className="text-sm text-slate-500">{lead.user?.role}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-slate-500 mb-4">Məlumat</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Yaradılıb</span>
                  <span className="text-slate-700">{new Date(lead.createdAt).toLocaleString('az-AZ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Son yenilenme</span>
                  <span className="text-slate-700">{new Date(lead.updatedAt).toLocaleString('az-AZ')}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}