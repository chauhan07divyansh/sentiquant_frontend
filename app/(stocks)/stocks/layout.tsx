import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

// ─────────────────────────────────────────────
//  STOCKS LAYOUT — public, no auth required
//  Guests can browse /stocks and /stocks/:symbol
//  Sidebar and Navbar still shown for consistency
//  Session passed optionally for logged-in users
// ─────────────────────────────────────────────
export default async function StocksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No redirect — guests allowed
  // Session fetched only to pass to Navbar for user avatar etc.
  await getServerSession(authOptions)

  return (
    <div className="flex flex-col min-h-dvh">
      <Navbar isDashboard />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
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
    </div>
  )
}
