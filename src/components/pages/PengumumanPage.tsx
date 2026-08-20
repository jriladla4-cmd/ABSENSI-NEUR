'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'

type AnnStatus = 'draft' | 'terbit' | 'arsip'
type Priority = 'normal' | 'penting'
type Tab = 'semua' | 'draft' | 'terbit' | 'arsip'
type View = 'list' | 'form' | 'preview' | 'detail'

interface Announcement {
  id: number
  title: string
  category: string
  body: string
  excerpt: string
  status: AnnStatus
  priority: Priority
  pinned: boolean
  requireAck: boolean
  target: string
  publishedAt: string | null
  month: string
  author: string
  attachments: string[]
  stats: { sent: number; read: number; ack: number }
}

const CATEGORIES = ['Kebijakan', 'Payroll', 'HR', 'IT', 'Umum']

const SEED: Announcement[] = [
  {
    id: 1,
    title: 'Perubahan Jam Kerja Bulan Agustus',
    category: 'Kebijakan',
    body: 'Halo seluruh karyawan,\n\nSehubungan dengan penyesuaian operasional, jam kerja kantor berubah menjadi 08:30–17:30 mulai Senin, 18 Agustus 2026.\n\nHarap menyesuaikan jadwal absensi dan shift masing-masing. Terima kasih atas perhatiannya.',
    excerpt: 'Terdapat perubahan jam kerja yang berlaku mulai Senin, 18 Agustus 2026...',
    status: 'terbit',
    priority: 'penting',
    pinned: true,
    requireAck: true,
    target: 'Semua Karyawan',
    publishedAt: '12 Agustus 2026 · 09:30',
    month: 'Agustus',
    author: 'HR Department',
    attachments: ['Kebijakan-Jam-Kerja.pdf', 'Jadwal-Agustus.pdf'],
    stats: { sent: 156, read: 142, ack: 138 },
  },
  {
    id: 2,
    title: 'Informasi Payroll Agustus',
    category: 'Payroll',
    body: 'Informasi jadwal payroll bulan Agustus akan diproses pada tanggal 25. Slip gaji tersedia di portal paling lambat tanggal 28.',
    excerpt: 'Informasi jadwal payroll bulan Agustus...',
    status: 'terbit',
    priority: 'normal',
    pinned: false,
    requireAck: false,
    target: 'Semua Karyawan',
    publishedAt: '10 Agustus 2026 · 14:00',
    month: 'Agustus',
    author: 'HR Department',
    attachments: [],
    stats: { sent: 156, read: 120, ack: 0 },
  },
  {
    id: 3,
    title: 'Libur Nasional & Cuti Bersama',
    category: 'Umum',
    body: 'Draft pengumuman libur nasional bulan September. Belum dipublikasikan.',
    excerpt: 'Jadwal libur nasional dan cuti bersama...',
    status: 'draft',
    priority: 'normal',
    pinned: false,
    requireAck: false,
    target: 'Semua Karyawan',
    publishedAt: null,
    month: 'Agustus',
    author: 'HR Department',
    attachments: [],
    stats: { sent: 0, read: 0, ack: 0 },
  },
  {
    id: 4,
    title: 'Jadwal Evaluasi Kinerja Q3',
    category: 'HR',
    body: 'Evaluasi kinerja Q3 akan dilaksanakan 20–24 Agustus 2026. HR akan menghubungi jadwal masing-masing.',
    excerpt: 'Evaluasi kinerja Q3 akan dilaksanakan 20–24 Agustus 2026...',
    status: 'terbit',
    priority: 'penting',
    pinned: false,
    requireAck: true,
    target: 'Semua Karyawan',
    publishedAt: '08 Agustus 2026 · 10:00',
    month: 'Agustus',
    author: 'HR Department',
    attachments: ['Form-Evaluasi-Q3.pdf'],
    stats: { sent: 156, read: 98, ack: 72 },
  },
  {
    id: 5,
    title: 'Maintenance Sistem Absensi',
    category: 'IT',
    body: 'Sistem absensi GPS diperbarui. Pastikan akurasi GPS minimal 50m sebelum check-in.',
    excerpt: 'Sistem absensi GPS diperbarui...',
    status: 'arsip',
    priority: 'normal',
    pinned: false,
    requireAck: false,
    target: 'Semua Karyawan',
    publishedAt: '02 Juli 2026 · 11:00',
    month: 'Juli',
    author: 'IT Department',
    attachments: [],
    stats: { sent: 150, read: 145, ack: 0 },
  },
  {
    id: 6,
    title: 'Reminder Absensi GPS',
    category: 'IT',
    body: 'Draft reminder untuk karyawan yang sering absen di luar radius.',
    excerpt: 'Pengingat absensi dalam radius kantor...',
    status: 'draft',
    priority: 'normal',
    pinned: false,
    requireAck: false,
    target: 'Departemen Engineering',
    publishedAt: null,
    month: 'Agustus',
    author: 'HR Department',
    attachments: [],
    stats: { sent: 0, read: 0, ack: 0 },
  },
]

