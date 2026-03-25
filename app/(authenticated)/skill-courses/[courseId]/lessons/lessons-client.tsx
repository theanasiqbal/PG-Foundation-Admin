'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, BookOpen, Plus, Video } from 'lucide-react'
import { toast } from 'sonner'
import { LessonForm } from './lesson-form'

export function LessonsClient({ initialLessons, courseId, courseTitle }: { initialLessons: any[]; courseId: string; courseTitle: string }) {
  const [lessons, setLessons] = useState(initialLessons)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('skill_course_lessons').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Lesson deleted')
      setLessons(lessons.filter((l) => l.id !== id))
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Lessons</h1>
          <p className="text-sm text-gray-500 mt-1">For course: {courseTitle}</p>
        </div>
        <Button onClick={() => { setEditing(null); setIsDialogOpen(true) }}><Plus size={14} className="mr-1" /> Add Lesson</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <LessonForm
                courseId={courseId}
                initialData={editing}
                nextOrderNum={editing ? editing.order_num : (lessons.length > 0 ? Math.max(...lessons.map(l => l.order_num)) + 1 : 1)}
                onSuccess={(l: any) => {
                  setIsDialogOpen(false)
                  if (editing) { 
                    const updated = lessons.map((x) => x.id === l.id ? l : x)
                    setLessons(updated.sort((a, b) => a.order_num - b.order_num))
                  }
                  else { 
                    const updated = [...lessons, l]
                    setLessons(updated.sort((a, b) => a.order_num - b.order_num))
                  }
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
              <TableHead className="w-[80px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Video Link</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="empty-state">
                    <BookOpen size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No lessons found</div>
                    <div className="empty-state-desc">Add the first lesson for this course →</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((l) => (
                <TableRow key={l.id}>
                  <TableCell style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{l.order_num}</TableCell>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{l.title}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{l.duration}</TableCell>
                  <TableCell>
                    {l.video_url ? (
                      <a href={l.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline text-[13px]">
                        <Video size={14} className="mr-1" /> View Video
                      </a>
                    ) : <span className="text-gray-400 text-[13px]">No video</span>}
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(l); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{l.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(l.id)}>Delete</AlertDialogAction>
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
