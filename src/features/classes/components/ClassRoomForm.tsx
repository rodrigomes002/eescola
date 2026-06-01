"use client"

import { useActionState } from "react"
import type { ActionResult } from "@/lib/validations"
import type { ClassRoom } from "@prisma/client"

type Props = {
  action: (
    prevState: ActionResult<void> | null,
    formData: FormData
  ) => Promise<ActionResult<void>>
  classRoom?: ClassRoom
}

type State = ActionResult<void> | null

export default function ClassRoomForm({ action, classRoom }: Props) {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    action,
    null
  )

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined

  const currentYear = new Date().getFullYear()

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {classRoom && <input type="hidden" name="id" value={classRoom.id} />}

      {/* Erro geral */}
      {state && !state.success && !fieldErrors && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
        >
          {state.error}
        </div>
      )}

      {/* Nome da turma */}
      <Field
        id="name"
        label="Nome da turma"
        required
        error={fieldErrors?.name?.[0]}
      >
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={classRoom?.name ?? ""}
          required
          placeholder="Ex: 1º Ano A"
          className={inputClass(!!fieldErrors?.name)}
        />
      </Field>

      {/* Ano letivo */}
      <Field
        id="schoolYear"
        label="Ano letivo"
        required
        error={fieldErrors?.schoolYear?.[0]}
      >
        <input
          id="schoolYear"
          name="schoolYear"
          type="number"
          defaultValue={classRoom?.schoolYear ?? currentYear}
          required
          min={2000}
          max={currentYear + 5}
          placeholder={String(currentYear)}
          className={inputClass(!!fieldErrors?.schoolYear)}
        />
      </Field>

      {/* Status */}
      <Field id="status" label="Status" error={fieldErrors?.status?.[0]}>
        <select
          id="status"
          name="status"
          defaultValue={classRoom?.status ?? "ACTIVE"}
          className={inputClass(!!fieldErrors?.status)}
        >
          <option value="ACTIVE">Ativa</option>
          <option value="INACTIVE">Inativa</option>
        </select>
      </Field>

      {/* Botões */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={[
            "rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            isPending
              ? "cursor-not-allowed bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700",
          ].join(" ")}
        >
          {isPending
            ? "Salvando…"
            : classRoom
            ? "Salvar alterações"
            : "Cadastrar turma"}
        </button>
        <a
          href="/classes"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900",
    "focus:outline-none focus:ring-2 focus:ring-blue-500",
    hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
  ].join(" ")
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
