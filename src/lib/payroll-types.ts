// ─── Payroll Core Types & Interfaces ─────────────────────────────────────────
// Indonesian Payroll Standard (UU HPP / PP 58/2023 / PMK 168 / BPJS Regulations)

export type PTKPStatus =
  | 'TK/0' | 'TK/1' | 'TK/2' | 'TK/3'
  | 'K/0'  | 'K/1'  | 'K/2'  | 'K/3'

export type TaxMethod = 'gross' | 'gross_up' | 'nett'

export type PayrollStatus = 'draft' | 'review' | 'approved' | 'locked'

export type DisbursementStatus = 'unpaid' | 'processing' | 'paid'

export type SalaryComponentType =
  | 'allowance_fixed'
  | 'allowance_variable'
  | 'deduction_fixed'
  | 'deduction_variable'

// ─── Salary Component ─────────────────────────────────────────────────────────

export interface SalaryComponent {
  id: string
  name: string
  type: SalaryComponentType
  amount: number
  isTaxable: boolean
}

// ─── Employee Salary Configuration ─────────────────────────────────────────────

export interface FixedAllowances {
  position: number      // Tunjangan Jabatan / Posisi
  transport: number     // Tunjangan Transport
  meal: number          // Tunjangan Makan
  communication: number // Tunjangan Komunikasi / Pulsa
  other: number         // Tunjangan Tetap Lainnya
}

export interface TaxConfig {
  ptkp: PTKPStatus
  taxMethod: TaxMethod
  npwp?: string
  hasNPWP: boolean
}

export interface BpjsConfig {
  bpjsKesEnabled: boolean      // 1% Employee, 4% Employer (Max basis: 12.000.000)
  bpjsTkJhtEnabled: boolean    // 2% Employee, 3.7% Employer
  bpjsTkJpEnabled: boolean     // 1% Employee, 2% Employer (Max basis: 10.042.300)
  bpjsTkJkkRate: number        // Default: 0.24% Employer
  bpjsTkJkmRate: number        // Default: 0.30% Employer
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export interface EmployeeSalaryConfig {
  employeeId: number
  baseSalary: number
  fixedAllowances: FixedAllowances
  taxConfig: TaxConfig
  bpjsConfig: BpjsConfig
  bankDetails: BankDetails
  updatedAt?: string
}

// ─── Monthly Variable Input / Adjustments ──────────────────────────────────────

export interface PayrollAdjustment {
  employeeId: number
  period: string                 // e.g. '2026-08'
  overtimeHours: number
  overtimePay: number
  bonus: number
  incentive: number
  lateCount: number
  lateDeduction: number
  unpaidLeaveDays: number
  unpaidLeaveDeduction: number
  kasbonDeduction: number
  otherDeduction: number
  notes?: string
}

// ─── Generated Payslip ─────────────────────────────────────────────────────────

export interface Payslip {
  id: string                     // e.g. 'PS-202608-001'
  period: string                 // '2026-08'
  employeeId: number
  employeeName: string
  dept: string
  jabatan: string
  avatar: string
  color: string
  bankName: string
  accountNumber: string
  accountHolder: string
  npwp?: string
  ptkp: PTKPStatus
  taxMethod: TaxMethod

  // 1. Earnings (Penghasilan)
  baseSalary: number
  positionAllowance: number
  transportAllowance: number
  mealAllowance: number
  communicationAllowance: number
  otherFixedAllowance: number
  totalFixedAllowances: number
  
  overtimePay: number
  bonus: number
  incentive: number
  totalVariableEarnings: number
  grossSalary: number            // Penghasilan Bruto

  // 2. Employee Deductions (Potongan Karyawan)
  bpjsKesEmployee: number        // 1% BPJS Kes (cap 12jt)
  bpjsTkJhtEmployee: number      // 2% JHT
  bpjsTkJpEmployee: number       // 1% JP (cap 10.042.300)
  totalBpjsEmployee: number

  pph21Amount: number            // PPh 21 bulanan (TER / Pasal 17)
  terRate: number                // Tarif Efektif Rata-rata (e.g. 0.095 = 9.5%)
  terCategory: 'A' | 'B' | 'C'

  attendanceDeductions: number   // Potongan telat & alfa
  kasbonDeductions: number       // Cicilan kasbon / pinjaman
  otherDeductions: number
  totalDeductions: number

  // 3. Employer Paid Benefits (Tunjangan / Beban Perusahaan - Informasional)
  bpjsKesEmployer: number        // 4% BPJS Kes
  bpjsTkJhtEmployer: number      // 3.7% JHT
  bpjsTkJpEmployer: number       // 2% JP
  bpjsTkJkkEmployer: number      // 0.24% JKK
  bpjsTkJkmEmployer: number      // 0.30% JKM
  totalEmployerBenefit: number

  // 4. Net Salary (Take Home Pay)
  netSalary: number              // Gaji Bersih (Bruto - Total Potongan)

  // 5. Meta & Status
  disbursementStatus: DisbursementStatus
  disbursedAt?: string
  status: PayrollStatus
  generatedAt: string
}

// ─── Payroll Period Summary ───────────────────────────────────────────────────

export interface PayrollPeriodRecord {
  period: string                 // '2026-08'
  label: string                  // 'Agustus 2026'
  startDate: string
  endDate: string
  payDate: string
  status: PayrollStatus
  totalEmployees: number
  totalGross: number
  totalDeductions: number
  totalNet: number
  totalCompanyCost: number
  totalPph21: number
  totalBpjs: number
  approvedBy?: string
  approvedAt?: string
  lockedAt?: string
}

// ─── Department Payroll Summary ───────────────────────────────────────────────

export interface DepartmentPayrollSummary {
  dept: string
  employeeCount: number
  totalGross: number
  totalNet: number
  totalPph21: number
  totalBpjs: number
  avgNetSalary: number
}

// ─── Disbursement Batch ───────────────────────────────────────────────────────

export interface DisbursementBatch {
  id: string
  period: string
  bankName: string
  totalRecords: number
  totalAmount: number
  status: DisbursementStatus
  createdAt: string
  processedAt?: string
  referenceNumber: string
}
