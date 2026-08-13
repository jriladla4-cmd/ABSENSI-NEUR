'use client'

import { useState, type CSSProperties } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

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

// ─── Ringkasan ───────────────────────────────────────────────────────────────

const heatmapData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  rate: Math.floor(75 + Math.random() * 20),
}))

const topLate = [
  { name: 'Marco Hendra', dept: 'Engineering', count: 7, avatar: 'MH', color: '#06b6d4' },
  { name: 'Budi Santoso', dept: 'Marketing', count: 5, avatar: 'BS', color: '#7c3aed' },
  { name: 'Yuli Andini', dept: 'Sales', count: 4, avatar: 'YA', color: '#f59e0b' },
  { name: 'Doni Pratama', dept: 'Finance', count: 3, avatar: 'DP', color: '#ef4444' },
]

const perhatianData = [
  { name: 'Nadia Putri', dept: 'Legal', issue: 'Alfa 3 hari berturut', avatar: 'NP', color: '#ef4444', severity: 'high' },
  { name: 'Marco Hendra', dept: 'Engineering', issue: 'Telat >30 mnt, tidak berizin', avatar: 'MH', color: '#06b6d4', severity: 'medium' },
  { name: 'Budi Santoso', dept: 'Marketing', issue: 'Pulang cepat tanpa izin', avatar: 'BS', color: '#7c3aed', severity: 'medium' },
]

