import { db } from "@/lib/db"

export async function getClassRooms() {
  return db.classRoom.findMany({
    orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
  })
}

export async function getClassRoomById(id: string) {
  return db.classRoom.findUnique({ where: { id } })
}

export async function getActiveClassRooms() {
  return db.classRoom.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
  })
}

export async function getClassRoomWithStudents(id: string) {
  return db.classRoom.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          student: true,
        },
        orderBy: {
          student: { name: "asc" },
        },
      },
    },
  })
}

// Alunos ativos que ainda NÃO estão matriculados nesta turma
export async function getAvailableStudents(classRoomId: string) {
  const enrolled = await db.enrollment.findMany({
    where: { classRoomId },
    select: { studentId: true },
  })
  const enrolledIds = enrolled.map((e) => e.studentId)

  return db.student.findMany({
    where: {
      status: "ACTIVE",
      id: { notIn: enrolledIds },
    },
    orderBy: { name: "asc" },
  })
}
