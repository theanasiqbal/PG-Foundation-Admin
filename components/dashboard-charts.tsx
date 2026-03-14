'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { format } from 'date-fns'

interface DashboardChartsProps {
  programsByCategory: any[]
  newCitizens: any[]
  issuesByType: any[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Healthcare: '#F43F5E',
  Education:  '#F59E0B',
  Community:  '#8B5CF6',
}

const TYPE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F43F5E']

const customTooltipStyle: React.CSSProperties = {
  background: 'var(--bg-overlay)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  boxShadow: 'none',
  padding: '8px 12px',
}

export function DashboardCharts({ programsByCategory, newCitizens, issuesByType }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Programs by Category */}
      <div className="chart-container">
        <div className="chart-title mb-4">Programs by Category</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={programsByCategory} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: 'var(--bg-elevated)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {programsByCategory?.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={CATEGORY_COLORS[entry.category] || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* New Citizens */}
      <div className="chart-container">
        <div className="chart-title mb-4">New Citizens (Last 30 Days)</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={newCitizens}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => format(new Date(v), 'MMM d')}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={customTooltipStyle}
                labelFormatter={(v) => format(new Date(v), 'MMM d, yyyy')}
                cursor={{ stroke: 'var(--border-default)' }}
              />
              <Line
                type="monotone" dataKey="count"
                stroke="var(--accent)" strokeWidth={2}
                dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issues by Type */}
      <div className="chart-container">
        <div className="chart-title mb-4">Issues by Type</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={issuesByType}
                cx="50%" cy="45%"
                innerRadius={55} outerRadius={80}
                paddingAngle={4}
                dataKey="count" nameKey="issue_type"
              >
                {issuesByType?.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