const weekTrend = [
  { day: 'Sen', rate: 87 }, { day: 'Sel', rate: 91 }, { day: 'Rab', rate: 83 },
  { day: 'Kam', rate: 89 }, { day: 'Jum', rate: 78 },
]

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function RingkasanTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Rate cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Tingkat Kehadiran', value: '87%', color: '#10b981', icon: '✓', sub: 'Target 90%' },
          { label: 'Hadir Tepat Waktu', value: '79%', color: '#2563eb', icon: '⏱', sub: '79 dari 100 karyawan' },
          { label: 'Karyawan Perlu Perhatian', value: '3', color: '#ef4444', icon: '⚠', sub: 'Alfa / telat berulang' },
          { label: 'Rata-rata Keterlambatan', value: '18 mnt', color: '#f59e0b', icon: '⟳', sub: 'Dari 8 orang telat' },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{c.label}</div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{c.icon}</div>
            </div>
            <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: c.color, marginTop: 8 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4, fontFamily: 'Outfit' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-side-right" style={{ '--side': '320px', '--gap': '18px' } as CSSProperties}>
        {/* Trend chart */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Tren Kehadiran Minggu Ini</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 16 }}>Persentase hadir per hari</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weekTrend}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Rate" stroke="#2563eb" strokeWidth={2.5} fill="url(#rateGrad)" dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top telat */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 16 }}>Top Karyawan Telat (Bulan Ini)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topLate.map((emp, i) => (
              <div key={emp.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)', width: 14 }}>{i + 1}</div>
                <Avatar initials={emp.avatar} color={emp.color} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{emp.dept}</div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>{emp.count}×</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap bulan */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Heatmap Kehadiran — Agustus 2026</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 16 }}>Warna = tingkat kehadiran harian</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {heatmapData.map(d => {
            const alpha = (d.rate - 70) / 30
            return (
              <div key={d.day} title={`${d.day} Agu: ${d.rate}%`} style={{
                width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `rgba(37,99,235,${0.1 + alpha * 0.7})`,
                fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500,
                color: alpha > 0.5 ? '#fff' : 'var(--foreground)',
                cursor: 'default', transition: 'transform 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >{d.day}</div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 11, color: 'var(--muted-foreground)' }}>
          <span>Rendah</span>
          {[0.1, 0.25, 0.45, 0.65, 0.8].map(a => (
            <div key={a} style={{ width: 20, height: 12, borderRadius: 3, background: `rgba(37,99,235,${a})` }} />
          ))}
          <span>Tinggi</span>
        </div>
      </div>

      {/* Perlu perhatian */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 16 }}>⚠ Perlu Perhatian HR</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {perhatianData.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: p.severity === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${p.severity === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
              <Avatar initials={p.avatar} color={p.color} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>{p.dept} · {p.issue}</div>
              </div>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 12px' }}>Tindak Lanjut</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Riwayat ─────────────────────────────────────────────────────────────────

interface RiwayatRecord {
  name: string; dept: string; date: string; checkIn: string; checkOut: string
  status: string; berizin: boolean
  shift?: string; inLoc?: string; inDist?: number; outLoc?: string
  lateMins?: number; izinType?: string; izinApprover?: string
}

const riwayatData: RiwayatRecord[] = [
  { name: 'Rina Setiawati',    dept: 'Engineering', date: '12 Agu', checkIn: '08:02', checkOut: '17:05', status: 'hadir', berizin: false, shift: '08:00 – 17:00', inLoc: 'Office A', inDist: 12,  outLoc: 'Office A' },
  { name: 'Budi Santoso',      dept: 'Marketing',   date: '12 Agu', checkIn: '09:14', checkOut: '17:00', status: 'telat', berizin: true,  shift: '08:00 – 17:00', inLoc: 'Office A', inDist: 28,  outLoc: 'Office A', lateMins: 74, izinType: 'Izin Terlambat', izinApprover: 'Fajar Nugroho' },
  { name: 'Nadia Putri',       dept: 'Legal',        date: '12 Agu', checkIn: '—',     checkOut: '—',     status: 'alfa', berizin: false, shift: '08:00 – 17:00' },
  { name: 'Dita Permata',      dept: 'Finance',      date: '12 Agu', checkIn: '07:58', checkOut: '16:55', status: 'hadir', berizin: false, shift: '08:00 – 17:00', inLoc: 'Office B', inDist: 8,   outLoc: 'Office B' },
  { name: 'Fajar Nugroho',     dept: 'HR',           date: '12 Agu', checkIn: '—',     checkOut: '—',     status: 'izin', berizin: true,  shift: '08:00 – 17:00', izinType: 'Tidak Masuk', izinApprover: 'Admin' },
  { name: 'Lana Kusuma',       dept: 'Design',       date: '11 Agu', checkIn: '08:11', checkOut: '17:10', status: 'hadir', berizin: false, shift: '08:00 – 17:00', inLoc: 'Office A', inDist: 19,  outLoc: 'Office A' },
  { name: 'Marco Hendra',      dept: 'Engineering',  date: '11 Agu', checkIn: '09:32', checkOut: '17:00', status: 'telat', berizin: false, shift: '08:00 – 17:00', inLoc: 'Office A', inDist: 42,  outLoc: 'Office A', lateMins: 92 },
  { name: 'Rizky Firmansyah',  dept: 'Sales',        date: '11 Agu', checkIn: '07:55', checkOut: '17:20', status: 'hadir', berizin: false, shift: '08:00 – 17:00', inLoc: 'Office A', inDist: 6,   outLoc: 'Office A' },
]

const avatarColors: Record<string, string> = {
  'Rina Setiawati': '#2563eb', 'Budi Santoso': '#7c3aed', 'Nadia Putri': '#ef4444',
  'Dita Permata': '#0d9488', 'Fajar Nugroho': '#f59e0b', 'Lana Kusuma': '#ec4899',
  'Marco Hendra': '#06b6d4', 'Rizky Firmansyah': '#10b981',
}

function StatusBadge({ status, berizin }: { status: string; berizin?: boolean }) {
  const map: Record<string, string> = { hadir: 'badge-hadir', telat: 'badge-telat', izin: 'badge-izin', alfa: 'badge-alfa' }
  const labels: Record<string, string> = { hadir: 'Hadir', telat: 'Telat', izin: 'Izin', alfa: 'Alfa' }
  const dots: Record<string, string> = { hadir: '#10b981', telat: '#f59e0b', izin: '#3b82f6', alfa: '#ef4444' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span className={`mono ${map[status]}`} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: dots[status], display: 'inline-block' }} />
        {labels[status]}
      </span>
      {berizin && (
        <span className="mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>Berizin</span>
      )}
    </div>
  )
}

function AttendanceDetailModal({ record, onClose }: { record: RiwayatRecord; onClose: () => void }) {
  const color = avatarColors[record.name] ?? '#2563eb'
  const initials = record.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    hadir: { bg: 'rgba(16,185,129,0.12)', color: '#059669', label: 'HADIR' },
    telat:  { bg: 'rgba(245,158,11,0.12)', color: '#d97706', label: 'TELAT' },
    izin:   { bg: 'rgba(59,130,246,0.12)', color: '#2563eb', label: 'IZIN' },
    alfa:   { bg: 'rgba(239,68,68,0.12)', color: '#dc2626', label: 'ALFA' },
  }
  const sc = statusColors[record.status] ?? statusColors.hadir

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 18, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials={initials} color={color} size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>{record.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{record.dept} · {record.date} 2026</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Shift */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontWeight: 600, marginBottom: 4 }}>SHIFT</div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{record.shift ?? '—'}</div>
            </div>
            <div style={{ background: sc.bg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${sc.color}33` }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontWeight: 600, marginBottom: 4 }}>STATUS</div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: sc.color }}>{sc.label}</div>
              {record.lateMins && <div style={{ fontSize: 11, color: sc.color, marginTop: 2, fontFamily: 'Outfit' }}>Terlambat {record.lateMins} menit</div>}
            </div>
          </div>

          {/* Check-in / Check-out */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontWeight: 600, marginBottom: 8 }}>CHECK-IN</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: record.status === 'telat' ? '#d97706' : 'var(--foreground)' }}>{record.checkIn}</div>
              {record.inLoc && (
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
                  <div>📍 {record.inLoc}</div>
                  <div className="mono" style={{ marginTop: 2, color: record.inDist! > 200 ? '#dc2626' : '#10b981' }}>Jarak: {record.inDist}m</div>
                </div>
              )}
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontWeight: 600, marginBottom: 8 }}>CHECK-OUT</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>{record.checkOut}</div>
              {record.outLoc && (
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
                  <div>📍 {record.outLoc}</div>
                </div>
              )}
            </div>
          </div>

          {/* Permission */}
          {record.berizin && record.izinType && (
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontWeight: 600, marginBottom: 6 }}>PERMOHONAN</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: '#7c3aed' }}>{record.izinType}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.25)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>✓ Disetujui</span>
              </div>
              {record.izinApprover && <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4, fontFamily: 'Outfit' }}>oleh {record.izinApprover}</div>}
            </div>
          )}

          {/* Location history timeline */}
          {(record.checkIn !== '—' || record.checkOut !== '—') && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontWeight: 600, marginBottom: 10 }}>RIWAYAT LOKASI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  record.checkIn !== '—' && { time: record.checkIn, label: 'Check-in', loc: record.inLoc, dot: '#10b981' },
                  record.checkOut !== '—' && { time: record.checkOut, label: 'Check-out', loc: record.outLoc, dot: '#2563eb' },
                ].filter(Boolean).map((ev: any, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.dot, border: '2px solid var(--card)', boxShadow: `0 0 0 2px ${ev.dot}44`, flexShrink: 0, marginTop: 2 }} />
                      {i < arr.length - 1 && <div style={{ width: 2, height: 24, background: 'var(--border)', marginTop: 2 }} />}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? 12 : 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>{ev.time}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{ev.label}</span>
                      </div>
                      {ev.loc && <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>📍 {ev.loc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RiwayatTab() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [detailRecord, setDetailRecord] = useState<RiwayatRecord | null>(null)

  const filtered = riwayatData.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'semua' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <>
    {detailRecord && <AttendanceDetailModal record={detailRecord} onClose={() => setDetailRecord(null)} />}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: 'var(--muted)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / departemen..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['semua', 'hadir', 'telat', 'izin', 'alfa'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: filterStatus === s ? 'var(--primary)' : 'transparent', color: filterStatus === s ? '#fff' : 'var(--muted-foreground)', transition: 'all 0.15s', textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⬇</span> Export
        </button>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Karyawan', 'Tgl', 'Check In', 'Check Out', 'Status', 'Durasi', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2)
              const color = avatarColors[r.name] ?? '#2563eb'
              const dur = r.checkIn !== '—' && r.checkOut !== '—' ? '9j 03m' : '—'
              return (
                <tr key={i} onClick={() => setDetailRecord(r)} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={initials} color={color} size={30} />
                      <div>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{r.dept}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{r.date}</span></td>
                  <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 13, color: r.status === 'telat' ? '#f59e0b' : 'var(--foreground)' }}>{r.checkIn}</span></td>
                  <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 13, color: 'var(--foreground)' }}>{r.checkOut}</span></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} berizin={r.berizin} /></td>
                  <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{dur}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 11, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600, opacity: 0.6 }}>Detail →</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tidak ada data yang cocok.</div>
        )}
      </div>
    </div>
    </>
  )
}

// ─── GPS Monitor ─────────────────────────────────────────────────────────────

const onlineEmployees = [
  { name: 'Rina Setiawati', dept: 'Engineering', lat: -6.2088, lng: 106.8456, dist: 12, status: 'hadir', avatar: 'RS', color: '#2563eb' },
  { name: 'Dita Permata', dept: 'Finance', lat: -6.2095, lng: 106.8460, dist: 8, status: 'hadir', avatar: 'DP', color: '#0d9488' },
  { name: 'Budi Santoso', dept: 'Marketing', lat: -6.2102, lng: 106.8448, dist: 340, status: 'telat', avatar: 'BS', color: '#7c3aed' },
  { name: 'Lana Kusuma', dept: 'Design', lat: -6.2080, lng: 106.8462, dist: 25, status: 'hadir', avatar: 'LK', color: '#ec4899' },
]

function GpsTab() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="grid-side-left" style={{ '--side': '320px', '--gap': '18px', height: 'auto' } as CSSProperties}>
      {/* Employee list */}
      <div className="card" style={{ padding: '18px 16px', maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--foreground)', marginBottom: 6 }}>Karyawan Online ({onlineEmployees.length})</div>
        {onlineEmployees.map(emp => (
          <div key={emp.name} onClick={() => setSelected(emp.name === selected ? null : emp.name)} style={{ padding: '12px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${selected === emp.name ? 'var(--primary)' : 'var(--border)'}`, background: selected === emp.name ? 'rgba(37,99,235,0.06)' : 'transparent', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Avatar initials={emp.avatar} color={emp.color} size={32} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: '2px solid var(--card)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{emp.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{emp.dept}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: 11, color: emp.dist > 200 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{emp.dist}m</div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>dari kantor</div>
              </div>
            </div>
            {selected === emp.name && (
              <div className="slide-down" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                <div>Lat: {emp.lat.toFixed(4)}</div>
                <div>Lng: {emp.lng.toFixed(4)}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mock map */}
      <div className="card gps-map-cell" style={{ overflow: 'hidden', position: 'relative', background: 'var(--muted)', minHeight: 400 }}>
        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Office marker */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{ width: 180, height: 180, borderRadius: '50%', border: '2px dashed rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.05)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#2563eb', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(37,99,235,0.5)', position: 'relative', zIndex: 2 }} />
          <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'var(--primary)', whiteSpace: 'nowrap', background: 'var(--card)', padding: '2px 8px', borderRadius: 6 }}>Kantor Pusat</div>
        </div>

        {/* Employee dots */}
        {onlineEmployees.map((emp, i) => {
          const offsets = [[-60, -50], [70, -30], [-80, 70], [50, 60]]
          const [dx, dy] = offsets[i] ?? [0, 0]
          return (
            <div key={emp.name} style={{ position: 'absolute', top: `calc(50% + ${dy}px)`, left: `calc(50% + ${dx}px)`, transform: 'translate(-50%, -50%)', zIndex: 3 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: emp.dist > 200 ? '#ef4444' : '#10b981', border: '2px solid #fff', boxShadow: `0 2px 6px ${emp.dist > 200 ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}` }} />
              <div style={{ position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Outfit', fontSize: 10, fontWeight: 600, color: 'var(--foreground)', background: 'var(--card)', padding: '1px 6px', borderRadius: 4, border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{emp.name.split(' ')[0]}</div>
            </div>
          )
        })}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 14, fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Dalam radius
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> Di luar radius
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px dashed rgba(37,99,235,0.4)' }} /> Radius kantor (200m)
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AbsensiPage() {
  const [tab, setTab] = useState<'ringkasan' | 'riwayat' | 'gps'>('ringkasan')

  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'riwayat', label: 'Riwayat' },
    { id: 'gps', label: 'Monitor GPS' },
  ] as const

  return (
    <div>
      <div className="tab-bar-scroll" style={{ marginBottom: 24, background: 'var(--muted)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      {tab === 'ringkasan' && <RingkasanTab />}
      {tab === 'riwayat' && <RiwayatTab />}
      {tab === 'gps' && <GpsTab />}
    </div>
  )
}
