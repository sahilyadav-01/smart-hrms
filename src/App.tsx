import { useState } from 'react'
import {
  Bell, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleDollarSign, Clock3, FileText, Gauge, LayoutGrid, Menu, MoreHorizontal,
  Search, Settings, Sparkles, TrendingUp, UserRoundPlus, Users, X,
} from 'lucide-react'

type Page = 'Dashboard' | 'People' | 'Attendance' | 'Leave' | 'Payroll' | 'Recruitment' | 'Documents'

const nav: { label: Page; icon: typeof Gauge }[] = [
  { label: 'Dashboard', icon: LayoutGrid }, { label: 'People', icon: Users },
  { label: 'Attendance', icon: Clock3 }, { label: 'Leave', icon: CalendarDays },
  { label: 'Payroll', icon: CircleDollarSign }, { label: 'Recruitment', icon: BriefcaseBusiness },
  { label: 'Documents', icon: FileText },
]

const employees = [
  { name: 'Maya Patel', role: 'Product Designer', dept: 'Design', status: 'Active', initials: 'MP', tone: 'violet' },
  { name: 'Arjun Mehta', role: 'Senior Engineer', dept: 'Engineering', status: 'Active', initials: 'AM', tone: 'blue' },
  { name: 'Nisha Kapoor', role: 'HR Specialist', dept: 'People', status: 'On leave', initials: 'NK', tone: 'orange' },
  { name: 'Dev Sharma', role: 'Growth Manager', dept: 'Marketing', status: 'Active', initials: 'DS', tone: 'green' },
  { name: 'Sara Ali', role: 'Finance Analyst', dept: 'Finance', status: 'Remote', initials: 'SA', tone: 'pink' },
]

const activity = [
  { icon: UserRoundPlus, title: 'Maya Patel joined the team', meta: 'Product Design · 2 hours ago', tone: 'purple' },
  { icon: CalendarDays, title: 'Leave request approved', meta: 'Nisha Kapoor · 4 hours ago', tone: 'green' },
  { icon: BriefcaseBusiness, title: 'New job opening published', meta: 'Senior Backend Engineer · Yesterday', tone: 'orange' },
]

function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sparkles size={19}/></span><span>peoplely</span></div>
      <button className="close-nav" onClick={() => setMobileOpen(false)}><X /></button>
      <div className="workspace"><div className="company-avatar">A</div><div><strong>Acme Studio</strong><small>Business workspace</small></div><ChevronDown size={16}/></div>
      <nav>
        <p className="nav-label">WORKSPACE</p>
        {nav.map(({ label, icon: Icon }) => <button key={label} className={page === label ? 'active' : ''} onClick={() => {setPage(label); setMobileOpen(false)}}><Icon size={19}/><span>{label}</span>{label === 'Leave' && <em>4</em>}</button>)}
        <p className="nav-label nav-spacer">MANAGE</p>
        <button><TrendingUp size={19}/><span>Reports</span></button>
        <button><Settings size={19}/><span>Settings</span></button>
      </nav>
      <div className="profile"><div className="avatar avatar-dark">SK</div><div><strong>Sahil Kumar</strong><small>HR Administrator</small></div><MoreHorizontal size={18}/></div>
    </aside>
    {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} />}

    <main>
      <header>
        <button className="menu-btn" onClick={() => setMobileOpen(true)}><Menu/></button>
        <div className="search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people, documents, or actions..."/><kbd>⌘ K</kbd></div>
        <div className="header-actions"><button className="icon-btn"><Bell size={19}/><i/></button><button className="help">?</button></div>
      </header>
      <div className="content">
        {page === 'Dashboard' ? <Dashboard onPeople={() => setPage('People')} /> : <ModulePage page={page} search={search} />}
      </div>
    </main>
  </div>
}

