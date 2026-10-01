# Smart HRMS

A modern HR management workspace for employee records, attendance, leave, payroll, recruitment, documents, and reporting.

## Run locally

### Frontend

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

### Database and API

```bash
docker compose up -d postgres
cd backend
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

The API runs at `http://localhost:4000`, with health status at `/health` and versioned routes under `/api/v1`.

Demo administrator: `admin@acme.test` / `Admin@123` (development seed only; change this outside local development).

Implemented API routes:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/employees`
- `GET /api/v1/employees/:id`
- `POST /api/v1/employees`
- `PATCH /api/v1/employees/:id`
- `DELETE /api/v1/employees/:id` (soft termination)
- `GET /api/v1/organization`
- `POST /api/v1/organization/departments`
- `POST /api/v1/organization/designations`
- `POST /api/v1/organization/locations`
- `POST /api/v1/attendance/check-in`
- `POST /api/v1/attendance/check-out`
- `GET /api/v1/attendance/my`
- `GET /api/v1/attendance`
- `PATCH /api/v1/attendance/:id`
- `GET /api/v1/leaves/types`
- `GET /api/v1/leaves/balances`
- `GET /api/v1/leaves/my`
- `POST /api/v1/leaves`
- `GET /api/v1/leaves` (manager/HR queue)
- `POST /api/v1/leaves/:id/approve`
- `POST /api/v1/leaves/:id/reject`
- `POST /api/v1/leaves/:id/cancel`
- `GET /api/v1/payroll/my`
- `GET /api/v1/payroll`
- `PUT /api/v1/payroll/salary-structures/:employeeId`
- `POST /api/v1/payroll/process`
- `POST /api/v1/payroll/:id/mark-paid`
- `GET /api/v1/payroll/:id/payslip`
- `GET|POST /api/v1/recruitment/jobs`
- `PATCH /api/v1/recruitment/jobs/:id`
- `GET|POST /api/v1/recruitment/candidates`
- `GET|POST /api/v1/recruitment/applications`
- `PATCH /api/v1/recruitment/applications/:id/status`
- `POST /api/v1/recruitment/interviews`
- `PATCH /api/v1/recruitment/interviews/:id`
- `GET|POST /api/v1/performance/cycles`
- `PATCH /api/v1/performance/cycles/:id`
- `GET /api/v1/performance/goals/my`
- `POST /api/v1/performance/goals`
- `PATCH /api/v1/performance/goals/:id`
- `GET|POST /api/v1/performance/reviews`
- `POST /api/v1/performance/reviews/:id/self-review`
- `POST /api/v1/performance/reviews/:id/manager-review`
- `POST /api/v1/performance/reviews/:id/finalize`
- `GET|POST /api/v1/documents/categories`
- `GET /api/v1/documents/my`
- `GET /api/v1/documents` (HR verification queue)
- `POST /api/v1/documents` (multipart upload)
- `GET /api/v1/documents/:id/download`
- `POST /api/v1/documents/:id/review`
- `DELETE /api/v1/documents/:id`
- `GET /api/v1/notifications/my`
- `POST /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/read-all`
- `POST /api/v1/notifications` (HR targeting)
- `GET|POST /api/v1/notifications/announcements`
- `PATCH|DELETE /api/v1/notifications/announcements/:id`
- `GET /api/v1/reports/dashboard`
- `GET /api/v1/reports/workforce`
- `GET /api/v1/reports/attendance`
- `GET /api/v1/reports/payroll`
- `GET /api/v1/reports/recruitment`

## Current milestone

Version 0.10 includes the complete core HR workflow plus tenant-scoped workforce, attendance, payroll and recruitment analytics, dashboard KPIs, responsive visual reports, and export-ready views. The full product blueprint lives in `plan.md`.
