import { z } from "zod"

export const launchGradesSchema = z.object({
  classRoomId: z.string().uuid(),
  subjectId: z.string().uuid(),
  period: z.enum(["BIMESTER_1", "BIMESTER_2", "BIMESTER_3", "BIMESTER_4"]),
  grades: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        value: z.coerce
          .number()
          .min(0, "Nota não pode ser menor que 0")
          .max(10, "Nota não pode ser maior que 10"),
      })
    )
    .min(1, "Pelo menos um aluno deve ser informado"),
})

export type LaunchGradesInput = z.infer<typeof launchGradesSchema>
