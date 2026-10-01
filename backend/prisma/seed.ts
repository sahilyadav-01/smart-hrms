import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const main = async () => {
  const company = await prisma.company.upsert({ where: { slug: 'acme-studio' }, update: {}, create: { name: 'Acme Studio', slug: 'acme-studio' } })
  const passwordHash = await bcrypt.hash('Admin@123', 12)
  const user = await prisma.user.upsert({ where: { email: 'admin@acme.test' }, update: {}, create: { email: 'admin@acme.test', passwordHash, role: Role.HR_ADMIN, companyId: company.id } })
  for (const name of ['Engineering', 'Design', 'People', 'Finance', 'Marketing']) await prisma.department.upsert({ where: { companyId_name: { companyId: company.id, name } }, update: {}, create: { name, companyId: company.id } })
  const people = await prisma.department.findUniqueOrThrow({ where: { companyId_name: { companyId: company.id, name: 'People' } } })
  const designation = await prisma.designation.upsert({ where: { companyId_title: { companyId: company.id, title: 'HR Administrator' } }, update: {}, create: { title: 'HR Administrator', companyId: company.id } })
  const location = await prisma.location.upsert({ where: { companyId_name: { companyId: company.id, name: 'Head Office' } }, update: {}, create: { name: 'Head Office', city: 'Bengaluru', country: 'India', companyId: company.id } })
  const employee = await prisma.employee.upsert({
    where: { companyId_employeeCode: { companyId: company.id, employeeCode: 'ACM-001' } },
    update: { userId: user.id },
    create: { employeeCode: 'ACM-001', firstName: 'Sahil', lastName: 'Kumar', email: 'admin@acme.test', joiningDate: new Date('2025-01-06'), companyId: company.id, departmentId: people.id, designationId: designation.id, locationId: location.id, userId: user.id },
  })
  for (const [name, daysPerYear] of [['Casual Leave', 12], ['Sick Leave', 10], ['Earned Leave', 18], ['Work From Home', 24]] as const) {
    const leaveType = await prisma.leaveType.upsert({ where: { companyId_name: { companyId: company.id, name } }, update: { daysPerYear }, create: { name, daysPerYear, companyId: company.id } })
    await prisma.leaveBalance.upsert({ where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId: leaveType.id, year: 2026 } }, update: {}, create: { employeeId: employee.id, leaveTypeId: leaveType.id, year: 2026, allocated: daysPerYear } })
  }
  for (const [name, required] of [['Identity', true], ['Employment', true], ['Education', true], ['Finance', false]] as const) {
    await prisma.documentCategory.upsert({ where: { companyId_name: { companyId: company.id, name } }, update: { required }, create: { name, required, companyId: company.id } })
  }
  console.log('Seeded admin@acme.test / Admin@123')
}
main().finally(() => prisma.$disconnect())
