// app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, useAuthStore } from '../api/client';

export default function LoginPage() {
  const router   = useRouter();
  const setAuth  = useAuthStore(s => s.setAuth);
  const [email,  setEmail]  = useState('');
  const [pass,   setPass]   = useState('');
  const [err,    setErr]    = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email || !pass) { setErr('All fields required'); return; }
    setLoading(true);
    setErr('');
    try {
      const { data } = await authApi.login(email, pass);
      setAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErr(msg || 'AUTHENTICATION FAILED');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card} className="anim-in">
        <div style={styles.stamp}>CLASSIFIED // EYES ONLY</div>
        <div style={styles.title}>SHADOW LEDGER</div>
        <div style={styles.sub}>// SECURE INCIDENT REGISTRY v2.4.1</div>

        <div style={styles.field}>
          <label style={styles.label}>OPERATIVE IDENTIFIER</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="agent@shadow.gov"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>AUTHENTICATION KEY</label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="••••••••"
          />
        </div>

        <button style={styles.btn} onClick={submit} disabled={loading}>
          {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
        </button>

        {err && <div style={styles.err}>⚠ {err}</div>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px)
    `,
  },
  card: {
    width: 420,
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    padding: '48px 40px',
    boxShadow: '0 0 80px rgba(232,197,71,0.04), 0 0 0 1px rgba(232,197,71,0.06)',
  },
  stamp:  { fontFamily: 'var(--display)', fontSize: 11, letterSpacing: 4, color: 'var(--red)', marginBottom: 4 },
  title:  { fontFamily: 'var(--display)', fontSize: 42, letterSpacing: 2, color: '#fff', marginBottom: 8 },
  sub:    { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 40 },
  field:  { marginBottom: 20 },
  label:  { display: 'block', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 },
  btn: {
    width: '100%',
    background: 'var(--accent)',
    color: '#0b0b0f',
    border: 'none',
    fontFamily: 'var(--display)',
    fontSize: 20,
    letterSpacing: 2,
    padding: '14px',
  },
  err: { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', marginTop: 14 },
};
