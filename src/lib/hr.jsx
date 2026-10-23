import { createContext, useContext } from 'react';
import { usePersist } from '../core/context.jsx';
import { rng, pick, uid } from '../core/store.js';

export const DEPTS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'HR', 'Finance', 'Support'];
export const DEPT_COLOR = { Engineering: '#6366f1', Product: '#8b5cf6', Design: '#ec4899', Sales: '#10b981', Marketing: '#f59e0b', HR: '#0ea5e9', Finance: '#14b8a6', Support: '#ef4444' };
const ROLES = { Engineering: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer'], Product: ['Product Manager', 'Product Analyst'], Design: ['UI/UX Designer', 'Visual Designer'],
  Sales: ['Sales Executive', 'Account Manager', 'Sales Lead'], Marketing: ['Marketing Executive', 'Content Strategist', 'SEO Specialist'], HR: ['HR Executive', 'Talent Partner'], Finance: ['Accountant', 'Financial Analyst'], Support: ['Support Engineer', 'Customer Success'] };
const FIRST_M = ['Arun', 'Karthik', 'Vignesh', 'Rahul', 'Suresh', 'Ajay', 'Pranav', 'Dinesh', 'Naveen', 'Harish', 'Gokul', 'Manoj', 'Sanjay', 'Vikram', 'Ashwin', 'Bala', 'Rohit', 'Sathish'];
const FIRST_F = ['Priya', 'Divya', 'Keerthana', 'Anitha', 'Sneha', 'Meena', 'Lakshmi', 'Kavya', 'Nandhini', 'Swathi', 'Revathi', 'Pooja', 'Aishwarya', 'Janani', 'Harini', 'Deepa'];
const LAST = ['Kumar', 'Raj', 'Subramanian', 'Krishnan', 'Iyer', 'Nair', 'Reddy', 'Sharma', 'Pillai', 'Rao', 'Menon', 'Shankar', 'Murugan', 'Pandian', 'Balaji'];
export const LOCS = ['Madurai', 'Chennai', 'Bengaluru', 'Remote'];

function seedEmployees() {
  const r = rng(77); const list = [];
  list.push({ id: 'E1000', name: 'Bharath Kumar', gender: 'M', dept: 'HR', role: 'HR Director', email: 'bharath@worksphere.in', phone: '+91 98400 10000', loc: 'Madurai', salary: 2400000, joined: '2019-04-01', dob: '1992-11-02', status: 'Active', manager: null, rating: 4.7 });
  DEPTS.forEach((d, i) => list.push({ id: 'E' + (1001 + i), name: `${pick(r, i % 2 ? FIRST_F : FIRST_M)} ${pick(r, LAST)}`, gender: i % 2 ? 'F' : 'M', dept: d, role: d === 'HR' ? 'HR Manager' : `Head of ${d}`, loc: pick(r, LOCS.slice(0, 3)), salary: 1800000 + Math.round(r() * 800000), joined: `20${18 + Math.floor(r() * 4)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`, status: 'Active', manager: 'E1000', rating: +(3.8 + r() * 1.1).toFixed(1) }));
  for (let i = 0; i < 46; i++) {
    const d = DEPTS[Math.floor(r() * DEPTS.length)]; const f = r() > 0.55; const head = list.find((x) => x.dept === d && x.manager === 'E1000');
    list.push({ id: 'E' + (1010 + i), name: `${pick(r, f ? FIRST_F : FIRST_M)} ${pick(r, LAST)}`, gender: f ? 'F' : 'M', dept: d, role: pick(r, ROLES[d]), loc: pick(r, LOCS), salary: 420000 + Math.round(r() * 1300000 / 1000) * 1000,
      joined: `20${20 + Math.floor(r() * 6)}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-${String(1 + Math.floor(r() * 27)).padStart(2, '0')}`, status: r() > 0.93 ? 'Notice period' : r() > 0.9 ? 'Probation' : 'Active', manager: head.id, rating: +(2.9 + r() * 2).toFixed(1) });
  }
  return list.map((e) => ({ ...e, email: e.email || `${e.name.toLowerCase().replace(/\s+/g, '.')}@worksphere.in`, phone: e.phone || `+91 9${Math.floor(100000000 + Math.random() * 899999999)}`, dob: e.dob || `199${Math.floor(Math.random() * 9)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 27)).padStart(2, '0')}` }));
}
function seedLeaves() {
  const now = new Date(); const d = (o) => new Date(now.getTime() + o * 864e5).toISOString().slice(0, 10);
  return [
    { id: 'L1', emp: 'E1012', type: 'Sick', from: d(1), to: d(2), days: 2, reason: 'Fever and rest advised', status: 'Pending', at: Date.now() - 3600e3 },
    { id: 'L2', emp: 'E1020', type: 'Casual', from: d(4), to: d(4), days: 1, reason: 'Family function in Trichy', status: 'Pending', at: Date.now() - 7200e3 },
    { id: 'L3', emp: 'E1031', type: 'Earned', from: d(10), to: d(16), days: 5, reason: 'Vacation to Munnar', status: 'Pending', at: Date.now() - 86400e3 },
    { id: 'L4', emp: 'E1000', type: 'Casual', from: d(-12), to: d(-12), days: 1, reason: 'Personal work', status: 'Approved', at: Date.now() - 20 * 86400e3 },
    { id: 'L5', emp: 'E1015', type: 'Sick', from: d(-3), to: d(-2), days: 2, reason: 'Viral fever', status: 'Approved', at: Date.now() - 5 * 86400e3 },
    { id: 'L6', emp: 'E1040', type: 'Earned', from: d(-8), to: d(-6), days: 3, reason: 'Travel', status: 'Rejected', at: Date.now() - 12 * 86400e3 },
  ];
}
const seedCands = () => [
  ['Aravind S', 'Senior React Developer', 'Applied', 4.2], ['Nisha P', 'Data Analyst', 'Applied', 3.9], ['Gowtham R', 'DevOps Engineer', 'Screening', 4.0], ['Fathima B', 'UI/UX Designer', 'Screening', 4.5],
  ['Rakesh M', 'Sales Executive', 'Interview', 3.7], ['Shalini K', 'Product Manager', 'Interview', 4.4], ['Imran A', 'QA Engineer', 'Offer', 4.1], ['Bhavya T', 'Content Strategist', 'Hired', 4.3], ['Yogesh N', 'Support Engineer', 'Applied', 3.5],
].map(([name, role, stage, score], i) => ({ id: 'C' + i, name, role, stage, score, exp: 1 + (i * 7) % 8, source: ['LinkedIn', 'Naukri', 'Referral', 'Careers page'][i % 4], at: Date.now() - i * 86400e3 }));

