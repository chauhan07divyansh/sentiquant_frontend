import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar' // FIXED: unified header — Navbar with isDashboard prop replaces separate DashboardHeader for visual continuity across routes

// ─────────────────────────────────────────────
//  DASHBOARD LAYOUT
//  Used by: /stocks, /portfolio
//  Has: Navbar (isDashboard) + collapsible Sidebar
//  Protected: redirects to /login if no session
// ─────────────────────────────────────────────
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check — redirect before rendering
  const session = await getServerSession()
  if (!session) redirect('/login')

  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar isDashboard /> {/* FIXED: same Navbar component as marketing pages — nav links stay visible for orientation, sidebar toggle replaces mobile hamburger, user avatar replaces auth buttons */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden min-w-0" // FIXED: min-w-0 prevents content overflow when sidebar is fixed-positioned on mobile
          id="main-content"
          tabIndex={-1}
        >
          {/* Grid background for dashboard feel */}
          <div className="relative min-h-full">
            {/* Ambient radial glow — depth layer below grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 15% 0%, rgba(59,130,246,0.06), transparent 40%), radial-gradient(ellipse at 85% 100%, rgba(6,182,212,0.03), transparent 40%)',
              }}
              aria-hidden="true"
            />
            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
