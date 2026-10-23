import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';
import { useHR, DEPT_COLOR } from '../lib/hr.jsx';
import { PageHead, Badge, Card } from '../core/ui.jsx';
import { EmpAv } from './Dashboard.jsx';

function Node({ e, depth }) {
  const hr = useHR(); const kids = hr.emps.filter((x) => x.manager === e.id);
  const [open, setOpen] = useState(depth < 1);
  return (
    <div className="org-node">
      <div className="org-card pop" style={{ borderTop: `4px solid ${DEPT_COLOR[e.dept]}` }} onClick={() => setOpen(!open)}>
        <EmpAv e={e} size={depth === 0 ? 56 : 42} />
        <div style={{ minWidth: 0 }}><b className="small">{e.name}</b><div className="small muted">{e.role}</div>
          {kids.length > 0 && <div className="small mt8 row" style={{ gap: 4, color: 'var(--accent)' }}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Users size={13} /> {kids.length} reports</div>}</div>
      </div>
      {open && kids.length > 0 && <div className="org-kids">{kids.map((k) => <Node key={k.id} e={k} depth={depth + 1} />)}</div>}
    </div>
  );
}

export default function OrgChart() {
  const hr = useHR(); const root = hr.emps.find((e) => !e.manager) || hr.emps[0];
  const box = useRef(null);
  useEffect(() => { const el = box.current; if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2; }, []);
  return (
    <>
      <PageHead title="Organisation chart" crumbs="WorkSphere / Org chart" sub="Click a card to expand or collapse its team"><Badge kind="acc">{hr.emps.length} people</Badge></PageHead>
      <Card className="fade-up"><div ref={box} style={{ overflowX: 'auto' }}><div className="org-tree"><Node e={root} depth={0} /></div></div></Card>
    </>
  );
}
