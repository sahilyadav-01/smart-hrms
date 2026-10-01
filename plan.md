# 🚀 `smart-hrms` — Complete Project Blueprint

I recommend building **Smart HRMS** as a production-style full-stack application rather than a simple CRUD project.

## 1. Technology Stack

### Frontend

```text
React.js
Vite
TypeScript
React Router DOM
Tailwind CSS
Framer Motion
React Hook Form
Zod
TanStack Query
Axios
Recharts
Lucide React
```

### Backend

```text
Node.js
Express.js
TypeScript
PostgreSQL
Prisma ORM
JWT Authentication
bcrypt
Zod
Multer
Nodemailer
```

### Infrastructure

```text
GitHub
Docker
Docker Compose
PostgreSQL
GitHub Actions
Render / Railway / AWS
Cloudinary or S3
```

---

# 2. Repository Structure

```text
smart-hrms/
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── images/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── ui/
│   │   │   ├── charts/
│   │   │   ├── forms/
│   │   │   └── tables/
│   │   │
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── EmployeeLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── leaves/
│   │   │   ├── payroll/
│   │   │   ├── recruitment/
│   │   │   ├── performance/
│   │   │   ├── documents/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── RoleRoute.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── employee.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── leave.service.ts
│   │   │   ├── payroll.service.ts
│   │   │   └── recruitment.service.ts
│   │   │
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── config/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── logger.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── attendance/
│   │   │   ├── leaves/
│   │   │   ├── holidays/
│   │   │   ├── payroll/
│   │   │   ├── recruitment/
│   │   │   ├── performance/
│   │   │   ├── documents/
│   │   │   ├── notifications/
│   │   │   └── reports/
│   │   │
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── .gitignore
├── README.md
└── LICENSE
```

---

# 3. Main Modules

## 🔐 Authentication

```text
Login
Logout
Forgot Password
Reset Password
Refresh Token
Change Password
2FA
Session Management
Role-Based Access
```

Roles:

```text
SUPER_ADMIN
HR_ADMIN
HR_MANAGER
MANAGER
EMPLOYEE
RECRUITER
```

---

# 4. Employee Management

### Employee profile

```text
Employee ID
First Name
Last Name
Email
Phone
Date of Birth
Joining Date
Department
Designation
Manager
Employment Type
Employment Status
Work Location
Profile Photo
Emergency Contact
Bank Details
```

### Employee lifecycle

```text
Candidate
   ↓
Offer
   ↓
Onboarding
   ↓
Active Employee
   ↓
Probation
   ↓
Confirmed
   ↓
Resigned / Terminated
```

---

# 5. Organization Module

```text
Company
 ├── Departments
 │    ├── IT
 │    ├── HR
 │    ├── Finance
 │    └── Sales
 │
 ├── Designations
 ├── Locations
 └── Reporting Structure
```

---

# 6. Attendance Module

Features:

```text
Clock In
Clock Out
Break
Working Hours
Overtime
Late Arrival
Early Departure
Attendance Calendar
Monthly Attendance
Attendance Correction
Manager Approval
```

Dashboard:

```text
Present
Absent
Late
On Leave
Work From Home
Half Day
```

---

# 7. Leave Management

Leave types:

```text
Casual Leave
Sick Leave
Earned Leave
Paid Leave
Unpaid Leave
Maternity Leave
Paternity Leave
Work From Home
```

Workflow:

```text
Employee
   ↓
Leave Request
   ↓
Manager Approval
   ↓
HR Approval
   ↓
Approved
```

---

# 8. Payroll Module

```text
Employee Salary
Basic Salary
HRA
Allowances
Bonus
Overtime
Tax
Deductions
Net Salary
Payroll Period
Payslip
Payment Status
```

Example:

```text
Gross Salary
     +
Allowances
     +
Bonus
     -
Deductions
     -
Tax
     =
Net Salary
```

---

# 9. Recruitment / ATS

```text
Job Requisition
      ↓
Job Opening
      ↓
Candidates
      ↓
Resume Screening
      ↓
Interview
      ↓
Technical Round
      ↓
HR Round
      ↓
Offer
      ↓
Hired
```

Candidate statuses:

```text
APPLIED
SCREENING
SHORTLISTED
INTERVIEW
SELECTED
REJECTED
HIRED
```

---

# 10. Performance Management

```text
Performance Cycle
      ↓
Goals
      ↓
Employee Self Review
      ↓
Manager Review
      ↓
HR Review
      ↓
Final Rating
```

Features:

* KPI management
* Goals
* Self assessment
* Manager assessment
* Feedback
* Performance history

---

# 11. Documents

```text
Employee Documents
Offer Letter
Appointment Letter
ID Proof
Address Proof
Education Certificate
Experience Letter
Salary Documents
Policy Documents
```

Add:

```text
Document Expiry
Document Verification
Upload
Download
Delete
Access Control
```

---

# 12. Notifications

Support:

