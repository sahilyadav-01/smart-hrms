import { useEffect, useState } from 'react'
import {
  Bell, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Clock3, FileText, LayoutGrid, Menu, MoreHorizontal,
  Search, Settings, Sparkles, TrendingUp, UserRoundPlus, Users, X, Upload, Download,
  ShieldCheck, Lock, Building,
} from 'lucide-react'
import { authService, type AuthUser } from './services/auth.service'

type Page = 'Dashboard' | 'People' | 'Attendance' | 'Leave' | 'Payroll' | 'Recruitment' | 'Performance' | 'Documents' | 'Notifications' | 'Reports' | 'Settings'

type Employee = {
  name: string
  role: string
  dept: string
  status: 'Active' | 'On leave' | 'Remote'
  initials: string
  tone: string
  email?: string
}

const initialEmployees: Employee[] = [
  { name: 'Maya Patel', role: 'Product Designer', dept: 'Design', status: 'Active', initials: 'MP', tone: 'violet', email: 'maya.patel@acme.test' },
  { name: 'Arjun Mehta', role: 'Senior Engineer', dept: 'Engineering', status: 'Active', initials: 'AM', tone: 'blue', email: 'arjun.mehta@acme.test' },
  { name: 'Nisha Kapoor', role: 'HR Specialist', dept: 'People', status: 'On leave', initials: 'NK', tone: 'orange', email: 'nisha.kapoor@acme.test' },
  { name: 'Dev Sharma', role: 'Growth Manager', dept: 'Marketing', status: 'Active', initials: 'DS', tone: 'green', email: 'dev.sharma@acme.test' },
  { name: 'Sara Ali', role: 'Finance Analyst', dept: 'Finance', status: 'Remote', initials: 'SA', tone: 'pink', email: 'sara.ali@acme.test' },
]

const activity = [
  { icon: UserRoundPlus, title: 'Maya Patel joined the team', meta: 'Product Design · 2 hours ago', tone: 'purple' },
  { icon: CalendarDays, title: 'Leave request approved', meta: 'Nisha Kapoor · 4 hours ago', tone: 'green' },
  { icon: BriefcaseBusiness, title: 'New job opening published', meta: 'Senior Backend Engineer · Yesterday', tone: 'orange' },
]

const nav: { label: Page; icon: typeof LayoutGrid }[] = [
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
  const [page, setPage] = useState<Page>('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [openAddEmployee, setOpenAddEmployee] = useState(false)

  useEffect(() => {
    const expire = () => setUser(null)
    window.addEventListener('session-expired', expire)
    return () => window.removeEventListener('session-expired', expire)
  }, [])

  if (!user) return <LoginPage onLogin={setUser} />

  const signOut = async () => {
    await authService.logout()
    setUser(null)
  }

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev])
  }

  const firstName = user.employee?.firstName || (user.email ? user.email.split('@')[0] : 'there')

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark"><Sparkles size={19} /></span>
          <span>peoplely</span>
        </div>
        <button className="close-nav" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        <div className="workspace">
          <div className="company-avatar">A</div>
          <div><strong>Acme Studio</strong><small>Business workspace</small></div>
          <ChevronDown size={16} />
        </div>
        <nav>
          <p className="nav-label">WORKSPACE</p>
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={page === label ? 'active' : ''}
              onClick={() => { setPage(label); setMobileOpen(false) }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === 'Leave' && <em>4</em>}
            </button>
          ))}
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
        </nav>
        <button className="profile" onClick={signOut} title="Sign out">
          <div className="avatar avatar-dark">
            {user.employee ? `${user.employee.firstName[0]}${user.employee.lastName[0]}` : 'HR'}
          </div>
          <div>
            <strong>{user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email}</strong>
            <small>{user.demo ? 'Demo workspace · Sign out' : `${user.role.replaceAll('_', ' ')} · Sign out`}</small>
          </div>
          <MoreHorizontal size={18} />
        </button>
      </aside>
      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

      <main>
        <header>
          <button className="menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="search">
            <Search size={18} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people, documents, or actions..."
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setPage('Notifications')} aria-label="Notifications">
              <Bell size={19} /><i />
            </button>
            <button className="help" aria-label="Help">?</button>
          </div>
        </header>
        <div className="content">
          {page === 'Dashboard' ? (
            <Dashboard
              firstName={firstName}
              employees={employees}
              onPeople={() => { setPage('People'); setOpenAddEmployee(true) }}
            />
          ) : (
            <ModulePage
              page={page}
              search={search}
              employees={employees}
              onAddEmployee={handleAddEmployee}
              openAddEmployee={openAddEmployee}
              setOpenAddEmployee={setOpenAddEmployee}
            />
          )}
        </div>
      </main>
    </div>
  )
}

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
          <div className="divider"><span>or</span></div>
          <button className="demo-submit" type="button" onClick={() => onLogin(authService.demo())}>
            Explore the demo workspace
          </button>
          <small className="demo-note">Demo data stays in your browser. No server required.</small>
        </form>
      </main>
    </div>
  )
}

