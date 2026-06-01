import { z } from "zod"

export const createSubjectSchema = z.object({
  name: z.string().min(2, "Nome da disciplina deve ter pelo menos 2 caracteres"),
})

export const updateSubjectSchema = createSubjectSchema.partial().extend({
  id: z.string().uuid(),
})

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>
