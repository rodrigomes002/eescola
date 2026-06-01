import { db } from "@/lib/db"

// Alunos ativos matriculados em uma turma
export async function getEnrolledActiveStudents(classRoomId: string) {
  const enrollments = await db.enrollment.findMany({
    where: {
      classRoomId,
      student: { status: "ACTIVE" },
    },
    include: {
      student: true,
    },
    orderBy: {
      student: { name: "asc" },
    },
  })
  return enrollments.map((e) => e.student)
}

// Verifica se já existe lançamento para turma/disciplina/data
export async function getExistingAttendance(
  classRoomId: string,
  subjectId: string,
  date: Date
) {
  return db.attendance.findMany({
    where: { classRoomId, subjectId, date },
    select: { studentId: true, status: true },
  })
}

// Todas as disciplinas (para o select do formulário)
export async function getAllSubjects() {
  return db.subject.findMany({
    orderBy: { name: "asc" },
  })
}
