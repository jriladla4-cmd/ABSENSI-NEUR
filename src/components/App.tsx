'use client'

import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area,
} from 'recharts'
import AbsensiPage from './pages/AbsensiPage'
import KaryawanPage from './pages/KaryawanPage'
import LaporanPage from './pages/LaporanPage'
import PengaturanPage from './pages/PengaturanPage'
import PermohonanPage from './pages/PermohonanPage'
import LoginPage, { type AuthUser } from './pages/LoginPage'
import EmployeePortal from './pages/EmployeePortal'
import ControlCenter from './pages/ControlCenter'

// ─── Data ─────────────────────────────────────────────────────────────────────

const weeklyData = [
  { day: 'Sen', hadir: 87, telat: 8, izin: 4, alfa: 1 },
  { day: 'Sel', hadir: 91, telat: 5, izin: 3, alfa: 1 },
  { day: 'Rab', hadir: 83, telat: 10, izin: 5, alfa: 2 },
  { day: 'Kam', hadir: 89, telat: 6, izin: 4, alfa: 1 },
  { day: 'Jum', hadir: 78, telat: 12, izin: 7, alfa: 3 },
]

const monthlyTrend = [
  { week: 'W1', kehadiran: 88 }, { week: 'W2', kehadiran: 85 },
  { week: 'W3', kehadiran: 91 }, { week: 'W4', kehadiran: 87 },
]

const sparklines = {
  hadir: [82, 85, 88, 84, 91, 89, 92],
  telat: [12, 10, 9, 11, 8, 9, 7],
  izin: [6, 7, 5, 8, 6, 5, 4],
  pct: [84, 85, 87, 86, 91, 88, 87],
}

const employees = [
  { id: 1, name: 'Rina Setiawati', dept: 'Engineering', status: 'hadir', checkIn: '08:02', avatar: 'RS', color: '#2563eb' },
  { id: 2, name: 'Budi Santoso', dept: 'Marketing', status: 'telat', checkIn: '09:14', avatar: 'BS', color: '#7c3aed' },
  { id: 3, name: 'Dita Permata', dept: 'Finance', status: 'hadir', checkIn: '07:58', avatar: 'DP', color: '#0d9488' },
  { id: 4, name: 'Fajar Nugroho', dept: 'HR', status: 'izin', checkIn: '—', avatar: 'FN', color: '#f59e0b' },
  { id: 5, name: 'Lana Kusuma', dept: 'Design', status: 'hadir', checkIn: '08:11', avatar: 'LK', color: '#ec4899' },
  { id: 6, name: 'Marco Hendra', dept: 'Engineering', status: 'telat', checkIn: '09:32', avatar: 'MH', color: '#06b6d4' },
  { id: 7, name: 'Nadia Putri', dept: 'Legal', status: 'alfa', checkIn: '—', avatar: 'NP', color: '#ef4444' },
  { id: 8, name: 'Rizky Firmansyah', dept: 'Sales', status: 'hadir', checkIn: '07:55', avatar: 'RF', color: '#10b981' },
]

const approvalsSeed = [
  { id: 1, employee: 'Budi Santoso', type: 'Izin Sakit', date: '12 Agu 2026', dept: 'Marketing', avatar: 'BS', color: '#7c3aed' },
  { id: 2, employee: 'Nadia Putri', type: 'Cuti Tahunan', date: '13–15 Agu 2026', dept: 'Legal', avatar: 'NP', color: '#ef4444' },
  { id: 3, employee: 'Marco Hendra', type: 'WFH Request', date: '14 Agu 2026', dept: 'Engineering', avatar: 'MH', color: '#06b6d4' },
]

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  {
    id: 'absensi', label: 'Absensi', icon: '✓',
    sub: [
      { id: 'absensi/ringkasan', label: 'Ringkasan' },
      { id: 'absensi/riwayat', label: 'Riwayat' },
      { id: 'absensi/gps', label: 'Monitor GPS' },
    ],
  },
  {
    id: 'permohonan', label: 'Permohonan', icon: '📋',
  },
  {
    id: 'karyawan', label: 'Karyawan', icon: '⊙',
    sub: [
      { id: 'karyawan/data', label: 'Data Karyawan' },
      { id: 'karyawan/organisasi', label: 'Organisasi' },
      { id: 'karyawan/status', label: 'Status' },
      { id: 'karyawan/dokumen', label: 'Dokumen & Kontrak' },
    ],
  },
  { id: 'laporan', label: 'Laporan', icon: '≡' },
  { id: 'pengumuman', label: 'Pengumuman', icon: '📢' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'notifikasi', label: 'Notifikasi', icon: '🔔' },
  {
    id: 'pengaturan', label: 'Pengaturan', icon: '⚙',
    sub: [
      { id: 'pengaturan/role', label: 'Role Management' },
      { id: 'pengaturan/permission', label: 'Permission' },
      { id: 'pengaturan/kantor', label: 'Lokasi Kantor' },
      { id: 'pengaturan/shift', label: 'Jam Kerja / Shift' },
      { id: 'pengaturan/libur', label: 'Hari Libur' },
    ],
  },
  { id: 'payroll', label: 'Payroll', icon: '💰', soon: true },
] as const

