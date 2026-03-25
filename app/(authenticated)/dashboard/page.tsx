import { createClient } from '@/lib/supabase/server'
import { Users, AlertTriangle, CheckCircle2, Briefcase, Stethoscope, CalendarDays } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { DashboardCharts } from '@/components/dashboard-charts'

function StatNumber({ value }: { value: number }) {
  return (
    <div
      className="stat-number"
      style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
    >
      {value}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalCitizens },
    { count: activeDoctors },
    { count: pendingIssues },
    { count: activeJobs },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('available', true),
    supabase.from('issues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Chart data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: users } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const newCitizens = Object.entries(
    (users || []).reduce((acc: any, u) => {
      const date = new Date(u.created_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
  ).map(([date, count]) => ({ date, count })).sort((a: any, b: any) => a.date.localeCompare(b.date))

  const { data: issues } = await supabase.from('issues').select('issue_type')
  const issuesByType = Object.entries(
    (issues || []).reduce((acc: any, i) => {
      const type = i.issue_type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  ).map(([issue_type, count]) => ({ issue_type, count }))

  // Applications overview: job apps + scholarship apps + course enrollments
  const [{ count: jobApps }, { count: scholApps }, { count: courseEnrolls }] = await Promise.all([
    supabase.from('job_applications').select('*', { count: 'exact', head: true }),
    supabase.from('scholarship_applications').select('*', { count: 'exact', head: true }),
    supabase.from('skill_course_enrollments').select('*', { count: 'exact', head: true }),
  ])

  const programsByCategory = [
    { category: 'Job Applications', count: jobApps || 0 },
    { category: 'Scholarships Applied', count: scholApps || 0 },
    { category: 'Course Enrollments', count: courseEnrolls || 0 },
  ]

  const { data: recentIssues } = await supabase
    .from('issues')
    .select('id, issue_type, ward, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentCitizens } = await supabase
    .from('users')
    .select('id, name, citizen_id, ward, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const statCards = [
    { label: 'Total Citizens',    value: totalCitizens || 0,  icon: Users,        accentColor: 'var(--accent)' },
    { label: 'Active Doctors',    value: activeDoctors || 0,  icon: Stethoscope,  accentColor: 'var(--community)' },
    { label: 'Pending Issues',    value: pendingIssues || 0,  icon: AlertTriangle, accentColor: 'var(--warning)' },
    { label: 'Active Job Listings', value: activeJobs || 0,  icon: Briefcase,    accentColor: 'var(--success)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="stat-card" style={{ borderLeft: `3px solid ${card.accentColor}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div className="stat-label">{card.label}</div>
                <Icon size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <StatNumber value={card.value} />
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <DashboardCharts
        programsByCategory={programsByCategory}
        newCitizens={newCitizens || []}
        issuesByType={issuesByType || []}
      />

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Recent Issues */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="chart-title">Recent Issues</div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentIssues?.map((issue) => (
              <div key={issue.id} className="hover-bg-elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{issue.issue_type}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Ward {issue.ward}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <Badge variant={issue.status === 'pending' ? 'pending' : issue.status === 'in_progress' ? 'in_progress' : 'resolved'}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
            {(!recentIssues || recentIssues.length === 0) && (
              <div className="empty-state">
                <AlertTriangle size={32} className="empty-state-icon" />
                <span className="empty-state-title">No recent issues</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Citizens */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="chart-title">New Citizens</div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentCitizens?.map((citizen) => (
              <div key={citizen.id} className="hover-bg-elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{citizen.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span className="citizen-id-pill">{citizen.citizen_id}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ward {citizen.ward}</span>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {formatDistanceToNow(new Date(citizen.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
            {(!recentCitizens || recentCitizens.length === 0) && (
              <div className="empty-state">
                <Users size={32} className="empty-state-icon" />
                <span className="empty-state-title">No recent citizens</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
