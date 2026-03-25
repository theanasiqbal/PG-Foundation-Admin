'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, AlertTriangle, Users, Megaphone,
  BarChart3, LogOut, Menu, ChevronLeft, X,
  Stethoscope, Tent, BriefcaseMedical, GraduationCap,
  Award, Briefcase, HeartHandshake, CalendarDays,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'

type NavItem = { name: string; href: string; icon: React.ElementType }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
    ],
  },
  {
    label: 'Healthcare',
    items: [
      { name: 'Doctors', href: '/doctors', icon: Stethoscope },
      { name: 'Health Camps', href: '/health-camps', icon: Tent },
    ],
  },
  {
    label: 'Career & Skills',
    items: [
      { name: 'Consultants', href: '/career-consultants', icon: BriefcaseMedical },
      { name: 'Skill Courses', href: '/skill-courses', icon: GraduationCap },
    ],
  },
  {
    label: 'Education',
    items: [
      { name: 'Scholarships', href: '/scholarships', icon: Award },
    ],
  },
  {
    label: 'Community',
    items: [
      { name: 'Jobs', href: '/jobs', icon: Briefcase },
      { name: 'Volunteering', href: '/volunteer-programs', icon: HeartHandshake },
      { name: 'Events', href: '/community-events', icon: CalendarDays },
      { name: 'Announcements', href: '/announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Monitor',
    items: [
      { name: 'Citizens', href: '/citizens', icon: Users },
      { name: 'Issues', href: '/issues', icon: AlertTriangle },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
]

const allItems = navGroups.flatMap((g) => g.items)

function NavLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname.startsWith(item.href)
  const Icon = item.icon
  return (
    <div style={{ position: 'relative' }} className="sidebar-nav-item">
      <Link
        href={item.href}
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          height: '34px', padding: '0 10px', borderRadius: '8px',
          margin: '1px 0', textDecoration: 'none',
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          background: isActive ? 'var(--accent-glow)' : 'transparent',
          border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
          transition: 'all 150ms ease', overflow: 'hidden',
          whiteSpace: 'nowrap',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
        className="sidebar-link"
        onMouseEnter={(e) => {
          if (!isActive) {
            ; (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'
              ; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            ; (e.currentTarget as HTMLElement).style.background = 'transparent'
              ; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
          }
        }}
      >
        <Icon size={15} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
        {!collapsed && (
          <span style={{ fontSize: '13px', fontWeight: isActive ? 500 : 400 }}>{item.name}</span>
        )}
      </Link>
      {collapsed && <div className="sidebar-tooltip">{item.name}</div>}
    </div>
  )
}

export function Sidebar() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--sidebar-width', collapsed ? '60px' : '220px')
  }, [collapsed])

  const width = collapsed ? '60px' : '220px'

  return (
    <>
      {/* ─── Mobile top-bar ─── */}
      <div
        style={{
          display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: '52px', background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 16px', alignItems: 'center', justifyContent: 'space-between',
        }}
        className="mobile-topbar md:hidden flex"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '22px', height: '22px', background: 'var(--accent)', borderRadius: '5px', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>PG Foundation</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ─── Mobile overlay ─── */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="md:flex hidden"
        style={{
          position: 'fixed', inset: '0 auto 0 0', width,
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)', zIndex: 40, overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ height: '52px', flexShrink: 0, borderBottom: '1px solid var(--border-subtle)', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: collapsed ? 'center' : 'flex-start', overflow: 'hidden' }}>
          <Image src="/pg-logo.png" alt="PG Foundation" width={22} height={22} />
          {!collapsed && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>PG Foundation</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Admin</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              {!collapsed && (
                <div style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                  padding: '8px 10px 4px',
                }}>
                  {group.label}
                </div>
              )}
              {collapsed && <div style={{ height: '8px' }} />}
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '4px', overflow: 'hidden' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>A</div>
              <div style={{ overflow: 'hidden', minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin User</div>
              </div>
              <div className="ml-auto flex items-center"><ThemeToggle /></div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', height: '36px', padding: '0 12px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 150ms ease', justifyContent: collapsed ? 'center' : 'flex-start', whiteSpace: 'nowrap', overflow: 'hidden' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--danger-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--danger)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: '13px' }}>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '28px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginTop: '4px', borderRadius: '6px', transition: 'all 150ms ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={14} style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 250ms ease' }} />
          </button>
        </div>
      </aside>

      {/* ─── Mobile sidebar ─── */}
      <aside
        className="md:hidden"
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: '220px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1)', zIndex: 50 }}
      >
        <div style={{ height: '52px', flexShrink: 0, borderBottom: '1px solid var(--border-subtle)', padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '22px', height: '22px', background: 'var(--accent)', borderRadius: '5px' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>PG Foundation</span>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 10px 4px' }}>{group.label}</div>
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={false} onClick={() => setMobileOpen(false)} />
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', height: '36px', padding: '0 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '8px' }}>
            <LogOut size={14} />
            <span style={{ fontSize: '13px' }}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