function Dashboard({ onPeople }: { onPeople: () => void }) {
  return <>
    <section className="welcome"><div><p>THURSDAY, OCTOBER 1</p><h1>Good morning, Sahil <span>👋</span></h1><h2>Here’s what’s happening with your team today.</h2></div><button className="primary" onClick={onPeople}><UserRoundPlus size={18}/> Add employee</button></section>
    <section className="stats-grid">
      <Stat icon={Users} label="Total employees" value="248" delta="+12 this month" tone="purple" />
      <Stat icon={Clock3} label="Present today" value="231" delta="93.1% attendance" tone="green" />
      <Stat icon={CalendarDays} label="On leave" value="12" delta="4 requests pending" tone="orange" />
      <Stat icon={BriefcaseBusiness} label="Open positions" value="8" delta="36 candidates" tone="blue" />
    </section>
    <section className="dashboard-grid">
      <div className="card chart-card">
        <CardHead title="Attendance overview" sub="Daily attendance across this week" action="This week" />
        <div className="legend"><span><i className="dot purple-dot"/>Present</span><span><i className="dot pale-dot"/>Away</span></div>
        <div className="chart">
          {[['Mon',82],['Tue',91],['Wed',77],['Thu',95],['Fri',68],['Sat',31],['Sun',24]].map(([day, val]) => <div className="bar-col" key={day}><div className="bar-track"><div className="bar-fill" style={{height: `${val}%`}}/></div><span>{day}</span></div>)}
        </div>
      </div>
      <div className="card activity-card"><CardHead title="Recent activity" sub="Latest updates from your team" action="View all" />
        <div className="activity-list">{activity.map(({icon: Icon, title, meta, tone}) => <div className="activity" key={title}><span className={`activity-icon ${tone}`}><Icon size={18}/></span><div><strong>{title}</strong><small>{meta}</small></div></div>)}</div>
      </div>
    </section>
    <section className="card team-card"><CardHead title="Team overview" sub="Quick glance at your people" action="View all employees" />
      <EmployeeTable rows={employees.slice(0,4)} />
    </section>
  </>
}

function ModulePage({ page, search }: { page: Page; search: string }) {
  if (page === 'People') {
    const rows = employees.filter(e => `${e.name} ${e.role} ${e.dept}`.toLowerCase().includes(search.toLowerCase()))
    return <><section className="welcome"><div><p>EMPLOYEE DIRECTORY</p><h1>Your people</h1><h2>Manage profiles, roles, teams, and employment details.</h2></div><button className="primary"><UserRoundPlus size={18}/> Add employee</button></section><section className="card team-card"><CardHead title={`${rows.length} employees`} sub="All active and away team members" action="Export"/><EmployeeTable rows={rows}/></section></>
  }
  return <section className="empty-state card"><span><Sparkles/></span><p>{page.toUpperCase()}</p><h1>{page} is coming together</h1><h2>This workspace is ready for the next module in the HRMS roadmap.</h2><button className="primary">Start setup <ChevronRight size={18}/></button></section>
}

function Stat({ icon: Icon, label, value, delta, tone }: { icon: typeof Users; label: string; value: string; delta: string; tone: string }) {
  return <div className="stat-card"><div className="stat-top"><span className={`stat-icon ${tone}`}><Icon size={21}/></span><MoreHorizontal size={19}/></div><p>{label}</p><strong>{value}</strong><small className={tone}>{delta}</small></div>
}
function CardHead({title, sub, action}:{title:string;sub:string;action:string}) { return <div className="card-head"><div><h3>{title}</h3><p>{sub}</p></div><button>{action} <ChevronDown size={15}/></button></div> }
function EmployeeTable({ rows }: { rows: typeof employees }) { return <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Department</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(e => <tr key={e.name}><td><div className={`avatar ${e.tone}`}>{e.initials}</div><div><strong>{e.name}</strong><small>{e.role}</small></div></td><td>{e.dept}</td><td><span className={`status ${e.status.toLowerCase().replace(' ','-')}`}><i/>{e.status}</span></td><td><MoreHorizontal size={18}/></td></tr>)}</tbody></table><div className="table-footer"><span>Showing {rows.length} of 248 employees</span><div><button><ChevronLeft size={16}/></button><button><ChevronRight size={16}/></button></div></div></div> }

export default App
