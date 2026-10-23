import { useEffect, useState } from 'react';
import { LogIn, LogOut, Clock, MapPin, Coffee, Search } from 'lucide-react';
import { useHR, attStatus, AT_COLOR, DEPTS } from '../lib/hr.jsx';
import { Card, PageHead, Badge, Ring } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';
import { EmpAv } from './Dashboard.jsx';

const dur = (ms) => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

export default function Attendance() {
  const hr = useHR(); const { toast } = useApp();
  const [now, setNow] = useState(Date.now()); const [month, setMonth] = useState(0); const [q, setQ] = useState(''); const [dept, setDept] = useState('All');
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const key = new Date().toISOString().slice(0, 10); const p = hr.punches[key] || {};
  const worked = p.in ? (p.out || now) - p.in : 0; const pct = Math.min(100, (worked / (9 * 3600e3)) * 100);
  const ref = new Date(); ref.setDate(1); ref.setMonth(ref.getMonth() + month);
  const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate(); const lead = ref.getDay();
  const me = hr.emps[0];
  const cells = Array.from({ length: days }, (_, i) => { const d = new Date(ref.getFullYear(), ref.getMonth(), i + 1); return { d, s: d > new Date() ? 'Future' : attStatus(me.id, d) }; });
  const counts = ['Present', 'WFH', 'Leave', 'Absent'].map((s) => [s, cells.filter((c) => c.s === s).length]);
  const team = hr.emps.filter((e) => (dept === 'All' || e.dept === dept) && e.name.toLowerCase().includes(q.toLowerCase())).slice(0, 14);
  const tIn = (e) => { const h = [...e.id].reduce((a, c) => a + c.charCodeAt(0), 0); return `0${8 + (h % 2)}:${String((h * 7) % 60).padStart(2, '0')}`; };
  return (
    <>
      <PageHead title="Attendance" crumbs="WorkSphere / Attendance" sub="Clock in, track hours and view team attendance" />
      <div className="grid g-1-2 stagger">
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 34, fontWeight: 800 }}>{new Date(now).toLocaleTimeString('en-IN')}</div>
            <div className="muted small">{new Date(now).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            <div style={{ display: 'grid', placeItems: 'center', margin: '18px 0' }}><Ring value={pct} size={170} stroke={14} label={dur(worked)} sub="of 9h shift" color={p.out ? '#10b981' : 'var(--accent)'} /></div>
            {!p.in ? <button className="btn btn-primary btn-block" onClick={() => { hr.punch(key, 'in'); toast('Clocked in — have a great day! ☀️', 'ok'); }}><LogIn size={17} /> Clock in</button>
              : !p.out ? <button className="btn btn-bad btn-block" onClick={() => { hr.punch(key, 'out'); toast('Clocked out. See you tomorrow 👋', 'info'); }}><LogOut size={17} /> Clock out</button>
              : <Badge kind="ok">Shift complete ✔</Badge>}
            <div className="grid g3 mt16" style={{ gap: 8 }}>
              {[[LogIn, 'In', p.in ? new Date(p.in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'], [LogOut, 'Out', p.out ? new Date(p.out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--:--'], [MapPin, 'Site', 'Madurai']].map(([I, k, v]) => (
                <div className="tile" key={k} style={{ padding: 10 }}><div className="k" style={{ justifyContent: 'center' }}><I size={13} />{k}</div><b className="small">{v}</b></div>))}
            </div>
          </div>
        </Card>
        <Card title="My attendance calendar" action={<div className="row"><button className="btn btn-ghost btn-sm" onClick={() => setMonth(month - 1)}>‹</button><b className="small">{ref.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</b><button className="btn btn-ghost btn-sm" disabled={month >= 0} onClick={() => setMonth(month + 1)}>›</button></div>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="small faint bold" style={{ textAlign: 'center' }}>{d}</div>)}
            {Array.from({ length: lead }, (_, i) => <div key={'l' + i} />)}
            {cells.map(({ d, s }) => (
              <div key={d.getDate()} title={s} className="pop" style={{ aspectRatio: '1.3', borderRadius: 10, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, border: d.toDateString() === new Date().toDateString() ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: s === 'Future' ? 'transparent' : s === 'Weekend' ? 'var(--surface2)' : AT_COLOR[s] + '26', color: s === 'Future' || s === 'Weekend' ? 'var(--faint)' : AT_COLOR[s] }}>{d.getDate()}</div>))}
          </div>
          <div className="row wrap mt16" style={{ gap: 10 }}>{counts.map(([s, n]) => <span key={s} className="badge" style={{ color: AT_COLOR[s], background: AT_COLOR[s] + '22' }}>{s}: {n}</span>)}</div>
        </Card>
      </div>
      <Card className="mt16 fade-up" title="Team attendance — today" action={<div className="row wrap"><div className="search" style={{ width: 200 }}><Search size={15} /><input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input" style={{ width: 150 }} value={dept} onChange={(e) => setDept(e.target.value)}>{['All', ...DEPTS].map((d) => <option key={d}>{d}</option>)}</select></div>}>
        <div className="table-wrap"><table className="tbl"><thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Check-in</th><th>Break</th><th>Last 7 days</th></tr></thead>
          <tbody>{team.map((e) => { const s = attStatus(e.id, new Date()); return (
            <tr key={e.id}><td><div className="row"><EmpAv e={e} size={30} /><b className="small">{e.name}</b></div></td><td className="small">{e.dept}</td>
              <td><span className="badge" style={{ color: AT_COLOR[s] === 'var(--surface2)' ? 'var(--muted)' : AT_COLOR[s], background: (AT_COLOR[s] === 'var(--surface2)' ? '#888888' : AT_COLOR[s]) + '22' }}>{s}</span></td>
              <td className="mono small">{['Present', 'WFH'].includes(s) ? tIn(e) : '—'}</td><td className="small muted">{['Present', 'WFH'].includes(s) ? <span className="row" style={{ gap: 4 }}><Coffee size={13} /> 45m</span> : '—'}</td>
              <td><div className="row" style={{ gap: 3 }}>{Array.from({ length: 7 }, (_, i) => { const st = attStatus(e.id, new Date(Date.now() - (6 - i) * 864e5)); return <i key={i} title={st} style={{ width: 14, height: 14, borderRadius: 4, background: AT_COLOR[st] }} />; })}</div></td></tr>); })}</tbody></table></div>
        <div className="small faint mt12 row"><Clock size={13} /> Showing first 14 matches</div>
      </Card>
    </>
  );
}