```text
In-app notifications
Email notifications
Leave notifications
Attendance alerts
Payroll notifications
Document expiry alerts
Recruitment notifications
Announcements
```

---

# 13. Database Schema

The core relationship should look like this:

```text
Company
  │
  ├── Departments
  │      │
  │      └── Employees
  │              │
  │              ├── Attendance
  │              ├── Leaves
  │              ├── Payroll
  │              ├── Documents
  │              ├── Performance
  │              └── Notifications
  │
  ├── Users
  ├── Roles
  ├── Jobs
  ├── Candidates
  └── Holidays
```

### Core tables

```text
companies
users
roles
permissions
user_roles

employees
departments
designations
locations

attendance
attendance_corrections

leave_types
leave_balances
leave_requests

holidays

salary_structures
payrolls
payslips

jobs
candidates
applications
interviews
offers

performance_cycles
performance_goals
performance_reviews

documents
document_categories

notifications
announcements

audit_logs
```

---

# 14. Important Relationships

### Employee

```text
Employee
 ├── belongsTo Company
 ├── belongsTo Department
 ├── belongsTo Designation
 ├── belongsTo Manager
 ├── hasMany Attendance
 ├── hasMany LeaveRequests
 ├── hasMany Documents
 ├── hasMany Payrolls
 └── hasMany PerformanceReviews
```

### Leave

```text
Employee
   │
   └── LeaveRequest
          │
          ├── LeaveType
          ├── Manager
          └── HR
```

### Recruitment

```text
Job
 │
 └── Applications
       │
       └── Candidate
              │
              ├── Interviews
              └── Offer
```

---

# 15. Example Prisma Model

```prisma
model Employee {
  id             String   @id @default(uuid())
  employeeCode   String   @unique
  firstName      String
  lastName       String
  email          String   @unique
  phone          String?
  joiningDate    DateTime
  status         EmployeeStatus @default(ACTIVE)

  companyId      String
  departmentId   String?
  designationId  String?
  managerId      String?

  company        Company      @relation(fields: [companyId], references: [id])
  department     Department?  @relation(fields: [departmentId], references: [id])
  designation    Designation? @relation(fields: [designationId], references: [id])

  attendance     Attendance[]
  leaveRequests  LeaveRequest[]
  documents      Document[]
  payrolls       Payroll[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

# 16. API Architecture

Base URL:

```text
/api/v1
```

### Authentication

```http
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password
```

### Employees

```http
GET    /employees
GET    /employees/:id
POST   /employees
PATCH  /employees/:id
DELETE /employees/:id
```

### Attendance

```http
POST /attendance/check-in
POST /attendance/check-out
GET  /attendance
GET  /attendance/my
PATCH /attendance/:id
```

### Leaves

```http
GET  /leaves
POST /leaves
GET  /leaves/:id
PATCH /leaves/:id
POST /leaves/:id/approve
POST /leaves/:id/reject
```

### Payroll

```http
GET  /payroll
POST /payroll
GET  /payroll/:id
GET  /payroll/:id/payslip
```

### Recruitment

```http
GET  /jobs
POST /jobs
PATCH /jobs/:id

GET  /candidates
POST /candidates

POST /applications
PATCH /applications/:id/status
```

---

# 17. Frontend Routes

```text
/login
/forgot-password

/dashboard

/employees
/employees/new
/employees/:id
/employees/:id/edit

/attendance
/attendance/my

/leaves
/leaves/apply
/leaves/requests

/payroll
/payroll/:id

/recruitment
/recruitment/jobs
/recruitment/candidates
/recruitment/interviews

/performance
/performance/goals
/performance/reviews

/documents
/reports

/notifications

