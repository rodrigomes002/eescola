import { db } from "@/lib/db"
import type { GradePeriod } from "@prisma/client"

// Notas já lançadas para turma/disciplina/bimestre — usadas para pré-preencher o formulário
export async function getExistingGrades(
  classRoomId: string,
  subjectId: string,
  period: GradePeriod
) {
  return db.grade.findMany({
    where: { classRoomId, subjectId, period },
    select: { studentId: true, value: true },
  })
}
