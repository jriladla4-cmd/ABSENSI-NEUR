'use client'

import { useState, type CSSProperties } from 'react'
import ModalOverlay from '@/components/ModalOverlay'

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 3, background: `${color}22`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

const allEmployees = [
  { id: 1, name: 'Rina Setiawati', dept: 'Engineering', jabatan: 'Senior Frontend Dev', status: 'active', join: '14 Mar 2022', email: 'rina@hadir.id', phone: '081234567890', avatar: 'RS', color: '#2563eb', role: 'employee' },
  { id: 2, name: 'Budi Santoso', dept: 'Marketing', jabatan: 'Marketing Manager', status: 'active', join: '02 Jan 2021', email: 'budi@hadir.id', phone: '081234567891', avatar: 'BS', color: '#7c3aed', role: 'admin' },
  { id: 3, name: 'Dita Permata', dept: 'Finance', jabatan: 'Finance Analyst', status: 'active', join: '07 Jun 2023', email: 'dita@hadir.id', phone: '081234567892', avatar: 'DP', color: '#0d9488', role: 'employee' },
  { id: 4, name: 'Fajar Nugroho', dept: 'HR', jabatan: 'HR Specialist', status: 'active', join: '20 Sep 2020', email: 'fajar@hadir.id', phone: '081234567893', avatar: 'FN', color: '#f59e0b', role: 'admin' },
  { id: 5, name: 'Lana Kusuma', dept: 'Design', jabatan: 'UI/UX Designer', status: 'active', join: '11 Apr 2023', email: 'lana@hadir.id', phone: '081234567894', avatar: 'LK', color: '#ec4899', role: 'employee' },
  { id: 6, name: 'Marco Hendra', dept: 'Engineering', jabatan: 'Backend Engineer', status: 'active', join: '05 Feb 2022', email: 'marco@hadir.id', phone: '081234567895', avatar: 'MH', color: '#06b6d4', role: 'employee' },
  { id: 7, name: 'Nadia Putri', dept: 'Legal', jabatan: 'Legal Counsel', status: 'inactive', join: '18 Nov 2021', email: 'nadia@hadir.id', phone: '081234567896', avatar: 'NP', color: '#ef4444', role: 'employee' },
  { id: 8, name: 'Rizky Firmansyah', dept: 'Sales', jabatan: 'Account Executive', status: 'active', join: '30 Aug 2022', email: 'rizky@hadir.id', phone: '081234567897', avatar: 'RF', color: '#10b981', role: 'employee' },
  { id: 9, name: 'Yuli Andini', dept: 'Sales', jabatan: 'Sales Manager', status: 'active', join: '12 May 2020', email: 'yuli@hadir.id', phone: '081234567898', avatar: 'YA', color: '#f97316', role: 'admin' },
  { id: 10, name: 'Doni Pratama', dept: 'Finance', jabatan: 'CFO', status: 'active', join: '01 Jan 2019', email: 'doni@hadir.id', phone: '081234567899', avatar: 'DP2', color: '#6366f1', role: 'admin' },
]

const depts = ['Semua', 'Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Legal', 'Sales']

// ─── Employee 360° Detail Modal ───────────────────────────────────────────────

const empAttendance: Record<number, { hadir: number; telat: number; sakit: number; izin: number; alfa: number }> = {
  1: { hadir: 20, telat: 1, sakit: 0, izin: 1, alfa: 0 },
  2: { hadir: 17, telat: 5, sakit: 1, izin: 0, alfa: 0 },
  3: { hadir: 21, telat: 0, sakit: 0, izin: 0, alfa: 1 },
  4: { hadir: 19, telat: 2, sakit: 0, izin: 1, alfa: 0 },
  5: { hadir: 20, telat: 0, sakit: 1, izin: 1, alfa: 0 },
  6: { hadir: 15, telat: 7, sakit: 0, izin: 0, alfa: 0 },
  7: { hadir: 10, telat: 2, sakit: 3, izin: 5, alfa: 3 },
  8: { hadir: 22, telat: 0, sakit: 0, izin: 0, alfa: 0 },
  9: { hadir: 20, telat: 1, sakit: 0, izin: 1, alfa: 0 },
  10: { hadir: 21, telat: 0, sakit: 0, izin: 1, alfa: 0 },
}

