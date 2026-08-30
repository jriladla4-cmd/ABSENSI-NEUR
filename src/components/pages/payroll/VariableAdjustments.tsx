'use client'

import { useState } from 'react'
import type { PayrollAdjustment } from '@/lib/payroll-types'
import { employeeDirectory } from '@/lib/payroll-mockdb'
import { formatIDR } from '@/lib/payroll-calc'
import ModalOverlay from '@/components/ModalOverlay'

interface VariableAdjustmentsProps {
  period: string
  adjustments: PayrollAdjustment[]
  onUpdateAdjustment: (adj: PayrollAdjustment) => void
  onSyncAttendance: () => void
  onToast: (msg: string) => void
  readOnly?: boolean
}

export default function VariableAdjustments({
  period,
  adjustments,
  onUpdateAdjustment,
  onSyncAttendance,
  onToast,
  readOnly = false,
}: VariableAdjustmentsProps) {
  const [editingAdj, setEditingAdj] = useState<PayrollAdjustment | null>(null)
  const [syncing, setSyncing] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      onSyncAttendance()
      setSyncing(false)
      onToast('Data lembur dan keterlambatan presensi berhasil disinkronkan!')
    }, 600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
            Input Variabel & Penyesuaian Gaji ({period})
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Kelola data lembur, bonus kinerja, insentif, cicilan kasbon, dan potongan kehadiran sebelum kalkulasi final.
          </div>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ display: 'inline-block', animation: syncing ? 'spin 1s infinite linear' : 'none' }}>
              🔄
            </span>
            {syncing ? 'Menyinkronkan...' : 'Sinkronkan dari Presensi'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--muted)' }}>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Karyawan
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Lembur
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Bonus & Insentif
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Potongan Absen
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Cicilan Kasbon
                </th>
                <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  Catatan
                </th>
                {!readOnly && (
                  <th style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 700, fontSize: 11.5, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'center' }}>
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {employeeDirectory.map(emp => {
                const adj = adjustments.find(a => a.employeeId === emp.id) || {
                  employeeId: emp.id,
                  period,
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

                const totalEarningVar = (adj.overtimePay || 0) + (adj.bonus || 0) + (adj.incentive || 0)
                const totalDeductVar = (adj.lateDeduction || 0) + (adj.unpaidLeaveDeduction || 0) + (adj.kasbonDeduction || 0) + (adj.otherDeduction || 0)

                return (
                  <tr
                    key={emp.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                    className="hover:bg-muted/40"
                  >
                    {/* Employee info */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: `${emp.color}22`,
                            border: `1.5px solid ${emp.color}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Outfit',
                            fontWeight: 700,
                            fontSize: 12.5,
                            color: emp.color,
                          }}
                        >
                          {emp.avatar}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                            {emp.jabatan} · {emp.dept}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Overtime */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 12.5, color: adj.overtimePay > 0 ? '#10b981' : 'var(--muted-foreground)' }}>
                        {formatIDR(adj.overtimePay)}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                        {adj.overtimeHours} Jam disetujui
                      </div>
                    </td>

                    {/* Bonus & Incentive */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 12.5, color: totalEarningVar > 0 ? '#2563eb' : 'var(--muted-foreground)' }}>
                        {formatIDR((adj.bonus || 0) + (adj.incentive || 0))}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                        Bonus: {formatIDR(adj.bonus)} · Ins: {formatIDR(adj.incentive)}
                      </div>
                    </td>

                    {/* Attendance Deductions */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 12.5, color: (adj.lateDeduction + adj.unpaidLeaveDeduction) > 0 ? '#ef4444' : 'var(--muted-foreground)' }}>
                        {formatIDR(adj.lateDeduction + adj.unpaidLeaveDeduction)}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-foreground)' }}>
                        {adj.lateCount}x Telat · {adj.unpaidLeaveDays} Hari Alfa
                      </div>
                    </td>

                    {/* Kasbon */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 12.5, color: adj.kasbonDeduction > 0 ? '#f59e0b' : 'var(--muted-foreground)' }}>
                        {formatIDR(adj.kasbonDeduction)}
                      </div>
                    </td>

                    {/* Notes */}
                    <td style={{ padding: '12px 14px', fontSize: 11.5, color: 'var(--muted-foreground)', maxWidth: 200 }}>
                      {adj.notes || '—'}
                    </td>

                    {/* Actions */}
                    {!readOnly && (
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setEditingAdj(adj)}
                          className="btn-ghost"
                          style={{
                            padding: '5px 10px',
                            fontSize: 12,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                          }}
                        >
                          ✏️ Ubah
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Adjustment Modal */}
      {editingAdj && (
        <EditAdjustmentModal
          adj={editingAdj}
          onSave={updated => {
            onUpdateAdjustment(updated)
            setEditingAdj(null)
            onToast('Variabel gaji berhasil diperbarui.')
          }}
          onClose={() => setEditingAdj(null)}
        />
      )}
    </div>
  )
}

// ─── Modal for Editing Variables ───────────────────────────────────────────────

function EditAdjustmentModal({
  adj,
  onSave,
  onClose,
}: {
  adj: PayrollAdjustment
  onSave: (updated: PayrollAdjustment) => void
  onClose: () => void
}) {
  const emp = employeeDirectory.find(e => e.id === adj.employeeId)!

  const [otHours, setOtHours] = useState(adj.overtimeHours || 0)
  const [otPay, setOtPay] = useState(adj.overtimePay || 0)
  const [bonus, setBonus] = useState(adj.bonus || 0)
  const [incentive, setIncentive] = useState(adj.incentive || 0)
  const [lateCount, setLateCount] = useState(adj.lateCount || 0)
  const [lateDeduction, setLateDeduction] = useState(adj.lateDeduction || 0)
  const [unpaidDays, setUnpaidDays] = useState(adj.unpaidLeaveDays || 0)
  const [unpaidDeduction, setUnpaidDeduction] = useState(adj.unpaidLeaveDeduction || 0)
  const [kasbon, setKasbon] = useState(adj.kasbonDeduction || 0)
  const [otherDeduct, setOtherDeduct] = useState(adj.otherDeduction || 0)
  const [notes, setNotes] = useState(adj.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...adj,
      overtimeHours: Number(otHours),
      overtimePay: Number(otPay),
      bonus: Number(bonus),
      incentive: Number(incentive),
      lateCount: Number(lateCount),
      lateDeduction: Number(lateDeduction),
      unpaidLeaveDays: Number(unpaidDays),
      unpaidLeaveDeduction: Number(unpaidDeduction),
      kasbonDeduction: Number(kasbon),
      otherDeduction: Number(otherDeduct),
      notes,
    })
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="modal-panel"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--foreground)' }}>
              Edit Penyesuaian: {emp.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
              Periode {adj.period} · {emp.jabatan}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: 'var(--muted-foreground)', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                Jam Lembur (Hours)
              </label>
              <input
                type="number"
                min={0}
                value={otHours}
                onChange={e => setOtHours(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                Uang Lembur (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={otPay}
                onChange={e => setOtPay(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                Bonus Kinerja (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={bonus}
                onChange={e => setBonus(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                Insentif / Komisi (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={incentive}
                onChange={e => setIncentive(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>
                Potongan Telat (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={25000}
                value={lateDeduction}
                onChange={e => setLateDeduction(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>
                Potongan Unpaid Leave (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={unpaidDeduction}
                onChange={e => setUnpaidDeduction(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>
                Cicilan Kasbon / Pinjaman (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={kasbon}
                onChange={e => setKasbon(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>
                Potongan Lainnya (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={otherDeduct}
                onChange={e => setOtherDeduct(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 4 }}>
              Catatan Penyesuaian
            </label>
            <input
              type="text"
              placeholder="e.g. Lembur deploy release v2.4"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: 12.5 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12.5 }}>
              Batal
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: 12.5 }}>
              Simpan
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  )
}
