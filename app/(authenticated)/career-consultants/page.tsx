import { createClient } from '@/lib/supabase/server'
import { CareerConsultantsClient } from './career-consultants-client'

export default async function CareerConsultantsPage() {
  const supabase = await createClient()
  const { data: consultants } = await supabase
    .from('career_consultants')
    .select('*')
    .order('created_at', { ascending: false })

  return <CareerConsultantsClient initialConsultants={consultants || []} />
}
