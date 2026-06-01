import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getClassRoomWithStudents } from "@/features/classes/queries"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  const classRoom = await getClassRoomWithStudents(id)

  if (!classRoom) {
    return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
  }

  // Retorna apenas alunos ativos (critério de aceite do lançamento de presença)
  const students = classRoom.enrollments
    .map((e) => e.student)
    .filter((s) => s.status === "ACTIVE")
  return NextResponse.json(students)
}
