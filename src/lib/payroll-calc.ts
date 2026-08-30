// ─── Indonesian Payroll Calculation Engine ─────────────────────────────────────
// Pure calculation functions for PPh 21 TER 2024 (PP 58/2023 & PMK 168), BPJS & Net Take Home Pay

import type {
  EmployeeSalaryConfig,
  PayrollAdjustment,
  Payslip,
  PTKPStatus,
  TaxMethod,
} from './payroll-types'

// ─── BPJS Statutory Constants ──────────────────────────────────────────────────

export const BPJS_CONSTANTS = {
  // BPJS Kesehatan
  KES_EMPLOYEE_RATE: 0.01,         // 1% dipotong dari gaji karyawan
  KES_EMPLOYER_RATE: 0.04,         // 4% ditanggung pemberi kerja
  KES_MAX_BASIS: 12_000_000,       // Batas maksimal dasar upah BPJS Kesehatan

  // BPJS Ketenagakerjaan
  TK_JHT_EMPLOYEE_RATE: 0.02,      // 2% JHT Karyawan
  TK_JHT_EMPLOYER_RATE: 0.037,     // 3.7% JHT Perusahaan
  TK_JP_EMPLOYEE_RATE: 0.01,       // 1% JP Karyawan
  TK_JP_EMPLOYER_RATE: 0.02,       // 2% JP Perusahaan
  TK_JP_MAX_BASIS: 10_042_300,     // Batas maksimal dasar upah Jaminan Pensiun 2024
  TK_JKK_DEFAULT_RATE: 0.0024,     // 0.24% JKK (Tingkat risiko sangat rendah)
  TK_JKM_DEFAULT_RATE: 0.0030,     // 0.30% Jaminan Kematian
}

// ─── TER Category Mapping (PP 58/2023) ─────────────────────────────────────────

export function getTERCategory(ptkp: PTKPStatus): 'A' | 'B' | 'C' {
  switch (ptkp) {
    case 'TK/0':
    case 'TK/1':
    case 'K/0':
      return 'A'
    case 'TK/2':
    case 'TK/3':
    case 'K/1':
    case 'K/2':
      return 'B'
    case 'K/3':
      return 'C'
    default:
      return 'A'
  }
}

// ─── TER Rate Tables ──────────────────────────────────────────────────────────

interface TERBracket {
  max: number
  rate: number
}

const TER_A_BRACKETS: TERBracket[] = [
  { max: 5_400_000, rate: 0.00 },
  { max: 5_650_000, rate: 0.0025 },
  { max: 5_950_000, rate: 0.005 },
  { max: 6_300_000, rate: 0.0075 },
  { max: 6_750_000, rate: 0.01 },
  { max: 7_500_000, rate: 0.0125 },
  { max: 8_550_000, rate: 0.015 },
  { max: 9_650_000, rate: 0.0175 },
  { max: 10_050_000, rate: 0.02 },
  { max: 10_350_000, rate: 0.0225 },
  { max: 10_700_000, rate: 0.025 },
  { max: 11_050_000, rate: 0.03 },
  { max: 11_600_000, rate: 0.035 },
  { max: 12_500_000, rate: 0.04 },
  { max: 13_750_000, rate: 0.05 },
  { max: 15_100_000, rate: 0.06 },
  { max: 16_950_000, rate: 0.07 },
  { max: 19_750_000, rate: 0.08 },
  { max: 24_150_000, rate: 0.09 },
  { max: 26_450_000, rate: 0.10 },
  { max: 28_000_000, rate: 0.11 },
  { max: 30_050_000, rate: 0.12 },
  { max: 32_400_000, rate: 0.13 },
  { max: 35_400_000, rate: 0.14 },
  { max: 39_100_000, rate: 0.15 },
  { max: 43_850_000, rate: 0.16 },
  { max: 47_800_000, rate: 0.17 },
  { max: 51_400_000, rate: 0.18 },
  { max: 56_300_000, rate: 0.19 },
  { max: 62_200_000, rate: 0.20 },
  { max: 68_600_000, rate: 0.21 },
  { max: 77_500_000, rate: 0.22 },
  { max: 89_000_000, rate: 0.23 },
  { max: 103_000_000, rate: 0.24 },
  { max: 125_000_000, rate: 0.25 },
  { max: 157_000_000, rate: 0.26 },
  { max: 206_000_000, rate: 0.27 },
  { max: 337_000_000, rate: 0.28 },
  { max: 454_000_000, rate: 0.29 },
  { max: 550_000_000, rate: 0.30 },
  { max: 695_000_000, rate: 0.31 },
  { max: 910_000_000, rate: 0.32 },
  { max: 1_400_000_000, rate: 0.33 },
  { max: Infinity, rate: 0.34 },
]

