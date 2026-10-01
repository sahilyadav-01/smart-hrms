export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  RECRUITER: 'RECRUITER',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const EmployeeStatus = {
  ONBOARDING: 'ONBOARDING',
  ACTIVE: 'ACTIVE',
  PROBATION: 'PROBATION',
  CONFIRMED: 'CONFIRMED',
  RESIGNED: 'RESIGNED',
  TERMINATED: 'TERMINATED',
} as const
export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus]

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
} as const
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType]

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  ON_LEAVE: 'ON_LEAVE',
  WORK_FROM_HOME: 'WORK_FROM_HOME',
  HALF_DAY: 'HALF_DAY',
} as const
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus]

export const LeaveStatus = {
  PENDING: 'PENDING',
  MANAGER_APPROVED: 'MANAGER_APPROVED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus]

export const PayrollStatus = {
  DRAFT: 'DRAFT',
  PROCESSED: 'PROCESSED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const
export type PayrollStatus = (typeof PayrollStatus)[keyof typeof PayrollStatus]

export const JobStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
} as const
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

export const ApplicationStatus = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  HIRED: 'HIRED',
} as const
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const InterviewStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus]

export const PerformanceCycleStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  REVIEW: 'REVIEW',
  COMPLETED: 'COMPLETED',
} as const
export type PerformanceCycleStatus = (typeof PerformanceCycleStatus)[keyof typeof PerformanceCycleStatus]

export const GoalStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus]

export const ReviewStatus = {
  PENDING_SELF_REVIEW: 'PENDING_SELF_REVIEW',
  PENDING_MANAGER_REVIEW: 'PENDING_MANAGER_REVIEW',
  PENDING_HR_REVIEW: 'PENDING_HR_REVIEW',
  FINALIZED: 'FINALIZED',
} as const
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus]

export const DocumentStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const
export type DocumentStatus = (typeof DocumentStatus)[keyof typeof DocumentStatus]

export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
} as const
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const AnnouncementAudience = {
  ALL: 'ALL',
  MANAGERS: 'MANAGERS',
  EMPLOYEES: 'EMPLOYEES',
} as const
export type AnnouncementAudience = (typeof AnnouncementAudience)[keyof typeof AnnouncementAudience]
