import { createClient } from '@/lib/supabase/server'
import { HealthCampsClient } from './health-camps-client'

export default async function HealthCampsPage() {
  const supabase = await createClient()
  const { data: camps } = await supabase
    .from('health_camps')
    .select('*')
    .order('created_at', { ascending: false })

  return <HealthCampsClient initialCamps={camps || []} />
}
