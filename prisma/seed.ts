import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("123456", 12)

  const user = await db.user.upsert({
    where: { email: "admin@gmail.com" },
    update: { passwordHash },
    create: {
      name: "Rodrigo",
      email: "admin@gmail.com",
      passwordHash,
      role: "ADMIN",
    },
  })

  console.log(`✅ Usuário criado: ${user.email} (${user.role})`)

  const teacher = await db.user.upsert({
    where: { email: "professor@gmail.com" },
    update: { passwordHash },
    create: {
      name: "Rodrigo",
      email: "professor@gmail.com",
      passwordHash,
      role: "PROFESSOR",
    },
  })

  console.log(`✅ Usuário criado: ${teacher.email} (${teacher.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
