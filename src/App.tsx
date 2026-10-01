import { useEffect, useState } from 'react'
import {
  Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Clock3, FileText, LayoutGrid, Menu, MoreHorizontal,
  Search, Settings, Sparkles, TrendingUp, UserRoundPlus, Users, X, Upload, Download,
  ShieldCheck, Lock, Building, Sun, PartyPopper, AlertCircle, Eye,
} from 'lucide-react'
import { authService, type AuthUser } from './services/auth.service'
import { api, sessionStore } from './services/api'

type RoleType = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'
type Page = 'Dashboard' | 'People' | 'Attendance' | 'Leave' | 'Payroll' | 'Recruitment' | 'Performance' | 'Documents' | 'Notifications' | 'Reports' | 'Settings'

type Employee = {
  id: string
  code: string
  name: string
  role: string
  dept: string
  status: 'Active' | 'On leave' | 'Remote'
  initials: string
  tone: string
  email: string
  phone: string
  joiningDate: string
  manager: string
  salary: string
}

function mapBackendEmployee(be: any): Employee {
  const name = `${be.firstName || ''} ${be.lastName || ''}`.trim() || 'Employee'
  const initials = `${be.firstName?.[0] || ''}${be.lastName?.[0] || ''}`.toUpperCase() || 'EM'
  const tones = ['violet', 'blue', 'green', 'orange', 'pink']
  const tone = tones[Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % tones.length]
  const statusMap: Record<string, 'Active' | 'On leave' | 'Remote'> = {
    ACTIVE: 'Active',
    CONFIRMED: 'Active',
    PROBATION: 'Active',
    ONBOARDING: 'Active',
    RESIGNED: 'On leave',
    TERMINATED: 'On leave',
  }
  return {
    id: be.id,
    code: be.employeeCode || `EMP-${be.id.slice(0, 4)}`,
    name,
    role: be.designation?.title || 'Team Member',
    dept: be.department?.name || 'Engineering',
    status: statusMap[be.status] || 'Active',
    initials,
    tone,
    email: be.email,
    phone: be.phone || '+91 98765 00000',
    joiningDate: be.joiningDate ? new Date(be.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2024',
    manager: be.manager ? `${be.manager.firstName} ${be.manager.lastName}` : 'Leadership Team',
    salary: '₹1,25,000 / mo',
  }
}

type LeaveReq = {
  id: string
  employeeName: string
  leaveType: string
  dates: string
  days: string
  status: 'Pending' | 'Approved' | 'Rejected'
  reason: string
}

const initialEmployees: Employee[] = [
  { id: '1', code: 'EMP-1001', name: 'Sahil Kumar', role: 'Senior Product Designer', dept: 'Design', status: 'Active', initials: 'SK', tone: 'violet', email: 'sahil.kumar@acme.test', phone: '+91 98765 43210', joiningDate: '12 Jan 2024', manager: 'Arjun Mehta', salary: '₹1,25,000 / mo' },
  { id: '2', code: 'EMP-1002', name: 'Maya Patel', role: 'Staff UI Designer', dept: 'Design', status: 'Active', initials: 'MP', tone: 'violet', email: 'maya.patel@acme.test', phone: '+91 98765 43211', joiningDate: '18 Mar 2024', manager: 'Sahil Kumar', salary: '₹1,10,000 / mo' },
  { id: '3', code: 'EMP-1003', name: 'Arjun Mehta', role: 'Engineering Lead', dept: 'Engineering', status: 'Active', initials: 'AM', tone: 'blue', email: 'arjun.mehta@acme.test', phone: '+91 98765 43212', joiningDate: '01 Nov 2023', manager: 'Executive Team', salary: '₹1,80,000 / mo' },
  { id: '4', code: 'EMP-1004', name: 'Nisha Kapoor', role: 'HR Operations Lead', dept: 'People', status: 'On leave', initials: 'NK', tone: 'orange', email: 'nisha.kapoor@acme.test', phone: '+91 98765 43213', joiningDate: '15 Feb 2024', manager: 'Executive Team', salary: '₹95,000 / mo' },
  { id: '5', code: 'EMP-1005', name: 'Dev Sharma', role: 'Growth Marketing Manager', dept: 'Marketing', status: 'Active', initials: 'DS', tone: 'green', email: 'dev.sharma@acme.test', phone: '+91 98765 43214', joiningDate: '05 May 2024', manager: 'Executive Team', salary: '₹1,15,000 / mo' },
  { id: '6', code: 'EMP-1006', name: 'Sara Ali', role: 'Financial Analyst', dept: 'Finance', status: 'Remote', initials: 'SA', tone: 'pink', email: 'sara.ali@acme.test', phone: '+91 98765 43215', joiningDate: '20 Jun 2024', manager: 'Finance Director', salary: '₹88,000 / mo' },
]

const upcomingHolidays = [
  { name: 'Diwali & Deepavali', date: 'Fri, 8 Nov 2026', days: '2 days off', tag: 'Festival' },
  { name: 'Guru Nanak Jayanti', date: 'Fri, 27 Nov 2026', days: 'Long weekend', tag: 'Gazetted' },
  { name: 'Christmas Day', date: 'Fri, 25 Dec 2026', days: 'Year-end', tag: 'Holiday' },
]

const navItems: { label: Page; icon: typeof LayoutGrid }[] = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'People', icon: Users },
  { label: 'Attendance', icon: Clock3 },
  { label: 'Leave', icon: CalendarDays },
  { label: 'Payroll', icon: CircleDollarSign },
  { label: 'Recruitment', icon: BriefcaseBusiness },
  { label: 'Performance', icon: TrendingUp },
  { label: 'Documents', icon: FileText },
]

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => authService.current())
  const [activeRole, setActiveRole] = useState<RoleType>(() => (authService.current()?.role as RoleType) || 'HR_ADMIN')
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    employees: number
    present: number
    onLeave: number
    absent: number
    pendingLeaves: number
    attendanceRate: number
  } | null>(null)
  const [page, setPage] = useState<Page>('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [openAddEmployee, setOpenAddEmployee] = useState(false)

  // Global attendance state for today
  const [checkedIn, setCheckedIn] = useState(true)
  const [checkedOut, setCheckedOut] = useState(false)
  const [checkInTime, setCheckInTime] = useState('09:28 AM')
  const [checkOutTime, setCheckOutTime] = useState('—')
  const [workingSeconds, setWorkingSeconds] = useState(14520) // approx 4h 2m

  // Live seconds ticker
  useEffect(() => {
    if (!checkedIn || checkedOut) return
    const timer = setInterval(() => setWorkingSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [checkedIn, checkedOut])

  // Leave requests state with approvals
  const [leaveRequests, setLeaveRequests] = useState<LeaveReq[]>([
    { id: 'LR-1', employeeName: 'Nisha Kapoor', leaveType: 'Casual Leave', dates: '12 Oct – 13 Oct', days: '2 days', status: 'Pending', reason: 'Family engagement out of town.' },
    { id: 'LR-2', employeeName: 'Maya Patel', leaveType: 'Sick Leave', dates: '14 Sep', days: '1 day', status: 'Approved', reason: 'Medical appointment.' },
    { id: 'LR-3', employeeName: 'Dev Sharma', leaveType: 'Earned Leave', dates: '3 Aug – 7 Aug', days: '5 days', status: 'Approved', reason: 'Annual vacation.' },
    { id: 'LR-4', employeeName: 'Sara Ali', leaveType: 'Work from home', dates: '19 Oct', days: '1 day', status: 'Pending', reason: 'Internet maintenance at home.' },
  ])

  // Synchronize real data from SQLite backend API
  useEffect(() => {
    if (!user) return
    const session = sessionStore.get()
    if (!session?.token) return

    // 1. Fetch real employees
    api<{ data: any[]; total: number }>('/employees')
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setEmployees(res.data.map(mapBackendEmployee))
          setIsBackendConnected(true)
        }
      })
      .catch(() => {})

    // 2. Fetch real leave requests
    const isHrOrManager = ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'MANAGER'].includes(user.role)
    const leaveEndpoint = isHrOrManager ? '/leaves' : '/leaves/my'
    api<{ data: any[]; total: number }>(leaveEndpoint)
      .then(res => {
        if (res?.data && res.data.length > 0) {
          const mapped: LeaveReq[] = res.data.map((l: any) => {
            const start = new Date(l.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            const end = new Date(l.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
            return {
              id: l.id,
              employeeName: l.employee ? `${l.employee.firstName} ${l.employee.lastName}` : (user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : 'Employee'),
              leaveType: l.leaveType?.name || 'Leave',
              dates: start === end ? start : `${start} – ${end}`,
              days: `${l.days} ${l.days === 1 ? 'day' : 'days'}`,
              status: l.status === 'APPROVED' ? 'Approved' : l.status === 'REJECTED' ? 'Rejected' : 'Pending',
              reason: l.reason,
            }
          })
          setLeaveRequests(mapped)
          setIsBackendConnected(true)
        }
      })
      .catch(() => {})

    // 3. Fetch real reports dashboard metrics
    api<any>('/reports/dashboard')
      .then(stats => {
        if (stats && typeof stats.employees === 'number') {
          setDashboardMetrics(stats)
          setIsBackendConnected(true)
        }
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener('session-expired', expire)
    return () => window.removeEventListener('session-expired', expire)
  }, [])

  if (!user) return <LoginPage onLogin={u => { setUser(u); setActiveRole((u.role as RoleType) || 'HR_ADMIN') }} />

  const signOut = async () => {
    await authService.logout()
    setUser(null)
  }

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handlePunchIn = async () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    try {
      await api('/attendance/check-in', { method: 'POST', body: JSON.stringify({ notes: 'Web clock punch in' }) })
      setIsBackendConnected(true)
    } catch {
      // Offline fallback
    }
    setCheckedIn(true)
    setCheckedOut(false)
    setCheckInTime(timeStr)
    setCheckOutTime('—')
    setWorkingSeconds(0)
  }

  const handlePunchOut = async () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    try {
      await api('/attendance/check-out', { method: 'POST', body: JSON.stringify({ notes: 'Web clock punch out' }) })
      setIsBackendConnected(true)
    } catch {
      // Offline fallback
    }
    setCheckedOut(true)
    setCheckOutTime(timeStr)
  }

  const handleApproveLeave = async (id: string) => {
    try {
      if (!id.startsWith('LR-')) {
        await api(`/leaves/${id}/approve`, { method: 'POST', body: JSON.stringify({ note: 'Approved via HR Dashboard' }) })
        setIsBackendConnected(true)
      }
    } catch {
      // Fallback
    }
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r))
  }

  const handleRejectLeave = async (id: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r))
  }

  const handleAddEmployee = async (emp: Employee) => {
    setEmployees(prev => [emp, ...prev])
    try {
      const names = emp.name.split(' ')
      await api('/employees', {
        method: 'POST',
        body: JSON.stringify({
          employeeCode: emp.code,
          firstName: names[0] || emp.name,
          lastName: names.slice(1).join(' ') || 'Employee',
          email: emp.email,
          phone: emp.phone,
          joiningDate: new Date(),
          employmentType: 'FULL_TIME',
          status: 'ACTIVE',
        }),
      })
      setIsBackendConnected(true)
    } catch {
      // Optimistic fallback
    }
  }

  const currentUserName = user?.employee
    ? `${user.employee.firstName} ${user.employee.lastName}`
    : (user?.email ? user.email.split('@')[0] : 'Sahil Kumar')
  const currentUserInitials = user?.employee
    ? `${user.employee.firstName?.[0] || ''}${user.employee.lastName?.[0] || ''}`.toUpperCase()
    : 'EM'

  const roleNameMap: Record<RoleType, string> = {
    SUPER_ADMIN: '👑 Super Admin',
    HR_ADMIN: '🧑‍💼 HR Admin',
    MANAGER: '👨‍💼 Manager',
    EMPLOYEE: `👤 Employee (${user?.employee?.firstName || 'Sahil'})`,
  }

  const allowedNavs: Page[] = activeRole === 'EMPLOYEE'
    ? ['Dashboard', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Documents', 'Notifications']
    : activeRole === 'MANAGER'
      ? ['Dashboard', 'People', 'Attendance', 'Leave', 'Performance', 'Documents', 'Notifications']
      : ['Dashboard', 'People', 'Attendance', 'Leave', 'Payroll', 'Recruitment', 'Performance', 'Documents', 'Notifications']

  const visibleNavItems = navItems.filter(item => allowedNavs.includes(item.label))
  const canSeeManage = ['SUPER_ADMIN', 'HR_ADMIN'].includes(activeRole)

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>peoplely</span>
        </div>
        <button className="close-nav" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        <div className="workspace">
          <div className="company-avatar">A</div>
          <div>
            <strong>Acme Studio</strong>
            <small>{roleNameMap[activeRole]}</small>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav>
          <p className="nav-label">WORKSPACE</p>
          {visibleNavItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={page === label ? 'active' : ''}
              onClick={() => { setPage(label); setMobileOpen(false) }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === 'Leave' && leaveRequests.filter(l => l.status === 'Pending').length > 0 && (
                <em>{leaveRequests.filter(l => l.status === 'Pending').length}</em>
              )}
            </button>
          ))}
          {canSeeManage && (
            <>
              <p className="nav-label nav-spacer">MANAGE</p>
              <button
                className={page === 'Reports' ? 'active' : ''}
                onClick={() => { setPage('Reports'); setMobileOpen(false) }}
              >
                <TrendingUp size={19} />
                <span>Reports</span>
              </button>
              <button
                className={page === 'Settings' ? 'active' : ''}
                onClick={() => { setPage('Settings'); setMobileOpen(false) }}
              >
                <Settings size={19} />
                <span>Settings</span>
              </button>
            </>
          )}
        </nav>

        <button className="profile" onClick={signOut} title="Sign out">
          <div className="avatar avatar-dark">{currentUserInitials}</div>
          <div>
            <strong>{currentUserName}</strong>
            <small>{activeRole.replaceAll('_', ' ')} · Sign out</small>
          </div>
          <MoreHorizontal size={18} />
        </button>
      </aside>
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      {/* Main Content Area */}
      <main>
        <header>
          <button className="menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="search">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team members, documents, leaves..."
            />
            <kbd>⌘ K</kbd>
          </div>

          <div className="header-actions">
            {/* Live Backend Connection Indicator */}
            <div className="connection-badge" title="Live SQLite Backend & API">
              <span className={`pulse-dot ${isBackendConnected ? 'live' : 'demo'}`} />
              <span>{isBackendConnected ? 'Real App (Live SQLite)' : 'Demo Mode'}</span>
            </div>

            {/* Dynamic Role Switcher Pill */}
            <div className="role-badge" title="Switch viewpoint">
              <span>View:</span>
              <select
                value={activeRole}
                onChange={e => setActiveRole(e.target.value as RoleType)}
              >
                <option value="SUPER_ADMIN">👑 Super Admin (Master)</option>
                <option value="HR_ADMIN">🧑‍💼 HR Admin (People Ops)</option>
                <option value="MANAGER">👨‍💼 Manager (Team Hub)</option>
                <option value="EMPLOYEE">👤 Employee (Personal)</option>
              </select>
            </div>

            <button className="icon-btn" onClick={() => setPage('Notifications')} aria-label="Notifications">
              <Bell size={19} /><i />
            </button>
            <button className="help" aria-label="Help">?</button>
          </div>
        </header>

        <div className="content">
          {page === 'Dashboard' ? (
            activeRole === 'SUPER_ADMIN' ? (
              <SuperAdminDashboard
                employees={employees}
                leaveRequests={leaveRequests}
                dashboardMetrics={dashboardMetrics}
                onNavigate={p => setPage(p)}
              />
            ) : activeRole === 'HR_ADMIN' ? (
              <HrDashboard
                employees={employees}
                leaveRequests={leaveRequests}
                onApproveLeave={handleApproveLeave}
                onRejectLeave={handleRejectLeave}
                onAddEmployee={() => { setPage('People'); setOpenAddEmployee(true) }}
                onSelectEmployee={emp => setSelectedEmployee(emp)}
                dashboardMetrics={dashboardMetrics}
              />
            ) : activeRole === 'MANAGER' ? (
              <ManagerDashboard
                employees={employees}
                leaveRequests={leaveRequests}
                onApproveLeave={handleApproveLeave}
                onRejectLeave={handleRejectLeave}
                onSelectEmployee={emp => setSelectedEmployee(emp)}
                onNavigate={p => setPage(p)}
              />
            ) : (
              <EmployeeHomeScreen
                user={user}
                checkedIn={checkedIn}
                checkedOut={checkedOut}
                checkInTime={checkInTime}
                checkOutTime={checkOutTime}
                workingSeconds={workingSeconds}
                formatSeconds={formatSeconds}
                onPunchIn={handlePunchIn}
                onPunchOut={handlePunchOut}
                onNavigate={p => setPage(p)}
              />
            )
          ) : (
            <ModulePage
              page={page}
              search={search}
              employees={employees}
              onAddEmployee={handleAddEmployee}
              openAddEmployee={openAddEmployee}
              setOpenAddEmployee={setOpenAddEmployee}
              onSelectEmployee={emp => setSelectedEmployee(emp)}
              leaveRequests={leaveRequests}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
              onApplyLeave={req => setLeaveRequests(p => [req, ...p])}
              checkedIn={checkedIn}
              checkedOut={checkedOut}
              checkInTime={checkInTime}
              checkOutTime={checkOutTime}
              onPunchIn={handlePunchIn}
              onPunchOut={handlePunchOut}
              isEmployeeView={activeRole === 'EMPLOYEE'}
            />
          )}
        </div>
      </main>

      {/* Employee Profile Details Drawer */}
      {selectedEmployee && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedEmployee(null)}>
          <div className="profile-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>EMPLOYEE RECORD</p>
                <h2>{selectedEmployee.code}</h2>
              </div>
              <button type="button" onClick={() => setSelectedEmployee(null)} aria-label="Close profile"><X size={19} /></button>
            </div>

            <div className="profile-hero">
              <div className={`avatar ${selectedEmployee.tone}`}>{selectedEmployee.initials}</div>
              <div>
                <h2>{selectedEmployee.name}</h2>
                <p>{selectedEmployee.role} · <strong>{selectedEmployee.dept}</strong></p>
              </div>
              <span className={`status ${selectedEmployee.status.toLowerCase().replace(' ', '-')}`} style={{ marginLeft: 'auto' }}>
                <i />{selectedEmployee.status}
              </span>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-box">
                <span>WORK EMAIL</span>
                <strong>{selectedEmployee.email}</strong>
              </div>
              <div className="profile-detail-box">
                <span>CONTACT PHONE</span>
                <strong>{selectedEmployee.phone}</strong>
              </div>
              <div className="profile-detail-box">
                <span>JOINING DATE</span>
                <strong>{selectedEmployee.joiningDate}</strong>
              </div>
              <div className="profile-detail-box">
                <span>REPORTING MANAGER</span>
                <strong>{selectedEmployee.manager}</strong>
              </div>
              <div className="profile-detail-box">
                <span>MONTHLY COMPENSATION</span>
                <strong>{selectedEmployee.salary}</strong>
              </div>
              <div className="profile-detail-box">
                <span>LOCATION & WORK TYPE</span>
                <strong>Bangalore, IN · Full-time</strong>
              </div>
            </div>

            <h3 style={{ font: '700 13px Manrope', margin: '20px 0 10px' }}>Verified Employee Documents</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Document</th><th>Status</th></tr>
                </thead>
                <tbody>
                  <tr><td>Employment Contract</td><td><span className="status approved"><i />Verified</span></td></tr>
                  <tr><td>PAN / Tax Identification</td><td><span className="status approved"><i />Verified</span></td></tr>
                  <tr><td>Academic Degree Certificate</td><td><span className="status pending"><i />Under Review</span></td></tr>
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button type="button" onClick={() => setSelectedEmployee(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   1. EMPLOYEE HOME SCREEN
   ========================================================================== */
function EmployeeHomeScreen({
  user, checkedIn, checkedOut, checkInTime, checkOutTime, workingSeconds, formatSeconds,
  onPunchIn, onPunchOut, onNavigate,
}: {
  user?: AuthUser | null
  checkedIn: boolean
  checkedOut: boolean
  checkInTime: string
  checkOutTime: string
  workingSeconds: number
  formatSeconds: (s: number) => string
  onPunchIn: () => void
  onPunchOut: () => void
  onNavigate: (p: Page) => void
}) {
  const firstName = user?.employee?.firstName || (user?.email ? user.email.split('@')[0] : 'Team Member')

  return (
    <>
      <section className="welcome">
        <div>
          <p>THURSDAY, 1 OCTOBER 2026</p>
          <h1>Good morning, {firstName} <span>👋</span></h1>
          <h2>Here is your personal workday overview, time tracking, and leave status.</h2>
        </div>
        <button className="primary" onClick={() => onNavigate('Leave')}>
          <CalendarDays size={18} /> Apply for leave
        </button>
      </section>

      {/* Twin Cards matching ASCII vision */}
      <div className="twin-cards">
        <div
          className="twin-card action"
          onClick={checkedIn && !checkedOut ? onPunchOut : onPunchIn}
          title="Click to check in or out"
        >
          <p>ATTENDANCE ACTION</p>
          <strong>{checkedOut ? 'DAY COMPLETED' : checkedIn ? 'CHECK OUT' : 'CHECK IN'}</strong>
          <span><i />{checkedOut ? 'Shift Done' : checkedIn ? '🟢 Working' : 'Tap to start shift'}</span>
        </div>
        <div className="twin-card">
          <p>CURRENT TIME & STATUS</p>
          <strong>{checkedIn ? checkInTime : '09:00 AM'}</strong>
          <span className={checkedIn && !checkedOut ? '' : 'waiting'}>
            <i />{checkedOut ? 'Completed' : checkedIn ? '🟢 Working' : 'Standard shift'}
          </span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <section className="quick-actions">
        <button className="quick-action-btn" onClick={() => onNavigate('Leave')}>
          <span><CalendarDays size={18} /></span>
          <div>Request Time Off <small style={{ display: 'block', color: '#9a97a3', fontWeight: 400 }}>Casual, Sick & WFH</small></div>
        </button>
        <button className="quick-action-btn" onClick={() => onNavigate('Payroll')}>
          <span><CircleDollarSign size={18} /></span>
          <div>View Latest Payslip <small style={{ display: 'block', color: '#9a97a3', fontWeight: 400 }}>September 2026</small></div>
        </button>
        <button className="quick-action-btn" onClick={() => onNavigate('Performance')}>
          <span><TrendingUp size={18} /></span>
          <div>My H2 Goals <small style={{ display: 'block', color: '#9a97a3', fontWeight: 400 }}>3 active objectives</small></div>
        </button>
      </section>

      {/* Hero Attendance Punch & Today's Attendance breakdown */}
      <section className="employee-grid">
        <div className="punch-hero">
          <div className="punch-hero-top">
            <div>
              <small>Today's Shift · 9:00 AM – 6:00 PM</small>
              <h2>{checkedOut ? 'Day completed' : checkedIn ? 'Currently working' : 'Ready to begin your day?'}</h2>
            </div>
            <div className={`status-pill ${checkedIn && !checkedOut ? 'working' : ''}`}>
              <i style={{ width: 7, height: 7, borderRadius: '50%', background: checkedOut ? '#fff' : checkedIn ? '#45eb9d' : '#e06070', display: 'inline-block' }} />
              {checkedOut ? 'Checked Out' : checkedIn ? 'Working' : 'Not Started'}
            </div>
          </div>

          <div className="punch-hero-body">
            <strong>{formatSeconds(workingSeconds)}</strong>
            <span>{checkedIn && !checkedOut ? 'Live working hours logged today' : 'Total duration today'}</span>
          </div>

          <div className="punch-actions">
            {!checkedIn ? (
              <button className="punch-btn in" onClick={onPunchIn}>
                <Clock3 size={18} /> Check In Now
              </button>
            ) : !checkedOut ? (
              <button className="punch-btn out" onClick={onPunchOut}>
                <Check size={18} /> Check Out for the Day
              </button>
            ) : (
              <button className="punch-btn out" disabled>
                Shift Completed
              </button>
            )}
          </div>
        </div>

        {/* Today's Log Card */}
        <div className="card today-log">
          <CardHead title="Today's Attendance" sub="1 October 2026 · Standard Shift" action="Full log" onAction={() => onNavigate('Attendance')} />
          <div className="today-log-row">
            <span><Sun size={16} /> Check In</span>
            <strong>{checkInTime}</strong>
          </div>
          <div className="today-log-row">
            <span><Clock3 size={16} /> Check Out</span>
            <strong>{checkOutTime}</strong>
          </div>
          <div className="today-log-row">
            <span><TrendingUp size={16} /> Working</span>
            <strong>{Math.floor(workingSeconds / 3600)}h {Math.floor((workingSeconds % 3600) / 60)}m</strong>
          </div>
          <div className="today-log-row">
            <span><ShieldCheck size={16} /> Shift Status</span>
            <span className="status approved"><i />On time</span>
          </div>
        </div>
      </section>

      {/* Leave Balances Grid */}
      <h3 style={{ font: '800 16px Manrope', margin: '26px 0 14px' }}>Leave Balance</h3>
      <section className="leave-balances">
        <div className="card balance-card">
          <span className="balance-icon purple"><CalendarDays size={18} /></span>
          <div><p>Casual Leave</p><strong>8 Days</strong><small> of 12 days</small></div>
          <div className="balance-track"><i style={{ width: '66%' }} /></div>
        </div>
        <div className="card balance-card">
          <span className="balance-icon green"><CalendarDays size={18} /></span>
          <div><p>Sick Leave</p><strong>5 Days</strong><small> of 10 days</small></div>
          <div className="balance-track"><i style={{ width: '50%' }} /></div>
        </div>
        <div className="card balance-card">
          <span className="balance-icon blue"><CalendarDays size={18} /></span>
          <div><p>Earned Leave</p><strong>14 Days</strong><small> of 18 days</small></div>
          <div className="balance-track"><i style={{ width: '77%' }} /></div>
        </div>
        <div className="card balance-card">
          <span className="balance-icon orange"><CalendarDays size={18} /></span>
          <div><p>Work from Home</p><strong>20 Days</strong><small> of 24 days</small></div>
          <div className="balance-track"><i style={{ width: '83%' }} /></div>
        </div>
      </section>

      {/* Upcoming Holidays Section */}
      <section className="card holiday-card" style={{ marginTop: '20px' }}>
        <CardHead title="Upcoming Holidays" sub="Official 2026 Calendar" action="Full schedule" />
        {upcomingHolidays.map(h => (
          <article key={h.name}>
            <div>
              <strong>{h.name}</strong>
              <small>{h.date}</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="holiday-badge">{h.days}</span>
              <PartyPopper size={16} color="#c07328" />
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

/* ==========================================================================
   2A. SUPER ADMIN DASHBOARD
   ========================================================================== */
function SuperAdminDashboard({
  employees, leaveRequests, dashboardMetrics, onNavigate,
}: {
  employees: Employee[]
  leaveRequests: LeaveReq[]
  dashboardMetrics?: {
    employees: number
    present: number
    onLeave: number
    absent: number
    pendingLeaves: number
    attendanceRate: number
  } | null
  onNavigate: (p: Page) => void
}) {
  const totalEmployees = dashboardMetrics ? dashboardMetrics.employees : (employees.length || 7)

  const auditEvents = [
    { time: '14:25:06', user: 'admin@acme.test', action: 'POST /leaves/approve', tag: 'write', label: 'Leave Approved' },
    { time: '14:24:55', user: 'admin@acme.test', action: 'POST /employees', tag: 'write', label: 'Employee Created' },
    { time: '14:19:15', user: 'admin@acme.test', action: 'POST /auth/login', tag: 'auth', label: 'JWT Token Issued' },
    { time: '14:17:41', user: 'SYSTEM', action: 'PRISMA_SEED', tag: 'security', label: 'SQLite DB Initialized' },
    { time: '09:28:00', user: 'sahil@acme.test', action: 'POST /attendance/check-in', tag: 'auth', label: 'Biometric Clock Punch' },
  ]

  const departments = [
    { name: 'Engineering', count: 84, lead: 'Vikram Malhotra', budget: '₹12.4M', status: 'Healthy' },
    { name: 'People & HR', count: 20, lead: 'Priya Sharma', budget: '₹3.2M', status: 'Healthy' },
    { name: 'Design', count: 31, lead: 'Ananya Iyer', budget: '₹4.8M', status: 'Healthy' },
    { name: 'Sales & Growth', count: 58, lead: 'Dev Sharma', budget: '₹8.6M', status: 'Healthy' },
    { name: 'Finance & Ops', count: 55, lead: 'Sara Ali', budget: '₹6.1M', status: 'Healthy' },
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>ENTERPRISE CONTROL & GOVERNANCE</p>
          <h1>Executive Super Admin Center</h1>
          <h2>System telemetry, organization architecture, security compliance, and audit log.</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="primary" onClick={() => onNavigate('Settings')}><Settings size={18} /> System Settings</button>
          <button className="quick-action-btn" style={{ height: 40 }} onClick={() => onNavigate('Reports')}><TrendingUp size={18} /> Analytics</button>
        </div>
      </section>

      {/* Super Admin Executive KPIs */}
      <section className="stats-grid four-cols">
        <Stat icon={Users} label="Total Accounts" value={`${totalEmployees} Active`} delta="6 Departments · 2 Hubs" tone="purple" />
        <Stat icon={ShieldCheck} label="System Security" value="100%" delta="2FA active · JWT 8h" tone="green" />
        <Stat icon={CircleDollarSign} label="Monthly Payroll" value="₹9,15,000" delta="Processed for Q3" tone="blue" />
        <Stat icon={Clock3} label="Engine & Uptime" value="SQLite Live" delta="99.98% Local SLA" tone="teal" />
      </section>

      {/* Organization Departments Governance & Live Security Audit Feed */}
      <div className="dash-row">
        <section className="card">
          <CardHead title="Department Allocation & Capacity" sub="Enterprise resource units" action="Manage structure" onAction={() => onNavigate('Settings')} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Department</th><th>Lead</th><th>Headcount</th><th>Budget</th><th>Status</th></tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.name}>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.lead}</td>
                    <td><b>{d.count}</b> members</td>
                    <td>{d.budget}</td>
                    <td><span className="status approved"><i />{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <CardHead title="Real-Time System Audit Log" sub="Immutable SQLite events" action="Full audit" onAction={() => onNavigate('Reports')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {auditEvents.map((evt, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fcfbfe', border: '1px solid #eeebf6', borderRadius: 8, fontSize: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span className={`audit-tag ${evt.tag}`}>{evt.tag.toUpperCase()}</span>
                    <strong>{evt.label}</strong>
                  </div>
                  <small style={{ color: '#888' }}>{evt.action} by <code>{evt.user}</code></small>
                </div>
                <code style={{ fontSize: 11, color: '#777' }}>{evt.time}</code>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

/* ==========================================================================
   2B. MANAGER DASHBOARD
   ========================================================================== */
function ManagerDashboard({
  employees, leaveRequests, onApproveLeave, onRejectLeave, onSelectEmployee, onNavigate,
}: {
  employees: Employee[]
  leaveRequests: LeaveReq[]
  onApproveLeave: (id: string) => void
  onRejectLeave: (id: string) => void
  onSelectEmployee: (emp: Employee) => void
  onNavigate: (p: Page) => void
}) {
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending')
  // Team members reporting to this department / lead
  const teamMembers = employees.filter(e => e.dept === 'Engineering' || e.dept === 'Design')

  return (
    <>
      <section className="welcome">
        <div>
          <p>ENGINEERING & DESIGN TEAM HUB</p>
          <h1>Manager Overview: Vikram Malhotra</h1>
          <h2>Track your team's shift presence, review time-off requests, and guide sprint performance.</h2>
        </div>
        <button className="primary" onClick={() => onNavigate('People')}><Users size={18} /> View team roster</button>
      </section>

      {/* Manager Team KPIs */}
      <section className="stats-grid four-cols">
        <Stat icon={Users} label="My Team Roster" value={`${teamMembers.length} Members`} delta="Engineering & Design" tone="purple" />
        <Stat icon={Clock3} label="Team Present" value={`${Math.max(1, teamMembers.length - 1)} Active`} delta="87.5% shift coverage" tone="green" />
        <Stat icon={CalendarDays} label="On Leave / WFH" value="1 Absent" delta="1 Sick leave requested" tone="orange" />
        <Stat icon={AlertCircle} label="Team Approvals" value={String(pendingLeaves.length)} delta="Pending review" tone="blue" />
      </section>

      {/* Team Presence Radar & Leave Approvals Queue */}
      <div className="dash-row">
        <section className="card">
          <CardHead title="Direct Reports · Shift Presence" sub="Live workplace status today" action="Team roster" onAction={() => onNavigate('People')} />
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Role</th><th>Shift Status</th><th>Punch Time</th></tr>
              </thead>
              <tbody>
                {teamMembers.slice(0, 5).map((m, idx) => (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => onSelectEmployee(m)}>
                    <td>
                      <div className="user-cell">
                        <span className={`avatar ${m.tone}`}>{m.initials}</span>
                        <div><strong>{m.name}</strong><small>{m.email}</small></div>
                      </div>
                    </td>
                    <td>{m.role}</td>
                    <td>
                      <span className={`status ${idx === 1 ? 'on-leave' : idx === 2 ? 'remote' : 'active'}`}>
                        <i />{idx === 1 ? 'On Leave' : idx === 2 ? 'Remote / WFH' : 'In Office'}
                      </span>
                    </td>
                    <td><small>{idx === 1 ? '—' : idx === 2 ? '09:40 AM' : '09:28 AM'}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pending Team Requests for Manager */}
        <section className="card">
          <CardHead
            title={`Team Leave Requests (${pendingLeaves.length})`}
            sub="Review applications from your team"
            action="All leave"
            onAction={() => onNavigate('Leave')}
          />
          {pendingLeaves.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employee</th><th>Type</th><th>Duration</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {pendingLeaves.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.employeeName}</strong></td>
                      <td>{r.leaveType}</td>
                      <td><small>{r.days}</small></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="primary"
                            style={{ height: 28, padding: '0 8px', fontSize: 11 }}
                            onClick={() => onApproveLeave(r.id)}
                          >
                            Approve
                          </button>
                          <button
                            style={{ height: 28, padding: '0 8px', fontSize: 11, background: '#f5f4f8', border: '1px solid #dcd9e8', borderRadius: 6 }}
                            onClick={() => onRejectLeave(r.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ padding: '24px 16px', color: '#888', textAlign: 'center' }}>All team requests have been resolved! 🎉</p>
          )}
        </section>
      </div>
    </>
  )
}

/* ==========================================================================
   2C. HR DASHBOARD
   ========================================================================== */
function HrDashboard({
  employees, leaveRequests, onApproveLeave, onRejectLeave, onAddEmployee, onSelectEmployee, dashboardMetrics,
}: {
  employees: Employee[]
  leaveRequests: LeaveReq[]
  onApproveLeave: (id: string) => void
  onRejectLeave: (id: string) => void
  onAddEmployee: () => void
  onSelectEmployee: (emp: Employee) => void
  dashboardMetrics?: {
    employees: number
    present: number
    onLeave: number
    absent: number
    pendingLeaves: number
    attendanceRate: number
  } | null
}) {
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending')

  const employeeCount = dashboardMetrics ? String(dashboardMetrics.employees) : (employees.length ? String(employees.length) : '248')
  const presentCount = dashboardMetrics ? String(dashboardMetrics.present) : '231'
  const onLeaveCount = dashboardMetrics ? String(dashboardMetrics.onLeave) : '12'
  const absentCount = dashboardMetrics ? String(dashboardMetrics.absent) : '5'
  const pendingLeavesCount = String(pendingLeaves.length || (dashboardMetrics ? dashboardMetrics.pendingLeaves : 7))
  const attendanceRate = dashboardMetrics ? `${dashboardMetrics.attendanceRate}% present` : '93.1% present'

  const departments = [
    ['Engineering', 84, 34],
    ['Sales', 58, 23],
    ['Operations', 43, 17],
    ['Design', 31, 13],
    ['People', 20, 8],
    ['Finance', 12, 5],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>HR EXECUTIVE OVERVIEW</p>
          <h1>People Operations Dashboard</h1>
          <h2>Workforce metrics, pending approvals, and daily attendance health.</h2>
        </div>
        <button className="primary" onClick={onAddEmployee}><UserRoundPlus size={18} /> Add employee</button>
      </section>

      {/* High-level HR KPI metrics - Exact 5 metrics requested */}
      <section className="stats-grid five-cols">
        <Stat icon={Users} label="Employees" value={employeeCount} delta="+12 this month" tone="purple" />
        <Stat icon={Clock3} label="Present" value={presentCount} delta={attendanceRate} tone="green" />
        <Stat icon={CalendarDays} label="On Leave" value={onLeaveCount} delta="Approved absence" tone="orange" />
        <Stat icon={AlertCircle} label="Absent" value={absentCount} delta="Unscheduled" tone="pink" />
        <Stat icon={CalendarDays} label="Pending Leaves" value={pendingLeavesCount} delta="Requires review" tone="blue" />
      </section>

      {/* Pending Leave Approvals Queue */}
      {pendingLeaves.length > 0 && (
        <section className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #6d5bd0' }}>
          <CardHead
            title={`Pending Leave Requests (${pendingLeaves.length})`}
            sub="Review and approve employee applications"
            action="All requests"
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.employeeName}</strong></td>
                    <td>{req.leaveType}</td>
                    <td>{req.dates} ({req.days})</td>
                    <td><small style={{ color: '#777' }}>{req.reason}</small></td>
                    <td>
                      <button className="btn-approve" onClick={() => onApproveLeave(req.id)}>Approve</button>
                      <button className="btn-reject" onClick={() => onRejectLeave(req.id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Attendance Chart & Department Statistics */}
      <section className="dashboard-grid">
        <div className="card chart-card">
          <CardHead title="Attendance Chart" sub="Daily presence across all departments" action="This week" />
          <div className="legend">
            <span><i className="dot purple-dot" />Present</span>
            <span><i className="dot pale-dot" />Away / Remote</span>
          </div>
          <div className="chart">
            {[['Mon', 88], ['Tue', 93], ['Wed', 81], ['Thu', 95], ['Fri', 72], ['Sat', 28], ['Sun', 15]].map(([day, val]) => (
              <div className="bar-col" key={day}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${val}%` }} />
                </div>
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card dept-chart">
          <CardHead title="Department Statistics" sub="Workforce distribution" action="248 total" />
          <div className="dept-list">
            {departments.map(([name, count, pct]) => (
              <div key={name}>
                <span>{name}<b>{count} ({pct}%)</b></span>
                <div><i style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Status & Payroll Summary Grid */}
      <section className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <CardHead title="Recruitment Status" sub="Current talent acquisition funnel" action="8 open roles" />
          <div className="funnel-bars" style={{ padding: 0 }}>
            {[['Applied', 156], ['Screening', 92], ['Interview', 48], ['Offer', 18], ['Hired', 12]].map(([stage, count], i) => (
              <div key={stage} style={{ margin: '10px 0' }}>
                <span>{stage}</span>
                <i style={{ width: `${100 - i * 15}%` }} />
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card payroll-breakdown" style={{ padding: 20 }}>
          <CardHead title="Payroll Summary" sub="October 2026 Disbursal" action="Details" />
          <div className="donut" style={{ margin: '10px auto' }}>
            <div><strong>₹21.2L</strong><small>Gross</small></div>
          </div>
          <ul>
            <li><i className="earnings" />Basic Salaries <strong>₹14.1L</strong></li>
            <li><i className="benefits" />Allowances & HRA <strong>₹7.1L</strong></li>
            <li><i className="deductions" />PF & Deductions <strong>₹2.8L</strong></li>
          </ul>
        </div>
      </section>

      {/* New Employees & Active Directory */}
      <section className="card team-card">
        <CardHead title="New Employees & Directory" sub="Click any profile to inspect complete record" action="All 248" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Department</th><th>Role</th><th>Status</th><th>Inspect</th></tr>
            </thead>
            <tbody>
              {employees.slice(0, 5).map(e => (
                <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => onSelectEmployee(e)}>
                  <td>
                    <div className={`avatar ${e.tone}`}>{e.initials}</div>
                    <div><strong>{e.name}</strong><small>{e.email}</small></div>
                  </td>
                  <td>{e.dept}</td>
                  <td>{e.role}</td>
                  <td><span className={`status ${e.status.toLowerCase().replace(' ', '-')}`}><i />{e.status}</span></td>
                  <td><button className="download-btn" title="View details"><Eye size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

/* ==========================================================================
   3. MODULE ROUTER
   ========================================================================== */
function ModulePage({
  page, search, employees, onAddEmployee, openAddEmployee, setOpenAddEmployee, onSelectEmployee,
  leaveRequests, onApproveLeave, onRejectLeave, onApplyLeave,
  checkedIn, checkedOut, checkInTime, checkOutTime, onPunchIn, onPunchOut, isEmployeeView,
}: {
  page: Page
  search: string
  employees: Employee[]
  onAddEmployee: (emp: Employee) => void
  openAddEmployee: boolean
  setOpenAddEmployee: (val: boolean) => void
  onSelectEmployee: (emp: Employee) => void
  leaveRequests: LeaveReq[]
  onApproveLeave: (id: string) => void
  onRejectLeave: (id: string) => void
  onApplyLeave: (req: LeaveReq) => void
  checkedIn: boolean
  checkedOut: boolean
  checkInTime: string
  checkOutTime: string
  onPunchIn: () => void
  onPunchOut: () => void
  isEmployeeView: boolean
}) {
  if (page === 'People') {
    return (
      <PeoplePage
        search={search}
        employees={employees}
        onAddEmployee={onAddEmployee}
        open={openAddEmployee}
        setOpen={setOpenAddEmployee}
        onSelectEmployee={onSelectEmployee}
      />
    )
  }
  if (page === 'Attendance') {
    return (
      <AttendancePage
        checkedIn={checkedIn}
        checkedOut={checkedOut}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        onPunchIn={onPunchIn}
        onPunchOut={onPunchOut}
      />
    )
  }
  if (page === 'Leave') {
    return (
      <LeavePage
        leaveRequests={leaveRequests}
        onApproveLeave={onApproveLeave}
        onRejectLeave={onRejectLeave}
        onApplyLeave={onApplyLeave}
        isEmployeeView={isEmployeeView}
      />
    )
  }
  if (page === 'Payroll') return <PayrollPage />
  if (page === 'Recruitment') return <RecruitmentPage />
  if (page === 'Performance') return <PerformancePage />
  if (page === 'Documents') return <DocumentsPage search={search} />
  if (page === 'Notifications') return <NotificationsPage />
  if (page === 'Reports') return <ReportsPage />
  if (page === 'Settings') return <SettingsPage />

  return null
}

/* ==========================================================================
   4. PEOPLE MODULE
   ========================================================================== */
function PeoplePage({
  search, employees, onAddEmployee, open, setOpen, onSelectEmployee,
}: {
  search: string
  employees: Employee[]
  onAddEmployee: (emp: Employee) => void
  open: boolean
  setOpen: (val: boolean) => void
  onSelectEmployee: (emp: Employee) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dept, setDept] = useState('Engineering')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<'Active' | 'Remote' | 'On leave'>('Active')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [notice, setNotice] = useState('')

  const tones = ['violet', 'blue', 'green', 'orange', 'pink']

  const handleExport = () => {
    const header = 'ID,Name,Role,Department,Status,Email,Phone\n'
    const rows = employees.map(e => `"${e.code}","${e.name}","${e.role}","${e.dept}","${e.status}","${e.email}","${e.phone}"`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'smart-hrms-employees.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotice('Employee directory exported successfully as CSV.')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !role.trim()) return
    const id = (employees.length + 1).toString()
    const code = `EMP-100${employees.length + 1}`
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
    const tone = tones[employees.length % tones.length]
    onAddEmployee({
      id,
      code,
      name: `${firstName.trim()} ${lastName.trim()}`,
      role: role.trim(),
      dept,
      status,
      initials,
      tone,
      email: email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acme.test`,
      phone: phone.trim() || '+91 98765 00000',
      joiningDate: 'Today',
      manager: 'Sahil Kumar',
      salary: '₹1,00,000 / mo',
    })
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setRole('')
    setOpen(false)
    setNotice(`Added ${firstName.trim()} ${lastName.trim()} to team directory.`)
  }

  const filtered = employees.filter(e => {
    const matchesSearch = `${e.name} ${e.role} ${e.dept} ${e.code} ${e.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesDept = deptFilter === 'ALL' || e.dept === deptFilter
    return matchesSearch && matchesDept
  })

  return (
    <>
      <section className="welcome">
        <div>
          <p>EMPLOYEE DIRECTORY</p>
          <h1>Employees</h1>
          <h2>Directory, role management, personal profiles, and employee records.</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="primary" onClick={() => setOpen(true)}><UserRoundPlus size={18} /> Add employee</button>
        </div>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      {/* Filter toolbar */}
      <section className="recruit-toolbar card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong>{filtered.length} employees found</strong>
          <small>Click any employee row to inspect complete profile</small>
        </div>
        <div className="pipeline-actions">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid var(--line)', fontSize: 11 }}>
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="People">People</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
          </select>
          <button onClick={handleExport}><Download size={14} /> Export CSV</button>
        </div>
      </section>

      <section className="card team-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name & Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => onSelectEmployee(e)}>
                  <td><strong>{e.code}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`avatar ${e.tone}`}>{e.initials}</div>
                      <div>
                        <strong>{e.name}</strong>
                        <small>{e.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{e.dept}</td>
                  <td>{e.role}</td>
                  <td><span className={`status ${e.status.toLowerCase().replace(' ', '-')}`}><i />{e.status}</span></td>
                  <td><button className="download-btn" title="View details"><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Employee Modal */}
      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <form className="leave-modal" onSubmit={handleSubmit} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>NEW EMPLOYEE</p>
                <h2>Onboard team member</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <div className="form-row">
              <label>First name
                <input required placeholder="e.g. Priyal" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </label>
              <label>Last name
                <input required placeholder="e.g. Verma" value={lastName} onChange={e => setLastName(e.target.value)} />
              </label>
            </div>
            <div className="form-row">
              <label>Work email
                <input type="email" placeholder="priyal.verma@acme.test" value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              <label>Phone number
                <input placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
              </label>
            </div>
            <div className="form-row">
              <label>Department
                <select value={dept} onChange={e => setDept(e.target.value)}>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>People</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                </select>
              </label>
              <label>Status
                <select value={status} onChange={e => setStatus(e.target.value as 'Active' | 'Remote' | 'On leave')}>
                  <option value="Active">Active</option>
                  <option value="Remote">Remote</option>
                  <option value="On leave">On leave</option>
                </select>
              </label>
            </div>
            <label>Designation / Role
              <input required placeholder="e.g. Senior Frontend Engineer" value={role} onChange={e => setRole(e.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Create profile</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   5. ATTENDANCE MODULE
   ========================================================================== */
function AttendancePage({
  checkedIn, checkedOut, checkInTime, checkOutTime, onPunchIn, onPunchOut,
}: {
  checkedIn: boolean
  checkedOut: boolean
  checkInTime: string
  checkOutTime: string
  onPunchIn: () => void
  onPunchOut: () => void
}) {
  const [notice, setNotice] = useState('')

  const history = [
    ['Mon, 28 Sep', '09:02 AM', '06:04 PM', '9h 02m', 'Present'],
    ['Tue, 29 Sep', '09:18 AM', '06:11 PM', '8h 53m', 'Present'],
    ['Wed, 30 Sep', '09:42 AM', '06:20 PM', '8h 38m', 'Late'],
    [
      'Thu, 1 Oct (Today)',
      checkInTime,
      checkOutTime,
      checkedOut ? 'Completed' : checkedIn ? 'In progress' : 'Not started',
      checkedIn ? 'Present' : 'Absent',
    ],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>HOURS & TIMELOGS</p>
          <h1>Attendance Management</h1>
          <h2>Real-time check-in, workday logs, shift tracking, and monthly attendance history.</h2>
        </div>
        <div className="today-date">Thursday, 1 October 2026</div>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="attendance-grid">
        <div className="card clock-card">
          <div className="clock-icon"><Clock3 size={24} /></div>
          <p>SHIFT STATUS</p>
          <h3>{checkedOut ? 'Day completed' : checkedIn ? 'Working active shift' : 'Ready to start?'}</h3>
          <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
          <small>{checkedIn ? `Started at ${checkInTime}` : 'Standard shift · 9:00 AM – 6:00 PM'}</small>
          <button
            className={`clock-action ${checkedIn && !checkedOut ? 'danger' : ''}`}
            disabled={checkedOut}
            onClick={() => {
              if (checkedIn && !checkedOut) {
                onPunchOut()
                setNotice('Checked out successfully!')
              } else {
                onPunchIn()
                setNotice('Checked in successfully!')
              }
            }}
          >
            {checkedOut ? 'Checked Out' : checkedIn ? 'Check Out' : 'Check In Now'}
          </button>
        </div>

        <div className="attendance-summary">
          <Stat icon={Clock3} label="Hours this week" value="26.5h" delta="Target: 40h" tone="purple" />
          <Stat icon={CalendarDays} label="Days present" value="19" delta="95% attendance" tone="green" />
          <Stat icon={TrendingUp} label="Average arrival" value="9:14 AM" delta="6 min ahead of grace" tone="blue" />
          <Stat icon={Clock3} label="Late arrivals" value="1" delta="Down from 3 last month" tone="orange" />
        </div>
      </section>

      <section className="card team-card attendance-table">
        <CardHead title="Recent Attendance Records" sub="October 2026 Shift History" action="Download report" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Duration</th><th>Status</th></tr>
            </thead>
            <tbody>
              {history.map(d => (
                <tr key={d[0]}>
                  <td><strong>{d[0]}</strong></td>
                  <td>{d[1]}</td>
                  <td>{d[2]}</td>
                  <td>{d[3]}</td>
                  <td><span className={`status ${d[4].toLowerCase().replace(' ', '-')}`}><i />{d[4]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

/* ==========================================================================
   6. LEAVE MODULE
   ========================================================================== */
function LeavePage({
  leaveRequests, onApproveLeave, onRejectLeave, onApplyLeave, isEmployeeView,
}: {
  leaveRequests: LeaveReq[]
  onApproveLeave: (id: string) => void
  onRejectLeave: (id: string) => void
  onApplyLeave: (req: LeaveReq) => void
  isEmployeeView: boolean
}) {
  const [open, setOpen] = useState(false)
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [startDate, setStartDate] = useState('2026-10-15')
  const [endDate, setEndDate] = useState('2026-10-16')
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState('')

  const balances = [
    ['Casual Leave', '8', '12', 'purple'],
    ['Sick Leave', '5', '10', 'green'],
    ['Earned Leave', '14', '18', 'blue'],
    ['Work from Home', '20', '24', 'orange'],
  ]

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    onApplyLeave({
      id: `LR-${leaveRequests.length + 1}`,
      employeeName: 'Sahil Kumar',
      leaveType,
      dates: `${startDate} – ${endDate}`,
      days: '2 days',
      status: 'Pending',
      reason: reason || 'Personal request',
    })
    setOpen(false)
    setNotice('Leave request submitted successfully. Awaiting approval.')
    setReason('')
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>TIME OFF & HOLIDAYS</p>
          <h1>Leave Management</h1>
          <h2>Leave balances, application submissions, and management approvals.</h2>
        </div>
        <button className="primary" onClick={() => setOpen(true)}><CalendarDays size={18} /> Apply leave</button>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      {/* Leave Balances */}
      <section className="leave-balances">
        {balances.map(([name, remaining, total, tone]) => (
          <div className="card balance-card" key={name}>
            <span className={`balance-icon ${tone}`}><CalendarDays size={18} /></span>
            <div><p>{name}</p><strong>{remaining}</strong><small> of {total} days available</small></div>
            <div className="balance-track"><i style={{ width: `${(Number(remaining) / Number(total)) * 100}%` }} /></div>
          </div>
        ))}
      </section>

      {/* Leave Requests Table with Approve/Reject for HR/Managers */}
      <section className="card team-card">
        <CardHead
          title={isEmployeeView ? 'My Leave Requests' : 'All Leave Requests & Approvals'}
          sub="Recent leave submissions and statuses"
          action="All categories"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(row => (
                <tr key={row.id}>
                  <td><strong>{row.employeeName}</strong></td>
                  <td>{row.leaveType}</td>
                  <td>{row.dates}</td>
                  <td>{row.days}</td>
                  <td><span className={`status ${row.status.toLowerCase()}`}><i />{row.status}</span></td>
                  <td>
                    {!isEmployeeView && row.status === 'Pending' ? (
                      <div>
                        <button className="btn-approve" onClick={() => onApproveLeave(row.id)}>Approve</button>
                        <button className="btn-reject" onClick={() => onRejectLeave(row.id)}>Reject</button>
                      </div>
                    ) : (
                      <MoreHorizontal size={18} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Apply Leave Modal */}
      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <form className="leave-modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>NEW LEAVE APPLICATION</p>
                <h2>Apply for leave</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Leave type
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>Work from Home</option>
              </select>
            </label>
            <div className="form-row">
              <label>Start date
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </label>
              <label>End date
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </label>
            </div>
            <label>Reason
              <textarea required minLength={5} placeholder="Tell your manager why you need time off..." value={reason} onChange={e => setReason(e.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Submit request</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   7. PAYROLL MODULE
   ========================================================================== */
function PayrollPage() {
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState<string | null>(null)

  const payroll = [
    ['September 2026', '₹1,25,000', '₹18,500', '₹1,06,500', 'Paid'],
    ['August 2026', '₹1,25,000', '₹18,500', '₹1,06,500', 'Paid'],
    ['July 2026', '₹1,25,000', '₹18,500', '₹1,06,500', 'Paid'],
    ['June 2026', '₹1,20,000', '₹17,800', '₹1,02,200', 'Paid'],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>COMPENSATION & SALARY</p>
          <h1>Payroll Management</h1>
          <h2>Salary disbursement, detailed payslips, allowances, and tax deductions.</h2>
        </div>
        <button className="primary" onClick={() => setProcessing(true)}><CircleDollarSign size={18} /> Run payroll</button>
      </section>

      {processed && (
        <div className="notice">
          <span>✓</span>October payroll was processed successfully for 248 employees.
          <button onClick={() => setProcessed(false)}>×</button>
        </div>
      )}

      <section className="stats-grid payroll-stats">
        <Stat icon={CircleDollarSign} label="October payroll" value="₹18.4L" delta="248 employees" tone="purple" />
        <Stat icon={TrendingUp} label="Total earnings" value="₹21.2L" delta="+3.2% from Sep" tone="green" />
        <Stat icon={FileText} label="Deductions" value="₹2.8L" delta="Provident Fund & Tax" tone="orange" />
        <Stat icon={Clock3} label="Payment status" value={processed ? 'Disbursed' : 'Draft'} delta="Scheduled 28 Oct" tone="blue" />
      </section>

      <section className="payroll-layout">
        <div className="card payroll-chart">
          <CardHead title="Salary Cost Overview" sub="Disbursed payroll (last 6 months)" action="Last 6 months" />
          <div className="payroll-bars">
            {[['May', 62], ['Jun', 71], ['Jul', 74], ['Aug', 83], ['Sep', 88], ['Oct', 94]].map(([m, v]) => (
              <div key={m}>
                <span>₹{(Number(v) / 5).toFixed(1)}L</span>
                <i style={{ height: `${v}%` }} />
                <small>{m}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="card payroll-breakdown">
          <CardHead title="Salary Composition" sub="Monthly structure" action="Details" />
          <div className="donut"><div><strong>₹21.2L</strong><small>Gross</small></div></div>
          <ul>
            <li><i className="earnings" />Basic Salary <strong>₹14.1L</strong></li>
            <li><i className="benefits" />HRA & Special Allowances <strong>₹7.1L</strong></li>
            <li><i className="deductions" />PF & Income Tax <strong>₹2.8L</strong></li>
          </ul>
        </div>
      </section>

      {/* Payslips table */}
      <section className="card team-card">
        <CardHead title="Employee Payslips" sub="Salary records and downloadable statements" action="2026" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Pay Period</th><th>Gross Earnings</th><th>Deductions</th><th>Net Salary</th><th>Status</th><th>Payslip</th></tr>
            </thead>
            <tbody>
              {payroll.map(row => (
                <tr key={row[0]}>
                  <td><strong>{row[0]}</strong></td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td><strong>{row[3]}</strong></td>
                  <td><span className="status approved"><i />{row[4]}</span></td>
                  <td>
                    <button className="payslip-btn" onClick={() => setSelectedPayslip(row[0])}>
                      <FileText size={14} /> View Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payslip Inspection Modal */}
      {selectedPayslip && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedPayslip(null)}>
          <div className="profile-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>SALARY STATEMENT</p>
                <h2>Payslip — {selectedPayslip}</h2>
              </div>
              <button type="button" onClick={() => setSelectedPayslip(null)} aria-label="Close payslip"><X size={19} /></button>
            </div>
            <div className="profile-hero">
              <div className="avatar violet">SK</div>
              <div>
                <h2>Sahil Kumar</h2>
                <p>EMP-1001 · Senior Product Designer</p>
              </div>
              <span className="status approved" style={{ marginLeft: 'auto' }}><i />Paid</span>
            </div>
            <div className="profile-details-grid">
              <div className="profile-detail-box"><span>BASIC PAY</span><strong>₹65,000</strong></div>
              <div className="profile-detail-box"><span>HRA</span><strong>₹32,500</strong></div>
              <div className="profile-detail-box"><span>SPECIAL ALLOWANCE</span><strong>₹27,500</strong></div>
              <div className="profile-detail-box"><span>PF & DEDUCTIONS</span><strong>-₹18,500</strong></div>
            </div>
            <div style={{ padding: 14, background: '#f5f4fa', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700 }}>Net Disbursed Amount:</span>
              <strong style={{ fontSize: 18, color: '#27855b' }}>₹1,06,500</strong>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setSelectedPayslip(null)}>Close</button>
              <button className="primary" type="button" onClick={() => setSelectedPayslip(null)}>
                <Download size={15} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Payroll Modal */}
      {processing && (
        <div className="modal-backdrop" onMouseDown={() => setProcessing(false)}>
          <form className="leave-modal" onSubmit={e => { e.preventDefault(); setProcessing(false); setProcessed(true) }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>PAYROLL RUN</p>
                <h2>Disburse October Salaries</h2>
              </div>
              <button type="button" onClick={() => setProcessing(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <div className="payroll-confirm">
              <span><CircleDollarSign size={22} /></span>
              <div><strong>248 Employees Selected</strong><small>Estimated Net Payout: ₹18,40,000</small></div>
            </div>
            <label>Disbursement Date
              <input type="date" required defaultValue="2026-10-28" />
            </label>
            <label>Accounting Note
              <textarea placeholder="Optional note for finance audit logs..." />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setProcessing(false)}>Cancel</button>
              <button className="primary" type="submit">Approve & Disburse</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   8. PERFORMANCE MODULE
   ========================================================================== */
function PerformancePage() {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const goals = [
    ['Deliver responsive PWA design system', 'Product Excellence', '85', '15 Dec 2026'],
    ['Improve engineering onboarding velocity', 'Team Scaling', '92', '30 Nov 2026'],
    ['Mentor junior designers across squads', 'People Development', '60', '20 Dec 2026'],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>GROWTH & REVIEWS</p>
          <h1>Performance Management</h1>
          <h2>Quarterly performance cycles, objective goals, and feedback tracking.</h2>
        </div>
        <button className="primary" onClick={() => setReviewOpen(true)}><TrendingUp size={18} /> Start self-review</button>
      </section>

      {submitted && (
        <div className="notice">
          <span>✓</span>Your H2 2026 Self Assessment was submitted to your manager.
          <button onClick={() => setSubmitted(false)}>×</button>
        </div>
      )}

      <section className="performance-hero card">
        <div>
          <span className="cycle-badge">ACTIVE CYCLE</span>
          <h2>H2 2026 Performance Assessment</h2>
          <p>July 1 – December 31, 2026</p>
          <div className="cycle-progress">
            <i style={{ width: submitted ? '75%' : '50%' }} />
            <span>{submitted ? 'Manager review in progress' : 'Self review due in 12 days'}</span>
          </div>
        </div>
        <div className="score-ring"><div><strong>4.8</strong><small>Rating</small></div></div>
        <div className="review-steps">
          <span className="done"><i>✓</i>Goals set</span>
          <b />
          <span className={submitted ? 'done' : 'current'}><i>{submitted ? '✓' : '2'}</i>Self review</span>
          <b />
          <span className={submitted ? 'current' : ''}><i>3</i>Manager review</span>
          <b />
          <span><i>4</i>Final rating</span>
        </div>
      </section>

      <section className="performance-grid">
        <div className="card goals-card">
          <CardHead title="My Key Objectives" sub="3 goals · 79% overall completion" action="Add goal" />
          <div className="goal-list">
            {goals.map(([title, category, progress, date]) => (
              <div className="goal" key={title}>
                <div className="goal-top">
                  <span>{category}</span>
                  <MoreHorizontal size={17} />
                </div>
                <strong>{title}</strong>
                <small>Target: {date}</small>
                <div className="goal-progress">
                  <i style={{ width: `${progress}%` }} />
                  <span>{progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card feedback-card">
          <CardHead title="360° Peer Feedback" sub="Continuous recognition" action="View all" />
          <div className="feedback-quote">“Sahil brought exceptional clarity and speed to our team, creating an intuitive workflow that all departments love using.”</div>
          <div className="feedback-author">
            <div className="avatar blue">AM</div>
            <div><strong>Arjun Mehta</strong><small>Engineering Lead · 2 weeks ago</small></div>
          </div>
          <div className="skills">
            <p>Evaluated Competencies</p>
            <span>Collaboration & Empathy <b>4.9</b></span>
            <span>Delivery Speed & Quality <b>4.8</b></span>
            <span>Leadership & Mentorship <b>4.7</b></span>
          </div>
        </div>
      </section>

      {reviewOpen && (
        <div className="modal-backdrop" onMouseDown={() => setReviewOpen(false)}>
          <form className="leave-modal review-modal" onSubmit={e => { e.preventDefault(); setReviewOpen(false); setSubmitted(true) }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>H2 2026 CYCLE</p>
                <h2>Self Assessment Form</h2>
              </div>
              <button type="button" onClick={() => setReviewOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Overall rating
              <select defaultValue="5">
                <option value="5">5 — Exceptional Performance</option>
                <option value="4">4 — Exceeds Expectations</option>
                <option value="3">3 — Meets Expectations</option>
              </select>
            </label>
            <label>What major outcomes are you most proud of?
              <textarea required minLength={10} defaultValue="Engineered responsive role-based modules, optimized mobile workflows, and cut attendance latency." />
            </label>
            <label>Development goals for next cycle
              <textarea required minLength={10} defaultValue="Expand cross-functional mentorship and scale design engineering standards." />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setReviewOpen(false)}>Save draft</button>
              <button className="primary" type="submit">Submit assessment</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   9. RECRUITMENT, DOCUMENTS, REPORTS, SETTINGS, NOTIFICATIONS
   ========================================================================== */
function RecruitmentPage() {
  const [modal, setModal] = useState(false)
  const [candidateModal, setCandidateModal] = useState(false)
  const [targetStage, setTargetStage] = useState('Applied')
  const [candidateName, setCandidateName] = useState('')
  const [candidateRole, setCandidateRole] = useState('Senior Backend Engineer')
  const [jobTitle, setJobTitle] = useState('')
  const [notice, setNotice] = useState('')

  const [stages, setStages] = useState([
    { name: 'Applied', count: 12, people: [['Riya Sen', 'Frontend Engineer', 'RS'], ['Kabir Rao', 'Product Designer', 'KR']] },
    { name: 'Screening', count: 6, people: [['Anaya Iyer', 'Backend Engineer', 'AI'], ['Vihaan Das', 'Data Analyst', 'VD']] },
    { name: 'Interview', count: 4, people: [['Meera Shah', 'Product Designer', 'MS'], ['Aarav Jain', 'Backend Engineer', 'AJ']] },
    { name: 'Offer', count: 2, people: [['Zoya Khan', 'Growth Manager', 'ZK']] },
  ])

  const handleAddCandidate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidateName.trim()) return
    const initials = candidateName.trim().split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    setStages(prev => prev.map(s => s.name === targetStage ? { ...s, count: s.count + 1, people: [[candidateName.trim(), candidateRole, initials], ...s.people] } : s))
    setCandidateName('')
    setCandidateModal(false)
    setNotice(`Added ${candidateName} to ${targetStage} stage.`)
  }

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) return
    setModal(false)
    setNotice(`Job opening "${jobTitle.trim()}" created as draft.`)
    setJobTitle('')
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>TALENT ACQUISITION</p>
          <h1>Recruitment Pipeline</h1>
          <h2>Open job positions, candidate pipeline, interviews, and offer tracking.</h2>
        </div>
        <button className="primary" onClick={() => setModal(true)}><BriefcaseBusiness size={18} /> Create job opening</button>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="stats-grid recruitment-stats">
        <Stat icon={BriefcaseBusiness} label="Open positions" value="8" delta="Across 5 teams" tone="purple" />
        <Stat icon={Users} label="Active candidates" value={String(stages.reduce((acc, s) => acc + s.count, 0))} delta="+9 this week" tone="blue" />
        <Stat icon={CalendarDays} label="Interviews" value="7" delta="3 scheduled today" tone="orange" />
        <Stat icon={TrendingUp} label="Offer acceptance" value="88%" delta="+6% this quarter" tone="green" />
      </section>

      <section className="pipeline">
        {stages.map(stage => (
          <div className="pipeline-column" key={stage.name}>
            <div className="pipeline-head">
              <span><i className={stage.name.toLowerCase()} />{stage.name}</span>
              <em>{stage.count}</em>
              <MoreHorizontal size={17} />
            </div>
            {stage.people.map(([name, job, initials], i) => (
              <div className="candidate-card" key={name}>
                <div className="candidate-top">
                  <div className={`avatar ${['violet', 'blue', 'green', 'orange'][i % 4]}`}>{initials}</div>
                  <MoreHorizontal size={16} />
                </div>
                <strong>{name}</strong>
                <small>{job}</small>
                <div className="candidate-meta">
                  <span>{stage.name === 'Interview' ? 'Tomorrow, 11:00 AM' : 'Updated today'}</span>
                  <b>★ 4.8</b>
                </div>
              </div>
            ))}
            <button className="add-candidate" onClick={() => { setTargetStage(stage.name); setCandidateModal(true) }}>
              + Add candidate
            </button>
          </div>
        ))}
      </section>

      {modal && (
        <div className="modal-backdrop" onMouseDown={() => setModal(false)}>
          <form className="leave-modal" onSubmit={handleCreateJob} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>NEW RECRUITMENT REQUISITION</p>
                <h2>Create job opening</h2>
              </div>
              <button type="button" onClick={() => setModal(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Job title
              <input required placeholder="e.g. Lead Mobile Architect" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            </label>
            <div className="form-row">
              <label>Department
                <select defaultValue="Engineering">
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>People</option>
                </select>
              </label>
              <label>Employment type
                <select>
                  <option>Full time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setModal(false)}>Cancel</button>
              <button className="primary" type="submit">Post opening</button>
            </div>
          </form>
        </div>
      )}

      {candidateModal && (
        <div className="modal-backdrop" onMouseDown={() => setCandidateModal(false)}>
          <form className="leave-modal" onSubmit={handleAddCandidate} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>ADD TO PIPELINE</p>
                <h2>New candidate</h2>
              </div>
              <button type="button" onClick={() => setCandidateModal(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Candidate name
              <input required placeholder="e.g. Tarun Chopra" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
            </label>
            <div className="form-row">
              <label>Stage
                <select value={targetStage} onChange={e => setTargetStage(e.target.value)}>
                  {stages.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </label>
              <label>Target position
                <input required value={candidateRole} onChange={e => setCandidateRole(e.target.value)} />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setCandidateModal(false)}>Cancel</button>
              <button className="primary" type="submit">Save candidate</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function DocumentsPage({ search = '' }: { search?: string }) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [docs, setDocs] = useState([
    ['Employment Contract', 'Employment', 'PDF · 1.2 MB', '28 Sep 2026', 'Verified'],
    ['PAN / Tax Identification', 'Identity', 'PDF · 820 KB', '12 Jan 2026', 'Verified'],
    ['Academic Degree Certificate', 'Education', 'PDF · 2.4 MB', '12 Jan 2026', 'Pending'],
    ['Residential Address Proof', 'Identity', 'PDF · 940 KB', '8 Aug 2026', 'Expires soon'],
  ])
  const [docName, setDocName] = useState('')
  const [category, setCategory] = useState('Identity')

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docName.trim()) return
    setDocs(prev => [[docName.trim(), category, 'PDF · 1.1 MB', 'Just now', 'Pending'], ...prev])
    setDocName('')
    setUploadOpen(false)
    setNotice(`Document "${docName.trim()}" uploaded securely and queued for review.`)
  }

  const filteredDocs = docs.filter(d => d[0].toLowerCase().includes(search.toLowerCase()) || d[1].toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <section className="welcome">
        <div>
          <p>SECURE VAULT</p>
          <h1>Documents</h1>
          <h2>Employee record files, contracts, identity documents, and compliance forms.</h2>
        </div>
        <button className="primary" onClick={() => setUploadOpen(true)}><Upload size={18} /> Upload document</button>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="document-layout">
        <div className="card team-card">
          <CardHead title="My Document Records" sub="Verified and submitted records" action="Categories" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Document</th><th>Category</th><th>Uploaded</th><th>Status</th><th>Download</th></tr>
              </thead>
              <tbody>
                {filteredDocs.map(row => (
                  <tr key={row[0]}>
                    <td>
                      <span className="file-icon"><FileText size={17} /></span>
                      <div><strong>{row[0]}</strong><small>{row[2]}</small></div>
                    </td>
                    <td>{row[1]}</td>
                    <td>{row[3]}</td>
                    <td><span className={`status ${row[4].toLowerCase().replace(' ', '-')}`}><i />{row[4]}</span></td>
                    <td>
                      <button className="download-btn" onClick={() => { setNotice(`Downloading ${row[0]}...`); setTimeout(() => setNotice(''), 2000) }} title="Download">
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card compliance-card">
          <CardHead title="Compliance Status" sub="Mandatory checks" action="75%" />
          <div className="compliance-ring"><div><strong>3/4</strong><small>Done</small></div></div>
          <ul>
            <li className="done">✓ Identity Proof</li>
            <li className="done">✓ Signed Employment Contract</li>
            <li className="done">✓ Degree Verification</li>
            <li>! Bank Account Cancelled Cheque</li>
          </ul>
          <button onClick={() => setUploadOpen(true)}>Complete record</button>
        </aside>
      </section>

      {uploadOpen && (
        <div className="modal-backdrop" onMouseDown={() => setUploadOpen(false)}>
          <form className="leave-modal" onSubmit={handleUpload} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>DOCUMENT REPOSITORY</p>
                <h2>Upload employee document</h2>
              </div>
              <button type="button" onClick={() => setUploadOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Document title
              <input required placeholder="e.g. Passport or Bank Details" value={docName} onChange={e => setDocName(e.target.value)} />
            </label>
            <label>Category
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option>Identity</option>
                <option>Employment</option>
                <option>Education</option>
                <option>Finance</option>
              </select>
            </label>
            <label className="upload-zone">
              <Upload size={23} />
              <strong>Choose a file from your device</strong>
              <small>PDF, PNG or JPG · up to 5 MB</small>
              <input type="file" />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setUploadOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Upload file</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function NotificationsPage() {
  const [read, setRead] = useState<string[]>([])
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [published, setPublished] = useState(false)
  const [announcements, setAnnouncements] = useState([
    { tag: 'COMPANY', title: 'Diwali Festive Holiday Schedule', body: 'Our offices will be closed from 8–10 November. Wishing everyone happy celebrations!', meta: 'Published today · People Team' },
    { tag: 'WELLNESS', title: 'Annual Health Screening Drive', body: 'Book your complimentary comprehensive health check before 31 October.', meta: '3 days ago · Benefits Squad' },
  ])
  const [newTitle, setNewTitle] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const notifications = [
    ['leave', 'Leave request approved', 'Your casual leave for 12–13 October has been authorized by your manager.', '12 min ago', 'success'],
    ['review', 'Self-review due in 12 days', 'Please complete your H2 2026 self-assessment on time.', '2 hours ago', 'warning'],
    ['payroll', 'September payslip generated', 'Your monthly salary has been successfully disbursed.', 'Yesterday', 'info'],
  ]

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newMessage.trim()) return
    setAnnouncements(prev => [{ tag: 'COMPANY', title: newTitle.trim(), body: newMessage.trim(), meta: 'Just now · You' }, ...prev])
    setNewTitle('')
    setNewMessage('')
    setAnnouncementOpen(false)
    setPublished(true)
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>INBOX & ANNOUNCEMENTS</p>
          <h1>Notifications</h1>
          <h2>Company bulletins, workflow reminders, and approval alerts.</h2>
        </div>
        <button className="primary" onClick={() => setAnnouncementOpen(true)}><Bell size={18} /> Post announcement</button>
      </section>

      {published && (
        <div className="notice">
          <span>✓</span>Company announcement posted successfully.
          <button onClick={() => setPublished(false)}>×</button>
        </div>
      )}

      <section className="notification-layout">
        <div className="card notification-card">
          <div className="notification-head">
            <div>
              <h3>Recent Notifications</h3>
              <p>{Math.max(0, notifications.length - read.length)} unread</p>
            </div>
            <button onClick={() => setRead(notifications.map(n => n[0]))}>Mark all read</button>
          </div>
          <div className="notification-list">
            {notifications.map(([id, title, message, time, tone]) => (
              <button
                key={id}
                className={`notification-item ${read.includes(id) ? 'read' : ''}`}
                onClick={() => setRead([...new Set([...read, id])])}
              >
                <span className={`notification-symbol ${tone}`}>
                  {tone === 'success' ? <ShieldCheck /> : tone === 'warning' ? <Clock3 /> : <Bell />}
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{message}</p>
                  <small>{time}</small>
                </div>
                {!read.includes(id) && <i />}
              </button>
            ))}
          </div>
        </div>

        <aside className="card announcement-feed">
          <CardHead title="Company Bulletin" sub="Latest announcements" action="All posts" />
          {announcements.map((item, i) => (
            <article key={i}>
              <span>{item.tag}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small>{item.meta}</small>
            </article>
          ))}
        </aside>
      </section>

      {announcementOpen && (
        <div className="modal-backdrop" onMouseDown={() => setAnnouncementOpen(false)}>
          <form className="leave-modal" onSubmit={handlePublish} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>BULLETIN BROADCAST</p>
                <h2>New company announcement</h2>
              </div>
              <button type="button" onClick={() => setAnnouncementOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Title
              <input required placeholder="e.g. Townhall Meeting This Friday" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </label>
            <label>Message
              <textarea required minLength={10} placeholder="Share an update with your entire team..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setAnnouncementOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Broadcast</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function ReportsPage() {
  const [range, setRange] = useState('This year')
  const [notice, setNotice] = useState('')
  const departments = [
    ['Engineering', 84, 34],
    ['Sales', 58, 23],
    ['Operations', 43, 17],
    ['Design', 31, 13],
    ['People', 20, 8],
    ['Finance', 12, 5],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>ANALYTICS & METRICS</p>
          <h1>HR Reports & Insights</h1>
          <h2>Workforce headcount growth, retention indices, and recruitment conversion.</h2>
        </div>
        <div className="report-actions">
          <select value={range} onChange={e => setRange(e.target.value)}>
            <option>This year</option>
            <option>Last 6 months</option>
            <option>This quarter</option>
          </select>
          <button className="primary" onClick={() => { setNotice('HR Analytics summary report generated and downloaded.'); setTimeout(() => setNotice(''), 3000) }}>
            <Download size={17} /> Export report
          </button>
        </div>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="stats-grid">
        <Stat icon={Users} label="Total Headcount" value="248" delta="+9.7% YoY growth" tone="purple" />
        <Stat icon={TrendingUp} label="Retention Rate" value="94.2%" delta="+1.8% vs last year" tone="green" />
        <Stat icon={Clock3} label="Attendance Index" value="93.1%" delta="+0.6% this quarter" tone="blue" />
        <Stat icon={BriefcaseBusiness} label="Average Time to Hire" value="24 days" delta="4 days faster" tone="orange" />
      </section>

      <section className="analytics-grid">
        <div className="card headcount-chart">
          <CardHead title="Headcount Growth" sub={`Active workforce size · ${range}`} action="Monthly" />
          <div className="line-chart">
            <div className="y-labels"><span>250</span><span>225</span><span>200</span><span>175</span></div>
            <svg viewBox="0 0 700 190" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6d5bd0" stopOpacity=".3" />
                  <stop offset="1" stopColor="#6d5bd0" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path className="area" d="M0,160 C80,150 95,138 145,140 S220,118 280,120 S370,95 420,100 S510,68 555,70 S640,40 700,34 L700,190 L0,190Z" />
              <path className="line" d="M0,160 C80,150 95,138 145,140 S220,118 280,120 S370,95 420,100 S510,68 555,70 S640,40 700,34" />
            </svg>
            <div className="x-labels">
              {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        <div className="card dept-chart">
          <CardHead title="Department Headcount" sub="Distribution of roles" action="248 Total" />
          <div className="dept-list">
            {departments.map(([name, count, pct]) => (
              <div key={name}>
                <span>{name}<b>{count}</b></span>
                <div><i style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function SettingsPage() {
  const [tab, setTab] = useState<'General' | 'Work' | 'Security'>('General')
  const [companyName, setCompanyName] = useState('Acme Studio')
  const [slug, setSlug] = useState('acme-studio')
  const [email, setEmail] = useState('support@acme.test')
  const [twoFactor, setTwoFactor] = useState(true)
  const [notice, setNotice] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setNotice('Settings saved successfully.')
    setTimeout(() => setNotice(''), 3000)
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>WORKSPACE PREFERENCES</p>
          <h1>Settings</h1>
          <h2>Configure company parameters, shifts, policies, and security.</h2>
        </div>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <div className="settings-grid">
        <aside className="card settings-nav">
          <button className={tab === 'General' ? 'active' : ''} onClick={() => setTab('General')}>
            <Building size={16} /> Company profile
          </button>
          <button className={tab === 'Work' ? 'active' : ''} onClick={() => setTab('Work')}>
            <Clock3 size={16} /> Shifts & working hours
          </button>
          <button className={tab === 'Security' ? 'active' : ''} onClick={() => setTab('Security')}>
            <Lock size={16} /> Security & access
          </button>
        </aside>

        <section className="card settings-panel">
          <form className="settings-form" onSubmit={handleSave}>
            {tab === 'General' && (
              <>
                <h3>Company profile</h3>
                <p>Manage your organization name, slug, and contact email.</p>
                <div className="form-row">
                  <label>Company name
                    <input required value={companyName} onChange={e => setCompanyName(e.target.value)} />
                  </label>
                  <label>Workspace slug
                    <input required value={slug} onChange={e => setSlug(e.target.value)} />
                  </label>
                </div>
                <label>Support email
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                </label>
              </>
            )}

            {tab === 'Work' && (
              <>
                <h3>Shifts & working hours</h3>
                <p>Set default company shifts, weekly working hours, and grace times.</p>
                <div className="form-row">
                  <label>Standard shift start
                    <input type="time" defaultValue="09:00" />
                  </label>
                  <label>Standard shift end
                    <input type="time" defaultValue="18:00" />
                  </label>
                </div>
                <label>Late arrival grace period (minutes)
                  <input type="number" defaultValue="15" min="0" max="60" />
                </label>
              </>
            )}

            {tab === 'Security' && (
              <>
                <h3>Security & authentication</h3>
                <p>Control user authentication policies and access protection.</p>
                <div className="toggle-row">
                  <div>
                    <strong>Require two-factor authentication (2FA)</strong>
                    <small>Enforce multi-factor verification for all administrator accounts.</small>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={twoFactor} onChange={e => setTwoFactor(e.target.checked)} />
                    <span className="slider" />
                  </label>
                </div>
              </>
            )}

            <div style={{ marginTop: 24 }}>
              <button className="primary" type="submit">Save changes</button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

/* ==========================================================================
   10. AUTH & SHARED COMPONENTS
   ========================================================================== */
function LoginPage({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('admin@acme.test')
  const [password, setPassword] = useState('Admin@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await authService.login(email, password)
      onLogin(user)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="brand auth-brand">
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>peoplely</span>
        </div>
        <div className="story-copy">
          <span>SMART PEOPLE OPERATIONS</span>
          <h1>Build a workplace where people thrive.</h1>
          <p>One thoughtful workspace for your team, time, growth, and every important HR moment.</p>
          <div className="story-stats">
            <div><strong>248</strong><small>People connected</small></div>
            <div><strong>94%</strong><small>Team retention</small></div>
            <div><strong>4.8</strong><small>Employee rating</small></div>
          </div>
        </div>
        <p className="story-foot">Trusted by modern people teams</p>
      </section>
      <main className="auth-main">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-brand brand">
            <span className="brand-mark"><Sparkles size={19} /></span>
            <span>peoplely</span>
          </div>
          <p>WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <h3>Use your company credentials to continue.</h3>
          {error && <div className="login-error">{error}</div>}

          {/* Quick 1-Click Role Logins */}
          <div style={{ margin: '10px 0 14px', background: '#faf9fd', border: '1px solid #e7e4f2', borderRadius: 10, padding: '10px 12px' }}>
            <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', color: '#6d5bd0', marginBottom: 8 }}>
              QUICK LOGIN ACCOUNTS:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              <button
                type="button"
                className="role-chip-btn"
                onClick={() => { setEmail('admin@acme.test'); setPassword('Admin@123') }}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                className="role-chip-btn"
                onClick={() => { setEmail('hr@acme.test'); setPassword('Admin@123') }}
              >
                🧑‍💼 HR Admin (Priya)
              </button>
              <button
                type="button"
                className="role-chip-btn"
                onClick={() => { setEmail('manager@acme.test'); setPassword('Admin@123') }}
              >
                👨‍💼 Manager (Vikram)
              </button>
              <button
                type="button"
                className="role-chip-btn"
                onClick={() => { setEmail('sahil@acme.test'); setPassword('Admin@123') }}
              >
                👤 Employee (Sahil)
              </button>
            </div>
          </div>

          <label>Work email
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label>Password
            <div className="password-field">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </label>
          <div className="login-options">
            <label><input type="checkbox" defaultChecked /> Remember me</label>
            <button type="button">Forgot password?</button>
          </div>
          <button className="login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="divider"><span>or explore demo roles</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button className="demo-submit" style={{ padding: '8px 10px', fontSize: 11.5 }} type="button" onClick={() => onLogin(authService.demo('HR_ADMIN'))}>
              🧑‍💼 HR Admin Demo
            </button>
            <button className="demo-submit" style={{ padding: '8px 10px', fontSize: 11.5 }} type="button" onClick={() => onLogin(authService.demo('EMPLOYEE'))}>
              👤 Employee Demo
            </button>
          </div>
          <small className="demo-note">Connected to live SQLite database. Password for all: Admin@123</small>
        </form>
      </main>
    </div>
  )
}

function Stat({
  icon: Icon, label, value, delta, tone,
}: {
  icon: typeof Users
  label: string
  value: string
  delta: string
  tone: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}><Icon size={21} /></span>
        <MoreHorizontal size={19} />
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      <small className={tone}>{delta}</small>
    </div>
  )
}

function CardHead({
  title, sub, action, onAction,
}: {
  title: string
  sub: string
  action: string
  onAction?: () => void
}) {
  return (
    <div className="card-head">
      <div>
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>
      <button onClick={onAction}>
        {action} <ChevronDown size={15} />
      </button>
    </div>
  )
}

export default App
