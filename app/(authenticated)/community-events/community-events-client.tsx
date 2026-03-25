'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, CalendarDays, Plus, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CommunityEventForm } from './community-event-form'

export function CommunityEventsClient({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('community_events').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Event deleted')
      setEvents(events.filter((e) => e.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('community_events').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setEvents(events.map((e) => e.id === id ? { ...e, is_active: !current } : e))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Community Events</h1>
        <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Event</Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <CommunityEventForm
                initialData={editing}
                onSuccess={(ev) => {
                  setIsDialogOpen(false)
                  if (editing) { setEvents(events.map((x) => x.id === ev.id ? ev : x)) }
                  else { setEvents([ev, ...events]) }
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
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6}>
                  <div className="empty-state">
                    <CalendarDays size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No events found</div>
                    <div className="empty-state-desc">Add your first event â†’</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{format(new Date(ev.date), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ev.location}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ev.ward || 'â€”'}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(ev.id, ev.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ev.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {ev.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(ev); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{ev.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(ev.id)}>Delete</AlertDialogAction>
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





