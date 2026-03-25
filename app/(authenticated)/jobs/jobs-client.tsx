'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Briefcase, Plus, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { JobForm } from './job-form'

export function JobsClient({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('job_listings').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Job deleted')
      setJobs(jobs.filter((j) => j.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('job_listings').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setJobs(jobs.map((j) => j.id === id ? { ...j, is_active: !current } : j))
    }
  }

  const typeVariant: Record<string, any> = {
    'Full-time': 'resolved',
    'Part-time': 'in_progress',
    'Remote': 'pending',
    'Contract': 'default',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Job Listings</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Post Job</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Job' : 'Post Job'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <JobForm
                initialData={editing}
                onSuccess={(j) => {
                  setIsDialogOpen(false)
                  if (editing) { setJobs(jobs.map((x) => x.id === j.id ? j : x)) }
                  else { setJobs([j, ...jobs]) }
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
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8}>
                  <div className="empty-state">
                    <Briefcase size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No jobs found</div>
                    <div className="empty-state-desc">Post your first job listing Ã¢â€ â€™</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{j.title}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.company}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.location}</TableCell>
                  <TableCell><Badge variant={typeVariant[j.type] || 'default'}>{j.type}</Badge></TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{j.ward || 'Ã¢â‚¬â€'}</TableCell>
                  <TableCell style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{format(new Date(j.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(j.id, j.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: j.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {j.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(j); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{j.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(j.id)}>Delete</AlertDialogAction>
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





