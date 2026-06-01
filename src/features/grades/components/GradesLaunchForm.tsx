"use client"

import { useState, useTransition } from "react"
import type { ClassRoom, Subject, Student } from "@prisma/client"
import { launchGrades } from "@/features/grades/actions"

type Period = "BIMESTER_1" | "BIMESTER_2" | "BIMESTER_3" | "BIMESTER_4"

type Props = {
  classRooms: ClassRoom[]
  subjects: Subject[]
}

const PERIOD_LABELS: Record<Period, string> = {
  BIMESTER_1: "1º Bimestre",
  BIMESTER_2: "2º Bimestre",
  BIMESTER_3: "3º Bimestre",
  BIMESTER_4: "4º Bimestre",
}

const PERIODS = Object.keys(PERIOD_LABELS) as Period[]

export default function GradesLaunchForm({ classRooms, subjects }: Props) {
  const [classRoomId, setClassRoomId] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [period, setPeriod] = useState<Period | "">("")
  const [students, setStudents] = useState<Student[]>([])
  const [gradeValues, setGradeValues] = useState<Record<string, string>>({})
  const [gradeErrors, setGradeErrors] = useState<Record<string, string>>({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Carrega alunos via Route Handler existente
  async function loadStudents(selectedClassRoomId: string) {
    if (!selectedClassRoomId) {
      setStudents([])
      setGradeValues({})
      setGradeErrors({})
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
      // Inicializa inputs vazios
      const initial: Record<string, string> = {}
      data.forEach((s) => { initial[s.id] = "" })
      setGradeValues(initial)
      setGradeErrors({})
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

  function handleGradeChange(studentId: string, raw: string) {
    setGradeValues((prev) => ({ ...prev, [studentId]: raw }))

    // Validação inline
    if (raw === "") {
      setGradeErrors((prev) => ({ ...prev, [studentId]: "" }))
      return
    }
    const num = parseFloat(raw.replace(",", "."))
    if (isNaN(num)) {
      setGradeErrors((prev) => ({ ...prev, [studentId]: "Valor inválido" }))
    } else if (num < 0) {
      setGradeErrors((prev) => ({ ...prev, [studentId]: "Mínimo: 0" }))
    } else if (num > 10) {
      setGradeErrors((prev) => ({ ...prev, [studentId]: "Máximo: 10" }))
    } else {
      setGradeErrors((prev) => ({ ...prev, [studentId]: "" }))
    }
  }

  function validateAll(): boolean {
    let valid = true
    const newErrors: Record<string, string> = {}

    for (const student of students) {
      const raw = gradeValues[student.id] ?? ""
      if (raw === "") {
        newErrors[student.id] = "Obrigatório"
        valid = false
        continue
      }
      const num = parseFloat(raw.replace(",", "."))
      if (isNaN(num) || num < 0 || num > 10) {
        newErrors[student.id] = "Nota inválida (0–10)"
        valid = false
      }
    }

    setGradeErrors(newErrors)
    return valid
  }

  function handleSubmit() {
    setSubmitError(null)
    setSuccessMessage(null)

    if (!classRoomId || !subjectId || !period) {
      setSubmitError("Preencha turma, disciplina e bimestre antes de salvar.")
      return
    }
    if (students.length === 0) {
      setSubmitError("Nenhum aluno encontrado para esta turma.")
      return
    }
    if (!validateAll()) {
      setSubmitError("Corrija as notas inválidas antes de salvar.")
      return
    }

    startTransition(async () => {
      const result = await launchGrades({
        classRoomId,
        subjectId,
        period,
        grades: students.map((s) => ({
          studentId: s.id,
          value: parseFloat((gradeValues[s.id] ?? "0").replace(",", ".")),
        })),
      })

      if (result.success) {
        setSuccessMessage("Notas salvas com sucesso!")
      } else {
        setSubmitError(result.error)
      }
    })
  }

  const canSubmit =
    !!classRoomId && !!subjectId && !!period && students.length > 0 && !isPending

  return (
    <div className="space-y-6">
      {/* Seleção de turma, disciplina e bimestre */}
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

        {/* Bimestre */}
        <div>
          <label
            htmlFor="period"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Bimestre <span className="text-red-500">*</span>
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as Period | "")
              setSuccessMessage(null)
              setSubmitError(null)
            }}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          >
            <option value="">Selecione o bimestre…</option>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {PERIOD_LABELS[p]}
              </option>
            ))}
          </select>
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
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Aluno
                </th>
                <th className="w-36 px-4 py-3 text-right font-medium text-gray-600">
                  Nota (0–10)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const error = gradeErrors[student.id]
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-400">
                        {student.registrationNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={10}
                          step={0.01}
                          value={gradeValues[student.id] ?? ""}
                          onChange={(e) =>
                            handleGradeChange(student.id, e.target.value)
                          }
                          disabled={isPending}
                          placeholder="0.00"
                          aria-label={`Nota de ${student.name}`}
                          aria-invalid={!!error}
                          className={[
                            "w-24 rounded-lg border px-3 py-2 text-right text-sm",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500",
                            "disabled:bg-gray-50 disabled:text-gray-400",
                            error
                              ? "border-red-400 bg-red-50"
                              : "border-gray-300 bg-white",
                          ].join(" ")}
                        />
                        {error && (
                          <p className="text-xs text-red-600">{error}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Feedback */}
      {submitError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </p>
      )}
      {successMessage && (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
        >
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
          {isPending ? "Salvando…" : "Salvar Notas"}
        </button>
      </div>
    </div>
  )
}
