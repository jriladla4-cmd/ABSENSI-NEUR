// ─── Payroll Mock Database ───────────────────────────────────────────────────
// Seed data & local storage backed repository for payroll operations

import type {
  EmployeeSalaryConfig,
  PayrollAdjustment,
  PayrollPeriodRecord,
  Payslip,
  DisbursementBatch,
} from './payroll-types'
import { calculatePayslip } from './payroll-calc'

// ─── Reference Employee Info ───────────────────────────────────────────────────

export const employeeDirectory = [
  { id: 1, name: 'Rina Setiawati', dept: 'Engineering', jabatan: 'Senior Frontend Dev', avatar: 'RS', color: '#2563eb', email: 'rina@hadir.id' },
  { id: 2, name: 'Budi Santoso', dept: 'Marketing', jabatan: 'Marketing Manager', avatar: 'BS', color: '#7c3aed', email: 'budi@hadir.id' },
  { id: 3, name: 'Dita Permata', dept: 'Finance', jabatan: 'Finance Analyst', avatar: 'DP', color: '#0d9488', email: 'dita@hadir.id' },
  { id: 4, name: 'Fajar Nugroho', dept: 'HR', jabatan: 'HR Specialist', avatar: 'FN', color: '#f59e0b', email: 'fajar@hadir.id' },
  { id: 5, name: 'Lana Kusuma', dept: 'Design', jabatan: 'UI/UX Designer', avatar: 'LK', color: '#ec4899', email: 'lana@hadir.id' },
  { id: 6, name: 'Marco Hendra', dept: 'Engineering', jabatan: 'Backend Engineer', avatar: 'MH', color: '#06b6d4', email: 'marco@hadir.id' },
  { id: 7, name: 'Nadia Putri', dept: 'Legal', jabatan: 'Legal Counsel', avatar: 'NP', color: '#ef4444', email: 'nadia@hadir.id' },
  { id: 8, name: 'Rizky Firmansyah', dept: 'Sales', jabatan: 'Account Executive', avatar: 'RF', color: '#10b981', email: 'rizky@hadir.id' },
  { id: 9, name: 'Yuli Andini', dept: 'Sales', jabatan: 'Sales Manager', avatar: 'YA', color: '#f97316', email: 'yuli@hadir.id' },
  { id: 10, name: 'Doni Pratama', dept: 'Finance', jabatan: 'CFO', avatar: 'DP', color: '#6366f1', email: 'doni@hadir.id' },
]

// ─── Default Salary Configurations ─────────────────────────────────────────────

