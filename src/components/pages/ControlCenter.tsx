'use client'

import { useState, useEffect, useCallback, useRef, type CSSProperties } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type { AuthUser } from './LoginPage'
import type { Tenant, AuditLog, SystemConfig, Broadcast } from '../../lib/cc-types'
import {
  useOrganizations, useAuditLogs, useBilling,
  useSystemConfig, useBroadcasts, usePlatformHealth, useChartData,
} from '../../lib/cc-hooks'
import { planDefs, featureDescriptions, ALL_FEATURES } from '../../lib/cc-mockdb'

// ─── Nav ──────────────────────────────────────────────────────────────────────

type CCNav = 'overview' | 'organizations' | 'features' | 'billing' | 'roles' | 'audit' | 'config' | 'broadcast'

const NAV_ITEMS: { id: CCNav; label: string; icon: string; group: string }[] = [
  { id: 'overview',       label: 'Overview',          icon: '⊞', group: 'Platform' },
  { id: 'config',         label: 'System Config',     icon: '⚙', group: 'Platform' },
  { id: 'organizations',  label: 'Organizations',     icon: '🏢', group: 'Tenants' },
  { id: 'features',       label: 'Feature Flags',     icon: '⚑', group: 'Tenants' },
  { id: 'billing',        label: 'Revenue & Billing', icon: '💳', group: 'Billing' },
  { id: 'roles',          label: 'Roles & Perms',     icon: '🔑', group: 'Access' },
  { id: 'audit',          label: 'Audit Logs',        icon: '📜', group: 'System' },
  { id: 'broadcast',      label: 'Broadcast',         icon: '📡', group: 'System' },
]

const PAGE_TITLES: Record<CCNav, string> = {
  overview: 'Platform Overview',
  organizations: 'Organizations',
  features: 'Feature Flags',
  billing: 'Revenue & Billing',
  roles: 'Roles & Permissions',
  audit: 'Audit Logs',
  config: 'System Config',
  broadcast: 'Broadcast Center',
}

// ─── Toast system ─────────────────────────────────────────────────────────────

interface ToastData { id: number; message: string; type: 'success' | 'error' | 'info' }
let _toastId = 0

