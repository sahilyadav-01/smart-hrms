# Complete Instrumentation Solutions Pvt Ltd (CISPL) — Smart HRMS

A modern, enterprise-ready HR Management System & Operations Platform designed and customized for **Complete Instrumentation Solutions Pvt Ltd (CISPL)**. 

Built for real-world operations across CISPL's corporate headquarters, regional offices, and engineering field sites. Features comprehensive workforce governance, biometric clock punch, multi-tier leave approval workflows, payroll processing, compliance documents, recruitment pipelines, and 4 dedicated role-based portals.

> **Developed by:** [Sahil Yadav](https://github.com/sahilyadav-01) (Services, Technical Support & Developer)  
> **GitHub:** [@sahilyadav-01](https://github.com/sahilyadav-01) • **Repository:** [sahilyadav-01/smart-hrms](https://github.com/sahilyadav-01/smart-hrms)

---

## Architecture & Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Vanilla CSS Design System, Lucide Icons
- **Backend API:** Node.js, Express, TypeScript, RESTful JSON architecture
- **Database:** SQLite via Prisma ORM (`backend/prisma/dev.db`)
- **Authentication & Security:** JWT tokens with rotating refresh tokens, Bcrypt password hashing, and strict Role-Based Access Control (RBAC). Pure database-backed authentication (no demo fallbacks or mock bypasses).

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Backend Setup & Database Seeding

The backend server runs Express with Prisma SQLite and seeds all 29 official CISPL employees and departments directly from company organization charts:

```bash
cd backend
npm install
npm run prisma:seed
npm run dev
```

- API Base URL: `http://localhost:4000`
- API Health Check: `http://localhost:4000/health`
- Versioned API: `http://localhost:4000/api/v1`

### 3. Frontend Setup

In the root project directory:

```bash
npm install
npm run dev
```

- Web Application: `http://localhost:5173`

---

## Authentic CISPL Team Accounts

All 29 team members from official Sales and Operations Org Charts are seeded into the database with default initial credentials:

- **Default Password for All Accounts:** `Admin@123`

### Key Department & Portal Accounts:
| Role / Designation | Team Member | Official Email | Employee Code | Portal Access |
|---|---|---|---|---|
| **Director Technical & Sales** | Neeraj Chadha | `neeraj.chadha@cispl.in` | `CIS-001` | 👑 Super Admin |
| **Director Operations** | Rajan Chadha | `rajan.chadha@cispl.in` | `CIS-002` | 👑 Super Admin |
| **GM Sales & Services** | Jitesh Salvi | `jitesh.salvi@cispl.in` | `CIS-003` | 👨‍💼 Manager Hub |
| **Services, Tech Support & Developer** | Sahil Yadav | `sahil.yadav@cispl.in` | `CIS-019` | 👑 Super Admin |
| **Manager - HR** | HR Operations | `hr@cispl.in` | `CIS-029` | 🧑‍💼 HR Admin |
| **Manager (Tech) - Geophysics** | Azeezurrahman | `azeezurrahman@cispl.in` | `CIS-006` | 👨‍💼 Manager Hub |
| **Manager (Tech) - Materials Testing** | Dr. Raj Kumar | `dr.rajkumar@cispl.in` | `CIS-011` | 👨‍💼 Manager Hub |
| **Manager (Tech) - Geology** | Dr. Chandrakant Yadav | `dr.chandrakant@cispl.in` | `CIS-014` | 👨‍💼 Manager Hub |
| **Manager Finance & Accounts** | Satish Chandra | `satish.chandra@cispl.in` | `CIS-024` | 👨‍💼 Manager Hub |
| **Senior Engineer Services** | Kapil Sharma | `kapil.sharma@cispl.in` | `CIS-017` | 👤 Employee Portal |
| **Senior Engineer Services** | Saumya Ranjan | `saumya.ranjan@cispl.in` | `CIS-018` | 👤 Employee Portal |

*(Additional sales engineers, coordinators, and field staff use their respective `@cispl.in` corporate emails.)*

---

## Core Modules & Capabilities

### 👑 1. Super Admin Executive Center
- Real-time enterprise telemetry and immutable SQLite audit logs
- Cross-department allocation, budgets, and headcount monitoring
- System-wide security configurations and database persistence

### 🧑‍💼 2. HR Admin Operations
- Complete employee directory with profile cards, department assignment, and contact details
- Leave verification queue with 1-click Approve/Reject actions
- Candidate recruitment pipeline (Screening, Interview, Offer, Hired)
- Compliance documentation repository & verification

### 👨‍💼 3. Manager Team Hub
- Direct report workforce overview and attendance status
- Subordinate leave approvals and team calendar management
- Performance evaluations, self-review reviews, and KPI rating workflows

### 👤 4. Employee Self-Service
- Live punch clock (Check-in, Check-out, working hours duration counter)
- Attendance records & monthly presence analytics
- Leave application submission with automatic balance deductions
- Salary structure breakdown, earnings vs deductions, and printable digital payslips

---

## REST API Reference (`/api/v1`)

### Authentication & Sessions
- `POST /api/v1/auth/login` — Authenticate corporate credentials and receive JWT + Refresh Token
- `POST /api/v1/auth/refresh` — Automatic rotating refresh token exchange
- `GET /api/v1/auth/me` — Retrieve active authenticated user profile
- `POST /api/v1/auth/logout` — Revoke active refresh token and invalidate session

### Workforce Management
- `GET /api/v1/employees` — Search, filter, and paginate employee records
- `GET /api/v1/employees/:id` — Retrieve detailed employee profile
- `POST /api/v1/employees` — Add new team member to directory
- `PATCH /api/v1/employees/:id` — Update employee data and role
- `DELETE /api/v1/employees/:id` — Soft termination

### Organization Structure
- `GET /api/v1/organization` — Full organization chart tree
- `POST /api/v1/organization/departments` — Create department
- `POST /api/v1/organization/designations` — Create designation
- `POST /api/v1/organization/locations` — Manage company facilities

### Attendance & Time Tracking
- `POST /api/v1/attendance/check-in` — Record web/biometric punch-in
- `POST /api/v1/attendance/check-out` — Record punch-out and compute total working hours
- `GET /api/v1/attendance/my` — Employee's personal monthly attendance history
- `GET /api/v1/attendance` — Organization-wide attendance ledger (HR/Manager)
- `PATCH /api/v1/attendance/:id` — Regularization / record correction

### Leave Management
- `GET /api/v1/leaves/types` — Leave categories (Casual, Sick, Earned, On-Duty)
- `GET /api/v1/leaves/balances` — User's remaining leave credits
- `GET /api/v1/leaves/my` — Current user's leave requests
- `POST /api/v1/leaves` — Submit new leave application
- `GET /api/v1/leaves` — Manager and HR approval queue
- `POST /api/v1/leaves/:id/approve` — Approve leave request
- `POST /api/v1/leaves/:id/reject` — Reject leave request with feedback
- `POST /api/v1/leaves/:id/cancel` — Cancel pending request

### Payroll & Compensation
- `GET /api/v1/payroll/my` — Employee's payroll history & payslips
- `GET /api/v1/payroll` — Company-wide payroll runs
- `PUT /api/v1/payroll/salary-structures/:employeeId` — Define base salary, HRA, allowances
- `POST /api/v1/payroll/process` — Run monthly payroll batch
- `POST /api/v1/payroll/:id/mark-paid` — Mark payroll disbursement complete
- `GET /api/v1/payroll/:id/payslip` — Fetch detailed payslip breakdown

### Recruitment Pipeline
- `GET|POST /api/v1/recruitment/jobs` — Job requisitions
- `PATCH /api/v1/recruitment/jobs/:id` — Modify job status
- `GET|POST /api/v1/recruitment/candidates` — Applicant tracking
- `GET|POST /api/v1/recruitment/applications` — Candidate stage tracking
- `PATCH /api/v1/recruitment/applications/:id/status` — Move candidate across stages
- `POST /api/v1/recruitment/interviews` — Schedule interviews

### Performance & Appraisals
- `GET|POST /api/v1/performance/cycles` — Review periods & cycles
- `GET /api/v1/performance/goals/my` — Personal quarterly goals
- `POST /api/v1/performance/goals` — Create KPI goal
- `GET|POST /api/v1/performance/reviews` — Evaluation reviews
- `POST /api/v1/performance/reviews/:id/self-review` — Submit self-assessment
- `POST /api/v1/performance/reviews/:id/manager-review` — Manager assessment
- `POST /api/v1/performance/reviews/:id/finalize` — Complete performance evaluation

### Documents & Policies
- `GET|POST /api/v1/documents/categories` — Document categories
- `GET /api/v1/documents/my` — Employee's verified documents
- `GET /api/v1/documents` — HR compliance & verification queue
- `POST /api/v1/documents` — Multipart document upload
- `GET /api/v1/documents/:id/download` — Download document
- `POST /api/v1/documents/:id/review` — Verify/reject compliance document

### Notifications & Announcements
- `GET /api/v1/notifications/my` — System alerts & reminders
- `POST /api/v1/notifications/:id/read` — Mark notification read
- `POST /api/v1/notifications/read-all` — Clear all notifications
- `GET|POST /api/v1/notifications/announcements` — Company broadcast announcements

### Reports & Analytics
- `GET /api/v1/reports/dashboard` — Live employee counts & attendance rate
- `GET /api/v1/reports/workforce` — Headcount & department distribution
- `GET /api/v1/reports/attendance` — Punctuality & absenteeism analytics
- `GET /api/v1/reports/payroll` — Salary spend & statutory deductions
- `GET /api/v1/reports/recruitment` — Pipeline velocity metrics

---

## Verification & Testing

To run the complete verification suite across both frontend and backend:

```bash
# Frontend build verification
npm run build

# Backend compilation & tests
cd backend
npm run build
npm test
```

---

## Author & Developer

**Sahil Yadav**
- **Designation:** Services, Technical Support & Developer (`CIS-019`)
- **GitHub Profile:** [@sahilyadav-01](https://github.com/sahilyadav-01)
- **GitHub Repository:** [https://github.com/sahilyadav-01/smart-hrms](https://github.com/sahilyadav-01/smart-hrms)
- **Company:** Complete Instrumentation Solutions Pvt Ltd (CISPL)

