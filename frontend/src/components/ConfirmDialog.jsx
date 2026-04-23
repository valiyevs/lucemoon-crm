import { Modal, Button } from './ui'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Sil', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="text-red-600" size={20} />
        </div>
        <p className="text-slate-600">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Ləğv et</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
      </div>
    </Modal>
  )
}
