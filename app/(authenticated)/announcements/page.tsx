import { createClient } from '@/lib/supabase/server'
import { AnnouncementsClient } from './announcements-client'

export default async function AnnouncementsPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const ITEMS_PER_PAGE = 10
  const currentPage = parseInt(page || '1')
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const supabase = await createClient()

  const { data: announcements, count } = await supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return (
    <AnnouncementsClient 
      initialAnnouncements={announcements || []} 
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={count || 0}
    />
  )
}
