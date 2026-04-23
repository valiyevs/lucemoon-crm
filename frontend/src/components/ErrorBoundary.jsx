import { Component } from 'react'
import { Button } from './ui'
import { AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Xəta baş verdi</h1>
            <p className="text-slate-500 mb-6">Gözlənilməz xəta baş verdi. Səhifəni yenidən yükləyin.</p>
            <Button onClick={() => window.location.reload()}>Səhifəni yenilə</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