const TER_B_BRACKETS: TERBracket[] = [
  { max: 6_200_000, rate: 0.00 },
  { max: 6_500_000, rate: 0.0025 },
  { max: 6_850_000, rate: 0.005 },
  { max: 7_300_000, rate: 0.0075 },
  { max: 9_200_000, rate: 0.01 },
  { max: 10_750_000, rate: 0.015 },
  { max: 11_250_000, rate: 0.02 },
  { max: 11_600_000, rate: 0.025 },
  { max: 12_600_000, rate: 0.03 },
  { max: 13_600_000, rate: 0.04 },
  { max: 14_950_000, rate: 0.05 },
  { max: 16_400_000, rate: 0.06 },
  { max: 18_450_000, rate: 0.07 },
  { max: 21_850_000, rate: 0.08 },
  { max: 26_000_000, rate: 0.09 },
  { max: 27_700_000, rate: 0.10 },
  { max: 29_350_000, rate: 0.11 },
  { max: 31_450_000, rate: 0.12 },
  { max: 33_950_000, rate: 0.13 },
  { max: 37_100_000, rate: 0.14 },
  { max: 41_100_000, rate: 0.15 },
  { max: 45_800_000, rate: 0.16 },
  { max: 49_500_000, rate: 0.17 },
  { max: 53_800_000, rate: 0.18 },
  { max: 58_500_000, rate: 0.19 },
  { max: 64_000_000, rate: 0.20 },
  { max: 71_000_000, rate: 0.21 },
  { max: 80_000_000, rate: 0.22 },
  { max: 93_000_000, rate: 0.23 },
  { max: 109_000_000, rate: 0.24 },
  { max: 129_000_000, rate: 0.25 },
  { max: 163_000_000, rate: 0.26 },
  { max: 211_000_000, rate: 0.27 },
  { max: 374_000_000, rate: 0.28 },
  { max: 459_000_000, rate: 0.29 },
  { max: 555_000_000, rate: 0.30 },
  { max: 704_000_000, rate: 0.31 },
  { max: 957_000_000, rate: 0.32 },
  { max: 1_405_000_000, rate: 0.33 },
  { max: Infinity, rate: 0.34 },
]

const TER_C_BRACKETS: TERBracket[] = [
  { max: 6_600_000, rate: 0.00 },
  { max: 6_950_000, rate: 0.0025 },
  { max: 7_350_000, rate: 0.005 },
  { max: 7_800_000, rate: 0.0075 },
  { max: 8_850_000, rate: 0.01 },
  { max: 9_800_000, rate: 0.0125 },
  { max: 10_950_000, rate: 0.015 },
  { max: 11_200_000, rate: 0.0175 },
  { max: 12_050_000, rate: 0.02 },
  { max: 12_950_000, rate: 0.03 },
  { max: 14_150_000, rate: 0.04 },
  { max: 15_550_000, rate: 0.05 },
  { max: 17_050_000, rate: 0.06 },
  { max: 19_500_000, rate: 0.07 },
  { max: 22_700_000, rate: 0.08 },
  { max: 26_600_000, rate: 0.09 },
  { max: 28_100_000, rate: 0.10 },
  { max: 30_100_000, rate: 0.11 },
  { max: 32_600_000, rate: 0.12 },
  { max: 35_400_000, rate: 0.13 },
  { max: 38_900_000, rate: 0.14 },
  { max: 43_000_000, rate: 0.15 },
  { max: 47_400_000, rate: 0.16 },
  { max: 51_200_000, rate: 0.17 },
  { max: 55_800_000, rate: 0.18 },
  { max: 60_400_000, rate: 0.19 },
  { max: 66_700_000, rate: 0.20 },
  { max: 74_500_000, rate: 0.21 },
  { max: 83_200_000, rate: 0.22 },
  { max: 95_600_000, rate: 0.23 },
  { max: 110_000_000, rate: 0.24 },
  { max: 134_000_000, rate: 0.25 },
  { max: 169_000_000, rate: 0.26 },
  { max: 221_000_000, rate: 0.27 },
  { max: 390_000_000, rate: 0.28 },
  { max: 463_000_000, rate: 0.29 },
  { max: 561_000_000, rate: 0.30 },
  { max: 709_000_000, rate: 0.31 },
  { max: 965_000_000, rate: 0.32 },
  { max: 1_419_000_000, rate: 0.33 },
  { max: Infinity, rate: 0.34 },
]

