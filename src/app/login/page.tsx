import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import LoginForm from "./LoginForm"

export default async function LoginPage() {
  // Se já tem sessão, redireciona direto
  const session = await getSession()
  if (session) redirect("/dashboard")

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">eEscola</h1>
          <p className="mt-2 text-sm text-gray-500">
            Acesse sua conta para continuar
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
