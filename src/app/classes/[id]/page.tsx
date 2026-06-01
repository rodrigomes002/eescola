import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import ClassRoomForm from "@/features/classes/components/ClassRoomForm"
import EnrollmentManager from "@/features/classes/components/EnrollmentManager"
import { updateClassRoom } from "@/features/classes/actions"
import {
  getClassRoomWithStudents,
  getAvailableStudents,
} from "@/features/classes/queries"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ClassDetailPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  const { id } = await params

  const [classRoom, availableStudents] = await Promise.all([
    getClassRoomWithStudents(id),
    getAvailableStudents(id),
  ])

  if (!classRoom) notFound()

  const enrolledStudents = classRoom.enrollments.map((e) => e.student)

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="mb-6">
        <Link
          href="/classes"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Voltar para turmas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          {classRoom.name}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Ano letivo: {classRoom.schoolYear}
        </p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Edição da turma */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            Dados da turma
          </h2>
          <ClassRoomForm action={updateClassRoom} classRoom={classRoom} />
        </div>

        {/* Vínculo aluno-turma */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-base font-semibold text-gray-700">
            Alunos da turma
          </h2>
          <EnrollmentManager
            classRoomId={classRoom.id}
            enrolledStudents={enrolledStudents}
            availableStudents={availableStudents}
          />
        </div>
      </div>
    </AppShell>
  )
}
