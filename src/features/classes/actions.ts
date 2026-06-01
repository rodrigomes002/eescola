"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { createClassRoomSchema, updateClassRoomSchema } from "./schemas"
import type { ActionResult } from "@/lib/validations"

export async function createClassRoom(
  _prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  const raw = {
    name: formData.get("name"),
    schoolYear: formData.get("schoolYear"),
    status: formData.get("status") ?? "ACTIVE",
  }

  const parsed = createClassRoomSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  await db.classRoom.create({ data: parsed.data })

  redirect("/classes")
}

export async function updateClassRoom(
  _prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  const raw = {
    id: formData.get("id"),
    name: formData.get("name"),
    schoolYear: formData.get("schoolYear"),
    status: formData.get("status"),
  }

  const parsed = updateClassRoomSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  const { id, ...data } = parsed.data

  await db.classRoom.update({ where: { id }, data })

  redirect("/classes")
}

export async function enrollStudent(
  classRoomId: string,
  studentId: string
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  try {
    await db.enrollment.create({
      data: { classRoomId, studentId },
    })
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return { success: false, error: "Aluno já está matriculado nesta turma" }
    }
    return { success: false, error: "Erro ao vincular aluno. Tente novamente." }
  }

  revalidatePath(`/classes/${classRoomId}`)
  return { success: true, data: undefined }
}

export async function removeStudentFromClass(
  classRoomId: string,
  studentId: string
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  await db.enrollment.deleteMany({
    where: { classRoomId, studentId },
  })

  revalidatePath(`/classes/${classRoomId}`)
  return { success: true, data: undefined }
}
