'use client'

import { useState, useRef, type CSSProperties } from 'react'
import type { AuthUser } from './LoginPage'
import dynamic from 'next/dynamic'
import BrandMark from '@/components/BrandMark'
import CameraCapture, { type CameraCaptureHandle, type CameraLocationInfo } from '@/components/CameraCapture'
import ModalOverlay from '@/components/ModalOverlay'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useOffices } from '@/hooks/useOffices'
import { useAttendance } from '@/hooks/useAttendance'
import { formatDistance } from '@/lib/geo'
import type { AttendanceRecord } from '@/lib/attendanceStore'
import {
  PERMOHONAN_PAGE_LABELS,
  PERMOHONAN_SUBMENU,
  categoryFromNav,
  categoryLabel,
  categoryToEmpType,
  matchesEmpRequestType,
  type EmpRequestType,
  type PermohonanCategory,
} from '@/lib/permohonanTypes'

const GeoMap = dynamic(() => import('@/components/GeoMap'), { ssr: false })

type EmployeeNav =
  | 'home'
  | 'absensi/checkin'
  | 'absensi/riwayat'
  | 'permohonan/inbox'
  | 'permohonan/telat'
  | 'permohonan/cuti'
  | 'permohonan/sakit'
  | 'permohonan/izin'
  | 'permohonan/wfh'
  | 'permohonan/dinas'
  | 'profil'
  | 'pengumuman'

type NavItem = {
  id: string
  label: string
  icon: string
  sub?: { id: EmployeeNav; label: string }[]
}

const NAV: NavItem[] = [
  { id: 'home', label: 'Beranda', icon: '⊞' },
  {
    id: 'absensi',
    label: 'Absensi',
    icon: '✓',
    sub: [
      { id: 'absensi/checkin', label: 'Check In / Out' },
      { id: 'absensi/riwayat', label: 'Riwayat Absensi' },
    ],
  },
  {
    id: 'permohonan',
    label: 'Permohonan',
    icon: '📋',
    sub: PERMOHONAN_SUBMENU.map((s) => ({ id: s.id as EmployeeNav, label: s.label })),
  },
  { id: 'pengumuman', label: 'Pengumuman', icon: '📢' },
  { id: 'profil', label: 'Profil Saya', icon: '⊙' },
]

// ─── Seed data ────────────────────────────────────────────────────────────────

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
  { id: 7, no: 'PRM-2026-00129', type: 'Izin Telat', icon: '⏰', dateLabel: '12 Agustus 2026 · Telat 74 menit', note: 'Macet di tol · rencana 08:00 · aktual 09:14', submitted: 'Diajukan 12 Agu 2026', month: 'AGUSTUS 2026', status: 'menunggu' as const, hasAttachment: false },
  { id: 3, no: 'PRM-2026-00118', type: 'Cuti Tahunan', icon: '🌴', dateLabel: '20–21 Agu 2026 · 2 Hari', note: 'Acara keluarga', submitted: 'Diajukan 15 Agu 2026', month: 'AGUSTUS 2026', status: 'menunggu' as const, hasAttachment: false },
  { id: 4, no: 'PRM-2026-00098', type: 'Cuti Tahunan', icon: '🌴', dateLabel: '20–22 Juli 2026 · 3 Hari', note: 'Keperluan pribadi', submitted: 'Diajukan 18 Jul 2026', month: 'JULI 2026', status: 'disetujui' as const, hasAttachment: false },
  { id: 5, no: 'PRM-2026-00091', type: 'Izin', icon: '📋', dateLabel: '10 Juli 2026 · 1 Hari', note: 'Urusan administrasi', submitted: 'Diajukan 09 Jul 2026', month: 'JULI 2026', status: 'ditolak' as const, hasAttachment: false },
  { id: 6, no: 'PRM-2026-00085', type: 'Dinas', icon: '🧳', dateLabel: '05–06 Juli 2026 · 2 Hari', note: 'Kunjungan klien Bandung', submitted: 'Diajukan 01 Jul 2026', month: 'JULI 2026', status: 'disetujui' as const, hasAttachment: true },
]