const Ctx = createContext(null);
export const useHR = () => useContext(Ctx);

export function HRProvider({ children }) {
  const [emps, setEmps] = usePersist('emps', seedEmployees);
  const [leaves, setLeaves] = usePersist('leaves', seedLeaves);
  const [cands, setCands] = usePersist('cands', seedCands);
  const [punches, setPunches] = usePersist('punches', {});
  const [announcements, setAnn] = usePersist('ann', [
    { id: 'a1', title: 'Diwali celebration 🪔', text: 'Office party on Friday 4 PM at the Madurai campus. Ethnic wear encouraged!', at: Date.now() - 2 * 86400e3 },
    { id: 'a2', title: 'Q3 appraisal cycle', text: 'Self-reviews close on 31 October. Managers complete ratings by 7 November.', at: Date.now() - 5 * 86400e3 },
  ]);
  const byId = (id) => emps.find((e) => e.id === id);
  const api = {
    emps, leaves, cands, punches, announcements, byId,
    addEmp: (e) => setEmps((l) => [...l, { ...e, id: 'E' + (1000 + l.length + Math.floor(Math.random() * 900)), status: 'Probation', rating: 0 }]),
    updateEmp: (id, p) => setEmps((l) => l.map((e) => (e.id === id ? { ...e, ...p } : e))),
    removeEmp: (id) => setEmps((l) => l.filter((e) => e.id !== id)),
    applyLeave: (lv) => setLeaves((l) => [{ ...lv, id: uid(), status: 'Pending', at: Date.now() }, ...l]),
    decideLeave: (id, status) => setLeaves((l) => l.map((x) => (x.id === id ? { ...x, status } : x))),
    addCand: (c) => setCands((l) => [...l, { ...c, id: uid(), stage: 'Applied', at: Date.now() }]),
    moveCand: (id, stage) => setCands((l) => l.map((c) => (c.id === id ? { ...c, stage } : c))),
    punch: (day, kind) => setPunches((p) => ({ ...p, [day]: { ...(p[day] || {}), [kind]: Date.now() } })),
    addAnn: (a) => setAnn((l) => [{ ...a, id: uid(), at: Date.now() }, ...l]),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

// deterministic attendance status for employee/day
export function attStatus(empId, date) {
  const dow = date.getDay(); if (dow === 0) return 'Weekend'; if (dow === 6 && date.getDate() % 2) return 'Weekend';
  const h = [...(empId + date.toDateString())].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 100;
  return h < 84 ? 'Present' : h < 90 ? 'WFH' : h < 95 ? 'Leave' : 'Absent';
}
export const AT_COLOR = { Present: '#10b981', WFH: '#0ea5e9', Leave: '#f59e0b', Absent: '#ef4444', Weekend: 'var(--surface2)' };

export function payslip(e) {
  const m = e.salary / 12; const basic = m * 0.5, hra = basic * 0.4, special = m - basic - hra;
  const pf = Math.min(basic * 0.12, 1800); const pt = 208; const annualTaxable = e.salary - 75000;
  const tax = annualTaxable <= 700000 ? 0 : annualTaxable <= 1000000 ? (annualTaxable - 700000) * 0.1 / 12 : annualTaxable <= 1200000 ? (30000 + (annualTaxable - 1000000) * 0.15) / 12 : (60000 + (annualTaxable - 1200000) * 0.2) / 12;
  const gross = basic + hra + special; const ded = pf + pt + tax;
  return { basic, hra, special, gross, pf, pt, tax, ded, net: gross - ded };
}
