'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, HeartHandshake, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { VolunteerProgramForm } from './volunteer-program-form'

export function VolunteerProgramsClient({ initialPrograms }: { initialPrograms: any[] }) {
  const [programs, setPrograms] = useState(initialPrograms)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('volunteer_programs').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Program deleted')
      setPrograms(programs.filter((p) => p.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('volunteer_programs').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setPrograms(programs.map((p) => p.id === id ? { ...p, is_active: !current } : p))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Volunteer Programs</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Program</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Program' : 'Add Volunteer Program'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <VolunteerProgramForm
                initialData={editing}
                onSuccess={(p) => {
                  setIsDialogOpen(false)
                  if (editing) { setPrograms(programs.map((x) => x.id === p.id ? p : x)) }
                  else { setPrograms([p, ...programs]) }
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
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Needed</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9}>
                  <div className="empty-state">
                    <HeartHandshake size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No volunteer programs found</div>
                    <div className="empty-state-desc">Add your first program â†’</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.title}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.date}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.location}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.ward || 'â€”'}</TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{p.volunteers_needed}</TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{p.volunteers_joined}</TableCell>
                  <TableCell>{p.is_recurring ? <Badge variant="resolved">Yes</Badge> : <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No</span>}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(p.id, p.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {p.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{p.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
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





