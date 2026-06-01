"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { canLaunchGrades } from "@/lib/permissions"
import { launchGradesSchema, type LaunchGradesInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function launchGrades(
  input: LaunchGradesInput
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Sessão expirada. Faça login novamente." }
  if (!canLaunchGrades(session)) {
    return { success: false, error: "Sem permissão para esta ação." }
  }

  const parsed = launchGradesSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Dados inválidos."
    return { success: false, error: message }
  }

  const { classRoomId, subjectId, period, grades } = parsed.data

  try {
    await db.$transaction(async (tx) => {
      for (const entry of grades) {
        await tx.grade.upsert({
          where: {
            studentId_classRoomId_subjectId_period: {
              studentId: entry.studentId,
              classRoomId,
              subjectId,
              period,
            },
          },
          update: {
            value: entry.value,
            createdBy: session.userId,
          },
          create: {
            studentId: entry.studentId,
            classRoomId,
            subjectId,
            period,
            value: entry.value,
            createdBy: session.userId,
          },
        })
      }
    })

    revalidatePath("/grades")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao salvar notas. Tente novamente." }
  }
}
