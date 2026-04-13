import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Badge, Loading } from '../components/ui'
import { Plus, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../api'

const defaultStages = [
  { id: 'NEW', label: 'Yeni', color: 'bg-blue-500' },
  { id: 'CONTACTED', label: 'Əlaqə qurulub', color: 'bg-amber-500' },
  { id: 'QUALIFIED', label: 'Keyfiyyətli', color: 'bg-purple-500' },
  { id: 'PROPOSAL', label: 'Təklif verilib', color: 'bg-cyan-500' },
  { id: 'NEGOTIATION', label: 'Danışıqda', color: 'bg-orange-500' },
  { id: 'WON', label: 'Qazanan', color: 'bg-emerald-500' },
  { id: 'LOST', label: 'İtirilib', color: 'bg-red-500' },
]

function LeadCard({ lead, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-xl p-4 mb-2 border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-slate-800 text-sm leading-tight pr-2">{lead.title}</h4>
        <GripVertical size={14} className="text-slate-300 flex-shrink-0 mt-1" />
      </div>
      <p className="text-xs text-slate-500 mt-1">{lead.account?.name || 'Account yoxdur'}</p>
      <div className="flex items-center justify-between mt-2">
        {lead.value ? (
          <span className="text-sm font-semibold text-emerald-600">{lead.value.toLocaleString('az-AZ')} ₼</span>
        ) : (
          <span className="text-xs text-slate-400">Qiymət yoxdur</span>
        )}
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">
          {lead.user?.firstName?.[0]}{lead.user?.lastName?.[0]}
        </div>
      </div>
    </div>
  )
}

function DroppableColumn({ stage, stageLeads }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 transition-all ${isOver ? 'scale-105' : ''}`}
    >
      <div className={`bg-slate-100 rounded-xl p-3 border-t-4 ${stage.color}`}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-semibold text-slate-700 text-sm">{stage.label}</h3>
          <span className="bg-white text-slate-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {stageLeads.length}
          </span>
        </div>
        <SortableContext items={stageLeads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className={`min-h-96 bg-slate-50/50 rounded-lg p-2 transition-all ${isOver ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}>
            {stageLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => window.location.href = `/leads/${lead.id}`}
              />
            ))}
            {stageLeads.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                <p>Boşdur</p>
                <p className="text-xs mt-1">Lead-i bura sürüşdürün</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const [leads, setLeads] = useState([])
  const [stages, setStages] = useState(defaultStages)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showStageForm, setShowStageForm] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', value: '', source: '', accountId: '' })
  const [stageFormData, setStageFormData] = useState({ label: '', color: 'bg-blue-500' })
  const [accounts, setAccounts] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setError(null)
      const [leadsRes, accountsRes, userRes] = await Promise.all([
        api.get('/leads'),
        api.get('/accounts'),
        api.get('/auth/me')
      ])
      setLeads(leadsRes.data || [])
      setAccounts(accountsRes.data || [])
      setUserRole(userRes.data.role)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Məlumatları yükləyə bilmədi')
    } finally {
      setLoading(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id
    const overId = over.id

    // Check if dropped on a stage
    const targetStage = stages.find(s => s.id === overId)
    if (targetStage) {
      const lead = leads.find(l => l.id === leadId)
      if (lead && lead.status !== targetStage.id) {
        updateLeadStatus(leadId, targetStage.id)
      }
      return
    }

    // Check if dropped on another lead
    const targetLead = leads.find(l => l.id === overId)
    if (targetLead) {
      const activeLead = leads.find(l => l.id === leadId)
      if (activeLead && activeLead.status !== targetLead.status) {
        updateLeadStatus(leadId, targetLead.status)
      }
    }
  }

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}`, { status: newStatus })
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    } catch (err) {
      console.error('Update status error:', err)
      alert('Status yenilənə bilmədi')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Başlıq daxil edin')
      return
    }
    try {
      const res = await api.post('/leads', { ...formData, value: parseFloat(formData.value) || null })
      setLeads([...leads, res.data])
      setShowForm(false)
      setFormData({ title: '', description: '', value: '', source: '', accountId: '' })
      setError(null)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Lead əlavə edilə bilmədi')
    }
  }

  const handleAddStage = (e) => {
    e.preventDefault()
    const newStage = {
      id: stageFormData.label.toUpperCase().replace(/\s+/g, '_'),
      label: stageFormData.label,
      color: stageFormData.color
    }
    const wonIndex = stages.findIndex(s => s.id === 'WON')
    const newStages = [...stages]
    newStages.splice(wonIndex, 0, newStage)
    setStages(newStages)
    setShowStageForm(false)
    setStageFormData({ label: '', color: 'bg-blue-500' })
  }

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Satış Pipelini</h1>
          <p className="text-slate-500 text-sm mt-1">{leads.length} lead mövcuddur</p>
        </div>
        <div className="flex gap-3">
          {userRole === 'ADMIN' && (
            <Button variant="secondary" onClick={() => setShowStageForm(true)} icon={Plus}>
              Yeni Bölmə
            </Button>
          )}
          <Button onClick={() => { setShowForm(true); setError(null) }} icon={Plus}>
            Yeni Lead
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.status === stage.id)
            return (
              <DroppableColumn key={stage.id} stage={stage} stageLeads={stageLeads} />
            )
          })}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="bg-white rounded-xl p-4 border-2 border-blue-500 shadow-xl w-72 opacity-95">
              <h4 className="font-semibold text-slate-800 text-sm">{activeLead.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{activeLead.account?.name}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* New Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Yeni Lead Əlavə Et</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Başlıq" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Müştəri müraciəti" required />
              <Input label="Qiymət (₼)" type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} placeholder="0.00" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Mənbə" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} placeholder="Website..." />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Account</label>
                  <select value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                    <option value="">Seçin</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <Input label="Təsvir" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Əlavə məlumat..." />
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowForm(false)}>Ləğv et</Button>
                <Button type="submit">Əlavə et</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Stage Modal (Admin only) */}
      {showStageForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStageForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Yeni Pipeline Bölməsi</h3>
              <button onClick={() => setShowStageForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStage} className="space-y-4">
              <Input label="Bölmə adı" value={stageFormData.label} onChange={e => setStageFormData({...stageFormData, label: e.target.value})} placeholder="Məsələn: Təsdiqləndi" required />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rəng seçin</label>
                <div className="flex gap-3">
                  {['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setStageFormData({...stageFormData, color})}
                      className={`w-8 h-8 rounded-full ${color} ${stageFormData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowStageForm(false)}>Ləğv et</Button>
                <Button type="submit">Əlavə et</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}