'use client'

import { useState, useMemo } from 'react'
import type { AuthUser } from '../pages/LoginPage'
import { usePayroll } from '@/lib/payroll-hooks'
import { employeeDirectory } from '@/lib/payroll-mockdb'
import { formatIDR } from '@/lib/payroll-calc'
import PayslipModal from '../pages/payroll/PayslipModal'
import type { Payslip } from '@/lib/payroll-types'

interface EmployeePayrollViewProps {
  user: AuthUser
}

export default function EmployeePayrollView({ user }: EmployeePayrollViewProps) {
  const { periods, currentPayslips, activePeriod, setActivePeriod } = usePayroll()

  // Match logged in user or fallback to Rina (id: 1)
  const currentEmp = useMemo(() => {
    return (
      employeeDirectory.find(e => e.email.toLowerCase() === user.email.toLowerCase()) ||
      employeeDirectory.find(e => e.name.toLowerCase().includes(user.name.toLowerCase())) ||
      employeeDirectory[0]
    )
  }, [user])

  // Privacy mask toggle (mask salary numbers)
  const [masked, setMasked] = useState<boolean>(false)
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null)
  const [selectedHistoryPeriod, setSelectedHistoryPeriod] = useState<string>(activePeriod)

  // Current active payslip for this employee
  const activeEmpPayslip = useMemo(() => {
    return currentPayslips.find(ps => ps.employeeId === currentEmp.id) || null
  }, [currentPayslips, currentEmp])

  // Selected history payslip
  const historyPayslip = useMemo(() => {
    return currentPayslips.find(ps => ps.employeeId === currentEmp.id) || activeEmpPayslip
  }, [currentPayslips, currentEmp, activeEmpPayslip])

  const renderAmount = (amount: number) => {
    if (masked) return 'Rp ••••••••'
    return formatIDR(amount)
  }

  if (!activeEmpPayslip) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
          Slip Gaji Belum Tersedia
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 4 }}>
          Slip gaji untuk periode ini sedang dalam proses review oleh tim HR & Finance.
        </div>
      </div>
    )
  }

  const ps = activeEmpPayslip

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Top Header & Mask Toggle ── */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          background: 'linear-gradient(135deg, var(--card), rgba(37,99,235,0.04))',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>💰</span>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 19, color: 'var(--foreground)' }}>
              Informasi Penggajian & Slip Gaji
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 3 }}>
            Akses riwayat slip gaji bulanan, rincian penghasilan, iuran BPJS, dan potongan PPh 21 Anda secara mandiri.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Privacy toggle */}
          <button
            type="button"
            onClick={() => setMasked(m => !m)}
            className="btn-ghost"
            style={{
              padding: '7px 14px',
              fontSize: 12.5,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid var(--border)',
            }}
          >
            <span>{masked ? '👁️‍🗨️' : '👁️'}</span>
            <span>{masked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}</span>
          </button>

          {/* Period selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', padding: '5px 12px', borderRadius: 10, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12 }}>📅</span>
            <select
              value={activePeriod}
              onChange={e => setActivePeriod(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'Outfit',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--foreground)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {periods.map(p => (
                <option key={p.period} value={p.period}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Latest Payslip Hero Card ── */}
      <div
        className="card"
        style={{
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))',
          border: '1.5px solid rgba(37,99,235,0.25)',
          borderRadius: 20,
          boxShadow: '0 12px 36px rgba(37,99,235,0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontFamily: 'Outfit', fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: 'var(--primary)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Periode {ps.period}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 99,
                  background: ps.disbursementStatus === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: ps.disbursementStatus === 'paid' ? '#059669' : '#d97706',
                  border: `1px solid ${ps.disbursementStatus === 'paid' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                }}
              >
                {ps.disbursementStatus === 'paid' ? '✓ DITRANSFER' : '⏳ DALAM PROSES'}
              </span>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12.5, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Gaji Bersih Diterima (Take Home Pay)
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, fontSize: 32, color: 'var(--foreground)', marginTop: 2, letterSpacing: '-0.02em' }}>
                {renderAmount(ps.netSalary)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewingPayslip(ps)}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
            }}
          >
            <span>📄</span> Buka & Cetak Slip Gaji
          </button>
        </div>

        {/* Quick 3-Pillar Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            padding: '14px 18px',
            borderRadius: 14,
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Total Penghasilan Bruto</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: 'var(--foreground)', marginTop: 2 }}>
              {renderAmount(ps.grossSalary)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#ef4444', fontFamily: 'Outfit' }}>Total Potongan (Tax + BPJS + Lain)</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: '#ef4444', marginTop: 2 }}>
              -{renderAmount(ps.totalDeductions)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Rekening Pembayaran</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginTop: 2 }}>
              {ps.bankName} · {ps.accountNumber}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detailed Breakdown Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Earnings Breakdown */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--primary)', display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border)', paddingBottom: 10 }}>
            <span>[+] Rincian Penghasilan (Earnings)</span>
            <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.grossSalary)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Gaji Pokok</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{renderAmount(ps.baseSalary)}</span>
            </div>
            {ps.positionAllowance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                <span>Tunjangan Jabatan</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.positionAllowance)}</span>
              </div>
            )}
            {ps.transportAllowance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                <span>Tunjangan Transport</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.transportAllowance)}</span>
              </div>
            )}
            {ps.mealAllowance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                <span>Tunjangan Makan</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.mealAllowance)}</span>
              </div>
            )}
            {ps.communicationAllowance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                <span>Tunjangan Komunikasi</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.communicationAllowance)}</span>
              </div>
            )}
            {ps.overtimePay > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 600 }}>
                <span>Upah Lembur</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.overtimePay)}</span>
              </div>
            )}
            {ps.bonus > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 600 }}>
                <span>Bonus Kinerja</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.bonus)}</span>
              </div>
            )}
            {ps.incentive > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb', fontWeight: 600 }}>
                <span>Insentif / Komisi</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{renderAmount(ps.incentive)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: '#ef4444', display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid var(--border)', paddingBottom: 10 }}>
            <span>[-] Rincian Potongan (Deductions)</span>
            <span style={{ fontFamily: 'JetBrains Mono' }}>-{renderAmount(ps.totalDeductions)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--foreground)' }}>BPJS Kesehatan (1%)</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>-{renderAmount(ps.bpjsKesEmployee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--foreground)' }}>BPJS TK - JHT (2%)</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>-{renderAmount(ps.bpjsTkJhtEmployee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--foreground)' }}>BPJS TK - JP (1%)</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>-{renderAmount(ps.bpjsTkJpEmployee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--foreground)' }}>PPh 21 (TER {(ps.terRate * 100).toFixed(1)}%)</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#ef4444', fontWeight: 600 }}>-{renderAmount(ps.pph21Amount)}</span>
            </div>
            {ps.attendanceDeductions > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Potongan Telat / Alfa</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>-{renderAmount(ps.attendanceDeductions)}</span>
              </div>
            )}
            {ps.kasbonDeductions > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                <span>Cicilan Kasbon</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>-{renderAmount(ps.kasbonDeductions)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tax & Bank Profile Info ── */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🛡️
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 14, color: 'var(--foreground)' }}>
              Status Perpajakan: {ps.ptkp} · {ps.npwp ? `NPWP: ${ps.npwp}` : 'Non-NPWP'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              Metode Pajak: {ps.taxMethod.toUpperCase()} · Kategori TER: {ps.terCategory}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          Jika terdapat ketidaksesuaian data gaji atau rekening, hubungi tim HR melalui <strong>permohonan koreksi</strong>.
        </div>
      </div>

      {/* Payslip Modal Preview */}
      {viewingPayslip && (
        <PayslipModal
          payslip={viewingPayslip}
          onClose={() => setViewingPayslip(null)}
        />
      )}
    </div>
  )
}
