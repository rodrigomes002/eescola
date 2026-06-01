import { z } from "zod"

export const createStudentSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birthDate: z.coerce.date().optional(),
  registrationNumber: z.string().min(1, "Matrícula é obrigatória"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().uuid(),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
