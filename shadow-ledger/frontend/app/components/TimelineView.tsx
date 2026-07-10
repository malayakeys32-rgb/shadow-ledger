// app/components/TimelineView.tsx
'use client';
import { useRouter } from 'next/navigation';
import { TimelineDay } from '../api/client';

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ff2d2d', HIGH: '#ff8c00', MEDIUM: '#e8c547', LOW: '#5fa8d3',
};
const STATUS_COLOR: Record<string, string> = {
  OPEN: '#ff2d2d', INVESTIGATING: '#ff8c00', MONITORING: '#5fa8d3', ESCALATED: '#c45fff', CLOSED: '#4a4a5a',
};

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function TimelineView({ days }: { days: TimelineDay[] }) {
  const router = useRouter();
  const allIncidents = days.flatMap(d => d.incidents);

  if (allIncidents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 40px' }}>
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>⬛</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>NO INCIDENTS LOGGED</div>
      </div>
    );
  }

  return (
    <div>
      {days.map(day => (
        <div key={day.date}>
          <div style={S.dayLabel}>{fmtDate(day.date)}</div>
          {day.incidents.map((inc, i) => {
            const isLast = i === day.incidents.length - 1;
            const dot = SEV_COLOR[inc.severity] || '#5fa8d3';
            return (
              <div key={inc.id} style={{ display: 'flex', gap: 0 }}>
                <div style={S.spine}>
                  <div style={{ ...S.dot, borderColor: dot, background: `${dot}20` }} />
                  {!isLast && <div style={S.line} />}
                </div>
                <div style={S.content}>
                  <div style={S.time}>{inc.time} — {inc.category.toUpperCase()}</div>
                  <div style={S.card} onClick={() => router.push(`/incidents/${inc.id}`)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={S.cardTitle}>{inc.title}</div>
                      <span style={{ ...S.badge, color: dot, borderColor: dot, background: `${dot}18` }}>{inc.severity}</span>
                    </div>
                    {inc.description && (
                      <div style={S.desc}>{inc.description}</div>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <span style={{ ...S.badge, color: STATUS_COLOR[inc.status], borderColor: STATUS_COLOR[inc.status], background: `${STATUS_COLOR[inc.status]}18` }}>
                        {inc.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  dayLabel: { fontFamily: 'var(--display)', fontSize: 13, letterSpacing: 3, color: 'var(--muted)', padding: '24px 0 12px' },
  spine:    { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48, flexShrink: 0 },
  dot:      { width: 10, height: 10, borderRadius: '50%', border: '2px solid', flexShrink: 0, marginTop: 4 },
  line:     { width: 1, flex: 1, background: 'var(--border)', minHeight: 24 },
  content:  { flex: 1, paddingBottom: 28, paddingLeft: 16 },
  time:     { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 6, letterSpacing: 1 },
  card:     { background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px 18px', cursor: 'pointer' },
  cardTitle:{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 },
  desc:     { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties,
  badge:    { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, padding: '3px 8px', border: '1px solid', display: 'inline-block' },
};
