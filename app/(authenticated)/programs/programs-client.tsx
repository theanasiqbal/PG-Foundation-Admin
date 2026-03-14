'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Users, Search, Plus, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ProgramForm } from './program-form'

export function ProgramsClient({ initialPrograms }: { initialPrograms: any[] }) {
  const [programs, setPrograms] = useState(initialPrograms)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [wardFilter, setWardFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()

  const filteredPrograms = programs.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    if (wardFilter && !p.ward?.toLowerCase().includes(wardFilter.toLowerCase())) return false
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      if (p.is_active !== isActive) return false
    }
    return true
  })

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Program deleted successfully')
      setPrograms(programs.filter((p) => p.id !== id))
      router.refresh()
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('programs').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Status updated')
      setPrograms(programs.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p)))
      router.refresh()
    }
  }

  const categoryColor: Record<string, string> = {
    Healthcare: 'var(--healthcare)',
    Education: 'var(--education)',
    Community: 'var(--community)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Programs</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setEditingProgram(null)
        }}>
          <DialogTrigger
            render={
              <Button>
                <Plus size={14} />
                Create Program
              </Button>
            }
          />
          <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgram ? 'Edit Program' : 'Create Program'}</DialogTitle>
            </DialogHeader>
            <div style={{ marginTop: '16px' }}>
              <ProgramForm
                initialData={editingProgram}
                onSuccess={(newProgram) => {
                  setIsDialogOpen(false)
                  if (editingProgram) {
                    setPrograms(programs.map((p) => (p.id === newProgram.id ? newProgram : p)))
                  } else {
                    setPrograms([newProgram, ...programs])
                  }
                  setEditingProgram(null)
                  router.refresh()
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Category</Label>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v || 'all')}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Community">Community</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '220px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Search Ward</Label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <Input
              placeholder="e.g. 12 or all"
              style={{ paddingLeft: '32px' }}
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '160px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Status</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || 'all')}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="premium-table-container">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Registrations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrograms.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8}>
                  <div className="empty-state">
                    <ClipboardList size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No programs found</div>
                    {(categoryFilter !== 'all' || wardFilter || statusFilter !== 'all') && (
                      <div className="empty-state-desc">Try adjusting your filters</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => {
                const seats = program.seats_available
                const regs = program.registrations_count || 0
                const seatPct = seats ? Math.min((regs / seats) * 100, 100) : 0
                const isInactive = !program.is_active

                return (
                  <TableRow
                    key={program.id}
                    style={{
                      borderLeft: `3px solid ${categoryColor[program.category] || 'transparent'}`,
                      opacity: isInactive ? 0.45 : 1,
                    }}
                  >
                    <TableCell
                      style={{ fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => router.push(`/programs/${program.id}`)}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{program.title}</span>
                      {program.subcategory && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {program.subcategory}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={program.category?.toLowerCase() as any || 'default'}
                      >
                        {program.category}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {program.ward === 'all' ? 'All Wards' : program.ward}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{program.date}</TableCell>
                    <TableCell>
                      {seats === null ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unlimited</span>
                      ) : (
                        <div>
                          <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {regs}/{seats}
                          </div>
                          <div className="seats-bar">
                            <div className="seats-bar-fill" style={{ width: `${seatPct}%` }} />
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <Users size={14} style={{ color: 'var(--text-muted)' }} />
                        {regs}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={program.is_active ? 'active' : 'inactive'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleStatus(program.id, program.is_active)}
                      >
                        {program.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProgram(program)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit size={14} color='orange' />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="ghost" size="icon">
                                <Trash2 size={14} color='red' />
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Program?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the program and all its registrations. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
                                onClick={() => handleDelete(program.id)}
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
    </div>
  )
}
