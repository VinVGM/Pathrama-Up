'use server'

import { S3Client, RestoreObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function initiateRestore(fileKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  try {
    const command = new RestoreObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        RestoreRequest: {
            Days: 1, // Keep restored for 1 day
            GlacierJobParameters: {
                Tier: 'Standard', // Typically 3-5 hours
            }
        }
    })

    await s3.send(command)
    
    // Ideally update DB status here if you tracked "restoring" state locally
    revalidatePath('/files')
    return { success: true, message: 'Restore initiated. Available in 3-5 hours.' }
  } catch (error: any) {
    if (error.name === 'RestoreAlreadyInProgress') {
        return { success: true, message: 'Restore already in progress.' }
    }
    console.error("Restore Error:", error)
    return { success: false, message: error.message || 'Failed to initiate restore' }
  }
}

export async function checkRestoreStatus(fileKey: string) {
    // This is optional if we trust the "RestoreAlreadyInProgress" error, 
    // but useful for UI to show "Restoring..." vs "Available"
    const command = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
    })

    try {
        const response = await s3.send(command)
        // Header x-amz-restore: ongoing-request="true" (restoring) or ongoing-request="false", expiry-date="..." (restored)
        const restoreHeader = response.Restore
        
        if (!restoreHeader) return { status: 'NOT_REQUESTED' }
        
        if (restoreHeader.includes('ongoing-request="true"')) {
            return { status: 'RESTORING' }
        } else if (restoreHeader.includes('ongoing-request="false"')) {
            return { status: 'RESTORED', expiry: response.Restore }
        }
        
        return { status: 'UNKNOWN' }
    } catch (e: any) {
        return { status: 'ERROR', message: e.message }
    }
}

export async function getDownloadUrl(fileKey: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        ResponseContentDisposition: `attachment; filename="${fileKey.split('/').pop()}"`,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }) // Valid for 1 hour
    return url
}
