'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
import { Edit, Trash2, Megaphone, Plus, Check, X } from 'lucide-react'
import { format, isPast } from 'date-fns'
import { toast } from 'sonner'
import { AnnouncementForm } from './announcement-form'

interface AnnouncementsClientProps {
  initialAnnouncements: any[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function AnnouncementsClient({ 
  initialAnnouncements,
  currentPage,
  totalPages,
  totalCount
}: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    setAnnouncements(initialAnnouncements)
  }, [initialAnnouncements])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Announcement deleted successfully')
      setAnnouncements(announcements.filter((a: any) => a.id !== id))
      router.refresh()
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('announcements').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Status updated')
      setAnnouncements(announcements.map((a: any) => (a.id === id ? { ...a, is_active: !currentStatus } : a)))
      router.refresh()
    }
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const typeBadgeVariant: Record<string, any> = {
    urgent: 'urgent',
    event: 'in_progress',
    achievement: 'resolved',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingAnnouncement(null)
          }}>
            <DialogTrigger
              render={
                <Button>
                  <Plus size={14} />
                  Create Announcement
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
              </DialogHeader>
              <div style={{ marginTop: '16px' }}>
                <AnnouncementForm
                  initialData={editingAnnouncement}
                  onSuccess={(newAnnouncement: any) => {
                    setIsDialogOpen(false)
                    if (editingAnnouncement) {
                      setAnnouncements(announcements.map((a: any) => (a.id === newAnnouncement.id ? newAnnouncement : a)))
                    } else {
                      setAnnouncements([newAnnouncement, ...announcements])
                    }
                    setEditingAnnouncement(null)
                    router.refresh()
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="premium-table-container">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>
                  <div className="empty-state">
                    <Megaphone size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No announcements found</div>
                    <div className="empty-state-desc">Create your first announcement -&gt;</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement: any) => {
                const isExpired = announcement.expires_at && isPast(new Date(announcement.expires_at))
                const isUrgent = announcement.type === 'urgent'

                return (
                  <TableRow
                    key={announcement.id}
                    style={{
                      background: isUrgent ? 'rgba(239,68,68,0.04)' : undefined,
                    }}
                  >
                    <TableCell style={{ fontWeight: 500, color: isExpired ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="inactive">Expired</Badge>
                      ) : (
                        <Badge variant={typeBadgeVariant[announcement.type] || 'default'}>
                          {announcement.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {announcement.ward === 'all' ? 'All Wards' : announcement.ward}
                    </TableCell>
                    <TableCell>
                      <button
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: announcement.is_active ? 'var(--success)' : 'var(--text-muted)',
                          transition: 'all 150ms ease',
                        }}
                        onClick={() => toggleStatus(announcement.id, announcement.is_active)}
                      >
                        {announcement.is_active ? <Check size={16} /> : <X size={16} />}
                      </button>
                    </TableCell>
                    <TableCell>
                      {announcement.expires_at ? (
                        <span style={{ fontSize: '13px', color: isExpired ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {format(new Date(announcement.expires_at), 'MMM d, yyyy')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Never</span>
                      )}
                    </TableCell>
                    <TableCell style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingAnnouncement(announcement)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="ghost" size="icon">
                                <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the announcement.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                                onClick={() => handleDelete(announcement.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
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

