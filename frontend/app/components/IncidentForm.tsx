// app/components/IncidentForm.tsx
'use client';
import { useState } from 'react';
import { Incident, IncidentPayload } from '../api/client';

const CATEGORIES = ['Security', 'Data', 'Intelligence', 'Physical', 'Personnel', 'Other'];

interface Props {
  incident?: Incident;
  onSave:   (payload: IncidentPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

export default function IncidentForm({ incident, onSave, onDelete, onCancel }: Props) {
  const isEdit = !!incident;
  const [form, setForm] = useState({
    title:       incident?.title       || '',
    category:    incident?.category    || 'Security',
    severity:    incident?.severity    || 'MEDIUM',
    status:      incident?.status      || 'OPEN',
    date:        incident?.date        || new Date().toISOString().slice(0, 10),
    time:        incident?.time        || new Date().toTimeString().slice(0, 5),
    description: incident?.description || '',
    tags:        incident?.tags?.join(', ') || '',
  });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !confirm('Delete this incident?')) return;
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  }

  return (
    <div style={S.overlay} onClick={onCancel}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <div style={S.title}>{isEdit ? 'EDIT INCIDENT' : 'LOG INCIDENT'}</div>
          <button style={S.closeBtn} onClick={onCancel}>✕</button>
        </div>

        <div style={S.body}>
          <div style={S.group}>
            <label style={S.label}>INCIDENT TITLE *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief descriptor..." />
          </div>

          <div style={S.row}>
            <div style={S.group}>
              <label style={S.label}>CATEGORY</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={S.group}>
              <label style={S.label}>SEVERITY</label>
              <select value={form.severity} onChange={e => set('severity', e.target.value)}>
                {['CRITICAL','HIGH','MEDIUM','LOW'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={S.row}>
            <div style={S.group}>
              <label style={S.label}>DATE</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div style={S.group}>
              <label style={S.label}>TIME</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div style={S.group}>
            <label style={S.label}>STATUS</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {['OPEN','INVESTIGATING','MONITORING','ESCALATED','CLOSED'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={S.group}>
            <label style={S.label}>DESCRIPTION / FIELD NOTES</label>
            <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Document observations, evidence, actors..." style={{ resize: 'vertical' }} />
          </div>

          <div style={S.group}>
            <label style={S.label}>TAGS (COMMA SEPARATED)</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="network, access, physical..." />
          </div>
        </div>

        <div style={S.footer}>
          {isEdit && onDelete && (
            <button style={S.dangerBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'DELETING...' : 'DELETE'}
            </button>
          )}
          <button style={S.secondaryBtn} onClick={onCancel}>CANCEL</button>
          <button style={S.primaryBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'LOG INCIDENT'}
          </button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  modal:   { background: 'var(--surface)', border: '1px solid var(--border2)', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.7)' },
  header:  { padding: '28px 32px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:   { fontFamily: 'var(--display)', fontSize: 28, letterSpacing: 1, color: '#fff' },
  closeBtn:{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' },
  body:    { padding: '28px 32px' },
  footer:  { padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 },
  group:   { marginBottom: 20, flex: 1 },
  label:   { display: 'block', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 },
  row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  primaryBtn:   { background: 'var(--accent)', color: '#0b0b0f', border: 'none', fontFamily: 'var(--display)', fontSize: 18, letterSpacing: 1, padding: '10px 20px' },
  secondaryBtn: { background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1, padding: '10px 20px' },
  dangerBtn:    { background: 'none', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: 1, padding: '10px 20px', marginRight: 'auto' },
};
