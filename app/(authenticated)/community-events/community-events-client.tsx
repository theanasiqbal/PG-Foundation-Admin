'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Edit, Trash2, CalendarDays, Plus, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CommunityEventForm } from './community-event-form'

interface CommunityEventsClientProps {
  initialEvents: any[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function CommunityEventsClient({ 
  initialEvents,
  currentPage,
  totalPages,
  totalCount
}: CommunityEventsClientProps) {
  const [events, setEvents] = useState(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const supabase = createClient()

  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('community_events').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Event deleted')
      setEvents(events.filter((e: any) => e.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('community_events').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setEvents(events.map((e: any) => e.id === id ? { ...e, is_active: !current } : e))
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Community Events</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount}
          </div>
          <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Event</Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader><DialogTitle>{editing ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <CommunityEventForm
                initialData={editing}
                onSuccess={(ev: any) => {
                  setIsDialogOpen(false)
                  if (editing) { setEvents(events.map((x: any) => x.id === ev.id ? ev : x)) }
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
                    <div className="empty-state-desc">Add your first event -&gt;</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev: any) => (
                <TableRow key={ev.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{format(new Date(ev.date), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ev.location}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ev.ward || '-'}</TableCell>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                if (
                  (pageNum === 2 && currentPage > 3) || 
                  (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
