'use client'

import { useState, useMemo } from 'react'
import ModalOverlay from '@/components/ModalOverlay'
import type { EmployeeSalaryConfig, PTKPStatus, TaxMethod } from '@/lib/payroll-types'
import { calculatePayslip, formatIDR } from '@/lib/payroll-calc'
import { employeeDirectory } from '@/lib/payroll-mockdb'

interface SalaryComponentModalProps {
  config: EmployeeSalaryConfig
  onSave: (updated: EmployeeSalaryConfig) => void
  onClose: () => void
}

export default function SalaryComponentModal({
  config,
  onSave,
  onClose,
}: SalaryComponentModalProps) {
  const emp = employeeDirectory.find(e => e.id === config.employeeId)!

  // Local state for editing
  const [baseSalary, setBaseSalary] = useState(config.baseSalary)
  const [positionAllowance, setPositionAllowance] = useState(config.fixedAllowances.position)
  const [transportAllowance, setTransportAllowance] = useState(config.fixedAllowances.transport)
  const [mealAllowance, setMealAllowance] = useState(config.fixedAllowances.meal)
  const [communicationAllowance, setCommunicationAllowance] = useState(config.fixedAllowances.communication)
  const [otherAllowance, setOtherAllowance] = useState(config.fixedAllowances.other || 0)

  // Tax & BPJS
  const [ptkp, setPtkp] = useState<PTKPStatus>(config.taxConfig.ptkp)
  const [taxMethod, setTaxMethod] = useState<TaxMethod>(config.taxConfig.taxMethod)
  const [npwp, setNpwp] = useState(config.taxConfig.npwp || '')
  const [hasNPWP, setHasNPWP] = useState(config.taxConfig.hasNPWP)

  const [bpjsKes, setBpjsKes] = useState(config.bpjsConfig.bpjsKesEnabled)
  const [bpjsJht, setBpjsJht] = useState(config.bpjsConfig.bpjsTkJhtEnabled)
  const [bpjsJp, setBpjsJp] = useState(config.bpjsConfig.bpjsTkJpEnabled)

  // Bank
  const [bankName, setBankName] = useState(config.bankDetails.bankName)
  const [accountNumber, setAccountNumber] = useState(config.bankDetails.accountNumber)
  const [accountHolder, setAccountHolder] = useState(config.bankDetails.accountHolder)

  const [activeTab, setActiveTab] = useState<'salary' | 'tax' | 'bank'>('salary')

  // Live simulation calculation preview
  const livePreview = useMemo(() => {
    const tempConfig: EmployeeSalaryConfig = {
      employeeId: config.employeeId,
      baseSalary,
      fixedAllowances: {
        position: positionAllowance,
        transport: transportAllowance,
        meal: mealAllowance,
        communication: communicationAllowance,
        other: otherAllowance,
      },
      taxConfig: {
        ptkp,
        taxMethod,
        npwp,
        hasNPWP,
      },
      bpjsConfig: {
        bpjsKesEnabled: bpjsKes,
        bpjsTkJhtEnabled: bpjsJht,
        bpjsTkJpEnabled: bpjsJp,
        bpjsTkJkkRate: config.bpjsConfig.bpjsTkJkkRate,
        bpjsTkJkmRate: config.bpjsConfig.bpjsTkJkmRate,
      },
      bankDetails: {
        bankName,
        accountNumber,
        accountHolder,
      },
    }

    const dummyAdj = {
      employeeId: config.employeeId,
      period: '2026-08',
      overtimeHours: 0,
      overtimePay: 0,
      bonus: 0,
      incentive: 0,
      lateCount: 0,
      lateDeduction: 0,
      unpaidLeaveDays: 0,
      unpaidLeaveDeduction: 0,
      kasbonDeduction: 0,
      otherDeduction: 0,
    }

    return calculatePayslip(tempConfig, dummyAdj, '2026-08', emp)
  }, [
    baseSalary,
    positionAllowance,
    transportAllowance,
    mealAllowance,
    communicationAllowance,
    otherAllowance,
    ptkp,
    taxMethod,
    npwp,
    hasNPWP,
    bpjsKes,
    bpjsJht,
    bpjsJp,
    bankName,
    accountNumber,
    accountHolder,
    config,
    emp,
  ])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: EmployeeSalaryConfig = {
      ...config,
      baseSalary: Number(baseSalary) || 0,
      fixedAllowances: {
        position: Number(positionAllowance) || 0,
        transport: Number(transportAllowance) || 0,
        meal: Number(mealAllowance) || 0,
        communication: Number(communicationAllowance) || 0,
        other: Number(otherAllowance) || 0,
      },
      taxConfig: {
        ptkp,
        taxMethod,
        npwp: hasNPWP ? npwp : undefined,
        hasNPWP,
      },
      bpjsConfig: {
        ...config.bpjsConfig,
        bpjsKesEnabled: bpjsKes,
        bpjsTkJhtEnabled: bpjsJht,
        bpjsTkJpEnabled: bpjsJp,
      },
      bankDetails: {
        bankName,
        accountNumber,
        accountHolder: accountHolder.toUpperCase(),
      },
    }
    onSave(updated)
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="modal-panel"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'var(--card)',
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: `${emp.color}22`,
              border: `1.5px solid ${emp.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: 16,
              color: emp.color,
              flexShrink: 0,
            }}
          >
            {emp.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>
              Setup Komponen Gaji: {emp.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {emp.jabatan} · {emp.dept} · ID #{emp.id}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--muted)',
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

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '12px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--muted)',
          }}
        >
          {[
            { id: 'salary', label: '💰 Gaji & Tunjangan' },
            { id: 'tax', label: '🛡️ Pajak & BPJS' },
            { id: 'bank', label: '🏦 Rekening Bank' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '7px 14px',
                borderRadius: 10,
                border: 'none',
                fontFamily: 'Outfit',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeTab === 'salary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                    GAJI POKOK (BASE SALARY)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: 11, fontSize: 13, fontWeight: 700, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                      Rp
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50000}
                      value={baseSalary}
                      onChange={e => setBaseSalary(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 42px',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        fontFamily: 'JetBrains Mono',
                        fontSize: 15,
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: 12 }}>
                    Tunjangan Tetap (Fixed Allowances)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                        Tunjangan Jabatan
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={positionAllowance}
                        onChange={e => setPositionAllowance(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--foreground)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                        Tunjangan Transport
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={transportAllowance}
                        onChange={e => setTransportAllowance(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--foreground)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                        Tunjangan Makan
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={mealAllowance}
                        onChange={e => setMealAllowance(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--foreground)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                        Tunjangan Komunikasi / Pulsa
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={communicationAllowance}
                        onChange={e => setCommunicationAllowance(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--foreground)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 13,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                      STATUS PTKP
                    </label>
                    <select
                      value={ptkp}
                      onChange={e => setPtkp(e.target.value as PTKPStatus)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        fontFamily: 'JetBrains Mono',
                        fontSize: 13,
                      }}
                    >
                      <option value="TK/0">TK/0 — Tidak Kawin (Rp 54.000.000/thn)</option>
                      <option value="TK/1">TK/1 — 1 Tanggungan (Rp 58.500.000/thn)</option>
                      <option value="TK/2">TK/2 — 2 Tanggungan (Rp 63.000.000/thn)</option>
                      <option value="TK/3">TK/3 — 3 Tanggungan (Rp 67.500.000/thn)</option>
                      <option value="K/0">K/0 — Kawin 0 Tanggungan (Rp 58.500.000/thn)</option>
                      <option value="K/1">K/1 — Kawin 1 Tanggungan (Rp 63.000.000/thn)</option>
                      <option value="K/2">K/2 — Kawin 2 Tanggungan (Rp 67.500.000/thn)</option>
                      <option value="K/3">K/3 — Kawin 3 Tanggungan (Rp 72.000.000/thn)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                      METODE PERHITUNGAN PAJAK
                    </label>
                    <select
                      value={taxMethod}
                      onChange={e => setTaxMethod(e.target.value as TaxMethod)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        fontFamily: 'Outfit',
                        fontSize: 13,
                      }}
                    >
                      <option value="gross">Gross (Dipotong dari gaji karyawan)</option>
                      <option value="gross_up">Gross-Up (Diberikan tunjangan pajak)</option>
                      <option value="nett">Nett (Ditanggung penuh perusahaan)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    id="hasNpwp"
                    checked={hasNPWP}
                    onChange={e => setHasNPWP(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <label htmlFor="hasNpwp" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--foreground)', cursor: 'pointer', fontFamily: 'Outfit' }}>
                      Karyawan Memiliki Nomor Pokok Wajib Pajak (NPWP)
                    </label>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                      Jika tidak memiliki NPWP, tarif PPh 21 dikenakan penalti 20% lebih tinggi.
                    </div>
                  </div>
                </div>

                {hasNPWP && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                      Nomor NPWP (15 / 16 Digit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 81.234.567.8-012.000"
                      value={npwp}
                      onChange={e => setNpwp(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        fontFamily: 'JetBrains Mono',
                        fontSize: 13,
                      }}
                    />
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)', marginBottom: 10 }}>
                    Kepesertaan BPJS Karyawan
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--foreground)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={bpjsKes} onChange={e => setBpjsKes(e.target.checked)} />
                      <span>BPJS Kesehatan (1% Karyawan + 4% Perusahaan, max basis Rp 12.000.000)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--foreground)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={bpjsJht} onChange={e => setBpjsJht(e.target.checked)} />
                      <span>BPJS TK - Jaminan Hari Tua / JHT (2% Karyawan + 3.7% Perusahaan)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--foreground)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={bpjsJp} onChange={e => setBpjsJp(e.target.checked)} />
                      <span>BPJS TK - Jaminan Pensiun / JP (1% Karyawan + 2% Perusahaan, max basis Rp 10.042.300)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                    NAMA BANK
                  </label>
                  <select
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontFamily: 'Outfit',
                      fontSize: 13,
                    }}
                  >
                    <option value="BCA">Bank Central Asia (BCA)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BNI">Bank Negara Indonesia (BNI)</option>
                    <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Permata">Bank Permata</option>
                    <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                    NOMOR REKENING
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 14,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
                    NAMA PEMILIK REKENING (SESUAI BUKU TABUNGAN)
                  </label>
                  <input
                    type="text"
                    required
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      fontFamily: 'Outfit',
                      fontSize: 13,
                      textTransform: 'uppercase',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Live Calculation Preview Box */}
            <div
              style={{
                borderRadius: 14,
                padding: '14px 16px',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))',
                border: '1px solid rgba(37,99,235,0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                  ⚡ SIMULASI ESTIMASI GAJI BERSIH (THP)
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
                  TER Kat: {livePreview.terCategory} ({(livePreview.terRate * 100).toFixed(1)}%)
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                <div style={{ padding: '8px 4px', borderRadius: 8, background: 'var(--card)' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Total Bruto</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                    {formatIDR(livePreview.grossSalary)}
                  </div>
                </div>
                <div style={{ padding: '8px 4px', borderRadius: 8, background: 'var(--card)' }}>
                  <div style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'Outfit' }}>Iuran BPJS</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                    -{formatIDR(livePreview.totalBpjsEmployee)}
                  </div>
                </div>
                <div style={{ padding: '8px 4px', borderRadius: 8, background: 'var(--card)' }}>
                  <div style={{ fontSize: 10, color: '#ef4444', fontFamily: 'Outfit' }}>PPh 21</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                    -{formatIDR(livePreview.pph21Amount)}
                  </div>
                </div>
                <div style={{ padding: '8px 4px', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div style={{ fontSize: 10, color: '#059669', fontFamily: 'Outfit', fontWeight: 700 }}>Estimasi THP</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#059669', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                    {formatIDR(livePreview.netSalary)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              background: 'var(--card)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '9px 18px', fontSize: 13 }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '9px 22px', fontSize: 13 }}
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
