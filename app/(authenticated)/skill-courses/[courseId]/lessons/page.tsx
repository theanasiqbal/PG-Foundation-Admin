import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LessonsClient } from './lessons-client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function LessonsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()

  // Fetch the course details to show in the header
  const { data: course, error: courseError } = await supabase
    .from('skill_courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    redirect('/skill-courses')
  }

  // Fetch the lessons for this course, ordered by order_num
  const { data: lessons } = await supabase
    .from('skill_course_lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_num', { ascending: true })

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center text-sm text-gray-500 mb-4 h-[24px]">
        <Link href="/skill-courses" className="hover:text-blue-600 transition-colors">Skill Courses</Link>
        <ChevronRight size={14} className="mx-1" />
        <span className="font-medium text-gray-900 truncate max-w-[200px]">{course.title}</span>
        <ChevronRight size={14} className="mx-1" />
        <span className="text-gray-900">Lessons</span>
      </div>
      
      <LessonsClient initialLessons={lessons || []} courseId={courseId} courseTitle={course.title} />
    </div>
  )
}
