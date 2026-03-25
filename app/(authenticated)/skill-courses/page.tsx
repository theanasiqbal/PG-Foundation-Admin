import { createClient } from '@/lib/supabase/server'
import { SkillCoursesClient } from './skill-courses-client'

export default async function SkillCoursesPage() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('skill_courses')
    .select('*, skill_course_enrollments(count)')
    .order('created_at', { ascending: false })

  return <SkillCoursesClient initialCourses={courses || []} />
}
