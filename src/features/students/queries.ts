import { db } from "@/lib/db"

export async function getStudents(search?: string) {
  return db.student.findMany({
    where: search
      ? {
          name: { contains: search, mode: "insensitive" },
        }
      : undefined,
    orderBy: { name: "asc" },
  })
}

export async function getStudentById(id: string) {
  return db.student.findUnique({ where: { id } })
}
