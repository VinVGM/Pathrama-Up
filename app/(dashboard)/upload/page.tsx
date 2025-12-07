'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react'
import { getPresignedUploadUrl, saveFileMetadata } from './actions'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }, [])

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    setUploading(true)
    
    for (const file of files) {
        try {
            setUploadProgress(prev => ({ ...prev, [file.name]: 'Starting...' }))
            
            // 1. Get Presigned URL
            const { signedUrl, fileKey } = await getPresignedUploadUrl(file.name, file.type)
            
            // 2. Upload to S3
            setUploadProgress(prev => ({ ...prev, [file.name]: 'Uploading to S3...' }))
            await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            })

            // 3. Save Metadata
             setUploadProgress(prev => ({ ...prev, [file.name]: 'Saving info...' }))
             await saveFileMetadata(fileKey, file.name, file.size, file.type)

             setUploadProgress(prev => ({ ...prev, [file.name]: 'Done' }))

        } catch (error) {
            console.error(error)
             setUploadProgress(prev => ({ ...prev, [file.name]: 'Failed' }))
        }
    }
    
    setUploading(false)
    setFiles([])
    // Optionally redirect or show success
    // router.push('/files') 
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 decoration-wavy decoration-indigo-500">
        Upload Archives
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Dropzone */}
        <div 
            onDragOver={onDragOver}
            onDrop={onDrop}
            className="border-dashed border-4 border-black bg-white flex flex-col items-center justify-center p-12 text-center hover:bg-indigo-50 transition-colors cursor-pointer relative"
        >
             <input 
                type="file" 
                multiple 
                onChange={onFileSelect} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <div className="bg-indigo-700 text-white p-4 rounded-full border-2 border-black shadow-neo mb-4">
                <Upload size={40} />
             </div>
             <h2 className="text-2xl font-bold uppercase mb-2">Drag & Drop Files</h2>
             <p className="font-medium text-neutral-500">or click to browse</p>
        </div>

        {/* File List */}
        <div className="bg-white border-neo shadow-neo p-6 flex flex-col">
            <h3 className="font-bold uppercase border-b-2 border-black pb-2 mb-4 flex justify-between items-center">
                <span>Selected Files ({files.length})</span>
                {files.length > 0 && (
                    <button 
                        onClick={() => setFiles([])}
                        className="text-xs text-red-600 underline"
                    >
                        Clear All
                    </button>
                )}
            </h3>
            
            <div className="flex-1 overflow-auto flex flex-col gap-2 min-h-[300px]">
                {files.length === 0 && (
                    <div className="flex items-center justify-center h-full text-neutral-400 font-bold italic">
                        No files selected yet.
                    </div>
                )}
                {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-2 border-neutral-200 bg-neutral-50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <File size={20} className="shrink-0" />
                            <span className="font-bold text-sm truncate">{file.name}</span>
                        </div>
                         <div className="flex items-center gap-4">
                             {uploadProgress[file.name] && (
                                 <span className={`text-xs font-mono font-bold ${
                                     uploadProgress[file.name] === 'Done' ? 'text-green-600' : 
                                     uploadProgress[file.name] === 'Failed' ? 'text-red-600' : 'text-indigo-600'
                                 }`}>
                                     {uploadProgress[file.name] === 'Done' && <CheckCircle size={14} className="inline mr-1"/>}
                                     {uploadProgress[file.name]}
                                 </span>
                             )}
                            {!uploading && (
                                <button onClick={() => removeFile(i)} className="hover:text-red-600">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                disabled={files.length === 0 || uploading}
                onClick={handleUpload}
                className="mt-6 w-full bg-black text-white p-4 font-bold text-lg uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {uploading && <Loader2 className="animate-spin" />}
                {uploading ? 'Processing...' : 'Start Upload'}
            </button>
        </div>
      </div>
    </div>
  )
}
