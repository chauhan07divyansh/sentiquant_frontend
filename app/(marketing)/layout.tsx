import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
// REMOVED: import { CursorTrail } from '@/components/ui/CursorTrail'

// ─────────────────────────────────────────────
//  MARKETING LAYOUT
//  Used by: Home, Blogs, About, Contact
//  Has: sticky Navbar + Footer
//  Does NOT have: sidebar, auth requirement
// ─────────────────────────────────────────────
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* REMOVED: <CursorTrail /> — cursor trail glow effect removed */}
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
