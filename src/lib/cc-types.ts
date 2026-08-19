// ─── Control Center Types ─────────────────────────────────────────────────────
// Structured to mirror REST API shapes: { data: T, meta?: PaginationMeta }

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'churned'
export type PlanName = 'Starter' | 'Pro' | 'Enterprise'
export type FeatureKey = 'attendance' | 'leave' | 'overtime' | 'reimbursement' | 'wfh' | 'chat' | 'payroll' | 'analytics'

export interface Tenant {
  id: number
  name: string
  slug: string
  employees: number
  plan: PlanName
  status: TenantStatus
  mrr: number
  features: FeatureKey[]
  adminEmail: string
  adminName: string
  createdAt: string
  lastActive: string
  storageUsedMb: number
  storageQuotaMb: number
  checkInsThisMonth: number
}

export interface TenantCreateInput {
  name: string
  slug: string
  plan: PlanName
  adminName: string
  adminEmail: string
  features: FeatureKey[]
}

export interface TenantUpdateInput {
  name?: string
  plan?: PlanName
  status?: TenantStatus
  adminEmail?: string
  adminName?: string
  features?: FeatureKey[]
}

export interface AuditLog {
  id: number
  actor: string
  actorRole: 'super_admin' | 'admin'
  action: string
  actionType: 'create' | 'update' | 'delete' | 'toggle' | 'suspend' | 'activate' | 'config' | 'impersonate'
  target: string
  tenantSlug?: string
  ts: string
  ip: string
}

export interface BillingRecord {
  id: number
  tenantId: number
  tenantName: string
  plan: PlanName
  amount: number
  status: 'paid' | 'unpaid' | 'overdue'
  dueDate: string
  paidDate?: string
  invoiceNumber: string
}

export interface SystemConfig {
  sessionTimeoutHours: number
  maintenanceMode: boolean
  gpsRadiusMeters: number
  defaultWorkStartHour: number
  defaultWorkEndHour: number
  maxUploadSizeMb: number
  emailNotifications: boolean
  pushNotifications: boolean
  waNotifications: boolean
  autoSuspendOverdueDays: number
  maxTenantsPerPlan: Record<PlanName, number>
}

export interface Broadcast {
  id: number
  title: string
  message: string
  link?: string
  targetTenants: 'all' | number[]
  sentAt: string
  sentBy: string
  readCount: number
}

export interface PlatformHealth {
  uptimePct: number
  apiResponseMs: number
  activeSessions: number
  dbQueryMs: number
  errorsToday: number
  requestsToday: number
}

export interface MrrDataPoint {
  month: string
  mrr: number
  tenants: number
}

export interface TenantGrowthDataPoint {
  week: string
  newTenants: number
  churned: number
  totalUsers: number
}

// ─── Plan definitions ─────────────────────────────────────────────────────────

export interface PlanDefinition {
  name: PlanName
  pricePerUser: number
  maxEmployees: number | null
  color: string
  features: FeatureKey[]
}
