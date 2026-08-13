'use client'

import { useState, type CSSProperties } from 'react'
import type { AuthUser } from './LoginPage'

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeNav = 'home' | 'absensi' | 'permohonan' | 'riwayat' | 'profil' | 'pengumuman'

const NAV: { id: EmployeeNav; label: string; icon: string }[] = [
  { id: 'home', label: 'Beranda', icon: '⊞' },
  { id: 'absensi', label: 'Absensi', icon: '✓' },
  { id: 'permohonan', label: 'Permohonan', icon: '📋' },
  { id: 'riwayat', label: 'Riwayat', icon: '📅' },
  { id: 'pengumuman', label: 'Pengumuman', icon: '📢' },
  { id: 'profil', label: 'Profil Saya', icon: '⊙' },
]

// ─── Seed data ────────────────────────────────────────────────────────────────

const riwayatData = [
  { date: '12 Agu', checkIn: '08:02', checkOut: '17:05', status: 'hadir', dur: '9j 03m', loc: 'Kantor Pusat' },
  { date: '11 Agu', checkIn: '08:11', checkOut: '17:10', status: 'hadir', dur: '9j 01m', loc: 'Kantor Pusat' },
  { date: '10 Agu', checkIn: '09:14', checkOut: '17:00', status: 'telat', dur: '7j 46m', loc: 'Kantor Pusat' },
  { date: '09 Agu', checkIn: '—', checkOut: '—', status: 'izin', dur: '—', loc: '—' },
  { date: '08 Agu', checkIn: '07:58', checkOut: '16:55', status: 'hadir', dur: '8j 57m', loc: 'Kantor Pusat' },
  { date: '07 Agu', checkIn: '08:04', checkOut: '17:08', status: 'hadir', dur: '9j 04m', loc: 'Kantor Pusat' },
  { date: '06 Agu', checkIn: '08:00', checkOut: '17:02', status: 'hadir', dur: '9j 02m', loc: 'Kantor Pusat' },
  { date: '05 Agu', checkIn: '08:22', checkOut: '17:00', status: 'telat', dur: '8j 38m', loc: 'Kantor Pusat' },
  { date: '04 Agu', checkIn: '07:55', checkOut: '17:12', status: 'hadir', dur: '9j 17m', loc: 'Kantor Pusat' },
  { date: '03 Agu', checkIn: '—', checkOut: '—', status: 'izin', dur: '—', loc: '—' },
  { date: '02 Agu', checkIn: '08:01', checkOut: '16:58', status: 'hadir', dur: '8j 57m', loc: 'Kantor Pusat' },
  { date: '01 Agu', checkIn: '08:09', checkOut: '17:06', status: 'hadir', dur: '8j 57m', loc: 'Kantor Pusat' },
  { date: '31 Jul', checkIn: '08:03', checkOut: '17:01', status: 'hadir', dur: '8j 58m', loc: 'Kantor Pusat' },
  { date: '30 Jul', checkIn: '09:05', checkOut: '17:00', status: 'telat', dur: '7j 55m', loc: 'Kantor Pusat' },
  { date: '29 Jul', checkIn: '08:00', checkOut: '17:04', status: 'hadir', dur: '9j 04m', loc: 'Kantor Pusat' },
  { date: '28 Jul', checkIn: '—', checkOut: '—', status: 'alfa', dur: '—', loc: '—' },
  { date: '27 Jul', checkIn: '07:59', checkOut: '17:03', status: 'hadir', dur: '9j 04m', loc: 'Kantor Pusat' },
  { date: '26 Jul', checkIn: '08:06', checkOut: '17:00', status: 'hadir', dur: '8j 54m', loc: 'Kantor Pusat' },
]

