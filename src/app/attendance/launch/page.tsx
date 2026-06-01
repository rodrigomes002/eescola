import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { canLaunchAttendance } from "@/lib/permissions"
import AppShell from "@/components/layout/AppShell"
import { getActiveClassRooms } from "@/features/classes/queries"
import { getAllSubjects } from "@/features/attendance/queries"
import AttendanceLaunchForm from "@/features/attendance/components/AttendanceLaunchForm"

export default async function LaunchAttendancePage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!canLaunchAttendance(session)) redirect("/dashboard")

  const [classRooms, subjects] = await Promise.all([
    getActiveClassRooms(),
    getAllSubjects(),
  ])

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Lançar Presença
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Selecione a turma, disciplina e data para registrar a presença dos
            alunos.
          </p>
        </div>

        {classRooms.length === 0 ? (
          <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Nenhuma turma ativa encontrada. Cadastre uma turma antes de lançar
            presença.
          </p>
        ) : subjects.length === 0 ? (
          <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Nenhuma disciplina cadastrada. Cadastre uma disciplina antes de
            lançar presença.
          </p>
        ) : (
          <AttendanceLaunchForm
            classRooms={classRooms}
            subjects={subjects}
          />
        )}
      </div>
    </AppShell>
  )
}
