// ─── Custom Hooks — Control Center ────────────────────────────────────────────
// Each hook wraps the mock DB with simulated network delay.
// To wire real BE: replace the setTimeout bodies with fetch()/axios() calls.
// All responses follow { data: T, meta?: PaginationMeta } shape.

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ApiResponse, Tenant, AuditLog, BillingRecord, SystemConfig, Broadcast, PlatformHealth } from './cc-types'
import * as db from './cc-mockdb'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms))
}

// ─── useOrganizations ─────────────────────────────────────────────────────────

export function useOrganizations() {
  const [state, setState] = useState<{
    loading: boolean
    data: Tenant[]
    error: string | null
  }>({ loading: true, data: [], error: null })

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    await delay(600 + Math.random() * 300)
    setState({ loading: false, data: db.getTenants(), error: null })
  }, [])

  useEffect(() => { load() }, [load])

  const createOrg = useCallback(async (input: Parameters<typeof db.createTenant>[0]): Promise<ApiResponse<Tenant>> => {
    await delay(700)
    const tenant = db.createTenant(input)
    setState(s => ({ ...s, data: db.getTenants() }))
    return { data: tenant }
  }, [])

  const updateOrg = useCallback(async (id: number, patch: Partial<Tenant>): Promise<ApiResponse<Tenant | null>> => {
    await delay(500)
    const updated = db.updateTenant(id, patch)
    setState(s => ({ ...s, data: db.getTenants() }))
    return { data: updated }
  }, [])

  const suspendOrg = useCallback(async (id: number): Promise<ApiResponse<Tenant | null>> => {
    await delay(600)
    const updated = db.suspendTenant(id)
    setState(s => ({ ...s, data: db.getTenants() }))
    return { data: updated }
  }, [])

  const activateOrg = useCallback(async (id: number): Promise<ApiResponse<Tenant | null>> => {
    await delay(600)
    const updated = db.activateTenant(id)
    setState(s => ({ ...s, data: db.getTenants() }))
    return { data: updated }
  }, [])

  const toggleFeature = useCallback(async (tenantId: number, feature: string): Promise<ApiResponse<Tenant | null>> => {
    await delay(400)
    const updated = db.toggleTenantFeature(tenantId, feature)
    setState(s => ({ ...s, data: db.getTenants() }))
    return { data: updated }
  }, [])

  return { ...state, reload: load, createOrg, updateOrg, suspendOrg, activateOrg, toggleFeature }
}

// ─── useAuditLogs ─────────────────────────────────────────────────────────────

export interface AuditFilters {
  search: string
  actionType: string
  page: number
  pageSize: number
}

export function useAuditLogs(filters: AuditFilters) {
  const [state, setState] = useState<{
    loading: boolean
    logs: AuditLog[]
    total: number
    error: string | null
  }>({ loading: true, logs: [], total: 0, error: null })

  const filtersRef = useRef(filters)
  filtersRef.current = filters

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    await delay(500)
    const f = filtersRef.current
    let all = db.getAuditLogs()
    if (f.search) {
      const q = f.search.toLowerCase()
      all = all.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q)
      )
    }
    if (f.actionType && f.actionType !== 'all') {
      all = all.filter(l => l.actionType === f.actionType)
    }
    const total = all.length
    const paginated = all.slice((f.page - 1) * f.pageSize, f.page * f.pageSize)
    setState({ loading: false, logs: paginated, total, error: null })
  }, [])

  useEffect(() => { load() }, [load, filters.search, filters.actionType, filters.page])

  return { ...state, reload: load }
}

// ─── useBilling ───────────────────────────────────────────────────────────────

export function useBilling() {
  const [state, setState] = useState<{
    loading: boolean
    records: BillingRecord[]
    error: string | null
  }>({ loading: true, records: [], error: null })

  useEffect(() => {
    let cancelled = false
    delay(650).then(() => {
      if (!cancelled) setState({ loading: false, records: db.getBillingRecords(), error: null })
    })
    return () => { cancelled = true }
  }, [])

  return state
}

// ─── useSystemConfig ──────────────────────────────────────────────────────────

export function useSystemConfig() {
  const [state, setState] = useState<{
    loading: boolean
    config: SystemConfig | null
    saving: boolean
    error: string | null
  }>({ loading: true, config: null, saving: false, error: null })

  useEffect(() => {
    let cancelled = false
    delay(400).then(() => {
      if (!cancelled) setState(s => ({ ...s, loading: false, config: db.getSystemConfig() }))
    })
    return () => { cancelled = true }
  }, [])

  const saveConfig = useCallback(async (patch: Partial<SystemConfig>): Promise<ApiResponse<SystemConfig>> => {
    setState(s => ({ ...s, saving: true }))
    await delay(700)
    const updated = db.updateSystemConfig(patch)
    setState(s => ({ ...s, saving: false, config: updated }))
    return { data: updated }
  }, [])

  return { ...state, saveConfig }
}

// ─── useBroadcasts ────────────────────────────────────────────────────────────

export function useBroadcasts() {
  const [state, setState] = useState<{
    loading: boolean
    broadcasts: Broadcast[]
    sending: boolean
    error: string | null
  }>({ loading: true, broadcasts: [], sending: false, error: null })

  useEffect(() => {
    let cancelled = false
    delay(500).then(() => {
      if (!cancelled) setState(s => ({ ...s, loading: false, broadcasts: db.getBroadcasts() }))
    })
    return () => { cancelled = true }
  }, [])

  const send = useCallback(async (input: Parameters<typeof db.createBroadcast>[0]): Promise<ApiResponse<Broadcast>> => {
    setState(s => ({ ...s, sending: true }))
    await delay(800)
    const b = db.createBroadcast(input)
    setState(s => ({ ...s, sending: false, broadcasts: db.getBroadcasts() }))
    return { data: b }
  }, [])

  return { ...state, send }
}

// ─── usePlatformHealth ────────────────────────────────────────────────────────

export function usePlatformHealth() {
  const [state, setState] = useState<{
    loading: boolean
    health: PlatformHealth | null
  }>({ loading: true, health: null })

  useEffect(() => {
    let cancelled = false
    delay(300).then(() => {
      if (!cancelled) setState({ loading: false, health: db.getPlatformHealth() })
    })
    // Refresh every 30s
    const interval = setInterval(() => {
      if (!cancelled) setState({ loading: false, health: db.getPlatformHealth() })
    }, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  return state
}

// ─── useChartData ─────────────────────────────────────────────────────────────

export function useChartData() {
  const [state, setState] = useState<{
    loading: boolean
    mrr: typeof db.mrrTrend
    growth: typeof db.tenantGrowth
  }>({ loading: true, mrr: [], growth: [] })

  useEffect(() => {
    let cancelled = false
    delay(700).then(() => {
      if (!cancelled) setState({ loading: false, mrr: db.mrrTrend, growth: db.tenantGrowth })
    })
    return () => { cancelled = true }
  }, [])

  return state
}
