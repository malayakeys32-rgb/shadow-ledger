// app/incidents/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { incidentsApi, useAuthStore, Incident, IncidentPayload } from '../../api/client';
import IncidentForm from '../../components/IncidentForm';

const SEV_COLOR: Record<string, string> = { CRITICAL: '#ff2d2d', HIGH: '#ff8c00', MEDIUM: '#e8c547', LOW: '#5fa8d3' };
const STATUS_COLOR: Record<string, string> = { OPEN: '#ff2d2d', INVESTIGATING: '#ff8c00', MONITORING: '#5fa8d3', ESCALATED: '#c45fff', CLOSED: '#4a4a5a' };

export default function IncidentDetailPage() {
  const router    = useRouter();
  const { id }    = useParams<{ id: string }>();
  const token     = useAuthStore(s => s.token);
  const user      = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    incidentsApi.get(id).then(r => setIncident(r.data)).catch(() => router.push('/incidents')).finally(() => setLoading(false));
  }, [id, token]);

  async function handleUpdate(payload: IncidentPayload) {
    const { data } = await incidentsApi.update(id, payload);
    setIncident(data);
    setEditing(false);
  }

  async function handleDelete() {
    await incidentsApi.delete(id);
    router.push('/incidents');
  }

  function logout() { clearAuth(); router.push('/login'); }

  const navItems = [
    { href: '/dashboard', label: 'OVERVIEW', icon: '◈' },
    { href: '/incidents', label: 'LEDGER',   icon: '▣' },
    { href: '/timeline',  label: 'TIMELINE', icon: '◎' },
  ];

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}><div style={S.stamp}>CLASSIFIED</div><div style={S.logoName}>SHADOW LEDGER</div></div>
        <nav style={{ flex: 1, paddingTop: 20 }}>
          {navItems.map(n => (
            <div key={n.href} style={{ ...S.navItem, ...(n.href === '/incidents' ? S.navActive : {}) }}
              onClick={() => router.push(n.href)}>
              <span style={{ width: 18, textAlign: 'center' }}>{n.icon}</span> {n.label}
            </div>
          ))}
        </nav>
        <div style={S.sideFooter}>
          <div style={S.userEmail}>{user?.email}</div>
          <button style={S.logoutBtn} onClick={logout}>TERMINATE SESSION</button>
        </div>
      </aside>

      <main style={S.main}>
        {loading || !incident ? (
          <div style={{ padding: 40, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
            {loading ? 'LOADING...' : 'INCIDENT NOT FOUND'}
          </div>
        ) : (
          <>
            <div style={S.detailHeader}>
              <div style={S.backBtn} onClick={() => router.push('/incidents')}>← BACK TO LEDGER</div>
              <div style={S.detailTitle}>{incident.title}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ ...S.badge, color: SEV_COLOR[incident.severity], borderColor: SEV_COLOR[incident.severity], background: `${SEV_COLOR[incident.severity]}18` }}>{incident.severity}</span>
                <span style={{ ...S.badge, color: STATUS_COLOR[incident.status], borderColor: STATUS_COLOR[incident.status], background: `${STATUS_COLOR[incident.status]}18` }}>{incident.status}</span>
                <span style={{ ...S.badge, color: 'var(--muted)', borderColor: 'var(--border2)' }}>{incident.category}</span>
              </div>
            </div>

            <div style={S.detailBody}>
              <div>
                <div style={S.sectionTitle}>// FIELD NOTES</div>
                <div style={S.description}>{incident.description || 'No description recorded.'}</div>
              </div>

              <div style={S.metaCard}>
                <div style={S.metaRow}>
                  <div style={S.metaLabel}>LOGGED</div>
                  <div style={S.metaValue}>{incident.date} · {incident.time}</div>
                </div>
                <div style={S.metaRow}>
                  <div style={S.metaLabel}>LAST UPDATED</div>
                  <div style={S.metaValue}>{new Date(incident.updatedAt).toLocaleDateString()}</div>
                </div>
                <div style={S.metaRow}>
                  <div style={S.metaLabel}>INCIDENT ID</div>
                  <div style={{ ...S.metaValue, fontSize: 10 }}>{incident.id.toUpperCase()}</div>
                </div>
                <div style={S.metaRow}>
                  <div style={S.metaLabel}>TAGS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                    {incident.tags.length ? incident.tags.map(t => (
                      <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '3px 8px' }}>#{t}</span>
                    )) : <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>none</span>}
                  </div>
                </div>
                <div style={{ marginTop: 24 }}>
                  <button style={{ ...S.editBtn, width: '100%' }} onClick={() => setEditing(true)}>EDIT INCIDENT</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {editing && incident && (
        <IncidentForm incident={incident} onSave={handleUpdate} onDelete={handleDelete} onCancel={() => setEditing(false)} />
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  shell:    { display: 'flex', minHeight: '100vh' },
  sidebar:  { width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' },
  logo:     { padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' },
  stamp:    { fontFamily: 'var(--display)', fontSize: 9, letterSpacing: 4, color: 'var(--red)' },
  logoName: { fontFamily: 'var(--display)', fontSize: 26, letterSpacing: 1, color: '#fff', lineHeight: '1' },
  navItem:  { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 24px', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1.5, color: 'var(--muted)', cursor: 'pointer', borderLeft: '2px solid transparent' },
  navActive:{ color: 'var(--accent)', borderLeftColor: 'var(--accent)', background: 'rgba(232,197,71,0.05)' },
  sideFooter: { padding: '20px 24px', borderTop: '1px solid var(--border)' },
  userEmail:  { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn:  { width: '100%', background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, padding: 8 },
  main:       { flex: 1, overflowY: 'auto' },
  detailHeader:{ padding: '32px 40px 24px', borderBottom: '1px solid var(--border)' },
  backBtn:  { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', marginBottom: 16, display: 'inline-block' },
  detailTitle: { fontFamily: 'var(--display)', fontSize: 32, letterSpacing: 1, color: '#fff', marginBottom: 12 },
  badge:    { fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, padding: '3px 8px', border: '1px solid', display: 'inline-block' },
  detailBody:  { padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40 },
  sectionTitle:{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' },
  description: { fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' },
  metaCard: { background: 'var(--surface)', border: '1px solid var(--border)', padding: 24, height: 'fit-content' },
  metaRow:  { marginBottom: 16 },
  metaLabel:{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 4 },
  metaValue:{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' },
  editBtn:  { background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1, padding: '10px 20px' },
};
