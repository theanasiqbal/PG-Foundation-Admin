import { createClient } from '@/lib/supabase/server'
import { IssuesClient } from './issues-client'

export default async function IssuesPage({
  searchParams
}: {
  searchParams: Promise<{ 
    page?: string, 
    status?: string, 
    priority?: string, 
    type?: string, 
    ward?: string 
  }>
}) {
  const { page, status, priority, type, ward } = await searchParams
  const ITEMS_PER_PAGE = 10
  const currentPage = parseInt(page || '1')
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const supabase = await createClient()

  let query = supabase
    .from('issues')
    .select(`
      *,
      users (
        name,
        phone
      )
    `, { count: 'exact' })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority)
  }
  if (type) {
    query = query.ilike('issue_type', `%${type}%`)
  }
  if (ward) {
    query = query.ilike('ward', `%${ward}%`)
  }

  const { data: issues, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data: admins } = await supabase
    .from('admin_users')
    .select('id, name')

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return (
    <IssuesClient 
      initialIssues={issues || []} 
      admins={admins || []} 
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={count || 0}
      initialFilters={{ status, priority, type, ward }}
    />
  )
}
