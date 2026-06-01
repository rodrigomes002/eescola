"use client"

import { useState, useTransition } from "react"
import type { Student } from "@prisma/client"
import { enrollStudent, removeStudentFromClass } from "@/features/classes/actions"

type Props = {
  classRoomId: string
  enrolledStudents: Student[]
  availableStudents: Student[]
}

export default function EnrollmentManager({
  classRoomId,
  enrolledStudents,
  availableStudents,
}: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEnroll() {
    if (!selectedStudentId) return
    setError(null)

    startTransition(async () => {
      const result = await enrollStudent(classRoomId, selectedStudentId)
      if (!result.success) {
        setError(result.error)
      } else {
        setSelectedStudentId("")
      }
    })
  }

  function handleRemove(studentId: string) {
    setError(null)
    startTransition(async () => {
      const result = await removeStudentFromClass(classRoomId, studentId)
      if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Vincular aluno */}
      <div>
        <label
          htmlFor="student-select"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Adicionar aluno
        </label>
        <div className="flex gap-2">
          <select
            id="student-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={isPending || availableStudents.length === 0}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">
              {availableStudents.length === 0
                ? "Todos os alunos já estão matriculados"
                : "Selecione um aluno…"}
            </option>
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.registrationNumber}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleEnroll}
            disabled={!selectedStudentId || isPending}
            className={[
              "shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              !selectedStudentId || isPending
                ? "cursor-not-allowed bg-blue-300"
                : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
          >
            {isPending ? "…" : "Adicionar"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Lista de alunos matriculados */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          Alunos matriculados{" "}
          <span className="font-normal text-gray-400">
            ({enrolledStudents.length})
          </span>
        </p>

        {enrolledStudents.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            Nenhum aluno matriculado nesta turma.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {enrolledStudents.map((student) => (
              <li
                key={student.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Matrícula: {student.registrationNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(student.id)}
                  disabled={isPending}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
