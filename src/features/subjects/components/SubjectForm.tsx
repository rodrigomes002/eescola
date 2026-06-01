"use client"

import { useActionState, useEffect, useRef } from "react"
import type { ActionResult } from "@/lib/validations"
import type { Subject } from "@prisma/client"

type Props = {
  action: (
    prevState: ActionResult<void> | null,
    formData: FormData
  ) => Promise<ActionResult<void>>
  subject?: Subject
  onSuccess?: () => void
}

type State = ActionResult<void> | null

export default function SubjectForm({ action, subject, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    action,
    null
  )

  const formRef = useRef<HTMLFormElement>(null)

  // Limpa o formulário e notifica o pai após sucesso
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      onSuccess?.()
    }
  }, [state, onSuccess])

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined

  return (
    <form ref={formRef} action={formAction} className="flex gap-2" noValidate>
      {subject && <input type="hidden" name="id" value={subject.id} />}

      <div className="flex-1">
        <input
          name="name"
          type="text"
          defaultValue={subject?.name ?? ""}
          required
          placeholder="Nome da disciplina"
          aria-label="Nome da disciplina"
          aria-describedby={fieldErrors?.name ? "subject-name-error" : undefined}
          aria-invalid={!!fieldErrors?.name}
          className={[
            "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            fieldErrors?.name
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white",
          ].join(" ")}
        />
        {fieldErrors?.name && (
          <p id="subject-name-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.name[0]}
          </p>
        )}
        {state && !state.success && !fieldErrors && (
          <p className="mt-1 text-xs text-red-600">{state.error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={[
          "shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          isPending
            ? "cursor-not-allowed bg-blue-400"
            : "bg-blue-600 hover:bg-blue-700",
        ].join(" ")}
      >
        {isPending ? "…" : subject ? "Salvar" : "Adicionar"}
      </button>
    </form>
  )
}
