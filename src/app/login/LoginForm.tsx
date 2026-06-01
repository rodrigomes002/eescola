"use client"

import { useActionState } from "react"
import { login } from "@/features/auth/actions"
import type { ActionResult } from "@/lib/validations"

type LoginState = ActionResult<void> | null

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    login,
    null
  )

  const fieldErrors =
    state && !state.success ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Erro geral */}
      {state && !state.success && !fieldErrors && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
        >
          {state.error}
        </div>
      )}

      {/* E-mail */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
          aria-invalid={!!fieldErrors?.email}
          className={[
            "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            fieldErrors?.email
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white",
          ].join(" ")}
          placeholder="seu@email.com"
        />
        {fieldErrors?.email && (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Senha */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={fieldErrors?.password ? "password-error" : undefined}
          aria-invalid={!!fieldErrors?.password}
          className={[
            "w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            fieldErrors?.password
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white",
          ].join(" ")}
          placeholder="••••••••"
        />
        {fieldErrors?.password && (
          <p id="password-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.password[0]}
          </p>
        )}
      </div>

      {/* Erro geral (credenciais inválidas) */}
      {state && !state.success && !fieldErrors && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={isPending}
        className={[
          "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          isPending
            ? "cursor-not-allowed bg-blue-400"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
        ].join(" ")}
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  )
}
