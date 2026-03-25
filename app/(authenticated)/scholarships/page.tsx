import { createClient } from '@/lib/supabase/server'
import { ScholarshipsClient } from './scholarships-client'

export default async function ScholarshipsPage() {
  const supabase = await createClient()
  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .order('created_at', { ascending: false })

  return <ScholarshipsClient initialScholarships={scholarships || []} />
}
