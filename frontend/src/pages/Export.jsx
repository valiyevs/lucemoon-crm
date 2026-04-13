import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import { Card, Button } from '../components/ui'
import { Download, Upload, FileText, Building2, ShoppingCart, Receipt, Users, Target, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import {
  exportLeads,
  exportAccounts,
  exportOrders,
  exportInvoices,
  exportQuotes,
  exportContacts
} from '../utils/export'
import {
  importAccounts,
  importContacts,
  importProducts,
  importLeads,
  readCSVFile
} from '../utils/import'

const exportOptions = [
  { id: 'leads', label: 'Lead-lər', description: 'Bütün lead-lərin siyahısı', icon: Target, color: 'bg-blue-500', exportFn: exportLeads },
  { id: 'accounts', label: 'Müştərilər', description: 'Bütün müştərilərin siyahısı', icon: Building2, color: 'bg-emerald-500', exportFn: exportAccounts },
  { id: 'contacts', label: 'Kontaktlar', description: 'Bütün kontaktların siyahısı', icon: Users, color: 'bg-purple-500', exportFn: exportContacts },
  { id: 'quotes', label: 'Təkliflər', description: 'Bütün təkliflərin siyahısı', icon: FileText, color: 'bg-amber-500', exportFn: exportQuotes },
  { id: 'orders', label: 'Sifarişlər', description: 'Bütün sifarişlərin siyahısı', icon: ShoppingCart, color: 'bg-cyan-500', exportFn: exportOrders },
  { id: 'invoices', label: 'Fakturalar', description: 'Bütün fakturaların siyahısı', icon: Receipt, color: 'bg-rose-500', exportFn: exportInvoices },
]

const importOptions = [
  { id: 'accounts', label: 'Müştərilər', description: 'CSV fayldan müştəri əlavə et', icon: Building2, color: 'bg-emerald-500', importFn: importAccounts, requiredHeaders: ['name'] },
  { id: 'contacts', label: 'Kontaktlar', description: 'CSV fayldan kontakt əlavə et', icon: Users, color: 'bg-purple-500', importFn: importContacts, requiredHeaders: ['firstName', 'lastName'] },
  { id: 'products', label: 'Məhsullar', description: 'CSV fayldan məhsul əlavə et', icon: Target, color: 'bg-amber-500', importFn: importProducts, requiredHeaders: ['sku', 'name', 'price'] },
  { id: 'leads', label: 'Lead-lər', description: 'CSV fayldan lead əlavə et', icon: FileText, color: 'bg-blue-500', importFn: importLeads, requiredHeaders: ['title'] },
]

export default function Export() {
  const [activeTab, setActiveTab] = useState('export')
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [importResults, setImportResults] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const fileInputRef = useRef(null)
  const [activeImportOption, setActiveImportOption] = useState(null)

  const handleExport = async (exportOption) => {
    try {
      setLoading(exportOption.id)
      setError(null)
      setSuccess(null)
      await exportOption.exportFn()
      setSuccess(`${exportOption.label} uğurla ixrac edildi!`)
    } catch (err) {
      console.error('Export error:', err)
      setError(`${exportOption.label} ixrac edilə bilmədi`)
    } finally {
      setLoading(null)
    }
  }

  const handleExportAll = async () => {
    try {
      setLoading('all')
      setError(null)
      setSuccess(null)
      for (const option of exportOptions) {
        await option.exportFn()
      }
      setSuccess('Bütün məlumatlar uğurla ixrac edildi!')
    } catch (err) {
      console.error('Export all error:', err)
      setError('İxrac prosesi zamanı xəta baş verdi')
    } finally {
      setLoading(null)
    }
  }

  const handleFileSelect = async (e, importOption) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSelectedFile(file)
      setActiveImportOption(importOption)
      setError(null)
      setImportResults(null)

      const data = await readCSVFile(file)
      setPreviewData(data.slice(0, 5))

      const headers = Object.keys(data[0] || {})
      const missing = importOption.requiredHeaders.filter(h => !headers.includes(h))
      if (missing.length > 0) {
        setError(`Çatışmayan başlıqlar: ${missing.join(', ')}`)
        setPreviewData(null)
      }
    } catch (err) {
      console.error('File read error:', err)
      setError('Fayl oxundu: ' + err.message)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !activeImportOption) return

    try {
      setLoading('import')
      setError(null)
      setImportResults(null)

      const data = await readCSVFile(selectedFile)
      const results = await activeImportOption.importFn(data)

      setImportResults(results)
      setSelectedFile(null)
      setPreviewData(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      if (results.errors.length === 0) {
        setSuccess(`${results.success} ${activeImportOption.label} uğurla əlavə edildi!`)
      }
    } catch (err) {
      console.error('Import error:', err)
      setError('İxrac prosesi zamanı xəta: ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">İxrac və İdxal</h1>
          <p className="text-slate-500 text-sm mt-1">Məlumatları CSV formatında ixrac və idxal edin</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'export' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            İxrac
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === 'import' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            İdxal
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {importResults && (
        <Card className="mb-6 p-6 border-2 border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-emerald-600" size={24} />
            <h3 className="font-semibold text-emerald-800">İdxal Nəticəsi</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-600">{importResults.success}</p>
              <p className="text-sm text-slate-500">Uğurlu</p>
            </div>
            <div className="p-4 bg-white rounded-xl text-center">
              <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
              <p className="text-sm text-slate-500">Xətalı</p>
            </div>
          </div>
          {importResults.errors.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto">
              {importResults.errors.map((err, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-red-700 py-1">
                  <AlertCircle size={14} />
                  <span>Setir {err.row}: {err.error}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'export' ? (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={handleExportAll} loading={loading === 'all'} icon={FileSpreadsheet}>
              Hamısını İxrac Et
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {exportOptions.map(option => {
              const Icon = option.icon
              return (
                <Card key={option.id} hover className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 ${option.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg">{option.label}</h3>
                      <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                      <Button onClick={() => handleExport(option)} loading={loading === option.id} variant="secondary" size="sm" className="mt-4" icon={Download}>
                        CSV İxrac Et
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">İxrac Haqqında</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>• Bütün ixrac faylları CSV (Comma Separated Values) formatındadır</p>
              <p>• CSV faylları Microsoft Excel, Google Sheets və digər cədvəl proqramlarında açıla bilər</p>
              <p>• Fayllar avtomatik olaraq hazırkı tarixlə adlandırılır</p>
            </div>
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-6 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">İdxal Qaydaları</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>• Fayl formatı CSV olmalıdır</p>
              <p>• İlk sətir başlıqları olmalıdır (name, email, phone və s.)</p>
              <p>• Mütləq başlıqlara diqqət edin (hər entity üçün müxtəlifdir)</p>
              <p>• Böyük fayllar üçün idxal bir neçə dəqiqə çəkə bilər</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            {importOptions.map(option => {
              const Icon = option.icon
              return (
                <Card key={option.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 ${option.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg">{option.label}</h3>
                      <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                      <p className="text-xs text-slate-400 mt-2">Mütləq başlıqlar: {option.requiredHeaders.join(', ')}</p>

                      <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={(e) => handleFileSelect(e, option)}
                        className="hidden"
                      />

                      <div className="mt-4">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="secondary"
                          size="sm"
                          icon={Upload}
                        >
                          Fayl Seç
                        </Button>
                      </div>

                      {selectedFile && activeImportOption?.id === option.id && previewData && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                          <p className="text-sm font-medium text-slate-700 mb-2">Seçilmiş fayl: {selectedFile.name}</p>
                          <p className="text-xs text-slate-500 mb-3">{previewData.length + 1} sətir tapıldı</p>
                          <Button onClick={handleImport} loading={loading === 'import'} size="sm" icon={Upload}>
                            İdxal Et
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </Layout>
  )
}
