import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import StudentForm from "@/features/students/components/StudentForm"
import { createStudent } from "@/features/students/actions"

export default async function NewStudentPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="mb-6">
        <Link
          href="/students"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Voltar para alunos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Novo aluno
        </h1>
      </div>

      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <StudentForm action={createStudent} />
      </div>
    </AppShell>
  )
}
