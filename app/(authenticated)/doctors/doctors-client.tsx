'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Stethoscope, Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { DoctorForm } from './doctor-form'

export function DoctorsClient({ initialDoctors }: { initialDoctors: any[] }) {
  const [doctors, setDoctors] = useState(initialDoctors)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('doctors').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Doctor deleted')
      setDoctors(doctors.filter((d) => d.id !== id))
      router.refresh()
    }
  }

  const toggleAvailable = async (id: string, current: boolean) => {
    const { error } = await supabase.from('doctors').update({ available: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Availability updated')
      setDoctors(doctors.map((d) => d.id === id ? { ...d, available: !current } : d))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Doctors</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Doctor</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingDoctor(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <DoctorForm
                initialData={editingDoctor}
                onSuccess={(doc) => {
                  setIsDialogOpen(false)
                  if (editingDoctor) { setDoctors(doctors.map((d) => d.id === doc.id ? doc : d)) }
                  else { setDoctors([doc, ...doctors]) }
                  setEditingDoctor(null)
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
              <TableHead>Hospital</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>In-person</TableHead>
              <TableHead>Online</TableHead>
              <TableHead>Available</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9}>
                  <div className="empty-state">
                    <Stethoscope size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No doctors found</div>
                    <div className="empty-state-desc">Add your first doctor â†’</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{doc.name}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{doc.specialization}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{doc.hospital}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{doc.ward || 'All Wards'}</TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{doc.rating ? `${doc.rating}` : '0'}</TableCell>
                  <TableCell>{doc.available_in_person ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--text-muted)' }} />}</TableCell>
                  <TableCell>{doc.available_online ? <Check size={14} style={{ color: 'var(--success)' }} /> : <X size={14} style={{ color: 'var(--text-muted)' }} />}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleAvailable(doc.id, doc.available)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: doc.available ? 'var(--success)' : 'var(--text-muted)' }}>
                      {doc.available ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingDoctor(doc); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Doctor?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete {doc.name}.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
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





