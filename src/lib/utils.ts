import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createClient } from './supabase'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export async function uploadFile(file: File, userId?: string): Promise<string> {
  try {
    const supabase = createClient()
    
    // File validation
    const maxSize = 10 * 1024 * 1024 // 10MB limit
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }
    
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip', 'application/x-zip-compressed'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Please upload images, documents, or zip files.')
    }
    
    // Generate a unique filename with timestamp and random string
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId || 'anonymous'}_${timestamp}_${randomString}.${fileExtension}`
    
    // Upload file to the "useruploads" bucket
    const { data, error } = await supabase.storage
      .from('useruploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('useruploads')
      .getPublicUrl(fileName)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file')
    }

    console.log('File uploaded successfully:', urlData.publicUrl)
    return urlData.publicUrl

  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}
