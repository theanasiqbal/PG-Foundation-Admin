'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Award, Plus, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ScholarshipForm } from './scholarship-form'

export function ScholarshipsClient({ initialScholarships }: { initialScholarships: any[] }) {
  const [scholarships, setScholarships] = useState(initialScholarships)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('scholarships').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Scholarship deleted')
      setScholarships(scholarships.filter((s) => s.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('scholarships').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setScholarships(scholarships.map((s) => s.id === id ? { ...s, is_active: !current } : s))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Scholarships</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Scholarship</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Scholarship' : 'Add Scholarship'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <ScholarshipForm
                initialData={editing}
                onSuccess={(s) => {
                  setIsDialogOpen(false)
                  if (editing) { setScholarships(scholarships.map((x) => x.id === s.id ? s : x)) }
                  else { setScholarships([s, ...scholarships]) }
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
              <TableHead>Organization</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Last Date</TableHead>
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scholarships.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>
                  <div className="empty-state">
                    <Award size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No scholarships found</div>
                    <div className="empty-state-desc">Add your first scholarship â†’</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scholarships.map((s) => (
                <TableRow key={s.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.organization}</TableCell>
                  <TableCell><Badge variant="default">{s.category}</Badge></TableCell>
                  <TableCell style={{ fontSize: '13px', fontWeight: 500, color: 'var(--success)' }}>{s.amount}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{format(new Date(s.last_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(s.id, s.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {s.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Scholarship?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{s.name}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(s.id)}>Delete</AlertDialogAction>
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





