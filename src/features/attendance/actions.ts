"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { launchAttendanceSchema, type LaunchAttendanceInput } from "./schemas"

type ActionResult =
  | { success: true }
  | { success: false; error: string }

export async function launchAttendance(
  input: LaunchAttendanceInput
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: "Sessão expirada. Faça login novamente." }

  const parsed = launchAttendanceSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Dados inválidos."
    return { success: false, error: message }
  }

  const { classRoomId, subjectId, date, attendances } = parsed.data

  // Normaliza a data para meia-noite UTC para evitar duplicatas por fuso
  const normalizedDate = new Date(date)
  normalizedDate.setUTCHours(0, 0, 0, 0)

  try {
    await db.$transaction(async (tx) => {
      for (const entry of attendances) {
        await tx.attendance.upsert({
          where: {
            studentId_classRoomId_subjectId_date: {
              studentId: entry.studentId,
              classRoomId,
              subjectId,
              date: normalizedDate,
            },
          },
          update: {
            status: entry.status,
            createdBy: session.userId,
          },
          create: {
            studentId: entry.studentId,
            classRoomId,
            subjectId,
            date: normalizedDate,
            status: entry.status,
            createdBy: session.userId,
          },
        })
      }
    })

    revalidatePath("/attendance")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao salvar presença. Tente novamente." }
  }
}
