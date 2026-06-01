import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import AppShell from "@/components/layout/AppShell"
import { getSubjects } from "@/features/subjects/queries"
import { createSubject, updateSubject } from "@/features/subjects/actions"
import SubjectForm from "@/features/subjects/components/SubjectForm"
import SubjectList from "@/features/subjects/components/SubjectList"

export default async function SubjectsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  const subjects = await getSubjects()

  return (
    <AppShell userName={session.name} userRole={session.role}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Disciplinas</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {subjects.length} disciplina{subjects.length !== 1 ? "s" : ""} cadastrada
          {subjects.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-w-lg space-y-6">
        {/* Formulário de nova disciplina */}
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Nova disciplina
          </h2>
          <SubjectForm action={createSubject} />
        </div>

        {/* Listagem com edição inline */}
        <div className="rounded-xl bg-white px-5 shadow-sm ring-1 ring-gray-200">
          <h2 className="py-4 text-sm font-semibold text-gray-700">
            Disciplinas cadastradas
          </h2>
          <SubjectList subjects={subjects} updateAction={updateSubject} />
          {subjects.length > 0 && <div className="pb-2" />}
        </div>
      </div>
    </AppShell>
  )
}
