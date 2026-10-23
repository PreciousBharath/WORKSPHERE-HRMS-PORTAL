import { useState } from 'react';
import { Search, LayoutGrid, List, UserPlus, Download, Mail, Phone, MapPin, Trash2, Edit3, CalendarDays } from 'lucide-react';
import { useHR, DEPTS, DEPT_COLOR, LOCS } from '../lib/hr.jsx';
import { Card, PageHead, Badge, Modal, Field, Tabs } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';
import { downloadText, toCSV, inr } from '../core/store.js';
import { EmpAv } from './Dashboard.jsx';

const blank = { name: '', email: '', phone: '', dept: 'Engineering', role: '', loc: 'Madurai', salary: 600000, joined: new Date().toISOString().slice(0, 10), gender: 'F', dob: '1998-01-01', manager: 'E1001' };
const stKind = { Active: 'ok', Probation: 'info', 'Notice period': 'warn' };

export default function Employees() {
  const hr = useHR(); const { toast } = useApp();
  const [q, setQ] = useState(''); const [dept, setDept] = useState('All'); const [view, setView] = useState('grid'); const [status, setStatus] = useState('All');
  const [form, setForm] = useState(null); const [sel, setSel] = useState(null); const [err, setErr] = useState({});
  const list = hr.emps.filter((e) => (dept === 'All' || e.dept === dept) && (status === 'All' || e.status === status) && (e.name + e.role + e.id + e.email).toLowerCase().includes(q.toLowerCase()));
  function save() {
    const e = {}; if (form.name.trim().length < 3) e.name = 'Enter full name'; if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.role.trim()) e.role = 'Designation required'; if (!/^[+\d\s]{10,15}$/.test(form.phone)) e.phone = '10-digit phone'; setErr(e); if (Object.keys(e).length) return;
    if (form.id) { hr.updateEmp(form.id, { ...form, salary: Number(form.salary) }); toast('Employee updated', 'ok'); } else { hr.addEmp({ ...form, salary: Number(form.salary) }); toast(`${form.name} onboarded 🎉`, 'ok'); }
    setForm(null);
  }
  const sf = (k) => (ev) => setForm({ ...form, [k]: ev.target.value });
  return (
    <>
      <PageHead title="Employees" crumbs="WorkSphere / People" sub={`${list.length} of ${hr.emps.length} people`}>
        <Tabs value={view} onChange={setView} options={[{ id: 'grid', label: <LayoutGrid size={15} /> }, { id: 'list', label: <List size={15} /> }]} />
        <button className="btn btn-ghost btn-sm" onClick={() => downloadText('employees.csv', toCSV(list.map(({ id, name, dept, role, email, phone, loc, joined, status }) => ({ id, name, dept, role, email, phone, loc, joined, status }))), 'text/csv')}><Download size={15} /> Export</button>
        <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ ...blank }); }}><UserPlus size={16} /> Add employee</button>
      </PageHead>
      <Card className="fade-up mb16" style={{ padding: 14 }}>
        <div className="row wrap">
          <div className="search" style={{ maxWidth: 300 }}><Search size={16} /><input placeholder="Search name, ID, role…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="input" style={{ width: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>{['All', 'Active', 'Probation', 'Notice period'].map((s) => <option key={s}>{s}</option>)}</select>
          <div className="row wrap">{['All', ...DEPTS].map((d) => <button key={d} className={`chip ${dept === d ? 'on' : ''}`} onClick={() => setDept(d)}>{d}</button>)}</div>
        </div>
      </Card>
      {view === 'grid' ? (
        <div className="grid g4 stagger">
          {list.map((e) => (
            <div key={e.id} className="card hover clickable" onClick={() => setSel(e)} style={{ textAlign: 'center', borderTop: `4px solid ${DEPT_COLOR[e.dept]}` }}>
              <div style={{ display: 'grid', placeItems: 'center' }}><EmpAv e={e} size={64} /></div>
              <b className="mt12" style={{ display: 'block' }}>{e.name}</b><div className="small muted">{e.role}</div>
              <div className="row mt12" style={{ justifyContent: 'center', gap: 6 }}><Badge kind="mute">{e.dept}</Badge><Badge kind={stKind[e.status]}>{e.status}</Badge></div>
              <div className="small faint mt12 row" style={{ justifyContent: 'center', gap: 5 }}><MapPin size={13} /> {e.loc} · {e.id}</div>
            </div>))}
        </div>
      ) : (
        <Card className="fade-up"><div className="table-wrap"><table className="tbl"><thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Location</th><th>Joined</th><th>CTC</th><th>Status</th><th></th></tr></thead>
          <tbody>{list.map((e) => (
            <tr key={e.id}><td><div className="row clickable" onClick={() => setSel(e)}><EmpAv e={e} size={32} /><div><b className="small">{e.name}</b><div className="small muted">{e.email}</div></div></div></td>
              <td className="mono small">{e.id}</td><td><span className="row" style={{ gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: 4, background: DEPT_COLOR[e.dept] }} />{e.dept}</span></td><td className="small">{e.role}</td><td className="small">{e.loc}</td>
              <td className="small">{new Date(e.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td className="mono small">{inr(e.salary)}</td><td><Badge kind={stKind[e.status]}>{e.status}</Badge></td>
              <td><div className="row" style={{ gap: 4 }}><button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => { setErr({}); setForm({ ...e }); }}><Edit3 size={14} /></button></div></td></tr>))}</tbody></table></div></Card>
      )}

      <Modal open={!!sel} onClose={() => setSel(null)} title="Employee profile" wide>
        {sel && (<>
          <div className="row wrap" style={{ gap: 18 }}><EmpAv e={sel} size={80} /><div style={{ flex: 1 }}><h2 style={{ fontSize: 22 }}>{sel.name}</h2><div className="muted">{sel.role} · {sel.dept}</div>
            <div className="row mt8" style={{ gap: 6 }}><Badge kind={stKind[sel.status]}>{sel.status}</Badge><Badge kind="warn">★ {sel.rating || 'New'}</Badge><Badge kind="mute">{sel.id}</Badge></div></div></div>
          <div className="grid g2 mt20" style={{ gap: 10 }}>
            {[[Mail, 'Email', sel.email], [Phone, 'Phone', sel.phone], [MapPin, 'Location', sel.loc], [CalendarDays, 'Joined', new Date(sel.joined).toDateString()], [CalendarDays, 'Birthday', new Date(sel.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })], [UserPlus, 'Reports to', hr.byId(sel.manager)?.name || '—']].map(([I, k, v]) => (
              <div className="tile" key={k}><div className="k"><I size={14} />{k}</div><div className="bold small mt8">{v}</div></div>))}
          </div>
          <div className="row mt20" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-danger" onClick={() => { if (confirm(`Remove ${sel.name}?`)) { hr.removeEmp(sel.id); setSel(null); toast('Employee removed', 'warn'); } }}><Trash2 size={15} /> Offboard</button>
            <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ ...sel }); setSel(null); }}><Edit3 size={15} /> Edit</button></div>
        </>)}
      </Modal>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit employee' : 'Onboard new employee'} wide footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>{form?.id ? 'Save changes' : 'Add employee'}</button></>}>
        {form && (<div className="grid g2">
          <Field label="Full name" error={err.name}><input className={`input ${err.name ? 'err' : ''}`} value={form.name} onChange={sf('name')} /></Field>
          <Field label="Work email" error={err.email}><input className={`input ${err.email ? 'err' : ''}`} value={form.email} onChange={sf('email')} placeholder="name@worksphere.in" /></Field>
          <Field label="Phone" error={err.phone}><input className={`input ${err.phone ? 'err' : ''}`} value={form.phone} onChange={sf('phone')} placeholder="+91 98xxxxxxxx" /></Field>
          <Field label="Designation" error={err.role}><input className={`input ${err.role ? 'err' : ''}`} value={form.role} onChange={sf('role')} /></Field>
          <Field label="Department"><select className="input" value={form.dept} onChange={sf('dept')}>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Location"><select className="input" value={form.loc} onChange={sf('loc')}>{LOCS.map((d) => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Annual CTC (₹)"><input className="input" type="number" value={form.salary} onChange={sf('salary')} /></Field>
          <Field label="Joining date"><input className="input" type="date" value={form.joined} onChange={sf('joined')} /></Field>
          <Field label="Date of birth"><input className="input" type="date" value={form.dob} onChange={sf('dob')} /></Field>
          <Field label="Gender"><select className="input" value={form.gender} onChange={sf('gender')}><option value="F">Female</option><option value="M">Male</option></select></Field>
        </div>)}
      </Modal>
    </>
  );
}
