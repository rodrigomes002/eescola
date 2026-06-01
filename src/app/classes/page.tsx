import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import { getClassRooms } from "@/features/classes/queries"

export default async function ClassesPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  const classes = await getClassRooms()

  // Agrupa por ano letivo para facilitar a leitura
  const byYear = classes.reduce<Record<number, typeof classes>>(
    (acc, c) => {
      if (!acc[c.schoolYear]) acc[c.schoolYear] = []
      acc[c.schoolYear].push(c)
      return acc
    },
    {}
  )
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Turmas</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {classes.length} turma{classes.length !== 1 ? "s" : ""} cadastrada
            {classes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/classes/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Nova turma
        </Link>
      </div>

      <div className="mt-6">
        {classes.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-400">Nenhuma turma cadastrada ainda.</p>
            <Link
              href="/classes/new"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              Cadastrar primeira turma
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {years.map((year) => (
              <section key={year}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  {year}
                </h2>
                <ul className="space-y-2">
                  {byYear[year].map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Ano letivo: {c.schoolYear}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            c.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500",
                          ].join(" ")}
                        >
                          {c.status === "ACTIVE" ? "Ativa" : "Inativa"}
                        </span>
                        <Link
                          href={`/classes/${c.id}`}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Ver turma
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