/settings
/settings/profile
/settings/users
/settings/roles
/settings/company
```

---

# 18. Dashboard

### HR Dashboard

```text
┌───────────────────────────────────────────────┐
│ Good Morning, Admin                          │
├──────────┬──────────┬──────────┬─────────────┤
│ Employees│ Present  │ On Leave │ Open Jobs   │
│   248    │   231    │    12    │     8       │
├──────────┴──────────┴──────────┴─────────────┤
│                                              │
│ Attendance Overview                          │
│             📈                               │
│                                              │
├───────────────────────┬──────────────────────┤
│ Leave Requests        │ New Employees        │
│                       │                      │
│ Pending approvals     │ Recent joiners       │
└───────────────────────┴──────────────────────┘
```

### Employee Dashboard

```text
My Attendance
My Leave Balance
Today's Status
Upcoming Holidays
Latest Payslip
Pending Requests
Company Announcements
```

---

# 19. Frontend Development Roadmap

## Phase 1 — Foundation

```text
✓ Vite + React + TypeScript
✓ Tailwind
✓ Routing
✓ Layout
✓ Sidebar
✓ Header
✓ Theme
✓ API client
```

## Phase 2 — Authentication

```text
✓ Login
✓ Logout
✓ JWT
✓ Protected routes
✓ Role permissions
✓ Forgot password
```

## Phase 3 — Employee Management

```text
✓ Employee list
✓ Search
✓ Filters
✓ Add employee
✓ Edit employee
✓ Employee profile
✓ Employee documents
```

## Phase 4 — Attendance

```text
✓ Check-in
✓ Check-out
✓ Calendar
✓ Attendance reports
✓ Correction requests
```

## Phase 5 — Leave

```text
✓ Leave types
✓ Leave balance
✓ Apply leave
✓ Approval workflow
✓ Leave calendar
```

## Phase 6 — Payroll

```text
✓ Salary structure
✓ Payroll processing
✓ Payslip
✓ Payroll history
✓ PDF generation
```

## Phase 7 — Recruitment

```text
✓ Jobs
✓ Candidates
✓ Applications
✓ Interview scheduling
✓ Hiring pipeline
```

## Phase 8 — Performance

```text
✓ Goals
✓ KPIs
✓ Reviews
✓ Feedback
✓ Performance reports
```

## Phase 9 — Analytics

```text
✓ HR analytics
✓ Attendance charts
✓ Leave analytics
✓ Recruitment analytics
✓ Payroll analytics
```

---

# 20. Backend Development Roadmap

### Step 1

```text
Express server
PostgreSQL
Prisma
Environment configuration
Error handling
Logging
```

### Step 2

```text
Authentication
JWT
Password hashing
RBAC
User management
```

### Step 3

```text
Employee APIs
Department APIs
Designation APIs
Location APIs
```

### Step 4

```text
Attendance APIs
Leave APIs
Holiday APIs
```

### Step 5

```text
Payroll APIs
Payslip generation
```

### Step 6

```text
Recruitment APIs
Candidate APIs
Interview APIs
Offer APIs
```

### Step 7

```text
Performance APIs
Document APIs
Notification APIs
Reports APIs
```

### Step 8

```text
Audit logs
Rate limiting
Validation
Security hardening
Testing
```

---

# 21. Security Architecture

For a serious HR application, security should be part of the initial architecture.

```text
JWT Authentication
       ↓
Role-Based Access Control
       ↓
Permission Middleware
       ↓
API Validation
       ↓
Database
```

Implement:

* Password hashing
* HTTP security headers
* Rate limiting
* Request validation
* CORS configuration
* Secure cookies/token strategy
* File upload validation
* Audit logging
* Database constraints
* Permission-based API access
* Environment secrets
* No sensitive data in Git

---

# 22. GitHub Branch Strategy

```text
main
│
├── develop
│
├── feature/auth
├── feature/employees
├── feature/attendance
├── feature/leaves
├── feature/payroll
├── feature/recruitment
└── feature/performance
```

Commit style:

```text
feat: add employee management module
feat: implement attendance check-in
fix: resolve leave approval validation
refactor: improve employee service
docs: update API documentation
chore: configure docker environment
```

---

# 23. Testing

### Frontend

```text
Vitest
React Testing Library
```

### Backend

```text
Jest / Vitest
Supertest
```

Test:

```text
Authentication
Employee CRUD
Leave approval
Attendance
Payroll calculations
Permissions
API validation
```

---

# 24. Docker

```text
smart-hrms
│
├── frontend
├── backend
└── PostgreSQL
```

`docker-compose.yml`:

```text
frontend
   │
backend
   │
PostgreSQL
```

Later you can add:

```text
Redis
```

for caching, sessions, queues, or background jobs.

---

# 25. CI/CD

GitHub Actions:

```text
Push
 ↓
Install dependencies
 ↓
Lint
 ↓
Type check
 ↓
Unit tests
 ↓
Build
 ↓
Deploy
```

Workflow:

```text
.github/
└── workflows/
    ├── ci.yml
    └── deploy.yml
```

---

# 26. Production Milestones

| Version  | Scope                           |
| -------- | ------------------------------- |
| **v0.1** | Project setup + UI              |
| **v0.2** | Authentication + RBAC           |
| **v0.3** | Employee Management             |
| **v0.4** | Attendance                      |
| **v0.5** | Leave Management                |
| **v0.6** | Payroll                         |
| **v0.7** | Recruitment                     |
| **v0.8** | Performance                     |
| **v0.9** | Reports + Analytics             |
| **v1.0** | Security + Testing + Deployment |

### Final architecture

```text
                    ┌───────────────────┐
                    │     Smart HRMS    │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
        React Frontend                  Express API
              │                               │
       React Router                         JWT
       TanStack Query                        RBAC
       Tailwind                              Zod
       Recharts                              │
              │                               │
              └───────────────┬───────────────┘
                              │
                           Prisma
                              │
                         PostgreSQL
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          Documents       Email/Jobs       Reports
```

**Recommended build order:** **Auth → Employees → Departments → Attendance → Leave → Payroll → Recruitment → Performance → Documents → Notifications → Reports → Analytics → Security → Deployment.**

That sequence gives `smart-hrms` a coherent MVP early, while keeping the architecture ready for the larger HR platform.
