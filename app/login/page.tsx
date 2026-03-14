'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [envMissing, setEnvMissing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvMissing(true)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (envMissing) {
      toast.error('Supabase environment variables are missing.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '16px',
        padding: '40px',
        animation: 'scaleIn 200ms ease forwards',
      }}>
        {/* Logo + brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'var(--accent)',
            borderRadius: '8px',
            margin: '0 auto 12px',
          }} />
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
            PG Foundation
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Admin</div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)',
          margin: '0 0 4px', textAlign: 'center',
        }}>
          Welcome back
        </h1>
        <p style={{
          fontSize: '13px', color: 'var(--text-muted)',
          textAlign: 'center', margin: '0 0 32px',
        }}>
          Sign in to your admin account
        </p>

        {/* Missing env warning */}
        {envMissing && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--danger)',
          }}>
            Missing Supabase environment variables.
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <div>
            <label style={{
              display: 'block', fontSize: '11px',
              color: 'var(--text-secondary)', marginBottom: '6px',
              fontWeight: 400,
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="admin@pgfoundation.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                height: '36px', width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                padding: '0 12px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-default)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block', fontSize: '11px',
              color: 'var(--text-secondary)', marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                height: '36px', width: '100%',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                padding: '0 12px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-default)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || envMissing}
            style={{
              height: '36px', width: '100%',
              background: loading || envMissing ? 'rgba(59,130,246,0.5)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px', fontWeight: 500,
              cursor: loading || envMissing ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 150ms ease',
              marginTop: '8px',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (!loading && !envMissing) {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = loading || envMissing ? 'rgba(59,130,246,0.5)' : 'var(--accent)'
              ;(e.currentTarget as HTMLElement).style.transform = 'none'
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
