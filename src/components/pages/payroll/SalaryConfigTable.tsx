'use client'

import { useState, useMemo } from 'react'
import type { EmployeeSalaryConfig } from '@/lib/payroll-types'
import { employeeDirectory } from '@/lib/payroll-mockdb'
import { formatIDR } from '@/lib/payroll-calc'
import SalaryComponentModal from './SalaryComponentModal'

interface SalaryConfigTableProps {
  salaryConfigs: EmployeeSalaryConfig[]
  onUpdateConfig: (config: EmployeeSalaryConfig) => void
  onToast: (msg: string) => void
}

export default function SalaryConfigTable({
  salaryConfigs,
  onUpdateConfig,
  onToast,
}: SalaryConfigTableProps) {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('Semua')
  const [editingConfig, setEditingConfig] = useState<EmployeeSalaryConfig | null>(null)

  const depts = ['Semua', 'Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Legal', 'Sales']

  // Filtered list
  const filteredList = useMemo(() => {
    return salaryConfigs
      .map(cfg => {
        const emp = employeeDirectory.find(e => e.id === cfg.employeeId)
        return { cfg, emp }
      })
      .filter(({ emp }) => {
        if (!emp) return false
        const matchSearch =
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.jabatan.toLowerCase().includes(search.toLowerCase()) ||
          emp.dept.toLowerCase().includes(search.toLowerCase())
        const matchDept = selectedDept === 'Semua' || emp.dept === selectedDept
        return matchSearch && matchDept
      })
  }, [salaryConfigs, search, selectedDept])

  // Summary KPI calculation
  const summary = useMemo(() => {
    let totalBase = 0
    let totalAllowances = 0

    salaryConfigs.forEach(c => {
      totalBase += c.baseSalary || 0
      const fix = c.fixedAllowances
      totalAllowances +=
        (fix.position || 0) +
        (fix.transport || 0) +
        (fix.meal || 0) +
        (fix.communication || 0) +
        (fix.other || 0)
    })

    const avgBase = salaryConfigs.length > 0 ? Math.round(totalBase / salaryConfigs.length) : 0

    return {
      totalBase,
      totalAllowances,
      avgBase,
      count: salaryConfigs.length,
    }
  }, [salaryConfigs])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ── KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Total Gaji Pokok
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: 'var(--foreground)', marginTop: 2 }}>
              {formatIDR(summary.totalBase)}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🎁
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Total Tunjangan Tetap
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: 'var(--foreground)', marginTop: 2 }}>
              {formatIDR(summary.totalAllowances)}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📈
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Rata-rata Gaji Pokok
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: 'var(--foreground)', marginTop: 2 }}>
              {formatIDR(summary.avgBase)}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Karyawan Terdaftar
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)', marginTop: 2 }}>
              {summary.count} Orang
            </div>
          </div>
        </div>
      </div>

      {/* ── Table & Filter Header ── */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
              Master Struktur Gaji & Pajak Karyawan
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
              Atur komponen gaji pokok, tunjangan rutin, kepesertaan BPJS, serta metode PPh 21 per karyawan.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: 200 }}>
              <input
                type="text"
                placeholder="Cari karyawan / jabatan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 30px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 7, fontSize: 13, color: 'var(--muted-foreground)' }}>
                🔍
              </span>
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                fontFamily: 'Outfit',
                fontSize: 12.5,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {depts.map(d => (
                <option key={d} value={d}>
                  {d === 'Semua' ? '🏢 Semua Divisi' : `📁 ${d}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--muted)' }}>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Karyawan
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Gaji Pokok
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Tunjangan Tetap
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Status Pajak & PTKP
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  BPJS
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Rekening Bank
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'center' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    Tidak ada data karyawan yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map(({ cfg, emp }) => {
                  if (!emp) return null
                  const fix = cfg.fixedAllowances
                  const totalFix =
                    (fix.position || 0) +
                    (fix.transport || 0) +
                    (fix.meal || 0) +
                    (fix.communication || 0) +
                    (fix.other || 0)

                  return (
                    <tr
                      key={cfg.employeeId}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s ease',
                      }}
                      className="hover:bg-muted/40"
                    >
                      {/* Employee Info */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: `${emp.color}22`,
                              border: `1.5px solid ${emp.color}44`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'Outfit',
                              fontWeight: 700,
                              fontSize: 13,
                              color: emp.color,
                              flexShrink: 0,
                            }}
                          >
                            {emp.avatar}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13.5, color: 'var(--foreground)' }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>
                              {emp.jabatan} · <span style={{ color: 'var(--primary)' }}>{emp.dept}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Base Salary */}
                      <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>
                        {formatIDR(cfg.baseSalary)}
                      </td>

                      {/* Fixed Allowances */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>
                          {formatIDR(totalFix)}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
                          Posisi {formatIDR(fix.position)} · Trp/Mkn {formatIDR(fix.transport + fix.meal)}
                        </div>
                      </td>

                      {/* Tax / PTKP */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: 'JetBrains Mono',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'rgba(37,99,235,0.1)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(37,99,235,0.2)',
                            }}
                          >
                            {cfg.taxConfig.ptkp}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontFamily: 'Outfit',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 6,
                              background: cfg.taxConfig.hasNPWP ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: cfg.taxConfig.hasNPWP ? '#059669' : '#dc2626',
                            }}
                          >
                            {cfg.taxConfig.hasNPWP ? 'NPWP ✓' : 'Non-NPWP'}
                          </span>
                        </div>
                      </td>

                      {/* BPJS Badges */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {cfg.bpjsConfig.bpjsKesEnabled && (
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.12)', color: '#059669', fontWeight: 600 }}>
                              Kes
                            </span>
                          )}
                          {cfg.bpjsConfig.bpjsTkJhtEnabled && (
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(37,99,235,0.12)', color: '#2563eb', fontWeight: 600 }}>
                              JHT
                            </span>
                          )}
                          {cfg.bpjsConfig.bpjsTkJpEnabled && (
                            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(124,58,237,0.12)', color: '#7c3aed', fontWeight: 600 }}>
                              JP
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bank Account */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 12.5, color: 'var(--foreground)' }}>
                          {cfg.bankDetails.bankName}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)' }}>
                          {cfg.bankDetails.accountNumber}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setEditingConfig(cfg)}
                          className="btn-ghost"
                          style={{
                            padding: '6px 12px',
                            fontSize: 12,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Edit Modal */}
      {editingConfig && (
        <SalaryComponentModal
          config={editingConfig}
          onSave={updated => {
            onUpdateConfig(updated)
            setEditingConfig(null)
            onToast('Komponen gaji berhasil disimpan dan disinkronkan.')
          }}
          onClose={() => setEditingConfig(null)}
        />
      )}
    </div>
  )
}
