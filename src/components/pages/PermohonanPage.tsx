'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = 'menunggu' | 'disetujui' | 'ditolak'
type RequestType = 'Tidak Masuk' | 'Sakit' | 'Terlambat' | 'Pulang Cepat' | 'Izin Keluar' | 'Lembur' | 'Ganti Biaya'

interface PermohonanRequest {
  id: number
  employee: string
  dept: string
  type: RequestType
  date: string
  note: string
  status: RequestStatus
  avatar: string
  color: string
  hasAttachment?: boolean
  jamMulai?: string
  jamSelesai?: string
  jumlah?: number
  kategori?: string
}

// ─── Attendance effect per type ───────────────────────────────────────────────

const EFFECT_CONFIG: Record<RequestType, { efek: string; efekColor: string; efekBg: string; icon: string }> = {
  'Tidak Masuk':  { efek: 'IZIN',             efekColor: '#7c3aed', efekBg: 'rgba(124,58,237,0.1)',  icon: '🚪' },
  'Sakit':        { efek: 'SAKIT',             efekColor: '#dc2626', efekBg: 'rgba(239,68,68,0.1)',   icon: '🩺' },
  'Terlambat':    { efek: 'TELAT + disetujui', efekColor: '#d97706', efekBg: 'rgba(245,158,11,0.1)',  icon: '⏰' },
  'Pulang Cepat': { efek: 'HADIR + cuti dini', efekColor: '#0891b2', efekBg: 'rgba(8,145,178,0.1)',   icon: '🏃' },
  'Izin Keluar':  { efek: 'HADIR + luar kantor', efekColor: '#059669', efekBg: 'rgba(16,185,129,0.1)', icon: '📍' },
  'Lembur':       { efek: 'HADIR + lembur',    efekColor: '#2563eb', efekBg: 'rgba(37,99,235,0.1)',   icon: '💼' },
  'Ganti Biaya':  { efek: 'Tidak berubah',     efekColor: '#6b7280', efekBg: 'rgba(107,114,128,0.1)', icon: '💰' },
}

