'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Star, Users } from 'lucide-react'
import { format } from 'date-fns'
import { CitizenDetail } from './citizen-detail'

const INTEREST_COLORS: Record<string, string> = {
  Healthcare: 'var(--healthcare)',
  Education:  'var(--education)',
  Community:  'var(--community)',
  Environment: '#10B981', // green
  Social:      '#EC4899', // pink
  Youth:       '#3B82F6', // blue
  Sports:      '#F97316', // orange
  Arts:        '#8B5CF6', // purple
}

function getInterestColor(interest: string) {
  if (INTEREST_COLORS[interest]) return INTEREST_COLORS[interest]
  
  // Fallback: simple hash based color
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#EC4899']
  let hash = 0
  for (let i = 0; i < interest.length; i++) {
    hash = interest.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function CitizensClient({ initialCitizens, ageGroups }: { initialCitizens: any[]; ageGroups: string[] }) {
  const [citizens, setCitizens] = useState(initialCitizens)
  const [searchQuery, setSearchQuery] = useState('')
  const [wardFilter, setWardFilter] = useState('')
  const [ageGroupFilter, setAgeGroupFilter] = useState('all')
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const supabase = createClient()

  const filteredCitizens = citizens.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (
        !c.name?.toLowerCase().includes(q) &&
        !c.phone?.toLowerCase().includes(q) &&
        !c.citizen_id?.toLowerCase().includes(q)
      ) return false
    }
    if (wardFilter && !c.ward?.toLowerCase().includes(wardFilter.toLowerCase())) return false
    if (ageGroupFilter !== 'all' && c.age_group !== ageGroupFilter) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <h1 className="page-title">Citizens</h1>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Search</Label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <Input
              placeholder="Name, phone, or IDâ€¦"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '180px' }}>
          <Label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>Age Group</Label>
          <Select value={ageGroupFilter} onValueChange={(v) => setAgeGroupFilter(v || 'all')}>
            <SelectTrigger><SelectValue placeholder="Age Group" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Age Groups</SelectItem>
              {ageGroups.map((group) => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="premium-table-container">
        <Table className="premium-table">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Citizen ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Ward</TableHead>
              <TableHead>Age Group</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCitizens.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8}>
                  <div className="empty-state">
                    <Users size={40} className="empty-state-icon" />
                    <div className="empty-state-title">No citizens found</div>
                    {(searchQuery || wardFilter || ageGroupFilter !== 'all') && (
                      <div className="empty-state-desc">Try adjusting your filters</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCitizens.map((citizen) => (
                <TableRow
                  key={citizen.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedCitizen(citizen)
                    setIsSheetOpen(true)
                  }}
                >
                  <TableCell style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {citizen.name}
                  </TableCell>
                  <TableCell>
                    <span className="citizen-id-pill">{citizen.citizen_id}</span>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{citizen.phone}</TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{citizen.ward}</TableCell>
                  <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{citizen.age_group}</TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {citizen.interests?.slice(0, 2).map((interest: string) => {
                        const color = getInterestColor(interest)
                        return (
                          <span
                            key={interest}
                            style={{
                              display: 'inline-flex', alignItems: 'center',
                              height: '18px', padding: '0 6px', borderRadius: '999px',
                              fontSize: '10px', fontWeight: 500,
                              background: color ? `${color}22` : 'var(--bg-elevated)',
                              color: color || 'var(--text-muted)',
                              border: `1px solid ${color ? `${color}44` : 'var(--border-subtle)'}`,
                            }}
                          >
                            {interest}
                          </span>
                        )
                      })}
                      {citizen.interests?.length > 2 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          height: '18px', padding: '0 6px', borderRadius: '999px',
                          fontSize: '10px', color: 'var(--text-muted)',
                          background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                        }}>
                          +{citizen.interests.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)', fontSize: '13px' }}>
                      <Star size={12} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      {citizen.volunteer_points || 0}
                    </div>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {format(new Date(citizen.created_at), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Citizen Details</DialogTitle>
          </DialogHeader>
          <div style={{ marginTop: '20px' }}>
            {selectedCitizen && <CitizenDetail citizen={selectedCitizen} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

