// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { incidentsApi, useAuthStore, Incident } from '../api/client';

export default function DashboardPage() {
  const router   = useRouter();
  const user     = useAuthStore(s => s.user);
  const token    = useAuthStore(s => s.token);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    incidentsApi.list().then(r => setIncidents(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token, router]);

  const counts = {
    critical: incidents.filter(i => i.severity === 'CRITICAL').length,
    high:     incidents.filter(i => i.severity === 'HIGH').length,
    open:     incidents.filter(i => i.status === 'OPEN').length,
    total:    incidents.length,
  };

  const recent = [...incidents]
    .sort((a, b) => `${b.date}${b.time}` > `${a.date}${a.time}` ? 1 : -1)
    .slice(0, 5);

  function logout() { clearAuth(); router.push('/login'); }

  return (
    <div style={S.shell}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.stamp}>CLASSIFIED</div>
          <div style={S.logoName}>SHADOW LEDGER</div>
        </div>
        <nav style={{ flex: 1, paddingTop: 20 }}>
          {[
            { href: '/dashboard',  label: 'OVERVIEW',  icon: '◈' },
            { href: '/incidents',  label: 'LEDGER',    icon: '▣' },
            { href: '/timeline',   label: 'TIMELINE',  icon: '◎' },
          ].map(n => (
            <div key={n.href} style={{ ...S.navItem, ...(n.href === '/dashboard' ? S.navActive : {}) }}
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

      {/* Main */}
      <main style={S.main}>
        <div style={S.pageHeader}>
          <div>
            <div style={S.pageTitle}>SITUATION OVERVIEW</div>
            <div style={S.pageSub}>// {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>
          {loading ? (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>LOADING...</div>
          ) : (
            <>
              <div style={S.statsGrid}>
                {[
                  { color: '#ff2d2d', num: counts.critical, label: 'CRITICAL INCIDENTS' },
                  { color: '#ff8c00', num: counts.high,     label: 'HIGH SEVERITY' },
                  { color: '#ff2d2d', num: counts.open,     label: 'OPEN STATUS' },
                  { color: '#5fa8d3', num: counts.total,    label: 'TOTAL LOGGED' },
                ].map(s => (
                  <div key={s.label} style={{ ...S.statCard, boxShadow: `inset 0 2px 0 ${s.color}` }}>
                    <div style={S.statNum}>{s.num}</div>
                    <div style={S.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={S.sectionTitle}>// RECENT ACTIVITY</div>
              {recent.map(inc => (
                <div key={inc.id} style={S.incRow} onClick={() => router.push(`/incidents/${inc.id}`)}>
                  <div style={{ ...S.sevBar, background: inc.severity === 'CRITICAL' ? '#ff2d2d' : inc.severity === 'HIGH' ? '#ff8c00' : '#e8c547' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{inc.title}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{inc.category} · {inc.date} · {inc.time}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 1.5, padding: '3px 8px', border: `1px solid #e8c547`, color: '#e8c547', background: '#e8c54710', flexShrink: 0 }}>
                    {inc.status}
                  </div>
                </div>
              ))}

              <button style={S.viewAllBtn} onClick={() => router.push('/incidents')}>VIEW ALL INCIDENTS →</button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  shell:      { display: 'flex', minHeight: '100vh' },
  sidebar:    { width: 220, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' },
  logo:       { padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' },
  stamp:      { fontFamily: 'var(--display)', fontSize: 9, letterSpacing: 4, color: 'var(--red)' },
  logoName:   { fontFamily: 'var(--display)', fontSize: 26, letterSpacing: 1, color: '#fff', lineHeight: '1' },
  navItem:    { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 24px', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1.5, color: 'var(--muted)', cursor: 'pointer', borderLeft: '2px solid transparent' },
  navActive:  { color: 'var(--accent)', borderLeftColor: 'var(--accent)', background: 'rgba(232,197,71,0.05)' },
  sideFooter: { padding: '20px 24px', borderTop: '1px solid var(--border)' },
  userEmail:  { fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn:  { width: '100%', background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 1.5, padding: 8 },
  main:       { flex: 1, overflowY: 'auto' },
  pageHeader: { padding: '36px 40px 24px', borderBottom: '1px solid var(--border)' },
  pageTitle:  { fontFamily: 'var(--display)', fontSize: 36, letterSpacing: 2, color: '#fff' },
  pageSub:    { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 4 },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 },
  statCard:   { background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px 20px' },
  statNum:    { fontFamily: 'var(--display)', fontSize: 48, letterSpacing: 2, color: '#fff', lineHeight: 1 },
  statLabel:  { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', marginTop: 6 },
  sectionTitle: { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' },
  incRow:     { background: 'var(--surface)', border: '1px solid var(--border)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', marginBottom: 2, position: 'relative' },
  sevBar:     { width: 3, position: 'absolute', left: 0, top: 0, bottom: 0 },
  viewAllBtn: { marginTop: 20, background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1, padding: '10px 20px' },
};
