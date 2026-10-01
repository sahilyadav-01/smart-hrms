import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Role, EmployeeStatus, EmploymentType, AttendanceStatus, LeaveStatus, PayrollStatus } from '../src/types/enums.js'

const prisma = new PrismaClient()

const main = async () => {
  console.log('Seeding Smart HRMS SQLite database...')

  // 1. Company
  const company = await prisma.company.upsert({
    where: { slug: 'acme-studio' },
    update: {},
    create: { name: 'Acme Studio', slug: 'acme-studio' },
  })

  const passwordHash = await bcrypt.hash('Admin@123', 10)

  // 2. Departments
  const deptNames = ['Engineering', 'Design', 'People', 'Finance', 'Marketing', 'Operations']
  const depts: Record<string, string> = {}
  for (const name of deptNames) {
    const d = await prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name } },
      update: {},
      create: { name, companyId: company.id },
    })
    depts[name] = d.id
  }

  // 3. Designations
  const desigTitles = [
    'VP of Technology',
    'Engineering Lead',
    'Senior Fullstack Developer',
    'Frontend Developer',
    'HR Administrator',
    'People Partner',
    'Product Designer',
    'Finance Manager',
  ]
  const desigs: Record<string, string> = {}
  for (const title of desigTitles) {
    const d = await prisma.designation.upsert({
      where: { companyId_title: { companyId: company.id, title } },
      update: {},
      create: { title, companyId: company.id },
    })
    desigs[title] = d.id
  }

  // 4. Locations
  const locHq = await prisma.location.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Head Office - Bengaluru' } },
    update: {},
    create: { name: 'Head Office - Bengaluru', city: 'Bengaluru', country: 'India', companyId: company.id },
  })

  const locPune = await prisma.location.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Pune Tech Hub' } },
    update: {},
    create: { name: 'Pune Tech Hub', city: 'Pune', country: 'India', companyId: company.id },
  })

  // 5. Users and Employees for each Role
  const seedUsers = [
    {
      email: 'admin@acme.test',
      role: Role.SUPER_ADMIN,
      code: 'ACM-001',
      firstName: 'Sahil',
      lastName: 'Admin',
      phone: '+91 98765 43210',
      dept: 'People',
      desig: 'VP of Technology',
      loc: locHq.id,
    },
    {
      email: 'hr@acme.test',
      role: Role.HR_ADMIN,
      code: 'ACM-002',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '+91 98765 43211',
      dept: 'People',
      desig: 'HR Administrator',
      loc: locHq.id,
    },
    {
      email: 'manager@acme.test',
      role: Role.MANAGER,
      code: 'ACM-003',
      firstName: 'Vikram',
      lastName: 'Malhotra',
      phone: '+91 98765 43212',
      dept: 'Engineering',
      desig: 'Engineering Lead',
      loc: locHq.id,
    },
    {
      email: 'employee@acme.test',
      role: Role.EMPLOYEE,
      code: 'ACM-004',
      firstName: 'Sahil',
      lastName: 'Yadav',
      phone: '+91 98765 43213',
      dept: 'Engineering',
      desig: 'Senior Fullstack Developer',
      loc: locHq.id,
    },
    {
      email: 'sahil@acme.test',
      role: Role.EMPLOYEE,
      code: 'ACM-005',
      firstName: 'Sahil',
      lastName: 'Kumar',
      phone: '+91 98765 43214',
      dept: 'Engineering',
      desig: 'Senior Fullstack Developer',
      loc: locHq.id,
    },
    {
      email: 'ananya@acme.test',
      role: Role.EMPLOYEE,
      code: 'ACM-006',
      firstName: 'Ananya',
      lastName: 'Iyer',
      phone: '+91 98765 43215',
      dept: 'Design',
      desig: 'Product Designer',
      loc: locPune.id,
    },
    {
      email: 'rohit@acme.test',
      role: Role.EMPLOYEE,
      code: 'ACM-007',
      firstName: 'Rohit',
      lastName: 'Verma',
      phone: '+91 98765 43216',
      dept: 'Engineering',
      desig: 'Frontend Developer',
      loc: locHq.id,
    },
  ]

  const createdEmployees: any[] = []

  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, passwordHash },
      create: {
        email: u.email,
        passwordHash,
        role: u.role,
        companyId: company.id,
      },
    })

    const emp = await prisma.employee.upsert({
      where: { companyId_employeeCode: { companyId: company.id, employeeCode: u.code } },
      update: { userId: user.id, email: u.email },
      create: {
        employeeCode: u.code,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        joiningDate: new Date('2024-01-15'),
        status: EmployeeStatus.ACTIVE,
        employmentType: EmploymentType.FULL_TIME,
        companyId: company.id,
        departmentId: depts[u.dept],
        designationId: desigs[u.desig],
        locationId: u.loc,
        userId: user.id,
      },
    })

    createdEmployees.push({ ...emp, role: u.role, userEmail: u.email })
  }

  // 6. Leave Types & Balances
  const leaveConfigs = [
    { name: 'Casual Leave', days: 12 },
    { name: 'Sick Leave', days: 10 },
    { name: 'Earned Leave', days: 18 },
    { name: 'Work From Home', days: 24 },
  ]

  const createdLeaveTypes: any[] = []
  for (const lt of leaveConfigs) {
    const leaveType = await prisma.leaveType.upsert({
      where: { companyId_name: { companyId: company.id, name: lt.name } },
      update: { daysPerYear: lt.days },
      create: { name: lt.name, daysPerYear: lt.days, companyId: company.id },
    })
    createdLeaveTypes.push(leaveType)

    for (const emp of createdEmployees) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: emp.id,
            leaveTypeId: leaveType.id,
            year: 2026,
          },
        },
        update: {},
        create: {
          employeeId: emp.id,
          leaveTypeId: leaveType.id,
          year: 2026,
          allocated: lt.days,
          used: lt.name === 'Casual Leave' ? 4 : lt.name === 'Sick Leave' ? 2 : 0,
        },
      })
    }
  }

  // 7. Today's Attendance
  const today = new Date()
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const checkInTime = new Date()
  checkInTime.setHours(9, 28, 0, 0)

  for (let i = 0; i < createdEmployees.length; i++) {
    const emp = createdEmployees[i]
    const status = i === 5 ? AttendanceStatus.ON_LEAVE : AttendanceStatus.PRESENT
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: emp.id, date: todayUtc } },
      update: {},
      create: {
        employeeId: emp.id,
        date: todayUtc,
        checkIn: status === AttendanceStatus.PRESENT ? checkInTime : null,
        status,
        notes: status === AttendanceStatus.ON_LEAVE ? 'Annual trip' : 'Punched via Web Clock',
      },
    })
  }

  // 8. Pending Leave Requests for Approvals Queue
  if (createdEmployees.length >= 6 && createdLeaveTypes.length > 0) {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekEnd = new Date(nextWeek)
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 2)

    await prisma.leaveRequest.create({
      data: {
        employeeId: createdEmployees[5].id, // Ananya
        leaveTypeId: createdLeaveTypes[0].id, // Casual
        startDate: nextWeek,
        endDate: nextWeekEnd,
        days: 2,
        reason: 'Attending family celebration in hometown',
        status: LeaveStatus.PENDING,
      },
    })

    await prisma.leaveRequest.create({
      data: {
        employeeId: createdEmployees[6].id, // Rohit
        leaveTypeId: createdLeaveTypes[1].id, // Sick
        startDate: new Date(),
        endDate: new Date(),
        days: 1,
        reason: 'Viral fever rest and recuperation',
        status: LeaveStatus.PENDING,
      },
    })
  }

  // 9. Document Categories
  for (const [name, required] of [
    ['Identity (Aadhaar / Passport)', true],
    ['Employment Contract & NDA', true],
    ['Educational Certificates', true],
    ['Tax & Banking Details', true],
  ] as const) {
    await prisma.documentCategory.upsert({
      where: { companyId_name: { companyId: company.id, name } },
      update: { required },
      create: { name, required, companyId: company.id },
    })
  }

  // 10. Announcements
  await prisma.announcement.create({
    data: {
      title: '🎉 Q3 Townhall & Annual Tech Summit 2026',
      body: 'All teams are invited to the global townhall at 4:00 PM IST. Product milestones and Q3 promotions will be announced.',
      audience: 'ALL',
      companyId: company.id,
      authorId: createdEmployees[0].id,
      publishedAt: new Date(),
    },
  })

  // 11. Salary Structures & Payroll
  for (const emp of createdEmployees) {
    await prisma.salaryStructure.upsert({
      where: { employeeId: emp.id },
      update: {},
      create: {
        employeeId: emp.id,
        basicSalary: 65000,
        hra: 25000,
        allowances: 15000,
        effectiveFrom: new Date('2025-01-01'),
      },
    })

    // Add payroll record for last month
    await prisma.payroll.upsert({
      where: {
        employeeId_year_month: {
          employeeId: emp.id,
          year: 2026,
          month: 2,
        },
      },
      update: {},
      create: {
        employeeId: emp.id,
        year: 2026,
        month: 2,
        basicSalary: 65000,
        hra: 25000,
        allowances: 15000,
        bonus: 5000,
        overtime: 0,
        tax: 8500,
        deductions: 2500,
        grossSalary: 110000,
        netSalary: 99000,
        status: PayrollStatus.PAID,
        paidAt: new Date('2026-02-28'),
      },
    })
  }

  console.log('✅ Seeding completed successfully!')
  console.log('Default logins (Password for all: Admin@123):')
  console.log('- Super Admin: admin@acme.test')
  console.log('- HR Admin:    hr@acme.test')
  console.log('- Manager:     manager@acme.test')
  console.log('- Employee:    employee@acme.test OR sahil@acme.test')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