// ─── Micro components ─────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { hadir: 'badge-hadir', telat: 'badge-telat', izin: 'badge-izin', alfa: 'badge-alfa' }
  const labels: Record<string, string> = { hadir: 'Hadir', telat: 'Telat', izin: 'Izin', alfa: 'Alfa' }
  const dots: Record<string, string> = { hadir: '#10b981', telat: '#f59e0b', izin: '#3b82f6', alfa: '#ef4444' }
  return (
    <span className={`mono ${map[status]}`} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dots[status], display: 'inline-block', animation: status === 'hadir' ? 'pulse-dot 2s infinite' : undefined }} />
      {labels[status]}
    </span>
  )
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--muted-foreground)' }}>{p.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 500, color: 'var(--foreground)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [onClose])
  return (
    <div className="toast">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: 'var(--foreground)' }}>Berhasil!</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{message}</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 18 }}>×</button>
      </div>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 12 }, (_, i) => ({ id: i, color: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ec4899'][i % 5], left: `${20 + i * 5}%`, delay: `${i * 60}ms` }))
  return <>{pieces.map(p => <div key={p.id} className="confetti-piece" style={{ background: p.color, left: p.left, top: '40%', animationDelay: p.delay }} />)}</>
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, sparkline, color, icon }: { label: string; value: string; sub: string; sparkline: number[]; color: string; icon: string }) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color, marginTop: 6, fontFamily: 'Outfit', fontWeight: 500 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 22, width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ marginTop: 12 }}><MiniSparkline data={sparkline} color={color} /></div>
    </div>
  )
}

// ─── Approval Card ────────────────────────────────────────────────────────────

