'use client'

import { useState } from 'react'
import { Download, RefreshCw, Loader2, Clock } from 'lucide-react'
import { initiateRestore, getDownloadUrl } from '@/app/(dashboard)/files/actions'

export default function FileActions({ file }: { file: any }) {
  const [loading, setLoading] = useState(false)
  const [working, setWorking] = useState(false) // Separate generic loader
  const [message, setMessage] = useState('')

  const handleDownload = async () => {
      setWorking(true)
      try {
        const url = await getDownloadUrl(file.key)
        // window.open(url, '_blank') 
        window.location.href = url // reliable for downloading attachments
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
  }

  // Placeholder logic for "Is it restored?"
  // In a real app, you'd check file.restore_status from DB or check S3 HeadObject
  const isGlacier = file.storage_class === 'GLACIER' || file.storage_class === 'DEEP_ARCHIVE'
  
  return (
    <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end gap-2">
            <button 
                onClick={handleDownload}
                disabled={working}
                className="flex items-center gap-2 px-3 py-1 text-xs font-bold border border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 transition-colors"
            >
                {working ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
                GET
            </button>
            
            {isGlacier && (
                <button 
                    onClick={handleRestore}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1 text-xs font-bold border border-black bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 transition-colors" 
                    title="Request Restore"
                >
                    {loading ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14} />}
                    RESTORE
                </button>
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
