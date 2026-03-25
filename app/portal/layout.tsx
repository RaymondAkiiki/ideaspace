import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import PortalNav from '@/components/portal/PortalNav'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-surface-2">
      <PortalNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