const TYPE_COLORS: Record<RequestType, string> = {
  'Tidak Masuk':  '#7c3aed',
  'Sakit':        '#dc2626',
  'Terlambat':    '#d97706',
  'Pulang Cepat': '#0891b2',
  'Izin Keluar':  '#059669',
  'Lembur':       '#2563eb',
  'Ganti Biaya':  '#6b7280',
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const allRequests: PermohonanRequest[] = [
  { id: 1,  employee: 'Budi Santoso',     dept: 'Marketing',    type: 'Sakit',        date: '12 Agu 2026',      note: 'Demam tinggi sejak kemarin malam',          status: 'menunggu', avatar: 'BS', color: '#7c3aed', hasAttachment: true },
  { id: 2,  employee: 'Nadia Putri',      dept: 'Legal',        type: 'Tidak Masuk',  date: '13–15 Agu 2026',   note: 'Cuti tahunan yang sudah direncanakan',       status: 'menunggu', avatar: 'NP', color: '#ef4444' },
  { id: 3,  employee: 'Marco Hendra',     dept: 'Engineering',  type: 'Terlambat',    date: '14 Agu 2026',      note: 'Antrian di KRL Sudirman padat sekali',       status: 'menunggu', avatar: 'MH', color: '#06b6d4', jamMulai: '08:00', jamSelesai: '08:45' },
  { id: 4,  employee: 'Lana Kusuma',      dept: 'Design',       type: 'Pulang Cepat', date: '11 Agu 2026',      note: 'Antar orang tua ke dokter spesialis',       status: 'disetujui', avatar: 'LK', color: '#ec4899', jamMulai: '15:00', jamSelesai: '17:00' },
  { id: 5,  employee: 'Rizky Firmansyah', dept: 'Sales',        type: 'Izin Keluar',  date: '10 Agu 2026',      note: 'Meeting klien di Menteng, estimasi 2 jam',   status: 'disetujui', avatar: 'RF', color: '#10b981', jamMulai: '10:00', jamSelesai: '12:00' },
  { id: 6,  employee: 'Dita Permata',     dept: 'Finance',      type: 'Tidak Masuk',  date: '09 Agu 2026',      note: 'Acara keluarga penting di luar kota',        status: 'ditolak', avatar: 'DP', color: '#0d9488' },
  { id: 7,  employee: 'Rina Setiawati',   dept: 'Engineering',  type: 'Lembur',       date: '12 Agu 2026',      note: 'Deploy fitur baru sebelum deadline klien',   status: 'menunggu', avatar: 'RS', color: '#2563eb', jamMulai: '17:00', jamSelesai: '20:00' },
  { id: 8,  employee: 'Marco Hendra',     dept: 'Engineering',  type: 'Lembur',       date: '11 Agu 2026',      note: 'Perbaikan bug kritis production server',     status: 'menunggu', avatar: 'MH', color: '#06b6d4', jamMulai: '18:00', jamSelesai: '21:30' },
  { id: 9,  employee: 'Yuli Andini',      dept: 'Sales',        type: 'Lembur',       date: '10 Agu 2026',      note: 'Presentasi proposal ke klien enterprise',    status: 'disetujui', avatar: 'YA', color: '#f97316', jamMulai: '17:00', jamSelesai: '19:00' },
  { id: 10, employee: 'Rizky Firmansyah', dept: 'Sales',        type: 'Ganti Biaya',  date: '12 Agu 2026',      note: 'Grab ke klien Menteng + parkir gedung',     status: 'menunggu', avatar: 'RF', color: '#10b981', jumlah: 185000, kategori: 'Transportasi', hasAttachment: true },
  { id: 11, employee: 'Budi Santoso',     dept: 'Marketing',    type: 'Ganti Biaya',  date: '11 Agu 2026',      note: 'Makan siang meeting klien 4 orang',          status: 'menunggu', avatar: 'BS', color: '#7c3aed', jumlah: 320000, kategori: 'Makan', hasAttachment: true },
  { id: 12, employee: 'Rina Setiawati',   dept: 'Engineering',  type: 'Ganti Biaya',  date: '09 Agu 2026',      note: 'Kabel LAN + HDD eksternal untuk lab',        status: 'disetujui', avatar: 'RS', color: '#2563eb', jumlah: 450000, kategori: 'Peralatan', hasAttachment: true },
  { id: 13, employee: 'Sinta Dewi',       dept: 'HR',           type: 'Sakit',        date: '08 Agu 2026',      note: 'Demam & flu, belum bisa hadir ke kantor',    status: 'disetujui', avatar: 'SD', color: '#f59e0b', hasAttachment: false },
  { id: 14, employee: 'Fajar Nugroho',    dept: 'HR',           type: 'Izin Keluar',  date: '07 Agu 2026',      note: 'Urusan kedinasan di dinas tenaga kerja',     status: 'disetujui', avatar: 'FN', color: '#8b5cf6', jamMulai: '09:00', jamSelesai: '11:00' },
]

// ─── Micro components ─────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg: Record<RequestStatus, { label: string; bg: string; color: string; border: string }> = {
    menunggu: { label: 'Menunggu', bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)' },
    disetujui: { label: 'Disetujui', bg: 'rgba(16,185,129,0.12)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
    ditolak: { label: 'Ditolak', bg: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
  }
  const c = cfg[status]
  return (
    <span className="mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 500 }}>{c.label}</span>
  )
}

function EffekBadge({ type }: { type: RequestType }) {
  const e = EFFECT_CONFIG[type]
  return (
    <span className="mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: e.efekBg, color: e.efekColor, border: `1px solid ${e.efekColor}33`, fontWeight: 600, letterSpacing: '0.02em' }}>
      {e.icon} {e.efek}
    </span>
  )
}

function TypeBadge({ type }: { type: RequestType }) {
  const c = TYPE_COLORS[type]
  return (
    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 6, background: `${c}15`, color: c, border: `1px solid ${c}30`, fontFamily: 'Outfit', fontWeight: 700 }}>{type}</span>
  )
}

