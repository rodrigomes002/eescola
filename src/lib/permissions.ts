// Placeholder para controle de permissões — será implementado junto com autenticação
import type { SessionUser } from "./auth"

export function canManageStudents(user: SessionUser): boolean {
  return user.role === "ADMIN"
}

export function canManageClasses(user: SessionUser): boolean {
  return user.role === "ADMIN"
}

export function canManageSubjects(user: SessionUser): boolean {
  return user.role === "ADMIN"
}

export function canLaunchAttendance(user: SessionUser): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR"
}

export function canLaunchGrades(user: SessionUser): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR"
}

export function canViewBulletin(user: SessionUser): boolean {
  return user.role === "ADMIN" || user.role === "PROFESSOR"
}
