import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import { getActiveClassRooms } from "@/features/classes/queries"
import { getAllSubjects } from "@/features/attendance/queries"
import GradesLaunchForm from "@/features/grades/components/GradesLaunchForm"

export default async function LaunchGradesPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const [classRooms, subjects] = await Promise.all([
    getActiveClassRooms(),
    getAllSubjects(),
  ])

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Lançar Notas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Selecione a turma, disciplina e bimestre para registrar as notas dos
            alunos.
          </p>
        </div>

        {classRooms.length === 0 ? (
          <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Nenhuma turma ativa encontrada. Cadastre uma turma antes de lançar
            notas.
          </p>
        ) : subjects.length === 0 ? (
          <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Nenhuma disciplina cadastrada. Cadastre uma disciplina antes de
            lançar notas.
          </p>
        ) : (
          <GradesLaunchForm classRooms={classRooms} subjects={subjects} />
        )}
      </div>
    </AppShell>
  )
}
