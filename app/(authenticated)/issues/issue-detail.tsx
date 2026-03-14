'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, MapPin, Phone, User } from 'lucide-react'
import Image from 'next/image'

export function IssueDetail({ issue, admins, onSuccess }: { issue: any; admins: any[]; onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false)
  const [priority, setPriority] = useState(issue.priority)
  const [status, setStatus] = useState(issue.status)
  const [assignedTo, setAssignedTo] = useState(issue.assigned_to || 'unassigned')
  const [adminNotes, setAdminNotes] = useState(issue.admin_notes || '')

  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    try {
      const resolvedAt = status === 'resolved' && issue.status !== 'resolved' ? new Date().toISOString() : issue.resolved_at

      const { data, error } = await supabase
        .from('issues')
        .update({
          priority,
          status,
          assigned_to: assignedTo === 'unassigned' ? null : assignedTo,
          admin_notes: adminNotes,
          resolved_at: resolvedAt,
        })
        .eq('id', issue.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Issue updated successfully')
      onSuccess(data)
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sectionHeader = {
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: '12px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {issue.image && (
        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
          <Image src={issue.image} alt="Issue" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
      )}

      <div>
        <h3 style={{ fontWeight: 500, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>{issue.issue_type}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{issue.description}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
        <MapPin size={14} />
        <span>{issue.location} (Ward: {issue.ward})</span>
      </div>

      {/* Citizen Info */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <div style={sectionHeader}>Citizen Info</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <User size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{issue.users?.name || 'Anonymous'}</span>
          </div>
          {issue.users?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              <Phone size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{issue.users.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Update Issue */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={sectionHeader}>Update Issue</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v || 'medium')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v || 'pending')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Assign To</Label>
          <Select value={assignedTo} onValueChange={(v) => setAssignedTo(v || '')}>
            <SelectTrigger><SelectValue placeholder="Select admin" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Admin Notes (Internal only)</Label>
          <Textarea
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about the resolution…"
          />
        </div>

        <Button onClick={handleSave} className="w-full" disabled={loading}>
          {loading && <Loader2 size={14} className="animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