function CCToast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6' }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: 'var(--card)', border: `1px solid ${colors[toast.type]}40`, borderLeft: `3px solid ${colors[toast.type]}`, borderRadius: 12, padding: '14px 20px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', minWidth: 280, maxWidth: 340, animation: 'cc-toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
      <style>{`@keyframes cc-toast-in { from { opacity:0; transform:translateY(12px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{icons[toast.type]}</span>
        <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)', flex: 1 }}>{toast.message}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 16, flexShrink: 0 }}>×</button>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skel({ h = 20, w = '100%', r = 8 }: { h?: number; w?: string | number; r?: number }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CCTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: 'var(--foreground)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--muted-foreground)' }}>{p.name}:</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--foreground)' }}>{typeof p.value === 'number' && p.value > 100000 ? `Rp ${(p.value / 1000000).toFixed(1)}jt` : p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', background: value ? '#10b981' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}
    >
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
    </button>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function TenantStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string }> = {
    active:    { bg: 'rgba(16,185,129,0.12)',  color: '#059669', border: 'rgba(16,185,129,0.3)'  },
    suspended: { bg: 'rgba(239,68,68,0.1)',    color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
    trial:     { bg: 'rgba(245,158,11,0.1)',   color: '#d97706', border: 'rgba(245,158,11,0.25)' },
    churned:   { bg: 'rgba(107,114,128,0.1)',  color: '#6b7280', border: 'rgba(107,114,128,0.2)' },
  }
  const c = cfg[status] ?? cfg.active
  return (
    <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontFamily: 'JetBrains Mono', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  )
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = { Starter: '#10b981', Pro: '#2563eb', Enterprise: '#7c3aed' }
  const c = colors[plan] ?? '#6b7280'
  return (
    <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 6, background: `${c}12`, color: c, border: `1px solid ${c}25`, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
      {plan}
    </span>
  )
}

// ─── Command Palette (Ctrl+K) ─────────────────────────────────────────────────

function CommandPalette({ tenants, onClose, onNavigate, onImpersonate }: {
  tenants: Tenant[]
  onClose: () => void
  onNavigate: (nav: CCNav) => void
  onImpersonate: (tenant: Tenant) => void
}) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const navItems = NAV_ITEMS.map(n => ({ type: 'nav' as const, label: n.label, id: n.id, icon: n.icon }))
  const tenantItems = tenants.map(t => ({ type: 'tenant' as const, label: t.name, id: t.id, icon: '🏢', sub: `${t.plan} · ${t.employees} users · ${t.status}`, tenant: t }))

  const filtered = q.trim()
    ? [...navItems, ...tenantItems].filter(i => i.label.toLowerCase().includes(q.toLowerCase()))
    : [...navItems.slice(0, 5), ...tenantItems.slice(0, 4)]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.35)', width: '100%', maxWidth: 520, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cari halaman, tenant, atau perintah..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Inter', fontSize: 14, color: 'var(--foreground)' }}
          />
          <kbd style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 13, fontFamily: 'Outfit' }}>Tidak ada hasil</div>
          ) : filtered.map((item, i) => (
            <button key={i} onClick={() => {
              if (item.type === 'nav') { onNavigate(item.id as CCNav); onClose() }
              else { onImpersonate((item as any).tenant); onClose() }
            }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--muted)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{item.label}</div>
                {'sub' in item && item.sub && <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 1 }}>{item.sub}</div>}
              </div>
              {item.type === 'tenant' && (
                <span style={{ fontSize: 10, color: '#7c3aed', fontFamily: 'JetBrains Mono', background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(124,58,237,0.2)' }}>Impersonate →</span>
              )}
              {item.type === 'nav' && (
                <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', background: 'var(--muted)', padding: '2px 8px', borderRadius: 6 }}>Halaman</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
          {[['↵', 'Pilih'], ['ESC', 'Tutup'], ['↑↓', 'Navigasi']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted-foreground)' }}>
              <kbd style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>{k}</kbd>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Create Organization Modal ────────────────────────────────────────────────

function CreateOrgModal({ onClose, onCreate }: {
  onClose: () => void
  onCreate: (input: Parameters<ReturnType<typeof useOrganizations>['createOrg']>[0]) => Promise<void>
}) {
  const [form, setForm] = useState({ name: '', slug: '', plan: 'Pro' as Tenant['plan'], adminName: '', adminEmail: '', features: ['attendance', 'leave'] as string[] })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nama wajib diisi'
    if (!form.slug.trim() || !/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Slug: huruf kecil, angka, dan - saja'
    if (!form.adminEmail.includes('@')) e.adminEmail = 'Email tidak valid'
    if (!form.adminName.trim()) e.adminName = 'Nama admin wajib'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const planDef = planDefs.find(p => p.name === form.plan)!
    await onCreate({
      name: form.name.trim(),
      slug: form.slug.trim(),
      plan: form.plan,
      status: 'trial',
      mrr: 0,
      features: form.features as any,
      adminEmail: form.adminEmail.trim(),
      adminName: form.adminName.trim(),
      employees: 0,
    })
    setLoading(false)
    onClose()
  }

  const toggleFeature = (f: string) => setForm(prev => ({
    ...prev,
    features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f],
  }))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '22px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>New Organization</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Tenant baru akan dimulai dengan status Trial</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted-foreground)', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Company Name */}
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Nama Perusahaan *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))}
              placeholder="PT Contoh Sejahtera"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${errors.name ? '#ef4444' : 'var(--border)'}`, background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            {errors.name && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.name}</div>}
          </div>
          {/* Slug */}
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Slug (URL) *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: `1.5px solid ${errors.slug ? '#ef4444' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden' }}>
              <span style={{ padding: '10px 10px', background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', fontSize: 12, flexShrink: 0, borderRight: '1px solid var(--border)' }}>hadir.id/</span>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="contoh-sejahtera"
                style={{ flex: 1, padding: '10px 12px', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'JetBrains Mono', fontSize: 13, border: 'none', outline: 'none' }} />
            </div>
            {errors.slug && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.slug}</div>}
          </div>
          {/* Plan */}
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Plan</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {planDefs.map(p => (
                <button key={p.name} type="button" onClick={() => setForm(prev => ({ ...prev, plan: p.name }))}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `2px solid ${form.plan === p.name ? p.color : 'var(--border)'}`, background: form.plan === p.name ? `${p.color}10` : 'transparent', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: form.plan === p.name ? p.color : 'var(--muted-foreground)', transition: 'all 0.15s' }}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          {/* Admin */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Nama HR Admin *</label>
              <input value={form.adminName} onChange={e => setForm(p => ({ ...p, adminName: e.target.value }))}
                placeholder="Rina Setiawati"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${errors.adminName ? '#ef4444' : 'var(--border)'}`, background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Email Admin *</label>
              <input value={form.adminEmail} onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))}
                placeholder="hr@perusahaan.co.id"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${errors.adminEmail ? '#ef4444' : 'var(--border)'}`, background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          {/* Features */}
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>Fitur Aktif</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {ALL_FEATURES.map(f => {
                const on = form.features.includes(f)
                return (
                  <button key={f} type="button" onClick={() => toggleFeature(f)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, border: `1px solid ${on ? 'rgba(37,99,235,0.3)' : 'var(--border)'}`, background: on ? 'rgba(37,99,235,0.08)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${on ? '#2563eb' : 'var(--border)'}`, background: on ? '#2563eb' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {on && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: on ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: on ? 600 : 400 }}>{f}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, padding: '12px', fontSize: 14 }}>
            {loading ? '⏳ Membuat...' : '+ Buat Organization'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Assign Admin Modal ───────────────────────────────────────────────────────

function AssignAdminModal({ tenant, onClose, onSave, saving }: {
  tenant: Tenant
  onClose: () => void
  onSave: (adminName: string, adminEmail: string) => Promise<void>
  saving: boolean
}) {
  const [name, setName] = useState(tenant.adminName)
  const [email, setEmail] = useState(tenant.adminEmail)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: '24px', width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Assign HR Admin</div>
        <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 20 }}>{tenant.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Nama Admin</label>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Email Admin</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button className="btn-primary" style={{ flex: 1, fontSize: 13 }} disabled={saving} onClick={() => onSave(name, email)}>
            {saving ? '⏳ Menyimpan...' : '✓ Simpan'}
          </button>
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={onClose}>Batal</button>
        </div>
      </div>
    </div>
  )
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────