const empRequests: Record<number, { pending: number; approved: number; rejected: number }> = {
  1: { pending: 0, approved: 5, rejected: 1 },
  2: { pending: 1, approved: 8, rejected: 0 },
  3: { pending: 0, approved: 2, rejected: 0 },
  4: { pending: 1, approved: 6, rejected: 1 },
  5: { pending: 0, approved: 3, rejected: 0 },
  6: { pending: 1, approved: 4, rejected: 2 },
  7: { pending: 0, approved: 8, rejected: 0 },
  8: { pending: 0, approved: 3, rejected: 0 },
  9: { pending: 0, approved: 5, rejected: 0 },
  10: { pending: 0, approved: 4, rejected: 0 },
}

const empDocs: Record<number, { type: string; status: string; exp?: string }[]> = {
  1: [{ type: 'KTP', status: 'Lengkap' }, { type: 'NPWP', status: 'Lengkap' }, { type: 'Kontrak Kerja', status: 'Lengkap', exp: '14 Mar 2025' }],
  2: [{ type: 'KTP', status: 'Lengkap' }, { type: 'KK', status: 'Lengkap' }, { type: 'Kontrak Kerja', status: 'Lengkap', exp: '02 Jan 2024' }, { type: 'NPWP', status: 'Belum Ada' }],
  6: [{ type: 'KTP', status: 'Lengkap' }, { type: 'Kontrak Kerja', status: 'Expire', exp: '05 Feb 2024' }],
}

