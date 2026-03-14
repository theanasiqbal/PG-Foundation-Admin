'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function CitizenDetail({ citizen }: { citizen: any }) {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [regsRes, issuesRes] = await Promise.all([
        supabase
          .from('program_registrations')
          .select(`
            *,
            programs (
              title,
              category,
              date
            )
          `)
          .eq('user_id', citizen.id)
          .order('registered_at', { ascending: false }),
        supabase
          .from('issues')
          .select('*')
          .eq('user_id', citizen.id)
          .order('created_at', { ascending: false }),
      ])

      setRegistrations(regsRes.data || [])
      setIssues(issuesRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [citizen.id, supabase])

  const getInterestColor = (interest: string) => {
    const colors: Record<string, string> = {
      Healthcare: 'var(--healthcare)',
      Education:  'var(--education)',
      Community:  'var(--community)',
      Environment: '#10B981',
      Social:      '#EC4899',
      Youth:       '#3B82F6',
      Sports:      '#F97316',
      Arts:        '#8B5CF6',
    }
    if (colors[interest]) return colors[interest]
    const fallbackColors = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6']
    let hash = 0
    for (let i = 0; i < interest.length; i++) hash = interest.charCodeAt(i) + ((hash << 5) - hash)
    return fallbackColors[Math.abs(hash) % fallbackColors.length]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div 
          style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 600, color: 'var(--accent)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {citizen.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{citizen.name}</h2>
          <div className="flex items-center gap-2">
            <span 
              style={{ 
                fontFamily: 'monospace', fontSize: '12px', padding: '2px 8px', borderRadius: '4px',
                background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)'
              }}
            >
              {citizen.citizen_id}
            </span>
            <Badge variant="outline" style={{ fontSize: '11px' }}>Ward {citizen.ward}</Badge>
          </div>
        </div>
      </div>

      <div 
        className="grid grid-cols-2 gap-y-4 gap-x-8 p-4 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Phone Number</span>
          <div className="text-[14px] text-[var(--text-primary)] font-medium">{citizen.phone || '—'}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Age Group</span>
          <div className="text-[14px] text-[var(--text-primary)] font-medium">{citizen.age_group || '—'}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Occupation</span>
          <div className="text-[14px] text-[var(--text-primary)] font-medium">{citizen.occupation || '—'}</div>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Joined Date</span>
          <div className="text-[14px] text-[var(--text-primary)] font-medium">
            {citizen.created_at ? format(new Date(citizen.created_at), 'MMMM d, yyyy') : '—'}
          </div>
        </div>
      </div>

      {citizen.interests && citizen.interests.length > 0 && (
        <div className="space-y-3">
          <span className="text-[12px] font-semibold text-[var(--text-secondary)]">Areas of Interest</span>
          <div className="flex flex-wrap gap-2">
            {citizen.interests.map((interest: string) => {
              const color = getInterestColor(interest)
              return (
                <span
                  key={interest}
                  style={{
                    display: 'inline-flex', alignItems: 'center', height: '24px', padding: '0 10px',
                    borderRadius: '6px', fontSize: '11px', fontWeight: 500,
                    background: `${color}15`, color: color,
                    border: `1px solid ${color}30`
                  }}
                >
                  {interest}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <Tabs defaultValue="registrations" className="w-full pt-2">
        <TabsList className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 h-11">
          <TabsTrigger value="registrations" className="data-[state=active]:bg-[var(--bg-overlay)]">
            Programs <Badge className="ml-2 py-0 px-1.5 h-4 text-[10px]" variant="secondary">{registrations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="issues" className="data-[state=active]:bg-[var(--bg-overlay)]">
            Reported Issues <Badge className="ml-2 py-0 px-1.5 h-4 text-[10px]" variant="secondary">{issues.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="registrations" className="mt-4 outline-none">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] opacity-50" /></div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] border border-[var(--border-subtle)] border-dashed rounded-lg">
              No program registrations found
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-surface)]">
              <Table>
                <TableHeader className="bg-[var(--bg-elevated)]/50">
                  <TableRow className="border-b-[var(--border-subtle)] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)] text-[11px] uppercase font-bold">Program</TableHead>
                    <TableHead className="text-[var(--text-muted)] text-[11px] uppercase font-bold text-center">Status</TableHead>
                    <TableHead className="text-[var(--text-muted)] text-[11px] uppercase font-bold text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id} className="border-b-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)]/30">
                      <TableCell>
                        <div className="font-medium text-[var(--text-primary)] text-[13px]">{reg.programs?.title}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{reg.programs?.category}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={reg.status === 'attended' ? 'active' : 'pending'}
                          className="px-2 py-0 h-5 text-[10px] uppercase tracking-tight"
                        >
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[12px] text-[var(--text-secondary)]">
                        {reg.programs?.date}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="issues" className="mt-4 outline-none">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] opacity-50" /></div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] border border-[var(--border-subtle)] border-dashed rounded-lg">
              No issues reported by this citizen
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-surface)]">
              <Table>
                <TableHeader className="bg-[var(--bg-elevated)]/50">
                  <TableRow className="border-b-[var(--border-subtle)] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)] text-[11px] uppercase font-bold">Issue Type</TableHead>
                    <TableHead className="text-[var(--text-muted)] text-[11px] uppercase font-bold text-center">Status</TableHead>
                    <TableHead className="text-[var(--text-muted)] text-[11px] uppercase font-bold text-right">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow key={issue.id} className="border-b-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)]/30">
                      <TableCell>
                        <div className="font-medium text-[var(--text-primary)] text-[13px]">{issue.issue_type}</div>
                        <div className="text-[11px] text-[var(--text-muted)] max-w-[180px] truncate">{issue.description}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={issue.status === 'resolved' ? 'active' : issue.status === 'in_progress' ? 'default' : 'pending'}
                          className="px-2 py-0 h-5 text-[10px] uppercase tracking-tight"
                        >
                          {issue.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-[12px] text-[var(--text-secondary)]">
                        {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
