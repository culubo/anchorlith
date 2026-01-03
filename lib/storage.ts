import { createClient } from '@/lib/supabase/client'

export async function uploadFile(
  file: File,
  linkedType: 'note' | 'event' | 'todo' | 'portfolio',
  linkedId?: string
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Create file path
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${linkedType}/${Date.now()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  // Upload file
  const { error } = await supabase.storage
    .from('files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('files').getPublicUrl(filePath)

  // Save file record to database
  const { data: fileRecord, error: dbError } = await supabase
    .from('files')
    .insert({
      user_id: user.id,
      storage_path: filePath,
      mime_type: file.type,
      size: file.size,
      linked_type: linkedType,
      linked_id: linkedId || null,
    })
    .select()
    .single()

  if (dbError) throw dbError

  return {
    ...fileRecord,
    publicUrl,
  }
}

export async function deleteFile(fileId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get file record
  const { data: fileRecord, error: fetchError } = await supabase
    .from('files')
    .select('storage_path')
    .eq('id', fileId)
    .eq('user_id', user.id)
    .single()

  if (fetchError) throw fetchError

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('files')
    .remove([fileRecord.storage_path])

  if (storageError) throw storageError

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (dbError) throw dbError
}

export async function getFiles(
  linkedType: 'note' | 'event' | 'todo' | 'portfolio',
  linkedId: string
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .eq('linked_type', linkedType)
    .eq('linked_id', linkedId)

  if (error) throw error

  // Get public URLs
  const filesWithUrls = data.map((file) => {
    const {
      data: { publicUrl },
    } = supabase.storage.from('files').getPublicUrl(file.storage_path)

    return {
      ...file,
      publicUrl,
    }
  })

  return filesWithUrls
}

