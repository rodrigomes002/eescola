"use server"

import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"
import { createSession, setSessionCookie, deleteSessionCookie } from "@/lib/session"
import { loginSchema } from "./schemas"
import type { ActionResult } from "@/lib/validations"

export async function login(
  _prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { success: false, error: "Dados inválidos", fieldErrors }
  }

  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })

  // Tempo constante para evitar timing attacks
  if (!user) {
    await verifyPassword(password, "$2a$12$invalidhashtopreventtimingattacks")
    return { success: false, error: "E-mail ou senha incorretos" }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { success: false, error: "E-mail ou senha incorretos" }
  }

  const token = await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })

  await setSessionCookie(token)

  redirect("/dashboard")
}

export async function logout(): Promise<void> {
  await deleteSessionCookie()
  redirect("/login")
}
