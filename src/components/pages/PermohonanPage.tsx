'use client'

import { useState, type CSSProperties } from 'react'
import ModalOverlay from '@/components/ModalOverlay'
import { categoryFromNav, categoryLabel, matchesHrRequestType, type PermohonanCategory } from '@/lib/permohonanTypes'

type RequestStatus = 'menunggu' | 'disetujui' | 'ditolak' | 'dikembalikan'
type RequestType = 'Cuti' | 'Sakit' | 'WFH' | 'Izin' | 'Dinas' | 'Telat'
type InboxTab = 'perlu' | 'semua' | 'riwayat'

interface HrRequest {
  id: number
  no: string
  employee: string
  nik: string
  jabatan: string
  dept: string
  manager: string
  type: RequestType
  date: string
  duration: string
  note: string
  status: RequestStatus
  avatar: string
  color: string
  month: string
  submittedAt: string
  hasAttachment: boolean
  attachmentName?: string
  timeline: { label: string; time: string; done: boolean }[]
}

const SEED: HrRequest[] = [
  {
    id: 129, no: 'PRM-2026-00129', employee: 'Budi Santoso', nik: 'EMP00088', jabatan: 'Marketing Manager', dept: 'Marketing', manager: 'Yuli Andini',
    type: 'Telat', date: '12 Agu 2026', duration: '—', note: 'Macet di tol, rencana 08:00 · aktual 09:14.', status: 'menunggu',
    avatar: 'BS', color: '#7c3aed', month: 'Agustus 2026', submittedAt: '12 Agu · 09:20', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '12 Agu · 09:20', done: true },
      { label: 'Menunggu persetujuan', time: '', done: false },
    ],
  },
  {
    id: 128, no: 'PRM-2026-00128', employee: 'Mika', nik: 'EMP00123', jabatan: 'Software Engineer', dept: 'Engineering', manager: 'Budi Santoso',
    type: 'Cuti', date: '20–22 Agu 2026', duration: '3 Hari', note: 'Keperluan pribadi.', status: 'menunggu',
    avatar: 'MK', color: '#2563eb', month: 'Agustus 2026', submittedAt: '12 Agu · 08:31', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '12 Agu · 08:31', done: true },
      { label: 'Diteruskan ke Supervisor', time: '12 Agu · 08:32', done: true },
      { label: 'Menunggu persetujuan', time: '', done: false },
    ],
  },
  {
    id: 127, no: 'PRM-2026-00127', employee: 'Andi', nik: 'EMP00145', jabatan: 'HR Specialist', dept: 'HR', manager: 'Fajar Nugroho',
    type: 'Sakit', date: '12 Agu 2026', duration: '1 Hari', note: 'Demam tinggi, istirahat di rumah.', status: 'menunggu',
    avatar: 'AN', color: '#ef4444', month: 'Agustus 2026', submittedAt: '11 Agu · 19:02', hasAttachment: true, attachmentName: 'Surat_Dokter.pdf',
    timeline: [
      { label: 'Pengajuan dibuat', time: '11 Agu · 19:02', done: true },
      { label: 'Menunggu persetujuan', time: '', done: false },
    ],
  },
  {
    id: 126, no: 'PRM-2026-00126', employee: 'Budi', nik: 'EMP00088', jabatan: 'Marketing Manager', dept: 'Marketing', manager: 'Yuli Andini',
    type: 'WFH', date: '11 Agu 2026', duration: '1 Hari', note: 'Menunggu teknisi internet di rumah.', status: 'disetujui',
    avatar: 'BS', color: '#7c3aed', month: 'Agustus 2026', submittedAt: '10 Agu · 09:15', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '10 Agu · 09:15', done: true },
      { label: 'Disetujui HR', time: '10 Agu · 11:40', done: true },
    ],
  },
  {
    id: 125, no: 'PRM-2026-00125', employee: 'Sinta', nik: 'EMP00102', jabatan: 'Legal Counsel', dept: 'Legal', manager: 'Fajar Nugroho',
    type: 'Izin', date: '10 Agu 2026', duration: '1 Hari', note: 'Urusan keluarga mendadak.', status: 'ditolak',
    avatar: 'SD', color: '#f59e0b', month: 'Agustus 2026', submittedAt: '09 Agu · 14:20', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '09 Agu · 14:20', done: true },
      { label: 'Ditolak HR', time: '09 Agu · 16:05', done: true },
    ],
  },
  {
    id: 124, no: 'PRM-2026-00124', employee: 'Rina Setiawati', nik: 'EMP00011', jabatan: 'Senior Frontend Dev', dept: 'Engineering', manager: 'Marco Hendra',
    type: 'WFH', date: '14 Agu 2026', duration: '1 Hari', note: 'Keperluan pribadi', status: 'menunggu',
    avatar: 'RS', color: '#2563eb', month: 'Agustus 2026', submittedAt: '12 Agu · 10:01', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '12 Agu · 10:01', done: true },
      { label: 'Menunggu persetujuan', time: '', done: false },
    ],
  },
  {
    id: 120, no: 'PRM-2026-00120', employee: 'Rina Setiawati', nik: 'EMP00011', jabatan: 'Senior Frontend Dev', dept: 'Engineering', manager: 'Marco Hendra',
    type: 'Sakit', date: '09 Agu 2026', duration: '1 Hari', note: 'Surat dokter terlampir.', status: 'disetujui',
    avatar: 'RS', color: '#2563eb', month: 'Agustus 2026', submittedAt: '08 Agu · 07:45', hasAttachment: true, attachmentName: 'Surat_Dokter.pdf',
    timeline: [
      { label: 'Pengajuan dibuat', time: '08 Agu · 07:45', done: true },
      { label: 'Disetujui HR', time: '08 Agu · 09:10', done: true },
    ],
  },
  {
    id: 98, no: 'PRM-2026-00098', employee: 'Lana Kusuma', nik: 'EMP00055', jabatan: 'UI/UX Designer', dept: 'Design', manager: 'Lana Kusuma',
    type: 'Cuti', date: '20–22 Jul 2026', duration: '3 Hari', note: 'Keperluan pribadi', status: 'disetujui',
    avatar: 'LK', color: '#ec4899', month: 'Juli 2026', submittedAt: '18 Jul · 11:00', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '18 Jul · 11:00', done: true },
      { label: 'Disetujui HR', time: '18 Jul · 15:22', done: true },
    ],
  },
  {
    id: 91, no: 'PRM-2026-00091', employee: 'Nadia Putri', nik: 'EMP00077', jabatan: 'Legal Counsel', dept: 'Legal', manager: 'Fajar Nugroho',
    type: 'Izin', date: '10 Jul 2026', duration: '1 Hari', note: 'Urusan administrasi', status: 'ditolak',
    avatar: 'NP', color: '#ef4444', month: 'Juli 2026', submittedAt: '09 Jul · 08:30', hasAttachment: false,
    timeline: [
      { label: 'Pengajuan dibuat', time: '09 Jul · 08:30', done: true },
      { label: 'Ditolak HR', time: '09 Jul · 13:00', done: true },
    ],
  },
]

