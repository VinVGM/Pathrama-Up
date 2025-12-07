'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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

export async function getPresignedUploadUrl(fileName: string, fileType: string, fileSize: number) {
  if (!fileType) fileType = 'application/octet-stream'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // CHECK STORAGE LIMIT
  // 1. Get User Profile Limit
  const { data: profile } = await supabase.from('profiles').select('storage_limit').eq('id', user.id).single()
  const limit = profile?.storage_limit || 53687091200 // Default 50GB if no profile

  // 2. Get Current Usage
  const { data: files } = await supabase.from('files').select('size').eq('user_id', user.id)
  const currentUsage = files?.reduce((acc, file) => acc + file.size, 0) || 0

  if (currentUsage + fileSize > limit) {
      throw new Error(`Storage Limit Exceeded. Your plan limit is ${(limit / 1073741824).toFixed(2)} GB.`)
  }

  // Create a unique key for S3 (e.g., user_id/timestamp_filename)
  const fileKey = `${user.id}/${Date.now()}_${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: fileType,
    // Direct upload to Glacier Flexible Retrieval
    StorageClass: 'GLACIER', 
  })

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })

  return { signedUrl, fileKey }
}

export async function saveFileMetadata(fileKey: string, fileName: string, fileSize: number, fileType: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('files').insert({
        user_id: user.id,
        key: fileKey,
        name: fileName,
        size: fileSize,
        type: fileType,
        storage_class: 'GLACIER'
    })
    
    if (error) throw error
    
    // console.log("Mock saved metadata:", { fileKey, fileName, fileSize })
    revalidatePath('/files')
}

import { GetBucketCorsCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3'

export async function checkAndFixCors() {
    try {
        const command = new PutBucketCorsCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                        AllowedOrigins: ["*"], // For dev. In prod, lock this down.
                        ExposeHeaders: ["ETag", "x-amz-meta-custom-header", "x-amz-storage-class"],
                        MaxAgeSeconds: 3000
                    }
                ]
            }
        })
        
        await s3.send(command)
        return { success: true, message: 'CORS updated to allow uploads.' }
    } catch (error: any) {
        console.error("CORS Error:", error)
        return { success: false, message: error.message }
    }
}
