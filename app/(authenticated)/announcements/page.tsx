import { createClient } from '@/lib/supabase/server'
import { AnnouncementsClient } from './announcements-client'

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return <AnnouncementsClient initialAnnouncements={announcements || []} />
}
