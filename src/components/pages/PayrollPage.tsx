'use client'

import { useState } from 'react'
import { usePayroll } from '@/lib/payroll-hooks'
import PayrollOverview from './payroll/PayrollOverview'
import PayrollRunStepper from './payroll/PayrollRunStepper'
import SalaryConfigTable from './payroll/SalaryConfigTable'
import PayslipGenerator from './payroll/PayslipGenerator'
import PayrollReportView from './payroll/PayrollReportView'
import TaxCalculatorWidget from './payroll/TaxCalculatorWidget'

type PayrollTab = 'overview' | 'run' | 'config' | 'payslips' | 'reports' | 'tax-calc'

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState<PayrollTab>('overview')
  const [toast, setToast] = useState<string | null>(null)

  const {
    loading,
    activePeriod,
    setActivePeriod,
    periods,
    currentPeriodRecord,
    currentPayslips,
    salaryConfigs,
    currentAdjustments,
    departmentSummaries,
    updateSalaryConfig,
    updateAdjustment,
    syncAttendanceData,
    advancePeriodStatus,
    updateDisbursementStatus,
    resetToDefaults,
  } = usePayroll()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const tabs: { id: PayrollTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview & KPI', icon: '⊞' },
    { id: 'run', label: 'Payroll Run (Wizard)', icon: '⚡' },
    { id: 'config', label: 'Master Gaji & Pajak', icon: '👥' },
    { id: 'payslips', label: 'Slip Gaji & Distribusi', icon: '📄' },
    { id: 'reports', label: 'Laporan & Ekspor Bank', icon: '🏦' },
    { id: 'tax-calc', label: 'Kalkulator PPh 21 TER', icon: '🧮' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 350, gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: 'var(--muted-foreground)' }}>
          Memuat data payroll dan konfigurasi pajak...
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Top Header & Period Selector ── */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>💰</span>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 19, color: 'var(--foreground)' }}>
              Manajemen Penggajian (Payroll & Tax Engine)
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 3 }}>
            Kelola siklus gaji, pemotongan PPh 21 TER 2024, BPJS Ketenagakerjaan & Kesehatan, serta auto-credit bank.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Period Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', padding: '5px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13 }}>📅</span>
            <span style={{ fontSize: 11.5, fontFamily: 'Outfit', fontWeight: 600, color: 'var(--muted-foreground)' }}>Periode:</span>
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
                  {p.label} ({p.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              resetToDefaults()
              showToast('Data mock payroll berhasil direset ke pengaturan awal.')
            }}
            className="btn-ghost"
            title="Reset data mock payroll"
            style={{ padding: '7px 12px', fontSize: 12, borderRadius: 10 }}
          >
            🔄 Reset Mock
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div
        className="tab-bar-scroll"
        style={{
          display: 'flex',
          gap: 6,
          borderBottom: '1.5px solid var(--border)',
          paddingBottom: 2,
          overflowX: 'auto',
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: 'transparent',
                fontFamily: 'Outfit',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13.5,
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Sub View Render ── */}
      <div>
        {activeTab === 'overview' && (
          <PayrollOverview
            currentPeriodRecord={currentPeriodRecord}
            departmentSummaries={departmentSummaries}
            onNavigateTab={tabKey => setActiveTab(tabKey as PayrollTab)}
          />
        )}

        {activeTab === 'run' && (
          <PayrollRunStepper
            activePeriod={activePeriod}
            periodRecord={currentPeriodRecord}
            payslips={currentPayslips}
            adjustments={currentAdjustments}
            onUpdateAdjustment={updateAdjustment}
            onSyncAttendance={() => syncAttendanceData(activePeriod)}
            onAdvanceStatus={advancePeriodStatus}
            onToast={showToast}
          />
        )}

        {activeTab === 'config' && (
          <SalaryConfigTable
            salaryConfigs={salaryConfigs}
            onUpdateConfig={updateSalaryConfig}
            onToast={showToast}
          />
        )}

        {activeTab === 'payslips' && (
          <PayslipGenerator
            period={activePeriod}
            payslips={currentPayslips}
            onUpdateDisbursement={updateDisbursementStatus}
            onToast={showToast}
          />
        )}

        {activeTab === 'reports' && (
          <PayrollReportView
            period={activePeriod}
            payslips={currentPayslips}
            departmentSummaries={departmentSummaries}
            onToast={showToast}
          />
        )}

        {activeTab === 'tax-calc' && (
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <TaxCalculatorWidget />
          </div>
        )}
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--card)',
            border: '1px solid rgba(37,99,235,0.3)',
            borderLeft: '4px solid var(--primary)',
            borderRadius: 12,
            padding: '14px 20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'Outfit',
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--foreground)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>ℹ️</span>
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 16, marginLeft: 8 }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