const announcements = [
  {
    id: 1,
    title: 'Perubahan Jam Kerja Bulan Agustus',
    category: 'HR & Kebijakan',
    color: '#ef4444',
    date: '12 Agustus 2026',
    publishedAt: '12 Agustus 2026 · 09:30',
    month: 'Agustus',
    excerpt: 'Terdapat perubahan jam kerja yang berlaku mulai Senin, 18 Agustus 2026...',
    body: 'Halo seluruh karyawan,\n\nSehubungan dengan penyesuaian operasional, jam kerja kantor berubah menjadi 08:30–17:30 mulai Senin, 18 Agustus 2026.\n\nHarap menyesuaikan jadwal absensi dan shift masing-masing. Terima kasih atas perhatiannya.',
    author: 'HR Department',
    priority: 'penting' as const,
    pinned: true,
    requireAck: true,
    attachments: ['Kebijakan-Jam-Kerja.pdf', 'Jadwal-Agustus.pdf'],
    read: false,
    acknowledged: false,
  },
  {
    id: 2,
    title: 'Informasi Payroll Agustus',
    category: 'Payroll',
    color: '#2563eb',
    date: '10 Agustus 2026',
    publishedAt: '10 Agustus 2026 · 14:00',
    month: 'Agustus',
    excerpt: 'Informasi jadwal payroll bulan Agustus...',
    body: 'Informasi jadwal payroll bulan Agustus akan diproses pada tanggal 25. Slip gaji tersedia di portal paling lambat tanggal 28.',
    author: 'HR Department',
    priority: 'normal' as const,
    pinned: false,
    requireAck: false,
    attachments: [] as string[],
    read: false,
    acknowledged: false,
  },
  {
    id: 3,
    title: 'Jadwal Evaluasi Kinerja Q3',
    category: 'HR',
    color: '#2563eb',
    date: '08 Agustus 2026',
    publishedAt: '08 Agustus 2026 · 10:00',
    month: 'Agustus',
    excerpt: 'Evaluasi kinerja Q3 akan dilaksanakan 20–24 Agustus 2026...',
    body: 'Evaluasi kinerja Q3 akan dilaksanakan 20–24 Agustus 2026. HR akan menghubungi jadwal masing-masing.',
    author: 'HR Department',
    priority: 'penting' as const,
    pinned: false,
    requireAck: true,
    attachments: ['Form-Evaluasi-Q3.pdf'],
    read: false,
    acknowledged: false,
  },
  {
    id: 4,
    title: 'Libur Kemerdekaan 17 Agustus 2026',
    category: 'Umum',
    color: '#10b981',
    date: '05 Agustus 2026',
    publishedAt: '05 Agustus 2026 · 09:00',
    month: 'Agustus',
    excerpt: 'Seluruh karyawan diliburkan pada 17-18 Agustus 2026...',
    body: 'Seluruh karyawan diliburkan pada 17-18 Agustus 2026 dalam rangka Hari Kemerdekaan RI ke-81.',
    author: 'HR Department',
    priority: 'normal' as const,
    pinned: false,
    requireAck: false,
    attachments: [] as string[],
    read: true,
    acknowledged: false,
  },
  {
    id: 5,
    title: 'Peningkatan Sistem Absensi',
    category: 'IT',
    color: '#7c3aed',
    date: '02 Juli 2026',
    publishedAt: '02 Juli 2026 · 11:00',
    month: 'Juli',
    excerpt: 'Sistem absensi GPS diperbarui...',
    body: 'Sistem absensi GPS diperbarui. Pastikan akurasi GPS minimal 50m sebelum check-in.',
    author: 'IT Department',
    priority: 'normal' as const,
    pinned: false,
    requireAck: false,
    attachments: [] as string[],
    read: true,
    acknowledged: false,
  },
]

const myRequests = [
  { id: 1, no: 'PRM-2026-00120', type: 'Izin Sakit', icon: '🏥', dateLabel: '09 Agustus 2026 · 1 Hari', note: 'Surat dokter terlampir ✓', submitted: 'Diajukan 08 Agu 2026', month: 'AGUSTUS 2026', status: 'disetujui' as const, hasAttachment: true },
  { id: 2, no: 'PRM-2026-00124', type: 'WFH', icon: '🏠', dateLabel: '14 Agustus 2026 · 1 Hari', note: 'Keperluan pribadi', submitted: 'Diajukan 12 Agu 2026', month: 'AGUSTUS 2026', status: 'menunggu' as const, hasAttachment: false },
  { id: 3, no: 'PRM-2026-00118', type: 'Cuti Tahunan', icon: '🌴', dateLabel: '20–21 Agu 2026 · 2 Hari', note: 'Acara keluarga', submitted: 'Diajukan 15 Agu 2026', month: 'AGUSTUS 2026', status: 'menunggu' as const, hasAttachment: false },
  { id: 4, no: 'PRM-2026-00098', type: 'Cuti Tahunan', icon: '🌴', dateLabel: '20–22 Juli 2026 · 3 Hari', note: 'Keperluan pribadi', submitted: 'Diajukan 18 Jul 2026', month: 'JULI 2026', status: 'disetujui' as const, hasAttachment: false },
  { id: 5, no: 'PRM-2026-00091', type: 'Izin', icon: '📋', dateLabel: '10 Juli 2026 · 1 Hari', note: 'Urusan administrasi', submitted: 'Diajukan 09 Jul 2026', month: 'JULI 2026', status: 'ditolak' as const, hasAttachment: false },
  { id: 6, no: 'PRM-2026-00085', type: 'Dinas', icon: '🧳', dateLabel: '05–06 Juli 2026 · 2 Hari', note: 'Kunjungan klien Bandung', submitted: 'Diajukan 01 Jul 2026', month: 'JULI 2026', status: 'disetujui' as const, hasAttachment: true },
]

type EmpRequestType = 'Cuti' | 'Izin Sakit' | 'WFH' | 'Izin' | 'Dinas'

