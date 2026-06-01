import { db } from "@/lib/db"
import type { GradePeriod } from "@prisma/client"

type GradeValueMap = Partial<Record<GradePeriod, number>>

export type BulletinRow = {
  subjectId: string
  subjectName: string
  grades: Record<GradePeriod, number | null>
  average: number | null
  attendanceCount: number
  presentCount: number
  frequency: number | null
  status: "APROVADO" | "RECUPERAÇÃO" | "REPROVADO" | "Sem dados"
}

export type BulletinData = {
  studentId: string
  studentName: string
  classRoomId: string
  classRoomName: string
  schoolYear: number
  rows: BulletinRow[]
}

export async function getBulletinYears() {
  const years = await db.classRoom.findMany({
    distinct: ["schoolYear"],
    orderBy: { schoolYear: "desc" },
    select: { schoolYear: true },
  })

  return years.map((item) => item.schoolYear)
}

export async function getClassRoomsByYear(year: number) {
  return db.classRoom.findMany({
    where: { schoolYear: year },
    orderBy: { name: "asc" },
  })
}

export async function getStudentsByClassRoom(classRoomId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { classRoomId, student: { status: "ACTIVE" } },
    include: { student: true },
    orderBy: { student: { name: "asc" } },
  })

  return enrollments.map((enrollment) => enrollment.student)
}

export async function getBulletinData(
  studentId: string,
  classRoomId: string
): Promise<BulletinData | null> {
  const [student, classRoom, enrollment] = await Promise.all([
    db.student.findUnique({ where: { id: studentId } }),
    db.classRoom.findUnique({ where: { id: classRoomId } }),
    db.enrollment.findUnique({
      where: {
        studentId_classRoomId: {
          studentId,
          classRoomId,
        },
      },
    }),
  ])

  if (!student || !classRoom || !enrollment) return null

  const grades = await db.grade.findMany({
    where: { studentId, classRoomId },
    include: { subject: true },
  })

  const attendances = await db.attendance.findMany({
    where: { studentId, classRoomId },
    include: { subject: true },
  })

  const rowsMap = new Map<
    string,
    {
      subjectName: string
      grades: GradeValueMap
      attendanceCount: number
      presentCount: number
    }
  >()

  function getRow(subjectId: string, subjectName: string) {
    if (!rowsMap.has(subjectId)) {
      rowsMap.set(subjectId, {
        subjectName,
        grades: {},
        attendanceCount: 0,
        presentCount: 0,
      })
    }
    return rowsMap.get(subjectId)!
  }

  for (const grade of grades) {
    const row = getRow(grade.subjectId, grade.subject.name)
    row.grades[grade.period] = Number(grade.value)
  }

  for (const attendance of attendances) {
    const row = getRow(attendance.subjectId, attendance.subject.name)
    row.attendanceCount += 1
    if (attendance.status === "PRESENT") {
      row.presentCount += 1
    }
  }

  const subjectRows: BulletinRow[] = Array.from(rowsMap.entries())
    .sort(([, a], [, b]) => a.subjectName.localeCompare(b.subjectName))
    .map(([subjectId, row]) => {
      const gradeValues: Record<GradePeriod, number | null> = {
        BIMESTER_1: row.grades.BIMESTER_1 ?? null,
        BIMESTER_2: row.grades.BIMESTER_2 ?? null,
        BIMESTER_3: row.grades.BIMESTER_3 ?? null,
        BIMESTER_4: row.grades.BIMESTER_4 ?? null,
      }

      const enteredGrades = Object.values(gradeValues).filter(
        (value): value is number => value !== null
      )

      const average =
        enteredGrades.length > 0
          ? Number(
              (
                enteredGrades.reduce((sum, value) => sum + value, 0) /
                enteredGrades.length
              ).toFixed(2)
            )
          : null

      const frequency =
        row.attendanceCount > 0
          ? Math.round((row.presentCount / row.attendanceCount) * 100)
          : null

      return {
        subjectId,
        subjectName: row.subjectName,
        grades: gradeValues,
        average,
        attendanceCount: row.attendanceCount,
        presentCount: row.presentCount,
        frequency,
        status: determineStatus(average, frequency),
      }
    })

  return {
    studentId: student.id,
    studentName: student.name,
    classRoomId: classRoom.id,
    classRoomName: classRoom.name,
    schoolYear: classRoom.schoolYear,
    rows: subjectRows,
  }
}

function determineStatus(
  average: number | null,
  frequency: number | null
): BulletinRow["status"] {
  if (average === null || frequency === null) return "Sem dados"
  if (frequency < 75 || average < 4) return "REPROVADO"
  if (average < 6) return "RECUPERAÇÃO"
  return "APROVADO"
}
