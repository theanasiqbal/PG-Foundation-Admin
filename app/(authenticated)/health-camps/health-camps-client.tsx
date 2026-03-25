'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
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
import { Edit, Trash2, Tent, Plus, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { HealthCampForm } from './health-camp-form'

interface HealthCampsClientProps {
  initialCamps: any[]
  currentPage: number
  totalPages: number
  totalCount: number
}

export function HealthCampsClient({ 
  initialCamps,
  currentPage,
  totalPages,
  totalCount
}: HealthCampsClientProps) {
  const [camps, setCamps] = useState(initialCamps)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCamp, setEditingCamp] = useState<any>(null)
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const supabase = createClient()

  useEffect(() => {
    setCamps(initialCamps)
  }, [initialCamps])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('health_camps').delete().eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Health camp deleted')
      setCamps(camps.filter((c: any) => c.id !== id))
      router.refresh()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('health_camps').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error(error.message) } else {
      toast.success('Status updated')
      setCamps(camps.map((c: any) => c.id === id ? { ...c, is_active: !current } : c))
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
        <h1 className="page-title">Health Camps</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount}
          </div>
          <Button onClick={() => setIsDialogOpen(true)}><Plus size={14} /> Add Health Camp</Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingCamp(null) }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{editingCamp ? 'Edit Health Camp' : 'Add Health Camp'}</DialogTitle></DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <HealthCampForm
                initialData={editingCamp}
                onSuccess={(camp: any) => {
                  setIsDialogOpen(false)
                  if (editingCamp) { setCamps(camps.map((c: any) => c.id === camp.id ? camp : c)) }
                  else { setCamps([camp, ...camps]) }
                  setEditingCamp(null)
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
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead>Active</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camps.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9}>
                  <div className="empty-state">
                    <Tent size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No health camps found</div>
                    <div className="empty-state-desc">Add your first health camp â†’</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              camps.map((camp: any) => (
                <TableRow key={camp.id}>
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{camp.title}</TableCell>
                  <TableCell><Badge variant="default">{camp.category}</Badge></TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{camp.location}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{camp.ward}</TableCell>
                  <TableCell style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{camp.date ? format(new Date(camp.date), 'MMM d, yyyy') : 'â€”'}</TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{camp.seats_available ?? 'â€”'}</TableCell>
                  <TableCell style={{ fontSize: '13px' }}>{camp.registrations_count ?? 0}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(camp.id, camp.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: camp.is_active ? 'var(--success)' : 'var(--text-muted)' }}>
                      {camp.is_active ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCamp(camp); setIsDialogOpen(true) }}><Edit size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger><Button variant="ghost" size="icon"><Trash2 size={14} style={{ color: 'var(--text-muted)' }} /></Button></AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Health Camp?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{camp.title}".</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => handleDelete(camp.id)}>Delete</AlertDialogAction>
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
