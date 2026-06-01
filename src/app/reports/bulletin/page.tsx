import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"

export default async function BulletinPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <h1 className="text-2xl font-semibold text-gray-900">Boletim</h1>
      <p className="mt-1 text-sm text-gray-500">Implementado na Task 9.</p>
    </AppShell>
  )
}