function InvoiceModal({ record, onClose }: { record: ReturnType<typeof useBilling>['records'][0]; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: '28px', width: '100%', maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>{record.invoiceNumber}</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, marginTop: 4 }}>{record.tenantName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--muted-foreground)' }}>×</button>
        </div>
        {[
          ['Plan', record.plan],
          ['Jatuh Tempo', record.dueDate],
          ['Dibayar', record.paidDate ?? '—'],
          ['Status', record.status.toUpperCase()],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{k}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontSize: 18, fontFamily: 'Outfit', fontWeight: 800 }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary)' }}>Rp {record.amount.toLocaleString('id')}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Overview Page ────────────────────────────────────────────────────────────

function OverviewPage({ onNavigate }: { onNavigate: (n: CCNav) => void }) {
  const { loading: healthLoading, health } = usePlatformHealth()
  const { loading: chartLoading, mrr, growth } = useChartData()
  const { loading: orgLoading, data: tenants } = useOrganizations()

  const totalMRR = tenants.filter(t => t.status === 'active').reduce((s, t) => s + t.mrr, 0)
  const activeOrgs = tenants.filter(t => t.status === 'active').length
  const totalUsers = tenants.reduce((s, t) => s + t.employees, 0)
  const overdueCount = tenants.filter(t => t.status === 'suspended').length

  const alerts = [
    overdueCount > 0 && { icon: '🚫', color: '#ef4444', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.2)', text: `${overdueCount} tenant di-suspend — cek status billing`, action: 'Billing', nav: 'billing' as CCNav },
    health && health.errorsToday > 0 && { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.2)', text: `${health.errorsToday} error tercatat hari ini`, action: 'Audit Logs', nav: 'audit' as CCNav },
  ].filter(Boolean) as { icon: string; color: string; bg: string; border: string; text: string; action: string; nav: CCNav }[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: a.bg, border: `1px solid ${a.border}` }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--foreground)', fontFamily: 'Inter' }}>{a.text}</span>
              <button onClick={() => onNavigate(a.nav)} style={{ fontSize: 11, fontFamily: 'Outfit', fontWeight: 700, color: a.color, background: 'none', border: `1px solid ${a.border}`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{a.action} →</button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
        {orgLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 100 }} />) : (
          <>
            {[
              { label: 'Total Organizations', value: String(tenants.length), sub: `${activeOrgs} aktif`, color: '#2563eb', icon: '🏢' },
              { label: 'Total Users', value: String(totalUsers), sub: 'across all tenants', color: '#7c3aed', icon: '👥' },
              { label: 'Monthly Revenue', value: `Rp ${(totalMRR / 1000000).toFixed(1)}jt`, sub: 'MRR bulan ini', color: '#10b981', icon: '💰' },
              { label: 'Active Sessions', value: health ? String(health.activeSessions) : '—', sub: 'saat ini', color: '#f59e0b', icon: '⚡' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{s.icon}</div>
                </div>
                <div style={{ fontSize: 26, fontFamily: 'Outfit', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4, fontFamily: 'Outfit' }}>{s.sub}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Platform Health */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Platform Health</div>
        {healthLoading ? <Skel h={40} /> : health ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Uptime', value: `${health.uptimePct}%`, good: health.uptimePct > 99, icon: '✅' },
              { label: 'API Latency', value: `${health.apiResponseMs}ms`, good: health.apiResponseMs < 200, icon: '⚡' },
              { label: 'DB Query', value: `${health.dbQueryMs}ms`, good: health.dbQueryMs < 50, icon: '🗄️' },
              { label: 'Requests Today', value: health.requestsToday.toLocaleString(), good: true, icon: '📊' },
              { label: 'Errors Today', value: String(health.errorsToday), good: health.errorsToday < 10, icon: health.errorsToday > 0 ? '⚠️' : '✅' },
            ].map(h => (
              <div key={h.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: h.good ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${h.good ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <span style={{ fontSize: 18 }}>{h.icon}</span>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{h.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'Outfit', marginTop: 1 }}>{h.label}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ '--gap': '16px' } as CSSProperties}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>MRR Trend</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 16 }}>6 bulan terakhir</div>
          {chartLoading ? <Skel h={180} r={10} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={mrr}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CCTooltip />} />
                <Area type="monotone" dataKey="mrr" name="MRR" stroke="#10b981" strokeWidth={2.5} fill="url(#mrrGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Tenant Growth</div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 16 }}>Agustus 2026</div>
          {chartLoading ? <Skel h={180} r={10} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={growth} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CCTooltip />} />
                <Bar dataKey="newTenants" name="Tenant Baru" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Churn" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {([
            { label: '+ New Organization', nav: 'organizations', color: '#2563eb' },
            { label: '📡 Broadcast', nav: 'broadcast', color: '#7c3aed' },
            { label: '📜 Audit Logs', nav: 'audit', color: '#f59e0b' },
            { label: '⚙ System Config', nav: 'config', color: '#10b981' },
          ] as const).map(a => (
            <button key={a.label} onClick={() => onNavigate(a.nav as CCNav)}
              style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${a.color}30`, background: `${a.color}08`, cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: a.color, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${a.color}18` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${a.color}08` }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Organizations Page ───────────────────────────────────────────────────────

function OrganizationsPage({ onImpersonate, addToast }: {
  onImpersonate: (tenant: Tenant) => void
  addToast: (msg: string, type: ToastData['type']) => void
}) {
  const { loading, data: tenants, createOrg, updateOrg, suspendOrg, activateOrg, toggleFeature } = useOrganizations()
  const [selected, setSelected] = useState<Tenant | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = search ? tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())) : tenants

  // Sync selected state when tenants change (after mutations)
  useEffect(() => {
    if (selected) {
      const updated = tenants.find(t => t.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [tenants])

  const handleCreate = async (input: Parameters<typeof createOrg>[0]) => {
    await createOrg(input)
    addToast('Organization berhasil dibuat!', 'success')
  }

  const handleSuspend = async (tenant: Tenant) => {
    setActionLoading(tenant.id)
    await suspendOrg(tenant.id)
    addToast(`${tenant.name} di-suspend`, 'info')
    setActionLoading(null)
  }

  const handleActivate = async (tenant: Tenant) => {
    setActionLoading(tenant.id)
    await activateOrg(tenant.id)
    addToast(`${tenant.name} diaktifkan kembali`, 'success')
    setActionLoading(null)
  }

  const handleToggleFeature = async (tenantId: number, feature: string) => {
    await toggleFeature(tenantId, feature)
    addToast(`Feature ${feature} diperbarui`, 'info')
  }

  const handleAssign = async (adminName: string, adminEmail: string) => {
    if (!selected) return
    await updateOrg(selected.id, { adminName, adminEmail })
    addToast('HR Admin berhasil di-assign', 'success')
    setShowAssign(false)
  }

  return (
    <div className={selected ? 'grid-side-right' : ''} style={selected ? ({ '--side': '420px', '--gap': '20px' } as CSSProperties) : undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Semua Perusahaan ({filtered.length})</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px' }}>
              <span style={{ fontSize: 13 }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari tenant..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter', width: 130 }} />
            </div>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setShowCreate(true)}>+ New Org</button>
          </div>
        </div>

        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 82 }} />) : (
          filtered.map(t => (
            <div key={t.id} onClick={() => setSelected(s => s?.id === t.id ? null : t)} className="card"
              style={{ padding: '14px 18px', cursor: 'pointer', border: selected?.id === t.id ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: selected?.id === t.id ? 'rgba(37,99,235,0.04)' : 'var(--card)', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏢</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13 }}>{t.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>/{t.slug}</span>
                    <TenantStatusBadge status={t.status} />
                    <PlanBadge plan={t.plan} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3, fontFamily: 'JetBrains Mono' }}>
                    {t.employees} karyawan · Rp {t.mrr.toLocaleString('id')}/bln · {t.features.length} fitur
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  {t.status !== 'suspended' ? (
                    <button disabled={actionLoading === t.id} onClick={() => handleSuspend(t)} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }}>
                      {actionLoading === t.id ? '⏳' : 'Suspend'}
                    </button>
                  ) : (
                    <button disabled={actionLoading === t.id} onClick={() => handleActivate(t)} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                      {actionLoading === t.id ? '⏳' : 'Aktifkan'}
                    </button>
                  )}
                  <button onClick={() => { onImpersonate(t) }} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px', color: '#7c3aed', borderColor: 'rgba(124,58,237,0.3)' }}>⚡ Impersonate</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15 }}>{selected.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>/{selected.slug}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted-foreground)' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                ['Plan', <PlanBadge plan={selected.plan} />],
                ['Status', <TenantStatusBadge status={selected.status} />],
                ['Karyawan', <span className="mono" style={{ fontSize: 12 }}>{selected.employees}</span>],
                ['MRR', <span className="mono" style={{ fontSize: 12 }}>Rp {selected.mrr.toLocaleString('id')}</span>],
                ['HR Admin', <span style={{ fontSize: 12, fontFamily: 'Outfit' }}>{selected.adminName}</span>],
                ['Email Admin', <span className="mono" style={{ fontSize: 11 }}>{selected.adminEmail}</span>],
                ['Bergabung', <span className="mono" style={{ fontSize: 11 }}>{selected.createdAt}</span>],
              ].map(([k, v], i) => (
                <div key={i as number} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontSize: 12 }}>{k as string}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            {/* Storage Bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, fontFamily: 'Outfit' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Storage</span>
                <span className="mono">{selected.storageUsedMb}MB / {selected.storageQuotaMb}MB</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--muted)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: selected.storageUsedMb / selected.storageQuotaMb > 0.85 ? '#ef4444' : 'var(--primary)', width: `${Math.min(100, (selected.storageUsedMb / selected.storageQuotaMb) * 100)}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Feature Flags</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALL_FEATURES.map(f => {
                const enabled = selected.features.includes(f as any)
                return (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: enabled ? 'rgba(16,185,129,0.06)' : 'var(--muted)', border: `1px solid ${enabled ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}>
                    <div style={{ flex: 1 }}>
                      <div className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{f}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: 'Outfit', marginTop: 1 }}>{featureDescriptions[f]}</div>
                    </div>
                    <Toggle value={enabled} onChange={() => handleToggleFeature(selected.id, f)} />
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowAssign(true)}>👤 Assign Admin</button>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => onImpersonate(selected)}>⚡ Impersonate</button>
          </div>
        </div>
      )}

      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {showAssign && selected && <AssignAdminModal tenant={selected} onClose={() => setShowAssign(false)} onSave={handleAssign} saving={false} />}
    </div>
  )
}

// ─── Feature Flags Page ───────────────────────────────────────────────────────

function FeaturesPage({ addToast }: { addToast: (msg: string, type: ToastData['type']) => void }) {
  const { loading, data: tenants, toggleFeature } = useOrganizations()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Feature Flag Catalog</div>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {ALL_FEATURES.map(f => <div key={f} className="skeleton card" style={{ height: 110 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {ALL_FEATURES.map(f => {
            const activeTenants = tenants.filter(t => t.features.includes(f as any) && t.status === 'active')
            const total = tenants.filter(t => t.status === 'active').length
            const pct = total ? Math.round((activeTenants.length / total) * 100) : 0
            const isPremium = f === 'payroll' || f === 'analytics'
            return (
              <div key={f} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{f}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2, fontFamily: 'Outfit' }}>{featureDescriptions[f]}</div>
                  </div>
                  {isPremium && <span className="mono" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)', flexShrink: 0 }}>premium</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, fontFamily: 'Outfit' }}>
                  <span style={{ color: 'var(--muted-foreground)' }}>Aktif di</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{activeTenants.length}/{total} tenant · {pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--muted)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: isPremium ? '#7c3aed' : 'var(--primary)', width: `${pct}%`, transition: 'width 0.5s' }} />
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {activeTenants.map(t => (
                    <span key={t.id} className="mono" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.15)' }}>{t.slug}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Billing Page ─────────────────────────────────────────────────────────────

function BillingPage() {
  const { loading, records } = useBilling()
  const [selectedRecord, setSelectedRecord] = useState<typeof records[0] | null>(null)

  const totalMRR = records.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0)
  const unpaidCount = records.filter(r => r.status !== 'paid').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[0,1,2,3].map(i => <div key={i} className="skeleton card" style={{ height: 80 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total MRR', value: `Rp ${(totalMRR / 1000000).toFixed(1)}jt`, color: '#10b981' },
            { label: 'Paid', value: records.filter(r => r.status === 'paid').length, color: '#2563eb' },
            { label: 'Unpaid / Overdue', value: unpaidCount, color: unpaidCount > 0 ? '#ef4444' : '#10b981' },
            { label: 'ARR Est.', value: `Rp ${(totalMRR * 12 / 1000000).toFixed(0)}jt`, color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 6 }}>{String(s.value)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>Subscriptions</div>
        {loading ? <div style={{ padding: 20 }}><Skel h={200} /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  {['Company', 'Plan', 'Amount', 'Status', 'Due Date', 'Invoice'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => {
                  const statusColors: Record<string, string> = { paid: '#059669', unpaid: '#d97706', overdue: '#dc2626' }
                  const statusBg: Record<string, string> = { paid: 'rgba(16,185,129,0.1)', unpaid: 'rgba(245,158,11,0.1)', overdue: 'rgba(239,68,68,0.1)' }
                  return (
                    <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '11px 14px', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{r.tenantName}</td>
                      <td style={{ padding: '11px 14px' }}><PlanBadge plan={r.plan} /></td>
                      <td style={{ padding: '11px 14px' }}><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: r.status === 'paid' ? '#10b981' : 'var(--muted-foreground)' }}>{r.status === 'paid' ? `Rp ${r.amount.toLocaleString('id')}` : '—'}</span></td>
                      <td style={{ padding: '11px 14px' }}><span className="mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: statusBg[r.status], color: statusColors[r.status], border: `1px solid ${statusColors[r.status]}40` }}>{r.status}</span></td>
                      <td style={{ padding: '11px 14px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{r.dueDate}</span></td>
                      <td style={{ padding: '11px 14px' }}><button className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setSelectedRecord(r)}>Lihat</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRecord && <InvoiceModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  )
}

// ─── Audit Logs Page ──────────────────────────────────────────────────────────

function AuditPage() {
  const [search, setSearch] = useState('')
  const [actionType, setActionType] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8

  const { loading, logs, total } = useAuditLogs({ search, actionType, page, pageSize: PAGE_SIZE })

  const actionTypes = ['all', 'create', 'update', 'delete', 'toggle', 'suspend', 'activate', 'config', 'impersonate']
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const typeColors: Record<string, string> = {
    create: '#10b981', update: '#3b82f6', delete: '#ef4444',
    toggle: '#f59e0b', suspend: '#ef4444', activate: '#10b981',
    config: '#7c3aed', impersonate: '#ec4899',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, flex: 1 }}>Audit Logs Platform</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px' }}>
          <span style={{ fontSize: 12 }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Cari action, actor, target..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--foreground)', fontFamily: 'Inter', width: 180 }} />
        </div>
      </div>

      {/* Action type filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {actionTypes.map(t => (
          <button key={t} onClick={() => { setActionType(t); setPage(1) }}
            style={{ padding: '4px 12px', borderRadius: 8, border: `1px solid ${actionType === t ? (typeColors[t] ?? 'var(--primary)') : 'var(--border)'}`, fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 11, cursor: 'pointer', background: actionType === t ? `${typeColors[t] ?? 'var(--primary)'}12` : 'transparent', color: actionType === t ? (typeColors[t] ?? 'var(--primary)') : 'var(--muted-foreground)', transition: 'all 0.12s' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 20 }}><Skel h={280} /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  {['Timestamp', 'Actor', 'Type', 'Action', 'Target'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontSize: 13 }}>Tidak ada log yang cocok</td></tr>
                ) : logs.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 14px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{log.ts}</span></td>
                    <td style={{ padding: '10px 14px' }}><span className="mono" style={{ fontSize: 11, color: '#7c3aed' }}>{log.actor}</span></td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className="mono" style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: `${typeColors[log.actionType] ?? '#6b7280'}15`, color: typeColors[log.actionType] ?? '#6b7280', border: `1px solid ${typeColors[log.actionType] ?? '#6b7280'}30` }}>{log.actionType}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12 }}>{log.action}</span></td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{log.target}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{total} log total</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span className="mono" style={{ padding: '4px 10px', fontSize: 12, color: 'var(--muted-foreground)' }}>{page}/{totalPages}</span>
            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── System Config Page ───────────────────────────────────────────────────────

function ConfigPage({ addToast }: { addToast: (msg: string, type: ToastData['type']) => void }) {
  const { loading, config, saving, saveConfig } = useSystemConfig()
  const [local, setLocal] = useState<SystemConfig | null>(null)

  useEffect(() => { if (config && !local) setLocal({ ...config }) }, [config])

  if (loading || !local) return <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{[0,1,2].map(i => <div key={i} className="skeleton card" style={{ height: 120 }} />)}</div>

  const set = <K extends keyof SystemConfig>(k: K, v: SystemConfig[K]) => setLocal(p => p ? ({ ...p, [k]: v }) : p)

  const handleSave = async () => {
    if (!local) return
    await saveConfig(local)
    addToast('Konfigurasi sistem berhasil disimpan', 'success')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {/* Session & Security */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>🔒 Session & Security</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>Session Timeout (jam)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input type="range" min={1} max={24} value={local.sessionTimeoutHours} onChange={e => set('sessionTimeoutHours', Number(e.target.value))} style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', width: 40, textAlign: 'right' }}>{local.sessionTimeoutHours}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Config */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>📍 Absensi Default</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>GPS Radius (meter)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input type="range" min={50} max={500} step={10} value={local.gpsRadiusMeters} onChange={e => set('gpsRadiusMeters', Number(e.target.value))} style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', width: 60, textAlign: 'right' }}>{local.gpsRadiusMeters}m</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Jam Masuk Default</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="range" min={5} max={12} value={local.defaultWorkStartHour} onChange={e => set('defaultWorkStartHour', Number(e.target.value))} style={{ flex: 1 }} />
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', width: 40 }}>{String(local.defaultWorkStartHour).padStart(2,'0')}:00</span>
              </div>
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Jam Keluar Default</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="range" min={14} max={22} value={local.defaultWorkEndHour} onChange={e => set('defaultWorkEndHour', Number(e.target.value))} style={{ flex: 1 }} />
                <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', width: 40 }}>{String(local.defaultWorkEndHour).padStart(2,'0')}:00</span>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>Max Upload Size (MB)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input type="range" min={1} max={50} value={local.maxUploadSizeMb} onChange={e => set('maxUploadSizeMb', Number(e.target.value))} style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', width: 50, textAlign: 'right' }}>{local.maxUploadSizeMb}MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 18 }}>🔔 Notification Channels</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {([
            ['Email Notifications', 'emailNotifications', '✉️'],
            ['Push Notifications', 'pushNotifications', '📱'],
            ['WhatsApp (WA)', 'waNotifications', '💬'],
          ] as [string, keyof SystemConfig, string][]).map(([label, key, icon]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: local[key] ? 'rgba(37,99,235,0.06)' : 'var(--muted)', border: `1px solid ${local[key] ? 'rgba(37,99,235,0.2)' : 'var(--border)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{label}</div>
                </div>
              </div>
              <Toggle value={local[key] as boolean} onChange={v => set(key, v as any)} />
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="card" style={{ padding: '20px 24px', border: local.maintenanceMode ? '1.5px solid rgba(239,68,68,0.35)' : '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: local.maintenanceMode ? '#dc2626' : 'var(--foreground)' }}>🚧 Maintenance Mode</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3 }}>Blokir semua login kecuali super_admin</div>
          </div>
          <Toggle value={local.maintenanceMode} onChange={v => set('maintenanceMode', v)} />
        </div>
        {local.maintenanceMode && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#dc2626', fontFamily: 'Outfit' }}>⚠️ Mode ini aktif — semua HR Admin dan karyawan tidak bisa login!</div>}
      </div>

      {/* Auto Suspend */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>💸 Auto-Suspend Rule</div>
        <div>
          <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>Suspend tenant jika invoice overdue lebih dari</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={7} max={60} step={1} value={local.autoSuspendOverdueDays} onChange={e => set('autoSuspendOverdueDays', Number(e.target.value))} style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', width: 60, textAlign: 'right' }}>{local.autoSuspendOverdueDays}hr</span>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start', minWidth: 180, padding: '12px 24px' }}>
        {saving ? '⏳ Menyimpan...' : '✓ Simpan Konfigurasi'}
      </button>
    </div>
  )
}

// ─── Roles Page ───────────────────────────────────────────────────────────────

function RolesPage() {
  const roles = [
    { name: 'super_admin', desc: 'Control Center: kelola platform, billing, feature flags, semua tenant', color: '#7c3aed', permissions: { 'Platform Overview': true, 'Organizations': true, 'Feature Flags': true, 'Billing': true, 'Audit Logs': true, 'System Config': true, 'Broadcast': true, 'Impersonate': true } },
    { name: 'admin', desc: 'Portal HR: kelola absensi tim, approve permohonan, settings tenant', color: '#2563eb', permissions: { 'Platform Overview': false, 'Organizations': false, 'Feature Flags': false, 'Billing': false, 'Audit Logs': false, 'System Config': true, 'Broadcast': false, 'Impersonate': false } },
    { name: 'employee', desc: 'Portal Karyawan: absen, ajukan permohonan, lihat riwayat', color: '#10b981', permissions: { 'Platform Overview': false, 'Organizations': false, 'Feature Flags': false, 'Billing': false, 'Audit Logs': false, 'System Config': false, 'Broadcast': false, 'Impersonate': false } },
  ]
  const modules = ['Platform Overview', 'Organizations', 'Feature Flags', 'Billing', 'Audit Logs', 'System Config', 'Broadcast', 'Impersonate']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Role Definitions</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)' }}>MODULE</th>
              {roles.map(r => (
                <th key={r.name} style={{ textAlign: 'center', padding: '10px 14px', fontFamily: 'JetBrains Mono', fontSize: 11, color: r.color }}>
                  <div>{r.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod, mi) => (
              <tr key={mod} style={{ borderBottom: mi < modules.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '12px 14px', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{mod}</td>
                {roles.map(r => {
                  const allowed = r.permissions[mod as keyof typeof r.permissions]
                  return (
                    <td key={r.name} style={{ textAlign: 'center', padding: '12px 14px' }}>
                      <span style={{ fontSize: 16, color: allowed ? r.color : 'var(--border)' }}>{allowed ? '✓' : '—'}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {roles.map(role => (
          <div key={role.name} className="card" style={{ padding: '14px 18px', borderLeft: `3px solid ${role.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: role.color }}>{role.name}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{role.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Broadcast Page ───────────────────────────────────────────────────────────

function BroadcastPage({ addToast }: { addToast: (msg: string, type: ToastData['type']) => void }) {
  const { loading, broadcasts, sending, send } = useBroadcasts()
  const { data: tenants } = useOrganizations()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', link: '', targetTenants: 'all' as 'all' | number[] })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.message) return
    await send({ title: form.title, message: form.message, link: form.link || undefined, targetTenants: form.targetTenants })
    addToast('Broadcast berhasil dikirim ke semua tenant!', 'success')
    setShowForm(false)
    setForm({ title: '', message: '', link: '', targetTenants: 'all' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Broadcast Center</div>
        <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Tutup' : '+ Buat Broadcast'}
        </button>
      </div>

      {/* Compose Form */}
      {showForm && (
        <div className="card slide-down" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Buat Broadcast Baru</div>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Judul *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Pemeliharaan terjadwal, Update fitur baru..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Pesan *</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={4} placeholder="Tulis pesan broadcast di sini (plain text)..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Link (opsional)</label>
              <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://hadir.id/update-notes"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontFamily: 'Inter', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--muted-foreground)', display: 'block', marginBottom: 6 }}>Target</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setForm(p => ({ ...p, targetTenants: 'all' }))}
                  style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${form.targetTenants === 'all' ? 'var(--primary)' : 'var(--border)'}`, background: form.targetTenants === 'all' ? 'rgba(37,99,235,0.1)' : 'transparent', cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: form.targetTenants === 'all' ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                  🌐 Semua Tenant ({tenants.filter(t => t.status === 'active').length} aktif)
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={sending} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              {sending ? '⏳ Mengirim...' : '📡 Kirim Broadcast'}
            </button>
          </form>
        </div>
      )}

      {/* Broadcast History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton card" style={{ height: 100 }} />) : broadcasts.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Belum ada broadcast</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 6 }}>Buat broadcast pertama untuk dikirim ke semua tenant</div>
          </div>
        ) : broadcasts.map(b => (
          <div key={b.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{b.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{b.readCount} dibaca</span>
                <span className="mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(37,99,235,0.1)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.2)' }}>{b.targetTenants === 'all' ? 'Semua Tenant' : 'Spesifik'}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: 8 }}>{b.message}</div>
            {b.link && <div style={{ fontSize: 12, color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>🔗 {b.link}</div>}
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 8 }}>Dikirim {b.sentAt} oleh {b.sentBy}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ControlCenter({ user, onLogout, dark, onToggleDark, onImpersonate }: {
  user: AuthUser
  onLogout: () => void
  dark: boolean
  onToggleDark: () => void
  onImpersonate?: (tenantSlug: string, tenantName: string) => void
}) {
  const [nav, setNav] = useState<CCNav>('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const { data: tenants } = useOrganizations()

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const addToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    const id = ++_toastId
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id: number) => setToasts(t => t.filter(x => x.id !== id)), [])

  const handleImpersonate = useCallback((tenant: Tenant) => {
    if (onImpersonate) {
      addToast(`Mengakses sebagai ${tenant.name}...`, 'info')
      setTimeout(() => onImpersonate(tenant.slug, tenant.name), 600)
    }
  }, [onImpersonate, addToast])

  const goTo = (id: CCNav) => { setNav(id); setMobileNavOpen(false) }
  const groups = ['Platform', 'Tenants', 'Billing', 'Access', 'System']

  const renderPage = () => {
    switch (nav) {
      case 'overview': return <OverviewPage onNavigate={goTo} />
      case 'organizations': return <OrganizationsPage onImpersonate={handleImpersonate} addToast={addToast} />
      case 'features': return <FeaturesPage addToast={addToast} />
      case 'billing': return <BillingPage />
      case 'roles': return <RolesPage />
      case 'audit': return <AuditPage />
      case 'config': return <ConfigPage addToast={addToast} />
      case 'broadcast': return <BroadcastPage addToast={addToast} />
    }
  }

  return (
    <div className="app-shell">
      {/* Sidebar Backdrop */}
      <div className={`sidebar-backdrop ${mobileNavOpen ? 'show' : ''}`} onClick={() => setMobileNavOpen(false)} />

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileNavOpen ? 'open' : ''}`} style={{ width: 220 }}>
        <div style={{ padding: '0 6px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, fontFamily: 'Outfit', flexShrink: 0 }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 14, color: 'var(--foreground)' }}>Control Center</div>
            <div style={{ fontSize: 10, color: '#7c3aed', fontFamily: 'JetBrains Mono' }}>Super Admin</div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="mobile-menu-btn" style={{ width: 30, height: 30 }}>✕</button>
        </div>

        {/* Ctrl+K Shortcut hint */}
        <button onClick={() => setCmdOpen(true)} style={{ margin: '0 6px 14px', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--muted)', cursor: 'pointer', width: 'calc(100% - 12px)', textAlign: 'left' }}>
          <span style={{ fontSize: 13 }}>🔍</span>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter' }}>Cari...</span>
          <kbd style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'var(--card)', color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', border: '1px solid var(--border)' }}>⌘K</kbd>
        </button>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
          {groups.map(group => {
            const items = NAV_ITEMS.filter(n => n.group === group)
            if (!items.length) return null
            return (
              <div key={group} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', padding: '8px 8px 4px', letterSpacing: '0.1em' }}>{group.toUpperCase()}</div>
                {items.map(item => (
                  <button key={item.id} onClick={() => goTo(item.id)} className={`sidebar-link ${nav === item.id ? 'active' : ''}`} style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', fontSize: 13 }}>
                    <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )
          })}
        </nav>

        <div style={{ marginTop: 12, padding: '14px 8px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(124,58,237,0.12)', border: '1.5px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: '#7c3aed', flexShrink: 0 }}>{user.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 10, color: '#7c3aed', fontFamily: 'JetBrains Mono' }}>super_admin</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '7px', textAlign: 'center' }}>↩ Keluar</button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '12px 24px' }}>
          <button onClick={() => setMobileNavOpen(true)} className="mobile-menu-btn">☰</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--foreground)' }}>{PAGE_TITLES[nav]}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 1 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Platform Admin
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setCmdOpen(true)} className="header-search" style={{ background: 'var(--muted)', borderRadius: 10, padding: '7px 14px', alignItems: 'center', gap: 8, border: '1px solid var(--border)', cursor: 'pointer' }}>
              <span style={{ fontSize: 13 }}>🔍</span>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Inter' }}>Cari tenant, halaman...</span>
              <kbd style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--card)', color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', border: '1px solid var(--border)' }}>⌘K</kbd>
            </button>
            <button onClick={onToggleDark} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{dark ? '☀️' : '🌙'}</button>
            <span className="mono" style={{ fontSize: 10, padding: '4px 10px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)', whiteSpace: 'nowrap' }}>super_admin</span>
          </div>
        </header>

        <main style={{ padding: '24px 24px', flex: 1, minWidth: 0 }}>
          {renderPage()}
        </main>
      </div>

      {/* Toasts */}
      {toasts.slice(-1).map(t => <CCToast key={t.id} toast={t} onClose={() => removeToast(t.id)} />)}

      {/* Command Palette */}
      {cmdOpen && (
        <CommandPalette
          tenants={tenants}
          onClose={() => setCmdOpen(false)}
          onNavigate={goTo}
          onImpersonate={handleImpersonate}
        />
      )}
    </div>
  )
}