const REQUEST_TYPES: { id: EmpRequestType; icon: string; title: string; desc: string; needsDoc?: boolean }[] = [
  { id: 'Izin Telat', icon: '⏰', title: 'Izin Telat', desc: 'Keterlambatan check-in / pulang awal' },
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

function HomePage({ user, onGoAbsensi }: { user: AuthUser; onGoAbsensi: () => void }) {
  const { records, today } = useAttendance()
  const now = new Date()
  const timeStr = now.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })
  const checkedIn = Boolean(today && today.checkIn !== '—')
  const checkedOut = Boolean(today && today.checkOut !== '—')
  const recent = records.slice(0, 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', border: 'none', color: '#fff' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22 }}>Selamat pagi, {user.name.split(' ')[0]}! 👋</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4, fontFamily: 'Inter' }}>Selasa, 12 Agustus 2026 · {timeStr} WIB</div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {!checkedIn ? (
            <button type="button" onClick={onGoAbsensi} style={{ padding: '10px 22px', borderRadius: 10, background: '#fff', color: '#2563eb', fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>📍 Check In</button>
          ) : !checkedOut ? (
            <>
              <div style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
                ✓ Masuk {today?.checkIn} {today?.status === 'telat' ? '· Telat' : '· Tepat Waktu'}
              </div>
              <button type="button" onClick={onGoAbsensi} style={{ padding: '10px 22px', borderRadius: 10, background: '#fff', color: '#dc2626', fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>🏃 Check Out</button>
            </>
          ) : (
            <div style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>✓ Sudah absen hari ini</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { label: 'Hadir Bulan Ini', value: String(records.filter(r => r.status === 'hadir' || r.status === 'telat').length), unit: 'hari', color: '#10b981' },
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

      <div className="grid-2" style={{ '--gap': '18px' } as CSSProperties}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Absensi Terakhir</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)', width: 48, flexShrink: 0 }}>{r.dateLabel}</span>
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

function AbsensiEmpPage() {
  const { activeOffices, nearestTo, primary } = useOffices()
  const { today, checkIn, checkOut } = useAttendance()
  const geo = useGeolocation({ watch: true })
  const now = new Date()
  const timeStr = now.toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })
  const cameraRef = useRef<CameraCaptureHandle>(null)
  const cameraModeRef = useRef<'in' | 'out' | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const checkedIn = Boolean(today && today.checkIn !== '—')
  const checkedOut = Boolean(today && today.checkOut !== '—')
  const checkInTime = today?.checkIn && today.checkIn !== '—' ? today.checkIn : ''
  const checkOutTime = today?.checkOut && today.checkOut !== '—' ? today.checkOut : ''
  const checkedOfficeName = today?.loc && today.loc !== '—' ? today.loc : ''

  const match =
    geo.lat != null && geo.lng != null ? nearestTo(geo.lat, geo.lng) : null
  const office = match?.office ?? primary
  const insideGeofence = Boolean(match?.inside)
  const distanceM = match?.distanceM ?? null

  const gpsLabel =
    geo.status === 'locating' || geo.status === 'idle'
      ? 'Mencari lokasi…'
      : geo.status === 'ready'
        ? insideGeofence
          ? `Dalam radius ${office.name} (${formatDistance(distanceM ?? 0)})`
          : `Di luar semua kantor aktif · terdekat ${office.name} (${formatDistance(distanceM ?? 0)})`
        : geo.errorMessage ?? 'GPS tidak aktif'

  const canCheckIn = geo.status === 'ready' && insideGeofence && !checkedIn
  const canCheckOut = checkedIn && !checkedOut && geo.status === 'ready' && insideGeofence

  const mapSites = activeOffices.map((o) => ({
    id: o.id,
    lat: o.lat,
    lng: o.lng,
    name: o.name,
    radiusM: o.radiusM,
    highlight: office.id === o.id,
  }))

  const punchMeta = {
    locAddress: office.address,
    lat: geo.lat ?? undefined,
    lng: geo.lng ?? undefined,
    distanceM: distanceM ?? undefined,
  }

  const cameraLocation: CameraLocationInfo = {
    officeName: office.name,
    officeAddress: office.address,
    officeLat: office.lat,
    officeLng: office.lng,
    radiusM: office.radiusM,
    sites: mapSites,
    userLat: geo.lat,
    userLng: geo.lng,
    insideGeofence,
    gpsLabel,
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 3200)
  }

  const openCamera = async (mode: 'in' | 'out') => {
    cameraModeRef.current = mode
    const title = mode === 'in' ? 'Check In' : 'Check Out'
    cameraRef.current?.show(title)

    const cam = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices)
    if (!window.isSecureContext || !cam) {
      cameraRef.current?.fail('Kamera butuh HTTPS atau localhost. Buka halaman ini di Chrome (tab baru), bukan preview.')
      return
    }

    try {
      const stream = await cam({ video: true, audio: false })
      cameraRef.current?.useStream(stream)
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        cameraRef.current?.fail('Izin kamera ditolak / diblokir. Izinkan Camera di gembok address bar, lalu coba lagi.')
      } else if (name === 'NotFoundError') {
        cameraRef.current?.fail('Tidak ada kamera di perangkat ini.')
      } else {
        cameraRef.current?.fail('Tidak bisa membuka kamera. Coba lagi.')
      }
    }
  }

  const handleCaptured = (photo: string) => {
    const mode = cameraModeRef.current
    const clock = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    if (mode === 'in') {
      checkIn(office.name, { ...punchMeta, photo })
      showToast(`Check-in berhasil · ${office.name} · ${clock}`)
    } else if (mode === 'out') {
      checkOut({ ...punchMeta, loc: office.name, photo })
      showToast(`Check-out berhasil · ${office.name} · ${clock}`)
    }
    cameraModeRef.current = null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3000,
            background: '#0f172a',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 12,
            fontFamily: 'Outfit',
            fontWeight: 600,
            fontSize: 13,
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            maxWidth: 'min(92vw, 420px)',
            textAlign: 'center',
          }}
        >
          {toast}
        </div>
      )}
      <CameraCapture ref={cameraRef} onCapture={handleCaptured} location={cameraLocation} />
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <GeoMap
          height={260}
          userLat={geo.lat}
          userLng={geo.lng}
          showOffice
          showGeofence
          sites={mapSites}
          officeLat={office.lat}
          officeLng={office.lng}
          officeName={office.name}
          radiusM={office.radiusM}
          focusLat={office.lat}
          focusLng={office.lng}
        />
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14 }}>
              {office.name}
              {activeOffices.length > 1 ? ' · terdekat' : ''}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{office.address}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 6, color: 'var(--muted-foreground)' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background:
                    geo.status === 'ready'
                      ? insideGeofence
                        ? '#10b981'
                        : '#ef4444'
                      : geo.status === 'locating' || geo.status === 'idle'
                        ? '#f59e0b'
                        : '#94a3b8',
                  boxShadow:
                    geo.status === 'ready' && insideGeofence
                      ? '0 0 0 3px rgba(16,185,129,0.25)'
                      : undefined,
                }}
              />
              {gpsLabel}
            </div>
            {geo.lat != null && geo.lng != null && (
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 4 }}>
                {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
                {geo.accuracy != null ? ` · ±${Math.round(geo.accuracy)}m` : ''}
              </div>
            )}
          </div>
          <button type="button" className="btn-ghost" onClick={geo.refresh} style={{ fontSize: 12, padding: '6px 12px' }}>
            Perbarui lokasi
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ '--gap': '16px' } as CSSProperties}>
        <div className="card" style={{ padding: '22px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.05em', marginBottom: 10 }}>CHECK IN</div>
          {checkedIn ? (
            <>
              <div style={{ fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: '#10b981' }}>{checkInTime}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
                {today?.status === 'telat' ? 'Telat' : 'Tepat waktu'} · {checkedOfficeName || office.name}
              </div>
              {today?.checkInPhoto && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={today.checkInPhoto} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, margin: '12px auto 0', display: 'block' }} />
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--foreground)' }}>{timeStr}</div>
              <button
                type="button"
                disabled={!canCheckIn}
                onClick={() => openCamera('in')}
                className="btn-primary"
                style={{ marginTop: 14, width: '100%', opacity: canCheckIn ? 1 : 0.5, cursor: canCheckIn ? 'pointer' : 'not-allowed' }}
              >
                Check In Sekarang
              </button>
              {!canCheckIn && (
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 8 }}>
                  {geo.status !== 'ready'
                    ? 'Menunggu GPS…'
                    : 'Harus di dalam radius salah satu kantor aktif'}
                </div>
              )}
            </>
          )}
        </div>

        <div className="card" style={{ padding: '22px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', letterSpacing: '0.05em', marginBottom: 10 }}>CHECK OUT</div>
          {checkedOut ? (
            <>
              <div style={{ fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: '#7c3aed' }}>{checkOutTime}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>Selesai bekerja · {today?.dur}</div>
              {today?.checkOutPhoto && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={today.checkOutPhoto} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12, margin: '12px auto 0', display: 'block' }} />
              )}
            </>
          ) : checkedIn ? (
            <>
              <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--foreground)' }}>{timeStr}</div>
              <button
                type="button"
                disabled={!canCheckOut}
                onClick={() => openCamera('out')}
                className="btn-ghost"
                style={{ marginTop: 14, width: '100%', color: '#7c3aed', borderColor: 'rgba(124,58,237,0.3)', opacity: canCheckOut ? 1 : 0.5, cursor: canCheckOut ? 'pointer' : 'not-allowed' }}
              >
                Check Out Sekarang
              </button>
              {!canCheckOut && (
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 8 }}>
                  Harus di dalam radius salah satu kantor aktif
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--muted-foreground)' }}>—</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 14 }}>Belum check in</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Permohonan Page ──────────────────────────────────────────────────────────

