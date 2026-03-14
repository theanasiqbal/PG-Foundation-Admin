import { createClient } from '@/lib/supabase/server'
import { IssuesClient } from './issues-client'

export default async function IssuesPage() {
  const supabase = await createClient()

  const { data: issues } = await supabase
    .from('issues')
    .select(`
      *,
      users (
        name,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  const { data: admins } = await supabase
    .from('admin_users')
    .select('id, name')

  return <IssuesClient initialIssues={issues || []} admins={admins || []} />
}
