import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, Button, Input, Alert } from '../components/ui'
import { Save, Bell, Shield, Database, Palette, Globe, Mail, Lock, User, Moon, Sun, Monitor } from 'lucide-react'
import api from '../api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const defaultSettings = {
    companyName: 'Lucemoon CRM',
    email: 'admin@lucemoon.az',
    phone: '+994505123456',
    address: 'Baku, Azerbaijan',
    currency: 'AZN',
    language: 'az',
    timezone: 'Asia/Baku',
    taxRate: 18,
  }

  const defaultNotifications = {
    emailNotifications: true,
    leadUpdates: true,
    quoteUpdates: true,
    orderUpdates: true,
    systemAlerts: true,
    weeklyReport: false,
  }

  const defaultAppearance = {
    theme: 'light',
    compactMode: false,
    sidebarCollapsed: false,
  }

  const [settings, setSettings] = useState(defaultSettings)
  const [notifications, setNotifications] = useState(defaultNotifications)
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  })
  const [appearance, setAppearance] = useState(defaultAppearance)

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('crm_settings')
      const savedNotifications = localStorage.getItem('crm_notifications')
      const savedAppearance = localStorage.getItem('crm_appearance')
      if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) })
      if (savedNotifications) setNotifications({ ...defaultNotifications, ...JSON.parse(savedNotifications) })
      if (savedAppearance) setAppearance({ ...defaultAppearance, ...JSON.parse(savedAppearance) })
    } catch (e) {
      console.error('Failed to load settings:', e)
    }
  }, [])

  const handleSave = async (section) => {
    try {
      setSaving(true)
      setError(null)

      if (section === 'security') {
        if (security.newPassword && security.newPassword !== security.confirmPassword) {
          setError('Şifrələr uyğun gəlmir')
          return
        }
        if (security.newPassword) {
          await api.put('/auth/change-password', {
            currentPassword: security.currentPassword,
            newPassword: security.newPassword
          })
          setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' })
        }
      } else {
        if (section === 'general') localStorage.setItem('crm_settings', JSON.stringify(settings))
        if (section === 'notifications') localStorage.setItem('crm_notifications', JSON.stringify(notifications))
        if (section === 'appearance') localStorage.setItem('crm_appearance', JSON.stringify(appearance))
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Yadda saxlanıla bilmədi')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', icon: Database, label: 'Ümumi' },
    { id: 'notifications', icon: Bell, label: 'Bildirişlər' },
    { id: 'security', icon: Shield, label: 'Təhlükəsizlik' },
    { id: 'appearance', icon: Palette, label: 'Görünüş' },
  ]

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

      {error && (
        <div className="mb-6">
          <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer p-4 rounded-xl border transition ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} size={20} />
                <span className={`font-medium ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-600'}`}>
                  {tab.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Ümumi */}
          {activeTab === 'general' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Ümumi Ayarlar</h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Button onClick={() => handleSave('general')} loading={saving} icon={Save}>Yadda saxla</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Bildirişlər */}
          {activeTab === 'notifications' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Bildiriş Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="text-slate-500" size={20} />
                      <div>
                        <p className="font-medium text-slate-700">Email bildirişləri</p>
                        <p className="text-sm text-slate-500">Sistem email bildirişləri alın</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={e => setNotifications({...notifications, emailNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <User className="text-slate-500" size={20} />
                      <div>
                        <p className="font-medium text-slate-700">Lead yeniləmələri</p>
                        <p className="text-sm text-slate-500">Lead statusu dəyişəndə bildiriş alın</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.leadUpdates}
                        onChange={e => setNotifications({...notifications, leadUpdates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="text-slate-500" size={20} />
                      <div>
                        <p className="font-medium text-slate-700">Təklif yeniləmələri</p>
                        <p className="text-sm text-slate-500">Quote yaradılanda/dəyişəndə bildiriş</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.quoteUpdates}
                        onChange={e => setNotifications({...notifications, quoteUpdates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="text-slate-500" size={20} />
                      <div>
                        <p className="font-medium text-slate-700">Sifariş yeniləmələri</p>
                        <p className="text-sm text-slate-500">Order statusu dəyişəndə bildiriş</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.orderUpdates}
                        onChange={e => setNotifications({...notifications, orderUpdates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-700">Həftəlik hesabat</p>
                      <p className="text-sm text-slate-500">Hər həftə email ilə hesabat alın</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReport}
                        onChange={e => setNotifications({...notifications, weeklyReport: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave('notifications')} loading={saving} icon={Save}>Yadda saxla</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Təhlükəsizlik */}
          {activeTab === 'security' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Təhlükəsizlik Ayarları</h3>
                <div className="space-y-5">
                  <Input
                    label="Cari şifrə"
                    type="password"
                    value={security.currentPassword}
                    onChange={e => setSecurity({...security, currentPassword: e.target.value})}
                  />
                  <Input
                    label="Yeni şifrə"
                    type="password"
                    value={security.newPassword}
                    onChange={e => setSecurity({...security, newPassword: e.target.value})}
                  />
                  <Input
                    label="Yeni şifrəni təkrar edin"
                    type="password"
                    value={security.confirmPassword}
                    onChange={e => setSecurity({...security, confirmPassword: e.target.value})}
                  />

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Lock className="text-slate-500" size={20} />
                      <div>
                        <p className="font-medium text-slate-700">İki faktorlu autentifikasiya</p>
                        <p className="text-sm text-slate-500">Hesabınızı əlavə qoruma ilə təmin edin</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorEnabled}
                        onChange={e => setSecurity({...security, twoFactorEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave('security')} loading={saving} icon={Save}>Şifrəni yenilə</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Görünüş */}
          {activeTab === 'appearance' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Görünüş Ayarları</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Tema</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div
                        onClick={() => setAppearance({...appearance, theme: 'light'})}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                          appearance.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <Sun className="text-amber-500 mb-2" size={24} />
                        <p className="font-medium text-slate-700">Açıq</p>
                      </div>
                      <div
                        onClick={() => setAppearance({...appearance, theme: 'dark'})}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                          appearance.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <Moon className="text-slate-600 mb-2" size={24} />
                        <p className="font-medium text-slate-700">Qaranlıq</p>
                      </div>
                      <div
                        onClick={() => setAppearance({...appearance, theme: 'system'})}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                          appearance.theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <Monitor className="text-slate-500 mb-2" size={24} />
                        <p className="font-medium text-slate-700">Sistem</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-700">Kompat rejim</p>
                      <p className="text-sm text-slate-500">Daha kompakt UI görünüşü</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appearance.compactMode}
                        onChange={e => setAppearance({...appearance, compactMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => handleSave('appearance')} loading={saving} icon={Save}>Yadda saxla</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}