export function getTERRate(grossMonthly: number, category: 'A' | 'B' | 'C'): number {
  const brackets =
    category === 'A' ? TER_A_BRACKETS :
    category === 'B' ? TER_B_BRACKETS : TER_C_BRACKETS

  const match = brackets.find(b => grossMonthly <= b.max)
  return match ? match.rate : 0.34
}

// ─── PPh 21 Calculator ────────────────────────────────────────────────────────

export function calculatePPh21Monthly(
  grossMonthly: number,
  ptkp: PTKPStatus,
  taxMethod: TaxMethod = 'gross',
  hasNPWP: boolean = true
): { pph21Amount: number; terRate: number; category: 'A' | 'B' | 'C' } {
  const category = getTERCategory(ptkp)
  let terRate = getTERRate(grossMonthly, category)
  
  // Non-NPWP penalty (20% higher rate if no NPWP)
  const npwpMultiplier = hasNPWP ? 1.0 : 1.2

  if (taxMethod === 'nett') {
    // Company absorbs tax
    const amount = Math.round(grossMonthly * terRate * npwpMultiplier)
    return { pph21Amount: amount, terRate, category }
  }

  if (taxMethod === 'gross_up') {
    // Gross-up formula (effective tax adjusted)
    const adjustedGross = grossMonthly / (1 - terRate)
    const amount = Math.round(adjustedGross * terRate * npwpMultiplier)
    return { pph21Amount: amount, terRate, category }
  }

  // Standard 'gross' method
  const pph21Amount = Math.round(grossMonthly * terRate * npwpMultiplier)
  return { pph21Amount, terRate, category }
}

// ─── Complete Payslip Calculator ──────────────────────────────────────────────

