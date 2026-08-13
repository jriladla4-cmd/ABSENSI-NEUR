'use client'

import { useState, type CSSProperties } from 'react'
import type { AuthUser } from './LoginPage'

type CCNav = 'overview' | 'organizations' | 'features' | 'billing' | 'roles' | 'audit' | 'config'

const NAV: { id: CCNav; label: string; icon: string; group: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⊞', group: 'Platform' },
  { id: 'organizations', label: 'Organizations', icon: '🏢', group: 'Organization' },
  { id: 'features', label: 'Feature Flags', icon: '⚑', group: 'Product' },
  { id: 'billing', label: 'Revenue & Billing', icon: '💳', group: 'Billing' },
  { id: 'roles', label: 'Roles & Permissions', icon: '🔑', group: 'Access' },
  { id: 'audit', label: 'Audit Logs', icon: '📜', group: 'Audit' },
  { id: 'config', label: 'System Config', icon: '⚙', group: 'Platform' },
]

// ─── Seed data ────────────────────────────────────────────────────────────────

const tenants = [
  { id: 1, name: 'PT Maju Bersama', slug: 'maju-bersama', employees: 48, plan: 'Pro', status: 'active', mrr: 1200000, features: ['attendance', 'leave', 'overtime', 'wfh', 'chat'] },
  { id: 2, name: 'CV Teknologi Nusantara', slug: 'tekno-nus', employees: 12, plan: 'Starter', status: 'active', mrr: 300000, features: ['attendance', 'leave'] },
  { id: 3, name: 'PT Kreasi Digital', slug: 'kreasi-digital', employees: 87, plan: 'Enterprise', status: 'active', mrr: 3500000, features: ['attendance', 'leave', 'overtime', 'reimbursement', 'wfh', 'chat', 'payroll'] },
  { id: 4, name: 'UD Sumber Rejeki', slug: 'sumber-rejeki', employees: 6, plan: 'Starter', status: 'suspended', mrr: 0, features: ['attendance'] },
  { id: 5, name: 'PayrollIn Demo', slug: 'default', employees: 10, plan: 'Pro', status: 'active', mrr: 1200000, features: ['attendance', 'leave', 'overtime', 'wfh', 'chat'] },
]

const featureKeys = ['attendance', 'leave', 'overtime', 'reimbursement', 'wfh', 'chat', 'payroll']

const featureDescs: Record<string, string> = {
  attendance: 'GPS check-in/out + foto',
  leave: 'Permohonan izin & cuti',
  overtime: 'Permohonan & approve lembur',
  reimbursement: 'Klaim biaya & reimburse',
  wfh: 'Work from home request',
  chat: 'Chat internal perusahaan',
  payroll: 'Penggajian & slip gaji',
}

const plans = [
  { name: 'Starter', price: 'Rp 25.000/user/bln', limit: '≤20 karyawan', tenants: 2, color: '#10b981' },
  { name: 'Pro', price: 'Rp 35.000/user/bln', limit: '≤100 karyawan', tenants: 2, color: '#2563eb' },
  { name: 'Enterprise', price: 'Custom', limit: 'Unlimited', tenants: 1, color: '#7c3aed' },
]

const auditLogs = [
  { id: 1, actor: 'super@hadir.id', action: 'Tenant created', target: 'PT Kreasi Digital', ts: '2026-08-12 09:14:32' },
  { id: 2, actor: 'super@hadir.id', action: 'Feature flag ON', target: 'payroll → PT Kreasi Digital', ts: '2026-08-12 09:15:10' },
  { id: 3, actor: 'super@hadir.id', action: 'Plan assigned', target: 'Enterprise → PT Kreasi Digital', ts: '2026-08-12 09:15:45' },
  { id: 4, actor: 'super@hadir.id', action: 'Tenant suspended', target: 'UD Sumber Rejeki', ts: '2026-08-10 14:22:01' },
  { id: 5, actor: 'super@hadir.id', action: 'System config updated', target: 'session_hours = 10', ts: '2026-08-09 11:05:00' },
]

// ─── Overview Page ────────────────────────────────────────────────────────────

