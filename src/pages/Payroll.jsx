import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Wallet, Receipt, Landmark, Printer, Search, PlayCircle } from 'lucide-react';
import { useHR, DEPTS, DEPT_COLOR, payslip } from '../lib/hr.jsx';
import { Card, PageHead, Stat, Modal, Badge } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';
import { inr, fmt } from '../core/store.js';
import { EmpAv } from './Dashboard.jsx';

export default function Payroll() {
  const hr = useHR(); const { toast } = useApp();
  const [q, setQ] = useState(''); const [slip, setSlip] = useState(null); const [run, setRun] = useState(false); const [progress, setProgress] = useState(0);
  const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const rows = hr.emps.map((e) => ({ e, p: payslip(e) }));
  const tot = rows.reduce((a, { p }) => ({ gross: a.gross + p.gross, net: a.net + p.net, tax: a.tax + p.tax, pf: a.pf + p.pf }), { gross: 0, net: 0, tax: 0, pf: 0 });
  const byDept = DEPTS.map((d) => ({ d, cost: Math.round(rows.filter((r) => r.e.dept === d).reduce((a, r) => a + r.p.gross, 0)) }));
  function process() { setRun(true); setProgress(0); let i = 0; const t = setInterval(() => { i += 7; setProgress(Math.min(100, i)); if (i >= 100) { clearInterval(t); setRun(false); toast(`Payroll for ${month} processed — ${rows.length} payslips generated`, 'ok'); } }, 120); }
  const list = rows.filter(({ e }) => (e.name + e.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead title="Payroll" crumbs="WorkSphere / Payroll" sub={`Pay cycle: ${month} · FY 2026-27 new tax regime`}>
        <button className="btn btn-primary" onClick={process} disabled={run}><PlayCircle size={16} /> {run ? `Processing ${progress}%` : 'Run payroll'}</button>
      </PageHead>
      {run && <div className="progress mb16"><i style={{ width: progress + '%' }} /></div>}
      <div className="grid g4 stagger">
        <Stat icon={Wallet} label="Gross payroll (month)" value={tot.gross} prefix="₹" />
        <Stat icon={Receipt} label="Net pay" value={tot.net} prefix="₹" color="#10b981" />
        <Stat icon={Landmark} label="TDS deducted" value={tot.tax} prefix="₹" color="#f59e0b" />
        <Stat icon={Landmark} label="PF contribution" value={tot.pf} prefix="₹" color="#0ea5e9" />
      </div>
      <div className="grid g-1-2 mt16 stagger">
        <Card title="Monthly cost by department">
          <div style={{ height: 320 }}><ResponsiveContainer><BarChart data={byDept} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="d" tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => '₹' + (v / 100000).toFixed(1) + 'L'} /><Tooltip formatter={(v) => inr(v)} />
            <Bar dataKey="cost" name="Gross" radius={[8, 8, 0, 0]}>{byDept.map((x) => <Cell key={x.d} fill={DEPT_COLOR[x.d]} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Card>
        <Card title="Salary register" action={<div className="search" style={{ width: 220 }}><Search size={15} /><input placeholder="Search employee" value={q} onChange={(e) => setQ(e.target.value)} /></div>}>
          <div className="table-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}><table className="tbl"><thead><tr><th>Employee</th><th>Gross</th><th>Deductions</th><th>Net pay</th><th></th></tr></thead>
            <tbody>{list.map(({ e, p }) => (
              <tr key={e.id}><td><div className="row"><EmpAv e={e} size={30} /><div><b className="small">{e.name}</b><div className="small muted">{e.id}</div></div></div></td>
                <td className="mono small">{inr(p.gross)}</td><td className="mono small" style={{ color: 'var(--bad)' }}>-{inr(p.ded)}</td><td className="mono small bold">{inr(p.net)}</td>
                <td><button className="btn btn-soft btn-sm" onClick={() => setSlip({ e, p })}>Payslip</button></td></tr>))}</tbody></table></div>
        </Card>
      </div>
      <Modal open={!!slip} onClose={() => setSlip(null)} title={`Payslip · ${month}`} wide footer={<button className="btn btn-primary" onClick={() => window.print()}><Printer size={15} /> Print / Save PDF</button>}>
        {slip && (<div>
          <div className="between wrap tile"><div className="row"><EmpAv e={slip.e} size={48} /><div><b>{slip.e.name}</b><div className="small muted">{slip.e.role} · {slip.e.dept} · {slip.e.id}</div></div></div>
            <div style={{ textAlign: 'right' }}><div className="small muted">Net pay</div><div style={{ fontSize: 26, fontWeight: 800 }} className="grad-text">{inr(slip.p.net)}</div></div></div>
          <div className="grid g2 mt16">
            <div><div className="small bold muted mb12">EARNINGS</div>{[['Basic', slip.p.basic], ['HRA', slip.p.hra], ['Special allowance', slip.p.special]].map(([k, v]) => <div key={k} className="between list-item small"><span>{k}</span><b className="mono">{inr(v)}</b></div>)}
              <div className="between small mt8"><b>Gross</b><b className="mono">{inr(slip.p.gross)}</b></div></div>
            <div><div className="small bold muted mb12">DEDUCTIONS</div>{[['Provident fund', slip.p.pf], ['Professional tax', slip.p.pt], ['Income tax (TDS)', slip.p.tax]].map(([k, v]) => <div key={k} className="between list-item small"><span>{k}</span><b className="mono" style={{ color: 'var(--bad)' }}>{inr(v)}</b></div>)}
              <div className="between small mt8"><b>Total</b><b className="mono">{inr(slip.p.ded)}</b></div></div>
          </div>
          <div className="row mt16"><Badge kind="ok">Annual CTC {inr(slip.e.salary)}</Badge><Badge kind="mute">Bank transfer · HDFC ****{fmt(1000 + (slip.e.id.charCodeAt(3) * 37) % 9000)}</Badge></div>
        </div>)}
      </Modal>
    </>
  );
}