const ALL_TYPES: RequestType[] = ['Tidak Masuk', 'Sakit', 'Terlambat', 'Pulang Cepat', 'Izin Keluar', 'Lembur', 'Ganti Biaya']

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PermohonanPage() {
  const [statusFilter, setStatusFilter] = useState('semua')
  const [typeFilter, setTypeFilter] = useState<'semua' | RequestType>('semua')
  const [search, setSearch] = useState('')
  const [data, setData] = useState(allRequests)

  const approve = (id: number) => setData(d => d.map(r => r.id === id ? { ...r, status: 'disetujui' as RequestStatus } : r))
  const reject  = (id: number) => setData(d => d.map(r => r.id === id ? { ...r, status: 'ditolak'  as RequestStatus } : r))

  const filtered = data.filter(r => {
    const matchStatus = statusFilter === 'semua' || r.status === statusFilter
    const matchType   = typeFilter   === 'semua' || r.type === typeFilter
    const matchSearch = r.employee.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchType && matchSearch
  })

  const pending = data.filter(r => r.status === 'menunggu').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total', value: data.length, color: '#2563eb' },
          { label: 'Menunggu', value: data.filter(r => r.status === 'menunggu').length, color: '#f59e0b' },
          { label: 'Disetujui', value: data.filter(r => r.status === 'disetujui').length, color: '#10b981' },
          { label: 'Ditolak', value: data.filter(r => r.status === 'ditolak').length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Efek ke absensi legend */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 10, letterSpacing: '0.05em', fontWeight: 600 }}>EFEK KE ABSENSI PER JENIS PERMOHONAN</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ALL_TYPES.map(t => {
            const e = EFFECT_CONFIG[t]
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{e.icon}</span>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: TYPE_COLORS[t] }}>{t}</span>
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>→</span>
                <span className="mono" style={{ fontSize: 10, color: e.efekColor, fontWeight: 600 }}>{e.efek}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Search + Status filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'var(--muted)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / departemen..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['semua', 'menunggu', 'disetujui', 'ditolak'] as const).map(o => (
            <button key={o} onClick={() => setStatusFilter(o)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: statusFilter === o ? 'var(--primary)' : 'transparent', color: statusFilter === o ? '#fff' : 'var(--muted-foreground)', transition: 'all 0.15s', textTransform: 'capitalize' }}>{o}</button>
          ))}
        </div>
        {pending > 0 && (
          <span className="mono" style={{ fontSize: 11, padding: '4px 12px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)', whiteSpace: 'nowrap' }}>{pending} pending</span>
        )}
      </div>

      {/* Type filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setTypeFilter('semua')} style={{ padding: '5px 14px', borderRadius: 99, border: `1.5px solid ${typeFilter === 'semua' ? 'var(--primary)' : 'var(--border)'}`, fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: typeFilter === 'semua' ? 'var(--primary)' : 'transparent', color: typeFilter === 'semua' ? '#fff' : 'var(--muted-foreground)', transition: 'all 0.15s' }}>
          Semua Jenis
        </button>
        {ALL_TYPES.map(t => {
          const active = typeFilter === t
          const c = TYPE_COLORS[t]
          const e = EFFECT_CONFIG[t]
          return (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '5px 14px', borderRadius: 99, border: `1.5px solid ${active ? c : 'var(--border)'}`, fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: active ? `${c}18` : 'transparent', color: active ? c : 'var(--muted-foreground)', transition: 'all 0.15s' }}>
              {e.icon} {t}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)' }}>
        {filtered.length} permohonan ditampilkan
      </div>

      {/* Request cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(req => {
          const eff = EFFECT_CONFIG[req.type]
          const isLembur = req.type === 'Lembur'
          const isReimburse = req.type === 'Ganti Biaya'
          const isSakit = req.type === 'Sakit'
          const hasTime = req.jamMulai && req.jamSelesai

          return (
            <div key={req.id} className="card" style={{ padding: '16px 20px', borderLeft: `3px solid ${TYPE_COLORS[req.type]}` }}>
              <div className="request-card">
                <Avatar initials={req.avatar} color={req.color} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>{req.employee}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{req.dept}</span>
                    <TypeBadge type={req.type} />
                    <EffekBadge type={req.type} />
                    {isSakit && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: req.hasAttachment ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: req.hasAttachment ? '#059669' : '#dc2626', border: `1px solid ${req.hasAttachment ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                        {req.hasAttachment ? '📎 Bukti Ada' : '⚠ Bukti Diperlukan'}
                      </span>
                    )}
                    {!isSakit && req.hasAttachment && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'JetBrains Mono' }}>📎 Lampiran</span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>📅 {req.date}</span>
                    {hasTime && (
                      <span className="mono" style={{ fontSize: 11 }}>🕐 {req.jamMulai} – {req.jamSelesai}</span>
                    )}
                    {isReimburse && req.jumlah && (
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>💰 Rp {req.jumlah.toLocaleString('id')} · {req.kategori}</span>
                    )}
                    {isLembur && req.jamMulai && req.jamSelesai && (() => {
                      const [sh, sm] = req.jamMulai.split(':').map(Number)
                      const [eh, em] = req.jamSelesai.split(':').map(Number)
                      const mins = (eh * 60 + em) - (sh * 60 + sm)
                      const jam = Math.floor(mins / 60)
                      const mnt = mins % 60
                      return <span className="mono" style={{ fontSize: 11, color: '#2563eb', fontWeight: 700 }}>⏱ {jam}{mnt > 0 ? `,${mnt}` : ''} jam lembur</span>
                    })()}
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--foreground)', fontStyle: 'italic', opacity: 0.8 }}>"{req.note}"</div>
                </div>

                <div className="request-card-actions">
                  <StatusBadge status={req.status} />
                  {req.status === 'menunggu' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => approve(req.id)}>✓ Setujui</button>
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px', color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => reject(req.id)}>✕ Tolak</button>
                    </div>
                  )}
                  {req.status === 'disetujui' && (
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', textAlign: 'right' }}>
                      Absensi: <span style={{ color: eff.efekColor, fontWeight: 700 }}>{eff.efek}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Tidak ada permohonan</div>
            <div style={{ fontSize: 13 }}>Coba ubah filter atau pencarian</div>
          </div>
        )}
      </div>
    </div>
  )
}
