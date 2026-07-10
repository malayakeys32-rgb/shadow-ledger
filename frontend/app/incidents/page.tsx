// app/incidents/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { incidentsApi, useAuthStore, Incident, IncidentPayload } from '../api/client';
import IncidentList from '../components/IncidentList';
import IncidentForm from '../components/IncidentForm';

export default function IncidentsPage() {
  const router    = useRouter();
  const token     = useAuthStore(s => s.token);
  const user      = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [search,    setSearch]    = useState('');
  const [filterSev, setFilterSev] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const CATEGORIES = ['Security', 'Data', 'Intelligence', 'Physical', 'Personnel', 'Other'];

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    load();
  }, [token]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await incidentsApi.list({
        ...(filterSev ? { severity: filterSev } : {}),
        ...(filterCat ? { category: filterCat } : {}),
        ...(search    ? { search }              : {}),
      });
      setIncidents(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [search, filterSev, filterCat]);

  async function handleCreate(payload: IncidentPayload) {
    const { data } = await incidentsApi.create(payload);
    setShowForm(false);
    router.push(`/incidents/${data.id}`);
  }

  function logout() { clearAuth(); router.push('/login'); }

  const navItems = [
    { href: '/dashboard', label: 'OVERVIEW',  icon: '◈' },
    { href: '/incidents', label: 'LEDGER',    icon: '▣' },
    { href: '/timeline',  label: 'TIMELINE',  icon: '◎' },
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
        <div style={{ ...S.pageHeader, justifyContent: 'space-between', display: 'flex', alignItems: 'flex-end' }}>
          <div>
            <div style={S.pageTitle}>INCIDENT LEDGER</div>
            <div style={S.pageSub}>// {incidents.length} ENTRIES ON RECORD</div>
          </div>
          <button style={S.newBtn} onClick={() => setShowForm(true)}>+ LOG INCIDENT</button>
        </div>

        <div style={{ padding: '32px 40px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <input style={{ flex: 1, minWidth: 200 }} placeholder="SEARCH INCIDENTS..." value={search}
              onChange={e => setSearch(e.target.value)} />
            <select style={{ width: 'auto' }} value={filterSev} onChange={e => setFilterSev(e.target.value)}>
              <option value="">ALL SEVERITIES</option>
              {['CRITICAL','HIGH','MEDIUM','LOW'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">ALL CATEGORIES</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {loading
            ? <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>LOADING...</div>
            : <IncidentList incidents={incidents} onClick={id => router.push(`/incidents/${id}`)} />
          }
        </div>
      </main>

      {showForm && (
        <IncidentForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
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
  pageHeader: { padding: '36px 40px 24px', borderBottom: '1px solid var(--border)' },
  pageTitle:  { fontFamily: 'var(--display)', fontSize: 36, letterSpacing: 2, color: '#fff' },
  pageSub:    { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 4 },
  newBtn:     { background: 'var(--accent)', color: '#0b0b0f', border: 'none', fontFamily: 'var(--display)', fontSize: 18, letterSpacing: 1, padding: '10px 20px' },
};
