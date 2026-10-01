# Smart HRMS

A modern HR management workspace for employee records, attendance, leave, payroll, recruitment, documents, and reporting.

## Run locally

### Frontend

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

The frontend opens on a protected sign-in screen. Use the seeded administrator account when the API is running, or choose **Explore the demo workspace** to preview the interface without a database. Set `VITE_API_URL` when the API is hosted somewhere other than `/api/v1`.

Run the complete production-style stack with Docker using `docker compose up --build`. The web application is exposed at `http://localhost:8080`. Set a strong `JWT_SECRET` before deploying.

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
- `POST /api/v1/auth/refresh` (rotating refresh token)
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

Version 1.1 adds a protected frontend session, real API login/logout, automatic refresh-token rotation, session-expiry handling, and a separate browser-only demo workspace. The full product blueprint lives in `plan.md`.

## Verification

```bash
npm run build
cd backend
npm run build
npm test
```