function Employee360Modal({ emp, onClose }: { emp: typeof allEmployees[0]; onClose: () => void }) {
  const [tab360, setTab360] = useState<'overview' | 'attendance' | 'requests' | 'documents' | 'org'>('overview')
  const att = empAttendance[emp.id] ?? { hadir: 20, telat: 0, sakit: 0, izin: 0, alfa: 0 }
  const req = empRequests[emp.id] ?? { pending: 0, approved: 0, rejected: 0 }
  const docs = empDocs[emp.id] ?? [
    { type: 'KTP', status: 'Lengkap' },
    { type: 'Kontrak Kerja', status: 'Lengkap', exp: emp.join.replace(/\d{2} /, '').replace('20', '20') },
  ]

  const total = att.hadir + att.telat + att.sakit + att.izin + att.alfa || 1

  return (
    <ModalOverlay onClose={onClose}>
      <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <Avatar initials={emp.avatar} color={emp.color} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>{emp.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{emp.jabatan} · {emp.dept}</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontFamily: 'JetBrains Mono', fontWeight: 500, background: emp.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: emp.status === 'active' ? '#059669' : '#dc2626', border: `1px solid ${emp.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{emp.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, fontFamily: 'JetBrains Mono', fontWeight: 500, background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.2)' }}>{emp.role}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Tab bar */}
        <div className="tab-bar-scroll" style={{ padding: '10px 24px 0', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'attendance', label: 'Kehadiran' },
            { id: 'requests', label: 'Permohonan' },
            { id: 'documents', label: 'Dokumen' },
            { id: 'org', label: 'Organisasi' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab360(t.id)} style={{ padding: '8px 16px', border: 'none', borderBottom: tab360 === t.id ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: tab360 === t.id ? 'var(--primary)' : 'var(--muted-foreground)', transition: 'color 0.15s', whiteSpace: 'nowrap' }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {tab360 === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Email', value: emp.email, icon: '📧' },
                { label: 'No. Telepon', value: emp.phone, icon: '📱' },
                { label: 'Departemen', value: emp.dept, icon: '🏢' },
                { label: 'Jabatan', value: emp.jabatan, icon: '💼' },
                { label: 'Bergabung', value: emp.join, icon: '📅' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--muted)', borderRadius: 10 }}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--foreground)', fontFamily: 'Outfit', fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-primary" style={{ flex: 1 }}>✏ Edit Profil</button>
                <button className="btn-ghost" style={{ color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }}>Nonaktifkan</button>
              </div>
            </div>
          )}

          {tab360 === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Rekap Agustus 2026 ({total} hari kerja)</div>
              <div className="grid-stat-5" style={{ '--gap': '10px' } as CSSProperties}>
                {[
                  { label: 'Hadir', value: att.hadir, color: '#10b981' },
                  { label: 'Telat', value: att.telat, color: '#f59e0b' },
                  { label: 'Sakit', value: att.sakit, color: '#ef4444' },
                  { label: 'Izin', value: att.izin, color: '#3b82f6' },
                  { label: 'Alfa', value: att.alfa, color: '#6b7280' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--muted)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', marginTop: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: s.color, marginTop: 2 }}>{Math.round((s.value / total) * 100)}%</div>
                  </div>
                ))}
              </div>
              {/* Mini bar chart */}
              <div style={{ background: 'var(--muted)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', marginBottom: 10 }}>DISTRIBUSI KEHADIRAN</div>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
                  {[
                    { val: att.hadir, color: '#10b981' },
                    { val: att.telat, color: '#f59e0b' },
                    { val: att.sakit, color: '#ef4444' },
                    { val: att.izin, color: '#3b82f6' },
                    { val: att.alfa, color: '#6b7280' },
                  ].filter(s => s.val > 0).map((s, i) => (
                    <div key={i} style={{ flex: s.val, background: s.color, borderRadius: 2 }} />
                  ))}
                </div>
              </div>
              {att.telat > 3 && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: '#d97706', fontFamily: 'Outfit' }}>
                  ⚠ {emp.name.split(' ')[0]} telat {att.telat}× bulan ini — di atas rata-rata tim
                </div>
              )}
            </div>
          )}

          {tab360 === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-stat-3" style={{ '--gap': '10px' } as CSSProperties}>
                {[
                  { label: 'Pending', value: req.pending, color: '#f59e0b' },
                  { label: 'Disetujui', value: req.approved, color: '#10b981' },
                  { label: 'Ditolak', value: req.rejected, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--muted)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', padding: '12px 14px', background: 'var(--muted)', borderRadius: 10 }}>
                Total {req.pending + req.approved + req.rejected} permohonan — approval rate {req.approved + req.rejected > 0 ? Math.round((req.approved / (req.approved + req.rejected)) * 100) : 100}%
              </div>
            </div>
          )}

          {tab360 === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['KTP', 'KK', 'NPWP', 'Kontrak Kerja', 'Surat Dokter', 'Sertifikat'] as const).map(docType => {
                const found = docs.find(d => d.type === docType)
                return (
                  <div key={docType} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--muted)', borderRadius: 10, border: found?.status === 'Expire' ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent' }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{docType}</div>
                      {found?.exp && <div style={{ fontSize: 11, color: found.status === 'Expire' ? '#dc2626' : 'var(--muted-foreground)', marginTop: 1, fontFamily: 'JetBrains Mono' }}>Exp: {found.exp}</div>}
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, fontFamily: 'JetBrains Mono', fontWeight: 600, background: found ? (found.status === 'Expire' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)') : 'rgba(107,114,128,0.1)', color: found ? (found.status === 'Expire' ? '#dc2626' : '#059669') : '#6b7280', border: `1px solid ${found ? (found.status === 'Expire' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)') : 'rgba(107,114,128,0.2)'}` }}>
                      {found ? found.status : 'Belum Ada'}
                    </span>
                  </div>
                )
              })}
              <button className="btn-ghost" style={{ marginTop: 4 }}>📎 Upload Dokumen</button>
            </div>
          )}

          {tab360 === 'org' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Departemen', value: emp.dept },
                { label: 'Jabatan', value: emp.jabatan },
                { label: 'Role Sistem', value: emp.role },
                { label: 'Shift', value: 'Shift Normal (08:00 – 17:00)' },
                { label: 'Kantor', value: 'Kantor Pusat Jakarta' },
                { label: 'Manager', value: emp.dept === 'Engineering' ? 'Marco Hendra' : emp.dept === 'Sales' ? 'Yuli Andini' : 'Fajar Nugroho' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--muted)', borderRadius: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--foreground)', fontFamily: 'Outfit', fontWeight: 700 }}>{f.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  )
}

// ─── Data Karyawan Tab ────────────────────────────────────────────────────────

