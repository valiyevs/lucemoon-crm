import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş uğursuz oldu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl text-white">
              LC
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lucemoon CRM</h1>
              <p className="text-slate-400 text-sm">Elektrik Malları Satış Sistemi</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              B2B Satışlarınızı<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Professional İdarə Edin
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md">
              Lead-lərdən sifarişlərə qədər tam satış axınını tək platformadan idarə edin.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Lead Pipeline İdarəetmə' },
            { label: 'Avtomatik Quote və Invoice' },
            { label: 'Real-time Analitika' },
            { label: 'Müştəri Məlumat Bazası' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 text-slate-400">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <svg className="text-emerald-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl text-white">
              LC
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Lucemoon CRM</h1>
              <p className="text-slate-500 text-sm">Elektrik Malları Satış Sistemi</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Xoş gəldiniz!</h2>
              <p className="text-slate-500 mt-2">Daxil olmaq üçün məlumatlarınızı daxil edin</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email ünvanı</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="admin@lucemoon.az"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Şifrə</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Giriş edilir...
                  </span>
                ) : (
                  'Daxil Ol'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Demo hesab: <span className="font-medium text-slate-700">admin@lucemoon.az</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Şifrə: <span className="font-medium text-slate-700">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}