function Dashboard({ firstName, employees, onPeople }: { firstName: string; employees: Employee[]; onPeople: () => void }) {
  return (
    <>
      <section className="welcome">
        <div>
          <p>THURSDAY, OCTOBER 1</p>
          <h1>Good morning, {firstName} <span>👋</span></h1>
          <h2>Here’s what’s happening with your team today.</h2>
        </div>
        <button className="primary" onClick={onPeople}><UserRoundPlus size={18} /> Add employee</button>
      </section>
      <section className="stats-grid">
        <Stat icon={Users} label="Total employees" value={String(243 + employees.length)} delta="+12 this month" tone="purple" />
        <Stat icon={Clock3} label="Present today" value="231" delta="93.1% attendance" tone="green" />
        <Stat icon={CalendarDays} label="On leave" value="12" delta="4 requests pending" tone="orange" />
        <Stat icon={BriefcaseBusiness} label="Open positions" value="8" delta="36 candidates" tone="blue" />
      </section>
      <section className="dashboard-grid">
        <div className="card chart-card">
          <CardHead title="Attendance overview" sub="Daily attendance across this week" action="This week" />
          <div className="legend">
            <span><i className="dot purple-dot" />Present</span>
            <span><i className="dot pale-dot" />Away</span>
          </div>
          <div className="chart">
            {[['Mon', 82], ['Tue', 91], ['Wed', 77], ['Thu', 95], ['Fri', 68], ['Sat', 31], ['Sun', 24]].map(([day, val]) => (
              <div className="bar-col" key={day}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${val}%` }} />
                </div>
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card activity-card">
          <CardHead title="Recent activity" sub="Latest updates from your team" action="View all" />
          <div className="activity-list">
            {activity.map(({ icon: Icon, title, meta, tone }) => (
              <div className="activity" key={title}>
                <span className={`activity-icon ${tone}`}><Icon size={18} /></span>
                <div><strong>{title}</strong><small>{meta}</small></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="card team-card">
        <CardHead title="Team overview" sub="Quick glance at your people" action="View all employees" />
        <EmployeeTable rows={employees.slice(0, 5)} totalCount={employees.length} />
      </section>
    </>
  )
}

function ModulePage({
  page, search, employees, onAddEmployee, openAddEmployee, setOpenAddEmployee,
}: {
  page: Page
  search: string
  employees: Employee[]
  onAddEmployee: (emp: Employee) => void
  openAddEmployee: boolean
  setOpenAddEmployee: (val: boolean) => void
}) {
  if (page === 'People') {
    return (
      <PeoplePage
        search={search}
        employees={employees}
        onAddEmployee={onAddEmployee}
        open={openAddEmployee}
        setOpen={setOpenAddEmployee}
      />
    )
  }
  if (page === 'Attendance') return <AttendancePage />
  if (page === 'Leave') return <LeavePage />
  if (page === 'Payroll') return <PayrollPage />
  if (page === 'Recruitment') return <RecruitmentPage />
  if (page === 'Performance') return <PerformancePage />
  if (page === 'Documents') return <DocumentsPage search={search} />
  if (page === 'Notifications') return <NotificationsPage />
  if (page === 'Reports') return <ReportsPage />
  if (page === 'Settings') return <SettingsPage />
  return (
    <section className="empty-state card">
      <span><Sparkles /></span>
      <p>{page.toUpperCase()}</p>
      <h1>{page} is coming together</h1>
      <h2>This workspace is ready for the next module in the HRMS roadmap.</h2>
      <button className="primary">Start setup <ChevronRight size={18} /></button>
    </section>
  )
}

function PeoplePage({
  search, employees, onAddEmployee, open, setOpen,
}: {
  search: string
  employees: Employee[]
  onAddEmployee: (emp: Employee) => void
  open: boolean
  setOpen: (val: boolean) => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dept, setDept] = useState('Engineering')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<'Active' | 'Remote' | 'On leave'>('Active')
  const [notice, setNotice] = useState('')

  const tones = ['violet', 'blue', 'green', 'orange', 'pink']

  const handleExport = () => {
    const header = 'Name,Role,Department,Status,Email\n'
    const rows = employees.map(e => `"${e.name}","${e.role}","${e.dept}","${e.status}","${e.email || ''}"`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'employees.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setNotice('Employee directory exported successfully.')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !role.trim()) return
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
    const tone = tones[employees.length % tones.length]
    onAddEmployee({
      name: `${firstName.trim()} ${lastName.trim()}`,
      role: role.trim(),
      dept,
      status,
      initials,
      tone,
      email: email.trim(),
    })
    setFirstName('')
    setLastName('')
    setEmail('')
    setRole('')
    setOpen(false)
    setNotice(`Added ${firstName.trim()} ${lastName.trim()} to team directory.`)
  }

  const rows = employees.filter(e =>
    `${e.name} ${e.role} ${e.dept} ${e.email || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <section className="welcome">
        <div>
          <p>EMPLOYEE DIRECTORY</p>
          <h1>Your people</h1>
          <h2>Manage profiles, roles, teams, and employment details.</h2>
        </div>
        <button className="primary" onClick={() => setOpen(true)}><UserRoundPlus size={18} /> Add employee</button>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="card team-card">
        <CardHead
          title={`${rows.length} employees`}
          sub="All active and away team members"
          action="Export"
          onAction={handleExport}
        />
        <EmployeeTable rows={rows} totalCount={employees.length} />
      </section>

      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <form className="leave-modal" onSubmit={handleSubmit} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>NEW PROFILE</p>
                <h2>Add employee</h2>
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
            <label>Work email
              <input type="email" placeholder="priyal.verma@acme.test" value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <div className="form-row">
              <label>Department
                <select value={dept} onChange={e => setDept(e.target.value)}>
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>People</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>Operations</option>
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
              <input required placeholder="e.g. Frontend Engineer" value={role} onChange={e => setRole(e.target.value)} />
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
  const funnel = [
    ['Applied', 156],
    ['Screening', 92],
    ['Interview', 48],
    ['Offer', 18],
    ['Hired', 12],
  ]

  const handleExport = () => {
    setNotice('Workforce summary report generated and downloaded.')
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>PEOPLE ANALYTICS</p>
          <h1>Reports & analytics</h1>
          <h2>Understand workforce trends and make informed people decisions.</h2>
        </div>
        <div className="report-actions">
          <select value={range} onChange={e => setRange(e.target.value)}>
            <option>This year</option>
            <option>Last 6 months</option>
            <option>This quarter</option>
          </select>
          <button className="primary" onClick={handleExport}><Download size={17} /> Export report</button>
        </div>
      </section>

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="stats-grid">
        <Stat icon={Users} label="Total headcount" value="248" delta="+9.7% year over year" tone="purple" />
        <Stat icon={TrendingUp} label="Retention rate" value="94.2%" delta="+1.8% from last year" tone="green" />
        <Stat icon={Clock3} label="Attendance rate" value="93.1%" delta="+0.6% this quarter" tone="blue" />
        <Stat icon={BriefcaseBusiness} label="Time to hire" value="24d" delta="4 days faster" tone="orange" />
      </section>

      <section className="analytics-grid">
        <div className="card headcount-chart">
          <CardHead title="Headcount growth" sub={`Workforce size · ${range}`} action="Monthly" />
          <div className="line-chart">
            <div className="y-labels">
              <span>250</span><span>225</span><span>200</span><span>175</span>
            </div>
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
          <CardHead title="By department" sub="Current headcount mix" action="248 total" />
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

      <section className="analytics-grid lower">
        <div className="card funnel-chart">
          <CardHead title="Recruitment funnel" sub="Candidate conversion this year" action="8 open roles" />
          <div className="funnel-bars">
            {funnel.map(([stage, count], index) => (
              <div key={stage}>
                <span>{stage}</span>
                <i style={{ width: `${100 - index * 14}%` }} />
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="card insight-card">
          <CardHead title="Smart insights" sub="Patterns worth your attention" action="View all" />
          <div className="insight">
            <span className="positive"><TrendingUp /></span>
            <div><strong>Retention is improving</strong><p>Engineering retention rose 4.2% compared with last quarter.</p></div>
          </div>
          <div className="insight">
            <span className="warning"><Clock3 /></span>
            <div><strong>Attendance needs attention</strong><p>Monday late arrivals are 18% above the weekly average.</p></div>
          </div>
          <div className="insight">
            <span className="info"><Users /></span>
            <div><strong>Hiring momentum</strong><p>Time-to-hire improved by four days across technical roles.</p></div>
          </div>
        </div>
      </section>
    </>
  )
}

function NotificationsPage() {
  const [read, setRead] = useState<string[]>([])
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const [published, setPublished] = useState(false)
  const [announcements, setAnnouncements] = useState([
    { tag: 'COMPANY', title: 'Diwali holiday schedule', body: 'Our offices will be closed from 8–10 November. Enjoy the festive break with your family!', meta: 'Published today · People team' },
    { tag: 'WELLNESS', title: 'Annual health checkup', body: 'Book your complimentary health screening before 31 October.', meta: '3 days ago · Benefits team' },
  ])
  const [newTitle, setNewTitle] = useState('')
  const [newTag, setNewTag] = useState('COMPANY')
  const [newMessage, setNewMessage] = useState('')

  const notifications = [
    ['leave', 'Leave request approved', 'Your casual leave for 12–13 October has been approved.', '12 minutes ago', 'success'],
    ['review', 'Self-review due soon', 'Complete your H2 2026 self-assessment by 13 October.', '2 hours ago', 'warning'],
    ['payroll', 'September payslip is ready', 'Your latest payslip is available to view and download.', 'Yesterday', 'info'],
    ['document', 'Document expires soon', 'Your address proof will expire in 21 days.', '2 days ago', 'warning'],
  ]

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newMessage.trim()) return
    setAnnouncements(prev => [
      {
        tag: newTag.toUpperCase(),
        title: newTitle.trim(),
        body: newMessage.trim(),
        meta: 'Published just now · You',
      },
      ...prev,
    ])
    setNewTitle('')
    setNewMessage('')
    setAnnouncementOpen(false)
    setPublished(true)
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>INBOX & UPDATES</p>
          <h1>Notifications</h1>
          <h2>Stay on top of requests, reminders, and company updates.</h2>
        </div>
        <button className="primary" onClick={() => setAnnouncementOpen(true)}><Bell size={18} /> New announcement</button>
      </section>

      {published && (
        <div className="notice">
          <span>✓</span>Your announcement is now live.
          <button onClick={() => setPublished(false)}>×</button>
        </div>
      )}

      <section className="notification-layout">
        <div className="card notification-card">
          <div className="notification-head">
            <div>
              <h3>Recent notifications</h3>
              <p>{Math.max(0, notifications.length - read.length)} unread messages</p>
            </div>
            <button onClick={() => setRead(notifications.map(n => n[0]))}>Mark all as read</button>
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
          <CardHead title="Announcements" sub="Latest from Acme Studio" action="View all" />
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
                <p>COMPANY UPDATE</p>
                <h2>New announcement</h2>
              </div>
              <button type="button" onClick={() => setAnnouncementOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Title
              <input required minLength={3} placeholder="Announcement title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </label>
            <div className="form-row">
              <label>Category
                <select value={newTag} onChange={e => setNewTag(e.target.value)}>
                  <option value="COMPANY">Company</option>
                  <option value="WELLNESS">Wellness</option>
                  <option value="CULTURE">Culture</option>
                  <option value="OPS">Operations</option>
                </select>
              </label>
              <label>Audience
                <select>
                  <option>Everyone</option>
                  <option>Managers</option>
                  <option>Employees</option>
                </select>
              </label>
            </div>
            <label>Message
              <textarea required minLength={10} placeholder="Share an update with your team..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setAnnouncementOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Publish</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function DocumentsPage({ search = '' }: { search?: string }) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [notice, setNotice] = useState('')
  const [docs, setDocs] = useState([
    ['Employment contract', 'Employment', 'PDF · 1.2 MB', '28 Sep 2026', 'Verified'],
    ['PAN card', 'Identity', 'PDF · 820 KB', '12 Jan 2026', 'Verified'],
    ['Degree certificate', 'Education', 'PDF · 2.4 MB', '12 Jan 2026', 'Pending'],
    ['Address proof', 'Identity', 'PDF · 940 KB', '8 Aug 2026', 'Expires soon'],
  ])
  const [docName, setDocName] = useState('')
  const [category, setCategory] = useState('Identity')

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docName.trim()) return
    setDocs(prev => [
      [docName.trim(), category, 'PDF · 1.1 MB', 'Just now', 'Pending'],
      ...prev,
    ])
    setDocName('')
    setUploadOpen(false)
    setUploaded(true)
  }

  const handleDownload = (name: string) => {
    setNotice(`Downloading ${name}...`)
    setTimeout(() => setNotice(''), 2500)
  }

  const filteredDocs = docs.filter(d =>
    d[0].toLowerCase().includes(search.toLowerCase()) || d[1].toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <section className="welcome">
        <div>
          <p>EMPLOYEE RECORDS</p>
          <h1>Documents</h1>
          <h2>Store, verify, and manage your employment documents securely.</h2>
        </div>
        <button className="primary" onClick={() => setUploadOpen(true)}><Upload size={18} /> Upload document</button>
      </section>

      {uploaded && (
        <div className="notice">
          <span>✓</span>Your document was uploaded and is awaiting verification.
          <button onClick={() => setUploaded(false)}>×</button>
        </div>
      )}

      {notice && (
        <div className="notice">
          <span>✓</span>{notice}
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <section className="document-stats">
        <div className="card"><span><FileText /></span><div><strong>{docs.length}</strong><small>Total documents</small></div></div>
        <div className="card"><span className="verified"><ShieldCheck /></span><div><strong>{docs.filter(d => d[4] === 'Verified').length}</strong><small>Verified</small></div></div>
        <div className="card"><span className="pending"><Clock3 /></span><div><strong>{docs.filter(d => d[4] === 'Pending').length}</strong><small>Pending review</small></div></div>
        <div className="card"><span className="expiry"><CalendarDays /></span><div><strong>{docs.filter(d => d[4] === 'Expires soon').length}</strong><small>Expiring soon</small></div></div>
      </section>

      <section className="document-layout">
        <div className="card team-card">
          <CardHead title="My documents" sub="Files connected to your employee profile" action="All categories" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                  <th></th>
                </tr>
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
                      <button className="download-btn" onClick={() => handleDownload(row[0])} title="Download file">
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
          <CardHead title="Required documents" sub="Profile compliance" action="75%" />
          <div className="compliance-ring"><div><strong>3/4</strong><small>Complete</small></div></div>
          <ul>
            <li className="done">✓ Identity proof</li>
            <li className="done">✓ Employment contract</li>
            <li className="done">✓ Education certificate</li>
            <li>! Bank details</li>
          </ul>
          <button onClick={() => setUploadOpen(true)}>Complete profile</button>
        </aside>
      </section>

      {uploadOpen && (
        <div className="modal-backdrop" onMouseDown={() => setUploadOpen(false)}>
          <form className="leave-modal" onSubmit={handleUpload} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>DOCUMENT VAULT</p>
                <h2>Upload document</h2>
              </div>
              <button type="button" onClick={() => setUploadOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Document name
              <input required placeholder="e.g. Passport or Address Proof" value={docName} onChange={e => setDocName(e.target.value)} />
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
              <strong>Choose a file</strong>
              <small>PDF, JPG or PNG · maximum 5 MB</small>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setUploadOpen(false)}>Cancel</button>
              <button className="primary" type="submit">Upload document</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function PerformancePage() {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const goals = [
    ['Launch employee mobile experience', 'Product delivery', '72', '15 Dec 2026'],
    ['Improve design system adoption', 'Operational excellence', '88', '30 Nov 2026'],
    ['Mentor two junior designers', 'People development', '55', '20 Dec 2026'],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>GROWTH & DEVELOPMENT</p>
          <h1>Performance</h1>
          <h2>Track goals, share feedback, and complete performance reviews.</h2>
        </div>
        <button className="primary" onClick={() => setReviewOpen(true)}><TrendingUp size={18} /> Start self-review</button>
      </section>

      {submitted && (
        <div className="notice">
          <span>✓</span>Your self-review was submitted and forwarded to your manager.
          <button onClick={() => setSubmitted(false)}>×</button>
        </div>
      )}

      <section className="performance-hero card">
        <div>
          <span className="cycle-badge">ACTIVE CYCLE</span>
          <h2>H2 2026 Performance Review</h2>
          <p>July 1 – December 31, 2026</p>
          <div className="cycle-progress">
            <i style={{ width: submitted ? '75%' : '50%' }} />
            <span>{submitted ? 'Manager review in progress' : 'Self review due in 12 days'}</span>
          </div>
        </div>
        <div className="score-ring"><div><strong>4.2</strong><small>Last rating</small></div></div>
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
          <CardHead title="My goals" sub="3 goals · 72% overall progress" action="Add goal" />
          <div className="goal-list">
            {goals.map(([title, category, progress, date]) => (
              <div className="goal" key={title}>
                <div className="goal-top">
                  <span>{category}</span>
                  <MoreHorizontal size={17} />
                </div>
                <strong>{title}</strong>
                <small>Due {date}</small>
                <div className="goal-progress">
                  <i style={{ width: `${progress}%` }} />
                  <span>{progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card feedback-card">
          <CardHead title="Recent feedback" sub="Recognition from your team" action="View all" />
          <div className="feedback-quote">“Brought clarity to complex people workflows and helped the entire organization move with speed and confidence.”</div>
          <div className="feedback-author">
            <div className="avatar blue">AM</div>
            <div><strong>Arjun Mehta</strong><small>Engineering Lead · 2 weeks ago</small></div>
          </div>
          <div className="skills">
            <p>Core competencies</p>
            <span>Collaboration <b>4.5</b></span>
            <span>Ownership <b>4.2</b></span>
            <span>Quality <b>4.4</b></span>
          </div>
        </div>
      </section>

      {reviewOpen && (
        <div className="modal-backdrop" onMouseDown={() => setReviewOpen(false)}>
          <form className="leave-modal review-modal" onSubmit={e => { e.preventDefault(); setReviewOpen(false); setSubmitted(true) }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>H2 2026 REVIEW</p>
                <h2>Self assessment</h2>
              </div>
              <button type="button" onClick={() => setReviewOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Overall rating
              <select required defaultValue="4">
                <option value="5">5 — Exceptional</option>
                <option value="4">4 — Exceeds expectations</option>
                <option value="3">3 — Meets expectations</option>
                <option value="2">2 — Developing</option>
                <option value="1">1 — Needs improvement</option>
              </select>
            </label>
            <label>What accomplishments are you most proud of?
              <textarea required minLength={10} placeholder="Describe your key outcomes and highlights..." defaultValue="Successfully built modern responsive HR workflows, streamlined employee onboarding, and improved platform performance." />
            </label>
            <label>Where would you like to grow?
              <textarea required minLength={10} placeholder="Share development areas and desired support..." defaultValue="Deepen knowledge in automated payroll integrations and enterprise compliance tooling." />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setReviewOpen(false)}>Save draft</button>
              <button className="primary" type="submit">Submit review</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

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
    setStages(prev => prev.map(s => {
      if (s.name === targetStage) {
        return {
          ...s,
          count: s.count + 1,
          people: [[candidateName.trim(), candidateRole, initials], ...s.people],
        }
      }
      return s
    }))
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
          <h1>Recruitment</h1>
          <h2>Manage openings, candidates, interviews, and offers.</h2>
        </div>
        <button className="primary" onClick={() => setModal(true)}><BriefcaseBusiness size={18} /> Create job</button>
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
        <Stat icon={TrendingUp} label="Offer acceptance" value="84%" delta="+6% this quarter" tone="green" />
      </section>

      <section className="recruit-toolbar card">
        <div><strong>Hiring pipeline</strong><small>{stages.reduce((acc, s) => acc + s.count, 0)} active applications</small></div>
        <div className="pipeline-actions">
          <button><Search size={15} /> Filter</button>
          <button>All jobs <ChevronDown size={14} /></button>
        </div>
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
                  <span>{stage.name === 'Interview' ? 'Tomorrow, 11:00' : 'Updated today'}</span>
                  <b>★ {i ? 4.5 : 4.8}</b>
                </div>
              </div>
            ))}
            <button
              className="add-candidate"
              onClick={() => {
                setTargetStage(stage.name)
                setCandidateModal(true)
              }}
            >
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
                <p>NEW OPENING</p>
                <h2>Create job</h2>
              </div>
              <button type="button" onClick={() => setModal(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Job title
              <input required placeholder="e.g. Senior Backend Engineer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
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
                  <option>Part time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>
            </div>
            <label>Description
              <textarea required minLength={15} placeholder="Responsibilities, skills, and role requirements..." defaultValue="We are looking for a skilled professional to join our growing product team." />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setModal(false)}>Cancel</button>
              <button className="primary" type="submit">Create draft</button>
            </div>
          </form>
        </div>
      )}

      {candidateModal && (
        <div className="modal-backdrop" onMouseDown={() => setCandidateModal(false)}>
          <form className="leave-modal" onSubmit={handleAddCandidate} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>PIPELINE</p>
                <h2>Add candidate</h2>
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
              <button className="primary" type="submit">Add to pipeline</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function PayrollPage() {
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const payroll = [
    ['September 2026', '₹82,500', '₹12,300', '₹70,200', 'Paid'],
    ['August 2026', '₹82,500', '₹12,300', '₹70,200', 'Paid'],
    ['July 2026', '₹80,000', '₹11,850', '₹68,150', 'Paid'],
    ['June 2026', '₹80,000', '₹11,850', '₹68,150', 'Paid'],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>COMPENSATION</p>
          <h1>Payroll</h1>
          <h2>Process salaries, review costs, and manage employee payslips.</h2>
        </div>
        <button className="primary" onClick={() => setProcessing(true)}><CircleDollarSign size={18} /> Run payroll</button>
      </section>

      {processed && (
        <div className="notice">
          <span>✓</span>October payroll was processed successfully.
          <button onClick={() => setProcessed(false)}>×</button>
        </div>
      )}

      <section className="stats-grid payroll-stats">
        <Stat icon={CircleDollarSign} label="October payroll" value="₹18.4L" delta="248 employees" tone="purple" />
        <Stat icon={TrendingUp} label="Total earnings" value="₹21.2L" delta="+3.2% from Sep" tone="green" />
        <Stat icon={FileText} label="Deductions" value="₹2.8L" delta="Tax and benefits" tone="orange" />
        <Stat icon={Clock3} label="Payment status" value={processed ? 'Paid' : 'Draft'} delta="Due 28 October" tone="blue" />
      </section>

      <section className="payroll-layout">
        <div className="card payroll-chart">
          <CardHead title="Payroll cost overview" sub="Net salary paid in the last six months" action="Last 6 months" />
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
          <CardHead title="October breakdown" sub="Estimated payroll composition" action="Details" />
          <div className="donut"><div><strong>₹21.2L</strong><small>Gross payroll</small></div></div>
          <ul>
            <li><i className="earnings" />Basic salary <strong>₹14.1L</strong></li>
            <li><i className="benefits" />HRA & allowances <strong>₹7.1L</strong></li>
            <li><i className="deductions" />Deductions <strong>₹2.8L</strong></li>
          </ul>
        </div>
      </section>

      <section className="card team-card">
        <CardHead title="My payslips" sub="Salary statements and payment history" action="2026" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pay period</th>
                <th>Gross salary</th>
                <th>Deductions</th>
                <th>Net salary</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payroll.map(row => (
                <tr key={row[0]}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td><strong>{row[3]}</strong></td>
                  <td><span className="status approved"><i />{row[4]}</span></td>
                  <td><button className="payslip-btn"><FileText size={14} /> Payslip</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {processing && (
        <div className="modal-backdrop" onMouseDown={() => setProcessing(false)}>
          <form className="leave-modal" onSubmit={e => { e.preventDefault(); setProcessing(false); setProcessed(true) }} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>PAYROLL RUN</p>
                <h2>Process October payroll</h2>
              </div>
              <button type="button" onClick={() => setProcessing(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <div className="payroll-confirm">
              <span><CircleDollarSign size={22} /></span>
              <div><strong>248 employees</strong><small>Estimated net payout ₹18,40,000</small></div>
            </div>
            <label>Payment date
              <input type="date" required defaultValue="2026-10-28" />
            </label>
            <label>Review note
              <textarea placeholder="Optional notes for accounting..." />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setProcessing(false)}>Cancel</button>
              <button className="primary" type="submit">Process payroll</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

function LeavePage() {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [startDate, setStartDate] = useState('2026-10-15')
  const [endDate, setEndDate] = useState('2026-10-16')
  const [reason, setReason] = useState('')

  const balances = [
    ['Casual Leave', '8', '12', 'purple'],
    ['Sick Leave', '7', '10', 'green'],
    ['Earned Leave', '14', '18', 'blue'],
    ['Work from home', '20', '24', 'orange'],
  ]

  const [requests, setRequests] = useState([
    ['Casual Leave', '12 Oct – 13 Oct', '2 days', 'Pending'],
    ['Sick Leave', '14 Sep', '1 day', 'Approved'],
    ['Earned Leave', '3 Aug – 7 Aug', '5 days', 'Approved'],
  ])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRequests(prev => [
      [leaveType, `${startDate} – ${endDate}`, '2 days', 'Pending'],
      ...prev,
    ])
    setOpen(false)
    setSubmitted(true)
    setReason('')
  }

  return (
    <>
      <section className="welcome">
        <div>
          <p>TIME OFF</p>
          <h1>Leave management</h1>
          <h2>Review your balance, request time off, and track approvals.</h2>
        </div>
        <button className="primary" onClick={() => setOpen(true)}><CalendarDays size={18} /> Request leave</button>
      </section>

      {submitted && (
        <div className="notice">
          <span>✓</span>Your leave request was submitted for approval.
          <button onClick={() => setSubmitted(false)}>×</button>
        </div>
      )}

      <section className="leave-balances">
        {balances.map(([name, remaining, total, tone]) => (
          <div className="card balance-card" key={name}>
            <span className={`balance-icon ${tone}`}><CalendarDays size={18} /></span>
            <div>
              <p>{name}</p>
              <strong>{remaining}</strong>
              <small> of {total} days available</small>
            </div>
            <div className="balance-track">
              <i style={{ width: `${(Number(remaining) / Number(total)) * 100}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="card team-card">
        <CardHead title="My leave requests" sub="Recent requests and approval status" action="All requests" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Leave type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row, i) => (
                <tr key={i}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td><span className={`status ${row[3].toLowerCase()}`}><i />{row[3]}</span></td>
                  <td><MoreHorizontal size={18} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <form className="leave-modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p>NEW REQUEST</p>
                <h2>Request leave</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close modal"><X size={19} /></button>
            </div>
            <label>Leave type
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>Work from home</option>
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

function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)
  const [startedAt, setStartedAt] = useState('')
  const [notice, setNotice] = useState('')

  const checkIn = () => {
    const now = new Date()
    setCheckedIn(true)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setStartedAt(timeStr)
    setNotice(`Checked in successfully at ${timeStr}`)
  }

  const checkOut = () => {
    const now = new Date()
    setCheckedOut(true)
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setNotice(`Checked out successfully at ${timeStr}. Workday completed!`)
  }

  const days = [
    ['Mon, 28 Sep', '09:02 AM', '06:04 PM', '9h 02m', 'Present'],
    ['Tue, 29 Sep', '09:18 AM', '06:11 PM', '8h 53m', 'Present'],
    ['Wed, 30 Sep', '09:42 AM', '06:20 PM', '8h 38m', 'Late'],
    [
      'Thu, 1 Oct',
      startedAt || '—',
      checkedOut ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      checkedOut ? 'Completed' : checkedIn ? 'In progress' : 'Not started',
      checkedIn ? 'Present' : 'Absent',
    ],
  ]

  return (
    <>
      <section className="welcome">
        <div>
          <p>TIME & ATTENDANCE</p>
          <h1>Attendance</h1>
          <h2>Track your working hours and monthly attendance.</h2>
        </div>
        <div className="today-date">Thursday, 1 October</div>
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
          <p>TODAY'S STATUS</p>
          <h3>{checkedOut ? 'Day completed' : checkedIn ? 'You’re checked in' : 'Ready to start?'}</h3>
          <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
          <small>{checkedIn ? `Started at ${startedAt}` : 'Standard shift · 9:00 AM – 6:00 PM'}</small>
          <button
            className={`clock-action ${checkedIn ? 'danger' : ''}`}
            disabled={checkedOut}
            onClick={checkedIn ? checkOut : checkIn}
          >
            {checkedOut ? 'Checked out' : checkedIn ? 'Check out' : 'Check in now'}
          </button>
        </div>

        <div className="attendance-summary">
          <Stat icon={Clock3} label="Hours this week" value="26.5h" delta="Target 40h" tone="purple" />
          <Stat icon={CalendarDays} label="Days present" value="19" delta="95% this month" tone="green" />
          <Stat icon={TrendingUp} label="Average arrival" value="9:14" delta="6 min earlier" tone="blue" />
          <Stat icon={Clock3} label="Late arrivals" value="2" delta="Down from 4" tone="orange" />
        </div>
      </section>

      <section className="card team-card attendance-table">
        <CardHead title="Recent attendance" sub="Your latest workday records" action="October 2026" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check in</th>
                <th>Check out</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {days.map(d => (
                <tr key={d[0]}>
                  {d.slice(0, 4).map((v, i) => <td key={i}>{v}</td>)}
                  <td><span className={`status ${d[4].toLowerCase()}`}><i />{d[4]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
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
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST +05:30)')
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
                <p>Manage your company branding and primary organization details.</p>
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
                <label>Timezone
                  <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                    <option>Asia/Kolkata (IST +05:30)</option>
                    <option>Europe/London (GMT +00:00)</option>
                    <option>America/New_York (EST -05:00)</option>
                    <option>Asia/Singapore (SGT +08:00)</option>
                  </select>
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
                <label>Weekend policy
                  <select defaultValue="Sat-Sun">
                    <option value="Sat-Sun">Saturday & Sunday off</option>
                    <option value="Sun">Sunday only off</option>
                    <option value="Alt-Sat">Alternate Saturdays off</option>
                  </select>
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
                <div className="toggle-row">
                  <div>
                    <strong>Session timeout</strong>
                    <small>Automatically expire inactive browser sessions.</small>
                  </div>
                  <select style={{ width: 'auto', padding: '6px 12px' }} defaultValue="8h">
                    <option value="4h">4 hours</option>
                    <option value="8h">8 hours</option>
                    <option value="24h">24 hours</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ marginTop: '24px' }}>
              <button className="primary" type="submit">Save changes</button>
            </div>
          </form>
        </section>
      </div>
    </>
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

function EmployeeTable({ rows, totalCount }: { rows: Employee[]; totalCount: number }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(e => (
            <tr key={e.name}>
              <td>
                <div className={`avatar ${e.tone}`}>{e.initials}</div>
                <div><strong>{e.name}</strong><small>{e.role}</small></div>
              </td>
              <td>{e.dept}</td>
              <td><span className={`status ${e.status.toLowerCase().replace(' ', '-')}`}><i />{e.status}</span></td>
              <td><MoreHorizontal size={18} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <span>Showing {rows.length} of {totalCount} employees</span>
        <div>
          <button aria-label="Previous page"><ChevronLeft size={16} /></button>
          <button aria-label="Next page"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  )
}

export default App
