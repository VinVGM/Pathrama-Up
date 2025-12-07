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

export async function getPresignedUploadUrl(fileName: string, fileType: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // Create a unique key for S3 (e.g., user_id/timestamp_filename)
  const fileKey = `${user.id}/${Date.now()}_${fileName}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileKey,
    ContentType: fileType,
    // Standard storage class for upload, lifecycle rules can move it to Glacier
    StorageClass: 'STANDARD', 
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
        storage_class: 'STANDARD'
    })
    
    if (error) throw error
    
    // console.log("Mock saved metadata:", { fileKey, fileName, fileSize })
    revalidatePath('/dashboard')
    revalidatePath('/files')
}
