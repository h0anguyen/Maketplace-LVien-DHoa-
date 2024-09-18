const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const roles = [
    { name: 'ADMIN' },
    { name: 'USER' },
    { name: 'VENDOR' }
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { value: role.name },
      update: {},
      create: role,
    })
  }

  console.log('Roles seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })