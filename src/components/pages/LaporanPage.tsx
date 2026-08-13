'use client'

import { useState, type CSSProperties } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
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
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 500, color: 'var(--foreground)' }}>{p.value}{p.name.includes('Rate') || p.name.includes('%') ? '%' : ''}</span>
        </div>
      ))}
    </div>
  )
}

const monthlyAbsensi = [
  { bulan: 'Mar', hadir: 85, telat: 9, izin: 4, alfa: 2 },
  { bulan: 'Apr', hadir: 88, telat: 7, izin: 5, alfa: 0 },
  { bulan: 'Mei', hadir: 82, telat: 11, izin: 6, alfa: 1 },
  { bulan: 'Jun', hadir: 90, telat: 6, izin: 3, alfa: 1 },
  { bulan: 'Jul', hadir: 87, telat: 8, izin: 4, alfa: 1 },
  { bulan: 'Agu', hadir: 87, telat: 8, izin: 4, alfa: 1 },
]

const lembur = [
  { bulan: 'Mar', jam: 124 }, { bulan: 'Apr', jam: 98 },
  { bulan: 'Mei', jam: 145 }, { bulan: 'Jun', jam: 87 },
  { bulan: 'Jul', jam: 112 }, { bulan: 'Agu', jam: 76 },
]

const pieData = [
  { name: 'Hadir', value: 87, color: '#10b981' },
  { name: 'Telat', value: 8, color: '#f59e0b' },
  { name: 'Izin', value: 4, color: '#3b82f6' },
  { name: 'Alfa', value: 1, color: '#ef4444' },
]

const permohonanStats = [
  { bulan: 'Mar', izin: 12, cuti: 5, sakit: 8, wfh: 14 },
  { bulan: 'Apr', izin: 9, cuti: 8, sakit: 5, wfh: 18 },
  { bulan: 'Mei', izin: 15, cuti: 12, sakit: 7, wfh: 22 },
  { bulan: 'Jun', izin: 8, cuti: 6, sakit: 4, wfh: 20 },
  { bulan: 'Jul', izin: 11, cuti: 9, sakit: 6, wfh: 17 },
  { bulan: 'Agu', izin: 7, cuti: 4, sakit: 3, wfh: 15 },
]

const deptAbsensi = [
  { dept: 'Engineering', rate: 92 },
  { dept: 'Finance', rate: 90 },
  { dept: 'HR', rate: 95 },
  { dept: 'Design', rate: 88 },
  { dept: 'Sales', rate: 81 },
  { dept: 'Marketing', rate: 84 },
  { dept: 'Legal', rate: 86 },
]

export default function LaporanPage() {
  const [period, setPeriod] = useState('6 bulan')
  const [dept, setDept] = useState('Semua Dept')
  const [employee, setEmployee] = useState('Semua Karyawan')
  const [statusFilter, setStatusFilter] = useState('Semua Status')

  const exportAs = (format: string) => {
    alert(`Ekspor sebagai ${format} — fitur ini akan mengunduh laporan dengan filter:\nPeriode: ${period} | Dept: ${dept} | Karyawan: ${employee} | Status: ${statusFilter}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}>Laporan & Analitik</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Data rekap operasional HR perusahaan</div>
        </div>
        {/* Export buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['Excel', 'CSV', 'PDF'].map(fmt => (
            <button key={fmt} onClick={() => exportAs(fmt)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <span>{fmt === 'PDF' ? '📄' : fmt === 'Excel' ? '📊' : '📋'}</span> {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', fontWeight: 600, marginBottom: 12, letterSpacing: '0.05em' }}>FILTER LAPORAN</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Periode */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600, marginBottom: 6 }}>Periode</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1 bulan', '3 bulan', '6 bulan', '1 tahun'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: period === p ? 'var(--primary)' : 'transparent', color: period === p ? '#fff' : 'var(--muted-foreground)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{ width: 1, height: 36, background: 'var(--border)' }} />

          {/* Departemen */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600, marginBottom: 6 }}>Departemen</div>
            <select value={dept} onChange={e => setDept(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Outfit', fontSize: 12, cursor: 'pointer' }}>
              {['Semua Dept', 'Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Legal', 'Sales'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Karyawan */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600, marginBottom: 6 }}>Karyawan</div>
            <select value={employee} onChange={e => setEmployee(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Outfit', fontSize: 12, cursor: 'pointer' }}>
              {['Semua Karyawan', 'Rina Setiawati', 'Budi Santoso', 'Marco Hendra', 'Nadia Putri', 'Lana Kusuma', 'Rizky Firmansyah'].map(e => <option key={e}>{e}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600, marginBottom: 6 }}>Status</div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Outfit', fontSize: 12, cursor: 'pointer' }}>
              {['Semua Status', 'Hadir', 'Telat', 'Izin', 'Sakit', 'Alfa'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-primary" style={{ fontSize: 12 }}>🔍 Terapkan Filter</button>
          </div>
        </div>

        {/* Active filter summary */}
        {(dept !== 'Semua Dept' || employee !== 'Semua Karyawan' || statusFilter !== 'Semua Status') && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Filter aktif:</span>
            {[dept !== 'Semua Dept' && dept, employee !== 'Semua Karyawan' && employee, statusFilter !== 'Semua Status' && statusFilter].filter(Boolean).map(f => (
              <span key={f as string} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.2)', fontFamily: 'Outfit', fontWeight: 600 }}>{f as string}</span>
            ))}
            <button onClick={() => { setDept('Semua Dept'); setEmployee('Semua Karyawan'); setStatusFilter('Semua Status') }} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600 }}>× Reset</button>
          </div>
        )}
      </div>

      {/* Attendance Summary block */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Rekap Kehadiran</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Periode: {period} · Dept: {dept}</div>
          </div>
        </div>
        <div className="grid-stat-5" style={{ '--gap': '12px' } as CSSProperties}>
          {[
            { label: 'Hadir', value: 420, color: '#10b981' },
            { label: 'Telat', value: 31, color: '#f59e0b' },
            { label: 'Sakit', value: 8, color: '#ef4444' },
            { label: 'Izin', value: 14, color: '#3b82f6' },
            { label: 'Alfa', value: 3, color: '#6b7280' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: s.color, marginTop: 2 }}>{Math.round((s.value / 476) * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Rata-rata Kehadiran', value: '86.5%', delta: '+1.2%', color: '#10b981' },
          { label: 'Total Lembur', value: '642 jam', delta: 'Semester ini', color: '#2563eb' },
          { label: 'Total Permohonan', value: '287', delta: '6 bulan terakhir', color: '#7c3aed' },
          { label: 'WFH Disetujui', value: '106', delta: '37% dari total', color: '#0d9488' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid-side-right" style={{ '--side': '280px', '--gap': '18px' } as CSSProperties}>
        {/* Monthly absensi bar */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Rekap Absensi Bulanan</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 16 }}>Jumlah hari per status per bulan</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyAbsensi} barSize={12} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="telat" name="Telat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izin" name="Izin" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="alfa" name="Alfa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Distribusi Status</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 4 }}>Rata-rata bulan ini</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value" strokeWidth={0}>
                {pieData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} orang`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--muted-foreground)', flex: 1 }}>{p.name}</span>
                <span className="mono" style={{ fontWeight: 600, color: 'var(--foreground)' }}>{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permohonan trend */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Tren Permohonan</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 16 }}>Jumlah pengajuan per jenis per bulan</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={permohonanStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="bulan" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="izin" name="Izin" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
            <Line type="monotone" dataKey="cuti" name="Cuti" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3, fill: '#7c3aed' }} />
            <Line type="monotone" dataKey="sakit" name="Sakit" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
            <Line type="monotone" dataKey="wfh" name="WFH" stroke="#0d9488" strokeWidth={2} dot={{ r: 3, fill: '#0d9488' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dept kehadiran + Lembur side */}
      <div className="grid-2" style={{ '--gap': '18px' } as CSSProperties}>
        {/* Dept bar */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Kehadiran per Departemen</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 16 }}>Rata-rata bulan ini (%)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={deptAbsensi} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[70, 100]} tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="dept" tick={{ fontFamily: 'Outfit', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" name="Rate %" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Lembur */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)', marginBottom: 4 }}>Total Jam Lembur</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 16 }}>Keseluruhan karyawan per bulan</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={lembur} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="bulan" tick={{ fontFamily: 'JetBrains Mono', fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="jam" name="Jam Lembur" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
