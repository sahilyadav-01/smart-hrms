import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const main = async () => {
  const company = await prisma.company.upsert({ where: { slug: 'acme-studio' }, update: {}, create: { name: 'Acme Studio', slug: 'acme-studio' } })
  const passwordHash = await bcrypt.hash('Admin@123', 12)
  await prisma.user.upsert({ where: { email: 'admin@acme.test' }, update: {}, create: { email: 'admin@acme.test', passwordHash, role: Role.HR_ADMIN, companyId: company.id } })
  for (const name of ['Engineering', 'Design', 'People', 'Finance', 'Marketing']) await prisma.department.upsert({ where: { companyId_name: { companyId: company.id, name } }, update: {}, create: { name, companyId: company.id } })
  console.log('Seeded admin@acme.test / Admin@123')
}
main().finally(() => prisma.$disconnect())
