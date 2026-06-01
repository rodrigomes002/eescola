import { db } from "@/lib/db"

export async function getSubjects() {
  return db.subject.findMany({
    orderBy: { name: "asc" },
  })
}

export async function getSubjectById(id: string) {
  return db.subject.findUnique({ where: { id } })
}
