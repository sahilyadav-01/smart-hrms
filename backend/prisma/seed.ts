import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Role, EmployeeStatus, EmploymentType, AttendanceStatus, LeaveStatus, PayrollStatus } from '../src/types/enums.js'

const prisma = new PrismaClient()

const main = async () => {
  console.log('Seeding Complete Instrumentation Solutions Pvt Ltd with REAL Team Members...')

  // 1. Company
  const company = await prisma.company.upsert({
    where: { slug: 'cis-pvt-ltd' },
    update: { name: 'Complete Instrumentation Solutions Pvt Ltd' },
    create: { name: 'Complete Instrumentation Solutions Pvt Ltd', slug: 'cis-pvt-ltd' },
  })

  // Ensure legacy workspace resolves if accessed
  await prisma.company.upsert({
    where: { slug: 'acme-studio' },
    update: { name: 'Complete Instrumentation Solutions Pvt Ltd' },
    create: { name: 'Complete Instrumentation Solutions Pvt Ltd', slug: 'acme-studio' },
  })

  const passwordHash = await bcrypt.hash('Admin@123', 10)

  // 2. Real Departments from Org Charts
  const deptNames = [
    'Executive Leadership',
    'Sales & Business Development',
    'Geophysics & Geotechnical',
    'Pavement Engineering & Marketing',
    'Materials Testing',
    'Geology & Rock Mechanics',
    'Tendering & OEM Coordination',
    'Engineering Services & Operations',
    'Finance & Accounts',
    'Operations Support',
    'Human Resources',
  ]
  const depts: Record<string, string> = {}
  for (const name of deptNames) {
    const d = await prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name } },
      update: {},
      create: { name, companyId: company.id },
    })
    depts[name] = d.id
  }

  // 3. Real Designations from Org Charts
  const desigTitles = [
    'Director Technical & Sales',
    'Director Operations',
    'General Manager Sales & Services',
    'EA & Coordinator - Sales',
    'AGM & Coordinator, OEM\'S',
    'Manager (Tech) - Geophysics & Geotechnical',
    'Sales Engineer',
    'Manager (Tech) - Pavement Engineering',
    'Marketing Coordinator',
    'Manager (Tech) - Materials Testing',
    'Assistant Sales Manager',
    'Manager (Sales) - Geophysics & Geotechnical (Kolkata)',
    'Manager (Tech) - Geology & Rock Mechanics',
    'Executive - Tendering Team',
    'Coordinator Services & Operations',
    'Senior Engineer Services',
    'Engineer Services',
    'Services, Technical Support & Developer',
    'Manager - HR',
    'Manager Finance & Accounts',
    'Assistant Manager Finance & Accounts',
    'Operations Support Officer',
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
    where: { companyId_name: { companyId: company.id, name: 'Headquarters & Technical Lab - Gurugram' } },
    update: {},
    create: { name: 'Headquarters & Technical Lab - Gurugram', city: 'Gurugram', country: 'India', companyId: company.id },
  })

  const locKolkata = await prisma.location.upsert({
    where: { companyId_name: { companyId: company.id, name: 'Regional Office - Kolkata' } },
    update: {},
    create: { name: 'Regional Office - Kolkata', city: 'Kolkata', country: 'India', companyId: company.id },
  })

  // 5. Complete Real Team Members from Organization Charts
  const realTeamMembers = [
    // --- Executive Leadership ---
    {
      email: 'neeraj.chadha@cispl.in',
      role: Role.SUPER_ADMIN,
      code: 'CIS-001',
      firstName: 'Neeraj',
      lastName: 'Chadha',
      phone: '+91 98100 11001',
      dept: 'Executive Leadership',
      desig: 'Director Technical & Sales',
      loc: locHq.id,
      salary: 225000,
    },
    {
      email: 'rajan.chadha@cispl.in',
      role: Role.SUPER_ADMIN,
      code: 'CIS-002',
      firstName: 'Rajan',
      lastName: 'Chadha',
      phone: '+91 98100 11002',
      dept: 'Executive Leadership',
      desig: 'Director Operations',
      loc: locHq.id,
      salary: 225000,
    },
    {
      email: 'jitesh.salvi@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-003',
      firstName: 'Jitesh',
      lastName: 'Salvi',
      phone: '+91 98100 11003',
      dept: 'Sales & Business Development',
      desig: 'General Manager Sales & Services',
      loc: locHq.id,
      salary: 175000,
    },
    {
      email: 'sneha.kuwarbi@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-004',
      firstName: 'Sneha',
      lastName: 'Kuwarbi',
      phone: '+91 98100 11004',
      dept: 'Executive Leadership',
      desig: 'EA & Coordinator - Sales',
      loc: locHq.id,
      salary: 75000,
    },

    // --- Sales, OEM & Technical Divisions ---
    {
      email: 'sakshi.sharma@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-005',
      firstName: 'Sakshi',
      lastName: 'Sharma',
      phone: '+91 98100 11005',
      dept: 'Tendering & OEM Coordination',
      desig: 'AGM & Coordinator, OEM\'S',
      loc: locHq.id,
      salary: 135000,
    },
    {
      email: 'azeezurrahman@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-006',
      firstName: 'Azeezurrahman',
      lastName: '',
      phone: '+91 98100 11006',
      dept: 'Geophysics & Geotechnical',
      desig: 'Manager (Tech) - Geophysics & Geotechnical',
      loc: locHq.id,
      salary: 140000,
    },
    {
      email: 'harsh.saini@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-007',
      firstName: 'Harsh',
      lastName: 'Saini',
      phone: '+91 98100 11007',
      dept: 'Geophysics & Geotechnical',
      desig: 'Sales Engineer',
      loc: locHq.id,
      salary: 70000,
    },
    {
      email: 'tousif.ansari@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-008',
      firstName: 'Tousif',
      lastName: 'Ansari',
      phone: '+91 98100 11008',
      dept: 'Geophysics & Geotechnical',
      desig: 'Sales Engineer',
      loc: locHq.id,
      salary: 70000,
    },
    {
      email: 'dr.abhinav@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-009',
      firstName: 'Dr. Abhinav',
      lastName: '',
      phone: '+91 98100 11009',
      dept: 'Pavement Engineering & Marketing',
      desig: 'Manager (Tech) - Pavement Engineering',
      loc: locHq.id,
      salary: 145000,
    },
    {
      email: 'ajith.c@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-010',
      firstName: 'Ajith',
      lastName: 'C.',
      phone: '+91 98100 11010',
      dept: 'Pavement Engineering & Marketing',
      desig: 'Marketing Coordinator',
      loc: locHq.id,
      salary: 68000,
    },
    {
      email: 'dr.rajkumar@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-011',
      firstName: 'Dr. Raj',
      lastName: 'Kumar',
      phone: '+91 98100 11011',
      dept: 'Materials Testing',
      desig: 'Manager (Tech) - Materials Testing',
      loc: locHq.id,
      salary: 145000,
    },
    {
      email: 'deepak.sharma@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-012',
      firstName: 'Deepak',
      lastName: 'Sharma',
      phone: '+91 98100 11012',
      dept: 'Materials Testing',
      desig: 'Assistant Sales Manager',
      loc: locHq.id,
      salary: 90000,
    },
    {
      email: 'chinmay.neogi@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-013',
      firstName: 'Chinmay',
      lastName: 'Neogi',
      phone: '+91 98100 11013',
      dept: 'Geophysics & Geotechnical',
      desig: 'Manager (Sales) - Geophysics & Geotechnical (Kolkata)',
      loc: locKolkata.id,
      salary: 130000,
    },
    {
      email: 'dr.chandrakant@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-014',
      firstName: 'Dr. Chandrakant',
      lastName: 'Yadav',
      phone: '+91 98100 11014',
      dept: 'Geology & Rock Mechanics',
      desig: 'Manager (Tech) - Geology & Rock Mechanics',
      loc: locHq.id,
      salary: 145000,
    },
    {
      email: 'kanta.sharma@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-015',
      firstName: 'Kanta',
      lastName: 'Sharma',
      phone: '+91 98100 11015',
      dept: 'Tendering & OEM Coordination',
      desig: 'Executive - Tendering Team',
      loc: locHq.id,
      salary: 72000,
    },
    {
      email: 'yamini.sharma@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-016',
      firstName: 'Yamini',
      lastName: 'Sharma',
      phone: '+91 98100 11016',
      dept: 'Tendering & OEM Coordination',
      desig: 'Coordinator Services & Operations',
      loc: locHq.id,
      salary: 78000,
    },

    // --- Engineering Services (Operations Org) ---
    {
      email: 'kapil.sharma@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-017',
      firstName: 'Kapil',
      lastName: 'Sharma',
      phone: '+91 98100 11017',
      dept: 'Engineering Services & Operations',
      desig: 'Senior Engineer Services',
      loc: locHq.id,
      salary: 110000,
    },
    {
      email: 'saumya.ranjan@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-018',
      firstName: 'Saumya',
      lastName: 'Ranjan',
      phone: '+91 98100 11018',
      dept: 'Engineering Services & Operations',
      desig: 'Senior Engineer Services',
      loc: locHq.id,
      salary: 110000,
    },
    {
      email: 'sahil.yadav@cispl.in',
      role: Role.SUPER_ADMIN,
      code: 'CIS-019',
      firstName: 'Sahil',
      lastName: 'Yadav',
      phone: '+91 98100 11019',
      dept: 'Engineering Services & Operations',
      desig: 'Services, Technical Support & Developer',
      loc: locHq.id,
      salary: 125000,
    },
    {
      email: 'vishal.bhardwaj@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-020',
      firstName: 'Vishal',
      lastName: 'Bhardwaj',
      phone: '+91 98100 11020',
      dept: 'Engineering Services & Operations',
      desig: 'Engineer Services',
      loc: locHq.id,
      salary: 80000,
    },
    {
      email: 'bhunesh.kumar@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-021',
      firstName: 'Bhunesh',
      lastName: 'Kumar',
      phone: '+91 98100 11021',
      dept: 'Engineering Services & Operations',
      desig: 'Engineer Services',
      loc: locHq.id,
      salary: 80000,
    },
    {
      email: 'abinash@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-022',
      firstName: 'Abinash',
      lastName: '',
      phone: '+91 98100 11022',
      dept: 'Engineering Services & Operations',
      desig: 'Engineer Services',
      loc: locHq.id,
      salary: 80000,
    },
    {
      email: 'asim.khan@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-023',
      firstName: 'Asim',
      lastName: 'Khan',
      phone: '+91 98100 11023',
      dept: 'Engineering Services & Operations',
      desig: 'Engineer Services',
      loc: locHq.id,
      salary: 80000,
    },

    // --- Finance, Accounts, Operations Support & HR ---
    {
      email: 'satish.chandra@cispl.in',
      role: Role.MANAGER,
      code: 'CIS-024',
      firstName: 'Satish',
      lastName: 'Chandra',
      phone: '+91 98100 11024',
      dept: 'Finance & Accounts',
      desig: 'Manager Finance & Accounts',
      loc: locHq.id,
      salary: 135000,
    },
    {
      email: 'rahul.singh@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-025',
      firstName: 'Rahul',
      lastName: 'Singh',
      phone: '+91 98100 11025',
      dept: 'Finance & Accounts',
      desig: 'Assistant Manager Finance & Accounts',
      loc: locHq.id,
      salary: 85000,
    },
    {
      email: 'ferdos@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-026',
      firstName: 'Ferdos',
      lastName: '',
      phone: '+91 98100 11026',
      dept: 'Operations Support',
      desig: 'Operations Support Officer',
      loc: locHq.id,
      salary: 55000,
    },
    {
      email: 'ratikanta.panda@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-027',
      firstName: 'Ratikanta',
      lastName: 'Panda',
      phone: '+91 98100 11027',
      dept: 'Operations Support',
      desig: 'Operations Support Officer',
      loc: locHq.id,
      salary: 55000,
    },
    {
      email: 'bibhu.prasad@cispl.in',
      role: Role.EMPLOYEE,
      code: 'CIS-028',
      firstName: 'Bibhu',
      lastName: 'Prasad',
      phone: '+91 98100 11028',
      dept: 'Operations Support',
      desig: 'Operations Support Officer',
      loc: locHq.id,
      salary: 55000,
    },
    {
      email: 'hr@cispl.in',
      role: Role.HR_ADMIN,
      code: 'CIS-029',
      firstName: 'HR',
      lastName: 'Operations',
      phone: '+91 98100 11029',
      dept: 'Human Resources',
      desig: 'Manager - HR',
      loc: locHq.id,
      salary: 125000,
    },
  ]

  const createdEmployees: any[] = []

  for (const u of realTeamMembers) {
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
      update: {
        userId: user.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        departmentId: depts[u.dept],
        designationId: desigs[u.desig],
        locationId: u.loc,
        companyId: company.id,
      },
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

    createdEmployees.push({ ...emp, role: u.role, userEmail: u.email, baseSalary: u.salary })
  }

  // 6. Leave Types & Balances
  const leaveConfigs = [
    { name: 'Casual Leave', days: 12 },
    { name: 'Sick Leave', days: 10 },
    { name: 'Earned Leave', days: 18 },
    { name: 'Site / On-Duty Leave', days: 15 },
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
          used: lt.name === 'Casual Leave' ? 3 : lt.name === 'Sick Leave' ? 1 : 0,
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
    // Make Harsh Saini on site duty / on leave for variance
    const status = emp.firstName === 'Harsh' ? AttendanceStatus.ON_LEAVE : AttendanceStatus.PRESENT
    await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: emp.id, date: todayUtc } },
      update: {},
      create: {
        employeeId: emp.id,
        date: todayUtc,
        checkIn: status === AttendanceStatus.PRESENT ? checkInTime : null,
        status,
        notes: status === AttendanceStatus.ON_LEAVE ? 'Field site visit at client location' : 'Biometric punch logged',
      },
    })
  }

  // 8. Pending Leave Requests for Approvals Queue
  const harshEmp = createdEmployees.find(e => e.firstName === 'Harsh')
  const vishalEmp = createdEmployees.find(e => e.firstName === 'Vishal')
  if (harshEmp && createdLeaveTypes.length > 0) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: harshEmp.id,
        leaveTypeId: createdLeaveTypes[3].id, // Site / On-Duty
        startDate: new Date(),
        endDate: new Date(),
        days: 1,
        reason: 'On-site Geotechnical investigation and testing at NHAI highway corridor',
        status: LeaveStatus.PENDING,
      },
    })
  }

  if (vishalEmp && createdLeaveTypes.length > 0) {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 5)
    const nextWeekEnd = new Date(nextWeek)
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 2)

    await prisma.leaveRequest.create({
      data: {
        employeeId: vishalEmp.id,
        leaveTypeId: createdLeaveTypes[0].id, // Casual
        startDate: nextWeek,
        endDate: nextWeekEnd,
        days: 2,
        reason: 'Family function & personal travel',
        status: LeaveStatus.PENDING,
      },
    })
  }

  // 9. Document Categories
  for (const [name, required] of [
    ['Identity (Aadhaar / Passport / Voter ID)', true],
    ['Appointment Letter & Non-Disclosure Agreement (NDA)', true],
    ['Technical & Engineering Qualifications (Degree / Diploma)', true],
    ['Site Safety (HSE) & Instrumentation Calibration Certs', true],
    ['Bank Account & PF/ESIC Details', true],
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
      title: '🎯 Organization Update: Complete Instrumentation Solutions Pvt Ltd',
      body: 'Welcome to the unified Smart HRMS portal for CISPL. All team members across Sales, Services, Geotechnical, Materials Testing, and Operations can now record attendance, submit site logs, and apply for leaves online.',
      audience: 'ALL',
      companyId: company.id,
      authorId: createdEmployees[0].id,
      publishedAt: new Date(),
    },
  })

  // 11. Salary Structures & Payroll
  for (const emp of createdEmployees) {
    const gross = emp.baseSalary || 80000
    const basic = Math.round(gross * 0.55)
    const hra = Math.round(gross * 0.25)
    const allowances = gross - basic - hra
    const tax = Math.round(gross * 0.08)
    const deductions = 2400
    const net = gross - tax - deductions

    await prisma.salaryStructure.upsert({
      where: { employeeId: emp.id },
      update: {},
      create: {
        employeeId: emp.id,
        basicSalary: basic,
        hra,
        allowances,
        effectiveFrom: new Date('2025-01-01'),
      },
    })

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
        basicSalary: basic,
        hra,
        allowances,
        bonus: 5000,
        overtime: 0,
        tax,
        deductions,
        grossSalary: gross + 5000,
        netSalary: net + 5000,
        status: PayrollStatus.PAID,
        paidAt: new Date('2026-02-28'),
      },
    })
  }

  console.log('✅ Seeding completed with REAL team members from CISPL Org Chart!')
  console.log('Seeded Accounts (Password for all: Admin@123):')
  console.log('- 👑 Director / Super Admin: neeraj.chadha@cispl.in')
  console.log('- 👑 Director Operations:    rajan.chadha@cispl.in')
  console.log('- 👨‍💼 GM Sales & Services:    jitesh.salvi@cispl.in')
  console.log('- 💻 Services, Support & Dev: sahil.yadav@cispl.in')
  console.log('- 🧑‍💼 HR Operations:         hr@cispl.in')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
