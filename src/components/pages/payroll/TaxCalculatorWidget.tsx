'use client'

import { useState, useMemo } from 'react'
import type { PTKPStatus, TaxMethod } from '@/lib/payroll-types'
import {
  calculatePPh21Monthly,
  getTERCategory,
  formatIDR,
  BPJS_CONSTANTS,
} from '@/lib/payroll-calc'

export default function TaxCalculatorWidget() {
  const [grossInput, setGrossInput] = useState<number>(18_000_000)
  const [ptkp, setPtkp] = useState<PTKPStatus>('K/1')
  const [taxMethod, setTaxMethod] = useState<TaxMethod>('gross')
  const [hasNPWP, setHasNPWP] = useState<boolean>(true)

  // Presets
  const presets = [
    { label: 'Staff (6 Jt)', amount: 6_000_000 },
    { label: 'Officer (10 Jt)', amount: 10_000_000 },
    { label: 'Lead (18 Jt)', amount: 18_000_000 },
    { label: 'Manager (28 Jt)', amount: 28_000_000 },
    { label: 'Exec (45 Jt)', amount: 45_000_000 },
  ]

  // Calculated Results
  const result = useMemo(() => {
    const tax = calculatePPh21Monthly(grossInput, ptkp, taxMethod, hasNPWP)
    const category = getTERCategory(ptkp)

    // BPJS estimates
    const bpjsKesBasis = Math.min(grossInput, BPJS_CONSTANTS.KES_MAX_BASIS)
    const bpjsJpBasis = Math.min(grossInput, BPJS_CONSTANTS.TK_JP_MAX_BASIS)

    const bpjsKesEmp = Math.round(bpjsKesBasis * BPJS_CONSTANTS.KES_EMPLOYEE_RATE)
    const bpjsJhtEmp = Math.round(grossInput * BPJS_CONSTANTS.TK_JHT_EMPLOYEE_RATE)
    const bpjsJpEmp = Math.round(bpjsJpBasis * BPJS_CONSTANTS.TK_JP_EMPLOYEE_RATE)
    const totalBpjsEmp = bpjsKesEmp + bpjsJhtEmp + bpjsJpEmp

    // Employer benefits
    const bpjsKesCo = Math.round(bpjsKesBasis * BPJS_CONSTANTS.KES_EMPLOYER_RATE)
    const bpjsJhtCo = Math.round(grossInput * BPJS_CONSTANTS.TK_JHT_EMPLOYER_RATE)
    const bpjsJpCo = Math.round(bpjsJpBasis * BPJS_CONSTANTS.TK_JP_EMPLOYER_RATE)
    const bpjsJkkCo = Math.round(grossInput * BPJS_CONSTANTS.TK_JKK_DEFAULT_RATE)
    const bpjsJkmCo = Math.round(grossInput * BPJS_CONSTANTS.TK_JKM_DEFAULT_RATE)
    const totalBpjsCo = bpjsKesCo + bpjsJhtCo + bpjsJpCo + bpjsJkkCo + bpjsJkmCo

    const thp = Math.max(0, grossInput - totalBpjsEmp - tax.pph21Amount)

    return {
      tax,
      category,
      bpjsKesEmp,
      bpjsJhtEmp,
      bpjsJpEmp,
      totalBpjsEmp,
      bpjsKesCo,
      bpjsJhtCo,
      bpjsJpCo,
      bpjsJkkCo,
      bpjsJkmCo,
      totalBpjsCo,
      thp,
    }
  }, [grossInput, ptkp, taxMethod, hasNPWP])

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🧮</span> Kalkulator Interaktif Pajak PPh 21 TER 2024 & BPJS
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Simulasi pemotongan pajak bulanan berbasis PP 58/2023 dan PMK 168/2023.
          </div>
        </div>
        <span
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 99,
            background: 'rgba(37,99,235,0.1)',
            color: 'var(--primary)',
            border: '1px solid rgba(37,99,235,0.2)',
          }}
        >
          Kategori TER: {result.category}
        </span>
      </div>

      {/* Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {/* Gross Salary Input */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
            PENGHASILAN BRUTO BULANAN
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: 10, fontSize: 13, fontWeight: 700, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
              Rp
            </span>
            <input
              type="number"
              min={0}
              step={500000}
              value={grossInput}
              onChange={e => setGrossInput(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 14px 9px 40px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                fontFamily: 'JetBrains Mono',
                fontSize: 14,
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => setGrossInput(p.amount)}
                style={{
                  fontSize: 10.5,
                  fontFamily: 'Outfit',
                  padding: '3px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: grossInput === p.amount ? 'var(--primary)' : 'var(--card)',
                  color: grossInput === p.amount ? '#fff' : 'var(--muted-foreground)',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* PTKP Selector */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
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
              background: 'var(--muted)',
              color: 'var(--foreground)',
              fontFamily: 'JetBrains Mono',
              fontSize: 13,
              outline: 'none',
            }}
          >
            <option value="TK/0">TK/0 — Kategori A (PTKP Rp 54 Jt)</option>
            <option value="TK/1">TK/1 — Kategori A (PTKP Rp 58.5 Jt)</option>
            <option value="K/0">K/0 — Kategori A (PTKP Rp 58.5 Jt)</option>
            <option value="TK/2">TK/2 — Kategori B (PTKP Rp 63 Jt)</option>
            <option value="K/1">K/1 — Kategori B (PTKP Rp 63 Jt)</option>
            <option value="TK/3">TK/3 — Kategori B (PTKP Rp 67.5 Jt)</option>
            <option value="K/2">K/2 — Kategori B (PTKP Rp 67.5 Jt)</option>
            <option value="K/3">K/3 — Kategori C (PTKP Rp 72 Jt)</option>
          </select>
        </div>

        {/* Tax Method & NPWP */}
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, fontFamily: 'Outfit' }}>
            METODE PAJAK
          </label>
          <select
            value={taxMethod}
            onChange={e => setTaxMethod(e.target.value as TaxMethod)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              color: 'var(--foreground)',
              fontFamily: 'Outfit',
              fontSize: 13,
              outline: 'none',
            }}
          >
            <option value="gross">Gross (Dipotong dari gaji)</option>
            <option value="gross_up">Gross-Up (Tunjangan pajak)</option>
            <option value="nett">Nett (Ditanggung perusahaan)</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--foreground)', marginTop: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={hasNPWP} onChange={e => setHasNPWP(e.target.checked)} />
            <span>Memiliki NPWP Valid (Non-penalti)</span>
          </label>
        </div>
      </div>

      {/* Calculation Breakdown Result Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          padding: '16px',
          borderRadius: 14,
          background: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Tarif Efektif (TER)</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 17, color: 'var(--primary)', marginTop: 2 }}>
            {(result.tax.terRate * 100).toFixed(2)}%
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Tabel TER {result.category} (PP 58/2023)
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Potongan PPh 21</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 17, color: '#ef4444', marginTop: 2 }}>
            {formatIDR(result.tax.pph21Amount)}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
            {taxMethod === 'gross' ? 'Dipotong dari bruto' : 'Disesuaikan metode'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>Total BPJS Karyawan</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 17, color: '#f59e0b', marginTop: 2 }}>
            {formatIDR(result.totalBpjsEmp)}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Kes (1%) + JHT (2%) + JP (1%)
          </div>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#059669', fontFamily: 'Outfit', fontWeight: 700 }}>Estimasi Take Home Pay</div>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: '#059669', marginTop: 2 }}>
            {formatIDR(result.thp)}
          </div>
          <div style={{ fontSize: 10.5, color: '#059669', marginTop: 2 }}>
            Gaji Bersih Diterima
          </div>
        </div>
      </div>
    </div>
  )
}
