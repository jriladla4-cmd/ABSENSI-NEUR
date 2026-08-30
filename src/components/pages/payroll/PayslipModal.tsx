'use client'

import ModalOverlay from '@/components/ModalOverlay'
import type { Payslip } from '@/lib/payroll-types'
import { formatIDR } from '@/lib/payroll-calc'

interface PayslipModalProps {
  payslip: Payslip
  onClose: () => void
}

export default function PayslipModal({ payslip, onClose }: PayslipModalProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="modal-panel"
        style={{
          width: '100%',
          maxWidth: 740,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
        }}
      >
        {/* Modal Toolbar (Non-printed) */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📄</span>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
              Pratinjau Slip Gaji Elektronik
            </span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 6 }}>
              ID: {payslip.id}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn-primary"
              style={{
                padding: '7px 16px',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🖨️</span> Cetak / Simpan PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                cursor: 'pointer',
                color: 'var(--muted-foreground)',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Printable Slip Gaji Document Area ── */}
        <div
          id="printable-payslip"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 36px',
            background: 'var(--card)',
            color: 'var(--foreground)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Company & Document Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid var(--border)',
              paddingBottom: 20,
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>
                  H
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                  HadiR <span style={{ color: 'var(--primary)' }}>HRIS</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>
                PT HadiR Teknologi Indonesia · Payroll & HR Services
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                Jl. Tomang Raya No. 48, Jakarta Barat 11440
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                SLIP GAJI KARYAWAN
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginTop: 4 }}>
                Periode: {payslip.period}
              </div>
              <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🔒 SANGAT RAHASIA (CONFIDENTIAL)
              </div>
            </div>
          </div>

          {/* Employee Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              marginBottom: 24,
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Nama Karyawan:</span>
                <strong style={{ color: 'var(--foreground)', fontFamily: 'Outfit', fontSize: 13 }}>{payslip.employeeName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>ID Karyawan:</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>#{String(payslip.employeeId).padStart(4, '0')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Jabatan & Divisi:</span>
                <span>{payslip.jabatan} ({payslip.dept})</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Status Pajak / PTKP:</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{payslip.ptkp} ({payslip.taxMethod.toUpperCase()})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Nomor NPWP:</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>{payslip.npwp || 'Non-NPWP'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Rekening Bank:</span>
                <span>{payslip.bankName} - {payslip.accountNumber}</span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* ── EARNINGS (PENGHASILAN) ── */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px', background: 'var(--card)' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 13, color: 'var(--primary)', borderBottom: '1.5px solid var(--border)', paddingBottom: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>[+] PENGHASILAN</span>
                <span>JUMLAH</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gaji Pokok</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{formatIDR(payslip.baseSalary)}</span>
                </div>
                {payslip.positionAllowance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                    <span>Tunjangan Jabatan</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{formatIDR(payslip.positionAllowance)}</span>
                  </div>
                )}
                {payslip.transportAllowance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                    <span>Tunjangan Transport</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{formatIDR(payslip.transportAllowance)}</span>
                  </div>
                )}
                {payslip.mealAllowance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                    <span>Tunjangan Makan</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{formatIDR(payslip.mealAllowance)}</span>
                  </div>
                )}
                {payslip.communicationAllowance > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted-foreground)' }}>
                    <span>Tunjangan Komunikasi</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{formatIDR(payslip.communicationAllowance)}</span>
                  </div>
                )}
                {payslip.overtimePay > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                    <span>Upah Lembur</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{formatIDR(payslip.overtimePay)}</span>
                  </div>
                )}
                {payslip.bonus > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                    <span>Bonus Kinerja</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{formatIDR(payslip.bonus)}</span>
                  </div>
                )}
                {payslip.incentive > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                    <span>Insentif / Komisi</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{formatIDR(payslip.incentive)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 14, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontFamily: 'Outfit', fontWeight: 800, fontSize: 13 }}>
                <span>TOTAL BRUTO (A)</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>{formatIDR(payslip.grossSalary)}</span>
              </div>
            </div>

            {/* ── DEDUCTIONS (POTONGAN) ── */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px', background: 'var(--card)' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 13, color: '#ef4444', borderBottom: '1.5px solid var(--border)', paddingBottom: 8, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>[-] POTONGAN</span>
                <span>JUMLAH</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BPJS Kesehatan (1%)</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>-{formatIDR(payslip.bpjsKesEmployee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BPJS TK - JHT (2%)</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>-{formatIDR(payslip.bpjsTkJhtEmployee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BPJS TK - JP (1%)</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: '#f59e0b' }}>-{formatIDR(payslip.bpjsTkJpEmployee)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>PPh 21 (TER {(payslip.terRate * 100).toFixed(1)}%)</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: '#ef4444', fontWeight: 600 }}>-{formatIDR(payslip.pph21Amount)}</span>
                </div>
                {payslip.attendanceDeductions > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                    <span>Potongan Presensi (Telat/Alfa)</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>-{formatIDR(payslip.attendanceDeductions)}</span>
                  </div>
                )}
                {payslip.kasbonDeductions > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                    <span>Cicilan Kasbon / Pinjaman</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>-{formatIDR(payslip.kasbonDeductions)}</span>
                  </div>
                )}
                {payslip.otherDeductions > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Potongan Lainnya</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>-{formatIDR(payslip.otherDeductions)}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1.5px solid var(--border)', marginTop: 14, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontFamily: 'Outfit', fontWeight: 800, fontSize: 13 }}>
                <span>TOTAL POTONGAN (B)</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: '#ef4444' }}>-{formatIDR(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* ── Net Take Home Pay Highlight Box ── */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
              border: '2px solid rgba(16,185,129,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 13, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                GAJI BERSIH DITERIMA (TAKE HOME PAY)
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
                Ditransfer ke rekening {payslip.bankName} {payslip.accountNumber} ({payslip.accountHolder})
              </div>
            </div>

            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 900, fontSize: 24, color: '#059669' }}>
              {formatIDR(payslip.netSalary)}
            </div>
          </div>

          {/* Company Paid Benefits (Informational Footer) */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              fontSize: 11,
              color: 'var(--muted-foreground)',
              marginBottom: 28,
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--foreground)', marginBottom: 4, fontFamily: 'Outfit' }}>
              ℹ️ Manfaat Tambahan yang Ditanggung Perusahaan (Informasional):
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>BPJS Kes (4%): {formatIDR(payslip.bpjsKesEmployer)}</span>
              <span>BPJS JHT (3.7%): {formatIDR(payslip.bpjsTkJhtEmployer)}</span>
              <span>BPJS JP (2%): {formatIDR(payslip.bpjsTkJpEmployer)}</span>
              <span>BPJS JKK/JKM: {formatIDR(payslip.bpjsTkJkkEmployer + payslip.bpjsTkJkmEmployer)}</span>
              <strong style={{ color: 'var(--foreground)' }}>Total Benefit: {formatIDR(payslip.totalEmployerBenefit)}</strong>
            </div>
          </div>

          {/* Digital Signature & QR Verification Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTop: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 10,
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                📱
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--foreground)' }}>
                  Dokumen Sah Elektronik
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted-foreground)', maxWidth: 220 }}>
                  Diterbitkan otomatis oleh Sistem Payroll HadiR HRIS tanpa tanda tangan basah.
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 36 }}>
                Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: 'var(--foreground)', borderTop: '1px solid var(--foreground)', paddingTop: 4 }}>
                Fajar Nugroho
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                Head of HR & People Operations
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  )
}
