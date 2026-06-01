"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { createSubjectSchema, updateSubjectSchema } from "./schemas"
import type { ActionResult } from "@/lib/validations"

export async function createSubject(
  _prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  const raw = { name: formData.get("name") }

  const parsed = createSubjectSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  await db.subject.create({ data: parsed.data })

  revalidatePath("/subjects")
  return { success: true, data: undefined }
}

export async function updateSubject(
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
  }

  const parsed = updateSubjectSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  const { id, ...data } = parsed.data

  await db.subject.update({ where: { id }, data })

  revalidatePath("/subjects")
  return { success: true, data: undefined }
}
