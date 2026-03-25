'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, BriefcaseMedical, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { CareerConsultantForm } from './career-consultant-form'

export function CareerConsultantsClient({ initialConsultants }: { initialConsultants: any[] }) {
  const [consultants, setConsultants] = useState(initialConsultants)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('career_consultants').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Consultant deleted')
      setConsultants(consultants.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('career_consultants').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setConsultants(consultants.map((c) => c.id === id ? { ...c, is_active: !current } : c))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Career Consultants</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Consultant</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Consultant' : 'Add Consultant'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <CareerConsultantForm
                initialData={editing}
                onSuccess={(c) => {
                  setIsDialogOpen(false)
                  if (editing) { setConsultants(consultants.map((x) => x.id === c.id ? c : x)) }
                  else { setConsultants([c, ...consultants]) }
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
              <TableHead>Name</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>In-Person</TableHead>
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultants.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9}>
                  <div className="empty-state">
                    <BriefcaseMedical size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No consultants found</div>
                    <div className="empty-state-desc">Add your first consultant â†’</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              consultants.map((c) => (
                <TableRow key={c.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.specialization}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.experience}</TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{c.rating ? `â­ ${c.rating}` : 'â€”'}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{c.languages || 'â€”'}</TableCell>
                  <TableCell>{c.online ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--text-muted)' }} />}</TableCell>
                  <TableCell>{c.in_person ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--text-muted)' }} />}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(c.id, c.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {c.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(c); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Consultant?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete {c.name}.</AlertDialogDescription>
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





