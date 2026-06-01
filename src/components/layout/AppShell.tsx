"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/features/auth/actions"

type NavItem = {
  href: string
  label: string
  roles: Array<"ADMIN" | "PROFESSOR" | "RESPONSAVEL">
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "PROFESSOR"] },
  { href: "/students", label: "Alunos", roles: ["ADMIN"] },
  { href: "/classes", label: "Turmas", roles: ["ADMIN"] },
  { href: "/subjects", label: "Disciplinas", roles: ["ADMIN"] },
  { href: "/attendance/launch", label: "Lançar Presença", roles: ["ADMIN", "PROFESSOR"] },
  { href: "/grades/launch", label: "Lançar Notas", roles: ["ADMIN", "PROFESSOR"] },
  { href: "/reports/bulletin", label: "Boletim", roles: ["ADMIN", "PROFESSOR"] },
]

type Props = {
  children: React.ReactNode
  userName: string
  userRole: "ADMIN" | "PROFESSOR" | "RESPONSAVEL"
}

export default function AppShell({ children, userName, userRole }: Props) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header mobile */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow-sm sm:px-6">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          eEscola
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-600 sm:block">
            {userName}
          </span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {userRole}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — oculta em mobile, visível em sm+ */}
        <nav
          aria-label="Navegação principal"
          className="hidden w-52 shrink-0 border-r border-gray-200 bg-white sm:block"
        >
          <ul className="space-y-0.5 p-3">
            {visibleItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav
        aria-label="Navegação mobile"
        className="sticky bottom-0 z-10 border-t border-gray-200 bg-white sm:hidden"
      >
        <ul className="flex overflow-x-auto">
          {visibleItems.slice(0, 5).map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={[
                    "flex min-w-0 flex-col items-center px-2 py-2 text-xs font-medium",
                    active ? "text-blue-600" : "text-gray-500",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