const REQUEST_TYPES: { id: EmpRequestType; icon: string; title: string; desc: string; needsDoc?: boolean }[] = [
  { id: 'Cuti', icon: '🌴', title: 'Cuti', desc: 'Pengajuan cuti karyawan' },
  { id: 'Izin Sakit', icon: '🏥', title: 'Izin Sakit', desc: 'Sertakan bukti jika diperlukan', needsDoc: true },
  { id: 'WFH', icon: '🏠', title: 'WFH', desc: 'Bekerja dari rumah' },
  { id: 'Izin', icon: '📋', title: 'Izin', desc: 'Tidak masuk kerja' },
  { id: 'Dinas', icon: '🧳', title: 'Dinas', desc: 'Perjalanan dinas' },
]

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; bg: string; color: string; dot?: string }> = {
    hadir: { label: 'Hadir', bg: 'rgba(16,185,129,0.12)', color: '#059669', dot: '#10b981' },
    telat: { label: 'Telat', bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b' },
    izin: { label: 'Izin', bg: 'rgba(59,130,246,0.12)', color: '#2563eb', dot: '#3b82f6' },
    alfa: { label: 'Alfa', bg: 'rgba(239,68,68,0.1)', color: '#dc2626', dot: '#ef4444' },
    disetujui: { label: 'Disetujui', bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    menunggu: { label: 'Menunggu', bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
    ditolak: { label: 'Ditolak', bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  }
  const c = cfg[status] ?? { label: status, bg: 'var(--muted)', color: 'var(--muted-foreground)' }
  return (
    <span className="mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: c.bg, color: c.color, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {c.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block', flexShrink: 0 }} />}
      {c.label}
    </span>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ user }: { user: AuthUser }) {
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)
  const [checkInTime, setCheckInTime] = useState('')
  const now = new Date()
  const timeStr = now.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })

  const handleCheckIn = () => {
    setCheckedIn(true)
    setCheckInTime(timeStr)
  }

  const isLate = parseInt(timeStr.replace(':', '')) > 800

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div className="card" style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', border: 'none', color: '#fff' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22 }}>Selamat pagi, {user.name.split(' ')[0]}! 👋</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4, fontFamily: 'Inter' }}>Selasa, 12 Agustus 2026 · {timeStr} WIB</div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {!checkedIn ? (
            <button onClick={handleCheckIn} style={{ padding: '10px 22px', borderRadius: 10, background: '#fff', color: '#2563eb', fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>📍 Check In</button>
          ) : !checkedOut ? (
            <>
              <div style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>✓ Masuk {checkInTime} {isLate ? '· Telat' : '· Tepat Waktu'}</div>
              <button onClick={() => setCheckedOut(true)} style={{ padding: '10px 22px', borderRadius: 10, background: '#fff', color: '#dc2626', fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>🏃 Check Out</button>
            </>
          ) : (
            <div style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>✓ Sudah absen hari ini</div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { label: 'Hadir Bulan Ini', value: '18', unit: 'hari', color: '#10b981' },
          { label: 'Sisa Cuti', value: '12', unit: 'hari', color: '#2563eb' },
          { label: 'Lembur Bulan Ini', value: '4.5', unit: 'jam', color: '#7c3aed' },
          { label: 'Permohonan Pending', value: '2', unit: 'menunggu', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 4, fontFamily: 'Outfit' }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity + announcements */}
      <div className="grid-2" style={{ '--gap': '18px' } as CSSProperties}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Absensi Terakhir</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {riwayatData.slice(0, 4).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)', width: 48, flexShrink: 0 }}>{r.date}</span>
                <span className="mono" style={{ fontSize: 12, flex: 1 }}>{r.checkIn} – {r.checkOut}</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Pengumuman Terbaru</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {announcements.filter(a => !a.read || a.priority === 'penting').slice(0, 3).map(a => (
              <div key={a.id} style={{ padding: '10px 12px', borderRadius: 10, background: `${a.color}08`, border: `1px solid ${a.color}20` }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)', marginBottom: 2 }}>
                  {!a.read && '● '}{a.priority === 'penting' && '🔴 '}{a.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{a.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Absensi Page ─────────────────────────────────────────────────────────────

function AbsensiEmpPage() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const now = new Date()
  const timeStr = now.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* GPS Map placeholder */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 200, background: 'linear-gradient(135deg, #e8edf8 0%, #dde5f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--muted-foreground)' }}>
          <div style={{ fontSize: 40 }}>🗺</div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14 }}>Kantor Pusat · Jl. Sudirman No. 1</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.25)' }} />
            Dalam radius geofence (12m dari kantor)
          </div>
        </div>
      </div>

      {/* Check in/out */}
      <div className="grid-2" style={{ '--gap': '16px' } as CSSProperties}>
        <div className="card" style={{ padding: '22px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.05em', marginBottom: 10 }}>CHECK IN</div>
          {checkedIn ? (
            <>
              <div style={{ fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: '#10b981' }}>{checkInTime}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Tepat waktu · Kantor Pusat</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--foreground)' }}>{timeStr}</div>
              <button onClick={() => { setCheckedIn(true); setCheckInTime(timeStr) }} className="btn-primary" style={{ marginTop: 14, width: '100%' }}>📍 Check In Sekarang</button>
            </>
          )}
        </div>

        <div className="card" style={{ padding: '22px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.05em', marginBottom: 10 }}>CHECK OUT</div>
          {checkedOut ? (
            <>
              <div style={{ fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: '#7c3aed' }}>{checkOutTime}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Selesai bekerja</div>
            </>
          ) : checkedIn ? (
            <>
              <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--foreground)' }}>{timeStr}</div>
              <button onClick={() => { setCheckedOut(true); setCheckOutTime(timeStr) }} className="btn-ghost" style={{ marginTop: 14, width: '100%', color: '#7c3aed', borderColor: 'rgba(124,58,237,0.3)' }}>🏃 Check Out Sekarang</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--muted-foreground)' }}>—</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 14 }}>Belum check in</div>
            </>
          )}
        </div>
      </div>

      {/* Status hari ini */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Status Absensi Hari Ini</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
          {[
            { label: 'Shift', value: 'Reguler 08:00–17:00' },
            { label: 'Toleransi', value: '15 menit' },
            { label: 'Status GPS', value: 'Dalam radius' },
            { label: 'WFH', value: checkedIn ? 'Tidak' : '—' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginBottom: 3, letterSpacing: '0.04em' }}>{item.label.toUpperCase()}</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, color: 'var(--foreground)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Permohonan Page ──────────────────────────────────────────────────────────

function PermohonanEmpPage({ user }: { user: AuthUser }) {
  type Flow = 'list' | 'pick' | 'form' | 'review' | 'detail'
  const [flow, setFlow] = useState<Flow>('list')
  const [requests, setRequests] = useState(myRequests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu' | 'disetujui' | 'ditolak'>('semua')
  const [typeFilter, setTypeFilter] = useState('Semua Jenis')
  const [monthFilter, setMonthFilter] = useState('Semua Bulan')
  const [selectedType, setSelectedType] = useState<EmpRequestType | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [formDate, setFormDate] = useState('2026-08-12')
  const [formDuration, setFormDuration] = useState('1')
  const [formNote, setFormNote] = useState('')
  const [formFile, setFormFile] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const counts = {
    semua: requests.length,
    menunggu: requests.filter(r => r.status === 'menunggu').length,
    disetujui: requests.filter(r => r.status === 'disetujui').length,
    ditolak: requests.filter(r => r.status === 'ditolak').length,
  }

  const filtered = requests.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.type.toLowerCase().includes(q) || r.note.toLowerCase().includes(q) || r.no.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'semua' || r.status === statusFilter
    const matchType = typeFilter === 'Semua Jenis'
      || (typeFilter === 'Cuti' && r.type.includes('Cuti'))
      || r.type === typeFilter
    const matchMonth2 = monthFilter === 'Semua Bulan'
      || (monthFilter.startsWith('Agustus') && r.month.includes('AGUSTUS'))
      || (monthFilter.startsWith('Juli') && r.month.includes('JULI'))
    return matchSearch && matchStatus && matchType && matchMonth2
  })

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, r) => {
    ;(acc[r.month] ??= []).push(r)
    return acc
  }, {})

  const typeMeta = REQUEST_TYPES.find(t => t.id === selectedType)
  const needsDoc = typeMeta?.needsDoc

  const openPick = () => { setFlow('pick'); setSelectedType(null); setFormNote(''); setFormFile(null); setFormDuration('1') }
  const pickType = (t: EmpRequestType) => { setSelectedType(t); setFlow('form') }
  const goReview = () => {
    if (!formNote.trim()) { setToast('Isi keterangan terlebih dahulu.'); setTimeout(() => setToast(null), 2000); return }
    if (needsDoc && !formFile) { setToast('Upload dokumen pendukung wajib untuk jenis ini.'); setTimeout(() => setToast(null), 2200); return }
    setFlow('review')
  }
  const submit = (asDraft = false) => {
    if (!selectedType || !typeMeta) return
    const no = `PRM-2026-${String(130 + requests.length).padStart(5, '0')}`
    setRequests(r => [{
      id: Date.now(),
      no,
      type: selectedType === 'Cuti' ? 'Cuti Tahunan' : selectedType,
      icon: typeMeta.icon,
      dateLabel: `${new Date(formDate + 'T00:00:00').toLocaleDateString('id', { day: '2-digit', month: 'long', year: 'numeric' })} · ${formDuration} Hari`,
      note: formNote || (asDraft ? 'Draft' : '—'),
      submitted: asDraft ? 'Disimpan sebagai draft' : 'Diajukan hari ini',
      month: 'AGUSTUS 2026',
      status: 'menunggu' as const,
      hasAttachment: !!formFile,
    }, ...r])
    setFlow('list')
    setToast(asDraft ? 'Draft tersimpan.' : 'Permohonan berhasil dikirim.')
    setTimeout(() => setToast(null), 2200)
  }

  const selectStyle: CSSProperties = {
    padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)',
    background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'Outfit',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none',
  }

  const detail = requests.find(r => r.id === detailId)

  return (
    <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
      {toast && (
        <div className="toast" style={{ bottom: 24, right: 24 }}>{toast}</div>
      )}

      {/* ── Type pick / Form / Review modal ── */}
      {(flow === 'pick' || flow === 'form' || flow === 'review') && (
        <div onClick={() => setFlow('list')} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: flow === 'review' ? 560 : 520, maxHeight: '92vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            {flow === 'pick' && (
              <>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17 }}>Ajukan Permohonan</div>
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Pilih jenis permohonan yang ingin Anda ajukan</div>
                  </div>
                  <button onClick={() => setFlow('list')} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {REQUEST_TYPES.map(t => (
                    <button key={t.id} onClick={() => pickType(t.id)} className="card" style={{ padding: '16px 14px', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--card)' }}>
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.4 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {flow === 'form' && selectedType && typeMeta && (
              <>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setFlow('pick')} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 13 }}>←</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>{typeMeta.icon} {typeMeta.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Langkah 1 dari 2 · Detail Permohonan</div>
                  </div>
                  <button onClick={() => setFlow('list')} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                      {selectedType === 'Izin Sakit' ? 'Tanggal Sakit' : selectedType === 'Dinas' ? 'Tanggal Dinas' : 'Tanggal'}
                    </label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Durasi (hari)</label>
                    <input type="number" min={1} max={30} value={formDuration} onChange={e => setFormDuration(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  {(selectedType === 'Cuti' || selectedType === 'WFH') && (
                    <div>
                      <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Sisa kuota</label>
                      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>
                        {selectedType === 'Cuti' ? '12 hari cuti tersisa' : 'WFH tersedia bulan ini'}
                      </div>
                    </div>
                  )}
                  {selectedType === 'Dinas' && (
                    <div>
                      <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Lokasi dinas</label>
                      <input placeholder="cth: Bandung / Surabaya" style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Keterangan</label>
                    <textarea rows={4} value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="Jelaskan alasan permohonan..." style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)' }}>Dokumen Pendukung</label>
                      {needsDoc && <span style={{ fontSize: 11, color: '#dc2626', fontFamily: 'Outfit', fontWeight: 600 }}>* Wajib</span>}
                    </div>
                    <label style={{ display: 'block', padding: '28px 16px', borderRadius: 12, border: '1.5px dashed var(--border)', background: 'var(--muted)', textAlign: 'center', cursor: 'pointer' }}>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => setFormFile(e.target.files?.[0]?.name ?? 'Surat_Dokter.pdf')} />
                      <div style={{ fontSize: 22, marginBottom: 6 }}>📎</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
                        {formFile ? formFile : 'Upload surat dokter / bukti'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>JPG, PNG, PDF · Maks. 5 MB</div>
                    </label>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                    <button className="btn-ghost" onClick={() => setFlow('list')}>Batal</button>
                    <button className="btn-primary" onClick={goReview}>Lanjutkan →</button>
                  </div>
                </div>
              </>
            )}

            {flow === 'review' && selectedType && typeMeta && (
              <>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => setFlow('form')} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 13 }}>←</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>Review Permohonan</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Langkah 2 dari 2 · Pastikan data sudah benar</div>
                  </div>
                  <button onClick={() => setFlow('list')} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '22px 20px', background: 'var(--muted)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 18 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>H</div>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, letterSpacing: '0.04em' }}>PERMOHONAN {selectedType.toUpperCase()}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>No. PRM-2026-00128</div>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 8 }}>DATA KARYAWAN</div>
                    {[
                      ['Nama', user.name],
                      ['NIK', 'EMP00123'],
                      ['Departemen', 'Engineering'],
                      ['Jabatan', 'Software Engineer'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 12, fontSize: 13, marginBottom: 6 }}>
                        <span style={{ width: 100, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{k}</span>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 8 }}>DETAIL PERMOHONAN</div>
                    {[
                      ['Tanggal', new Date(formDate + 'T00:00:00').toLocaleDateString('id', { day: 'numeric', month: 'long', year: 'numeric' })],
                      ['Durasi', `${formDuration} Hari`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', gap: 12, fontSize: 13, marginBottom: 6 }}>
                        <span style={{ width: 100, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{k}</span>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', marginBottom: 4 }}>Keterangan</div>
                      <div style={{ fontSize: 13, lineHeight: 1.55, fontFamily: 'Inter' }}>{formNote}</div>
                    </div>
                    {formFile && (
                      <>
                        <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
                        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: 8 }}>DOKUMEN PENDUKUNG</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                          <span>📎 {formFile}</span>
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#059669', fontFamily: 'Outfit', fontWeight: 600 }}>✓ Terlampir</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                    <button className="btn-ghost" onClick={() => setFlow('form')}>← Edit</button>
                    <div style={{ flex: 1 }} />
                    <button className="btn-ghost" onClick={() => submit(true)}>Simpan Draft</button>
                    <button className="btn-primary" onClick={() => submit(false)}>✓ Kirim Pengajuan</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Detail modal */}
      {flow === 'detail' && detail && (
        <div onClick={() => { setFlow('list'); setDetailId(null) }} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440, padding: '22px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>{detail.icon} {detail.type}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>{detail.no}</div>
              </div>
              <button onClick={() => { setFlow('list'); setDetailId(null) }} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <StatusBadge status={detail.status} />
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--muted-foreground)' }}>{detail.dateLabel}</div>
            <div style={{ marginTop: 8, fontSize: 14, fontFamily: 'Outfit' }}>{detail.note}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted-foreground)' }}>{detail.submitted}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>Permohonan Saya</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Kelola pengajuan cuti, izin, dan permohonan lainnya</div>
        </div>
        <button className="btn-primary" onClick={openPick}>+ Ajukan Permohonan</button>
      </div>

      {/* Summary */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        {([
          { key: 'semua' as const, label: 'Semua', value: counts.semua, color: '#2563eb' },
          { key: 'menunggu' as const, label: 'Menunggu', value: counts.menunggu, color: '#f59e0b' },
          { key: 'disetujui' as const, label: 'Disetujui', value: counts.disetujui, color: '#10b981' },
          { key: 'ditolak' as const, label: 'Ditolak', value: counts.ditolak, color: '#ef4444' },
        ]).map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)} style={{
            textAlign: 'left', padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
            background: statusFilter === s.key ? `${s.color}12` : 'var(--muted)',
            border: `1.5px solid ${statusFilter === s.key ? s.color : 'transparent'}`,
          }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>permohonan</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180 }}>
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari permohonan..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} style={selectStyle}>
            <option value="semua">Semua Status</option>
            <option value="menunggu">Menunggu</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
            {['Semua Jenis', 'Cuti', 'Izin Sakit', 'WFH', 'Izin', 'Dinas'].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={selectStyle}>
            {['Semua Bulan', 'Agustus 2026', 'Juli 2026'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* History */}
      <div style={{ padding: '18px 24px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Riwayat Permohonan</div>
        {Object.keys(grouped).length === 0 && (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada permohonan.</div>
        )}
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>{month}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(req => (
                <div key={req.id} className="card" style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => { setDetailId(req.id); setFlow('detail') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{req.icon}</span>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>{req.type}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 4 }}>{req.dateLabel}</div>
                  <div style={{ fontSize: 13, color: 'var(--foreground)', marginBottom: 12 }}>{req.note}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{req.submitted}</span>
                    <span style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600 }}>Lihat Detail →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Riwayat Page ─────────────────────────────────────────────────────────────

function RiwayatEmpPage() {
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('Agustus 2026')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<typeof riwayatData[0] | null>(null)
  const perPage = 6

  const monthKey = month.startsWith('Agustus') ? 'Agu' : 'Jul'
  const monthFiltered = riwayatData.filter(r => r.date.includes(monthKey))
  const filtered = monthFiltered.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.date.toLowerCase().includes(q) || r.status.includes(q) || r.checkIn.includes(q)
    const matchStatus = statusFilter === 'semua' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const summary = month.startsWith('Agustus')
    ? { hadir: 18, telat: 3, izin: 2, alfa: 0 }
    : {
        hadir: monthFiltered.filter(r => r.status === 'hadir').length,
        telat: monthFiltered.filter(r => r.status === 'telat').length,
        izin: monthFiltered.filter(r => r.status === 'izin').length,
        alfa: monthFiltered.filter(r => r.status === 'alfa').length,
      }

  const selectStyle: CSSProperties = {
    padding: '10px 14px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--foreground)',
    fontFamily: 'Outfit',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, padding: '22px 24px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>Detail Absensi</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{detail.date} 2026</div>
              </div>
              <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', color: 'var(--muted-foreground)' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Check In', value: detail.checkIn },
                { label: 'Check Out', value: detail.checkOut },
                { label: 'Durasi', value: detail.dur },
                { label: 'Lokasi', value: detail.loc },
              ].map(f => (
                <div key={f.label} style={{ background: 'var(--muted)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <StatusBadge status={detail.status} />
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>Riwayat Absensi</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Lihat riwayat kehadiran dan aktivitas absensimu</div>
        </div>
        <span className="mono" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, background: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 600, whiteSpace: 'nowrap' }}>{month}</span>
      </div>

      {/* Search + filters */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari tanggal / status..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }}
          />
        </div>
        <select value={month} onChange={e => { setMonth(e.target.value); setPage(1) }} style={selectStyle}>
          <option>Agustus 2026</option>
          <option>Juli 2026</option>
        </select>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowFilter(s => !s)} style={{ ...selectStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚙ Filter {statusFilter !== 'semua' ? '· ' + statusFilter : ''} ▾
          </button>
          {showFilter && (
            <div className="card" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20, padding: 8, minWidth: 160, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}>
              {['semua', 'hadir', 'telat', 'izin', 'alfa'].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setShowFilter(false); setPage(1) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', background: statusFilter === s ? 'var(--muted)' : 'transparent', color: statusFilter === s ? 'var(--primary)' : 'var(--foreground)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {s === 'semua' ? 'Semua Status' : s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan */}
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Ringkasan {month.split(' ')[0]}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          {[
            { label: 'Hadir', value: summary.hadir, color: '#10b981' },
            { label: 'Telat', value: summary.telat, color: '#f59e0b' },
            { label: 'Izin', value: summary.izin, color: '#3b82f6' },
            { label: 'Alfa', value: summary.alfa, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Tanggal', 'Check In', 'Check Out', 'Durasi', 'Status', ''].map(h => (
                <th key={h || 'go'} style={{ textAlign: 'left', padding: '12px 20px', fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => (
              <tr
                key={`${r.date}-${i}`}
                onClick={() => setDetail(r)}
                style={{ borderBottom: i < paged.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{r.date}</span></td>
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13, color: r.status === 'telat' ? '#f59e0b' : 'var(--foreground)' }}>{r.checkIn}</span></td>
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13 }}>{r.checkOut}</span></td>
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{r.dur}</span></td>
                <td style={{ padding: '14px 20px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '14px 16px', color: 'var(--muted-foreground)', fontSize: 18 }}>›</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada data yang cocok.</div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === 1 ? 'default' : 'pointer', color: 'var(--muted-foreground)', opacity: currentPage === 1 ? 0.4 : 1 }}
        >←</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => setPage(n)}
            style={{ width: 32, height: 32, borderRadius: 8, border: currentPage === n ? 'none' : '1px solid var(--border)', background: currentPage === n ? 'var(--primary)' : 'transparent', color: currentPage === n ? '#fff' : 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >{n}</button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: currentPage === totalPages ? 'default' : 'pointer', color: 'var(--muted-foreground)', opacity: currentPage === totalPages ? 0.4 : 1 }}
        >→</button>
      </div>
    </div>
  )
}

// ─── Pengumuman Page ──────────────────────────────────────────────────────────

function PengumumanEmpPage() {
  type FilterKey = 'unread' | 'penting' | 'semua'
  const [items, setItems] = useState(announcements)
  const [filter, setFilter] = useState<FilterKey>('semua')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua Kategori')
  const [month, setMonth] = useState('Semua Bulan')
  const [detailId, setDetailId] = useState<number | null>(null)

  const counts = {
    unread: items.filter(a => !a.read).length,
    penting: items.filter(a => a.priority === 'penting').length,
    semua: items.length,
  }

  const filtered = items.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
    const matchFilter =
      filter === 'semua' ||
      (filter === 'unread' && !a.read) ||
      (filter === 'penting' && a.priority === 'penting')
    const matchCat = category === 'Semua Kategori' || a.category.includes(category) || a.category === category
    const matchMonth = month === 'Semua Bulan' || a.month === month.replace(' 2026', '')
    return matchSearch && matchFilter && matchCat && matchMonth
  }).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.priority !== b.priority) return a.priority === 'penting' ? -1 : 1
    return 0
  })

  const detail = items.find(a => a.id === detailId)

  const markRead = (id: number) => {
    setItems(list => list.map(a => a.id === id ? { ...a, read: true } : a))
  }

  const openDetail = (id: number) => {
    markRead(id)
    setDetailId(id)
  }

  const acknowledge = (id: number) => {
    setItems(list => list.map(a => a.id === id ? { ...a, acknowledged: true, read: true } : a))
  }

  const selectStyle: CSSProperties = {
    padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)',
    background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'Outfit',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', outline: 'none',
  }

  if (detail) {
    return (
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <button className="btn-ghost" style={{ fontSize: 13, marginBottom: 12 }} onClick={() => setDetailId(null)}>← Kembali ke Pengumuman</button>
          {detail.priority === 'penting' && (
            <div style={{ fontSize: 12, fontFamily: 'Outfit', fontWeight: 800, color: '#dc2626', marginBottom: 8 }}>🔴 PENTING</div>
          )}
          {detail.pinned && <div style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600, marginBottom: 6 }}>📌 Dipin</div>}
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>{detail.title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{detail.category}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Dipublikasikan {detail.publishedAt}</div>
        </div>
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{detail.body}</div>

          {detail.attachments.length > 0 && (
            <div>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Lampiran</div>
              {detail.attachments.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--muted)', marginBottom: 8 }}>
                  <span>📄</span>
                  <span style={{ fontSize: 13, fontFamily: 'Outfit', fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>Diterbitkan oleh</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{detail.author}</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
            ✓ Anda telah membaca pengumuman ini
          </div>

          {detail.requireAck && !detail.acknowledged && (
            <div style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: '#d97706', marginBottom: 8 }}>⚠️ Pengumuman ini membutuhkan konfirmasi</div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 14, lineHeight: 1.5 }}>
                Saya telah membaca dan memahami informasi dalam pengumuman ini.
              </div>
              <button className="btn-primary" onClick={() => acknowledge(detail.id)}>✓ Saya Mengerti</button>
            </div>
          )}
          {detail.requireAck && detail.acknowledged && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
              ✓ Anda sudah mengonfirmasi pengumuman ini
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>Pengumuman</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Informasi terbaru dari perusahaan</div>
        </div>
        <button onClick={() => setFilter('semua')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Semua Pengumuman →
        </button>
      </div>

      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        {([
          { key: 'unread' as FilterKey, label: 'Belum Dibaca', value: counts.unread, color: '#f59e0b' },
          { key: 'penting' as FilterKey, label: 'Penting', value: counts.penting, color: '#ef4444' },
          { key: 'semua' as FilterKey, label: 'Semua', value: counts.semua, color: '#2563eb' },
        ]).map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={{
            textAlign: 'left', padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
            background: filter === s.key ? `${s.color}12` : 'var(--muted)',
            border: `1.5px solid ${filter === s.key ? s.color : 'transparent'}`,
          }}>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{s.label}</div>
            <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180 }}>
          <span>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengumuman..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          {['Semua Kategori', 'Kebijakan', 'Payroll', 'HR', 'IT', 'Umum'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)} style={selectStyle}>
          {['Semua Bulan', 'Agustus 2026', 'Juli 2026'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ padding: '18px 24px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Pengumuman Terbaru</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <div key={a.id} className="card" style={{ padding: '16px 18px', cursor: 'pointer', border: !a.read ? '1.5px solid rgba(245,158,11,0.35)' : '1px solid var(--border)' }} onClick={() => openDetail(a.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {a.pinned && <span style={{ fontSize: 11, fontFamily: 'Outfit', fontWeight: 700, color: 'var(--primary)' }}>📌 PIN</span>}
                  {a.priority === 'penting' && <span style={{ fontSize: 11, fontFamily: 'Outfit', fontWeight: 800, color: '#dc2626' }}>🔴 PENTING</span>}
                  {!a.pinned && a.priority === 'normal' && <span style={{ fontSize: 16 }}>📢</span>}
                </div>
                {!a.read ? (
                  <span className="mono" style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: 'rgba(245,158,11,0.12)', color: '#d97706', fontWeight: 600 }}>● BELUM DIBACA</span>
                ) : a.requireAck && !a.acknowledged ? (
                  <span className="mono" style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', color: '#dc2626', fontWeight: 600 }}>Perlu konfirmasi</span>
                ) : null}
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 10 }}>{a.category} · {a.date}</div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: 12 }}>{a.excerpt}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  {a.attachments.length > 0 ? `📎 ${a.attachments.length} Lampiran` : ' '}
                </span>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600 }}>Baca →</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 36, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada pengumuman.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Profil Page ──────────────────────────────────────────────────────────────

function ProfilPage({ user }: { user: AuthUser }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
      <div className="card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 68, height: 68, borderRadius: 18, background: 'rgba(37,99,235,0.12)', border: '2px solid rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: '#2563eb', flexShrink: 0 }}>{user.avatar}</div>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--foreground)' }}>{user.name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 3 }}>{user.email}</div>
          <div style={{ marginTop: 8 }}><span className="mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)' }}>Karyawan Aktif</span></div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Informasi Pribadi</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Nama Lengkap', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Departemen', value: 'Engineering' },
            { label: 'Jabatan', value: 'Senior Frontend Dev' },
            { label: 'Bergabung', value: '14 Mar 2022' },
            { label: 'Perusahaan', value: user.company },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 140, flexShrink: 0, fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500, paddingTop: 2 }}>{f.label}</div>
              <div style={{ fontSize: 14, color: 'var(--foreground)', fontFamily: 'Outfit', fontWeight: 600 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EmployeePortal({ user, onLogout, dark, onToggleDark }: { user: AuthUser; onLogout: () => void; dark: boolean; onToggleDark: () => void }) {
  const [nav, setNav] = useState<EmployeeNav>('home')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const pageTitles: Record<EmployeeNav, string> = {
    home: 'Beranda',
    absensi: 'Absensi',
    permohonan: 'Permohonan',
    riwayat: 'Riwayat Absensi',
    pengumuman: 'Pengumuman',
    profil: 'Profil Saya',
  }

  const goTo = (id: EmployeeNav) => { setNav(id); setMobileNavOpen(false) }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className={`sidebar-backdrop ${mobileNavOpen ? 'show' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <aside className={`app-sidebar ${mobileNavOpen ? 'open' : ''}`} style={{ width: 210 }}>
        <div style={{ padding: '0 6px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, fontFamily: 'Outfit', flexShrink: 0 }}>H</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>HadiR</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>Portal Karyawan</div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="mobile-menu-btn" style={{ width: 30, height: 30 }}>✕</button>
        </div>

        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', padding: '0 8px', marginBottom: 6, letterSpacing: '0.08em' }}>MENU</div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => goTo(item.id)} className={`sidebar-link ${nav === item.id ? 'active' : ''}`} style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%' }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 12, padding: '14px 8px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(37,99,235,0.12)', border: '1.5px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: '#2563eb', flexShrink: 0 }}>{user.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>Karyawan</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '7px', textAlign: 'center' }}>↩ Keluar</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 24px' }}>
          <button onClick={() => setMobileNavOpen(true)} className="mobile-menu-btn">☰</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--foreground)' }}>{pageTitles[nav]}</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 1 }}>Selasa, 12 Agustus 2026</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Outfit', fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>Online</span>
            <button onClick={onToggleDark} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{dark ? '☀️' : '🌙'}</button>
          </div>
        </header>

        <main style={{ padding: '28px 24px', flex: 1, minWidth: 0 }}>
          {nav === 'home' && <HomePage user={user} />}
          {nav === 'absensi' && <AbsensiEmpPage />}
          {nav === 'permohonan' && <PermohonanEmpPage user={user} />}
          {nav === 'riwayat' && <RiwayatEmpPage />}
          {nav === 'pengumuman' && <PengumumanEmpPage />}
          {nav === 'profil' && <ProfilPage user={user} />}
        </main>
      </div>
    </div>
  )
}
