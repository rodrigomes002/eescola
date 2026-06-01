"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getSession } from "@/lib/session"
import { createStudentSchema, updateStudentSchema } from "./schemas"
import type { ActionResult } from "@/lib/validations"

export async function createStudent(
  _prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  const raw = {
    name: formData.get("name"),
    birthDate: formData.get("birthDate") || undefined,
    registrationNumber: formData.get("registrationNumber"),
    status: formData.get("status") ?? "ACTIVE",
  }

  const parsed = createStudentSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  try {
    await db.student.create({ data: parsed.data })
  } catch (err: unknown) {
    // Prisma unique constraint violation
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "Já existe um aluno com este número de matrícula",
        fieldErrors: { registrationNumber: ["Matrícula já cadastrada"] },
      }
    }
    return { success: false, error: "Erro ao salvar aluno. Tente novamente." }
  }

  redirect("/students")
}

export async function updateStudent(
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
    birthDate: formData.get("birthDate") || undefined,
    registrationNumber: formData.get("registrationNumber"),
    status: formData.get("status"),
  }

  const parsed = updateStudentSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  const { id, ...data } = parsed.data

  try {
    await db.student.update({ where: { id }, data })
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "Já existe um aluno com este número de matrícula",
        fieldErrors: { registrationNumber: ["Matrícula já cadastrada"] },
      }
    }
    return { success: false, error: "Erro ao atualizar aluno. Tente novamente." }
  }

  redirect("/students")
}

export async function deactivateStudent(
  id: string
): Promise<ActionResult<void>> {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Sem permissão para esta ação" }
  }

  await db.student.update({
    where: { id },
    data: { status: "INACTIVE" },
  })

  return { success: true, data: undefined }
}
