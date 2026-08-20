'use client'

import { useState, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { useOffices } from '@/hooks/useOffices'
import type { OfficeLocation } from '@/lib/officeStore'

const GeoMap = dynamic(() => import('@/components/GeoMap'), { ssr: false })

// ─── Lokasi Kantor ────────────────────────────────────────────────────────────

type OfficeForm = {
  name: string
  address: string
  lat: string
  lng: string
  radiusM: number
  active: boolean
}

const emptyForm = (): OfficeForm => ({
  name: '',
  address: '',
  lat: '',
  lng: '',
  radiusM: 200,
  active: true,
})

function officeToForm(o: OfficeLocation): OfficeForm {
  return {
    name: o.name,
    address: o.address,
    lat: String(o.lat),
    lng: String(o.lng),
    radiusM: o.radiusM,
    active: o.active,
  }
}

function KantorTab() {
  const { offices, setOffices, activeOffices, primary } = useOffices()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState<OfficeForm>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)
  const [geocodeBusy, setGeocodeBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showForm = isCreating || editingId != null

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2500)
  }

  const openCreate = () => {
    setEditingId(null)
    setIsCreating(true)
    setForm(emptyForm())
    setFormError(null)
  }

  const openEdit = (office: OfficeLocation) => {
    setIsCreating(false)
    setEditingId(office.id)
    setForm(officeToForm(office))
    setFormError(null)
  }

  const closeForm = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormError(null)
  }

  const saveForm = () => {
    const lat = Number(form.lat)
    const lng = Number(form.lng)
    if (!form.name.trim()) {
      setFormError('Nama kantor wajib diisi.')
      return
    }
    if (!form.address.trim()) {
      setFormError('Alamat wajib diisi.')
      return
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setFormError('Latitude / longitude tidak valid. Pakai "Cari koordinat" atau isi manual.')
      return
    }

    const payload: OfficeLocation = {
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      address: form.address.trim(),
      lat,
      lng,
      radiusM: form.radiusM,
      active: form.active,
    }

    if (isCreating) {
      setOffices((prev) => [...prev, payload])
      flash(`Lokasi "${payload.name}" ditambahkan.`)
    } else {
      setOffices((prev) => prev.map((o) => (o.id === editingId ? payload : o)))
      flash(`Lokasi "${payload.name}" diperbarui.`)
    }
    closeForm()
  }

  const removeOffice = (id: number) => {
    if (offices.length <= 1) {
      setFormError('Minimal satu lokasi kantor harus ada.')
      flash('Minimal satu lokasi kantor harus ada.')
      return
    }
    const name = offices.find((o) => o.id === id)?.name ?? 'Kantor'
    setOffices((prev) => prev.filter((o) => o.id !== id))
    if (editingId === id) closeForm()
    flash(`"${name}" dihapus.`)
  }

  const toggleActive = (id: number) => {
    setOffices((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o)),
    )
  }

  const geocodeAddress = async () => {
    if (!form.address.trim()) {
      setFormError('Isi alamat dulu, lalu cari koordinat.')
      return
    }
    setGeocodeBusy(true)
    setFormError(null)
    try {
      const q = encodeURIComponent(form.address.trim())
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { Accept: 'application/json' } },
      )
      const data = (await res.json()) as Array<{ lat: string; lon: string }>
      if (!data?.[0]) {
        setFormError('Alamat tidak ditemukan. Isi lat/lng manual.')
        return
      }
      setForm((f) => ({
        ...f,
        lat: Number(data[0].lat).toFixed(5),
        lng: Number(data[0].lon).toFixed(5),
      }))
    } catch {
      setFormError('Gagal mencari koordinat. Coba lagi atau isi manual.')
    } finally {
      setGeocodeBusy(false)
    }
  }

  const previewLat = Number(form.lat)
  const previewLng = Number(form.lng)
  const hasPreview = Number.isFinite(previewLat) && Number.isFinite(previewLng)

  const overviewSites = activeOffices.map((o) => ({
    id: o.id,
    lat: o.lat,
    lng: o.lng,
    name: o.name,
    radiusM: o.radiusM,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 80,
            background: 'var(--foreground)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 12,
            fontFamily: 'Outfit',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            maxWidth: 320,
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>
            Lokasi Kantor & Geofence
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Bisa banyak kantor. Semua yang <strong style={{ color: 'var(--foreground)' }}>Aktif</strong> dipakai absensi karyawan
            ({activeOffices.length} aktif dari {offices.length} lokasi).
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={openCreate}>+ Tambah Lokasi</button>
      </div>

      {activeOffices.length > 0 && !showForm && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>
            Peta semua kantor aktif
          </div>
          <GeoMap
            height={240}
            showOffice
            showGeofence
            sites={overviewSites}
            officeLat={primary.lat}
            officeLng={primary.lng}
            officeName={primary.name}
            radiusM={primary.radiusM}
            focusLat={primary.lat}
            focusLng={primary.lng}
            zoom={activeOffices.length > 1 ? 11 : 16}
          />
        </div>
      )}

      {showForm && (
        <div className="card slide-down" style={{ padding: '20px 22px', border: '1.5px solid var(--primary)' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--primary)', marginBottom: 16 }}>
            {isCreating ? 'Tambah Lokasi Kantor Baru' : 'Edit Lokasi Kantor'}
          </div>
          <div className="grid-2" style={{ '--gap': '14px' } as CSSProperties}>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Nama Kantor</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="cth: Kantor Cabang Kemanggisan"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Status</label>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {form.active ? 'Aktif (bisa dipakai absensi)' : 'Nonaktif'}
              </button>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Alamat Lengkap</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                placeholder="Jl. ..., RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
              <button
                type="button"
                className="btn-ghost"
                disabled={geocodeBusy}
                onClick={geocodeAddress}
                style={{ marginTop: 8, fontSize: 12, opacity: geocodeBusy ? 0.6 : 1 }}
              >
                {geocodeBusy ? 'Mencari…' : 'Cari koordinat dari alamat'}
              </button>
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Latitude</label>
              <input
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                placeholder="-6.18153"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Longitude</label>
              <input
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                placeholder="106.80283"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 5 }}>Radius Geofence (meter)</label>
            <input
              type="range"
              min={50}
              max={500}
              value={form.radiusM}
              onChange={(e) => setForm((f) => ({ ...f, radiusM: Number(e.target.value) }))}
              style={{ width: '100%' }}
            />
            <div className="mono" style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>{form.radiusM} meter</div>
          </div>

          {hasPreview && (
            <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <GeoMap
                height={200}
                showOffice
                showGeofence
                officeLat={previewLat}
                officeLng={previewLng}
                officeName={form.name || 'Kantor'}
                radiusM={form.radiusM}
                focusLat={previewLat}
                focusLng={previewLng}
                zoom={16}
              />
            </div>
          )}

          {formError && (
            <div style={{ marginTop: 12, fontSize: 12, color: '#dc2626' }}>{formError}</div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" className="btn-primary" onClick={saveForm}>Simpan Lokasi</button>
            <button type="button" className="btn-ghost" onClick={closeForm}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {offices.map(office => (
          <div key={office.id} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: office.active ? 'rgba(37,99,235,0.1)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📍</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>{office.name}</div>
                  <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', padding: '2px 8px', borderRadius: 99, background: office.active ? 'rgba(16,185,129,0.12)' : 'var(--muted)', color: office.active ? '#059669' : 'var(--muted-foreground)', border: `1px solid ${office.active ? 'rgba(16,185,129,0.25)' : 'var(--border)'}` }}>{office.active ? 'Aktif' : 'Nonaktif'}</span>
                  {office.active && (
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', padding: '2px 8px', borderRadius: 99, background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.25)' }}>Bisa absensi</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 10 }}>{office.address}</div>
                <div style={{ display: 'flex', gap: 20, fontSize: 12, fontFamily: 'JetBrains Mono', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Lat: <span style={{ color: 'var(--foreground)' }}>{office.lat}</span></span>
                  <span style={{ color: 'var(--muted-foreground)' }}>Lng: <span style={{ color: 'var(--foreground)' }}>{office.lng}</span></span>
                  <span style={{ color: 'var(--muted-foreground)' }}>Radius: <span style={{ color: 'var(--primary)' }}>{office.radiusM}m</span></span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button type="button" className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openEdit(office)}>Edit</button>
                <button type="button" className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => toggleActive(office.id)}>
                  {office.active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button type="button" className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12, color: '#dc2626', borderColor: 'rgba(239,68,68,0.25)' }} onClick={() => removeOffice(office.id)}>Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Jam Kerja / Shift ────────────────────────────────────────────────────────

const shifts = [
  { id: 1, name: 'Shift Reguler', start: '08:00', end: '17:00', tolerance: 15, days: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'], assigned: 7 },
  { id: 2, name: 'Shift Pagi', start: '06:00', end: '14:00', tolerance: 10, days: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], assigned: 2 },
  { id: 3, name: 'Shift Siang', start: '14:00', end: '22:00', tolerance: 10, days: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], assigned: 1 },
]

const allDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function JamKerjaTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Pengaturan Shift & Jam Kerja</div>
        <button className="btn-primary">+ Tambah Shift</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {shifts.map(shift => (
          <div key={shift.id} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>{shift.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>{shift.assigned} karyawan assigned</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }}>Edit</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginBottom: 4, letterSpacing: '0.05em' }}>JAM KERJA</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>{shift.start} – {shift.end}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginBottom: 4, letterSpacing: '0.05em' }}>TOLERANSI TELAT</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>{shift.tolerance} menit</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginBottom: 8, letterSpacing: '0.05em' }}>HARI KERJA</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {allDays.map(day => (
                    <div key={day} style={{ width: 30, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 500, background: shift.days.includes(day) ? 'rgba(37,99,235,0.12)' : 'var(--muted)', color: shift.days.includes(day) ? 'var(--primary)' : 'var(--muted-foreground)', border: `1px solid ${shift.days.includes(day) ? 'rgba(37,99,235,0.3)' : 'var(--border)'}` }}>{day}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const holidays = [
  { date: '17 Agu 2026', name: 'Hari Kemerdekaan RI', type: 'Nasional' },
  { date: '18 Agu 2026', name: 'Cuti Bersama', type: 'Perusahaan' },
  { date: '25 Des 2026', name: 'Hari Natal', type: 'Nasional' },
  { date: '26 Des 2026', name: 'Cuti Bersama Natal', type: 'Perusahaan' },
  { date: '01 Jan 2027', name: 'Tahun Baru Masehi', type: 'Nasional' },
  { date: '28 Jan 2027', name: 'Tahun Baru Imlek', type: 'Nasional' },
]

function HariLiburTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Kalender Hari Libur</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost">⬇ Import Libur Nasional</button>
          <button className="btn-primary">+ Tambah Libur</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
        {[{ label: 'Nasional', color: '#2563eb' }, { label: 'Perusahaan', color: '#7c3aed' }].map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: t.color }} />
            {t.label}
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
              {['Tanggal', 'Nama Hari Libur', 'Tipe', 'Aksi'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holidays.map((h, i) => (
              <tr key={i} style={{ borderBottom: i < holidays.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px' }}><span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>{h.date}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: 'var(--foreground)' }}>{h.name}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', padding: '2px 10px', borderRadius: 99, background: h.type === 'Nasional' ? 'rgba(37,99,235,0.1)' : 'rgba(124,58,237,0.1)', color: h.type === 'Nasional' ? '#2563eb' : '#7c3aed', border: `1px solid ${h.type === 'Nasional' ? 'rgba(37,99,235,0.25)' : 'rgba(124,58,237,0.25)'}` }}>{h.type}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 12px', color: '#dc2626', borderColor: 'rgba(239,68,68,0.25)' }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Role & Permission ────────────────────────────────────────────────────────

const roles = [
  { name: 'Admin HR', desc: 'Kelola absensi, karyawan, persetujuan', users: 3, color: '#2563eb' },
  { name: 'Karyawan', desc: 'Akses mandiri: absen, permohonan, profil', users: 7, color: '#10b981' },
  { name: 'Manager', desc: 'Approve permohonan tim, lihat laporan dept', users: 2, color: '#7c3aed' },
]

const modules = ['Dashboard', 'Absensi', 'Permohonan', 'Karyawan', 'Laporan', 'Pengaturan']
const actions = ['View', 'Create', 'Edit', 'Delete']

const permMatrix: Record<string, Record<string, boolean[]>> = {
  'Admin HR': { Dashboard: [true, false, false, false], Absensi: [true, true, true, true], Permohonan: [true, true, true, false], Karyawan: [true, true, true, false], Laporan: [true, false, false, false], Pengaturan: [true, true, true, false] },
  'Karyawan': { Dashboard: [true, false, false, false], Absensi: [true, true, false, false], Permohonan: [true, true, false, false], Karyawan: [true, false, false, false], Laporan: [false, false, false, false], Pengaturan: [false, false, false, false] },
  'Manager': { Dashboard: [true, false, false, false], Absensi: [true, false, false, false], Permohonan: [true, true, true, false], Karyawan: [true, false, false, false], Laporan: [true, false, false, false], Pengaturan: [false, false, false, false] },
}

function RoleTab() {
  const [selectedRole, setSelectedRole] = useState('Admin HR')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>Role & Permission</div>
        <button className="btn-primary">+ Tambah Role</button>
      </div>

      <div className="grid-side-left" style={{ '--side': '240px', '--gap': '16px' } as CSSProperties}>
        {/* Role list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {roles.map(role => (
            <div key={role.name} onClick={() => setSelectedRole(role.name)} style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${selectedRole === role.name ? 'var(--primary)' : 'var(--border)'}`, background: selectedRole === role.name ? 'rgba(37,99,235,0.06)' : 'var(--card)', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: role.color }} />
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: selectedRole === role.name ? 'var(--primary)' : 'var(--foreground)' }}>{role.name}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 8 }}>{role.desc}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{role.users} pengguna</div>
            </div>
          ))}
        </div>

        {/* Permission matrix */}
        <div className="card" style={{ padding: '18px 20px', overflow: 'auto' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--foreground)', marginBottom: 16 }}>Matrix Hak Akses — {selectedRole}</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.05em', width: 120 }}>MODUL</th>
                {actions.map(a => (
                  <th key={a} style={{ textAlign: 'center', padding: '8px 12px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{a.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod, i) => {
                const perms = permMatrix[selectedRole]?.[mod] ?? [false, false, false, false]
                return (
                  <tr key={mod} style={{ borderBottom: i < modules.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{mod}</td>
                    {perms.map((allowed, j) => (
                      <td key={j} style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: allowed ? 'rgba(16,185,129,0.12)' : 'var(--muted)', border: `1px solid ${allowed ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}>
                          {allowed ? <span style={{ color: '#10b981' }}>✓</span> : <span style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>—</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="btn-primary">Simpan Perubahan</button>
            <button className="btn-ghost">Reset ke Default</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PengaturanPage() {
  const [tab, setTab] = useState<'kantor' | 'shift' | 'libur' | 'role'>('kantor')

  const tabs = [
    { id: 'kantor', label: 'Lokasi Kantor' },
    { id: 'shift', label: 'Jam Kerja / Shift' },
    { id: 'libur', label: 'Hari Libur' },
    { id: 'role', label: 'Role & Permission' },
  ] as const

  return (
    <div>
      <div className="tab-bar-scroll" style={{ marginBottom: 24, background: 'var(--muted)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, cursor: 'pointer', background: tab === t.id ? 'var(--card)' : 'transparent', color: tab === t.id ? 'var(--primary)' : 'var(--muted-foreground)', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }}>{t.label}</button>
        ))}
      </div>

      {tab === 'kantor' && <KantorTab />}
      {tab === 'shift' && <JamKerjaTab />}
      {tab === 'libur' && <HariLiburTab />}
      {tab === 'role' && <RoleTab />}
    </div>
  )
}
