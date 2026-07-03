import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { Navbar } from '@/components/layout/Navbar'

// ─────────────────────────────────────────────
//  DASHBOARD LAYOUT
//  Used by: /stocks, /portfolio, /dashboard
//  Has: Navbar (isDashboard) — full-width, no sidebar
//  Protected: redirects to /login if no session
//  EXCEPT: /stocks/* routes allow guest access
// ─────────────────────────────────────────────
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  // Allow guests to access /stocks/* for guest mode
  // All other dashboard routes require authentication
  if (!session) {
    const headersList = headers()
    const pathname = headersList.get('x-invoke-path') ?? headersList.get('x-pathname') ?? ''
    const isStocksRoute = pathname.startsWith('/stocks')

    if (!isStocksRoute) {
      redirect('/login')
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar isDashboard />
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden min-w-0"
        id="main-content"
        tabIndex={-1}
      >
        <div className="relative min-h-full">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 15% 0%, rgba(59,130,246,0.06), transparent 40%), radial-gradient(ellipse at 85% 100%, rgba(6,182,212,0.03), transparent 40%)',
            }}
            aria-hidden="true"
          />
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
  )
}
