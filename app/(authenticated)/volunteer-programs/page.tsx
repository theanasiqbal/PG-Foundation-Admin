import { createClient } from '@/lib/supabase/server'
import { VolunteerProgramsClient } from './volunteer-programs-client'

export default async function VolunteerProgramsPage() {
  const supabase = await createClient()
  const { data: programs } = await supabase
    .from('volunteer_programs')
    .select('*')
    .order('created_at', { ascending: false })

  return <VolunteerProgramsClient initialPrograms={programs || []} />
}
