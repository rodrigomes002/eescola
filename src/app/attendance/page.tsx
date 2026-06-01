import { redirect } from "next/navigation"

// Redireciona /attendance → /attendance/launch (única tela de presença no MVP)
export default function AttendancePage() {
  redirect("/attendance/launch")
}
