import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import StudentForm from "@/features/students/components/StudentForm"
import { updateStudent } from "@/features/students/actions"
import { getStudentById } from "@/features/students/queries"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  const { id } = await params
  const student = await getStudentById(id)
  if (!student) notFound()

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
          Editar aluno
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{student.name}</p>
      </div>

      <div className="max-w-lg rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <StudentForm action={updateStudent} student={student} />
      </div>
    </AppShell>
  )
}
