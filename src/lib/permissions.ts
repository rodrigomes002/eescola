// Placeholder para controle de permissões — será implementado junto com autenticação
import type { SessionPayload } from "./session"

export function canManageStudents(user: SessionPayload): boolean {
  return user.role === "ADMIN"
}

export function canManageClasses(user: SessionPayload): boolean {
  return user.role === "ADMIN"
}

export function canManageSubjects(user: SessionPayload): boolean {
  return user.role === "ADMIN"
}

export function canLaunchAttendance(user: SessionPayload): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR"
}

export function canLaunchGrades(user: SessionPayload): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR"
}

export function canViewBulletin(user: SessionPayload): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR"
}
