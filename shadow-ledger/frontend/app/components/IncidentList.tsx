// app/components/IncidentList.tsx
'use client';
import { Incident } from '../api/client';

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ff2d2d', HIGH: '#ff8c00', MEDIUM: '#e8c547', LOW: '#5fa8d3',
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#ff2d2d', INVESTIGATING: '#ff8c00', MONITORING: '#5fa8d3', ESCALATED: '#c45fff', CLOSED: '#4a4a5a',
};

function fmt(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + time;
}

interface Props {
  incidents: Incident[];
  onClick:   (id: string) => void;
}

export default function IncidentList({ incidents, onClick }: Props) {
  if (incidents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px' }}>
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>⬛</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>NO INCIDENTS MATCH CURRENT FILTERS</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {incidents.map(inc => (
        <div key={inc.id} onClick={() => onClick(inc.id)} style={S.row}>
          <div style={{ ...S.sevBar, background: SEV_COLOR[inc.severity] }} />
          <div style={{ width: 10 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.title}>{inc.title}</div>
            <div style={S.meta}>
              <span>{inc.category}</span>
              <span>{fmt(inc.date, inc.time)}</span>
              {inc.tags.slice(0, 3).map(t => <span key={t}>#{t}</span>)}
            </div>
          </div>
          <div style={S.right}>
            <span style={{ ...S.badge, color: SEV_COLOR[inc.severity], borderColor: SEV_COLOR[inc.severity], background: `${SEV_COLOR[inc.severity]}18` }}>
              {inc.severity}
            </span>
            <span style={{ ...S.badge, color: STATUS_COLOR[inc.status], borderColor: STATUS_COLOR[inc.status], background: `${STATUS_COLOR[inc.status]}18` }}>
              {inc.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  row:    { background: 'var(--surface)', border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 0, cursor: 'pointer', position: 'relative', marginBottom: 2, transition: 'background 0.15s' },
  sevBar: { width: 3, position: 'absolute', left: 0, top: 0, bottom: 0 },
  title:  { fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta:   { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 16 },
  right:  { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  badge:  { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, padding: '3px 8px', border: '1px solid', display: 'inline-block' },
};
