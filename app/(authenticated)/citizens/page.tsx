import { createClient } from '@/lib/supabase/server'
import { CitizensClient } from './citizens-client'

export default async function CitizensPage() {
  const supabase = await createClient()

  const { data: citizens } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: ageGroups } = await supabase
    .from('users')
    .select('age_group')
    .not('age_group', 'is', null)

  const distinctAgeGroups = Array.from(new Set(ageGroups?.map((a) => a.age_group)))

  return <CitizensClient initialCitizens={citizens || []} ageGroups={distinctAgeGroups} />
}
