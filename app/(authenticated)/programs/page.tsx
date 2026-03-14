import { createClient } from '@/lib/supabase/server'
import { ProgramsClient } from './programs-client'

export default async function ProgramsPage() {
  const supabase = await createClient()

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false })

  return <ProgramsClient initialPrograms={programs || []} />
}
