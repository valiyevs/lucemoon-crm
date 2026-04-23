import { Button } from '../components/ui'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="text-slate-400" size={40} />
        </div>
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Səhifə tapılmadı</h2>
        <p className="text-slate-500 mb-6">Axtardığınız səhifə mövcud deyil və ya köçürülüb.</p>
        <Button to="/">Ana səhifəyə qayıt</Button>
      </div>
    </div>
  )
}
