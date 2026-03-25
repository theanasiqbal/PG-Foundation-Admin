'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, Search, Droplets, Zap, Map, Trash2, AlertTriangle, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { IssueDetail } from './issue-detail'

const ICONS: Record<string, any> = {
  Water: Droplets,
  Electricity: Zap,
  Roads: Map,
  Garbage: Trash2,
  Other: AlertTriangle,
}

const ICON_COLORS: Record<string, string> = {
  Water: '#3B82F6',
  Electricity: '#F59E0B',
  Roads: '#10B981',
  Garbage: '#8B5CF6',
  Other: '#EF4444',
}

interface IssuesClientProps {
  initialIssues: any[]
  admins: any[]
  currentPage: number
  totalPages: number
  totalCount: number
  initialFilters: {
    status?: string
    priority?: string
    type?: string
    ward?: string
  }
}

export function IssuesClient({ 
  initialIssues, 
  admins,
  currentPage,
  totalPages,
  totalCount,
  initialFilters
}: IssuesClientProps) {
  const [issues, setIssues] = useState(initialIssues)
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || 'all')
  const [priorityFilter, setPriorityFilter] = useState(initialFilters.priority || 'all')
  const [typeFilter, setTypeFilter] = useState(initialFilters.type || '')
  const [wardFilter, setWardFilter] = useState(initialFilters.ward || '')
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    setIssues(initialIssues)
  }, [initialIssues])

  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value as string)
      } else {
        params.delete(key)
      }
    })
    params.set('page', '1') // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const cycleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'in_progress' : currentStatus === 'in_progress' ? 'resolved' : 'pending'
    const resolvedAt = nextStatus === 'resolved' ? new Date().toISOString() : null

    const { error } = await supabase
      .from('issues')
      .update({ status: nextStatus, resolved_at: resolvedAt })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`)
      setIssues(issues.map((i: any) => (i.id === id ? { ...i, status: nextStatus, resolved_at: resolvedAt } : i)))
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Issues</h1>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '160px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Status</Label>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v || 'all'); updateFilters({ status: v || 'all' }) }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '160px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Priority</Label>
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v || 'all'); updateFilters({ priority: v || 'all' }) }}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Issue Type</Label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <Input 
              placeholder="Filter by typeâ€¦" 
              style={{ paddingLeft: '32px' }} 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateFilters({ type: typeFilter })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Ward</Label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <Input 
              placeholder="Filter by wardâ€¦" 
              style={{ paddingLeft: '32px' }} 
              value={wardFilter} 
              onChange={(e) => setWardFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateFilters({ ward: wardFilter })}
            />
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={() => {
          setStatusFilter('all')
          setPriorityFilter('all')
          setTypeFilter('')
          setWardFilter('')
          updateFilters({ status: 'all', priority: 'all', type: '', ward: '' })
        }}>
          Clear All
        </Button>
      </div>

      {/* Table */}
      <div className="premium-table-container">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Citizen</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead style={{ textAlign: 'right' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8}>
                  <div className="empty-state">
                    <AlertTriangle size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No issues found</div>
                    <div className="empty-state-desc">Try adjusting your filters or search terms</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue: any) => {
                const Icon = ICONS[issue.issue_type] || AlertTriangle
                const iconColor = ICON_COLORS[issue.issue_type] || 'var(--text-muted)'
                const isUrgent = issue.priority === 'urgent'

                return (
                  <TableRow
                    key={issue.id}
                    style={isUrgent ? { borderLeft: '3px solid var(--danger)' } : undefined}
                  >
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: `${iconColor}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={14} style={{ color: iconColor }} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{issue.issue_type}</span>
                      </div>
                    </TableCell>
                    <TableCell style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {issue.description}
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{issue.ward}</TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{issue.users?.name || 'Anonymous'}</TableCell>
                    <TableCell>
                      <Badge variant={issue.priority as any}>{issue.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={issue.status === 'pending' ? 'pending' : issue.status === 'in_progress' ? 'in_progress' : 'resolved'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => cycleStatus(issue.id, issue.status)}
                      >
                        {issue.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedIssue(issue)
                          setIsSheetOpen(true)
                        }}
                      >
                        <Eye size={14} />
                      </Button>
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[540px] sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Issue Details</SheetTitle>
          </SheetHeader>
          <div style={{ padding: '20px 24px' }}>
            {selectedIssue && (
              <IssueDetail
                issue={selectedIssue}
                admins={admins}
                onSuccess={(updatedIssue: any) => {
                  setIsSheetOpen(false)
                  setIssues(issues.map((i: any) => (i.id === updatedIssue.id ? { ...i, ...updatedIssue } : i)))
                  router.refresh()
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

