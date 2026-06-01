import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { canViewBulletin } from "@/lib/permissions"
import AppShell from "@/components/layout/AppShell"
import {
  getBulletinYears,
  getClassRoomsByYear,
  getStudentsByClassRoom,
  getBulletinData,
} from "@/features/reports/bulletin/queries"
import BulletinTable from "@/features/reports/bulletin/components/BulletinTable"

type Props = {
  searchParams: {
    year?: string
    classRoomId?: string
    studentId?: string
  }
}

export default async function BulletinPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!canViewBulletin(session)) redirect("/dashboard")

  const years = await getBulletinYears()
  const selectedYear = (() => {
    if (typeof searchParams.year === "string" && searchParams.year) {
      const parsedYear = Number(searchParams.year)
      return Number.isFinite(parsedYear) ? parsedYear : years[0]
    }
    return years[0]
  })()
  const selectedClassRoomId =
    typeof searchParams.classRoomId === "string" ? searchParams.classRoomId : ""
  const selectedStudentId =
    typeof searchParams.studentId === "string" ? searchParams.studentId : ""

  const classRooms = selectedYear
    ? await getClassRoomsByYear(selectedYear)
    : []
  const students = selectedClassRoomId
    ? await getStudentsByClassRoom(selectedClassRoomId)
    : []

  const bulletin =
    selectedClassRoomId && selectedStudentId
      ? await getBulletinData(selectedStudentId, selectedClassRoomId)
      : null

  const showNoResultMessage =
    selectedClassRoomId && selectedStudentId && !bulletin

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Boletim</h1>
          <p className="mt-1 text-sm text-gray-500">
            Selecione o ano, turma e aluno para visualizar o boletim.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <form method="get" className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Ano letivo</span>
              <select
                name="year"
                defaultValue={selectedYear ?? ""}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.length === 0 ? (
                  <option value="">Nenhum ano disponível</option>
                ) : (
                  years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Turma</span>
              <select
                name="classRoomId"
                defaultValue={selectedClassRoomId}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma turma…</option>
                {classRooms.map((classRoom) => (
                  <option key={classRoom.id} value={classRoom.id}>
                    {classRoom.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Aluno</span>
              <select
                name="studentId"
                defaultValue={selectedStudentId}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um aluno…</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Carregar boletim
              </button>
            </div>
          </form>
        </div>

        {showNoResultMessage && (
          <div className="rounded-3xl bg-yellow-50 p-6 text-sm text-yellow-800 ring-1 ring-yellow-200">
            Nenhum boletim encontrado para o aluno e turma selecionados.
          </div>
        )}

        {bulletin && bulletin.rows.length === 0 && (
          <div className="rounded-3xl bg-yellow-50 p-6 text-sm text-yellow-800 ring-1 ring-yellow-200">
            Ainda não há registros de notas ou presença para este aluno nesta turma.
          </div>
        )}

        {bulletin && bulletin.rows.length > 0 && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Aluno</p>
                  <p className="mt-1 text-gray-900">{bulletin.studentName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Turma</p>
                  <p className="mt-1 text-gray-900">{bulletin.classRoomName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Ano letivo</p>
                  <p className="mt-1 text-gray-900">{bulletin.schoolYear}</p>
                </div>
              </div>
            </div>

            <BulletinTable bulletin={bulletin} />
          </div>
        )}
      </div>
    </AppShell>
  )
}
