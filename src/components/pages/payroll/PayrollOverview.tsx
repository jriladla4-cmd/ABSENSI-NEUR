'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type {
  PayrollPeriodRecord,
  DepartmentPayrollSummary,
} from '@/lib/payroll-types'
import { formatIDR, formatCompactIDR } from '@/lib/payroll-calc'

interface PayrollOverviewProps {
  currentPeriodRecord: PayrollPeriodRecord
  departmentSummaries: DepartmentPayrollSummary[]
  onNavigateTab: (tab: string) => void
}

const trend6Months = [
  { month: 'Mar 26', totalGross: 182, totalNet: 156, taxBpjs: 26 },
  { month: 'Apr 26', totalGross: 185, totalNet: 159, taxBpjs: 26 },
  { month: 'Mei 26', totalGross: 188, totalNet: 161, taxBpjs: 27 },
  { month: 'Jun 26', totalGross: 189, totalNet: 162, taxBpjs: 27 },
  { month: 'Jul 26', totalGross: 192, totalNet: 165, taxBpjs: 27 },
  { month: 'Agu 26', totalGross: 198, totalNet: 169, taxBpjs: 29 },
]

export default function PayrollOverview({
  currentPeriodRecord,
  departmentSummaries,
  onNavigateTab,
}: PayrollOverviewProps) {
  const p = currentPeriodRecord

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Total Cost */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Total Biaya Penggajian
            </span>
            <span style={{ fontSize: 18 }}>💼</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 20, color: 'var(--foreground)' }}>
            {formatIDR(p.totalCompanyCost)}
          </div>
          <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Outfit', fontWeight: 600 }}>
            <span>↑ 3.1%</span> vs bulan lalu ({p.totalEmployees} Karyawan)
          </div>
        </div>

        {/* Total Net Payout */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6, background: 'linear-gradient(135deg, var(--card), rgba(16,185,129,0.05))', border: '1.5px solid rgba(16,185,129,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Take Home Pay (Net Payout)
            </span>
            <span style={{ fontSize: 18 }}>💰</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 20, color: '#059669' }}>
            {formatIDR(p.totalNet)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            Siap ditransfer pada {p.payDate}
          </div>
        </div>

        {/* Tax & BPJS */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Total Pajak & BPJS
            </span>
            <span style={{ fontSize: 18 }}>🛡️</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 20, color: '#ef4444' }}>
            {formatIDR(p.totalPph21 + p.totalBpjs)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            PPh 21: {formatCompactIDR(p.totalPph21)} · BPJS: {formatCompactIDR(p.totalBpjs)}
          </div>
        </div>

        {/* Average Salary */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', fontFamily: 'Outfit', textTransform: 'uppercase' }}>
              Rata-rata Gaji Bersih
            </span>
            <span style={{ fontSize: 18 }}>📈</span>
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 20, color: 'var(--foreground)' }}>
            {formatIDR(p.totalEmployees > 0 ? Math.round(p.totalNet / p.totalEmployees) : 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>
            Per karyawan / bulan
          </div>
        </div>
      </div>

      {/* ── Action Shortcuts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Jalankan Payroll', icon: '⚡', desc: 'Siklus 4-langkah penggajian', tab: 'run', color: '#2563eb' },
          { label: 'Master Gaji & Pajak', icon: '👥', desc: 'Atur gaji pokok & PTKP', tab: 'config', color: '#7c3aed' },
          { label: 'Distribusi Slip Gaji', icon: '📄', desc: 'Lihat & cetak slip digital', tab: 'payslips', color: '#059669' },
          { label: 'Laporan & Ekspor Bank', icon: '🏦', desc: 'CSV auto-credit & pajak', tab: 'reports', color: '#0d9488' },
          { label: 'Simulasi PPh 21 TER', icon: '🧮', desc: 'Kalkulator pajak PP 58', tab: 'tax-calc', color: '#f59e0b' },
        ].map(item => (
          <div
            key={item.tab}
            onClick={() => onNavigateTab(item.tab)}
            className="card"
            style={{
              padding: '16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              transition: 'transform 0.15s ease, border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13.5, color: 'var(--foreground)' }}>
                {item.label}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Trend Area Chart */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
                Tren Penggajian (6 Bulan Terakhir)
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
                Pergerakan total bruto vs take-home pay dalam juta rupiah
              </div>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--primary)', background: 'rgba(37,99,235,0.1)', padding: '2px 8px', borderRadius: 6 }}>
              IDR (Juta)
            </span>
          </div>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend6Months} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  formatter={(v: any) => [`Rp ${v} Jt`, '']}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 10, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="totalGross" name="Total Bruto" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#grossGrad)" />
                <Area type="monotone" dataKey="totalNet" name="Take Home Pay" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Bar Chart */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
                Beban Biaya Gaji per Divisi ({p.label})
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
                Distribusi total pengeluaran gaji per unit organisasi
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentSummaries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="dept" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(v: any) => [formatIDR(Number(v)), 'Total Net']}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="totalNet" name="Net Payroll" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
