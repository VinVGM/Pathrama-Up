'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, RefreshCw, Loader2, Clock, CheckCircle } from 'lucide-react'
import { initiateRestore, getDownloadUrl, checkRestoreStatus } from '@/app/(dashboard)/files/actions'

export default function FileActions({ file }: { file: any }) {
  const [loading, setLoading] = useState(false)
  const [working, setWorking] = useState(false) 
  const [message, setMessage] = useState('')
  const [restoreStatus, setRestoreStatus] = useState<'NOT_REQUESTED' | 'RESTORING' | 'RESTORED' | 'CHECKING'>('CHECKING')

  const isGlacier = file.storage_class === 'GLACIER' || file.storage_class === 'DEEP_ARCHIVE'

  const checkStatus = useCallback(async () => {
      if (!isGlacier) {
          setRestoreStatus('RESTORED') // Standard files are always ready
          return
      }
      
      const { status } = await checkRestoreStatus(file.key)
      setRestoreStatus(status as any)
  }, [file.key, isGlacier])

  useEffect(() => {
      checkStatus()
      
      // If restoring, poll every 30 seconds
      const interval = setInterval(() => {
          if (restoreStatus === 'RESTORING') {
              checkStatus()
          }
      }, 30000)
      
      return () => clearInterval(interval)
  }, [checkStatus, restoreStatus])

  const handleDownload = async () => {
      setWorking(true)
      try {
        const url = await getDownloadUrl(file.key)
        window.location.href = url 
      } catch (e) {
          console.error(e)
          setMessage('Download failed')
      }
      setWorking(false)
  }

  const handleRestore = async () => {
    setLoading(true)
    const res = await initiateRestore(file.key)
    setLoading(false)
    setMessage(res.message)
    await checkStatus() // Refresh status immediately
  }
  
  return (
    <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
            {/* Download Button - Locked if Glacier and Not Restored */}
            <button 
                onClick={handleDownload}
                disabled={working || (isGlacier && restoreStatus !== 'RESTORED')}
                className="flex items-center gap-2 px-3 py-1 text-xs font-bold border border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black transition-colors"
                title={isGlacier && restoreStatus !== 'RESTORED' ? "File is archived. Restore first." : "Download File"}
            >
                {working ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                GET
            </button>
            
            {/* Restore Button - Only for Glacier, hidden if Restored */}
            {isGlacier && restoreStatus !== 'RESTORED' && (
                <button 
                    onClick={handleRestore}
                    disabled={loading || restoreStatus === 'RESTORING'}
                    className="flex items-center gap-2 px-3 py-1 text-xs font-bold border border-black bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 transition-colors" 
                    title="Request Restore"
                >
                    {loading || restoreStatus === 'RESTORING' ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14} />}
                    {restoreStatus === 'RESTORING' ? 'RESTORING...' : 'RESTORE'}
                </button>
            )}
            
            {isGlacier && restoreStatus === 'RESTORED' && (
                 <div className="px-3 py-1 text-xs font-bold border border-black bg-green-300 flex items-center gap-1">
                     <CheckCircle size={14} /> READY
                 </div>
            )}
        </div>
        
        {message && (
             <div className="text-[10px] font-mono font-bold bg-neutral-100 border border-black px-1 flex items-center gap-1">
                 <Clock size={10} /> {message}
             </div>
        )}
    </div>
  )
}