function DataKaryawanTab() {
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('Semua')
  const [showModal, setShowModal] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState<typeof allEmployees[0] | null>(null)

  const filtered = allEmployees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.jabatan.toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'Semua' || e.dept === dept
    return matchSearch && matchDept
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'var(--muted)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 14 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / jabatan..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--foreground)', width: '100%', fontFamily: 'Inter' }} />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'Outfit', fontSize: 13, cursor: 'pointer' }}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
        <button className="btn-primary" onClick={() => { setSelectedEmp(null); setShowModal(true) }}>+ Tambah Karyawan</button>
      </div>

      {/* Grid cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {filtered.map(emp => (
          <div key={emp.id} className="card" style={{ padding: '18px 18px', cursor: 'pointer' }} onClick={() => { setSelectedEmp(emp); setShowModal(true) }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <Avatar initials={emp.avatar} color={emp.color} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{emp.jabatan}</div>
              </div>
              <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 99, fontFamily: 'JetBrains Mono', fontWeight: 500, background: emp.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: emp.status === 'active' ? '#059669' : '#dc2626', border: `1px solid ${emp.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{emp.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted-foreground)' }}>
                <span>🏢</span> {emp.dept}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted-foreground)' }}>
                <span>📧</span> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--muted-foreground)' }}>
                <span>📅</span> Bergabung {emp.join}
              </div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', padding: '2px 8px', borderRadius: 6, background: emp.role === 'admin' ? 'rgba(124,58,237,0.1)' : 'rgba(37,99,235,0.1)', color: emp.role === 'admin' ? '#7c3aed' : '#2563eb', border: `1px solid ${emp.role === 'admin' ? 'rgba(124,58,237,0.2)' : 'rgba(37,99,235,0.2)'}` }}>{emp.role}</span>
              <span style={{ fontSize: 11, color: 'var(--primary)', fontFamily: 'Outfit', fontWeight: 600 }}>Lihat →</span>
            </div>
          </div>
        ))}
      </div>

      {/* 360° Employee Detail Modal */}
      {showModal && selectedEmp && (
        <Employee360Modal emp={selectedEmp} onClose={() => setShowModal(false)} />
      )}
      {/* Add Employee Modal */}
      {showModal && !selectedEmp && (
        <ModalOverlay onClose={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} className="modal-panel" style={{ padding: '28px', width: 440, maxWidth: '95vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>Tambah Karyawan</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted-foreground)' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nama Lengkap', placeholder: 'Nama lengkap karyawan' },
                { label: 'Email', placeholder: 'email@perusahaan.com' },
                { label: 'Jabatan', placeholder: 'Jabatan / posisi' },
                { label: 'No. Telepon', placeholder: '08xxxxxxxx' },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                  <input placeholder={field.placeholder} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button className="btn-primary" style={{ marginTop: 6 }} onClick={() => setShowModal(false)}>+ Tambah Karyawan</button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}

// ─── Organisasi Tab ───────────────────────────────────────────────────────────

const orgData = [
  {
    dept: 'Engineering', head: 'Marco Hendra', color: '#2563eb',
    members: ['Rina Setiawati', 'Doni Backend', 'Sari QA'],
  },
  {
    dept: 'Marketing', head: 'Budi Santoso', color: '#7c3aed',
    members: ['Tina Content', 'Adi Social Media'],
  },
  {
    dept: 'Finance', head: 'Doni Pratama', color: '#6366f1',
    members: ['Dita Permata', 'Ega Accounting'],
  },
  {
    dept: 'Design', head: 'Lana Kusuma', color: '#ec4899',
    members: ['Reno Graphic', 'Ika Motion'],
  },
  {
    dept: 'Sales', head: 'Yuli Andini', color: '#f97316',
    members: ['Rizky Firmansyah', 'Nita AE', 'Hafiz BD'],
  },
  {
    dept: 'HR', head: 'Fajar Nugroho', color: '#f59e0b',
    members: ['Siti Recruit', 'Andi Payroll'],
  },
]

function OrganisasiTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {orgData.map(dept => (
          <div key={dept.dept} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 8, height: 32, borderRadius: 4, background: dept.color }} />
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>{dept.dept}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Kepala: {dept.head}</div>
              </div>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 99, background: `${dept.color}15`, color: dept.color, border: `1px solid ${dept.color}30` }}>{dept.members.length + 1} org</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Head */}
              <div style={{ padding: '8px 10px', borderRadius: 8, background: `${dept.color}10`, border: `1px solid ${dept.color}25`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: dept.color }} />
                <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{dept.head}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'JetBrains Mono', color: dept.color }}>Kepala</span>
              </div>
              {dept.members.map(m => (
                <div key={m} style={{ padding: '7px 10px 7px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontSize: 13, fontFamily: 'Outfit' }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted-foreground)', flexShrink: 0 }} />
                  {m}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Status Tab ───────────────────────────────────────────────────────────────

function StatusTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Karyawan Aktif', value: 9, color: '#10b981', icon: '✓' },
          { label: 'Karyawan Nonaktif', value: 1, color: '#ef4444', icon: '✕' },
          { label: 'Kontrak Hampir Habis', value: 2, color: '#f59e0b', icon: '📋' },
          { label: 'Karyawan Baru (30 hr)', value: 1, color: '#2563eb', icon: '✨' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 30, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Status Kepegawaian</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Karyawan', 'Tipe Kontrak', 'Mulai', 'Berakhir', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allEmployees.slice(0, 8).map((emp, i) => {
              const types = ['Tetap', 'Tetap', 'PKWT', 'Tetap', 'PKWT', 'Tetap', 'PKWT', 'Tetap']
              const ends = ['—', '—', 'Agu 2027', '—', 'Sep 2026', '—', 'Okt 2026', '—']
              return (
                <tr key={emp.id} style={{ borderBottom: i < 7 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={emp.avatar} color={emp.color} size={28} />
                      <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 12, color: 'var(--foreground)' }}>{types[i]}</span></td>
                  <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{emp.join}</span></td>
                  <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 12, color: ends[i] !== '—' && ends[i].includes('Sep') ? '#f59e0b' : 'var(--muted-foreground)' }}>{ends[i]}</span></td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, fontFamily: 'JetBrains Mono', background: emp.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: emp.status === 'active' ? '#059669' : '#dc2626', border: `1px solid ${emp.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{emp.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Dokumen Tab ──────────────────────────────────────────────────────────────

const dokumenList = [
  { name: 'Rina Setiawati', type: 'Kontrak Kerja', date: '14 Mar 2022', size: '245 KB', avatar: 'RS', color: '#2563eb' },
  { name: 'Budi Santoso', type: 'NDA', date: '02 Jan 2021', size: '128 KB', avatar: 'BS', color: '#7c3aed' },
  { name: 'Dita Permata', type: 'Kontrak Kerja', date: '07 Jun 2023', size: '230 KB', avatar: 'DP', color: '#0d9488' },
  { name: 'Fajar Nugroho', type: 'Surat Pengangkatan', date: '20 Sep 2020', size: '185 KB', avatar: 'FN', color: '#f59e0b' },
  { name: 'Lana Kusuma', type: 'PKWT', date: '11 Apr 2023', size: '310 KB', avatar: 'LK', color: '#ec4899' },
  { name: 'Marco Hendra', type: 'Kontrak Kerja', date: '05 Feb 2022', size: '252 KB', avatar: 'MH', color: '#06b6d4' },
]

function DokumenTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Dokumen & Kontrak Karyawan</div>
        <button className="btn-primary">+ Upload Dokumen</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {dokumenList.map((doc, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 48, borderRadius: 8, background: `${doc.color}15`, border: `1.5px solid ${doc.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{doc.type}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{doc.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{doc.date}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{doc.size}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <button className="btn-ghost" style={{ fontSize: 11, padding: '3px 10px', flex: 1 }}>⬇ Unduh</button>
                <button className="btn-ghost" style={{ fontSize: 11, padding: '3px 10px', color: '#dc2626', borderColor: 'rgba(239,68,68,0.25)' }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KaryawanPage() {
  const [tab, setTab] = useState<'data' | 'organisasi' | 'status' | 'dokumen'>('data')

  const tabs = [
    { id: 'data', label: 'Data Karyawan' },
    { id: 'organisasi', label: 'Organisasi' },
    { id: 'status', label: 'Status' },
    { id: 'dokumen', label: 'Dokumen & Kontrak' },
  ] as const

  return (
    <div>
      <div className="tab-bar-scroll" style={{ marginBottom: 24, background: 'var(--muted)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      {tab === 'data' && <DataKaryawanTab />}
      {tab === 'organisasi' && <OrganisasiTab />}
      {tab === 'status' && <StatusTab />}
      {tab === 'dokumen' && <DokumenTab />}
    </div>
  )
}