function ApprovalCard({ item, onApprove, onReject }: { item: typeof approvalsSeed[0]; onApprove: (id: number) => void; onReject: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card" style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials={item.avatar} color={item.color} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: 'var(--foreground)' }}>{item.employee}</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{item.type} · {item.dept}</div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)' }}>{item.date}</div>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 14, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </div>
      {expanded && (
        <div className="slide-down" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
          <button className="btn-primary" style={{ flex: 1, padding: '8px 0' }} onClick={() => onApprove(item.id)}>✓ Setujui</button>
          <button className="btn-ghost" style={{ flex: 1, padding: '8px 0', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => onReject(item.id)}>✕ Tolak</button>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage({ approvalList, onApprove, onReject, loading, filterStatus, setFilterStatus }: {
  approvalList: typeof approvalsSeed;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  loading: boolean;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
}) {
  const filtered = filterStatus === 'semua' ? employees : employees.filter(e => e.status === filterStatus)

  const alerts = [
    { icon: '⏰', color: '#f59e0b', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)', text: '8 karyawan terlambat hari ini', action: 'Lihat Absensi', nav: 'absensi' },
    { icon: '📋', color: '#3b82f6', bg: 'rgba(59,130,246,.08)', border: 'rgba(59,130,246,.2)', text: `${approvalList.length} permohonan menunggu approval`, action: 'Tinjau', nav: 'permohonan' },
    { icon: '🚪', color: '#ef4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)', text: '2 karyawan belum check-out (17:00+)', action: 'Lihat', nav: 'absensi' },
    { icon: '🩺', color: '#8b5cf6', bg: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.2)', text: '1 pengajuan sakit membutuhkan bukti lampiran', action: 'Tinjau', nav: 'permohonan' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Perhatian Hari Ini ── */}
      {!loading && (
        <div className="card" style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>🔔</span>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Perhatian Hari Ini</span>
            <span className="mono" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', marginLeft: 4 }}>{alerts.length} item</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 10 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: a.bg, border: `1px solid ${a.border}` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--foreground)', fontFamily: 'Inter', lineHeight: 1.4 }}>{a.text}</span>
                <button style={{ fontSize: 11, fontFamily: 'Outfit', fontWeight: 700, color: a.color, background: 'none', border: `1px solid ${a.border}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.action} →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 120 }} />)
        ) : (
          <>
            <KpiCard label="Total Hadir Hari Ini" value="87" sub="↑ 4 dari kemarin" sparkline={sparklines.hadir} color="#10b981" icon="✓" />
            <KpiCard label="Karyawan Telat" value="8" sub="↓ 2 dari kemarin" sparkline={sparklines.telat} color="#f59e0b" icon="⏰" />
            <KpiCard label="Izin / Cuti" value="4" sub="Normal" sparkline={sparklines.izin} color="#3b82f6" icon="📋" />
            <KpiCard label="Tingkat Kehadiran" value="87%" sub="Target: 90%" sparkline={sparklines.pct} color="#7c3aed" icon="📈" />
          </>
        )}
      </div>

      {/* Charts + Approval */}
      <div className="grid-side-right" style={{ '--side': '360px', '--gap': '20px' } as CSSProperties}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}>Rekap Kehadiran Minggu Ini</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>5 hari kerja · Agustus 2026</div>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontFamily: 'JetBrains Mono' }}>
              {[{ label: 'Hadir', color: '#10b981' }, { label: 'Telat', color: '#f59e0b' }, { label: 'Izin', color: '#3b82f6' }, { label: 'Alfa', color: '#ef4444' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted-foreground)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="telat" name="Telat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izin" name="Izin" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alfa" name="Alfa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}>Antrian Persetujuan</div>
            {approvalList.length > 0 && (
              <span className="mono" style={{ fontSize: 11, background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)', padding: '2px 10px', borderRadius: 99 }}>{approvalList.length} pending</span>
            )}
          </div>
          {approvalList.length === 0 ? (
            <div className="card" style={{ padding: 28, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ fontSize: 36 }}>🎉</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>Semua beres!</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Tidak ada pengajuan yang menunggu persetujuan.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {approvalList.map(item => <ApprovalCard key={item.id} item={item} onApprove={onApprove} onReject={onReject} />)}
            </div>
          )}
        </div>
      </div>

      {/* Trend */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}>Tren Kehadiran Bulanan</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Agustus 2026 · Per minggu</div>
          </div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>88.3%</div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis domain={[75, 100]} tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="kehadiran" name="Kehadiran" stroke="#2563eb" strokeWidth={2.5} fill="url(#trendGrad)" dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Employee table */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}>Status Karyawan Hari Ini</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['semua', 'hadir', 'telat', 'izin', 'alfa'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: filterStatus === s ? 'var(--primary)' : 'transparent', color: filterStatus === s ? '#fff' : 'var(--muted-foreground)', transition: 'all 0.15s', textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Karyawan', 'Departemen', 'Status', 'Check-in', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={emp.avatar} color={emp.color} size={32} />
                      <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: 'var(--foreground)' }}>{emp.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: 13, color: 'var(--muted-foreground)' }}>{emp.dept}</td>
                  <td style={{ padding: '12px 12px' }}><StatusBadge status={emp.status} /></td>
                  <td style={{ padding: '12px 12px' }}>
                    <span className="mono" style={{ fontSize: 13, color: emp.status === 'hadir' ? '#10b981' : emp.status === 'telat' ? '#f59e0b' : 'var(--muted-foreground)' }}>{emp.checkIn}</span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Placeholder Page ─────────────────────────────────────────────────────────

function PlaceholderPage({ icon, title, desc, soon }: { icon: string; title: string; desc: string; soon?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: 'var(--foreground)' }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--muted-foreground)', maxWidth: 360, lineHeight: 1.6 }}>{desc}</div>
      {soon && (
        <span className="mono" style={{ fontSize: 12, padding: '4px 14px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)' }}>Segera Hadir</span>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ activeNav, setActiveNav, approvalCount, user, open, onClose }: {
  activeNav: string;
  setActiveNav: (id: string) => void;
  approvalCount: number;
  user: AuthUser;
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string[]>(['absensi', 'permohonan', 'karyawan', 'pengaturan'])

  const toggleExpand = (id: string) => {
    setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])
  }

  const activeRoot = activeNav.split('/')[0]

  return (
    <>
    <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
    <aside className={`app-sidebar ${open ? 'open' : ''}`} style={{ width: 220 }}>
      {/* Logo */}
      <div style={{ padding: '0 6px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, fontFamily: 'Outfit', flexShrink: 0 }}>H</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>HadiR</div>
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>HR Platform</div>
        </div>
        <button onClick={onClose} className="mobile-menu-btn" style={{ width: 30, height: 30 }}>✕</button>
      </div>

      <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', padding: '0 8px', marginBottom: 6, letterSpacing: '0.08em' }}>MENU</div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
        {NAV.map(item => {
          const hasSub = 'sub' in item && item.sub
          const isSoon = 'soon' in item && item.soon
          const isRootActive = activeRoot === item.id
          const isExpanded = expanded.includes(item.id)

          return (
            <div key={item.id}>
              <button
                className={`sidebar-link ${!hasSub && !isSoon && activeNav === item.id ? 'active' : isRootActive && hasSub ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', justifyContent: 'space-between', opacity: isSoon ? 0.55 : 1 }}
                onClick={() => {
                  if (isSoon) { setActiveNav(item.id); onClose(); return }
                  if (hasSub) {
                    toggleExpand(item.id)
                    if (!isExpanded) setActiveNav((item as any).sub[0].id)
                  } else {
                    setActiveNav(item.id)
                    onClose()
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                  {item.id === 'permohonan' && approvalCount > 0 && (
                    <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{approvalCount}</span>
                  )}
                  {isSoon && (
                    <span className="mono" style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>Soon</span>
                  )}
                </div>
                {hasSub && (
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
                )}
              </button>

              {hasSub && isExpanded && (
                <div className="slide-down" style={{ marginLeft: 14, marginTop: 2, marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 1, borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
                  {item.sub.map((sub: any) => (
                    <button key={sub.id}
                      onClick={() => { setActiveNav(sub.id); onClose() }}
                      style={{ textAlign: 'left', border: 'none', background: 'none', padding: '7px 8px', borderRadius: 8, fontSize: 13, fontFamily: 'Outfit', fontWeight: activeNav === sub.id ? 600 : 500, color: activeNav === sub.id ? 'var(--primary)' : 'var(--muted-foreground)', cursor: 'pointer', transition: 'all 0.12s' }}
                      onMouseEnter={e => { if (activeNav !== sub.id) e.currentTarget.style.color = 'var(--foreground)' }}
                      onMouseLeave={e => { if (activeNav !== sub.id) e.currentTarget.style.color = 'var(--muted-foreground)' }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={user.avatar} color="#2563eb" size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── Root App — auth router ───────────────────────────────────────────────────

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [impersonatingTenant, setImpersonatingTenant] = useState<{ slug: string; name: string } | null>(null)
  const [dark, setDark] = useState(false)

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user)
    setImpersonatingTenant(null)
  }
  const handleLogout = () => {
    setAuthUser(null)
    setImpersonatingTenant(null)
  }
  const toggleDark = () => setDark(d => !d)

  if (!authUser) return <LoginPage onLogin={handleLogin} dark={dark} onToggleDark={toggleDark} />
  if (authUser.role === 'employee') return <EmployeePortal user={authUser} onLogout={handleLogout} dark={dark} onToggleDark={toggleDark} />
  
  if (authUser.role === 'super_admin') {
    if (impersonatingTenant) {
      return (
        <HRPortal
          user={{
            ...authUser,
            company: impersonatingTenant.name,
            name: `${authUser.name} (${impersonatingTenant.name})`,
            role: 'admin',
          }}
          onLogout={handleLogout}
          dark={dark}
          onToggleDark={toggleDark}
          impersonating={impersonatingTenant}
          onExitImpersonate={() => setImpersonatingTenant(null)}
        />
      )
    }
    return (
      <ControlCenter
        user={authUser}
        onLogout={handleLogout}
        dark={dark}
        onToggleDark={toggleDark}
        onImpersonate={(slug, name) => setImpersonatingTenant({ slug, name })}
      />
    )
  }

  // admin → HR Portal (below)
  return <HRPortal user={authUser} onLogout={handleLogout} dark={dark} onToggleDark={toggleDark} />
}

// ─── HR Portal ────────────────────────────────────────────────────────────────

function HRPortal({
  user,
  onLogout,
  dark,
  onToggleDark,
  impersonating,
  onExitImpersonate,
}: {
  user: AuthUser
  onLogout: () => void
  dark: boolean
  onToggleDark: () => void
  impersonating?: { slug: string; name: string } | null
  onExitImpersonate?: () => void
}) {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [approvalList, setApprovalList] = useState(approvalsSeed)
  const [toast, setToast] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [filterStatus, setFilterStatus] = useState('semua')
  const [loading, setLoading] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1200); return () => clearTimeout(t) }, [])

  const handleApprove = useCallback((id: number) => {
    setApprovalList(l => l.filter(i => i.id !== id))
    setToast('Pengajuan disetujui dan notifikasi dikirim ke karyawan.')
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 900)
  }, [])

  const handleReject = useCallback((id: number) => {
    setApprovalList(l => l.filter(i => i.id !== id))
    setToast('Pengajuan ditolak.')
  }, [])

  const pageLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    'absensi/ringkasan': 'Absensi — Ringkasan',
    'absensi/riwayat': 'Absensi — Riwayat',
    'absensi/gps': 'Absensi — Monitor GPS',
    'permohonan/izin': 'Permohonan — Izin',
    'permohonan/lembur': 'Permohonan — Lembur',
    'permohonan/reimburse': 'Permohonan — Reimburse',
    'karyawan/data': 'Karyawan — Data',
    'karyawan/organisasi': 'Karyawan — Organisasi',
    'karyawan/status': 'Karyawan — Status',
    'karyawan/dokumen': 'Karyawan — Dokumen & Kontrak',
    laporan: 'Laporan & Analitik',
    pengumuman: 'Pengumuman',
    chat: 'Chat Internal',
    notifikasi: 'Notifikasi',
    'pengaturan/role': 'Pengaturan — Role Management',
    'pengaturan/permission': 'Pengaturan — Permission',
    'pengaturan/kantor': 'Pengaturan — Lokasi Kantor',
    'pengaturan/shift': 'Pengaturan — Jam Kerja / Shift',
    'pengaturan/libur': 'Pengaturan — Hari Libur',
    payroll: 'Payroll',
  }

  const activeRoot = activeNav.split('/')[0]

  const renderPage = () => {
    if (activeNav === 'dashboard') {
      return <DashboardPage approvalList={approvalList} onApprove={handleApprove} onReject={handleReject} loading={loading} filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
    }
    if (activeRoot === 'absensi') return <AbsensiPage />
    if (activeRoot === 'permohonan') return <PermohonanPage />
    if (activeRoot === 'karyawan') return <KaryawanPage />
    if (activeNav === 'laporan') return <LaporanPage />
    if (activeNav === 'pengumuman') return <PlaceholderPage icon="📢" title="Pengumuman" desc="Buat dan kelola pengumuman perusahaan — draft, publish, arsip." />
    if (activeNav === 'chat') return <PlaceholderPage icon="💬" title="Chat Internal" desc="Ruang chat perusahaan untuk seluruh karyawan." />
    if (activeNav === 'notifikasi') return <PlaceholderPage icon="🔔" title="Notifikasi" desc="Inbox notifikasi sistem HR." />
    if (activeRoot === 'pengaturan') return <PengaturanPage />
    if (activeNav === 'payroll') return <PlaceholderPage icon="💰" title="Payroll" desc="Modul penggajian, slip gaji, THR, dan BPJS. Segera hadir." soon />
    return null
  }

  return (
    <div className="app-shell" style={{ flexDirection: 'column' }}>
      {/* Impersonate Banner */}
      {impersonating && (
        <div style={{
          background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
          color: '#ffffff',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          fontSize: 13,
          fontFamily: 'Outfit',
          fontWeight: 600,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <span>
              Mode Impersonasi: <strong>{impersonating.name}</strong> (<code style={{ fontFamily: 'JetBrains Mono', fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4 }}>/{impersonating.slug}</code>) — Anda melihat portal sebagai HR Admin tenant ini.
            </span>
          </div>
          <button
            onClick={onExitImpersonate}
            style={{
              background: '#ffffff',
              color: '#6d28d9',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            ✕ Keluar Impersonasi
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} approvalCount={approvalList.length} user={user} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
          <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 24px' }}>
            <button onClick={() => setMobileNavOpen(true)} className="mobile-menu-btn">☰</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--foreground)' }}>{pageLabels[activeNav] ?? activeNav}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 1 }}>Selasa, 12 Agustus 2026</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div className="header-search" style={{ background: 'var(--muted)', borderRadius: 10, padding: '8px 14px', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>🔍</span>
                <input placeholder="Cari karyawan..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: 160, fontFamily: 'Inter' }} />
              </div>
              <button onClick={onToggleDark} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{dark ? '☀️' : '🌙'}</button>
              <button className="btn-primary">+ Check-in Manual</button>
              <button onClick={onLogout} className="btn-ghost" style={{ fontSize: 13 }}>↩ Keluar</button>
            </div>
          </header>

          {/* Content */}
          <main style={{ padding: '28px 24px', flex: 1, minWidth: 0 }}>
            {renderPage()}
          </main>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {showConfetti && <Confetti />}
    </div>
  )
}

