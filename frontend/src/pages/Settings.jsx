import { useState } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Badge } from '../components/ui'
import { Save, Bell, Shield, Database, Palette, Globe } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'Lucemoon CRM',
    email: 'admin@lucemoon.az',
    phone: '+994505123456',
    address: 'Baku, Azerbaijan',
    currency: 'AZN',
    language: 'az',
    timezone: 'Asia/Baku',
    taxRate: 18,
  })

  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Ayarlar</h1>
        <p className="text-slate-500 text-sm mt-1">Sistem ayarlarını konfiqurasiya edin</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          Dəyişikliklər uğurla yadda saxlanıldı!
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {[
            { icon: Database, label: 'Ümumi', active: true },
            { icon: Bell, label: 'Bildirişlər', active: false },
            { icon: Shield, label: 'Təhlükəsizlik', active: false },
            { icon: Palette, label: 'Görünüş', active: false },
          ].map((item, idx) => (
            <Card key={idx} className={`cursor-pointer hover:border-blue-300 transition ${item.active ? 'border-blue-500' : ''}`}>
              <div className="p-4 flex items-center gap-3">
                <item.icon className={`${item.active ? 'text-blue-600' : 'text-slate-400'}`} size={20} />
                <span className={`font-medium ${item.active ? 'text-blue-600' : 'text-slate-600'}`}>{item.label}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Settings Form */}
        <div className="col-span-2">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Ümumi Ayarlar</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Şirkət adı"
                    value={settings.companyName}
                    onChange={e => setSettings({...settings, companyName: e.target.value})}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={settings.email}
                    onChange={e => setSettings({...settings, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Telefon"
                    value={settings.phone}
                    onChange={e => setSettings({...settings, phone: e.target.value})}
                  />
                  <Input
                    label="Ünvan"
                    value={settings.address}
                    onChange={e => setSettings({...settings, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Valyuta</label>
                    <select
                      value={settings.currency}
                      onChange={e => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="AZN">AZN - Azərbaycan Manatı</option>
                      <option value="USD">USD - ABŞ Dolları</option>
                      <option value="EUR">EUR - Avro</option>
                      <option value="RUB">RUB - Rusiya Rublu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Dil</label>
                    <select
                      value={settings.language}
                      onChange={e => setSettings({...settings, language: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="az">Azərbaycan dili</option>
                      <option value="en">English</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Vergi faizi (%)"
                    type="number"
                    value={settings.taxRate}
                    onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value)})}
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Zaman qurşağı</label>
                    <select
                      value={settings.timezone}
                      onChange={e => setSettings({...settings, timezone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Asia/Baku">Bakı (UTC+4)</option>
                      <option value="Europe/Moscow">Moskva (UTC+3)</option>
                      <option value="Europe/London">London (UTC+0)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <Button type="submit" icon={Save}>Yadda saxla</Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="mt-6 border-red-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Təhlükəli zona</h3>
              <p className="text-slate-500 text-sm mb-4">Bu əməliyyatlar geri qaytarıla bilməz. Diqqətli olun.</p>
              <div className="flex gap-3">
                <Button variant="secondary">Export məlumatları</Button>
                <Button variant="danger">Bütün məlumatları sil</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}