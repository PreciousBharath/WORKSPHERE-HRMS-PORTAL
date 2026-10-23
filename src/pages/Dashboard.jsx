import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Users, UserCheck, Plane, Briefcase, Cake, Award, Megaphone, ArrowRight, Plus } from 'lucide-react';
import { useHR, DEPTS, DEPT_COLOR, attStatus } from '../lib/hr.jsx';
import { Card, PageHead, Stat, Badge, Modal, Field } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';
import { initials, timeAgo } from '../core/store.js';
import { useState } from 'react';

export const EmpAv = ({ e, size = 36 }) => <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, borderRadius: size / 3, background: `linear-gradient(135deg, ${DEPT_COLOR[e.dept]}, ${DEPT_COLOR[e.dept]}99)` }}>{initials(e.name)}</div>;

export default function Dashboard() {
  const hr = useHR(); const { user, toast } = useApp(); const nav = useNavigate();
  const [ann, setAnn] = useState(false); const [f, setF] = useState({ title: '', text: '' });
  const today = new Date(); const active = hr.emps.filter((e) => e.status !== 'Exited');
  const present = active.filter((e) => ['Present', 'WFH'].includes(attStatus(e.id, today))).length;
  const onLeave = active.filter((e) => attStatus(e.id, today) === 'Leave').length;
  const open = hr.cands.filter((c) => c.stage !== 'Hired').length;
  const byDept = DEPTS.map((d) => ({ d, n: active.filter((e) => e.dept === d).length }));
  const gender = [{ name: 'Women', value: active.filter((e) => e.gender === 'F').length }, { name: 'Men', value: active.filter((e) => e.gender === 'M').length }];
  const trend = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); const st = active.map((e) => attStatus(e.id, d));
    return { d: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), present: st.filter((s) => s === 'Present').length, wfh: st.filter((s) => s === 'WFH').length, leave: st.filter((s) => s === 'Leave' || s === 'Absent').length }; }).filter((x) => x.present > 0);
  const mmdd = (s) => s.slice(5); const tmd = today.toISOString().slice(5, 10);
  const bdays = active.map((e) => ({ e, k: mmdd(e.dob) })).sort((a, b) => ((a.k >= tmd ? '' : 'z') + a.k).localeCompare((b.k >= tmd ? '' : 'z') + b.k)).slice(0, 4);
  const top = [...active].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const pending = hr.leaves.filter((l) => l.status === 'Pending');
  return (
    <>
      <div className="hero-banner fade-up mb16">
        <div className="between wrap"><div><h2>Welcome back, {user.name.split(' ')[0]} 👋</h2><p>{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {pending.length} leave requests need your attention</p></div>
          <div className="row"><button className="btn btn-ghost" onClick={() => nav('/leave')}>Review leaves <ArrowRight size={16} /></button><button className="btn btn-ghost" onClick={() => nav('/employees')}><Plus size={16} /> Add employee</button></div></div>
      </div>
      <div className="grid g4 stagger">
        <Stat icon={Users} label="Total employees" value={active.length} delta={6.2} />
        <Stat icon={UserCheck} label="Present today" value={present} color="#10b981" suffix={` / ${active.length}`} />
        <Stat icon={Plane} label="On leave today" value={onLeave} color="#f59e0b" />
        <Stat icon={Briefcase} label="Open positions" value={open} color="#ec4899" delta={-2.4} />
      </div>
      <div className="grid g-2-1 mt16 stagger">
        <Card title="Attendance trend" sub="Last 14 working days">
          <div style={{ height: 270 }}><ResponsiveContainer><LineChart data={trend} margin={{ left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="d" tickLine={false} axisLine={false} /><YAxis tickLine={false} axisLine={false} /><Tooltip /><Legend />
            <Line dataKey="present" name="In office" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} /><Line dataKey="wfh" name="WFH" stroke="#0ea5e9" strokeWidth={2} dot={false} /><Line dataKey="leave" name="Leave/absent" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart></ResponsiveContainer></div>
        </Card>
        <Card title="Diversity" sub="Gender ratio across the company">
          <div style={{ height: 270 }}><ResponsiveContainer><PieChart><Pie data={gender} dataKey="value" innerRadius={62} outerRadius={98} paddingAngle={4} label={(e) => `${e.name} ${Math.round(e.percent * 100)}%`}>
            <Cell fill="#ec4899" /><Cell fill="#6366f1" /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </Card>
      </div>
      <div className="grid g3 mt16 stagger">
        <Card title="Headcount by department">
          <div style={{ height: 250 }}><ResponsiveContainer><BarChart data={byDept} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide /><YAxis type="category" dataKey="d" tickLine={false} axisLine={false} width={86} /><Tooltip />
            <Bar dataKey="n" name="Employees" radius={[0, 8, 8, 0]}>{byDept.map((x) => <Cell key={x.d} fill={DEPT_COLOR[x.d]} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Card>
        <Card title="Upcoming birthdays" action={<Cake size={18} color="#ec4899" />}>
          {bdays.map(({ e }) => (<div className="list-item" key={e.id}><EmpAv e={e} /><div style={{ flex: 1 }}><b className="small">{e.name}</b><div className="small muted">{e.dept}</div></div>
            <Badge kind="acc">🎂 {new Date('2026-' + mmdd(e.dob)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Badge></div>))}
          <div className="small bold mt12 mb12 row"><Award size={16} color="#f59e0b" /> Top performers</div>
          {top.map((e) => (<div className="list-item" key={e.id}><EmpAv e={e} size={30} /><span className="small" style={{ flex: 1 }}>{e.name}</span><Badge kind="warn">★ {e.rating}</Badge></div>))}
        </Card>
        <Card title="Announcements" action={<button className="btn btn-soft btn-sm" onClick={() => setAnn(true)}><Megaphone size={14} /> Post</button>}>
          {hr.announcements.map((a) => (<div key={a.id} className="tile mb12"><b className="small">{a.title}</b><p className="small muted mt8">{a.text}</p><div className="small faint mt8">{timeAgo(a.at)}</div></div>))}
        </Card>
      </div>
      <Modal open={ann} onClose={() => setAnn(false)} title="New announcement" footer={<><button className="btn btn-ghost" onClick={() => setAnn(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (!f.title) return toast('Add a title', 'warn'); hr.addAnn(f); setF({ title: '', text: '' }); setAnn(false); toast('Announcement posted', 'ok'); }}>Publish</button></>}>
        <Field label="Title"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Message"><textarea className="input" rows={4} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>
      </Modal>
    </>
  );
}