const emptyForm = () => ({
  title: '',
  category: 'Kebijakan',
  priority: 'normal' as Priority,
  target: 'Semua Karyawan',
  body: '',
  attachments: [] as string[],
  requireAck: false,
  pinned: false,
  scheduleNow: true,
})

function StatusPill({ status }: { status: AnnStatus }) {
  const map = {
    draft: { label: 'Draft', bg: 'rgba(107,114,128,0.12)', color: '#6b7280', icon: '📝' },
    terbit: { label: 'Terbit', bg: 'rgba(16,185,129,0.12)', color: '#059669', icon: '🟢' },
    arsip: { label: 'Arsip', bg: 'rgba(124,58,237,0.1)', color: '#7c3aed', icon: '📦' },
  }[status]
  return (
    <span className="mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: map.bg, color: map.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {map.icon} {map.label}
    </span>
  )
}

export default function PengumumanPage() {
  const [data, setData] = useState(SEED)
  const [tab, setTab] = useState<Tab>('semua')
  const [view, setView] = useState<View>('list')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('Semua')
  const [monthFilter, setMonthFilter] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [menuId, setMenuId] = useState<number | null>(null)
  const [selected, setSelected] = useState<Announcement | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const counts = {
    total: data.length,
    draft: data.filter(a => a.status === 'draft').length,
    terbit: data.filter(a => a.status === 'terbit').length,
    arsip: data.filter(a => a.status === 'arsip').length,
  }

  const filtered = data.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    const matchTab = tab === 'semua' || a.status === tab
    const matchCat = catFilter === 'Semua' || a.category === catFilter
    const matchMonth = monthFilter === 'Semua' || a.month === monthFilter
    const matchStatus = statusFilter === 'Semua' || a.status === statusFilter.toLowerCase()
    return matchSearch && matchTab && matchCat && matchMonth && matchStatus
  })

  const selectStyle: CSSProperties = {
    padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Outfit',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setView('form')
    setMenuId(null)
  }

  const openEdit = (a: Announcement) => {
    setEditingId(a.id)
    setForm({
      title: a.title,
      category: a.category,
      priority: a.priority,
      target: a.target,
      body: a.body,
      attachments: [...a.attachments],
      requireAck: a.requireAck,
      pinned: a.pinned,
      scheduleNow: true,
    })
    setView('form')
    setMenuId(null)
  }

  const saveDraft = () => {
    if (!form.title.trim()) { showToast('Judul wajib diisi.'); return }
    if (editingId) {
      setData(d => d.map(a => a.id === editingId ? {
        ...a,
        title: form.title,
        category: form.category,
        priority: form.priority,
        target: form.target,
        body: form.body,
        excerpt: form.body.slice(0, 80) + (form.body.length > 80 ? '...' : ''),
        attachments: form.attachments,
        requireAck: form.requireAck,
        pinned: form.pinned,
        status: a.status === 'terbit' ? 'terbit' : 'draft',
      } : a))
    } else {
      setData(d => [{
        id: Date.now(),
        title: form.title,
        category: form.category,
        body: form.body,
        excerpt: form.body.slice(0, 80) + (form.body.length > 80 ? '...' : ''),
        status: 'draft',
        priority: form.priority,
        pinned: form.pinned,
        requireAck: form.requireAck,
        target: form.target,
        publishedAt: null,
        month: 'Agustus',
        author: 'HR Department',
        attachments: form.attachments,
        stats: { sent: 0, read: 0, ack: 0 },
      }, ...d])
    }
    setView('list')
    showToast('Draft tersimpan.')
  }

  const publishFromForm = () => {
    if (!form.title.trim() || !form.body.trim()) { showToast('Judul dan isi wajib diisi.'); return }
    const now = '13 Agustus 2026 · 11:40'
    if (editingId) {
      setData(d => d.map(a => a.id === editingId ? {
        ...a,
        title: form.title,
        category: form.category,
        priority: form.priority,
        target: form.target,
        body: form.body,
        excerpt: form.body.slice(0, 80) + '...',
        attachments: form.attachments,
        requireAck: form.requireAck,
        pinned: form.pinned,
        status: 'terbit' as AnnStatus,
        publishedAt: a.publishedAt ?? now,
        stats: a.stats.sent > 0 ? a.stats : { sent: 156, read: 0, ack: 0 },
      } : a))
    } else {
      const item: Announcement = {
        id: Date.now(),
        title: form.title,
        category: form.category,
        body: form.body,
        excerpt: form.body.slice(0, 80) + '...',
        status: 'terbit',
        priority: form.priority,
        pinned: form.pinned,
        requireAck: form.requireAck,
        target: form.target,
        publishedAt: now,
        month: 'Agustus',
        author: 'HR Department',
        attachments: form.attachments,
        stats: { sent: 156, read: 0, ack: 0 },
      }
      setData(d => [item, ...d])
      setSelected(item)
    }
    setView(editingId ? 'list' : 'detail')
    if (editingId) setSelected(data.find(a => a.id === editingId) ?? null)
    showToast('Pengumuman dipublikasikan.')
  }

  const setStatus = (id: number, status: AnnStatus) => {
    setData(d => d.map(a => a.id === id ? {
      ...a,
      status,
      publishedAt: status === 'terbit' ? (a.publishedAt ?? '13 Agustus 2026 · 11:40') : a.publishedAt,
      stats: status === 'terbit' && a.stats.sent === 0 ? { sent: 156, read: 0, ack: 0 } : a.stats,
    } : a))
    setMenuId(null)
    showToast(status === 'terbit' ? 'Dipublikasikan.' : status === 'draft' ? 'Dikembalikan ke draft.' : 'Diarsipkan.')
  }

  const remove = (id: number) => {
    setData(d => d.filter(a => a.id !== id))
    setMenuId(null)
    if (selected?.id === id) { setSelected(null); setView('list') }
    showToast('Pengumuman dihapus.')
  }

  // ── Form / Preview views ──
  if (view === 'form' || view === 'preview') {
    return (
      <div className="card" style={{ overflow: 'hidden', maxWidth: 720 }}>
        {toast && <div className="toast">{toast}</div>}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-ghost" style={{ padding: '6px 10px' }} onClick={() => setView(view === 'preview' ? 'form' : 'list')}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17 }}>{view === 'preview' ? 'Preview Pengumuman' : editingId ? 'Edit Pengumuman' : 'Buat Pengumuman'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {view === 'preview' ? 'Pastikan tampilan sudah sesuai sebelum publish' : 'Lengkapi informasi pengumuman'}
            </div>
          </div>
        </div>

        {view === 'preview' ? (
          <div style={{ padding: 24 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 22, background: 'var(--muted)' }}>
              {form.priority === 'penting' && (
                <div style={{ fontSize: 11, fontFamily: 'Outfit', fontWeight: 800, color: '#dc2626', marginBottom: 10 }}>🔴 PENTING</div>
              )}
              {form.pinned && <div style={{ fontSize: 11, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600, marginBottom: 6 }}>📌 Dipin di atas</div>}
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{form.title || '(Tanpa judul)'}</div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 16 }}>{form.category} · 13 Agustus 2026 · 11:40</div>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
              <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{form.body || '(Isi kosong)'}</div>
              {form.attachments.length > 0 && (
                <>
                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
                  {form.attachments.map(f => (
                    <div key={f} style={{ fontSize: 13, marginBottom: 6 }}>📎 {f}</div>
                  ))}
                </>
              )}
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <div style={{ fontSize: 13 }}>Target: <strong>{form.target}</strong></div>
              {form.requireAck && <div style={{ fontSize: 13, color: '#d97706', marginTop: 6, fontFamily: 'Outfit', fontWeight: 600 }}>✓ Wajib Acknowledge</div>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn-ghost" onClick={() => setView('list')}>Batal</button>
              <button className="btn-ghost" onClick={() => setView('form')}>Edit</button>
              <button className="btn-primary" onClick={publishFromForm}>Publish</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Judul</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Perubahan Jam Kerja Bulan Agustus" style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Kategori</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...selectStyle, width: '100%', padding: '11px 14px', fontSize: 13 }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Prioritas</label>
                <div style={{ display: 'flex', gap: 14, paddingTop: 8 }}>
                  {(['normal', 'penting'] as Priority[]).map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>
                      <input type="radio" checked={form.priority === p} onChange={() => setForm(f => ({ ...f, priority: p }))} />
                      {p === 'penting' ? '🔴 Penting' : 'Normal'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Target Audiens</label>
              <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} style={{ ...selectStyle, width: '100%', padding: '11px 14px', fontSize: 13 }}>
                {['Semua Karyawan', 'Departemen Engineering', 'Departemen Marketing', 'Jabatan Manager'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Isi Pengumuman</label>
              <textarea rows={7} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Tulis isi pengumuman..." style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Lampiran</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {form.attachments.map(f => (
                  <span key={f} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    📎 {f}
                    <button onClick={() => setForm(x => ({ ...x, attachments: x.attachments.filter(a => a !== f) }))} style={{ marginLeft: 6, border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}>×</button>
                  </span>
                ))}
              </div>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setForm(f => ({ ...f, attachments: [...f.attachments, `Dokumen-${f.attachments.length + 1}.pdf`] }))}>+ Tambahkan Lampiran</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.requireAck} onChange={e => setForm(f => ({ ...f, requireAck: e.target.checked }))} />
                Wajib acknowledge
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
                Pin di atas
              </label>
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>Jadwal Publikasi</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" checked={form.scheduleNow} onChange={() => setForm(f => ({ ...f, scheduleNow: true }))} />
                  Publikasikan sekarang
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer', opacity: 0.6 }}>
                  <input type="radio" checked={!form.scheduleNow} onChange={() => setForm(f => ({ ...f, scheduleNow: false }))} />
                  Jadwalkan
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 8 }}>
              <button className="btn-ghost" onClick={saveDraft}>Simpan Draft</button>
              <button className="btn-ghost" onClick={() => { if (!form.title.trim()) { showToast('Judul wajib diisi.'); return } setView('preview') }}>Preview</button>
              <button className="btn-primary" onClick={publishFromForm}>Publish</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Detail view ──
  if (view === 'detail' && selected) {
    const a = data.find(x => x.id === selected.id) ?? selected
    const readPct = a.stats.sent ? Math.round((a.stats.read / a.stats.sent) * 100) : 0
    const ackPct = a.stats.sent ? Math.round((a.stats.ack / a.stats.sent) * 100) : 0
    return (
      <div className="card" style={{ overflow: 'hidden', maxWidth: 720 }}>
        {toast && <div className="toast">{toast}</div>}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-ghost" style={{ padding: '6px 10px' }} onClick={() => { setView('list'); setSelected(null) }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17 }}>{a.title}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
              <StatusPill status={a.status} />
              {a.priority === 'penting' && <span style={{ fontSize: 11, color: '#dc2626', fontFamily: 'Outfit', fontWeight: 700 }}>🔴 PENTING</span>}
              {a.pinned && <span style={{ fontSize: 11, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600 }}>📌 Pinned</span>}
            </div>
          </div>
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => openEdit(a)}>Edit</button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
            {a.publishedAt ?? 'Belum dipublikasikan'} · Target: {a.target}
          </div>

          {a.status === 'terbit' && (
            <>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 12 }}>STATISTIK</div>
                <div style={{ display: 'grid', gridTemplateColumns: a.requireAck ? 'repeat(3, 1fr)' : '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Terkirim', value: a.stats.sent, sub: '' },
                    { label: 'Dibaca', value: a.stats.read, sub: `${readPct}%` },
                    ...(a.requireAck ? [{ label: 'Acknowledge', value: a.stats.ack, sub: `${ackPct}%` }] : []),
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{s.label}</div>
                      <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{s.value}</div>
                      {s.sub && <div className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{s.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 12 }}>STATUS KARYAWAN</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, fontFamily: 'Outfit' }}>
                  <div>✓ Sudah membaca <strong style={{ marginLeft: 8 }}>{a.stats.read}</strong></div>
                  <div>○ Belum membaca <strong style={{ marginLeft: 8 }}>{Math.max(0, a.stats.sent - a.stats.read)}</strong></div>
                  {a.requireAck && (
                    <>
                      <div>✓ Acknowledge <strong style={{ marginLeft: 8 }}>{a.stats.ack}</strong></div>
                      <div>○ Belum acknowledge <strong style={{ marginLeft: 8 }}>{Math.max(0, a.stats.sent - a.stats.ack)}</strong></div>
                    </>
                  )}
                </div>
                <button className="btn-ghost" style={{ marginTop: 12, fontSize: 12 }}>Lihat Daftar Karyawan</button>
              </div>
            </>
          )}

          <div style={{ height: 1, background: 'var(--border)' }} />
          <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{a.body}</div>
          {a.attachments.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontFamily: 'Outfit', fontWeight: 600, marginBottom: 8 }}>Lampiran</div>
              {a.attachments.map(f => <div key={f} style={{ fontSize: 13, marginBottom: 4 }}>📄 {f}</div>)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {a.status === 'draft' && <button className="btn-primary" onClick={() => setStatus(a.id, 'terbit')}>Publish</button>}
            {a.status === 'terbit' && (
              <>
                <button className="btn-ghost" onClick={() => setStatus(a.id, 'draft')}>Unpublish</button>
                <button className="btn-ghost" onClick={() => setStatus(a.id, 'arsip')}>Arsipkan</button>
              </>
            )}
            {a.status === 'arsip' && <button className="btn-primary" onClick={() => setStatus(a.id, 'terbit')}>Pulihkan</button>}
          </div>
        </div>
      </div>
    )
  }

  // ── List view ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onClick={() => menuId && setMenuId(null)}>
      {toast && <div className="toast">{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>Pengumuman</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Kelola informasi dan komunikasi perusahaan</div>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Buat Pengumuman</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total', value: counts.total, color: '#2563eb', tab: 'semua' as Tab },
          { label: 'Draft', value: counts.draft, color: '#6b7280', tab: 'draft' as Tab },
          { label: 'Terbit', value: counts.terbit, color: '#10b981', tab: 'terbit' as Tab },
          { label: 'Arsip', value: counts.arsip, color: '#7c3aed', tab: 'arsip' as Tab },
        ].map(s => (
          <button key={s.label} onClick={() => setTab(s.tab)} className="card" style={{
            padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
            border: tab === s.tab ? `1.5px solid ${s.color}` : '1px solid var(--border)',
            background: tab === s.tab ? `${s.color}10` : 'var(--card)',
          }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </button>
        ))}
      </div>

      <div className="tab-bar-scroll" style={{ background: 'var(--muted)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {([
          { id: 'semua' as Tab, label: 'Semua' },
          { id: 'draft' as Tab, label: 'Draft' },
          { id: 'terbit' as Tab, label: 'Terbit' },
          { id: 'arsip' as Tab, label: 'Arsip' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: 'Outfit', fontWeight: 600, fontSize: 13,
            background: tab === t.id ? 'var(--card)' : 'transparent',
            color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Bulan</option>
          <option>Agustus</option>
          <option>Juli</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Status</option>
          <option>Draft</option>
          <option>Terbit</option>
          <option>Arsip</option>
        </select>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Judul', 'Kategori', 'Status', 'Terbit', 'Aksi'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
                    {a.pinned && '📌 '}{a.priority === 'penting' && '🔴 '}{a.title}
                  </div>
                  {a.requireAck && <div style={{ fontSize: 10, color: '#d97706', marginTop: 2 }}>⚠ Wajib acknowledge</div>}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted-foreground)' }}>{a.category}</td>
                <td style={{ padding: '12px 16px' }}><StatusPill status={a.status} /></td>
                <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{a.publishedAt?.split(' · ')[0] ?? '—'}</span></td>
                <td style={{ padding: '12px 16px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuId(menuId === a.id ? null : a.id)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}
                  >⋮</button>
                  {menuId === a.id && (
                    <div className="card" style={{ position: 'absolute', right: 16, top: 44, zIndex: 20, padding: 6, minWidth: 140, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
                      {a.status === 'draft' && (
                        <>
                          <MenuBtn onClick={() => openEdit(a)}>Edit</MenuBtn>
                          <MenuBtn onClick={() => { openEdit(a); setView('preview') }}>Preview</MenuBtn>
                          <MenuBtn onClick={() => setStatus(a.id, 'terbit')}>Publish</MenuBtn>
                          <MenuBtn onClick={() => remove(a.id)} danger>Hapus</MenuBtn>
                        </>
                      )}
                      {a.status === 'terbit' && (
                        <>
                          <MenuBtn onClick={() => { setSelected(a); setView('detail'); setMenuId(null) }}>Lihat</MenuBtn>
                          <MenuBtn onClick={() => openEdit(a)}>Edit</MenuBtn>
                          <MenuBtn onClick={() => setStatus(a.id, 'draft')}>Unpublish</MenuBtn>
                          <MenuBtn onClick={() => setStatus(a.id, 'arsip')}>Arsipkan</MenuBtn>
                        </>
                      )}
                      {a.status === 'arsip' && (
                        <>
                          <MenuBtn onClick={() => { setSelected(a); setView('detail'); setMenuId(null) }}>Lihat</MenuBtn>
                          <MenuBtn onClick={() => setStatus(a.id, 'terbit')}>Pulihkan</MenuBtn>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada pengumuman.</div>
        )}
      </div>
    </div>
  )
}

function MenuBtn({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
        border: 'none', background: 'transparent', cursor: 'pointer',
        fontFamily: 'Outfit', fontWeight: 600, fontSize: 13,
        color: danger ? '#dc2626' : 'var(--foreground)',
      }}
    >
      {children}
    </button>
  )
}
