import { createClient } from '@/lib/supabase/server'

export interface PublicPage {
  id: string
  user_id: string
  type: 'resume' | 'portfolio' | 'links'
  slug: string
  visibility: 'private' | 'unlisted' | 'public'
  content_json: any
  updated_at: string
}

export async function getPublicPage(slug: string, type: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('public_pages')
    .select('*')
    .eq('slug', slug)
    .eq('type', type)
    .in('visibility', ['public', 'unlisted'])
    .single()

  if (error) throw error
  return data as PublicPage
}

