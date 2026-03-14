import { createClient } from '@/lib/supabase/server'
import { AnalyticsCharts } from './analytics-charts'
import { Badge } from '@/components/ui/badge'
import { Bot, Trophy } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: citizensByWard }         = await supabase.rpc('get_citizens_by_ward')
  const { data: registrationsOverTime }  = await supabase.rpc('get_registrations_last_30_days')
  const { data: issuesByStatus }         = await supabase.rpc('get_issues_by_status')
  const { data: issuesByPriority }       = await supabase.rpc('get_issues_by_priority')

  const { data: topPrograms } = await supabase
    .from('programs')
    .select('title, category, registrations_count')
    .order('registrations_count', { ascending: false })
    .limit(5)

  const { count: chatSessions } = await supabase
    .from('chat_messages')
    .select('session_id', { count: 'exact', head: true })

  const categoryColor: Record<string, string> = {
    Healthcare: 'var(--healthcare)',
    Education:  'var(--education)',
    Community:  'var(--community)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Analytics</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Charts */}
        <AnalyticsCharts
          citizensByWard={citizensByWard || []}
          registrationsOverTime={registrationsOverTime || []}
          issuesByStatus={issuesByStatus || []}
          issuesByPriority={issuesByPriority || []}
        />

        {/* Right: Sidebar panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Programs */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="chart-title">Top 5 Programs</div>
            </div>
            <div style={{ padding: '12px 20px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topPrograms?.map((program, index) => {
                  const maxReg = topPrograms[0]?.registrations_count || 1
                  const pct = (program.registrations_count / maxReg) * 100
                  const color = categoryColor[program.category] || 'var(--accent)'

                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', color: 'var(--text-muted)',
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px',
                          }}>
                            {program.title}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                            {program.registrations_count}
                          </span>
                        </div>
                        <div style={{ height: '3px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 300ms ease' }} />
                        </div>
                      </div>
                      <Badge variant={program.category?.toLowerCase() as any || 'default'}>
                        {program.category}
                      </Badge>
                    </div>
                  )
                })}
                {(!topPrograms || topPrograms.length === 0) && (
                  <div className="empty-state" style={{ padding: '16px' }}>
                    <Trophy size={28} className="empty-state-icon" />
                    <span className="empty-state-desc">No programs yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Chat Sessions */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'var(--accent-glow)',
                border: '1px solid rgba(59,130,246,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>AI Chat Sessions</div>
                <div style={{ fontSize: '36px', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {chatSessions || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
