'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format } from 'date-fns'

interface AnalyticsChartsProps {
  citizensByWard: any[]
  registrationsOverTime: any[]
  issuesByStatus: any[]
  issuesByPriority: any[]
}

const STATUS_COLORS: Record<string, string> = {
  pending:     '#F59E0B',
  in_progress: '#3B82F6',
  resolved:    '#10B981',
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    '#10B981',
  medium: '#F59E0B',
  high:   '#FB923C',
  urgent: '#EF4444',
}

const tooltipStyle: React.CSSProperties = {
  background: 'var(--bg-overlay)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  boxShadow: 'none',
  padding: '8px 12px',
}

export function AnalyticsCharts({ citizensByWard, registrationsOverTime, issuesByStatus, issuesByPriority }: AnalyticsChartsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Citizens by Ward */}
      <div className="chart-container">
        <div className="chart-title" style={{ marginBottom: '16px' }}>Citizens by Ward</div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={citizensByWard} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="ward" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-elevated)' }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registrations Over Time */}
      <div className="chart-container">
        <div className="chart-title" style={{ marginBottom: '16px' }}>Registrations (Last 30 Days)</div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(new Date(v), 'MMM d')}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(v) => format(new Date(v), 'MMM d, yyyy')}
                cursor={{ stroke: 'var(--border-default)' }}
              />
              <Line
                type="monotone" dataKey="count"
                stroke="var(--community)" strokeWidth={2}
                dot={{ r: 3, fill: 'var(--community)', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--community)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Issues by Status */}
        <div className="chart-container">
          <div className="chart-title" style={{ marginBottom: '16px' }}>Issues by Status</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issuesByStatus}
                  cx="50%" cy="45%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4}
                  dataKey="count" nameKey="status"
                >
                  {issuesByStatus?.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={STATUS_COLORS[entry.status] || '#8B8BA0'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issues by Priority */}
        <div className="chart-container">
          <div className="chart-title" style={{ marginBottom: '16px' }}>Issues by Priority</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesByPriority} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="priority" type="category" width={60}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-elevated)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {issuesByPriority?.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={PRIORITY_COLORS[entry.priority] || '#8B8BA0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
