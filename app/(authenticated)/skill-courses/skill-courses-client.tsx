'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, GraduationCap, Plus, Check, X, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { SkillCourseForm } from './skill-course-form'

export function SkillCoursesClient({ initialCourses }: { initialCourses: any[] }) {
  const [courses, setCourses] = useState(initialCourses)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('skill_courses').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Course deleted')
      setCourses(courses.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('skill_courses').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setCourses(courses.map((c) => c.id === id ? { ...c, is_active: !current } : c))
    }
  }

  const levelVariant: Record<string, any> = {
    Beginner: 'resolved',
    Intermediate: 'in_progress',
    Advanced: 'urgent',
    'All Levels': 'default',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Skill Courses</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Course</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Course' : 'Add Course'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <SkillCourseForm
                initialData={editing}
                onSuccess={(c) => {
                  setIsDialogOpen(false)
                  if (editing) { setCourses(courses.map((x) => x.id === c.id ? c : x)) }
                  else { setCourses([c, ...courses]) }
                  setEditing(null)
                  router.refresh()
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="premium-table-container">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>
                  <div className="empty-state">
                    <GraduationCap size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No courses found</div>
                    <div className="empty-state-desc">Add your first course Ã¢â€ â€™</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.title}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.instructor}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.duration}</TableCell>
                  <TableCell><Badge variant={levelVariant[c.level] || 'default'}>{c.level}</Badge></TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{c.skill_course_enrollments?.[0]?.count ?? 0}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(c.id, c.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {c.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Link href={`/skill-courses/${c.id}/lessons`}>
                        <Button variant="outline" size="sm" className="h-[28px] flex items-center gap-1 text-xs px-2 shadow-sm whitespace-nowrap">
                          <BookOpen size={12} /> Lessons
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-[28px] w-[28px]" onClick={() => { setEditing(c); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon" className="h-[28px] w-[28px]"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{c.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(c.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}





