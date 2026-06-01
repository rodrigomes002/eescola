"use client"

import { useState, useTransition } from "react"
import type { ClassRoom, Subject, Student } from "@prisma/client"
import { launchAttendance } from "@/features/attendance/actions"

type AttendanceStatus = "PRESENT" | "ABSENT" | "JUSTIFIED"

type Props = {
  classRooms: ClassRoom[]
  subjects: Subject[]
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Presente",
  ABSENT: "Falta",
  JUSTIFIED: "Justificado",
}

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-100 text-green-800 border-green-300",
  ABSENT: "bg-red-100 text-red-800 border-red-300",
  JUSTIFIED: "bg-yellow-100 text-yellow-800 border-yellow-300",
}

export default function AttendanceLaunchForm({ classRooms, subjects }: Props) {
  const [classRoomId, setClassRoomId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState<Student[]>([])
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Carrega alunos via Route Handler quando turma é selecionada
  async function loadStudents(selectedClassRoomId: string) {
    if (!selectedClassRoomId) {
      setStudents([])
      setStatuses({})
      return
    }
    setLoadingStudents(true)
    setStudentsError(null)
    setSuccessMessage(null)
    try {
      const res = await fetch(`/api/classes/${selectedClassRoomId}/students`)
      if (!res.ok) throw new Error("Erro ao carregar alunos")
      const data: Student[] = await res.json()
      setStudents(data)
      // Status padrão: PRESENT para todos
      const initial: Record<string, AttendanceStatus> = {}
      data.forEach((s) => { initial[s.id] = "PRESENT" })
      setStatuses(initial)
    } catch {
      setStudentsError("Não foi possível carregar os alunos da turma.")
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  function handleClassRoomChange(id: string) {
    setClassRoomId(id)
    setSuccessMessage(null)
    setSubmitError(null)
    loadStudents(id)
  }

  function handleStatusChange(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }))
  }

  function handleMarkAll(status: AttendanceStatus) {
    const updated: Record<string, AttendanceStatus> = {}
    students.forEach((s) => { updated[s.id] = status })
    setStatuses(updated)
  }

  function handleSubmit() {
    setSubmitError(null)
    setSuccessMessage(null)

    if (!classRoomId || !subjectId || !date) {
      setSubmitError("Preencha turma, disciplina e data antes de salvar.")
      return
    }
    if (students.length === 0) {
      setSubmitError("Nenhum aluno encontrado para esta turma.")
      return
    }

    startTransition(async () => {
      const result = await launchAttendance({
        classRoomId,
        subjectId,
        date: new Date(date + "T00:00:00"),
        attendances: students.map((s) => ({
          studentId: s.id,
          status: statuses[s.id] ?? "PRESENT",
        })),
      })

      if (result.success) {
        setSuccessMessage("Presença salva com sucesso!")
      } else {
        setSubmitError(result.error)
      }
    })
  }

  const canSubmit =
    !!classRoomId && !!subjectId && !!date && students.length > 0 && !isPending

  return (
    <div className="space-y-6">
      {/* Seleção de turma, disciplina e data */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Turma */}
        <div>
          <label
            htmlFor="classRoom"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Turma <span className="text-red-500">*</span>
          </label>
          <select
            id="classRoom"
            value={classRoomId}
            onChange={(e) => handleClassRoomChange(e.target.value)}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">Selecione a turma…</option>
            {classRooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.schoolYear}
              </option>
            ))}
          </select>
        </div>

        {/* Disciplina */}
        <div>
          <label
            htmlFor="subject"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Disciplina <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              setSuccessMessage(null)
              setSubmitError(null)
            }}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">Selecione a disciplina…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Data */}
        <div>
          <label
            htmlFor="date"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Data <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setSuccessMessage(null)
              setSubmitError(null)
            }}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Lista de alunos */}
      {loadingStudents && (
        <p className="text-sm text-gray-500">Carregando alunos…</p>
      )}

      {studentsError && (
        <p role="alert" className="text-sm text-red-600">
          {studentsError}
        </p>
      )}

      {!loadingStudents && classRoomId && students.length === 0 && !studentsError && (
        <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Nenhum aluno ativo matriculado nesta turma.
        </p>
      )}

      {students.length > 0 && (
        <div className="space-y-3">
          {/* Ações em massa */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Marcar todos como:
            </span>
            {(["PRESENT", "ABSENT", "JUSTIFIED"] as AttendanceStatus[]).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleMarkAll(s)}
                  disabled={isPending}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    STATUS_STYLES[s],
                    "hover:opacity-80 disabled:opacity-50",
                  ].join(" ")}
                >
                  {STATUS_LABELS[s]}
                </button>
              )
            )}
          </div>

          {/* Tabela de alunos */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Aluno
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => {
                  const current = statuses[student.id] ?? "PRESENT"
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {student.registrationNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {(
                            [
                              "PRESENT",
                              "ABSENT",
                              "JUSTIFIED",
                            ] as AttendanceStatus[]
                          ).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                handleStatusChange(student.id, s)
                              }
                              disabled={isPending}
                              aria-pressed={current === s}
                              className={[
                                "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                                current === s
                                  ? STATUS_STYLES[s] + " ring-2 ring-offset-1"
                                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                                "disabled:opacity-50",
                              ].join(" ")}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback */}
      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </p>
      )}

      {/* Botão salvar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={[
            "rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            canSubmit
              ? "bg-blue-600 hover:bg-blue-700"
              : "cursor-not-allowed bg-blue-300",
          ].join(" ")}
        >
          {isPending ? "Salvando…" : "Salvar Presença"}
        </button>
      </div>
    </div>
  )
}