const TYPE_ICON: Record<RequestType, string> = {
  Cuti: '🌴', Sakit: '🏥', WFH: '🏠', Izin: '📋', Dinas: '🧳', Telat: '⏰',
}

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg: Record<RequestStatus, { label: string; bg: string; color: string; dot: string }> = {
    menunggu: { label: 'Menunggu', bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b' },
    disetujui: { label: 'Disetujui', bg: 'rgba(16,185,129,0.12)', color: '#059669', dot: '#10b981' },
    ditolak: { label: 'Ditolak', bg: 'rgba(239,68,68,0.1)', color: '#dc2626', dot: '#ef4444' },
    dikembalikan: { label: 'Dikembalikan', bg: 'rgba(59,130,246,0.1)', color: '#2563eb', dot: '#3b82f6' },
  }
  const c = cfg[status]
  return (
    <span className="mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: c.bg, color: c.color, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  )
}

function DetailDrawer({
  req, onClose, onApprove, onReject, onReturn,
}: {
  req: HrRequest
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  onReturn: () => void
}) {
  return (
    <ModalOverlay onClose={onClose} align="drawer">
      <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ width: '100%', maxWidth: 440, height: '100%', borderLeft: '1px solid var(--border)', borderRadius: 0, overflowY: 'auto', boxShadow: '-16px 0 48px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>Permohonan #{req.no}</div>
            <div style={{ marginTop: 8 }}><StatusBadge status={req.status} /></div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Employee card */}
          <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--muted)', border: '1px solid var(--border)', display: 'flex', gap: 12 }}>
            <Avatar initials={req.avatar} color={req.color} size={44} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>{req.employee}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{req.jabatan}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{req.dept}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>NIK: {req.nik}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Atasan: {req.manager}</div>
            </div>
          </div>

          {/* Detail */}
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 10 }}>DETAIL</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>{TYPE_ICON[req.type]} {req.type === 'Sakit' ? 'Izin Sakit' : req.type === 'Cuti' ? 'Cuti Tahunan' : req.type === 'Telat' ? 'Izin Telat' : req.type}</div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>{req.date}</div>
            <div style={{ fontSize: 13, fontFamily: 'Outfit', fontWeight: 600, marginTop: 2 }}>{req.duration}</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>Alasan:</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>{req.note}</div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Generated doc */}
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 10 }}>DOKUMEN PERMOHONAN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 22 }}>📄</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.no}.pdf</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Generated by system</div>
              </div>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}>Preview</button>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 10 }}>LAMPIRAN</div>
            {req.hasAttachment ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 22 }}>📎</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{req.attachmentName ?? 'Dokumen_Pendukung.pdf'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Upload karyawan</div>
                </div>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}>Preview</button>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}>Download</button>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada lampiran</div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Timeline */}
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 12 }}>APPROVAL TIMELINE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {req.timeline.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      background: ev.done ? '#10b981' : '#f59e0b',
                      boxShadow: ev.done ? '0 0 0 3px rgba(16,185,129,0.2)' : '0 0 0 3px rgba(245,158,11,0.2)',
                    }} />
                    {i < req.timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 22, background: 'var(--border)', marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: i < req.timeline.length - 1 ? 14 : 0 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{ev.done ? `✓ ${ev.label}` : `● ${ev.label}`}</div>
                    {ev.time && <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{ev.time}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {req.status === 'menunggu' && (
            <div style={{ display: 'flex', gap: 8, paddingTop: 8, flexWrap: 'wrap' }}>
              <button className="btn-ghost" style={{ color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)', flex: 1 }} onClick={onReject}>Tolak</button>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={onReturn}>Kembalikan</button>
              <button className="btn-primary" style={{ flex: 1.2 }} onClick={onApprove}>✓ Setujui</button>
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  )
}

export default function PermohonanPage({ categoryKey = 'permohonan/inbox' }: { categoryKey?: string }) {
  const category: PermohonanCategory = categoryFromNav(categoryKey)
  const categoryScoped = category !== 'inbox'
  const [data, setData] = useState(SEED)
  const [tab, setTab] = useState<InboxTab>('perlu')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [deptFilter, setDeptFilter] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [monthFilter, setMonthFilter] = useState('Semua')
  const [selected, setSelected] = useState<HrRequest | null>(null)

  const scopedData = data.filter((r) => matchesHrRequestType(r.type, category))

  const total = scopedData.length
  const perlu = scopedData.filter(r => r.status === 'menunggu').length
  const approved = scopedData.filter(r => r.status === 'disetujui').length
  const rejected = scopedData.filter(r => r.status === 'ditolak' || r.status === 'dikembalikan').length

  const filtered = scopedData.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.employee.toLowerCase().includes(q) || r.nik.toLowerCase().includes(q) || r.no.toLowerCase().includes(q)
    const matchTab =
      tab === 'semua' ||
      (tab === 'perlu' && r.status === 'menunggu') ||
      (tab === 'riwayat' && r.status !== 'menunggu')
    const matchType = categoryScoped || typeFilter === 'Semua' || r.type === typeFilter
    const matchDept = deptFilter === 'Semua' || r.dept === deptFilter
    const matchStatus = statusFilter === 'Semua' || r.status === statusFilter.toLowerCase()
    const matchMonth = monthFilter === 'Semua' || r.month.startsWith(monthFilter)
    return matchSearch && matchTab && matchType && matchDept && matchStatus && matchMonth
  })

  const setStatus = (id: number, status: RequestStatus, timelineLabel: string) => {
    setData(d => d.map(r => {
      if (r.id !== id) return r
      const now = new Date().toLocaleString('id', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '')
      return {
        ...r,
        status,
        timeline: [
          ...r.timeline.filter(t => t.done),
          { label: timelineLabel, time: now, done: true },
        ],
      }
    }))
    setSelected(prev => prev && prev.id === id ? { ...prev, status, timeline: [...prev.timeline.filter(t => t.done), { label: timelineLabel, time: 'baru saja', done: true }] } : prev)
  }

  const selectStyle: CSSProperties = {
    padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Outfit',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {selected && (
        <DetailDrawer
          req={selected}
          onClose={() => setSelected(null)}
          onApprove={() => setStatus(selected.id, 'disetujui', 'Disetujui HR')}
          onReject={() => setStatus(selected.id, 'ditolak', 'Ditolak HR')}
          onReturn={() => setStatus(selected.id, 'dikembalikan', 'Dikembalikan ke karyawan')}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>{categoryLabel(category)}</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
            {categoryScoped
              ? `Kelola pengajuan ${categoryLabel(category).replace('Permohonan — ', '').toLowerCase()} dari karyawan`
              : 'Kelola dan proses semua pengajuan karyawan'}
          </div>
        </div>
        <button className="btn-ghost">Export</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total', value: total, color: '#2563eb' },
          { label: 'Perlu Proses', value: perlu, color: '#f59e0b' },
          { label: 'Disetujui', value: approved, color: '#10b981' },
          { label: 'Ditolak', value: rejected, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama / NIK / No. Permohonan..."
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }}
        />
      </div>

      {/* Tabs */}
      <div className="tab-bar-scroll" style={{ background: 'var(--muted)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {([
          { id: 'perlu' as const, label: 'Perlu Diproses' },
          { id: 'semua' as const, label: 'Semua' },
          { id: 'riwayat' as const, label: 'Riwayat Approval' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'Outfit', fontWeight: 600, fontSize: 13,
              background: tab === t.id ? 'var(--card)' : 'transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!categoryScoped && (
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Jenis</option>
          {['Cuti', 'Telat', 'Sakit', 'WFH', 'Izin', 'Dinas'].map(t => <option key={t} value={t}>{t === 'Telat' ? 'Izin Telat' : t === 'Sakit' ? 'Izin Sakit' : t}</option>)}
        </select>
        )}
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Departemen</option>
          {['Engineering', 'Marketing', 'HR', 'Legal', 'Design', 'Sales', 'Finance'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Status</option>
          {['Menunggu', 'Disetujui', 'Ditolak'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={selectStyle}>
          <option value="Semua">Semua Bulan</option>
          {['Agustus', 'Juli'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['No.', 'Karyawan', 'Jenis', 'Tanggal', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{r.no.replace('PRM-2026-', 'PRM-')}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={r.avatar} color={r.color} size={28} />
                    <div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{r.employee}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{r.nik}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{TYPE_ICON[r.type]} {r.type}</span>
                </td>
                <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 12 }}>{r.date}</span></td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => setSelected(r)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}
                  >
                    Lihat →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada permohonan pada filter ini.</div>
        )}
      </div>
    </div>
  )
}
