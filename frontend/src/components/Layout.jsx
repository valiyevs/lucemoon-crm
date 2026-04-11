import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Kanban,
  Target,
  Building2,
  Users,
  Package,
  FileText,
  ShoppingCart,
  Receipt,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'İdarə paneli', icon: LayoutDashboard },
  { path: '/pipeline', label: 'Satış pipelini', icon: Kanban },
  { path: '/leads', label: 'Lead-lər', icon: Target },
  { path: '/accounts', label: 'Müştərilər', icon: Building2 },
  { path: '/contacts', label: 'Kontaktlar', icon: Users },
  { path: '/products', label: 'Məhsullar', icon: Package },
  { path: '/quotes', label: 'Təkliflər', icon: FileText },
  { path: '/orders', label: 'Sifarişlər', icon: ShoppingCart },
  { path: '/invoices', label: 'Fakturalar', icon: Receipt },
]

const adminItems = [
  { path: '/users', label: 'İstifadəçilər', icon: Users },
  { path: '/settings', label: 'Ayarlar', icon: Settings },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usersOpen, setUsersOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:${sidebarOpen ? 'w-64' : 'w-20'} w-64 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-700/50">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg">
                LC
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Lucemoon</h1>
                <p className="text-xs text-slate-400">CRM Sistem</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg mx-auto">
              LC
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-700 rounded-lg transition">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}

          {/* Admin Section */}
          {user?.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              {sidebarOpen && (
                <button
                  onClick={() => setUsersOpen(!usersOpen)}
                  className="flex items-center gap-2 text-slate-400 text-sm mb-2 px-4 hover:text-white transition"
                >
                  {usersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  İdarəetmə
                </button>
              )}
              {adminItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {sidebarOpen && <span className="text-sm">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-700/50">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center font-semibold text-slate-900">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-red-400"
                title="Çıxış"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <Menu size={20} />
              </button>
              <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {navItems.find(item => location.pathname === item.path)?.label ||
                 adminItems.find(item => location.pathname === item.path)?.label ||
                 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString('az-AZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Axtarış..."
                  className="pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl w-64 focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}