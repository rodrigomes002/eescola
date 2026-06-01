import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import { getStudents } from "@/features/students/queries"
import { deactivateStudent } from "@/features/students/actions"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function StudentsPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  const { q } = await searchParams
  const students = await getStudents(q?.trim())

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alunos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {students.length} aluno{students.length !== 1 ? "s" : ""} encontrado
            {students.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/students/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Novo aluno
        </Link>
      </div>

      {/* Busca */}
      <form method="GET" className="mt-5">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/students"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Limpar
            </Link>
          )}
        </div>
      </form>

      {/* Listagem */}
      <div className="mt-5">
        {students.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-400">
              {q ? `Nenhum aluno encontrado para "${q}"` : "Nenhum aluno cadastrado ainda."}
            </p>
            {!q && (
              <Link
                href="/students/new"
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Cadastrar primeiro aluno
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Matrícula: {student.registrationNumber}
                    {student.birthDate && (
                      <>
                        {" · "}
                        {new Date(student.birthDate).toLocaleDateString("pt-BR")}
                      </>
                    )}
                  </p>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      student.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500",
                    ].join(" ")}
                  >
                    {student.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </span>

                  <Link
                    href={`/students/${student.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Editar
                  </Link>

                  {student.status === "ACTIVE" && (
                    <form
                      action={async () => {
                        "use server"
                        await deactivateStudent(student.id)
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Desativar
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
