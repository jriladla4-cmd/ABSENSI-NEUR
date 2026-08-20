'use client'

import { useState, useMemo } from 'react'
import type { Payslip, DisbursementStatus } from '@/lib/payroll-types'
import { formatIDR } from '@/lib/payroll-calc'
import PayslipModal from './PayslipModal'

interface PayslipGeneratorProps {
  period: string
  payslips: Payslip[]
  onUpdateDisbursement: (period: string, status: DisbursementStatus) => void
  onToast: (msg: string) => void
}

export default function PayslipGenerator({
  period,
  payslips,
  onUpdateDisbursement,
  onToast,
}: PayslipGeneratorProps) {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState<string>('Semua')
  const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null)
  const [distributing, setDistributing] = useState(false)

  const depts = ['Semua', 'Engineering', 'Marketing', 'Finance', 'HR', 'Design', 'Legal', 'Sales']

  const filteredList = useMemo(() => {
    return payslips.filter(ps => {
      const matchSearch =
        ps.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        ps.jabatan.toLowerCase().includes(search.toLowerCase()) ||
        ps.id.toLowerCase().includes(search.toLowerCase())
      const matchDept = selectedDept === 'Semua' || ps.dept === selectedDept
      const matchStatus =
        statusFilter === 'Semua' || ps.disbursementStatus === statusFilter
      return matchSearch && matchDept && matchStatus
    })
  }, [payslips, search, selectedDept, statusFilter])

  const handleBroadcast = () => {
    setDistributing(true)
    setTimeout(() => {
      setDistributing(false)
      onToast(`Notifikasi slip gaji periode ${period} berhasil dikirim ke ${payslips.length} karyawan via Email & WhatsApp!`)
    }, 800)
  }

  const handleMarkAllPaid = () => {
    onUpdateDisbursement(period, 'paid')
    onToast(`Status transfer seluruh slip gaji periode ${period} ditandai SUDAH DITRANSFER (PAID).`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Batch Actions */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
            Distribusi & Penerbitan Slip Gaji ({period})
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Total <strong>{payslips.length} slip gaji digital</strong> tersedia untuk periode ini. Karyawan dapat mengakses slip langsung di Employee Portal.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleBroadcast}
            disabled={distributing}
            className="btn-ghost"
            style={{ padding: '8px 16px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>📢</span> {distributing ? 'Mengirim...' : 'Kirim Notifikasi Slip'}
          </button>

          <button
            type="button"
            onClick={handleMarkAllPaid}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6, background: '#059669' }}
          >
            <span>💳</span> Tandai Semua Ditransfer (Paid)
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', minWidth: 220 }}>
              <input
                type="text"
                placeholder="Cari nama karyawan / slip ID..."
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

            {/* Dept Filter */}
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
                  {d === 'Semua' ? '🏢 Semua Divisi' : d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
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
              <option value="Semua">Semua Status Transfer</option>
              <option value="unpaid">Belum Ditransfer (Unpaid)</option>
              <option value="processing">Sedang Diproses (Processing)</option>
              <option value="paid">Sudah Ditransfer (Paid)</option>
            </select>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            Menampilkan <strong>{filteredList.length}</strong> dari {payslips.length} slip gaji
          </div>
        </div>

        {/* Payslip Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--muted)' }}>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Slip ID & Karyawan
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Total Bruto
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  BPJS + PPh 21
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Take Home Pay
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Rekening Tujuan
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Status Transfer
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
                    Tidak ada slip gaji yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredList.map(ps => (
                  <tr key={ps.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-muted/40">
                    {/* ID & Name */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: `${ps.color}22`,
                            border: `1.5px solid ${ps.color}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Outfit',
                            fontWeight: 700,
                            fontSize: 13,
                            color: ps.color,
                          }}
                        >
                          {ps.avatar}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13.5, color: 'var(--foreground)' }}>
                            {ps.employeeName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)' }}>{ps.id}</span> · {ps.dept}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Gross */}
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13 }}>
                      {formatIDR(ps.grossSalary)}
                    </td>

                    {/* Tax & BPJS */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12.5, color: '#ef4444' }}>
                        -{formatIDR(ps.totalBpjsEmployee + ps.pph21Amount)}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                        Tax: {formatIDR(ps.pph21Amount)} · BPJS: {formatIDR(ps.totalBpjsEmployee)}
                      </div>
                    </td>

                    {/* Net THP */}
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 14, color: '#059669' }}>
                      {formatIDR(ps.netSalary)}
                    </td>

                    {/* Bank */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 12.5 }}>
                        {ps.bankName}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)' }}>
                        {ps.accountNumber}
                      </div>
                    </td>

                    {/* Disbursement Status */}
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontFamily: 'Outfit',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 99,
                          background:
                            ps.disbursementStatus === 'paid'
                              ? 'rgba(16,185,129,0.12)'
                              : ps.disbursementStatus === 'processing'
                              ? 'rgba(37,99,235,0.12)'
                              : 'rgba(245,158,11,0.12)',
                          color:
                            ps.disbursementStatus === 'paid'
                              ? '#059669'
                              : ps.disbursementStatus === 'processing'
                              ? '#2563eb'
                              : '#d97706',
                          border: `1px solid ${
                            ps.disbursementStatus === 'paid'
                              ? 'rgba(16,185,129,0.25)'
                              : ps.disbursementStatus === 'processing'
                              ? 'rgba(37,99,235,0.25)'
                              : 'rgba(245,158,11,0.25)'
                          }`,
                        }}
                      >
                        {ps.disbursementStatus === 'paid' && '✓ DITRANSFER'}
                        {ps.disbursementStatus === 'processing' && '⏳ PROSES'}
                        {ps.disbursementStatus === 'unpaid' && 'BELUM DITRANSFER'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setViewingPayslip(ps)}
                        className="btn-primary"
                        style={{ padding: '5px 12px', fontSize: 12, borderRadius: 8 }}
                      >
                        📄 Lihat Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal View */}
      {viewingPayslip && (
        <PayslipModal
          payslip={viewingPayslip}
          onClose={() => setViewingPayslip(null)}
        />
      )}
    </div>
  )
}