export function calculatePayslip(
  config: EmployeeSalaryConfig,
  adjustment: PayrollAdjustment,
  period: string,
  employeeInfo: {
    name: string
    dept: string
    jabatan: string
    avatar: string
    color: string
  }
): Payslip {
  const baseSalary = config.baseSalary || 0
  const fix = config.fixedAllowances || { position: 0, transport: 0, meal: 0, communication: 0, other: 0 }
  
  const totalFixedAllowances =
    (fix.position || 0) +
    (fix.transport || 0) +
    (fix.meal || 0) +
    (fix.communication || 0) +
    (fix.other || 0)

  const overtimePay = adjustment.overtimePay || 0
  const bonus = adjustment.bonus || 0
  const incentive = adjustment.incentive || 0
  const totalVariableEarnings = overtimePay + bonus + incentive

  // Gross Salary
  const grossSalary = baseSalary + totalFixedAllowances + totalVariableEarnings

  // BPJS Employee Deductions
  const bpjsKesBasis = Math.min(baseSalary, BPJS_CONSTANTS.KES_MAX_BASIS)
  const bpjsJpBasis = Math.min(baseSalary, BPJS_CONSTANTS.TK_JP_MAX_BASIS)

  const bpjsKesEmployee = config.bpjsConfig.bpjsKesEnabled
    ? Math.round(bpjsKesBasis * BPJS_CONSTANTS.KES_EMPLOYEE_RATE)
    : 0

  const bpjsTkJhtEmployee = config.bpjsConfig.bpjsTkJhtEnabled
    ? Math.round(baseSalary * BPJS_CONSTANTS.TK_JHT_EMPLOYEE_RATE)
    : 0

  const bpjsTkJpEmployee = config.bpjsConfig.bpjsTkJpEnabled
    ? Math.round(bpjsJpBasis * BPJS_CONSTANTS.TK_JP_EMPLOYEE_RATE)
    : 0

  const totalBpjsEmployee = bpjsKesEmployee + bpjsTkJhtEmployee + bpjsTkJpEmployee

  // PPh 21 TER
  const { pph21Amount, terRate, category } = calculatePPh21Monthly(
    grossSalary,
    config.taxConfig.ptkp,
    config.taxConfig.taxMethod,
    config.taxConfig.hasNPWP
  )

  // Other Deductions
  const attendanceDeductions = (adjustment.lateDeduction || 0) + (adjustment.unpaidLeaveDeduction || 0)
  const kasbonDeductions = adjustment.kasbonDeduction || 0
  const otherDeductions = adjustment.otherDeduction || 0

  const totalDeductions =
    totalBpjsEmployee +
    pph21Amount +
    attendanceDeductions +
    kasbonDeductions +
    otherDeductions

  // Employer Benefits
  const bpjsKesEmployer = config.bpjsConfig.bpjsKesEnabled
    ? Math.round(bpjsKesBasis * BPJS_CONSTANTS.KES_EMPLOYER_RATE)
    : 0

  const bpjsTkJhtEmployer = config.bpjsConfig.bpjsTkJhtEnabled
    ? Math.round(baseSalary * BPJS_CONSTANTS.TK_JHT_EMPLOYER_RATE)
    : 0

  const bpjsTkJpEmployer = config.bpjsConfig.bpjsTkJpEnabled
    ? Math.round(bpjsJpBasis * BPJS_CONSTANTS.TK_JP_EMPLOYER_RATE)
    : 0

  const bpjsTkJkkEmployer = Math.round(baseSalary * (config.bpjsConfig.bpjsTkJkkRate || BPJS_CONSTANTS.TK_JKK_DEFAULT_RATE))
  const bpjsTkJkmEmployer = Math.round(baseSalary * (config.bpjsConfig.bpjsTkJkmRate || BPJS_CONSTANTS.TK_JKM_DEFAULT_RATE))

  const totalEmployerBenefit =
    bpjsKesEmployer +
    bpjsTkJhtEmployer +
    bpjsTkJpEmployer +
    bpjsTkJkkEmployer +
    bpjsTkJkmEmployer

  // Net Salary (THP)
  const netSalary = Math.max(0, grossSalary - totalDeductions)

  const padId = String(config.employeeId).padStart(3, '0')
  const periodCode = period.replace('-', '')

  return {
    id: `PS-${periodCode}-${padId}`,
    period,
    employeeId: config.employeeId,
    employeeName: employeeInfo.name,
    dept: employeeInfo.dept,
    jabatan: employeeInfo.jabatan,
    avatar: employeeInfo.avatar,
    color: employeeInfo.color,
    bankName: config.bankDetails.bankName,
    accountNumber: config.bankDetails.accountNumber,
    accountHolder: config.bankDetails.accountHolder,
    npwp: config.taxConfig.npwp,
    ptkp: config.taxConfig.ptkp,
    taxMethod: config.taxConfig.taxMethod,

    baseSalary,
    positionAllowance: fix.position || 0,
    transportAllowance: fix.transport || 0,
    mealAllowance: fix.meal || 0,
    communicationAllowance: fix.communication || 0,
    otherFixedAllowance: fix.other || 0,
    totalFixedAllowances,

    overtimePay,
    bonus,
    incentive,
    totalVariableEarnings,
    grossSalary,

    bpjsKesEmployee,
    bpjsTkJhtEmployee,
    bpjsTkJpEmployee,
    totalBpjsEmployee,

    pph21Amount,
    terRate,
    terCategory: category,

    attendanceDeductions,
    kasbonDeductions,
    otherDeductions,
    totalDeductions,

    bpjsKesEmployer,
    bpjsTkJhtEmployer,
    bpjsTkJpEmployer,
    bpjsTkJkkEmployer,
    bpjsTkJkmEmployer,
    totalEmployerBenefit,

    netSalary,
    disbursementStatus: 'unpaid',
    status: 'draft',
    generatedAt: new Date().toISOString(),
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatCompactIDR(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`
  }
  return formatIDR(amount)
}
