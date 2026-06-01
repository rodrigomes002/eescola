import { db } from "@/lib/db"

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalStudents, totalClasses, totalSubjects, attendancesToday] =
    await Promise.all([
      db.student.count({ where: { status: "ACTIVE" } }),
      db.classRoom.count({ where: { status: "ACTIVE" } }),
      db.subject.count(),
      db.attendance.count({
        where: {
          date: { gte: today, lt: tomorrow },
        },
      }),
    ])

  return { totalStudents, totalClasses, totalSubjects, attendancesToday }
}

// ─── PROFESSOR ────────────────────────────────────────────────────────────────

export async function getProfessorDashboardData(userId: string) {
  // Busca o teacher vinculado ao userId
  const teacher = await db.teacher.findUnique({ where: { userId } })

  // Por ora, professores veem todas as turmas ativas
  // (vínculo professor-turma será implementado em etapa futura)
  const classes = await db.classRoom.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    take: 10,
  })

  // Últimos 5 lançamentos de presença
  const recentAttendances = await db.attendance.findMany({
    where: teacher ? { createdBy: userId } : {},
    orderBy: { createdAt: "desc" },
    take: 5,
    distinct: ["classRoomId", "subjectId", "date"],
    include: {
      classRoom: { select: { name: true } },
      subject: { select: { name: true } },
    },
  })

  return { classes, recentAttendances }
}
