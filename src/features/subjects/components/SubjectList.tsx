"use client"

import { useState } from "react"
import type { Subject } from "@prisma/client"
import SubjectForm from "./SubjectForm"
import type { ActionResult } from "@/lib/validations"

type Props = {
  subjects: Subject[]
  updateAction: (
    prevState: ActionResult<void> | null,
    formData: FormData
  ) => Promise<ActionResult<void>>
}

export default function SubjectList({ subjects, updateAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (subjects.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        Nenhuma disciplina cadastrada ainda.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {subjects.map((subject) => (
        <li key={subject.id} className="py-3">
          {editingId === subject.id ? (
            <SubjectForm
              action={updateAction}
              subject={subject}
              onSuccess={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{subject.name}</span>
              <button
                type="button"
                onClick={() => setEditingId(subject.id)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Editar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
