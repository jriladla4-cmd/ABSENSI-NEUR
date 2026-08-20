'use client'

import { useState } from 'react'
import type {
  PayrollPeriodRecord,
  PayrollAdjustment,
  Payslip,
  PayrollStatus,
} from '@/lib/payroll-types'
import { formatIDR } from '@/lib/payroll-calc'
import VariableAdjustments from './VariableAdjustments'
import TaxCalculatorWidget from './TaxCalculatorWidget'
import ModalOverlay from '@/components/ModalOverlay'

interface PayrollRunStepperProps {
  activePeriod: string
  periodRecord: PayrollPeriodRecord
  payslips: Payslip[]
  adjustments: PayrollAdjustment[]
  onUpdateAdjustment: (adj: PayrollAdjustment) => void
  onSyncAttendance: () => void
  onAdvanceStatus: (period: string, status: PayrollStatus, approver?: string) => void
  onToast: (msg: string) => void
}

export default function PayrollRunStepper({
  activePeriod,
  periodRecord,
  payslips,
  adjustments,
  onUpdateAdjustment,
  onSyncAttendance,
  onAdvanceStatus,
  onToast,
}: PayrollRunStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showLockModal, setShowLockModal] = useState<boolean>(false)
  const [approverName, setApproverName] = useState<string>('Fajar Nugroho (HR)')

  const isLocked = periodRecord.status === 'locked'
  const isApproved = periodRecord.status === 'approved' || isLocked

  const steps = [
    { num: 1, title: 'Periode & Parameter', icon: '📅' },
    { num: 2, title: 'Sinkronisasi Variabel', icon: '⚡' },
    { num: 3, title: 'Kalkulasi & Review', icon: '📊' },
    { num: 4, title: 'Persetujuan & Kunci', icon: '🔒' },
  ]

  const handleApprove = () => {
    onAdvanceStatus(activePeriod, 'approved', approverName)
    onToast(`Periode payroll ${activePeriod} berhasil disetujui oleh ${approverName}.`)
  }

  const handleConfirmLock = () => {
    onAdvanceStatus(activePeriod, 'locked', approverName)
    setShowLockModal(false)
    onToast(`Periode payroll ${activePeriod} resmi dikunci & status transfer diaktifkan!`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Stepper Header ── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>
              Proses Penggajian Bulanan (Payroll Run Wizard)
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
              Periode Aktif: <strong>{periodRecord.label}</strong> ({periodRecord.startDate} s/d {periodRecord.endDate}) · Pay Date: {periodRecord.payDate}
            </div>
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Status:</span>
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontWeight: 700,
                fontSize: 12,
                padding: '4px 12px',
                borderRadius: 99,
                background:
                  periodRecord.status === 'locked'
                    ? 'rgba(16,185,129,0.15)'
                    : periodRecord.status === 'approved'
                    ? 'rgba(37,99,235,0.15)'
                    : 'rgba(245,158,11,0.15)',
                color:
                  periodRecord.status === 'locked'
                    ? '#059669'
                    : periodRecord.status === 'approved'
                    ? '#2563eb'
                    : '#d97706',
                border: `1px solid ${
                  periodRecord.status === 'locked'
                    ? 'rgba(16,185,129,0.3)'
                    : periodRecord.status === 'approved'
                    ? 'rgba(37,99,235,0.3)'
                    : 'rgba(245,158,11,0.3)'
                }`,
              }}
            >
              {periodRecord.status === 'locked' && '🔒 LOCKED (ARSIP)'}
              {periodRecord.status === 'approved' && '✓ APPROVED'}
              {periodRecord.status === 'review' && '⏳ IN REVIEW'}
              {periodRecord.status === 'draft' && '📝 DRAFT'}
            </span>
          </div>
        </div>

        {/* Stepper Navigation Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {steps.map(s => {
            const isActive = currentStep === s.num
            const isCompleted = currentStep > s.num || (s.num === 4 && isLocked)
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${
                    isActive ? 'var(--primary)' : isCompleted ? 'rgba(16,185,129,0.3)' : 'var(--border)'
                  }`,
                  background: isActive
                    ? 'rgba(37,99,235,0.08)'
                    : isCompleted
                    ? 'rgba(16,185,129,0.05)'
                    : 'var(--muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: isActive ? 'var(--primary)' : isCompleted ? '#10b981' : 'var(--card)',
                    color: isActive || isCompleted ? '#fff' : 'var(--muted-foreground)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? '✓' : s.num}
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
                    Langkah {s.num}
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 12.5, color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>
                    {s.title}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Step 1: Parameter & Period Info ── */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
              1. Parameter Siklus Penggajian
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                  PERIODE PENGGAJIAN
                </label>
                <input
                  type="text"
                  disabled
                  value={periodRecord.label}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Outfit', fontSize: 13, fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                  CUT-OFF AWAL
                </label>
                <input
                  type="date"
                  disabled={isLocked}
                  defaultValue={periodRecord.startDate}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                  CUT-OFF AKHIR
                </label>
                <input
                  type="date"
                  disabled={isLocked}
                  defaultValue={periodRecord.endDate}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                  TANGGAL PEMBAYARAN (PAY DATE)
                </label>
                <input
                  type="date"
                  disabled={isLocked}
                  defaultValue={periodRecord.payDate}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.18)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div style={{ fontSize: 12.5, color: 'var(--foreground)', lineHeight: 1.5 }}>
                Total <strong>{payslips.length} karyawan aktif</strong> akan diproses dalam siklus penggajian ini. Semua data gaji pokok dan tunjangan tetap diambil dari master konfigurasi.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-primary"
                style={{ padding: '9px 24px', fontSize: 13 }}
              >
                Lanjut ke Sinkronisasi Variabel →
              </button>
            </div>
          </div>

          {/* Integrated Tax Calculator for quick lookup */}
          <TaxCalculatorWidget />
        </div>
      )}

      {/* ── Step 2: Sinkronisasi Variabel ── */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <VariableAdjustments
            period={activePeriod}
            adjustments={adjustments}
            onUpdateAdjustment={onUpdateAdjustment}
            onSyncAttendance={onSyncAttendance}
            onToast={onToast}
            readOnly={isLocked}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-ghost"
              style={{ padding: '9px 20px', fontSize: 13 }}
            >
              ← Kembali ke Langkah 1
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-primary"
              style={{ padding: '9px 24px', fontSize: 13 }}
            >
              Kalkulasi & Review Payroll →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Kalkulasi & Review Payroll Register ── */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Register Table */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
                  3. Payroll Register & Rekapitulasi ({periodRecord.label})
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
                  Hasil kalkulasi otomatis bruto, BPJS Karyawan, PPh 21 TER, potongan kehadiran, dan take-home pay.
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--muted)' }}>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'var(--muted-foreground)' }}>KARYAWAN</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'var(--muted-foreground)' }}>GAJI POKOK</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'var(--muted-foreground)' }}>TUNJANGAN</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'var(--muted-foreground)' }}>LEMBUR/BONUS</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'var(--muted-foreground)' }}>TOTAL BRUTO</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: '#f59e0b' }}>BPJS EMP</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: '#ef4444' }}>PPH 21</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: '#ef4444' }}>POT. LAIN</th>
                    <th style={{ padding: '10px 12px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: '#059669', textAlign: 'right' }}>TAKE HOME PAY</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map(ps => (
                    <tr key={ps.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-muted/40">
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>
                          {ps.employeeName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                          {ps.jabatan} · {ps.dept}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                        {formatIDR(ps.baseSalary)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                        {formatIDR(ps.totalFixedAllowances)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: 12, color: ps.totalVariableEarnings > 0 ? '#2563eb' : 'inherit' }}>
                        {formatIDR(ps.totalVariableEarnings)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 12.5 }}>
                        {formatIDR(ps.grossSalary)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#f59e0b' }}>
                        -{formatIDR(ps.totalBpjsEmployee)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#ef4444' }}>
                        -{formatIDR(ps.pph21Amount)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: 12, color: (ps.attendanceDeductions + ps.kasbonDeductions) > 0 ? '#ef4444' : 'inherit' }}>
                        -{formatIDR(ps.attendanceDeductions + ps.kasbonDeductions + ps.otherDeductions)}
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 13, color: '#059669', textAlign: 'right' }}>
                        {formatIDR(ps.netSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--muted)', fontWeight: 800, borderTop: '2px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontFamily: 'Outfit', fontSize: 12 }}>TOTAL KESELURUHAN</td>
                    <td colSpan={3}></td>
                    <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: 'var(--foreground)' }}>
                      {formatIDR(periodRecord.totalGross)}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: '#f59e0b' }}>
                      -{formatIDR(periodRecord.totalBpjs)}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: '#ef4444' }}>
                      -{formatIDR(periodRecord.totalPph21)}
                    </td>
                    <td></td>
                    <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', fontSize: 13.5, color: '#059669', textAlign: 'right' }}>
                      {formatIDR(periodRecord.totalNet)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-ghost"
              style={{ padding: '9px 20px', fontSize: 13 }}
            >
              ← Kembali ke Langkah 2
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="btn-primary"
              style={{ padding: '9px 24px', fontSize: 13 }}
            >
              Lanjut ke Persetujuan & Finalisasi →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Persetujuan & Kunci Periode ── */}
      {currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>
              4. Persetujuan & Penguncian Periode ({periodRecord.label})
            </div>

            {/* Financial Summary Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ padding: '16px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
                  Total Gaji Bruto
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: 'var(--foreground)', marginTop: 4 }}>
                  {formatIDR(periodRecord.totalGross)}
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
                  Total Potongan (Tax + BPJS)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: '#ef4444', marginTop: 4 }}>
                  -{formatIDR(periodRecord.totalDeductions)}
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.3)' }}>
                <div style={{ fontSize: 11, color: '#059669', fontFamily: 'Outfit', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Payout (Net THP)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 20, color: '#059669', marginTop: 4 }}>
                  {formatIDR(periodRecord.totalNet)}
                </div>
              </div>
              <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'Outfit', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Beban Perusahaan
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: 'var(--accent)', marginTop: 4 }}>
                  {formatIDR(periodRecord.totalCompanyCost)}
                </div>
              </div>
            </div>

            {/* Approval Info */}
            <div style={{ padding: '18px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>
                Status Otorisasi Penggajian
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                    Disetujui Oleh (HR / Finance Head)
                  </label>
                  <input
                    type="text"
                    disabled={isApproved}
                    value={approverName}
                    onChange={e => setApproverName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                    Waktu Approval
                  </label>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: 'var(--foreground)' }}>
                    {periodRecord.approvedAt ? new Date(periodRecord.approvedAt).toLocaleString('id-ID') : 'Menunggu persetujuan'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-ghost"
                style={{ padding: '9px 20px', fontSize: 13 }}
              >
                ← Kembali ke Review
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                {!isApproved && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: 13, background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
                  >
                    ✓ Setujui Payroll (Approve)
                  </button>
                )}

                {isApproved && !isLocked && (
                  <button
                    type="button"
                    onClick={() => setShowLockModal(true)}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: 13, background: 'linear-gradient(135deg, #059669, #10b981)' }}
                  >
                    🔒 Kunci & Distribusi Slip Gaji (Lock Period)
                  </button>
                )}

                {isLocked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontFamily: 'Outfit', fontWeight: 700, fontSize: 13 }}>
                    <span>✅ Periode ini telah dikunci pada {new Date(periodRecord.lockedAt || '').toLocaleDateString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock Confirmation Modal */}
      {showLockModal && (
        <ModalOverlay onClose={() => setShowLockModal(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="modal-panel"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: '24px',
              borderRadius: 20,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16,185,129,0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              🔒
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>
                Kunci Periode Payroll {periodRecord.label}?
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 6, lineHeight: 1.5 }}>
                Setelah dikunci, data slip gaji akan <strong>dibuka untuk seluruh karyawan</strong> di Employee Portal dan nominal gaji menjadi permanen (immutable).
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                className="btn-primary"
                style={{ padding: '8px 22px', fontSize: 13, background: '#059669' }}
              >
                Ya, Kunci Periode
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  )
}
