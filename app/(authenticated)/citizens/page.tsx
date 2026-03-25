import { createClient } from '@/lib/supabase/server'
import { CitizensClient } from './citizens-client'

export default async function CitizensPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ 
    page?: string; 
    search?: string; 
    ward?: string; 
    ageGroup?: string;
  }> 
}) {
  const { page, search, ward, ageGroup } = await searchParams
  const ITEMS_PER_PAGE = 10
  const currentPage = parseInt(page || '1')
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,citizen_id.ilike.%${search}%`)
  }
  if (ward) {
    query = query.ilike('ward', `%${ward}%`)
  }
  if (ageGroup && ageGroup !== 'all') {
    query = query.eq('age_group', ageGroup)
  }

  const { data: citizens, count } = await query

  const { data: ageGroupsData } = await supabase
    .from('users')
    .select('age_group')
    .not('age_group', 'is', null)

  const distinctAgeGroups = Array.from(new Set(ageGroupsData?.map((a) => a.age_group))) as string[]
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

  return (
    <CitizensClient 
      initialCitizens={citizens || []} 
      ageGroups={distinctAgeGroups}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={count || 0}
      initialSearch={search || ''}
      initialWard={ward || ''}
      initialAgeGroup={ageGroup || 'all'}
    />
  )
}
