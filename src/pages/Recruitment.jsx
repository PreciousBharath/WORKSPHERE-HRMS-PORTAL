import { useState } from 'react';
import { UserPlus, Star, GripVertical, Briefcase } from 'lucide-react';
import { useHR } from '../lib/hr.jsx';
import { PageHead, Badge, Modal, Field, Card } from '../core/ui.jsx';
import { useApp } from '../core/context.jsx';
import { initials, timeAgo } from '../core/store.js';

const STAGES = [['Applied', '#64748b'], ['Screening', '#0ea5e9'], ['Interview', '#8b5cf6'], ['Offer', '#f59e0b'], ['Hired', '#10b981']];

export default function Recruitment() {
  const hr = useHR(); const { toast } = useApp();
  const [drag, setDrag] = useState(null); const [over, setOver] = useState(null); const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', role: '', exp: 2, source: 'LinkedIn', score: 4 });
  function drop(stage) { if (drag) { hr.moveCand(drag, stage); const c = hr.cands.find((x) => x.id === drag); toast(`${c.name} → ${stage}${stage === 'Hired' ? ' 🎉' : ''}`, 'ok'); } setDrag(null); setOver(null); }
  return (
    <>
      <PageHead title="Recruitment pipeline" crumbs="WorkSphere / Hiring" sub="Drag candidates between stages">
        <button className="btn btn-primary" onClick={() => setOpen(true)}><UserPlus size={16} /> Add candidate</button>
      </PageHead>
      <div className="row wrap mb16 fade-up">{STAGES.map(([s, c]) => <span key={s} className="badge" style={{ color: c, background: c + '22' }}>{s}: {hr.cands.filter((x) => x.stage === s).length}</span>)}
        <span className="badge b-acc">Conversion {Math.round((hr.cands.filter((x) => x.stage === 'Hired').length / hr.cands.length) * 100)}%</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))', gap: 14, overflowX: 'auto', paddingBottom: 8 }} className="stagger">
        {STAGES.map(([s, c]) => (
          <div key={s} onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)} onDrop={() => drop(s)}
            style={{ background: over === s ? 'var(--accent-soft)' : 'var(--surface2)', border: `1.5px dashed ${over === s ? 'var(--accent)' : 'transparent'}`, borderRadius: 16, padding: 12, minHeight: 420, transition: 'all .2s' }}>
            <div className="between mb12"><b className="row" style={{ gap: 8 }}><i style={{ width: 10, height: 10, borderRadius: 5, background: c }} />{s}</b><Badge kind="mute">{hr.cands.filter((x) => x.stage === s).length}</Badge></div>
            <div className="grid" style={{ gap: 10 }}>
              {hr.cands.filter((x) => x.stage === s).map((x) => (
                <div key={x.id} draggable onDragStart={() => setDrag(x.id)} onDragEnd={() => setDrag(null)} className="card pop" style={{ padding: 14, cursor: 'grab', opacity: drag === x.id ? 0.4 : 1, borderLeft: `4px solid ${c}` }}>
                  <div className="between"><div className="row"><div className="avatar sm" style={{ background: c }}>{initials(x.name)}</div><div><b className="small">{x.name}</b><div className="small muted">{x.role}</div></div></div><GripVertical size={15} className="faint" /></div>
                  <div className="row wrap mt12" style={{ gap: 6 }}><Badge kind="mute"><Briefcase size={11} /> {x.exp}y</Badge><Badge kind="info">{x.source}</Badge><Badge kind="warn"><Star size={11} /> {x.score}</Badge></div>
                  <div className="small faint mt8">{timeAgo(x.at)}</div>
                  <select className="input mt8" style={{ padding: '5px 8px', fontSize: 12 }} value={x.stage} onChange={(e) => { hr.moveCand(x.id, e.target.value); toast(`${x.name} → ${e.target.value}`, 'ok'); }}>{STAGES.map(([st]) => <option key={st}>{st}</option>)}</select>
                </div>))}
            </div>
          </div>))}
      </div>
      <Card className="mt16 fade-up" title="Open roles"><div className="row wrap">{[...new Set(hr.cands.filter((c) => c.stage !== 'Hired').map((c) => c.role))].map((r) => <span key={r} className="chip">{r}</span>)}</div></Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add candidate" footer={<><button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (!f.name || !f.role) return toast('Name and role are required', 'warn'); hr.addCand({ ...f, exp: Number(f.exp), score: Number(f.score) }); setOpen(false); setF({ name: '', role: '', exp: 2, source: 'LinkedIn', score: 4 }); toast('Candidate added to Applied', 'ok'); }}>Add</button></>}>
        <div className="grid g2">
          <Field label="Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Role"><input className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
          <Field label="Experience (years)"><input className="input" type="number" value={f.exp} onChange={(e) => setF({ ...f, exp: e.target.value })} /></Field>
          <Field label="Source"><select className="input" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>{['LinkedIn', 'Naukri', 'Referral', 'Careers page', 'Campus'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Screening score (1-5)"><input className="input" type="number" min="1" max="5" step="0.1" value={f.score} onChange={(e) => setF({ ...f, score: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}