function PermohonanEmpPage({ user, categoryKey }: { user: AuthUser; categoryKey: string }) {
  type Flow = 'list' | 'pick' | 'form' | 'review' | 'detail'
  const category: PermohonanCategory = categoryFromNav(categoryKey)
  const categoryScoped = category !== 'inbox'
  const fixedType = categoryToEmpType(category)
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
  const [formPlannedTime, setFormPlannedTime] = useState('08:00')
  const [formActualTime, setFormActualTime] = useState('09:14')
  const [formNote, setFormNote] = useState('')
  const [formFile, setFormFile] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const scopedRequests = requests.filter((r) => matchesEmpRequestType(r.type, category))

  const counts = {
    semua: scopedRequests.length,
    menunggu: scopedRequests.filter(r => r.status === 'menunggu').length,
    disetujui: scopedRequests.filter(r => r.status === 'disetujui').length,
    ditolak: scopedRequests.filter(r => r.status === 'ditolak').length,
  }

  const filtered = scopedRequests.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.type.toLowerCase().includes(q) || r.note.toLowerCase().includes(q) || r.no.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'semua' || r.status === statusFilter
    const matchType = categoryScoped || typeFilter === 'Semua Jenis'
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

  const openPick = () => {
    setFormNote('')
    setFormFile(null)
    setFormDuration('1')
    setFormPlannedTime('08:00')
    setFormActualTime('09:14')
    if (fixedType) {
      setSelectedType(fixedType)
      setFlow('form')
    } else {
      setSelectedType(null)
      setFlow('pick')
    }
  }
  const pickType = (t: EmpRequestType) => { setSelectedType(t); setFlow('form') }
  const goReview = () => {
    if (!formNote.trim()) { setToast('Isi keterangan terlebih dahulu.'); setTimeout(() => setToast(null), 2000); return }
    if (needsDoc && !formFile) { setToast('Upload dokumen pendukung wajib untuk jenis ini.'); setTimeout(() => setToast(null), 2200); return }
    setFlow('review')
  }
  const submit = (asDraft = false) => {
    if (!selectedType || !typeMeta) return
    const no = `PRM-2026-${String(130 + requests.length).padStart(5, '0')}`
    const dateLabel = selectedType === 'Izin Telat'
      ? `${new Date(formDate + 'T00:00:00').toLocaleDateString('id', { day: '2-digit', month: 'long', year: 'numeric' })} · Rencana ${formPlannedTime} · Aktual ${formActualTime}`
      : `${new Date(formDate + 'T00:00:00').toLocaleDateString('id', { day: '2-digit', month: 'long', year: 'numeric' })} · ${formDuration} Hari`
    const note = selectedType === 'Izin Telat' && formNote
      ? `${formNote} · rencana ${formPlannedTime} · aktual ${formActualTime}`
      : formNote || (asDraft ? 'Draft' : '—')
    setRequests(r => [{
      id: Date.now(),
      no,
      type: selectedType === 'Cuti' ? 'Cuti Tahunan' : selectedType,
      icon: typeMeta.icon,
      dateLabel,
      note,
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
    <>
      {toast && (
        <div className="toast" style={{ bottom: 24, right: 24 }}>{toast}</div>
      )}

      {(flow === 'pick' || flow === 'form' || flow === 'review') && (
        <ModalOverlay onClose={() => setFlow('list')} padding={16}>
          <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ width: '100%', maxWidth: flow === 'review' ? 560 : 520, maxHeight: '92vh', overflow: 'auto' }}>
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
                  <button onClick={() => setFlow(fixedType ? 'list' : 'pick')} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 13 }}>←</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>{typeMeta.icon} {typeMeta.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Langkah 1 dari 2 · Detail Permohonan</div>
                  </div>
                  <button onClick={() => setFlow('list')} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>
                      {selectedType === 'Izin Sakit' ? 'Tanggal Sakit' : selectedType === 'Dinas' ? 'Tanggal Dinas' : selectedType === 'Izin Telat' ? 'Tanggal Kejadian' : 'Tanggal'}
                    </label>
                    <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  {selectedType === 'Izin Telat' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Jam Rencana</label>
                        <input type="time" value={formPlannedTime} onChange={e => setFormPlannedTime(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Jam Aktual</label>
                        <input type="time" value={formActualTime} onChange={e => setFormActualTime(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  ) : (
                  <div>
                    <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Durasi (hari)</label>
                    <input type="number" min={1} max={30} value={formDuration} onChange={e => setFormDuration(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  )}
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
                      <div style={{ display: 'inline-flex', marginBottom: 10 }}>
                      <BrandMark size={44} />
                    </div>
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
        </ModalOverlay>
      )}

      {flow === 'detail' && detail && (
        <ModalOverlay onClose={() => { setFlow('list'); setDetailId(null) }} padding={16}>
          <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ width: '100%', maxWidth: 440, padding: '22px 24px' }}>
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
        </ModalOverlay>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18 }}>{categoryLabel(category)}</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
            {categoryScoped
              ? `Riwayat dan pengajuan ${categoryLabel(category).replace('Permohonan — ', '').toLowerCase()}`
              : 'Kelola semua pengajuan cuti, izin, dan permohonan lainnya'}
          </div>
        </div>
        <button className="btn-primary" onClick={openPick}>
          + Ajukan {fixedType ?? 'Permohonan'}
        </button>
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
          {!categoryScoped && (
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
            {['Semua Jenis', 'Cuti', 'Izin Telat', 'Izin Sakit', 'WFH', 'Izin', 'Dinas'].map(t => <option key={t}>{t}</option>)}
          </select>
          )}
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
    </>
  )
}

// ─── Riwayat Page ─────────────────────────────────────────────────────────────

function monthLabelFromDateKey(dateKey: string): string {
  const parts = dateKey.split('-')
  const y = parts[0]
  const m = Number(parts[1])
  const names = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${names[m - 1] ?? 'Bulan'} ${y}`
}

function monthKeyFromLabel(label: string): string {
  const map: Record<string, string> = {
    Januari: '-01-', Februari: '-02-', Maret: '-03-', April: '-04-',
    Mei: '-05-', Juni: '-06-', Juli: '-07-', Agustus: '-08-',
    September: '-09-', Oktober: '-10-', November: '-11-', Desember: '-12-',
  }
  for (const [name, key] of Object.entries(map)) {
    if (label.startsWith(name)) return key
  }
  return ''
}

function RiwayatEmpPage() {
  const { records } = useAttendance()
  const monthOptions = Array.from(
    new Set([
      monthLabelFromDateKey(new Date().toISOString().slice(0, 10)),
      
      ...records.map((r) => monthLabelFromDateKey(r.dateKey)),
    ]),
  )
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState(monthOptions[0] ?? 'Agustus 2026')
  const [statusFilter, setStatusFilter] = useState('semua')
  const [showFilter, setShowFilter] = useState(false)
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<AttendanceRecord | null>(null)
  const perPage = 6

  const monthKey = monthKeyFromLabel(month)
  const monthFiltered = records.filter(r =>
    monthKey ? r.dateKey.includes(monthKey) && r.dateKey.startsWith(month.split(' ').pop() ?? '') : true,
  )
  const filtered = monthFiltered.filter(r => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      r.dateLabel.toLowerCase().includes(q) ||
      r.status.includes(q) ||
      r.checkIn.includes(q) ||
      r.loc.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'semua' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const summary = {
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
    <>
    {detail && (
      <ModalOverlay onClose={() => setDetail(null)}>
        <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ width: '100%', maxWidth: 440, padding: '22px 24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>Detail Absensi</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{detail.dateLabel} {detail.year}</div>
              </div>
              <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', color: 'var(--muted-foreground)' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Check In', value: detail.checkIn },
                { label: 'Check Out', value: detail.checkOut },
                { label: 'Durasi', value: detail.dur },
                { label: 'Status', value: detail.status },
              ].map(f => (
                <div key={f.label} style={{ background: 'var(--muted)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 4 }}>{f.label.toUpperCase()}</div>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700, textTransform: f.label === 'Status' ? 'capitalize' : undefined }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--muted)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 6 }}>LOKASI CHECK IN</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{detail.loc}</div>
              {detail.locAddress && (
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.45 }}>{detail.locAddress}</div>
              )}
              {(detail.lat != null && detail.lng != null) && (
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>
                  {detail.lat.toFixed(5)}, {detail.lng.toFixed(5)}
                  {detail.distanceM != null ? ` · ${formatDistance(detail.distanceM)} dari kantor` : ''}
                </div>
              )}
            </div>

            {detail.checkOut !== '—' && (detail.outLoc || detail.outLocAddress) && (
              <div style={{ background: 'var(--muted)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 6 }}>LOKASI CHECK OUT</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{detail.outLoc || detail.loc}</div>
                {detail.outLocAddress && (
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4, lineHeight: 1.45 }}>{detail.outLocAddress}</div>
                )}
                {(detail.outLat != null && detail.outLng != null) && (
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 6 }}>
                    {detail.outLat.toFixed(5)}, {detail.outLng.toFixed(5)}
                    {detail.outDistanceM != null ? ` · ${formatDistance(detail.outDistanceM)} dari kantor` : ''}
                  </div>
                )}
              </div>
            )}

            {(detail.checkInPhoto || detail.checkOutPhoto) && (
              <div style={{ display: 'grid', gridTemplateColumns: detail.checkInPhoto && detail.checkOutPhoto ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 14 }}>
                {detail.checkInPhoto && (
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 6 }}>FOTO CHECK IN</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={detail.checkInPhoto} alt="Foto check in" style={{ width: '100%', borderRadius: 12, display: 'block', objectFit: 'cover', aspectRatio: '3 / 4' }} />
                  </div>
                )}
                {detail.checkOutPhoto && (
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 6 }}>FOTO CHECK OUT</div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={detail.checkOutPhoto} alt="Foto check out" style={{ width: '100%', borderRadius: 12, display: 'block', objectFit: 'cover', aspectRatio: '3 / 4' }} />
                  </div>
                )}
              </div>
            )}

            <StatusBadge status={detail.status} />
        </div>
      </ModalOverlay>
    )}

    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>Riwayat Absensi</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>Lihat riwayat kehadiran dan aktivitas absensimu</div>
        </div>
        <span className="mono" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, background: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 600, whiteSpace: 'nowrap' }}>{month}</span>
      </div>

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
          {monthOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
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
                key={r.id}
                onClick={() => setDetail(r)}
                style={{ borderBottom: i < paged.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{r.dateLabel}</span></td>
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
    </>
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
  const [expanded, setExpanded] = useState<string[]>(['absensi', 'permohonan'])

  const pageTitles: Record<EmployeeNav, string> = {
    home: 'Beranda',
    'absensi/checkin': 'Absensi — Check In / Out',
    'absensi/riwayat': 'Absensi — Riwayat',
    ...PERMOHONAN_PAGE_LABELS,
    pengumuman: 'Pengumuman',
    profil: 'Profil Saya',
  } as Record<EmployeeNav, string>

  const goTo = (id: EmployeeNav) => {
    setNav(id)
    setMobileNavOpen(false)
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const activeRoot = nav.split('/')[0]

  return (
    <div className="app-shell">
      <div className={`sidebar-backdrop ${mobileNavOpen ? 'show' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <aside className={`app-sidebar ${mobileNavOpen ? 'open' : ''}`} style={{ width: 210 }}>
        <div style={{ padding: '0 6px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flexShrink: 0 }}>
            <BrandMark size={34} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>HadiR</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>Portal Karyawan</div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="mobile-menu-btn" style={{ width: 30, height: 30 }}>✕</button>
        </div>

        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', padding: '0 8px', marginBottom: 6, letterSpacing: '0.08em' }}>MENU</div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {NAV.map((item) => {
            const hasSub = Boolean(item.sub?.length)
            const isRootActive = activeRoot === item.id
            const isExpanded = expanded.includes(item.id)

            return (
              <div key={item.id}>
                <button
                  type="button"
                  className={`sidebar-link ${!hasSub && nav === item.id ? 'active' : isRootActive && hasSub ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', justifyContent: 'space-between' }}
                  onClick={() => {
                    if (hasSub && item.sub) {
                      toggleExpand(item.id)
                      if (!isExpanded) goTo(item.sub[0].id)
                    } else {
                      goTo(item.id as EmployeeNav)
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    {item.label}
                  </div>
                  {hasSub && (
                    <span style={{ fontSize: 10, color: 'var(--muted-foreground)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                  )}
                </button>

                {hasSub && isExpanded && item.sub && (
                  <div className="slide-down" style={{ marginLeft: 14, marginTop: 2, marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 1, borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                    {item.sub.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => goTo(sub.id)}
                        style={{
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          padding: '7px 8px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontFamily: 'Outfit',
                          fontWeight: nav === sub.id ? 600 : 500,
                          color: nav === sub.id ? 'var(--primary)' : 'var(--muted-foreground)',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                        }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
          {nav === 'home' && <HomePage user={user} onGoAbsensi={() => goTo('absensi/checkin')} />}
          {nav === 'absensi/checkin' && <AbsensiEmpPage />}
          {nav === 'absensi/riwayat' && <RiwayatEmpPage />}
          {nav.startsWith('permohonan/') && <PermohonanEmpPage user={user} categoryKey={nav} />}
          {nav === 'pengumuman' && <PengumumanEmpPage />}
          {nav === 'profil' && <ProfilPage user={user} />}
        </main>
      </div>
    </div>
  )
}