function OverviewPage() {
  const totalOrgs = tenants.length
  const activeOrgs = tenants.filter(t => t.status === 'active').length
  const totalPeople = tenants.reduce((s, t) => s + t.employees, 0)
  const totalMRR = tenants.filter(t => t.status === 'active').reduce((s, t) => s + t.mrr, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Organizations', value: totalOrgs, unit: 'perusahaan', color: '#2563eb', icon: '🏢' },
          { label: 'Active Orgs', value: activeOrgs, unit: 'aktif', color: '#10b981', icon: '✓' },
          { label: 'Total Users', value: totalPeople, unit: 'karyawan', color: '#7c3aed', icon: '👥' },
          { label: 'Monthly Revenue', value: `Rp ${(totalMRR / 1000000).toFixed(1)}jt`, unit: 'MRR', color: '#f59e0b', icon: '💰' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4, fontFamily: 'Outfit' }}>{s.unit}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ '--gap': '18px' } as CSSProperties}>
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recent Tenants</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tenants.slice(0, 4).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🏢</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>{t.employees} users · {t.plan}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: t.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: t.status === 'active' ? '#059669' : '#dc2626', border: `1px solid ${t.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, fontFamily: 'JetBrains Mono' }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Revenue by Plan</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {plans.map(p => (
              <div key={p.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: p.color }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{p.tenants} tenant</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--muted)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: p.color, width: `${(p.tenants / tenants.length) * 100}%`, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Organizations Page ───────────────────────────────────────────────────────

function OrganizationsPage() {
  const [selected, setSelected] = useState<typeof tenants[0] | null>(null)
  const [tenantList, setTenantList] = useState(tenants)

  const toggleFeature = (tenantId: number, feature: string) => {
    setTenantList(list => list.map(t => {
      if (t.id !== tenantId) return t
      const has = t.features.includes(feature)
      return { ...t, features: has ? t.features.filter(f => f !== feature) : [...t.features, feature] }
    }))
    if (selected?.id === tenantId) {
      setSelected(prev => {
        if (!prev) return prev
        const has = prev.features.includes(feature)
        return { ...prev, features: has ? prev.features.filter(f => f !== feature) : [...prev.features, feature] }
      })
    }
  }

  return (
    <div className={selected ? 'grid-side-right' : ''} style={selected ? ({ '--side': '400px', '--gap': '20px' } as CSSProperties) : undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Semua Perusahaan ({tenantList.length})</div>
          <button className="btn-primary" style={{ fontSize: 13 }}>+ New Organization</button>
        </div>
        {tenantList.map(t => (
          <div key={t.id} onClick={() => setSelected(t)} className="card" style={{ padding: '16px 20px', cursor: 'pointer', border: selected?.id === t.id ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: selected?.id === t.id ? 'rgba(37,99,235,0.04)' : 'var(--card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏢</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14 }}>{t.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>/{t.slug}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: t.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: t.status === 'active' ? '#059669' : '#dc2626', border: `1px solid ${t.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, fontFamily: 'JetBrains Mono' }}>{t.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3 }}>{t.employees} karyawan · Plan {t.plan} · Rp {t.mrr.toLocaleString('id')}/bln</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 180 }}>
                {t.features.slice(0, 4).map(f => <span key={f} className="mono" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(37,99,235,0.08)', color: 'var(--primary)', border: '1px solid rgba(37,99,235,0.15)' }}>{f}</span>)}
                {t.features.length > 4 && <span className="mono" style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--muted)', color: 'var(--muted-foreground)' }}>+{t.features.length - 4}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>{selected.name}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted-foreground)' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Slug', selected.slug], ['Plan', selected.plan], ['Karyawan', String(selected.employees)], ['MRR', `Rp ${selected.mrr.toLocaleString('id')}`], ['Status', selected.status]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{k}</span>
                  <span className="mono" style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Feature Flags</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {featureKeys.map(f => {
                const enabled = selected.features.includes(f)
                return (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: enabled ? 'rgba(16,185,129,0.06)' : 'var(--muted)', border: `1px solid ${enabled ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}>
                    <div style={{ flex: 1 }}>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)' }}>{f}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', marginTop: 1 }}>{featureDescs[f]}</div>
                    </div>
                    <button onClick={() => toggleFeature(selected.id, f)} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: enabled ? '#10b981' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: enabled ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1, fontSize: 13 }}>Assign HR Admin</button>
            <button className="btn-ghost" style={{ fontSize: 13, color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }}>Suspend</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Features Page ────────────────────────────────────────────────────────────

function FeaturesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Katalog Feature Flags</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {featureKeys.map(f => {
          const enabledCount = tenants.filter(t => t.features.includes(f) && t.status === 'active').length
          const pct = Math.round((enabledCount / tenants.filter(t => t.status === 'active').length) * 100)
          const isDefaultOff = f === 'payroll'
          return (
            <div key={f} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{f}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3, fontFamily: 'Outfit' }}>{featureDescs[f]}</div>
                </div>
                {isDefaultOff && <span className="mono" style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', flexShrink: 0 }}>default OFF</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, fontFamily: 'Outfit' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Aktif di</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{enabledCount}/{tenants.filter(t => t.status === 'active').length} tenant · {pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--muted)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: isDefaultOff ? '#ef4444' : 'var(--primary)', width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Billing Page ─────────────────────────────────────────────────────────────

function BillingPage() {
  const activeTenants = tenants.filter(t => t.status === 'active')
  const totalMRR = activeTenants.reduce((s, t) => s + t.mrr, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total MRR', value: `Rp ${(totalMRR / 1000000).toFixed(1)}jt`, color: '#10b981' },
          { label: 'Active Subscribers', value: activeTenants.length, color: '#2563eb' },
          { label: 'Suspended', value: tenants.filter(t => t.status === 'suspended').length, color: '#ef4444' },
          { label: 'ARR Estimate', value: `Rp ${(totalMRR * 12 / 1000000).toFixed(0)}jt`, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'Outfit', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontFamily: 'Outfit', fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Plans</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {plans.map(p => (
            <div key={p.name} style={{ padding: '18px 20px', borderRadius: 12, border: `2px solid ${p.color}30`, background: `${p.color}06` }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: p.color }}>{p.name}</div>
              <div style={{ fontSize: 14, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--foreground)', marginTop: 6 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 4 }}>{p.limit}</div>
              <div style={{ marginTop: 10, fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: p.color }}>{p.tenants} tenant aktif</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Subscriptions</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              {['Company', 'Plan', 'Users', 'MRR', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < tenants.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 16px', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{t.name}</td>
                <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 12 }}>{t.plan}</span></td>
                <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 12 }}>{t.employees}</span></td>
                <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 13, fontWeight: 700, color: t.status === 'active' ? '#10b981' : 'var(--muted-foreground)' }}>{t.status === 'active' ? `Rp ${t.mrr.toLocaleString('id')}` : '—'}</span></td>
                <td style={{ padding: '11px 16px' }}>
                  <span className="mono" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: t.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)', color: t.status === 'active' ? '#059669' : '#dc2626', border: `1px solid ${t.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Audit Logs Page ──────────────────────────────────────────────────────────

function AuditPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Audit Logs Platform</div>
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              {['Timestamp', 'Actor', 'Action', 'Target'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, i) => (
              <tr key={log.id} style={{ borderBottom: i < auditLogs.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{log.ts}</span></td>
                <td style={{ padding: '11px 16px' }}><span className="mono" style={{ fontSize: 12, color: '#7c3aed' }}>{log.actor}</span></td>
                <td style={{ padding: '11px 16px' }}><span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13 }}>{log.action}</span></td>
                <td style={{ padding: '11px 16px' }}><span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>{log.target}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Config Page ──────────────────────────────────────────────────────────────

function ConfigPage() {
  const [sessionHours, setSessionHours] = useState(8)
  const [maintenance, setMaintenance] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Platform Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 13, color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>Session Timeout (jam)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <input type="range" min={1} max={24} value={sessionHours} onChange={e => setSessionHours(Number(e.target.value))} style={{ flex: 1 }} />
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', width: 40, textAlign: 'right' }}>{sessionHours}h</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: maintenance ? 'rgba(239,68,68,0.06)' : 'var(--muted)', border: `1px solid ${maintenance ? 'rgba(239,68,68,0.2)' : 'var(--border)'}` }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 14, color: maintenance ? '#dc2626' : 'var(--foreground)' }}>Maintenance Mode</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Blokir semua login kecuali super admin</div>
            </div>
            <button onClick={() => setMaintenance(m => !m)} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: maintenance ? '#ef4444' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: maintenance ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          <button className="btn-primary" onClick={save} style={{ alignSelf: 'flex-start', minWidth: 160 }}>
            {saved ? '✓ Tersimpan' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Roles Page ───────────────────────────────────────────────────────────────

function RolesPage() {
  const roles = [
    { name: 'employee', desc: 'Portal karyawan: absen, ajukan izin, profil', color: '#10b981', permissions: { dashboard: true, attendance: true, request: true, payroll: false, employees: false, settings: false } },
    { name: 'admin', desc: 'Portal HR: kelola absensi tim, approve, settings', color: '#2563eb', permissions: { dashboard: true, attendance: true, request: true, payroll: false, employees: true, settings: true } },
    { name: 'super_admin', desc: 'Control Center: kelola platform, billing, flags', color: '#7c3aed', permissions: { dashboard: true, attendance: false, request: false, payroll: false, employees: false, settings: true } },
  ]
  const modules = ['dashboard', 'attendance', 'request', 'payroll', 'employees', 'settings']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15 }}>Role Definitions — Platform Template</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {roles.map(role => (
          <div key={role.name} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: role.color }} />
              <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: role.color }}>{role.name}</span>
              <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontFamily: 'Outfit' }}>— {role.desc}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {modules.map(mod => {
                const allowed = role.permissions[mod as keyof typeof role.permissions]
                return (
                  <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: allowed ? `${role.color}10` : 'var(--muted)', border: `1px solid ${allowed ? `${role.color}25` : 'var(--border)'}` }}>
                    <span style={{ fontSize: 11, color: allowed ? role.color : 'var(--muted-foreground)', opacity: allowed ? 1 : 0.5 }}>{allowed ? '✓' : '—'}</span>
                    <span className="mono" style={{ fontSize: 11, color: allowed ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: allowed ? 600 : 400 }}>{mod}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ControlCenter({ user, onLogout, dark, onToggleDark }: { user: AuthUser; onLogout: () => void; dark: boolean; onToggleDark: () => void }) {
  const [nav, setNav] = useState<CCNav>('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const pageTitles: Record<CCNav, string> = {
    overview: 'Platform Overview',
    organizations: 'Organizations',
    features: 'Feature Flags',
    billing: 'Revenue & Billing',
    roles: 'Roles & Permissions',
    audit: 'Audit Logs',
    config: 'System Config',
  }

  const groups = ['Platform', 'Organization', 'Product', 'Billing', 'Access', 'Audit']
  const goTo = (id: CCNav) => { setNav(id); setMobileNavOpen(false) }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className={`sidebar-backdrop ${mobileNavOpen ? 'show' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <aside className={`app-sidebar ${mobileNavOpen ? 'open' : ''}`} style={{ width: 220 }}>
        <div style={{ padding: '0 6px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 800, fontFamily: 'Outfit', flexShrink: 0 }}>⚡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 14, color: 'var(--foreground)' }}>Control Center</div>
            <div style={{ fontSize: 10, color: '#7c3aed', fontFamily: 'JetBrains Mono' }}>Super Admin</div>
          </div>
          <button onClick={() => setMobileNavOpen(false)} className="mobile-menu-btn" style={{ width: 30, height: 30 }}>✕</button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
          {groups.map(group => {
            const items = NAV.filter(n => n.group === group)
            if (!items.length) return null
            return (
              <div key={group}>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)', padding: '10px 8px 4px', letterSpacing: '0.08em' }}>{group.toUpperCase()}</div>
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

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '14px 24px' }}>
          <button onClick={() => setMobileNavOpen(true)} className="mobile-menu-btn">☰</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: 'var(--foreground)' }}>{pageTitles[nav]}</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono', marginTop: 1 }}>12 Agustus 2026 · Platform Admin</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={onToggleDark} style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{dark ? '☀️' : '🌙'}</button>
            <span className="mono" style={{ fontSize: 11, padding: '4px 12px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.25)', whiteSpace: 'nowrap' }}>super_admin</span>
          </div>
        </header>

        <main style={{ padding: '28px 24px', flex: 1, minWidth: 0 }}>
          {nav === 'overview' && <OverviewPage />}
          {nav === 'organizations' && <OrganizationsPage />}
          {nav === 'features' && <FeaturesPage />}
          {nav === 'billing' && <BillingPage />}
          {nav === 'roles' && <RolesPage />}
          {nav === 'audit' && <AuditPage />}
          {nav === 'config' && <ConfigPage />}
        </main>
      </div>
    </div>
  )
}
