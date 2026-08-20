'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { DepartmentPayrollSummary, Payslip } from '@/lib/payroll-types'
import { formatIDR } from '@/lib/payroll-calc'

interface PayrollReportViewProps {
  period: string
  payslips: Payslip[]
  departmentSummaries: DepartmentPayrollSummary[]
  onToast: (msg: string) => void
}

export default function PayrollReportView({
  period,
  payslips,
  departmentSummaries,
  onToast,
}: PayrollReportViewProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  // Chart data for departmental costs (in Millions IDR for clean chart rendering)
  const chartData = departmentSummaries.map(d => ({
    name: d.dept,
    bruto: Math.round(d.totalGross / 1_000_000),
    netto: Math.round(d.totalNet / 1_000_000),
    pajak: Math.round((d.totalPph21 + d.totalBpjs) / 1_000_000),
  }))

  // ─── CSV Exporters ──────────────────────────────────────────────────────────

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPayrollRegisterCSV = () => {
    setDownloading('register')
    setTimeout(() => {
      const headers = ['Slip ID', 'Nama Karyawan', 'Jabatan', 'Departemen', 'Status PTKP', 'Metode Pajak', 'Gaji Pokok', 'Tunjangan Tetap', 'Lembur', 'Bonus', 'Total Bruto', 'BPJS Kes', 'BPJS TK JHT', 'BPJS TK JP', 'PPh 21', 'Potongan Absen', 'Kasbon', 'Total Potongan', 'Take Home Pay', 'Bank', 'No Rekening', 'Status Transfer']
      
      const rows = payslips.map(ps => [
        ps.id,
        `"${ps.employeeName}"`,
        `"${ps.jabatan}"`,
        ps.dept,
        ps.ptkp,
        ps.taxMethod,
        ps.baseSalary,
        ps.totalFixedAllowances,
        ps.overtimePay,
        ps.bonus + ps.incentive,
        ps.grossSalary,
        ps.bpjsKesEmployee,
        ps.bpjsTkJhtEmployee,
        ps.bpjsTkJpEmployee,
        ps.pph21Amount,
        ps.attendanceDeductions,
        ps.kasbonDeductions,
        ps.totalDeductions,
        ps.netSalary,
        ps.bankName,
        `'${ps.accountNumber}`,
        ps.disbursementStatus,
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      downloadFile(csvContent, `Rekap_Payroll_HadiR_${period}.csv`)
      setDownloading(null)
      onToast(`Rekapitulasi payroll periode ${period} berhasil diunduh (CSV).`)
    }, 400)
  }

  const exportBankTransferCSV = () => {
    setDownloading('bank')
    setTimeout(() => {
      // Standard BCA / Mandiri Auto-Credit Bulk CSV Format
      const headers = ['No', 'Nomor Rekening', 'Nama Penerima', 'Nominal Transfer', 'Bank Tujuan', 'Berita Transfer', 'Email']
      const rows = payslips.map((ps, idx) => [
        idx + 1,
        `'${ps.accountNumber}`,
        `"${ps.accountHolder}"`,
        ps.netSalary,
        ps.bankName,
        `"Payroll ${period} - ${ps.employeeName}"`,
        `"${ps.employeeName.toLowerCase().replace(/\s+/g, '.')}@hadir.id"`,
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      downloadFile(csvContent, `Batch_Transfer_Bank_${period}.csv`)
      setDownloading(null)
      onToast(`Batch transfer bank format CSV berhasil diunduh!`)
    }, 400)
  }

  const exportTaxReportCSV = () => {
    setDownloading('tax')
    setTimeout(() => {
      const headers = ['Nama Karyawan', 'NPWP', 'Status PTKP', 'Metode Pajak', 'Bruto Sebulan', 'Tarif TER (%)', 'PPh 21 Terutang']
      const rows = payslips.map(ps => [
        `"${ps.employeeName}"`,
        ps.npwp ? `'${ps.npwp}` : 'Non-NPWP',
        ps.ptkp,
        ps.taxMethod,
        ps.grossSalary,
        `${(ps.terRate * 100).toFixed(2)}%`,
        ps.pph21Amount,
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      downloadFile(csvContent, `Rekap_Pajak_PPh21_${period}.csv`)
      setDownloading(null)
      onToast(`Laporan PPh 21 Masa ${period} berhasil diunduh!`)
    }, 400)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Export Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>📑</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
                Rekap Payroll Lengkap
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
              Ekspor seluruh komponen gaji bruto, rincian potongan BPJS, PPh 21, dan take home pay per karyawan.
            </div>
          </div>
          <button
            type="button"
            onClick={exportPayrollRegisterCSV}
            disabled={downloading === 'register'}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 12.5, width: '100%' }}
          >
            {downloading === 'register' ? 'Menyiapkan...' : 'Unduh CSV Rekap Gaji'}
          </button>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>🏦</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
                Batch Transfer Bank
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
              Format file transfer payroll massal siap upload untuk e-banking korporat (BCA KlikBisnis / Mandiri MCM).
            </div>
          </div>
          <button
            type="button"
            onClick={exportBankTransferCSV}
            disabled={downloading === 'bank'}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: 12.5, width: '100%', background: '#059669' }}
          >
            {downloading === 'bank' ? 'Menyiapkan...' : 'Unduh CSV Auto-Credit'}
          </button>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>🧾</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
                Rekap Pajak PPh 21 (SPT)
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
              Laporan pemotongan pajak bulanan PPh 21 TER untuk keperluan pelaporan SPT Masa Pajak.
            </div>
          </div>
          <button
            type="button"
            onClick={exportTaxReportCSV}
            disabled={downloading === 'tax'}
            className="btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12.5, width: '100%' }}
          >
            {downloading === 'tax' ? 'Menyiapkan...' : 'Unduh CSV PPh 21 Masa'}
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
            Distribusi Beban Gaji per Departemen (Juta Rupiah)
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Perbandingan total gaji bruto, take-home pay, dan total potongan per unit kerja.
          </div>
        </div>

        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} unit=" Jt" />
              <Tooltip
                formatter={(val: any) => [`Rp ${val} Juta`, '']}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: 'Outfit',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Outfit', paddingTop: 10 }} />
              <Bar dataKey="bruto" name="Total Bruto" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="netto" name="Take Home Pay" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pajak" name="Pajak & BPJS" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
          Tabel Rekapitulasi per Divisi ({period})
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--muted)' }}>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)' }}>DEPARTEMEN</th>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)' }}>HEADCOUNT</th>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)' }}>TOTAL BRUTO</th>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)' }}>BPJS EMP</th>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)' }}>PPH 21</th>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: '#059669' }}>TOTAL NET THP</th>
                <th style={{ padding: '10px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)' }}>RATA-RATA GAJI</th>
              </tr>
            </thead>
            <tbody>
              {departmentSummaries.map(d => (
                <tr key={d.dept} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-muted/40">
                  <td style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>
                    🏢 {d.dept}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontSize: 12.5 }}>
                    {d.employeeCount} Karyawan
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 13 }}>
                    {formatIDR(d.totalGross)}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: '#f59e0b' }}>
                    {formatIDR(d.totalBpjs)}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: '#ef4444' }}>
                    {formatIDR(d.totalPph21)}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 13, color: '#059669' }}>
                    {formatIDR(d.totalNet)}
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono', fontSize: 12.5, color: 'var(--muted-foreground)' }}>
                    {formatIDR(d.avgNetSalary)}
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
