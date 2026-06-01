import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash("123456", 12)

  const user = await db.user.upsert({
    where: { email: "rodrigomes002@gmail.com" },
    update: { passwordHash },
    create: {
      name: "Rodrigo",
      email: "rodrigomes002@gmail.com",
      passwordHash,
      role: "ADMIN",
    },
  })

  console.log(`✅ Usuário criado: ${user.email} (${user.role})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
