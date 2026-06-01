import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getStudents } from "@/features/students/queries"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const query = request.nextUrl.searchParams.get("query") ?? ""
  const students = await getStudents(query.trim() || undefined)

  return NextResponse.json(students)
}
