import { z } from "zod"

export const createClassRoomSchema = z.object({
  name: z.string().min(1, "Nome da turma é obrigatório"),
  schoolYear: z.coerce.number().int().min(2000, "Ano letivo inválido"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
})

export const updateClassRoomSchema = createClassRoomSchema.partial().extend({
  id: z.string().uuid(),
})

export type CreateClassRoomInput = z.infer<typeof createClassRoomSchema>
export type UpdateClassRoomInput = z.infer<typeof updateClassRoomSchema>
