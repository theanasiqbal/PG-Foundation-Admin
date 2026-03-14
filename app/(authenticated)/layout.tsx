import { Sidebar } from '@/components/sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>
      <Sidebar />
      {/* Main content — dynamic margin based on sidebar state */}
      <div className="main-content-wrapper">
        <main
          style={{
            flex: 1,
            padding: '24px',
            background: 'var(--bg-base)',
            maxWidth: 'none',
          }}
          className="mt-[52px] md:mt-0 animate-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
