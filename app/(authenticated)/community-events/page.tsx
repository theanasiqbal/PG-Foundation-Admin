import { createClient } from '@/lib/supabase/server'
import { CommunityEventsClient } from './community-events-client'

export default async function CommunityEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from('community_events')
    .select('*')
    .order('created_at', { ascending: false })

  return <CommunityEventsClient initialEvents={events || []} />
}
