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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Eye, Search, Droplets, Zap, Map, Trash2, AlertTriangle } from 'lucide-react'
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

export function IssuesClient({ initialIssues, admins }: { initialIssues: any[]; admins: any[] }) {
  const [issues, setIssues] = useState(initialIssues)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('')
  const [wardFilter, setWardFilter] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const filteredIssues = issues.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false
    if (typeFilter && !i.issue_type?.toLowerCase().includes(typeFilter.toLowerCase())) return false
    if (wardFilter && !i.ward?.toLowerCase().includes(wardFilter.toLowerCase())) return false
    return true
  })

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
      setIssues(issues.map((i) => (i.id === id ? { ...i, status: nextStatus, resolved_at: resolvedAt } : i)))
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Issues</h1>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '160px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Status</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || 'all')}>
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
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v || 'all')}>
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
            <Input placeholder="Filter by typeâ€¦" style={{ paddingLeft: '32px' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Ward</Label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <Input placeholder="Filter by wardâ€¦" style={{ paddingLeft: '32px' }} value={wardFilter} onChange={(e) => setWardFilter(e.target.value)} />
          </div>
        </div>
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
            {filteredIssues.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8}>
                  <div className="empty-state">
                    <AlertTriangle size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No issues found</div>
                    {(statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter || wardFilter) && (
                      <div className="empty-state-desc">Try adjusting your filters</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredIssues.map((issue) => {
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
                onSuccess={(updatedIssue) => {
                  setIsSheetOpen(false)
                  setIssues(issues.map((i) => (i.id === updatedIssue.id ? { ...i, ...updatedIssue } : i)))
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

