// ─── Payroll State & Operations Hooks ──────────────────────────────────────────
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type {
  EmployeeSalaryConfig,
  PayrollAdjustment,
  PayrollPeriodRecord,
  Payslip,
  PayrollStatus,
  DisbursementStatus,
  DepartmentPayrollSummary,
} from './payroll-types'
import {
  defaultSalaryConfigs,
  defaultAdjustments202608,
  defaultPeriods,
  employeeDirectory,
  generateSeedPayslips,
  loadPayrollStorage,
  savePayrollStorage,
} from './payroll-mockdb'
import { calculatePayslip } from './payroll-calc'

const STORAGE_KEYS = {
  CONFIGS: 'hadir_payroll_configs_v1',
  ADJUSTMENTS: 'hadir_payroll_adjustments_v1',
  PERIODS: 'hadir_payroll_periods_v1',
  PAYSLIPS: 'hadir_payroll_payslips_v1',
}

export function usePayroll() {
  const [loading, setLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState<string>('2026-08')

  // Core state loaded from LocalStorage (with fallback)
  const [periods, setPeriods] = useState<PayrollPeriodRecord[]>(() =>
    loadPayrollStorage(STORAGE_KEYS.PERIODS, defaultPeriods)
  )
  const [salaryConfigs, setSalaryConfigs] = useState<EmployeeSalaryConfig[]>(() =>
    loadPayrollStorage(STORAGE_KEYS.CONFIGS, defaultSalaryConfigs)
  )
  const [adjustments, setAdjustments] = useState<Record<string, PayrollAdjustment[]>>(() =>
    loadPayrollStorage(STORAGE_KEYS.ADJUSTMENTS, {
      '2026-08': defaultAdjustments202608,
      '2026-07': defaultAdjustments202608,
      '2026-06': defaultAdjustments202608,
    })
  )
  const [allPayslips, setAllPayslips] = useState<Record<string, Payslip[]>>(() =>
    loadPayrollStorage(STORAGE_KEYS.PAYSLIPS, {
      '2026-08': generateSeedPayslips('2026-08', defaultAdjustments202608),
      '2026-07': generateSeedPayslips('2026-07', defaultAdjustments202608),
      '2026-06': generateSeedPayslips('2026-06', defaultAdjustments202608),
    })
  )

  // Simulate initial fetch latency
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [])

  // Sync to localStorage
  useEffect(() => {
    if (!loading) {
      savePayrollStorage(STORAGE_KEYS.PERIODS, periods)
      savePayrollStorage(STORAGE_KEYS.CONFIGS, salaryConfigs)
      savePayrollStorage(STORAGE_KEYS.ADJUSTMENTS, adjustments)
      savePayrollStorage(STORAGE_KEYS.PAYSLIPS, allPayslips)
    }
  }, [periods, salaryConfigs, adjustments, allPayslips, loading])

  // Current active period payslips and record
  const currentPeriodRecord = useMemo(() => {
    return periods.find(p => p.period === activePeriod) || periods[0]
  }, [periods, activePeriod])

  const currentPayslips = useMemo(() => {
    return allPayslips[activePeriod] || []
  }, [allPayslips, activePeriod])

  const currentAdjustments = useMemo(() => {
    return adjustments[activePeriod] || []
  }, [adjustments, activePeriod])

  // ─── Recalculate Period ───────────────────────────────────────────────────────

  const recalculatePeriod = useCallback((targetPeriod: string) => {
    const periodAdjs = adjustments[targetPeriod] || defaultAdjustments202608
    const updatedPayslips: Payslip[] = salaryConfigs.map(config => {
      const emp = employeeDirectory.find(e => e.id === config.employeeId)!
      const adj = periodAdjs.find(a => a.employeeId === config.employeeId) || {
        employeeId: config.employeeId,
        period: targetPeriod,
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
      return calculatePayslip(config, adj, targetPeriod, emp)
    })

    // Compute period totals
    let totalGross = 0
    let totalDeductions = 0
    let totalNet = 0
    let totalPph21 = 0
    let totalBpjs = 0
    let totalCompanyCost = 0

    updatedPayslips.forEach(ps => {
      totalGross += ps.grossSalary
      totalDeductions += ps.totalDeductions
      totalNet += ps.netSalary
      totalPph21 += ps.pph21Amount
      totalBpjs += ps.totalBpjsEmployee
      totalCompanyCost += ps.grossSalary + ps.totalEmployerBenefit
    })

    setAllPayslips(prev => ({ ...prev, [targetPeriod]: updatedPayslips }))
    setPeriods(prev =>
      prev.map(p =>
        p.period === targetPeriod
          ? {
              ...p,
              totalGross,
              totalDeductions,
              totalNet,
              totalPph21,
              totalBpjs,
              totalCompanyCost,
              totalEmployees: updatedPayslips.length,
            }
          : p
      )
    )
  }, [adjustments, salaryConfigs])

  // ─── Update Salary Config ─────────────────────────────────────────────────────

  const updateSalaryConfig = useCallback((updatedConfig: EmployeeSalaryConfig) => {
    setSalaryConfigs(prev => {
      const idx = prev.findIndex(c => c.employeeId === updatedConfig.employeeId)
      const next = [...prev]
      if (idx >= 0) {
        next[idx] = { ...updatedConfig, updatedAt: new Date().toISOString() }
      } else {
        next.push({ ...updatedConfig, updatedAt: new Date().toISOString() })
      }
      return next
    })
  }, [])

  // Auto recalculate active period when configs or adjustments change
  useEffect(() => {
    if (!loading) {
      recalculatePeriod(activePeriod)
    }
  }, [salaryConfigs, adjustments, activePeriod, loading, recalculatePeriod])

  // ─── Update Adjustments ───────────────────────────────────────────────────────

  const updateAdjustment = useCallback((adj: PayrollAdjustment) => {
    setAdjustments(prev => {
      const periodList = prev[adj.period] ? [...prev[adj.period]] : []
      const idx = periodList.findIndex(a => a.employeeId === adj.employeeId)
      if (idx >= 0) {
        periodList[idx] = adj
      } else {
        periodList.push(adj)
      }
      return { ...prev, [adj.period]: periodList }
    })
  }, [])

  // ─── Sync Attendance to Adjustments ──────────────────────────────────────────

  const syncAttendanceData = useCallback((targetPeriod: string) => {
    // Attendance simulation: late counts & overtime mapped to IDR
    const simulatedAttendance = [
      { id: 1, lateCount: 1, lateFee: 50_000, otHours: 6, otPay: 850_000, unpaidDays: 0 },
      { id: 2, lateCount: 5, lateFee: 250_000, otHours: 0, otPay: 0, unpaidDays: 0 },
      { id: 3, lateCount: 0, lateFee: 0, otHours: 4, otPay: 400_000, unpaidDays: 1 },
      { id: 4, lateCount: 2, lateFee: 100_000, otHours: 2, otPay: 250_000, unpaidDays: 0 },
      { id: 5, lateCount: 0, lateFee: 0, otHours: 0, otPay: 0, unpaidDays: 0 },
      { id: 6, lateCount: 7, lateFee: 350_000, otHours: 10, otPay: 1_400_000, unpaidDays: 0 },
      { id: 7, lateCount: 2, lateFee: 100_000, otHours: 0, otPay: 0, unpaidDays: 3 },
      { id: 8, lateCount: 0, lateFee: 0, otHours: 0, otPay: 0, unpaidDays: 0 },
      { id: 9, lateCount: 1, lateFee: 50_000, otHours: 0, otPay: 0, unpaidDays: 0 },
      { id: 10, lateCount: 0, lateFee: 0, otHours: 0, otPay: 0, unpaidDays: 0 },
    ]

    setAdjustments(prev => {
      const currentList = prev[targetPeriod] || []
      const merged = simulatedAttendance.map(att => {
        const existing = currentList.find(a => a.employeeId === att.id)
        return {
          employeeId: att.id,
          period: targetPeriod,
          overtimeHours: att.otHours,
          overtimePay: att.otPay,
          bonus: existing?.bonus || 0,
          incentive: existing?.incentive || 0,
          lateCount: att.lateCount,
          lateDeduction: att.lateFee,
          unpaidLeaveDays: att.unpaidDays,
          unpaidLeaveDeduction: att.unpaidDays * 450_000,
          kasbonDeduction: existing?.kasbonDeduction || 0,
          otherDeduction: existing?.otherDeduction || 0,
          notes: existing?.notes || `Sync presensi: ${att.lateCount}x telat, ${att.otHours}j lembur`,
        }
      })
      return { ...prev, [targetPeriod]: merged }
    })
  }, [])

  // ─── Advance Period Status (Draft -> Review -> Approved -> Locked) ───────────

  const advancePeriodStatus = useCallback((
    targetPeriod: string,
    targetStatus: PayrollStatus,
    approverName: string = 'Fajar Nugroho (HR)'
  ) => {
    const now = new Date().toISOString()
    setPeriods(prev =>
      prev.map(p => {
        if (p.period !== targetPeriod) return p
        return {
          ...p,
          status: targetStatus,
          approvedBy: targetStatus === 'approved' || targetStatus === 'locked' ? approverName : p.approvedBy,
          approvedAt: targetStatus === 'approved' ? now : p.approvedAt,
          lockedAt: targetStatus === 'locked' ? now : p.lockedAt,
        }
      })
    )

    // Also update all payslips in that period
    setAllPayslips(prev => {
      const list = prev[targetPeriod] || []
      const updated = list.map(ps => ({
        ...ps,
        status: targetStatus,
        disbursementStatus: targetStatus === 'locked' ? ('paid' as DisbursementStatus) : ps.disbursementStatus,
        disbursedAt: targetStatus === 'locked' ? now : ps.disbursedAt,
      }))
      return { ...prev, [targetPeriod]: updated }
    })
  }, [])

  // ─── Update Disbursement Status ───────────────────────────────────────────────

  const updateDisbursementStatus = useCallback((
    targetPeriod: string,
    status: DisbursementStatus
  ) => {
    const now = new Date().toISOString()
    setAllPayslips(prev => {
      const list = prev[targetPeriod] || []
      const updated = list.map(ps => ({
        ...ps,
        disbursementStatus: status,
        disbursedAt: status === 'paid' ? now : undefined,
      }))
      return { ...prev, [targetPeriod]: updated }
    })
  }, [])

  // ─── Department Cost Aggregation ─────────────────────────────────────────────

  const departmentSummaries = useMemo<DepartmentPayrollSummary[]>(() => {
    const map = new Map<string, { count: number; gross: number; net: number; pph: number; bpjs: number }>()

    currentPayslips.forEach(ps => {
      const cur = map.get(ps.dept) || { count: 0, gross: 0, net: 0, pph: 0, bpjs: 0 }
      cur.count += 1
      cur.gross += ps.grossSalary
      cur.net += ps.netSalary
      cur.pph += ps.pph21Amount
      cur.bpjs += ps.totalBpjsEmployee
      map.set(ps.dept, cur)
    })

    return Array.from(map.entries()).map(([dept, data]) => ({
      dept,
      employeeCount: data.count,
      totalGross: data.gross,
      totalNet: data.net,
      totalPph21: data.pph,
      totalBpjs: data.bpjs,
      avgNetSalary: data.count > 0 ? Math.round(data.net / data.count) : 0,
    }))
  }, [currentPayslips])

  // ─── Reset to defaults ────────────────────────────────────────────────────────

  const resetToDefaults = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CONFIGS)
      localStorage.removeItem(STORAGE_KEYS.ADJUSTMENTS)
      localStorage.removeItem(STORAGE_KEYS.PERIODS)
      localStorage.removeItem(STORAGE_KEYS.PAYSLIPS)
    }
    setPeriods(defaultPeriods)
    setSalaryConfigs(defaultSalaryConfigs)
    setAdjustments({
      '2026-08': defaultAdjustments202608,
      '2026-07': defaultAdjustments202608,
      '2026-06': defaultAdjustments202608,
    })
    setAllPayslips({
      '2026-08': generateSeedPayslips('2026-08', defaultAdjustments202608),
      '2026-07': generateSeedPayslips('2026-07', defaultAdjustments202608),
      '2026-06': generateSeedPayslips('2026-06', defaultAdjustments202608),
    })
  }, [])

  return {
    loading,
    activePeriod,
    setActivePeriod,
    periods,
    currentPeriodRecord,
    currentPayslips,
    salaryConfigs,
    currentAdjustments,
    departmentSummaries,
    employeeDirectory,
    updateSalaryConfig,
    updateAdjustment,
    syncAttendanceData,
    advancePeriodStatus,
    updateDisbursementStatus,
    recalculatePeriod,
    resetToDefaults,
  }
}
