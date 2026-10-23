import { useState } from 'react';
import { Check, X, CalendarPlus, HeartPulse, Palmtree, Coffee, Baby } from 'lucide-react';
import { useHR } from '../lib/hr.jsx';
import { Card, PageHead, Badge, Field, Tabs, Empty } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';
import { EmpAv } from './Dashboard.jsx';

const TYPES = { Casual: [Coffee, '#6366f1', 12], Sick: [HeartPulse, '#ef4444', 10], Earned: [Palmtree, '#10b981', 18], Parental: [Baby, '#ec4899', 26] };
const stK = { Pending: 'warn', Approved: 'ok', Rejected: 'bad' };

export default function Leave() {
  const hr = useHR(); const { toast } = useApp();
  const [f, setF] = useState({ type: 'Casual', from: '', to: '', reason: '' }); const [tab, setTab] = useState('Pending');
  const mine = hr.leaves.filter((l) => l.emp === 'E1000');
  const used = (t) => mine.filter((l) => l.type === t && l.status === 'Approved').reduce((a, l) => a + l.days, 0);
  const days = f.from && f.to ? Math.max(0, Math.round((new Date(f.to) - new Date(f.from)) / 864e5) + 1) : 0;
  function apply(e) {
    e.preventDefault();
    if (!f.from || !f.to || days <= 0) return toast('Pick a valid date range', 'warn');
    if (f.reason.trim().length < 5) return toast('Add a short reason', 'warn');
    if (days > TYPES[f.type][2] - used(f.type)) return toast(`Only ${TYPES[f.type][2] - used(f.type)} ${f.type} days left`, 'bad');
    hr.applyLeave({ ...f, emp: 'E1000', days }); setF({ type: 'Casual', from: '', to: '', reason: '' }); toast('Leave request submitted', 'ok');
  }
  const queue = hr.leaves.filter((l) => tab === 'All' || l.status === tab);
  return (
    <>
      <PageHead title="Leave management" crumbs="WorkSphere / Leave" sub="Balances, requests and approvals" />
      <div className="grid g4 stagger">
        {Object.entries(TYPES).map(([t, [I, c, total]]) => (
          <div key={t} className="card hover"><div className="between"><div className="ic" style={{ width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', background: c + '22', color: c }}><I size={20} /></div><Badge kind="mute">{total} / yr</Badge></div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{total - used(t)} <span className="small muted">days left</span></div><div className="small muted">{t} leave</div>
            <div className="progress mt8"><i style={{ width: ((total - used(t)) / total) * 100 + '%', background: c }} /></div></div>))}
      </div>
      <div className="grid g-1-2 mt16 stagger">
        <Card title="Apply for leave" action={<CalendarPlus size={18} color="var(--accent)" />}>
          <form onSubmit={apply}>
            <Field label="Leave type"><div className="row wrap">{Object.keys(TYPES).map((t) => <button type="button" key={t} className={`chip ${f.type === t ? 'on' : ''}`} onClick={() => setF({ ...f, type: t })}>{t}</button>)}</div></Field>
            <div className="grid g2"><Field label="From"><input className="input" type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></Field>
              <Field label="To"><input className="input" type="date" value={f.to} min={f.from} onChange={(e) => setF({ ...f, to: e.target.value })} /></Field></div>
            <Field label="Reason"><textarea className="input" rows={3} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Brief reason for your manager" /></Field>
            <div className="tile small mb12 between"><span className="muted">Duration</span><b>{days} day{days === 1 ? '' : 's'}</b></div>
            <button className="btn btn-primary btn-block">Submit request</button>
          </form>
        </Card>
        <Card title="Approval queue" action={<Tabs value={tab} onChange={setTab} options={['Pending', 'Approved', 'Rejected', 'All']} />}>
          {!queue.length ? <Empty icon={Check} title="All caught up" text="No requests in this view." /> : queue.map((l) => { const e = hr.byId(l.emp); if (!e) return null; const [I, c] = TYPES[l.type]; return (
            <div key={l.id} className="list-item" style={{ alignItems: 'flex-start' }}>
              <EmpAv e={e} size={40} />
              <div style={{ flex: 1 }}><div className="row wrap" style={{ gap: 6 }}><b className="small">{e.name}</b><span className="badge" style={{ color: c, background: c + '22' }}><I size={12} /> {l.type}</span><Badge kind={stK[l.status]}>{l.status}</Badge></div>
                <div className="small muted mt8">{new Date(l.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(l.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {l.days} day(s)</div>
                <div className="small mt8">“{l.reason}”</div></div>
              {l.status === 'Pending' && <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-sm btn-ok" onClick={() => { hr.decideLeave(l.id, 'Approved'); toast(`Approved ${e.name.split(' ')[0]}'s leave`, 'ok'); }}><Check size={14} /></button>
                <button className="btn btn-sm btn-danger" onClick={() => { hr.decideLeave(l.id, 'Rejected'); toast('Leave rejected', 'warn'); }}><X size={14} /></button></div>}
            </div>); })}
        </Card>
      </div>
    </>
  );
}
