import { Building2, LayoutDashboard, Users, CalendarCheck, Plane, Wallet, UserPlus, Network, ShieldCheck, BarChart3, Clock, Bell, Cake } from 'lucide-react';
import createApp from './core/createApp.jsx';
import { HRProvider } from './lib/hr.jsx';
import './lib/ws.css';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Attendance from './pages/Attendance.jsx';
import Leave from './pages/Leave.jsx';
import Payroll from './pages/Payroll.jsx';
import Recruitment from './pages/Recruitment.jsx';
import OrgChart from './pages/OrgChart.jsx';

export default createApp({
  name: 'WorkSphere',
  storageKey: 'worksphere',
  logo: Building2,
  accent: ['#6366f1', '#8b5cf6'],
  defaultTheme: 'light',
  github: 'https://github.com/PreciousBharath/WORKSPHERE-HRMS-PORTAL',
  stack: 'HRMS · Recharts · Drag & drop',
  Provider: HRProvider,
  heroTitle: 'Everything HR, in one beautiful workspace.',
  heroText: 'Manage people, attendance, leave, payroll, hiring and your org chart — with real-time dashboards built for growing Indian teams.',
  heroFeatures: [
    [Clock, 'Attendance & clock-in', 'Live shift timer, calendars and team status'],
    [Wallet, 'Payroll in one click', 'Indian salary structure, PF, PT and TDS payslips'],
    [BarChart3, 'People analytics', 'Headcount, diversity, attendance trends'],
  ],
  heroStats: [['55', 'employees'], ['8', 'departments'], ['5', 'hiring stages']],
  registerText: 'Set up your HR workspace in under a minute',
  roles: ['HR Admin', 'Manager', 'Employee', 'Recruiter', 'Finance'],
  demo: { name: 'Bharath Kumar', email: 'demo@worksphere.app', password: 'Demo@1234', role: 'HR Admin' },
  promo: ['🪔 Diwali bonus', 'Run an off-cycle payroll for festive bonuses.'],
  notifications: [[Plane, '3 leave requests pending', 'Sick, casual and earned leave'], [UserPlus, 'Imran accepted the offer', 'QA Engineer · joins next month'], [Cake, 'Birthdays this week', 'Send wishes from the dashboard']],
  nav: [
    { section: 'Overview', items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, page: Dashboard },
      { to: '/employees', label: 'Employees', icon: Users, page: Employees },
      { to: '/org', label: 'Org chart', icon: Network, page: OrgChart },
    ] },
    { section: 'Operations', items: [
      { to: '/attendance', label: 'Attendance', icon: CalendarCheck, page: Attendance },
      { to: '/leave', label: 'Leave', icon: Plane, page: Leave, tag: '3' },
      { to: '/payroll', label: 'Payroll', icon: Wallet, page: Payroll },
      { to: '/hiring', label: 'Recruitment', icon: UserPlus, page: Recruitment },
    ] },
  ],
});
