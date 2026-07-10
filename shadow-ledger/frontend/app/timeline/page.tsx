// app/timeline/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { timelineApi, useAuthStore, TimelineDay } from '../api/client';
import TimelineView from '../components/TimelineView';

export default function TimelinePage() {
  const router    = useRouter();
  const token     = useAuthStore(s => s.token);
  const user      = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const [days,    setDays]    = useState<TimelineDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [from,    setFrom]    = useState('');
  const [to,      setTo]      = useState('');

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await timelineApi.get({ ...(from ? { from } : {}), ...(to ? { to } : {}) });
      setDays(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [from, to]);

  function logout() { clearAuth(); router.push('/login'); }

  const totalIncidents = days.reduce((acc, d) => acc + d.incidents.length, 0);

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
            <div key={n.href} style={{ ...S.navItem, ...(n.href === '/timeline' ? S.navActive : {}) }}
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
        <div style={{ ...S.pageHeader, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={S.pageTitle}>TIMELINE</div>
            <div style={S.pageSub}>// CHRONOLOGICAL EVENT RECONSTRUCTION — {totalIncidents} INCIDENTS</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 4 }}>FROM</div>
              <input type="date" style={{ width: 140, padding: '6px 10px' }} value={from} onChange={e => setFrom(e.target.value)} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 4 }}>TO</div>
              <input type="date" style={{ width: 140, padding: '6px 10px' }} value={to} onChange={e => setTo(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>
          {loading
            ? <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>LOADING...</div>
            : <TimelineView days={days} />
          }
        </div>
      </main>
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
  pageHeader: { padding: '36px 40px 24px', borderBottom: '1px solid var(--border)' },
  pageTitle:  { fontFamily: 'var(--display)', fontSize: 36, letterSpacing: 2, color: '#fff' },
  pageSub:    { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 4 },
};
