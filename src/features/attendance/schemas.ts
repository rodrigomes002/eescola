import { z } from "zod"

export const launchAttendanceSchema = z.object({
  classRoomId: z.string().uuid(),
  subjectId: z.string().uuid(),
  date: z.coerce.date(),
  attendances: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: z.enum(["PRESENT", "ABSENT", "JUSTIFIED"]),
      })
    )
    .min(1, "Pelo menos um aluno deve ser informado"),
})

export type LaunchAttendanceInput = z.infer<typeof launchAttendanceSchema>
