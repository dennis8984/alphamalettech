'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const uploadImage = async (file: File, bucket: string = 'articles'): Promise<{ url: string | null, error: string | null }> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `images/${fileName}`

    console.log('🔄 Uploading image to Supabase storage...', { fileName, bucket })

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Upload error:', error)
      return { url: null, error: error.message }
    }

    console.log('✅ Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return { url: null, error: 'Failed to get public URL' }
    }

    console.log('🔗 Public URL generated:', urlData.publicUrl)
    return { url: urlData.publicUrl, error: null }

  } catch (err) {
    console.error('💥 Unexpected upload error:', err)
    return { url: null, error: err instanceof Error ? err.message : 'Upload failed' }
  }
}

export const deleteImage = async (url: string, bucket: string = 'articles'): Promise<{ success: boolean, error: string | null }> => {
  try {
    // Extract file path from URL
    const urlParts = url.split(`/${bucket}/`)
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid image URL' }
    }
    
    const filePath = urlParts[1]
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
} 