import bcrypt from "bcryptjs"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "PROFESSOR" | "RESPONSAVEL"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
