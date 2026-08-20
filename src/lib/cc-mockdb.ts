// ─── Mock Database ─────────────────────────────────────────────────────────────
// Mutable in-memory store. Mirrors REST API resource structure.
// Replace this with real API calls when BE is ready.

import type {
  Tenant, AuditLog, BillingRecord, SystemConfig,
  Broadcast, PlatformHealth, MrrDataPoint, TenantGrowthDataPoint, PlanDefinition
} from './cc-types'

// ─── Tenants ──────────────────────────────────────────────────────────────────

export const tenantsDb: Tenant[] = [
  {
    id: 1, name: 'PT Maju Bersama', slug: 'maju-bersama',
    employees: 48, plan: 'Pro', status: 'active', mrr: 1200000,
    features: ['attendance', 'leave', 'overtime', 'wfh', 'chat'],
    adminEmail: 'admin@majubersama.co.id', adminName: 'Hendra Wijaya',
    createdAt: '2026-01-15', lastActive: '2026-08-18',
    storageUsedMb: 1240, storageQuotaMb: 5120,
    checkInsThisMonth: 842,
  },
  {
    id: 2, name: 'CV Teknologi Nusantara', slug: 'tekno-nus',
    employees: 12, plan: 'Starter', status: 'active', mrr: 300000,
    features: ['attendance', 'leave'],
    adminEmail: 'admin@tekno-nus.id', adminName: 'Sari Dewi',
    createdAt: '2026-03-22', lastActive: '2026-08-17',
    storageUsedMb: 128, storageQuotaMb: 1024,
    checkInsThisMonth: 198,
  },
  {
    id: 3, name: 'PT Kreasi Digital', slug: 'kreasi-digital',
    employees: 87, plan: 'Enterprise', status: 'active', mrr: 3500000,
    features: ['attendance', 'leave', 'overtime', 'reimbursement', 'wfh', 'chat', 'payroll', 'analytics'],
    adminEmail: 'admin@kreasidigital.com', adminName: 'Rizky Firmansyah',
    createdAt: '2025-11-08', lastActive: '2026-08-18',
    storageUsedMb: 4200, storageQuotaMb: 20480,
    checkInsThisMonth: 1560,
  },
  {
    id: 4, name: 'UD Sumber Rejeki', slug: 'sumber-rejeki',
    employees: 6, plan: 'Starter', status: 'suspended', mrr: 0,
    features: ['attendance'],
    adminEmail: 'owner@sumberrejeki.id', adminName: 'Bambang S',
    createdAt: '2026-05-10', lastActive: '2026-07-31',
    storageUsedMb: 45, storageQuotaMb: 1024,
    checkInsThisMonth: 0,
  },
  {
    id: 5, name: 'PayrollIn Demo', slug: 'default',
    employees: 10, plan: 'Pro', status: 'trial', mrr: 0,
    features: ['attendance', 'leave', 'overtime', 'wfh', 'chat', 'payroll'],
    adminEmail: 'demo@payrollin.id', adminName: 'Demo Admin',
    createdAt: '2026-08-01', lastActive: '2026-08-18',
    storageUsedMb: 80, storageQuotaMb: 5120,
    checkInsThisMonth: 160,
  },
  {
    id: 6, name: 'PT Anugerah Sentosa', slug: 'anugerah-sentosa',
    employees: 34, plan: 'Pro', status: 'active', mrr: 850000,
    features: ['attendance', 'leave', 'overtime', 'wfh'],
    adminEmail: 'hr@anugerahsentosa.co.id', adminName: 'Maya Kusuma',
    createdAt: '2026-04-05', lastActive: '2026-08-16',
    storageUsedMb: 620, storageQuotaMb: 5120,
    checkInsThisMonth: 510,
  },
]

let _nextTenantId = 7

export function getTenants() { return [...tenantsDb] }

export function getTenantById(id: number) { return tenantsDb.find(t => t.id === id) ?? null }

export function createTenant(input: Omit<Tenant, 'id' | 'createdAt' | 'lastActive' | 'storageUsedMb' | 'storageQuotaMb' | 'checkInsThisMonth'>) {
  const tenant: Tenant = {
    ...input,
    id: _nextTenantId++,
    createdAt: new Date().toISOString().split('T')[0],
    lastActive: new Date().toISOString().split('T')[0],
    storageUsedMb: 0,
    storageQuotaMb: input.plan === 'Starter' ? 1024 : input.plan === 'Pro' ? 5120 : 20480,
    checkInsThisMonth: 0,
  }
  tenantsDb.push(tenant)
  addAuditLog('super@hadir.id', 'super_admin', 'Tenant created', tenant.name, 'create', tenant.slug)
  return tenant
}

export function updateTenant(id: number, patch: Partial<Tenant>) {
  const idx = tenantsDb.findIndex(t => t.id === id)
  if (idx === -1) return null
  tenantsDb[idx] = { ...tenantsDb[idx], ...patch }
  addAuditLog('super@hadir.id', 'super_admin', 'Tenant updated', tenantsDb[idx].name, 'update', tenantsDb[idx].slug)
  return tenantsDb[idx]
}

