import { createClient } from '@/lib/supabase/server'
import { DoctorsClient } from './doctors-client'

export default async function DoctorsPage() {
  const supabase = await createClient()
  const { data: doctors } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false })

  return <DoctorsClient initialDoctors={doctors || []} />
}
