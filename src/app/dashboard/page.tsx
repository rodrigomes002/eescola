import { redirect } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import {
  getAdminDashboardStats,
  getProfessorDashboardData,
} from "@/features/dashboard/queries"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <AppShell userName={session.name} userRole={session.role}>
      {session.role === "ADMIN" ? (
        <AdminDashboard />
      ) : (
        <ProfessorDashboard userId={session.userId} />
      )}
    </AppShell>
  )
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

async function AdminDashboard() {
  const stats = await getAdminDashboardStats()

  const cards = [
    { label: "Alunos ativos", value: stats.totalStudents, href: "/students" },
    { label: "Turmas ativas", value: stats.totalClasses, href: "/classes" },
    { label: "Disciplinas", value: stats.totalSubjects, href: "/subjects" },
    { label: "Presenças hoje", value: stats.attendancesToday, href: "/attendance" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Visão geral da escola</p>

      {/* Cards de resumo */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:ring-blue-300"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          Ações rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/students/new" label="Novo aluno" />
          <QuickLink href="/classes/new" label="Nova turma" />
          <QuickLink href="/subjects" label="Disciplinas" />
          <QuickLink href="/reports/bulletin" label="Ver boletim" />
        </div>
      </div>
    </div>
  )
}

// ─── PROFESSOR ────────────────────────────────────────────────────────────────

async function ProfessorDashboard({ userId }: { userId: string }) {
  const { classes, recentAttendances } = await getProfessorDashboardData(userId)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Suas turmas e lançamentos</p>

      {/* Ações rápidas */}
      <div className="mt-6 flex flex-wrap gap-3">
        <QuickLink href="/attendance/launch" label="Lançar Presença" primary />
        <QuickLink href="/grades/launch" label="Lançar Notas" primary />
        <QuickLink href="/reports/bulletin" label="Ver Boletim" />
      </div>

      {/* Minhas turmas */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          Turmas ativas
        </h2>
        {classes.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma turma ativa.</p>
        ) : (
          <ul className="space-y-2">
            {classes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/classes/${c.id}`}
                  className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200 hover:ring-blue-300"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {c.name}
                  </span>
                  <span className="text-xs text-gray-400">{c.schoolYear}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Últimos lançamentos */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-gray-700">
          Últimos lançamentos de presença
        </h2>
        {recentAttendances.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum lançamento ainda.</p>
        ) : (
          <ul className="space-y-2">
            {recentAttendances.map((a) => (
              <li
                key={`${a.classRoomId}-${a.subjectId}-${a.date}`}
                className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200"
              >
                <p className="text-sm font-medium text-gray-800">
                  {a.classRoom.name} — {a.subject.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(a.date).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

function QuickLink({
  href,
  label,
  primary = false,
}: {
  href: string
  label: string
  primary?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        primary
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      {label}
    </Link>
  )
}