export function suspendTenant(id: number) {
  return updateTenant(id, { status: 'suspended', mrr: 0 })
}

export function activateTenant(id: number) {
  const t = getTenantById(id)
  if (!t) return null
  return updateTenant(id, { status: 'active' })
}

export function toggleTenantFeature(tenantId: number, feature: string) {
  const idx = tenantsDb.findIndex(t => t.id === tenantId)
  if (idx === -1) return null
  const has = tenantsDb[idx].features.includes(feature as any)
  tenantsDb[idx] = {
    ...tenantsDb[idx],
    features: has
      ? tenantsDb[idx].features.filter(f => f !== feature)
      : [...tenantsDb[idx].features, feature as any],
  }
  addAuditLog('super@hadir.id', 'super_admin', `Feature flag ${has ? 'OFF' : 'ON'}`, `${feature} → ${tenantsDb[idx].name}`, 'toggle', tenantsDb[idx].slug)
  return tenantsDb[idx]
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

const _auditLogs: AuditLog[] = [
  { id: 1, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'Tenant created', actionType: 'create', target: 'PT Kreasi Digital', tenantSlug: 'kreasi-digital', ts: '2026-08-12 09:14:32', ip: '103.12.45.10' },
  { id: 2, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'Feature flag ON', actionType: 'toggle', target: 'payroll → PT Kreasi Digital', tenantSlug: 'kreasi-digital', ts: '2026-08-12 09:15:10', ip: '103.12.45.10' },
  { id: 3, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'Plan assigned', actionType: 'update', target: 'Enterprise → PT Kreasi Digital', tenantSlug: 'kreasi-digital', ts: '2026-08-12 09:15:45', ip: '103.12.45.10' },
  { id: 4, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'Tenant suspended', actionType: 'suspend', target: 'UD Sumber Rejeki', tenantSlug: 'sumber-rejeki', ts: '2026-08-10 14:22:01', ip: '103.12.45.10' },
  { id: 5, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'System config updated', actionType: 'config', target: 'session_hours = 10', ts: '2026-08-09 11:05:00', ip: '103.12.45.10' },
  { id: 6, actor: 'admin@majubersama.co.id', actorRole: 'admin', action: 'Feature flag ON', actionType: 'toggle', target: 'overtime → PT Maju Bersama', tenantSlug: 'maju-bersama', ts: '2026-08-08 13:30:00', ip: '180.244.1.22' },
  { id: 7, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'Tenant created', actionType: 'create', target: 'PT Anugerah Sentosa', tenantSlug: 'anugerah-sentosa', ts: '2026-08-05 10:00:00', ip: '103.12.45.10' },
  { id: 8, actor: 'super@hadir.id', actorRole: 'super_admin', action: 'Impersonate', actionType: 'impersonate', target: 'PT Maju Bersama (Hendra Wijaya)', tenantSlug: 'maju-bersama', ts: '2026-08-04 09:00:00', ip: '103.12.45.10' },
]

let _nextAuditId = 9

export function getAuditLogs() { return [..._auditLogs].reverse() }

export function addAuditLog(actor: string, actorRole: AuditLog['actorRole'], action: string, target: string, actionType: AuditLog['actionType'], tenantSlug?: string) {
  _auditLogs.push({
    id: _nextAuditId++,
    actor, actorRole, action, actionType, target, tenantSlug,
    ts: new Date().toLocaleString('sv-SE').replace('T', ' '),
    ip: '103.12.45.10',
  })
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export const billingRecords: BillingRecord[] = [
  { id: 1, tenantId: 3, tenantName: 'PT Kreasi Digital', plan: 'Enterprise', amount: 3500000, status: 'paid', dueDate: '2026-08-01', paidDate: '2026-07-28', invoiceNumber: 'INV-2026-0801' },
  { id: 2, tenantId: 1, tenantName: 'PT Maju Bersama', plan: 'Pro', amount: 1200000, status: 'paid', dueDate: '2026-08-01', paidDate: '2026-07-30', invoiceNumber: 'INV-2026-0802' },
  { id: 3, tenantId: 6, tenantName: 'PT Anugerah Sentosa', plan: 'Pro', amount: 850000, status: 'unpaid', dueDate: '2026-08-15', invoiceNumber: 'INV-2026-0806' },
  { id: 4, tenantId: 2, tenantName: 'CV Teknologi Nusantara', plan: 'Starter', amount: 300000, status: 'paid', dueDate: '2026-08-01', paidDate: '2026-08-02', invoiceNumber: 'INV-2026-0803' },
  { id: 5, tenantId: 4, tenantName: 'UD Sumber Rejeki', plan: 'Starter', amount: 150000, status: 'overdue', dueDate: '2026-07-01', invoiceNumber: 'INV-2026-0701' },
]

export function getBillingRecords() { return [...billingRecords] }

// ─── System Config ────────────────────────────────────────────────────────────

export const systemConfig: SystemConfig = {
  sessionTimeoutHours: 8,
  maintenanceMode: false,
  gpsRadiusMeters: 100,
  defaultWorkStartHour: 8,
  defaultWorkEndHour: 17,
  maxUploadSizeMb: 10,
  emailNotifications: true,
  pushNotifications: true,
  waNotifications: false,
  autoSuspendOverdueDays: 30,
  maxTenantsPerPlan: { Starter: 20, Pro: 100, Enterprise: 99999 },
}

export function getSystemConfig() { return { ...systemConfig } }

export function updateSystemConfig(patch: Partial<SystemConfig>) {
  Object.assign(systemConfig, patch)
  addAuditLog('super@hadir.id', 'super_admin', 'System config updated', Object.keys(patch).join(', '), 'config')
  return { ...systemConfig }
}

// ─── Broadcasts ───────────────────────────────────────────────────────────────

const _broadcasts: Broadcast[] = [
  { id: 1, title: 'Pemeliharaan Terjadwal', message: 'Sistem akan undergo maintenance pada 20 Agu 2026 pukul 01:00–03:00 WIB. Layanan mungkin tidak dapat diakses sementara.', targetTenants: 'all', sentAt: '2026-08-15 10:00:00', sentBy: 'super@hadir.id', readCount: 4 },
  { id: 2, title: 'Fitur Payroll Tersedia', message: 'Modul Payroll kini sudah aktif. Hubungi sales untuk upgrade plan dan aktifkan fitur ini.', link: 'https://hadir.id/payroll', targetTenants: 'all', sentAt: '2026-08-01 09:00:00', sentBy: 'super@hadir.id', readCount: 5 },
]

let _nextBroadcastId = 3

export function getBroadcasts() { return [..._broadcasts].reverse() }

export function createBroadcast(input: Omit<Broadcast, 'id' | 'sentAt' | 'sentBy' | 'readCount'>) {
  const b: Broadcast = {
    ...input,
    id: _nextBroadcastId++,
    sentAt: new Date().toLocaleString('sv-SE').replace('T', ' '),
    sentBy: 'super@hadir.id',
    readCount: 0,
  }
  _broadcasts.push(b)
  addAuditLog('super@hadir.id', 'super_admin', 'Broadcast sent', input.title, 'create')
  return b
}

// ─── Platform Health (static snapshot + minor random variation) ───────────────

export function getPlatformHealth(): PlatformHealth {
  return {
    uptimePct: 99.97,
    apiResponseMs: 142 + Math.floor(Math.random() * 30),
    activeSessions: 38 + Math.floor(Math.random() * 10),
    dbQueryMs: 18 + Math.floor(Math.random() * 8),
    errorsToday: 3,
    requestsToday: 14820 + Math.floor(Math.random() * 100),
  }
}

// ─── Charts data ──────────────────────────────────────────────────────────────

export const mrrTrend: MrrDataPoint[] = [
  { month: 'Mar', mrr: 3200000, tenants: 3 },
  { month: 'Apr', mrr: 4050000, tenants: 4 },
  { month: 'Mei', mrr: 4050000, tenants: 4 },
  { month: 'Jun', mrr: 5250000, tenants: 5 },
  { month: 'Jul', mrr: 5250000, tenants: 5 },
  { month: 'Agu', mrr: 6050000, tenants: 6 },
]

export const tenantGrowth: TenantGrowthDataPoint[] = [
  { week: 'W1', newTenants: 1, churned: 0, totalUsers: 153 },
  { week: 'W2', newTenants: 0, churned: 0, totalUsers: 153 },
  { week: 'W3', newTenants: 1, churned: 0, totalUsers: 163 },
  { week: 'W4', newTenants: 1, churned: 1, totalUsers: 197 },
]

// ─── Plan definitions ─────────────────────────────────────────────────────────

export const planDefs: PlanDefinition[] = [
  { name: 'Starter', pricePerUser: 25000, maxEmployees: 20, color: '#10b981', features: ['attendance', 'leave'] },
  { name: 'Pro', pricePerUser: 35000, maxEmployees: 100, color: '#2563eb', features: ['attendance', 'leave', 'overtime', 'wfh', 'chat'] },
  { name: 'Enterprise', pricePerUser: 0, maxEmployees: null, color: '#7c3aed', features: ['attendance', 'leave', 'overtime', 'reimbursement', 'wfh', 'chat', 'payroll', 'analytics'] },
]

export const featureDescriptions: Record<string, string> = {
  attendance: 'GPS check-in/out + foto',
  leave: 'Permohonan izin & cuti',
  overtime: 'Permohonan & approve lembur',
  reimbursement: 'Klaim biaya & reimburse',
  wfh: 'Work from home request',
  chat: 'Chat internal perusahaan',
  payroll: 'Penggajian & slip gaji',
  analytics: 'Analytics lanjutan & export',
}

export const ALL_FEATURES = Object.keys(featureDescriptions) as (keyof typeof featureDescriptions)[]