export const defaultSalaryConfigs: EmployeeSalaryConfig[] = [
  {
    employeeId: 1,
    baseSalary: 16_500_000,
    fixedAllowances: { position: 2_000_000, transport: 1_000_000, meal: 1_000_000, communication: 300_000, other: 0 },
    taxConfig: { ptkp: 'K/0', taxMethod: 'gross', npwp: '81.234.567.8-012.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BCA', accountNumber: '8820194821', accountHolder: 'RINA SETIAWATI' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 2,
    baseSalary: 18_000_000,
    fixedAllowances: { position: 3_000_000, transport: 1_200_000, meal: 1_000_000, communication: 500_000, other: 0 },
    taxConfig: { ptkp: 'K/2', taxMethod: 'gross', npwp: '72.345.678.9-023.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'Mandiri', accountNumber: '137001928472', accountHolder: 'BUDI SANTOSO' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 3,
    baseSalary: 9_500_000,
    fixedAllowances: { position: 1_000_000, transport: 800_000, meal: 800_000, communication: 200_000, other: 0 },
    taxConfig: { ptkp: 'TK/0', taxMethod: 'gross', npwp: '91.876.543.2-034.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BCA', accountNumber: '6040192841', accountHolder: 'DITA PERMATA' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 4,
    baseSalary: 12_000_000,
    fixedAllowances: { position: 1_500_000, transport: 1_000_000, meal: 1_000_000, communication: 300_000, other: 0 },
    taxConfig: { ptkp: 'K/1', taxMethod: 'gross', npwp: '63.987.654.3-045.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BNI', accountNumber: '0812938471', accountHolder: 'FAJAR NUGROHO' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 5,
    baseSalary: 11_500_000,
    fixedAllowances: { position: 1_200_000, transport: 800_000, meal: 800_000, communication: 250_000, other: 0 },
    taxConfig: { ptkp: 'TK/0', taxMethod: 'gross', npwp: '54.123.456.7-056.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BCA', accountNumber: '7310294821', accountHolder: 'LANA KUSUMA' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 6,
    baseSalary: 15_000_000,
    fixedAllowances: { position: 2_000_000, transport: 1_000_000, meal: 1_000_000, communication: 300_000, other: 0 },
    taxConfig: { ptkp: 'TK/1', taxMethod: 'gross', npwp: '45.234.567.8-067.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'Mandiri', accountNumber: '122008472910', accountHolder: 'MARCO HENDRA' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 7,
    baseSalary: 13_000_000,
    fixedAllowances: { position: 1_500_000, transport: 900_000, meal: 900_000, communication: 250_000, other: 0 },
    taxConfig: { ptkp: 'TK/0', taxMethod: 'gross', npwp: '36.345.678.9-078.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BCA', accountNumber: '5220194829', accountHolder: 'NADIA PUTRI' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 8,
    baseSalary: 8_500_000,
    fixedAllowances: { position: 500_000, transport: 1_000_000, meal: 800_000, communication: 400_000, other: 0 },
    taxConfig: { ptkp: 'TK/0', taxMethod: 'gross', npwp: '27.456.789.0-089.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BRI', accountNumber: '034101928472501', accountHolder: 'RIZKY FIRMANSYAH' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 9,
    baseSalary: 16_000_000,
    fixedAllowances: { position: 2_500_000, transport: 1_200_000, meal: 1_000_000, communication: 500_000, other: 0 },
    taxConfig: { ptkp: 'K/1', taxMethod: 'gross', npwp: '18.567.890.1-090.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BCA', accountNumber: '8440192831', accountHolder: 'YULI ANDINI' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    employeeId: 10,
    baseSalary: 35_000_000,
    fixedAllowances: { position: 6_000_000, transport: 2_000_000, meal: 1_500_000, communication: 800_000, other: 0 },
    taxConfig: { ptkp: 'K/3', taxMethod: 'gross', npwp: '09.678.901.2-101.000', hasNPWP: true },
    bpjsConfig: { bpjsKesEnabled: true, bpjsTkJhtEnabled: true, bpjsTkJpEnabled: true, bpjsTkJkkRate: 0.0024, bpjsTkJkmRate: 0.0030 },
    bankDetails: { bankName: 'BCA', accountNumber: '0010928471', accountHolder: 'DONI PRATAMA' },
    updatedAt: '2026-08-01T08:00:00Z',
  },
]

// ─── Default Monthly Adjustments (Period: 2026-08) ─────────────────────────────

export const defaultAdjustments202608: PayrollAdjustment[] = [
  { employeeId: 1, period: '2026-08', overtimeHours: 6, overtimePay: 850_000, bonus: 0, incentive: 0, lateCount: 1, lateDeduction: 50_000, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 0, otherDeduction: 0, notes: 'Lembur deploy release v2.4' },
  { employeeId: 2, period: '2026-08', overtimeHours: 0, overtimePay: 0, bonus: 2_000_000, incentive: 500_000, lateCount: 5, lateDeduction: 250_000, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 1_000_000, otherDeduction: 0, notes: 'Bonus campaign Q3, cicilan kasbon #2' },
  { employeeId: 3, period: '2026-08', overtimeHours: 4, overtimePay: 400_000, bonus: 0, incentive: 0, lateCount: 0, lateDeduction: 0, unpaidLeaveDays: 1, unpaidLeaveDeduction: 450_000, kasbonDeduction: 0, otherDeduction: 0, notes: 'Potongan 1 hari unexcused absence' },
  { employeeId: 4, period: '2026-08', overtimeHours: 2, overtimePay: 250_000, bonus: 0, incentive: 0, lateCount: 2, lateDeduction: 100_000, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 0, otherDeduction: 0 },
  { employeeId: 5, period: '2026-08', overtimeHours: 0, overtimePay: 0, bonus: 500_000, incentive: 0, lateCount: 0, lateDeduction: 0, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 500_000, otherDeduction: 0, notes: 'Bonus redesign project' },
  { employeeId: 6, period: '2026-08', overtimeHours: 10, overtimePay: 1_400_000, bonus: 0, incentive: 0, lateCount: 7, lateDeduction: 350_000, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 0, otherDeduction: 0, notes: 'Lembur migrasi DB' },
  { employeeId: 7, period: '2026-08', overtimeHours: 0, overtimePay: 0, bonus: 0, incentive: 0, lateCount: 2, lateDeduction: 100_000, unpaidLeaveDays: 3, unpaidLeaveDeduction: 1_500_000, kasbonDeduction: 0, otherDeduction: 0, notes: 'Potongan 3 hari izin tanpa gaji' },
  { employeeId: 8, period: '2026-08', overtimeHours: 0, overtimePay: 0, bonus: 1_500_000, incentive: 2_200_000, lateCount: 0, lateDeduction: 0, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 0, otherDeduction: 0, notes: 'Komisi closing 3 klien enterprise' },
  { employeeId: 9, period: '2026-08', overtimeHours: 0, overtimePay: 0, bonus: 3_000_000, incentive: 1_500_000, lateCount: 1, lateDeduction: 50_000, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 0, otherDeduction: 0, notes: 'Bonus target sales tim' },
  { employeeId: 10, period: '2026-08', overtimeHours: 0, overtimePay: 0, bonus: 0, incentive: 0, lateCount: 0, lateDeduction: 0, unpaidLeaveDays: 0, unpaidLeaveDeduction: 0, kasbonDeduction: 0, otherDeduction: 0 },
]

// ─── Generate Seed Payslips for Period ─────────────────────────────────────────

export function generateSeedPayslips(period: string, adjustments: PayrollAdjustment[]): Payslip[] {
  return defaultSalaryConfigs.map(config => {
    const emp = employeeDirectory.find(e => e.id === config.employeeId)!
    const adj = adjustments.find(a => a.employeeId === config.employeeId) || {
      employeeId: config.employeeId,
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

    const payslip = calculatePayslip(config, adj, period, emp)
    if (period === '2026-06' || period === '2026-07') {
      payslip.status = 'locked'
      payslip.disbursementStatus = 'paid'
      payslip.disbursedAt = `${period}-25T10:00:00Z`
    } else {
      payslip.status = 'review'
      payslip.disbursementStatus = 'unpaid'
    }
    return payslip
  })
}

// ─── Default Periods ──────────────────────────────────────────────────────────

export const defaultPeriods: PayrollPeriodRecord[] = [
  {
    period: '2026-08',
    label: 'Agustus 2026',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    payDate: '2026-08-25',
    status: 'review',
    totalEmployees: 10,
    totalGross: 198_150_000,
    totalDeductions: 28_410_500,
    totalNet: 169_739_500,
    totalCompanyCost: 218_420_000,
    totalPph21: 18_920_000,
    totalBpjs: 16_850_000,
  },
  {
    period: '2026-07',
    label: 'Juli 2026',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    payDate: '2026-07-25',
    status: 'locked',
    totalEmployees: 10,
    totalGross: 192_400_000,
    totalDeductions: 27_100_000,
    totalNet: 165_300_000,
    totalCompanyCost: 212_100_000,
    totalPph21: 18_100_000,
    totalBpjs: 16_850_000,
    approvedBy: 'Fajar Nugroho (HR)',
    approvedAt: '2026-07-24T14:30:00Z',
    lockedAt: '2026-07-25T17:00:00Z',
  },
  {
    period: '2026-06',
    label: 'Juni 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    payDate: '2026-06-25',
    status: 'locked',
    totalEmployees: 10,
    totalGross: 189_000_000,
    totalDeductions: 26_500_000,
    totalNet: 162_500_000,
    totalCompanyCost: 208_400_000,
    totalPph21: 17_600_000,
    totalBpjs: 16_850_000,
    approvedBy: 'Fajar Nugroho (HR)',
    approvedAt: '2026-06-24T15:00:00Z',
    lockedAt: '2026-06-25T17:00:00Z',
  },
]

// ─── LocalStorage Persistence Keys ─────────────────────────────────────────────

const STORAGE_KEYS = {
  CONFIGS: 'hadir_payroll_configs_v1',
  ADJUSTMENTS: 'hadir_payroll_adjustments_v1',
  PERIODS: 'hadir_payroll_periods_v1',
  PAYSLIPS: 'hadir_payroll_payslips_v1',
}

// ─── Safe Local Storage Helpers ────────────────────────────────────────────────

export function loadPayrollStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function savePayrollStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save payroll storage:', err)
  }
}
